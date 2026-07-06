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
})

/**
 * El empresario abre una tarea (entregable de nivel 1) sobre una contratación
 * vigente: define el requerimiento ("quiero esto"). Las tareas son planas (sin
 * parcial/final); las propuestas del egresado cuelgan de la tarea. Finalizar la
 * contratación es una acción global aparte (finalizarContratacion).
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
    tipo_entregable: 'parcial',
    abierta_por: userData.user?.id ?? null,
  })

  if (error) {
    logger.error('abrirTarea: insert failed', { error: error.message })
    return err('apertura_fallida')
  }

  revalidatePath(`/empresario/contrataciones/${parsed.data.idProyecto}`)
  return ok(undefined)
}

const FinalizarContratacionSchema = z.object({
  idProyecto: z.string().uuid(),
})

/**
 * El empresario finaliza la contratación de forma GLOBAL (decisión soberana, no
 * atada a un entregable "final"): pasa proyecto/contratación/participación a
 * finalizado y habilita las calificaciones. La RPC valida dueño + estado vigente
 * y bloquea la fila. Las tareas abiertas quedan como histórico.
 */
export async function finalizarContratacion(
  input: z.infer<typeof FinalizarContratacionSchema>,
): Promise<Result<void>> {
  const parsed = FinalizarContratacionSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')

  const guard = await requireVerifiedEmpresario()
  if (!guard.ok) return guard

  const contResult = await getContratacionParaGestion(parsed.data.idProyecto)
  if (!contResult.ok) return err(contResult.error)
  const contratacion = contResult.data
  if (!contratacion) return err('contratacion_no_encontrada')

  const supabase = await createSupabaseServerClient()
  const { error: rpcError } = await supabase.rpc('finalizar_contratacion', {
    p_id_contratacion: contratacion.id_contratacion,
  })
  if (rpcError) {
    logger.error('finalizarContratacion: RPC failed', {
      code: rpcError.code,
      error: rpcError.message,
    })
    if (rpcError.code === 'P0005') return err('contratacion_no_vigente')
    if (rpcError.code === 'P0004') return err('unauthorized')
    return err('database_error')
  }

  revalidatePath(`/empresario/contrataciones/${parsed.data.idProyecto}`)
  return ok(undefined)
}

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
  const urlEntregables = `${baseUrl}/${DEFAULT_LOCALE}/egresado/contrataciones/${params.idProyecto}`
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

const MAX_ADJUNTOS = 10

// MIME permitidos para adjuntos de una propuesta → tipo en `entregable_adjuntos`.
const MIME_A_TIPO: Record<string, 'pdf' | 'imagen'> = {
  'application/pdf': 'pdf',
  'image/png': 'imagen',
  'image/jpeg': 'imagen',
  'image/webp': 'imagen',
}

// Limpieza best-effort de archivos ya subidos ante un fallo posterior. El bucket
// `entregables` no tiene policy DELETE, así que la limpieza puede quedar
// incompleta y dejar huérfanos (documentado); no bloquea la entrega por eso.
async function limpiarAdjuntosStorage(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  paths: string[],
): Promise<void> {
  if (paths.length === 0) return
  const { error } = await supabase.storage
    .from(ENTREGABLES_BUCKET)
    .remove(paths)
  if (error) {
    logger.error('limpiarAdjuntosStorage: fallo (posibles huerfanos)', {
      error: error.message,
    })
  }
}

// Avisa al empresario (in-app + email) que llegó una propuesta nueva. Best-effort.
async function notificarEmpresarioPropuesta(idProyecto: string): Promise<void> {
  try {
    const adminClient = createSupabaseAdminClient()
    const { data: proyecto } = await adminClient
      .from('proyectos')
      .select('titulo, id_empresario')
      .eq('id_proyecto', idProyecto)
      .maybeSingle()
    if (!proyecto) return
    const { data: empresario } = await adminClient
      .from('empresarios')
      .select('id_usuario')
      .eq('id_empresario', proyecto.id_empresario)
      .maybeSingle()
    if (!empresario?.id_usuario) return
    const notifResult = await crearNotificacion(
      buildEntregableEnviadoNotificacion({
        idUsuarioEmpresario: empresario.id_usuario,
        tituloProyecto: proyecto.titulo,
        idProyecto,
      }),
    )
    if (!notifResult.ok) {
      logger.error('notificarEmpresarioPropuesta: notificacion fallida', {
        error: notifResult.error,
      })
    }
    await enviarEmailEntregableEnviado({
      idUsuarioEmpresario: empresario.id_usuario,
      tituloProyecto: proyecto.titulo,
      idProyecto,
    })
  } catch (e) {
    logger.error('notificarEmpresarioPropuesta: error al notificar', {
      error: e instanceof Error ? e.message : String(e),
    })
  }
}

