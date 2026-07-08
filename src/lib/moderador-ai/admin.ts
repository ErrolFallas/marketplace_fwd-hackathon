'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { ok, err, type Result } from '@/lib/result'
import { logger } from '@/lib/logger'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'
import { getCurrentUser } from '@/lib/auth/dal'
import { addStrike } from '@/lib/admin/strike-actions'
import { crearNotificacion } from '@/lib/notifications/create'
import { TIPO_A_MOTIVO_STRIKE } from '@/lib/moderation/schemas'
import type { Database } from '@/types/database'
import { moderarContenido } from './moderar'
import { ENTIDADES_MODERABLES, type EntidadModerable } from './types'

type AdminClient = ReturnType<typeof createSupabaseAdminClient>
type TipoReporte = Database['public']['Enums']['tipo_reporte_enum']
type AccionModeracion = Database['public']['Enums']['accion_moderacion_enum']
type SeveridadModeracion =
  Database['public']['Enums']['severidad_moderacion_enum']

const MENSAJE_ADVERTENCIA_MAX = 255

/** Fila de la cola del agente para el panel admin (RF convivencia sana). */
export interface ReporteIaItem {
  idReporte: string
  idReportado: string
  nombreReportado: string
  entidad: EntidadModerable | null
  idEntidad: string | null
  tipoReporte: TipoReporte
  descripcion: string
  extracto: string | null
  severidad: SeveridadModeracion | null
  confianza: number | null
  accionSugerida: AccionModeracion | null
  modeloIa: string | null
  reportadoAt: string
  /** Nombre del proyecto/lugar del contenido (o null si no aplica, p. ej. bio). */
  proyecto: string | null
}

/**
 * Lista los reportes GENERADOS POR LA IA (origen='ia') pendientes de revisión.
 * Es la cola de la pestaña "Moderador IA": el admin lee el extracto y decide.
 * Usa service-role (como el resto del admin), gateado por requireRole.
 */
export async function listarReportesIa(): Promise<Result<ReporteIaItem[]>> {
  const authResult = await requireRole('administrador')
  if (!authResult.ok) return authResult

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('reportes_moderacion')
    .select(
      'id_reporte, id_reportado, entidad, id_entidad, tipo_reporte, descripcion, extracto, severidad, confianza, accion_sugerida, modelo_ia, reportado_at',
    )
    .eq('origen', 'ia')
    .in('estado_moderacion', ['pendiente', 'en_revision'])
    .order('reportado_at', { ascending: false })

  if (error) {
    logger.error('listarReportesIa: fallo al leer reportes', {
      error: error.message,
    })
    return err(error.message)
  }

  const rows = data ?? []
  if (rows.length === 0) return ok([])

  const userIds = [
    ...new Set(
      rows.map((r) => r.id_reportado).filter((id): id is string => id !== null),
    ),
  ]
  const { data: usuarios, error: usersError } = await admin
    .from('usuarios')
    .select('id_usuario, nombre, apellido_1')
    .in('id_usuario', userIds)
  if (usersError) {
    logger.error('listarReportesIa: fallo al leer usuarios', {
      error: usersError.message,
    })
    return err(usersError.message)
  }
  const nombrePorId = new Map<string, string>(
    (usuarios ?? []).map((u) => [u.id_usuario, `${u.nombre} ${u.apellido_1}`]),
  )

  const items: ReporteIaItem[] = await Promise.all(
    rows
      .filter((r): r is typeof r & { id_reportado: string } =>
        Boolean(r.id_reportado),
      )
      .map(async (r) => ({
        idReporte: r.id_reporte,
        idReportado: r.id_reportado,
        nombreReportado: nombrePorId.get(r.id_reportado) ?? '',
        entidad: r.entidad,
        idEntidad: r.id_entidad,
        tipoReporte: r.tipo_reporte,
        descripcion: r.descripcion,
        extracto: r.extracto,
        severidad: r.severidad,
        confianza: r.confianza,
        accionSugerida: r.accion_sugerida,
        modeloIa: r.modelo_ia,
        reportadoAt: r.reportado_at,
        proyecto:
          r.entidad && r.id_entidad
            ? await resolverLugar(admin, r.entidad, r.id_entidad)
            : null,
      })),
  )

  return ok(items)
}

