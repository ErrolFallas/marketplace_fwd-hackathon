'use server'

import { z } from 'zod'
import { ok, err, type Result } from '@/lib/result'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  requireVerifiedEgresado,
  requireVerifiedEmpresario,
} from '@/lib/auth/guards'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'
import { crearNotificacion } from '@/lib/notifications/create'
import { DEFAULT_LOCALE } from '@/i18n/config'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { buildEntregableEnviadoNotificacion } from './entregable-notificacion-logic'
import { buildEntregableRespuestaNotificacion } from './responder-entregable-notificacion-logic'
import { resolveBaseUrl } from '@/lib/email/base-url'
import { createGmailTransport, getGmailFrom } from '@/lib/email/gmail'
import {
  entregableEnviadoHtml,
  entregableEnviadoSubject,
} from '@/lib/email/templates/entregable-enviado'
import {
  entregableAprobadoHtml,
  entregableAprobadoSubject,
} from '@/lib/email/templates/entregable-aprobado'
import {
  entregableConCambiosHtml,
  entregableConCambiosSubject,
} from '@/lib/email/templates/entregable-con-cambios'
import { createHash } from 'node:crypto'
import { getContratacionParaGestion, getMiContratacion } from './queries'

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB; coincide con el límite del bucket
const ENTREGABLES_BUCKET = 'entregables'

const MAX_CONDICIONES_LEN = 2000

const ActualizarPropuestaSchema = z.object({
  idProyecto: z.string().uuid(),
  monto: z.number().positive().nullable(),
  condiciones: z.string().max(MAX_CONDICIONES_LEN).nullable(),
})

/**
 * El empresario fija/edita la propuesta de contrato (monto acordado + condiciones
 * especiales) mientras el acuerdo NO esté aceptado por el egresado. El trigger
 * de la BD (Tanda 0.1) es el respaldo del candado y del monto mínimo; acá se
 * valida antes para devolver errores amigables.
 */