const SubirPropuestaSchema = z.object({
  idTarea: z.string().uuid(),
  idProyecto: z.string().uuid(),
  descripcion: z.string().min(1).max(MAX_CONDICIONES_LEN),
  urlEnlace: z.string().url().max(500).nullable(),
  archivos: z
    .array(z.instanceof(File))
    .max(MAX_ADJUNTOS)
    .refine(
      (files) =>
        files.every((f) => f.size > 0 && f.size <= MAX_FILE_SIZE_BYTES),
      { message: 'archivo_invalido' },
    )
    .refine((files) => files.every((f) => MIME_A_TIPO[f.type] !== undefined), {
      message: 'tipo_no_permitido',
    }),
})

/**
 * El egresado sube una propuesta (nivel 2) dentro de una tarea abierta. Modelo
 * multi-evidencia: descripción OBLIGATORIA + al menos una evidencia (link o
 * archivo); los archivos (PDF/imágenes) van a `entregable_adjuntos`. Una sola
 * propuesta esperando veredicto por tarea a la vez. Sin dedup por hash: se espera
 * volver a subir evidencia en cada ronda.
 */
export async function subirPropuesta(
  formData: FormData,
): Promise<Result<void>> {
  const archivos = formData
    .getAll('archivos')
    .filter((f): f is File => f instanceof File && f.size > 0)

  const parsed = SubirPropuestaSchema.safeParse({
    idTarea: formData.get('idTarea'),
    idProyecto: formData.get('idProyecto'),
    descripcion: formData.get('descripcion') ?? '',
    urlEnlace: formData.get('urlEnlace') || null,
    archivos,
  })
  if (!parsed.success) return err('invalid_input')

  // Regla de negocio: al menos una evidencia (link o archivo).
  if (parsed.data.urlEnlace === null && parsed.data.archivos.length === 0) {
    return err('evidencia_requerida')
  }

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

  // Subir los archivos (carpeta = id_contratacion, como exige la policy de Storage).
  const subidos: { path: string; tipo: 'pdf' | 'imagen' }[] = []
  for (const archivo of parsed.data.archivos) {
    const ext = archivo.name.split('.').pop()?.toLowerCase() || 'bin'
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const path = `${tarea.id_contratacion}/${suffix}.${ext}`
    const { error: upErr } = await supabase.storage
      .from(ENTREGABLES_BUCKET)
      .upload(path, archivo)
    if (upErr) {
      await limpiarAdjuntosStorage(
        supabase,
        subidos.map((s) => s.path),
      )
      logger.error('subirPropuesta: storage upload failed', {
        error: upErr.message,
      })
      return err('storage_error')
    }
    const tipo = MIME_A_TIPO[archivo.type]
    if (tipo) subidos.push({ path, tipo })
  }

  // Insertar la propuesta. Versión = max+1 por contratación; el UNIQUE
  // (id_contratacion, version) es el backstop ante carreras (reintenta una vez).
  let idEntregable: string | null = null
  for (let attempt = 1; attempt <= MAX_VERSION_ATTEMPTS; attempt++) {
    const { data: maxVer } = await supabase
      .from('entregables')
      .select('version')
      .eq('id_contratacion', tarea.id_contratacion)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()
    const version = (maxVer?.version ?? 0) + 1

    const { data: inserted, error: insErr } = await supabase
      .from('entregables')
      .insert({
        id_contratacion: tarea.id_contratacion,
        id_tarea: parsed.data.idTarea,
        tipo_entregable: tarea.tipo_entregable,
        descripcion: parsed.data.descripcion,
        url_enlace: parsed.data.urlEnlace,
        version,
        estado: 'enviado',
      })
      .select('id_entregable')
      .single()

    if (!insErr && inserted) {
      idEntregable = inserted.id_entregable
      break
    }
    if (insErr?.code === '23505' && attempt < MAX_VERSION_ATTEMPTS) continue
    await limpiarAdjuntosStorage(
      supabase,
      subidos.map((s) => s.path),
    )
    logger.error('subirPropuesta: insert entregable failed', {
      error: insErr?.message,
    })
    return err(insErr?.code === '23505' ? 'version_conflict' : 'database_error')
  }
  if (!idEntregable) {
    await limpiarAdjuntosStorage(
      supabase,
      subidos.map((s) => s.path),
    )
    return err('version_conflict')
  }

  // Insertar los adjuntos (PDF/imágenes) que apuntan a la propuesta recién creada.
  if (subidos.length > 0) {
    const idEnt = idEntregable
    const { error: adjErr } = await supabase.from('entregable_adjuntos').insert(
      subidos.map((s, i) => ({
        id_entregable: idEnt,
        tipo: s.tipo,
        archivo_url: s.path,
        orden: i,
      })),
    )
    if (adjErr) {
      logger.error('subirPropuesta: insert adjuntos failed', {
        error: adjErr.message,
      })
      return err('adjuntos_fallidos')
    }
  }

  revalidatePath(`/egresado/contrataciones/${parsed.data.idProyecto}`)
  await notificarEmpresarioPropuesta(parsed.data.idProyecto)
  return ok(undefined)
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

  revalidatePath(`/egresado/contrataciones/${parsed.data.idProyecto}`)
  return ok(undefined)
}