/** Cuántas filas del ledger quedaron sin analizar (para el botón "Escanear"). */
export async function contarPendientesEscaneo(): Promise<Result<number>> {
  const authResult = await requireRole('administrador')
  if (!authResult.ok) return authResult

  const admin = createSupabaseAdminClient()
  const { count, error } = await admin
    .from('moderacion_ia_analisis')
    .select('id_analisis', { count: 'exact', head: true })
    .in('estado', ['pendiente', 'fallido'])

  if (error) {
    logger.error('contarPendientesEscaneo: fallo al contar', {
      error: error.message,
    })
    return err(error.message)
  }
  return ok(count ?? 0)
}

const ResolverReporteIaSchema = z.object({
  idReporte: z.string().uuid(),
  accion: z.enum(['advertir', 'strike', 'ignorar']),
  nota: z.string().trim().max(500).optional(),
})
export type ResolverReporteIaInput = z.input<typeof ResolverReporteIaSchema>

/**
 * El admin resuelve un reporte del agente con UNA de tres acciones. El agente
 * solo sugirió; aquí se EJECUTA la decisión humana, reusando la infraestructura:
 *  - advertir → notificación in-app 'advertencia_moderacion' al usuario.
 *  - strike   → addStrike (contador + suspensión por trigger + correo).
 *  - ignorar  → se descarta el reporte, sin efecto sobre el usuario.
 */
export async function resolverReporteIa(
  input: ResolverReporteIaInput,
): Promise<Result<void>> {
  const parsed = ResolverReporteIaSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')

  const authResult = await requireRole('administrador')
  if (!authResult.ok) return authResult

  const me = await getCurrentUser()
  if (!me) return err('unauthenticated')

  const admin = createSupabaseAdminClient()
  const { data: reporte, error: readError } = await admin
    .from('reportes_moderacion')
    .select(
      'id_reporte, id_reportado, tipo_reporte, descripcion, estado_moderacion, origen',
    )
    .eq('id_reporte', parsed.data.idReporte)
    .single()

  if (readError || !reporte) return err('report_not_found')
  if (reporte.origen !== 'ia') return err('not_ia_report')
  if (!reporte.id_reportado) return err('report_without_target')
  if (
    reporte.estado_moderacion !== 'pendiente' &&
    reporte.estado_moderacion !== 'en_revision'
  ) {
    return err('report_already_resolved')
  }

  if (parsed.data.accion === 'strike') {
    const motivo = TIPO_A_MOTIVO_STRIKE[reporte.tipo_reporte]
    const strikeResult = await addStrike(
      reporte.id_reportado,
      motivo,
      parsed.data.nota?.trim() || reporte.descripcion,
    )
    if (!strikeResult.ok) {
      logger.error('resolverReporteIa: strike falló', {
        idReporte: parsed.data.idReporte,
        error: strikeResult.error,
      })
      return err('strike_failed')
    }
  } else if (parsed.data.accion === 'advertir') {
    const mensaje = (
      parsed.data.nota?.trim() ||
      'Un administrador revisó tu contenido: recuerda mantener un trato respetuoso en la plataforma.'
    ).slice(0, MENSAJE_ADVERTENCIA_MAX)
    const notifResult = await crearNotificacion({
      idUsuario: reporte.id_reportado,
      tipoEvento: 'advertencia_moderacion',
      mensaje,
      urlDestino: null,
    })
    if (!notifResult.ok) {
      logger.error('resolverReporteIa: advertencia falló', {
        idReporte: parsed.data.idReporte,
        error: notifResult.error,
      })
      return err('warning_failed')
    }
  }

  const estadoFinal =
    parsed.data.accion === 'ignorar' ? 'descartado' : 'resuelto_a_favor'
  const { error: updateError } = await admin
    .from('reportes_moderacion')
    .update({
      estado_moderacion: estadoFinal,
      resolucion:
        parsed.data.nota?.trim() || `Acción del admin: ${parsed.data.accion}.`,
      resuelto_por: me.id,
      resuelto_at: new Date().toISOString(),
    })
    .eq('id_reporte', parsed.data.idReporte)

  if (updateError) {
    logger.error('resolverReporteIa: fallo al actualizar el reporte', {
      error: updateError.message,
    })
    return err(updateError.message)
  }

  revalidatePath('/admin/moderation', 'page')
  return ok(undefined)
}