export async function actualizarPropuestaContratacion(
  input: z.infer<typeof ActualizarPropuestaSchema>,
): Promise<Result<void>> {
  const parsed = ActualizarPropuestaSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')

  const guard = await requireVerifiedEmpresario()
  if (!guard.ok) return guard

  const contResult = await getContratacionParaGestion(parsed.data.idProyecto)
  if (!contResult.ok) return err(contResult.error)
  const contratacion = contResult.data
  if (!contratacion) return err('contratacion_no_encontrada')

  if (contratacion.acuerdo_aceptado_at !== null) {
    return err('acuerdo_ya_aceptado')
  }
  if (
    parsed.data.monto !== null &&
    contratacion.presupuesto_min !== null &&
    parsed.data.monto < contratacion.presupuesto_min
  ) {
    return err('monto_menor_al_minimo')
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('contrataciones')
    .update({
      monto_acordado: parsed.data.monto,
      condiciones_especiales: parsed.data.condiciones,
    })
    .eq('id_contratacion', contratacion.id_contratacion)

  if (error) {
    logger.error('actualizarPropuestaContratacion: update failed', {
      error: error.message,
    })
    return err('actualizacion_fallida')
  }

  revalidatePath(`/empresario/contrataciones/${parsed.data.idProyecto}`)
  return ok(undefined)
}

const AbrirTareaSchema = z.object({
  idProyecto: z.string().uuid(),
  titulo: z.string().min(1).max(160),
  descripcion: z.string().max(2000).nullable(),
  tipo: z.enum(['parcial', 'final']),
})

/**
 * El empresario abre una tarea (entregable de nivel 1) sobre una contratación
 * vigente: define el requerimiento ("quiero esto") y si es parcial o final. Las
 * propuestas del egresado cuelgan de la tarea (Etapa 4).
 */
export async function abrirTarea(
  input: z.infer<typeof AbrirTareaSchema>,
): Promise<Result<void>> {
  const parsed = AbrirTareaSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')

  const guard = await requireVerifiedEmpresario()
  if (!guard.ok) return guard

  const contResult = await getContratacionParaGestion(parsed.data.idProyecto)
  if (!contResult.ok) return err(contResult.error)
  const contratacion = contResult.data
  if (!contratacion) return err('contratacion_no_encontrada')
  if (contratacion.estado_periodo !== 'vigente') {
    return err('contratacion_no_vigente')
  }

  const supabase = await createSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()

  const { error } = await supabase.from('entregable_tareas').insert({
    id_contratacion: contratacion.id_contratacion,
    titulo: parsed.data.titulo,
    descripcion: parsed.data.descripcion,
    tipo_entregable: parsed.data.tipo,
    abierta_por: userData.user?.id ?? null,
  })

  if (error) {
    logger.error('abrirTarea: insert failed', { error: error.message })
    return err('apertura_fallida')
  }

  revalidatePath(`/empresario/contrataciones/${parsed.data.idProyecto}`)
  return ok(undefined)
}

const SubirEntregableSchema = z.object({
  idContratacion: z.string().uuid(),
  idProyecto: z.string().uuid(),
  file: z
    .instanceof(File)
    .refine((archivo) => archivo.size > 0, { message: 'archivo_vacio' })
    .refine((archivo) => archivo.size <= MAX_FILE_SIZE_BYTES, {
      message: 'archivo_muy_grande',
    }),
})

type SubirInput = z.infer<typeof SubirEntregableSchema>

const MAX_VERSION_ATTEMPTS = 2

/**
 * Correo al empresario cuando el egresado sube un entregable (RF-46).
 * Best-effort: lee correo/nombre con admin; cualquier fallo se loguea y se traga.
 */
async function enviarEmailEntregableEnviado(params: {
  idUsuarioEmpresario: string
  tituloProyecto: string
  idProyecto: string
}): Promise<void> {
  const admin = createSupabaseAdminClient()
  const { data: empresarioUser } = await admin
    .from('usuarios')
    .select('correo, nombre')
    .eq('id_usuario', params.idUsuarioEmpresario)
    .maybeSingle()
  if (!empresarioUser?.correo) return

  let transport: ReturnType<typeof createGmailTransport>
  try {
    transport = createGmailTransport()
  } catch (e) {
    logger.error('enviarEmailEntregableEnviado: Gmail no configurado', {
      error: e instanceof Error ? e.message : String(e),
    })
    return
  }

  const baseUrl = await resolveBaseUrl()
  const urlEntregables = `${baseUrl}/${DEFAULT_LOCALE}/empresario/proyecto/${params.idProyecto}/entregables`

  try {
    await transport.sendMail({
      from: getGmailFrom(),
      to: empresarioUser.correo,
      subject: entregableEnviadoSubject(params.tituloProyecto),
      html: entregableEnviadoHtml({
        nombre: empresarioUser.nombre ?? '',
        tituloProyecto: params.tituloProyecto,
        urlEntregables,
      }),
    })
  } catch (e) {
    logger.error('enviarEmailEntregableEnviado: fallo al enviar', {
      error: e instanceof Error ? e.message : String(e),
    })
  }
}

/**
 * Correo al egresado cuando el empresario responde su entregable (RF-46): aprobado
 * o con cambios. Best-effort: lee correo/nombre con admin (la RLS oculta el correo
 * del egresado al empresario); cualquier fallo se loguea y se traga.
 */
async function enviarEmailRespuestaEntregable(params: {
  idUsuarioEgresado: string
  tituloProyecto: string
  idProyecto: string
  decision: 'aprobado' | 'con_cambios'
  finalizado: boolean
  comentario?: string
}): Promise<void> {
  const admin = createSupabaseAdminClient()
  const { data: egresadoUser } = await admin
    .from('usuarios')
    .select('correo, nombre')
    .eq('id_usuario', params.idUsuarioEgresado)
    .maybeSingle()
  if (!egresadoUser?.correo) return

  let transport: ReturnType<typeof createGmailTransport>
  try {
    transport = createGmailTransport()
  } catch (e) {
    logger.error('enviarEmailRespuestaEntregable: Gmail no configurado', {
      error: e instanceof Error ? e.message : String(e),
    })
    return
  }

  const baseUrl = await resolveBaseUrl()
  const urlEntregables = `${baseUrl}/${DEFAULT_LOCALE}/egresado/projects/${params.idProyecto}/entregables`
  const nombre = egresadoUser.nombre ?? ''

  const correo =
    params.decision === 'aprobado'
      ? {
          subject: entregableAprobadoSubject(params.tituloProyecto),
          html: entregableAprobadoHtml({
            nombre,
            tituloProyecto: params.tituloProyecto,
            urlEntregables,
            finalizado: params.finalizado,
            ...(params.comentario ? { comentario: params.comentario } : {}),
          }),
        }
      : {
          subject: entregableConCambiosSubject(params.tituloProyecto),
          html: entregableConCambiosHtml({
            nombre,
            tituloProyecto: params.tituloProyecto,
            urlEntregables,
            comentario: params.comentario ?? '',
          }),
        }

  try {
    await transport.sendMail({
      from: getGmailFrom(),
      to: egresadoUser.correo,
      subject: correo.subject,
      html: correo.html,
    })
  } catch (e) {
    logger.error('enviarEmailRespuestaEntregable: fallo al enviar', {
      error: e instanceof Error ? e.message : String(e),
    })
  }
}

async function registrarEntregable(
  input: SubirInput,
  tipo: 'parcial' | 'final',
  extra?: { idTarea?: string; descripcion?: string | null },
): Promise<Result<void>> {
  // Validación de verificación ANTES de tocar el Storage: si el egresado no está
  // verificado, cortamos acá para no subir un archivo huérfano (la policy de
  // Storage de 'entregables' no exige verificación por sí sola).
  const verified = await requireVerifiedEgresado()
  if (!verified.ok) return verified

  const supabase = await createSupabaseServerClient()

  // Dedup por contenido: hash sha-256 del archivo. No se permite subir dos veces
  // el mismo archivo en la contratación. Un archivo corregido (con_cambios) tiene
  // bytes distintos → hash distinto → pasa. El chequeo previo evita subir al
  // Storage en vano; el índice único parcial es el backstop ante carreras.
  const fileBuffer = Buffer.from(await input.file.arrayBuffer())
  const archivoHash = createHash('sha256').update(fileBuffer).digest('hex')

  const { data: duplicado } = await supabase
    .from('entregables')
    .select('id_entregable')
    .eq('id_contratacion', input.idContratacion)
    .eq('archivo_hash', archivoHash)
    .limit(1)
    .maybeSingle()
  if (duplicado) return err('archivo_duplicado')

  // El upload corre en el SERVIDOR a propósito: el cliente browser de Supabase
  // se cuelga al resolver la sesión y nunca emite el request del Storage. Con el
  // cliente de servidor la sesión sale de las cookies y la RLS del bucket aplica
  // igual (la carpeta es el id_contratacion del estudiante).
  const ext = input.file.name.split('.').pop()?.toLowerCase() || 'bin'
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const archivoPath = `${input.idContratacion}/${uniqueSuffix}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(ENTREGABLES_BUCKET)
    .upload(archivoPath, input.file)

  if (uploadError) {
    logger.error(`registrarEntregable (${tipo}) storage upload failed`, {
      error: uploadError.message,
    })
    return err('storage_error')
  }

  // La versión se calcula como max(version)+1 por contratación. El constraint
  // UNIQUE(id_contratacion, version) garantiza la secuencia; si dos subidas casi
  // simultáneas chocan (23505), recalculamos y reintentamos una vez. Si el insert
  // falla en firme, borramos el archivo recién subido para no dejar huérfanos.
  for (let attempt = 1; attempt <= MAX_VERSION_ATTEMPTS; attempt++) {
    const { data: maxVerData } = await supabase
      .from('entregables')
      .select('version')
      .eq('id_contratacion', input.idContratacion)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()

    const version = (maxVerData?.version ?? 0) + 1

    const { error: insertError } = await supabase.from('entregables').insert({
      id_contratacion: input.idContratacion,
      tipo_entregable: tipo,
      archivo_url: archivoPath,
      archivo_hash: archivoHash,
      version,
      estado: 'enviado',
      ...(extra?.idTarea ? { id_tarea: extra.idTarea } : {}),
      ...(extra?.descripcion ? { descripcion: extra.descripcion } : {}),
    })

    if (!insertError) {
      revalidatePath(`/egresado/projects/${input.idProyecto}/entregables`)
      try {
        const adminClient = createSupabaseAdminClient()
        const { data: proyecto } = await adminClient
          .from('proyectos')
          .select('titulo, id_empresario')
          .eq('id_proyecto', input.idProyecto)
          .maybeSingle()
        if (proyecto) {
          const { data: empresario } = await adminClient
            .from('empresarios')
            .select('id_usuario')
            .eq('id_empresario', proyecto.id_empresario)
            .maybeSingle()
          if (empresario?.id_usuario) {
            const notifResult = await crearNotificacion(
              buildEntregableEnviadoNotificacion({
                idUsuarioEmpresario: empresario.id_usuario,
                tituloProyecto: proyecto.titulo,
                idProyecto: input.idProyecto,
              }),
            )
            if (!notifResult.ok) {
              logger.error('registrarEntregable: notificacion fallida', {
                error: notifResult.error,
              })
            }
            await enviarEmailEntregableEnviado({
              idUsuarioEmpresario: empresario.id_usuario,
              tituloProyecto: proyecto.titulo,
              idProyecto: input.idProyecto,
            })
          }
        }
      } catch (e) {
        logger.error('registrarEntregable: error al notificar empresario', {
          error: e instanceof Error ? e.message : String(e),
        })
      }
      return ok(undefined)
    }

    if (insertError.code === '23505') {
      // Choque del índice (id_contratacion, archivo_hash) = archivo duplicado en
      // carrera: no reintentar, devolver duplicado.
      if (insertError.message.includes('entregables_contratacion_hash_uniq')) {
        await supabase.storage.from(ENTREGABLES_BUCKET).remove([archivoPath])
        return err('archivo_duplicado')
      }
      // Choque de versión: recalcular y reintentar una vez.
      if (attempt < MAX_VERSION_ATTEMPTS) continue
    }

    await supabase.storage.from(ENTREGABLES_BUCKET).remove([archivoPath])
    logger.error(`registrarEntregable (${tipo}) failed`, {
      error: insertError.message,
    })
    return err(
      insertError.code === '23505' ? 'version_conflict' : 'database_error',
    )
  }

  await supabase.storage.from(ENTREGABLES_BUCKET).remove([archivoPath])
  return err('version_conflict')
}

/**
 * Registra un hito parcial (RF-40). Recibe el archivo por `FormData`, lo sube al
 * Storage desde el servidor y crea la fila en `entregables`.
 */
export async function subirHito(formData: FormData): Promise<Result<void>> {
  const parsed = SubirEntregableSchema.safeParse({
    idContratacion: formData.get('idContratacion'),
    idProyecto: formData.get('idProyecto'),
    file: formData.get('file'),
  })
  if (!parsed.success) return err('invalid_input')
  return registrarEntregable(parsed.data, 'parcial')
}

/**
 * Registra el entregable final (RF-41). Mismo patrón que subirHito pero con
 * tipo_entregable='final'.
 */
export async function subirEntregableFinal(
  formData: FormData,
): Promise<Result<void>> {
  const parsed = SubirEntregableSchema.safeParse({
    idContratacion: formData.get('idContratacion'),
    idProyecto: formData.get('idProyecto'),
    file: formData.get('file'),
  })
  if (!parsed.success) return err('invalid_input')
  return registrarEntregable(parsed.data, 'final')
}

const SubirPropuestaSchema = z.object({
  idTarea: z.string().uuid(),
  idProyecto: z.string().uuid(),
  descripcion: z.string().max(MAX_CONDICIONES_LEN).nullable(),
  file: z
    .instanceof(File)
    .refine((archivo) => archivo.size > 0, { message: 'archivo_vacio' })
    .refine((archivo) => archivo.size <= MAX_FILE_SIZE_BYTES, {
      message: 'archivo_muy_grande',
    }),
})

/**
 * El egresado sube una propuesta (nivel 2) DENTRO de una tarea abierta. La
 * propuesta hereda el tipo de la tarea (así el RPC de finalización sigue leyendo
 * el tipo del hijo) y respeta "una sola propuesta abierta por tarea a la vez".
 */
export async function subirPropuesta(
  formData: FormData,
): Promise<Result<void>> {
  const parsed = SubirPropuestaSchema.safeParse({
    idTarea: formData.get('idTarea'),
    idProyecto: formData.get('idProyecto'),
    descripcion: formData.get('descripcion') || null,
    file: formData.get('file'),
  })
  if (!parsed.success) return err('invalid_input')

  const verified = await requireVerifiedEgresado()
  if (!verified.ok) return verified

  const supabase = await createSupabaseServerClient()

  const { data: tarea, error: tareaErr } = await supabase
    .from('entregable_tareas')
    .select('id_contratacion, tipo_entregable, estado')
    .eq('id_tarea', parsed.data.idTarea)
    .maybeSingle()
  if (tareaErr || !tarea) return err('tarea_no_encontrada')
  if (tarea.estado !== 'abierta') return err('tarea_no_abierta')

  // Una sola propuesta esperando veredicto por tarea a la vez.
  const { data: abierta } = await supabase
    .from('entregables')
    .select('id_entregable')
    .eq('id_tarea', parsed.data.idTarea)
    .in('estado', ['enviado', 'en_revision'])
    .limit(1)
    .maybeSingle()
  if (abierta) return err('propuesta_abierta_existente')

  return registrarEntregable(
    {
      idContratacion: tarea.id_contratacion,
      idProyecto: parsed.data.idProyecto,
      file: parsed.data.file,
    },
    tarea.tipo_entregable,
    { idTarea: parsed.data.idTarea, descripcion: parsed.data.descripcion },
  )
}

const AbrirTareaEgresadoSchema = z.object({
  idProyecto: z.string().uuid(),
  titulo: z.string().min(1).max(160),
  descripcion: z.string().max(MAX_CONDICIONES_LEN).nullable(),
})

/**
 * El egresado abre una tarea ("hice esto"): siempre `parcial` (solo el empresario
 * abre tareas finales). Cuelga de su contratación vigente.
 */
export async function abrirTareaEgresado(
  input: z.infer<typeof AbrirTareaEgresadoSchema>,
): Promise<Result<void>> {
  const parsed = AbrirTareaEgresadoSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')

  const verified = await requireVerifiedEgresado()
  if (!verified.ok) return verified

  const contResult = await getMiContratacion(parsed.data.idProyecto)
  if (!contResult.ok) return err(contResult.error)
  const cont = contResult.data
  if (!cont) return err('contratacion_no_encontrada')
  if (cont.estado_periodo !== 'vigente') return err('contratacion_no_vigente')

  const supabase = await createSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()

  const { error } = await supabase.from('entregable_tareas').insert({
    id_contratacion: cont.id_contratacion,
    titulo: parsed.data.titulo,
    descripcion: parsed.data.descripcion,
    tipo_entregable: 'parcial',
    abierta_por: userData.user?.id ?? null,
  })
  if (error) {
    logger.error('abrirTareaEgresado: insert failed', { error: error.message })
    return err('apertura_fallida')
  }

  revalidatePath(`/egresado/projects/${parsed.data.idProyecto}/entregables`)
  return ok(undefined)
}

const ActualizarUrlSchema = z.object({
  idParticipacion: z.string().uuid(),
  url: z.string().url().max(150).nullable(),
})

/**
 * Actualiza el enlace del proyecto (url_repositorio_proyecto) en la
 * participacion del egresado. Delega en el RPC SECURITY DEFINER que valida
 * propiedad y restringe la escritura a esa columna especifica.
 */
export async function actualizarUrlProyecto(
  input: z.infer<typeof ActualizarUrlSchema>,
): Promise<Result<void>> {
  const parsed = ActualizarUrlSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')

  const verified = await requireVerifiedEgresado()
  if (!verified.ok) return verified

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.rpc('actualizar_url_participacion', {
    p_id_participacion: parsed.data.idParticipacion,
    p_url: parsed.data.url,
  })

  if (error) {
    logger.error('actualizarUrlProyecto: rpc failed', { error: error.message })
    return err('database_error')
  }

  return ok(undefined)
}

const ResponderEntregableSchema = z
  .object({
    idEntregable: z.string().uuid(),
    decision: z.enum(['aprobado', 'con_cambios']),
    comentario: z.string().max(1000).optional(),
  })
  .refine(
    (data) =>
      data.decision !== 'con_cambios' ||
      (data.comentario?.trim().length ?? 0) > 0,
    { message: 'comentario_requerido', path: ['comentario'] },
  )

/**
 * El empresario aprueba o solicita cambios sobre un entregable (RF-44).
 * Solo se puede responder cuando estado === 'enviado' | 'en_revision'. Si se
 * APRUEBA un entregable `final`, cierra el ciclo (RF-41) vía el RPC atómico
 * `finalizar_proyecto_por_entregable`: aprueba el entregable y pasa
 * proyecto/contratación/participación a finalizado, habilitando las
 * calificaciones mutuas. Devuelve `finalizado` para que la UI muestre el aviso.
 * Revalida la vista del empresario y la del egresado.
 */
export async function responderEntregable(
  input: z.infer<typeof ResponderEntregableSchema>,
): Promise<Result<{ finalizado: boolean }>> {
  const parsed = ResponderEntregableSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')

  const verified = await requireVerifiedEmpresario()
  if (!verified.ok) return verified

  const supabase = await createSupabaseServerClient()

  const { data: entregable, error: entErr } = await supabase
    .from('entregables')
    .select('id_entregable, estado, id_contratacion, tipo_entregable, id_tarea')
    .eq('id_entregable', parsed.data.idEntregable)
    .maybeSingle()
  if (entErr) {
    logger.error('responderEntregable: entregable query failed', {
      error: entErr.message,
    })
    return err('database_error')
  }
  if (!entregable) return err('entregable_not_found')
  if (entregable.estado !== 'enviado' && entregable.estado !== 'en_revision')
    return err('estado_invalido')

  const { data: contratacion, error: contErr } = await supabase
    .from('contrataciones')
    .select('id_participacion')
    .eq('id_contratacion', entregable.id_contratacion)
    .maybeSingle()
  if (contErr || !contratacion) return err('unauthorized')

  const { data: participacion, error: partErr } = await supabase
    .from('participaciones')
    .select('id_proyecto, id_estudiante')
    .eq('id_participacion', contratacion.id_participacion)
    .maybeSingle()
  if (partErr || !participacion) return err('unauthorized')

  const { data: proyectoOwned, error: proyErr } = await supabase
    .from('proyectos')
    .select('id_proyecto, titulo')
    .eq('id_proyecto', participacion.id_proyecto)
    .eq('id_empresario', verified.data.id_empresario)
    .maybeSingle()
  if (proyErr || !proyectoOwned) return err('unauthorized')

  const { data: estudianteNotif } = await supabase
    .from('estudiantes')
    .select('id_usuario')
    .eq('id_estudiante', participacion.id_estudiante)
    .maybeSingle()

  // Aprobar el entregable FINAL cierra el ciclo (RF-41): un RPC atómico aprueba
  // el entregable y finaliza proyecto/contratación/participación en una sola
  // transacción, habilitando las calificaciones mutuas.
  if (
    parsed.data.decision === 'aprobado' &&
    entregable.tipo_entregable === 'final'
  ) {
    const { error: rpcErr } = await supabase.rpc(
      'finalizar_proyecto_por_entregable',
      {
        p_id_entregable: parsed.data.idEntregable,
        p_comentario: parsed.data.comentario ?? '',
      },
    )
    if (rpcErr) {
      logger.error('responderEntregable: finalizar RPC failed', {
        error: rpcErr.message,
      })
      return err('finalizacion_fallida')
    }
    revalidatePath(`/empresario/proyecto/${participacion.id_proyecto}`)
    revalidatePath(
      `/egresado/projects/${participacion.id_proyecto}/entregables`,
    )
    const { error: comentFinalErr } = await supabase
      .from('comentarios_entregables')
      .insert({
        id_entregable: parsed.data.idEntregable,
        id_autor: verified.data.id_usuario,
        contenido: parsed.data.comentario ?? '',
        tipo_comentario: 'aprobacion',
      })
    if (comentFinalErr) {
      logger.error('responderEntregable: comentario final insert failed', {
        error: comentFinalErr.message,
      })
    }
    if (entregable.id_tarea) {
      const { error: cerrarTareaErr } = await supabase
        .from('entregable_tareas')
        .update({ estado: 'aprobada' })
        .eq('id_tarea', entregable.id_tarea)
      if (cerrarTareaErr) {
        logger.error('responderEntregable: cerrar tarea (final) fallo', {
          error: cerrarTareaErr.message,
        })
      }
    }
    if (estudianteNotif?.id_usuario) {
      const notifResult = await crearNotificacion(
        buildEntregableRespuestaNotificacion({
          idUsuarioEgresado: estudianteNotif.id_usuario,
          tituloProyecto: proyectoOwned.titulo,
          idProyecto: participacion.id_proyecto,
          decision: 'aprobado',
          finalizado: true,
        }),
      )
      if (!notifResult.ok) {
        logger.error('responderEntregable: notificacion aprobado fallida', {
          error: notifResult.error,
        })
      }
      await enviarEmailRespuestaEntregable({
        idUsuarioEgresado: estudianteNotif.id_usuario,
        tituloProyecto: proyectoOwned.titulo,
        idProyecto: participacion.id_proyecto,
        decision: 'aprobado',
        finalizado: true,
        ...(parsed.data.comentario
          ? { comentario: parsed.data.comentario }
          : {}),
      })
    }
    return ok({ finalizado: true })
  }

  const updateData: {
    estado: 'aprobado' | 'con_cambios'
    comentario_empresario?: string
  } = {
    estado: parsed.data.decision,
    ...(parsed.data.comentario
      ? { comentario_empresario: parsed.data.comentario }
      : {}),
  }

  // Insertar PRIMERO el comentario (es el "por qué" para el egresado). Si falla,
  // abortamos antes de cambiar el estado: así, si el estado cambia, el
  // comentario asociado siempre existe. Solo se inserta si hay texto: una
  // aprobación sin comentario no necesita una fila de comentario vacía.
  const comentario = parsed.data.comentario?.trim()
  if (comentario) {
    const { error: comentErr } = await supabase
      .from('comentarios_entregables')
      .insert({
        id_entregable: parsed.data.idEntregable,
        id_autor: verified.data.id_usuario,
        contenido: comentario,
        tipo_comentario:
          parsed.data.decision === 'aprobado'
            ? ('aprobacion' as const)
            : ('revision_solicitada' as const),
      })
    if (comentErr) {
      logger.error('responderEntregable: comentario insert failed', {
        error: comentErr.message,
      })
      return err('database_error')
    }
  }

  const { error: updateErr } = await supabase
    .from('entregables')
    .update(updateData)
    .eq('id_entregable', parsed.data.idEntregable)
  if (updateErr) {
    logger.error('responderEntregable: update failed', {
      error: updateErr.message,
    })
    return err('database_error')
  }

  // Aprobar cierra la tarea. Pedir cambios la deja abierta. Los huérfanos
  // legacy (id_tarea null) solo aprueban el hijo, sin tarea que cerrar.
  if (parsed.data.decision === 'aprobado' && entregable.id_tarea) {
    const { error: cerrarTareaErr } = await supabase
      .from('entregable_tareas')
      .update({ estado: 'aprobada' })
      .eq('id_tarea', entregable.id_tarea)
    if (cerrarTareaErr) {
      logger.error('responderEntregable: cerrar tarea fallo', {
        error: cerrarTareaErr.message,
      })
    }
  }

  revalidatePath(`/empresario/proyecto/${participacion.id_proyecto}`)
  revalidatePath(`/egresado/projects/${participacion.id_proyecto}/entregables`)
  if (estudianteNotif?.id_usuario) {
    const notifResult = await crearNotificacion(
      buildEntregableRespuestaNotificacion({
        idUsuarioEgresado: estudianteNotif.id_usuario,
        tituloProyecto: proyectoOwned.titulo,
        idProyecto: participacion.id_proyecto,
        decision: parsed.data.decision,
        finalizado: false,
      }),
    )
    if (!notifResult.ok) {
      logger.error('responderEntregable: notificacion fallida', {
        error: notifResult.error,
      })
    }
    await enviarEmailRespuestaEntregable({
      idUsuarioEgresado: estudianteNotif.id_usuario,
      tituloProyecto: proyectoOwned.titulo,
      idProyecto: participacion.id_proyecto,
      decision: parsed.data.decision,
      finalizado: false,
      ...(parsed.data.comentario ? { comentario: parsed.data.comentario } : {}),
    })
  }
  return ok({ finalizado: false })
}

const ComentarEntregableSchema = z.object({
  idEntregable: z.string().uuid(),
  contenido: z.string().min(1).max(1000),
})

/**
 * El empresario agrega un comentario libre (aclaración) sobre un entregable (RF-44).
 * Inserta en `comentarios_entregables` con tipo_comentario = 'aclaracion'.
 * Verifica propiedad del proyecto antes de insertar.
 */
export async function comentarEntregable(
  input: z.infer<typeof ComentarEntregableSchema>,
): Promise<Result<void>> {
  const parsed = ComentarEntregableSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')

  const verified = await requireVerifiedEmpresario()
  if (!verified.ok) return verified

  const supabase = await createSupabaseServerClient()

  const { data: entregable, error: entErr } = await supabase
    .from('entregables')
    .select('id_entregable, id_contratacion')
    .eq('id_entregable', parsed.data.idEntregable)
    .maybeSingle()
  if (entErr || !entregable) return err('entregable_not_found')

  const { data: contratacion, error: contErr } = await supabase
    .from('contrataciones')
    .select('id_participacion')
    .eq('id_contratacion', entregable.id_contratacion)
    .maybeSingle()
  if (contErr || !contratacion) return err('unauthorized')

  const { data: participacion, error: partErr } = await supabase
    .from('participaciones')
    .select('id_proyecto')
    .eq('id_participacion', contratacion.id_participacion)
    .maybeSingle()
  if (partErr || !participacion) return err('unauthorized')

  const { data: proyectoOwned, error: proyErr } = await supabase
    .from('proyectos')
    .select('id_proyecto')
    .eq('id_proyecto', participacion.id_proyecto)
    .eq('id_empresario', verified.data.id_empresario)
    .maybeSingle()
  if (proyErr || !proyectoOwned) return err('unauthorized')

  const { error: insertErr } = await supabase
    .from('comentarios_entregables')
    .insert({
      id_entregable: parsed.data.idEntregable,
      id_autor: verified.data.id_usuario,
      contenido: parsed.data.contenido,
      tipo_comentario: 'aclaracion',
    })
  if (insertErr) {
    logger.error('comentarEntregable: insert failed', {
      error: insertErr.message,
    })
    return err('database_error')
  }

  revalidatePath(`/empresario/proyecto/${participacion.id_proyecto}`)
  return ok(undefined)
}