const AceptarAcuerdoSchema = z.object({
  idProyecto: z.string().uuid(),
  montoVisto: z.number().nullable(),
  condicionesVistas: z.string().nullable(),
})

/**
 * El egresado ACEPTA el acuerdo de la contratación (RF): congela monto y
 * condiciones como evidencia. El candado es ATÓMICO en la RPC: recibe el monto y
 * las condiciones que el egresado VIO y, con la fila bloqueada (`for update`),
 * valida que coincidan con los actuales antes de aceptar. Si la empresa las
 * cambió entremedio, la RPC rechaza (P0008). No repetimos el chequeo en JS
 * (sería un TOCTOU): la RPC es la única fuente de verdad.
 */
export async function aceptarAcuerdo(
  input: z.infer<typeof AceptarAcuerdoSchema>,
): Promise<Result<void>> {
  const parsed = AceptarAcuerdoSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')

  const verified = await requireVerifiedEgresado()
  if (!verified.ok) return verified

  // La RPC recibe id_contratacion, no id_proyecto: lo resolvemos por RLS.
  const contResult = await getMiContratacion(parsed.data.idProyecto)
  if (!contResult.ok) return err(contResult.error)
  const cont = contResult.data
  if (!cont) return err('contratacion_no_encontrada')

  const supabase = await createSupabaseServerClient()
  const { error: rpcError } = await supabase.rpc(
    'aceptar_acuerdo_contratacion',
    {
      p_id_contratacion: cont.id_contratacion,
      p_monto_esperado: parsed.data.montoVisto,
      p_condiciones_esperadas: parsed.data.condicionesVistas,
    },
  )
  if (rpcError) {
    logger.error('aceptarAcuerdo: RPC failed', {
      code: rpcError.code,
      error: rpcError.message,
    })
    if (rpcError.code === 'P0008') return err('contrato_cambio')
    if (rpcError.code === 'P0006') return err('acuerdo_ya_aceptado')
    if (rpcError.code === 'P0005') return err('contratacion_no_vigente')
    if (rpcError.code === 'P0007') return err('sin_propuesta')
    return err('database_error')
  }

  revalidatePath(`/egresado/contrataciones/${parsed.data.idProyecto}`)
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
 * El empresario aprueba o solicita cambios sobre un entregable (RF-44). Solo se
 * puede responder cuando estado === 'enviado' | 'en_revision'. Aprobar cierra la
 * tarea padre; ya NO finaliza el proyecto (eso es una acción global aparte,
 * `finalizarContratacion`). Revalida la vista del empresario y la del egresado.
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
    .select('id_entregable, estado, id_contratacion, id_tarea')
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
    .update({ estado: parsed.data.decision })
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
  revalidatePath(`/egresado/contrataciones/${participacion.id_proyecto}`)
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