/**
 * Reprocesa el contenido que quedó SIN analizar: filas del ledger en estado
 * 'pendiente' o 'fallido' (p. ej. si OpenRouter estaba caído cuando se envió).
 * Re-obtiene el texto y el autor por entidad y vuelve a llamar al agente. Es la
 * red de seguridad del disparo best-effort. Devuelve cuántas se reprocesaron.
 */
export async function escanearPendientes(): Promise<Result<number>> {
  const authResult = await requireRole('administrador')
  if (!authResult.ok) return authResult

  const admin = createSupabaseAdminClient()
  const { data: pendientes, error } = await admin
    .from('moderacion_ia_analisis')
    .select('entidad, id_entidad')
    .in('estado', ['pendiente', 'fallido'])
    .limit(100)

  if (error) {
    logger.error('escanearPendientes: fallo al leer el ledger', {
      error: error.message,
    })
    return err(error.message)
  }

  let procesadas = 0
  for (const fila of pendientes ?? []) {
    if (!(ENTIDADES_MODERABLES as readonly string[]).includes(fila.entidad)) {
      continue
    }
    const contenido = await refetchContenido(
      admin,
      fila.entidad as EntidadModerable,
      fila.id_entidad,
    )
    if (!contenido) continue
    const res = await moderarContenido({
      entidad: fila.entidad as EntidadModerable,
      idEntidad: fila.id_entidad,
      texto: contenido.texto,
      idAutor: contenido.idAutor,
    })
    if (res.ok) procesadas += 1
  }

  revalidatePath('/admin/moderation', 'page')
  return ok(procesadas)
}

/** id_usuario del estudiante a partir de su id_estudiante. */
async function usuarioDeEstudiante(
  admin: AdminClient,
  idEstudiante: string,
): Promise<string | null> {
  const { data } = await admin
    .from('estudiantes')
    .select('id_usuario')
    .eq('id_estudiante', idEstudiante)
    .maybeSingle()
  return data?.id_usuario ?? null
}

/** id_usuario del empresario a partir de su id_empresario. */
async function usuarioDeEmpresario(
  admin: AdminClient,
  idEmpresario: string,
): Promise<string | null> {
  const { data } = await admin
    .from('empresarios')
    .select('id_usuario')
    .eq('id_empresario', idEmpresario)
    .maybeSingle()
  return data?.id_usuario ?? null
}

/** id_proyecto (marketplace) de una contratación, o null. */
async function proyectoDeContratacion(
  admin: AdminClient,
  idContratacion: string,
): Promise<string | null> {
  const { data: cont } = await admin
    .from('contrataciones')
    .select('id_participacion')
    .eq('id_contratacion', idContratacion)
    .maybeSingle()
  if (!cont) return null
  const { data: part } = await admin
    .from('participaciones')
    .select('id_proyecto')
    .eq('id_participacion', cont.id_participacion)
    .maybeSingle()
  return part?.id_proyecto ?? null
}

/** id_usuario del ESTUDIANTE (egresado) dueño de una contratación. */
async function estudianteUsuarioDeContratacion(
  admin: AdminClient,
  idContratacion: string,
): Promise<string | null> {
  const { data: cont } = await admin
    .from('contrataciones')
    .select('id_participacion')
    .eq('id_contratacion', idContratacion)
    .maybeSingle()
  if (!cont) return null
  const { data: part } = await admin
    .from('participaciones')
    .select('id_estudiante')
    .eq('id_participacion', cont.id_participacion)
    .maybeSingle()
  return part ? usuarioDeEstudiante(admin, part.id_estudiante) : null
}

/** id_usuario del EMPRESARIO dueño de una contratación (vía proyecto). */
async function empresarioUsuarioDeContratacion(
  admin: AdminClient,
  idContratacion: string,
): Promise<string | null> {
  const idProyecto = await proyectoDeContratacion(admin, idContratacion)
  if (!idProyecto) return null
  const { data } = await admin
    .from('proyectos')
    .select('id_empresario')
    .eq('id_proyecto', idProyecto)
    .maybeSingle()
  return data ? usuarioDeEmpresario(admin, data.id_empresario) : null
}

/** id_proyecto (marketplace) al que pertenece el contenido de un reporte. */
async function idProyectoDeReporte(
  admin: AdminClient,
  entidad: EntidadModerable,
  idEntidad: string,
): Promise<string | null> {
  switch (entidad) {
    case 'mensaje': {
      const { data } = await admin
        .from('mensajes')
        .select('id_proyecto')
        .eq('id_mensaje', idEntidad)
        .maybeSingle()
      return data?.id_proyecto ?? null
    }
    case 'carta_postulacion': {
      const { data } = await admin
        .from('participaciones')
        .select('id_proyecto')
        .eq('id_participacion', idEntidad)
        .maybeSingle()
      return data?.id_proyecto ?? null
    }
    case 'evaluacion_comentario':
    case 'evaluacion_respuesta': {
      const { data } = await admin
        .from('evaluaciones')
        .select('id_contratacion')
        .eq('id_evaluacion', idEntidad)
        .maybeSingle()
      return data
        ? await proyectoDeContratacion(admin, data.id_contratacion)
        : null
    }
    case 'evaluacion_empresario_comentario':
    case 'evaluacion_empresario_respuesta': {
      const { data } = await admin
        .from('evaluaciones_empresarios')
        .select('id_contratacion')
        .eq('id_evaluacion', idEntidad)
        .maybeSingle()
      return data
        ? await proyectoDeContratacion(admin, data.id_contratacion)
        : null
    }
    case 'comentario_entregable': {
      const { data } = await admin
        .from('comentarios_entregables')
        .select('id_entregable')
        .eq('id_comentario_entregable', idEntidad)
        .maybeSingle()
      if (!data) return null
      const { data: ent } = await admin
        .from('entregables')
        .select('id_contratacion')
        .eq('id_entregable', data.id_entregable)
        .maybeSingle()
      return ent
        ? await proyectoDeContratacion(admin, ent.id_contratacion)
        : null
    }
    case 'entregable_descripcion': {
      const { data } = await admin
        .from('entregables')
        .select('id_contratacion')
        .eq('id_entregable', idEntidad)
        .maybeSingle()
      return data
        ? await proyectoDeContratacion(admin, data.id_contratacion)
        : null
    }
    case 'contrato_condiciones':
    case 'contrato_motivo_cancelacion':
      return await proyectoDeContratacion(admin, idEntidad)
    default:
      // portafolio, bio_estudiante y empresa_descripcion no cuelgan de un
      // proyecto del marketplace.
      return null
  }
}

/**
 * Nombre legible del "lugar" del contenido: el proyecto del marketplace, o el
 * título del proyecto de portafolio; null cuando no aplica (bio de perfil).
 */
async function resolverLugar(
  admin: AdminClient,
  entidad: EntidadModerable,
  idEntidad: string,
): Promise<string | null> {
  if (entidad === 'portafolio') {
    const { data } = await admin
      .from('proyectos_portafolio')
      .select('titulo')
      .eq('id_portafolio', idEntidad)
      .maybeSingle()
    return data?.titulo ?? null
  }
  const idProyecto = await idProyectoDeReporte(admin, entidad, idEntidad)
  if (!idProyecto) return null
  const { data } = await admin
    .from('proyectos')
    .select('titulo')
    .eq('id_proyecto', idProyecto)
    .maybeSingle()
  return data?.titulo ?? null
}

/**
 * Re-obtiene el texto y el id_usuario AUTOR de una fila ya escrita, por entidad.
 * Devuelve null si la fila no existe o no tiene texto. El autor es siempre un
 * id de la tabla `usuarios` (quien escribió el texto).
 */
async function refetchContenido(
  admin: AdminClient,
  entidad: EntidadModerable,
  idEntidad: string,
): Promise<{ texto: string; idAutor: string } | null> {
  switch (entidad) {
    case 'mensaje': {
      const { data } = await admin
        .from('mensajes')
        .select('contenido, id_remitente')
        .eq('id_mensaje', idEntidad)
        .maybeSingle()
      return data ? { texto: data.contenido, idAutor: data.id_remitente } : null
    }
    case 'comentario_entregable': {
      const { data } = await admin
        .from('comentarios_entregables')
        .select('contenido, id_autor')
        .eq('id_comentario_entregable', idEntidad)
        .maybeSingle()
      return data ? { texto: data.contenido, idAutor: data.id_autor } : null
    }
    case 'bio_estudiante': {
      const { data } = await admin
        .from('estudiantes')
        .select('descripcion, id_usuario')
        .eq('id_estudiante', idEntidad)
        .maybeSingle()
      return data?.descripcion
        ? { texto: data.descripcion, idAutor: data.id_usuario }
        : null
    }
    case 'portafolio': {
      const { data } = await admin
        .from('proyectos_portafolio')
        .select('descripcion, id_estudiante')
        .eq('id_portafolio', idEntidad)
        .maybeSingle()
      if (!data?.descripcion) return null
      const idAutor = await usuarioDeEstudiante(admin, data.id_estudiante)
      return idAutor ? { texto: data.descripcion, idAutor } : null
    }
    case 'carta_postulacion': {
      const { data } = await admin
        .from('participaciones')
        .select('carta_postulacion, id_estudiante')
        .eq('id_participacion', idEntidad)
        .maybeSingle()
      if (!data?.carta_postulacion) return null
      const idAutor = await usuarioDeEstudiante(admin, data.id_estudiante)
      return idAutor ? { texto: data.carta_postulacion, idAutor } : null
    }
    case 'evaluacion_comentario': {
      const { data } = await admin
        .from('evaluaciones')
        .select('comentario, id_empresario')
        .eq('id_evaluacion', idEntidad)
        .maybeSingle()
      if (!data?.comentario) return null
      const idAutor = await usuarioDeEmpresario(admin, data.id_empresario)
      return idAutor ? { texto: data.comentario, idAutor } : null
    }
    case 'evaluacion_respuesta': {
      const { data } = await admin
        .from('evaluaciones')
        .select('respuesta_evaluado, id_estudiante')
        .eq('id_evaluacion', idEntidad)
        .maybeSingle()
      if (!data?.respuesta_evaluado) return null
      const idAutor = await usuarioDeEstudiante(admin, data.id_estudiante)
      return idAutor ? { texto: data.respuesta_evaluado, idAutor } : null
    }
    case 'evaluacion_empresario_comentario': {
      const { data } = await admin
        .from('evaluaciones_empresarios')
        .select('comentario, id_estudiante')
        .eq('id_evaluacion', idEntidad)
        .maybeSingle()
      if (!data?.comentario) return null
      const idAutor = await usuarioDeEstudiante(admin, data.id_estudiante)
      return idAutor ? { texto: data.comentario, idAutor } : null
    }
    case 'evaluacion_empresario_respuesta': {
      const { data } = await admin
        .from('evaluaciones_empresarios')
        .select('respuesta_evaluado, id_empresario')
        .eq('id_evaluacion', idEntidad)
        .maybeSingle()
      if (!data?.respuesta_evaluado) return null
      const idAutor = await usuarioDeEmpresario(admin, data.id_empresario)
      return idAutor ? { texto: data.respuesta_evaluado, idAutor } : null
    }
    case 'entregable_descripcion': {
      const { data } = await admin
        .from('entregables')
        .select('descripcion, id_contratacion')
        .eq('id_entregable', idEntidad)
        .maybeSingle()
      if (!data?.descripcion) return null
      const idAutor = await estudianteUsuarioDeContratacion(
        admin,
        data.id_contratacion,
      )
      return idAutor ? { texto: data.descripcion, idAutor } : null
    }
    case 'contrato_condiciones': {
      const { data } = await admin
        .from('contrataciones')
        .select('condiciones_especiales')
        .eq('id_contratacion', idEntidad)
        .maybeSingle()
      if (!data?.condiciones_especiales) return null
      const idAutor = await empresarioUsuarioDeContratacion(admin, idEntidad)
      return idAutor ? { texto: data.condiciones_especiales, idAutor } : null
    }
    case 'contrato_motivo_cancelacion': {
      const { data } = await admin
        .from('contrataciones')
        .select('motivo_cancelacion')
        .eq('id_contratacion', idEntidad)
        .maybeSingle()
      if (!data?.motivo_cancelacion) return null
      const idAutor = await empresarioUsuarioDeContratacion(admin, idEntidad)
      return idAutor ? { texto: data.motivo_cancelacion, idAutor } : null
    }
    case 'empresa_descripcion': {
      const { data } = await admin
        .from('empresarios')
        .select('descripcion, id_usuario')
        .eq('id_empresario', idEntidad)
        .maybeSingle()
      return data?.descripcion
        ? { texto: data.descripcion, idAutor: data.id_usuario }
        : null
    }
  }
}
