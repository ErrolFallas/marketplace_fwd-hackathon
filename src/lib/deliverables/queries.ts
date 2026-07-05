'use server'

import { z } from 'zod'
import { ok, err, type Result } from '@/lib/result'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/guards'
import { logger } from '@/lib/logger'

export interface MiContratacion {
  id_contratacion: string
  id_participacion: string
  estado_periodo: string
  fecha_inicio: string | null
  fecha_fin_estimada: string | null
  url_repositorio_proyecto: string | null
  monto_acordado: number | null
  moneda: string
  condiciones_especiales: string | null
  acuerdo_aceptado_at: string | null
  presupuesto_min: number | null
  presupuesto_max: number | null
}

export interface ComentarioHilo {
  id_comentario_entregable: string
  contenido: string
  tipo_comentario: string
  comentado_at: string
}

export interface EntregablePropio {
  id_entregable: string
  tipo_entregable: 'parcial' | 'final'
  version: number
  archivo_url: string | null
  estado: 'enviado' | 'en_revision' | 'aprobado' | 'con_cambios'
  comentario_empresario: string | null
  cargado_at: string
  comentarios: ComentarioHilo[]
}

/**
 * Devuelve la contratacion activa del egresado para un proyecto dado,
 * o null si no está contratado. RF-40.
 */
export async function getMiContratacion(
  idProyecto: string,
): Promise<Result<MiContratacion | null>> {
  if (!z.string().uuid().safeParse(idProyecto).success)
    return err('invalid_input')

  const roleResult = await requireRole('egresado')
  if (!roleResult.ok) return roleResult

  const supabase = await createSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return err('unauthenticated')

  const { data: estudiante, error: estError } = await supabase
    .from('estudiantes')
    .select('id_estudiante')
    .eq('id_usuario', userData.user.id)
    .single()

  if (estError || !estudiante) return err('estudiante_not_found')

  const { data: part, error: partError } = await supabase
    .from('participaciones')
    .select('id_participacion, url_repositorio_proyecto')
    .eq('id_proyecto', idProyecto)
    .eq('id_estudiante', estudiante.id_estudiante)
    .in('estado', ['contratada', 'finalizada'])
    .maybeSingle()

  if (partError) {
    logger.error('getMiContratacion: participacion query failed', {
      error: partError.message,
    })
    return err('database_error')
  }

  if (!part) return ok(null)

  const { data: contratacion, error: contError } = await supabase
    .from('contrataciones')
    .select(
      'id_contratacion, estado_periodo, fecha_inicio, fecha_fin_estimada, monto_acordado, moneda, condiciones_especiales, acuerdo_aceptado_at',
    )
    .eq('id_participacion', part.id_participacion)
    .maybeSingle()

  if (contError) {
    logger.error('getMiContratacion: contratacion query failed', {
      error: contError.message,
    })
    return err('database_error')
  }

  if (!contratacion) return ok(null)

  // El presupuesto vive en el proyecto (rango publicado); el egresado puede
  // leerlo por RLS al ser el contratado. Si RLS lo bloquea, degrada a null y el
  // trigger de la BD sigue imponiendo el mínimo al aceptar.
  const { data: proyecto } = await supabase
    .from('proyectos')
    .select('presupuesto_min, presupuesto_max')
    .eq('id_proyecto', idProyecto)
    .maybeSingle()

  return ok({
    id_contratacion: contratacion.id_contratacion,
    id_participacion: part.id_participacion,
    estado_periodo: contratacion.estado_periodo,
    fecha_inicio: contratacion.fecha_inicio,
    fecha_fin_estimada: contratacion.fecha_fin_estimada,
    url_repositorio_proyecto: part.url_repositorio_proyecto,
    monto_acordado: contratacion.monto_acordado,
    moneda: contratacion.moneda,
    condiciones_especiales: contratacion.condiciones_especiales,
    acuerdo_aceptado_at: contratacion.acuerdo_aceptado_at,
    presupuesto_min: proyecto?.presupuesto_min ?? null,
    presupuesto_max: proyecto?.presupuesto_max ?? null,
  })
}

export interface ComentarioEntregable {
  id_comentario_entregable: string
  contenido: string
  tipo_comentario: string
  comentado_at: string
}

export interface EntregableEmpresario {
  id_entregable: string
  tipo_entregable: 'parcial' | 'final'
  version: number
  archivo_url: string | null
  estado: 'enviado' | 'en_revision' | 'aprobado' | 'con_cambios'
  comentario_empresario: string | null
  cargado_at: string
  comentarios: ComentarioEntregable[]
}

/**
 * Lista los entregables del contratado para un proyecto del empresario (RF-43).
 * Verifica que el caller sea el empresario dueño antes de devolver datos.
 */
export async function getEntregablesDeProyecto(
  idProyecto: string,
): Promise<Result<EntregableEmpresario[]>> {
  if (!z.string().uuid().safeParse(idProyecto).success)
    return err('invalid_input')

  const supabase = await createSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return err('unauthenticated')

  const { data: empresario, error: empError } = await supabase
    .from('empresarios')
    .select('id_empresario')
    .eq('id_usuario', userData.user.id)
    .maybeSingle()
  if (empError) {
    logger.error('getEntregablesDeProyecto: empresario query failed', {
      error: empError.message,
    })
    return err('database_error')
  }
  if (!empresario) return err('unauthorized')

  const { data: proyecto, error: proyError } = await supabase
    .from('proyectos')
    .select('id_proyecto')
    .eq('id_proyecto', idProyecto)
    .eq('id_empresario', empresario.id_empresario)
    .maybeSingle()
  if (proyError) {
    logger.error('getEntregablesDeProyecto: proyecto query failed', {
      error: proyError.message,
    })
    return err('database_error')
  }
  if (!proyecto) return err('unauthorized')

  const { data: participacion, error: partError } = await supabase
    .from('participaciones')
    .select('id_participacion')
    .eq('id_proyecto', idProyecto)
    .in('estado', ['contratada', 'finalizada'])
    .maybeSingle()
  if (partError) {
    logger.error('getEntregablesDeProyecto: participacion query failed', {
      error: partError.message,
    })
    return err('database_error')
  }
  if (!participacion) return ok([])

  const { data: contratacion, error: contError } = await supabase
    .from('contrataciones')
    .select('id_contratacion')
    .eq('id_participacion', participacion.id_participacion)
    .maybeSingle()
  if (contError) {
    logger.error('getEntregablesDeProyecto: contratacion query failed', {
      error: contError.message,
    })
    return err('database_error')
  }
  if (!contratacion) return ok([])

  const { data, error } = await supabase
    .from('entregables')
    .select(
      `id_entregable, tipo_entregable, version, archivo_url, estado, comentario_empresario, cargado_at,
      comentarios_entregables (
        id_comentario_entregable, contenido, tipo_comentario, comentado_at
      )`,
    )
    .eq('id_contratacion', contratacion.id_contratacion)
    .order('cargado_at', { ascending: false })
  if (error) {
    logger.error('getEntregablesDeProyecto: entregables query failed', {
      error: error.message,
    })
    return err('database_error')
  }

  const mapped: EntregableEmpresario[] = (data ?? []).map((e) => ({
    id_entregable: e.id_entregable,
    tipo_entregable: e.tipo_entregable as 'parcial' | 'final',
    version: e.version,
    archivo_url: e.archivo_url,
    estado: e.estado as EntregableEmpresario['estado'],
    comentario_empresario: e.comentario_empresario,
    cargado_at: e.cargado_at,
    comentarios: (e.comentarios_entregables ?? []).map((c) => ({
      id_comentario_entregable: c.id_comentario_entregable,
      contenido: c.contenido,
      tipo_comentario: c.tipo_comentario,
      comentado_at: c.comentado_at,
    })),
  }))

  return ok(mapped)
}

/**
 * Genera una URL firmada (1h) para que el empresario descargue un entregable
 * del bucket privado. Verifica propiedad antes de emitir la URL (RF-43).
 */
export async function getSignedUrlEntregable(
  idEntregable: string,
): Promise<Result<{ url: string }>> {
  if (!z.string().uuid().safeParse(idEntregable).success)
    return err('invalid_input')

  const supabase = await createSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return err('unauthenticated')

  const { data: entregable, error: entErr } = await supabase
    .from('entregables')
    .select('id_entregable, archivo_url, id_contratacion')
    .eq('id_entregable', idEntregable)
    .maybeSingle()
  if (entErr) {
    logger.error('getSignedUrlEntregable: entregable query failed', {
      error: entErr.message,
    })
    return err('database_error')
  }
  if (!entregable?.archivo_url) return err('entregable_not_found')

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

  const { data: empresario, error: empErr } = await supabase
    .from('empresarios')
    .select('id_empresario')
    .eq('id_usuario', userData.user.id)
    .maybeSingle()
  if (empErr || !empresario) return err('unauthorized')

  const { data: proyectoOwned, error: proyErr } = await supabase
    .from('proyectos')
    .select('id_proyecto')
    .eq('id_proyecto', participacion.id_proyecto)
    .eq('id_empresario', empresario.id_empresario)
    .maybeSingle()
  if (proyErr || !proyectoOwned) return err('unauthorized')

  const { data: signed, error: signErr } = await supabase.storage
    .from('entregables')
    .createSignedUrl(entregable.archivo_url, 3600, { download: true })
  if (signErr) {
    logger.error('getSignedUrlEntregable: storage error', {
      error: signErr.message,
    })
    return err('storage_error')
  }
  if (!signed?.signedUrl) return err('storage_error')

  return ok({ url: signed.signedUrl })
}

/**
 * URL firmada (1h) para VER un adjunto de una propuesta. A diferencia de
 * getSignedUrlEntregable (solo empresario), acá cualquiera de las dos partes puede
 * verlo: nos apoyamos en el RLS de `entregable_adjuntos` (SELECT de ambas partes).
 */
export async function getSignedUrlAdjunto(
  idAdjunto: string,
): Promise<Result<{ url: string }>> {
  if (!z.string().uuid().safeParse(idAdjunto).success)
    return err('invalid_input')

  const supabase = await createSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return err('unauthenticated')

  // El RLS de entregable_adjuntos limita la lectura a las dos partes de la
  // contratación; si no sos parte, la fila no aparece.
  const { data: adjunto, error: adjErr } = await supabase
    .from('entregable_adjuntos')
    .select('archivo_url')
    .eq('id_adjunto', idAdjunto)
    .maybeSingle()
  if (adjErr) {
    logger.error('getSignedUrlAdjunto: query failed', { error: adjErr.message })
    return err('database_error')
  }
  if (!adjunto?.archivo_url) return err('adjunto_not_found')

  const { data: signed, error: signErr } = await supabase.storage
    .from('entregables')
    .createSignedUrl(adjunto.archivo_url, 3600)
  if (signErr || !signed?.signedUrl) {
    logger.error('getSignedUrlAdjunto: storage error', {
      error: signErr?.message,
    })
    return err('storage_error')
  }

  return ok({ url: signed.signedUrl })
}

/**
 * Lista los entregables del egresado para una contratacion. RF-40.
 */
export async function getMisEntregables(
  idContratacion: string,
): Promise<Result<EntregablePropio[]>> {
  if (!z.string().uuid().safeParse(idContratacion).success)
    return err('invalid_input')

  const roleResult = await requireRole('egresado')
  if (!roleResult.ok) return roleResult

  const supabase = await createSupabaseServerClient()

  // Verificación de propiedad: la contratación debe ser del egresado actual.
  // La RLS de entregables ya lo cubre; esto es defensa en profundidad (reglas.md §5).
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return err('unauthenticated')

  const { data: estudiante, error: estError } = await supabase
    .from('estudiantes')
    .select('id_estudiante')
    .eq('id_usuario', userData.user.id)
    .single()
  if (estError || !estudiante) return err('estudiante_not_found')

  const { data: contratacion, error: contError } = await supabase
    .from('contrataciones')
    .select('id_participacion')
    .eq('id_contratacion', idContratacion)
    .maybeSingle()
  if (contError) {
    logger.error('getMisEntregables: contratacion query failed', {
      error: contError.message,
    })
    return err('database_error')
  }
  if (!contratacion) return err('unauthorized')

  const { data: participacion, error: partError } = await supabase
    .from('participaciones')
    .select('id_estudiante')
    .eq('id_participacion', contratacion.id_participacion)
    .maybeSingle()
  if (partError) {
    logger.error('getMisEntregables: participacion query failed', {
      error: partError.message,
    })
    return err('database_error')
  }
  if (
    !participacion ||
    participacion.id_estudiante !== estudiante.id_estudiante
  ) {
    return err('unauthorized')
  }

  const { data, error } = await supabase
    .from('entregables')
    .select(
      `id_entregable, tipo_entregable, version, archivo_url, estado, comentario_empresario, cargado_at,
      comentarios_entregables (
        id_comentario_entregable, contenido, tipo_comentario, comentado_at
      )`,
    )
    .eq('id_contratacion', idContratacion)
    .order('cargado_at', { ascending: false })

  if (error) {
    logger.error('getMisEntregables failed', { error: error.message })
    return err('database_error')
  }

  const mapped: EntregablePropio[] = (data ?? []).map((e) => ({
    id_entregable: e.id_entregable,
    tipo_entregable: e.tipo_entregable as 'parcial' | 'final',
    version: e.version,
    archivo_url: e.archivo_url,
    estado: e.estado as EntregablePropio['estado'],
    comentario_empresario: e.comentario_empresario,
    cargado_at: e.cargado_at,
    comentarios: (e.comentarios_entregables ?? [])
      .map((c) => ({
        id_comentario_entregable: c.id_comentario_entregable,
        contenido: c.contenido,
        tipo_comentario: c.tipo_comentario,
        comentado_at: c.comentado_at,
      }))
      .sort((a, b) => a.comentado_at.localeCompare(b.comentado_at)),
  }))

  return ok(mapped)
}

export interface ContratacionResumen {
  id_contratacion: string
  estado_periodo: string
  fecha_inicio: string | null
  fecha_fin_estimada: string | null
  id_proyecto: string
  titulo_proyecto: string
  estado_proyecto: string
  id_empresario: string
}

export interface ContratacionParaCalificacion {
  id_contratacion: string
  id_participacion: string
  estado_periodo: string
  id_estudiante: string
  fecha_inicio: string | null
  fecha_fin_estimada: string | null
  url_repositorio_proyecto: string | null
}

/**
 * Devuelve la contratación activa/finalizada para un proyecto del empresario,
 * incluyendo el id_estudiante. Usado para mostrar la tarjeta de calificación (RF-49).
 */
export async function getContratacionDelProyecto(
  idProyecto: string,
): Promise<Result<ContratacionParaCalificacion | null>> {
  if (!z.string().uuid().safeParse(idProyecto).success)
    return err('invalid_input')

  const supabase = await createSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return err('unauthenticated')

  const { data: empresario, error: empError } = await supabase
    .from('empresarios')
    .select('id_empresario')
    .eq('id_usuario', userData.user.id)
    .maybeSingle()
  if (empError || !empresario) return err('unauthorized')

  const { data: proyecto, error: proyError } = await supabase
    .from('proyectos')
    .select('id_proyecto')
    .eq('id_proyecto', idProyecto)
    .eq('id_empresario', empresario.id_empresario)
    .maybeSingle()
  if (proyError || !proyecto) return err('unauthorized')

  const { data: part, error: partError } = await supabase
    .from('participaciones')
    .select('id_participacion, id_estudiante, url_repositorio_proyecto')
    .eq('id_proyecto', idProyecto)
    .in('estado', ['contratada', 'finalizada'])
    .maybeSingle()

  if (partError) {
    logger.error('getContratacionDelProyecto: participacion query failed', {
      error: partError.message,
    })
    return err('database_error')
  }
  if (!part) return ok(null)

  const { data: contratacion, error: contError } = await supabase
    .from('contrataciones')
    .select('id_contratacion, estado_periodo, fecha_inicio, fecha_fin_estimada')
    .eq('id_participacion', part.id_participacion)
    .maybeSingle()

  if (contError) {
    logger.error('getContratacionDelProyecto: contratacion query failed', {
      error: contError.message,
    })
    return err('database_error')
  }
  if (!contratacion) return ok(null)

  return ok({
    id_contratacion: contratacion.id_contratacion,
    id_participacion: part.id_participacion,
    estado_periodo: contratacion.estado_periodo,
    id_estudiante: part.id_estudiante,
    fecha_inicio: contratacion.fecha_inicio,
    fecha_fin_estimada: contratacion.fecha_fin_estimada,
    url_repositorio_proyecto: part.url_repositorio_proyecto,
  })
}

export interface ContratacionParaGestion {
  id_contratacion: string
  id_participacion: string
  id_estudiante: string
  estado_periodo: string
  acuerdo_aceptado_at: string | null
  monto_acordado: number | null
  moneda: string
  condiciones_especiales: string | null
  url_repositorio_proyecto: string | null
  presupuesto_min: number | null
  presupuesto_max: number | null
}

/**
 * Carga la contratación completa de un proyecto del empresario para la zona de
 * trabajo (contrataciones/[id]): incluye monto, condiciones, estado del acuerdo
 * y el presupuesto del proyecto (para validar el mínimo). Valida propiedad por RLS.
 */
export async function getContratacionParaGestion(
  idProyecto: string,
): Promise<Result<ContratacionParaGestion | null>> {
  if (!z.string().uuid().safeParse(idProyecto).success)
    return err('invalid_input')

  const supabase = await createSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return err('unauthenticated')

  const { data: empresario, error: empError } = await supabase
    .from('empresarios')
    .select('id_empresario')
    .eq('id_usuario', userData.user.id)
    .maybeSingle()
  if (empError || !empresario) return err('unauthorized')

  const { data: proyecto, error: proyError } = await supabase
    .from('proyectos')
    .select('id_proyecto, presupuesto_min, presupuesto_max')
    .eq('id_proyecto', idProyecto)
    .eq('id_empresario', empresario.id_empresario)
    .maybeSingle()
  if (proyError || !proyecto) return err('unauthorized')

  const { data: part, error: partError } = await supabase
    .from('participaciones')
    .select('id_participacion, id_estudiante, url_repositorio_proyecto')
    .eq('id_proyecto', idProyecto)
    .in('estado', ['contratada', 'finalizada'])
    .maybeSingle()
  if (partError) {
    logger.error('getContratacionParaGestion: participacion query failed', {
      error: partError.message,
    })
    return err('database_error')
  }
  if (!part) return ok(null)

  const { data: contratacion, error: contError } = await supabase
    .from('contrataciones')
    .select(
      'id_contratacion, estado_periodo, acuerdo_aceptado_at, monto_acordado, moneda, condiciones_especiales',
    )
    .eq('id_participacion', part.id_participacion)
    .maybeSingle()
  if (contError) {
    logger.error('getContratacionParaGestion: contratacion query failed', {
      error: contError.message,
    })
    return err('database_error')
  }
  if (!contratacion) return ok(null)

  return ok({
    id_contratacion: contratacion.id_contratacion,
    id_participacion: part.id_participacion,
    id_estudiante: part.id_estudiante,
    estado_periodo: contratacion.estado_periodo,
    acuerdo_aceptado_at: contratacion.acuerdo_aceptado_at,
    monto_acordado: contratacion.monto_acordado,
    moneda: contratacion.moneda,
    condiciones_especiales: contratacion.condiciones_especiales,
    url_repositorio_proyecto: part.url_repositorio_proyecto,
    presupuesto_min: proyecto.presupuesto_min,
    presupuesto_max: proyecto.presupuesto_max,
  })
}

export interface PropuestaAdjunto {
  id_adjunto: string
  tipo: string
  archivo_url: string
  orden: number
}

export interface PropuestaEntregable {
  id_entregable: string
  descripcion: string | null
  archivo_url: string | null
  url_enlace: string | null
  estado: string
  comentario_empresario: string | null
  cargado_at: string
  adjuntos: PropuestaAdjunto[]
  comentarios: {
    id_comentario_entregable: string
    contenido: string
    tipo_comentario: string
    comentado_at: string
  }[]
}

export interface TareaEntregable {
  id_tarea: string
  titulo: string
  descripcion: string | null
  tipo_entregable: string
  estado: string
  created_at: string
  propuestas: PropuestaEntregable[]
}

/**
 * Carga las tareas (nivel 1) de una contratación con sus propuestas (nivel 2) y
 * los comentarios de cada propuesta. Tareas más recientes arriba; propuestas por
 * fecha de carga ascendente (la ronda más vieja primero). El RLS limita la
 * lectura a las dos partes de la contratación.
 */
export async function getTareasByContratacion(
  idContratacion: string,
): Promise<Result<TareaEntregable[]>> {
  if (!z.string().uuid().safeParse(idContratacion).success)
    return err('invalid_input')

  const supabase = await createSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return err('unauthenticated')

  const { data, error } = await supabase
    .from('entregable_tareas')
    .select(
      `id_tarea, titulo, descripcion, tipo_entregable, estado, created_at,
       entregables ( id_entregable, descripcion, archivo_url, url_enlace, estado, comentario_empresario, cargado_at,
         entregable_adjuntos ( id_adjunto, tipo, archivo_url, orden ),
         comentarios_entregables ( id_comentario_entregable, contenido, tipo_comentario, comentado_at ) )`,
    )
    .eq('id_contratacion', idContratacion)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('getTareasByContratacion: query failed', {
      error: error.message,
    })
    return err('database_error')
  }

  const tareas: TareaEntregable[] = (data ?? []).map((t) => ({
    id_tarea: t.id_tarea,
    titulo: t.titulo,
    descripcion: t.descripcion,
    tipo_entregable: t.tipo_entregable,
    estado: t.estado,
    created_at: t.created_at,
    propuestas: [...(t.entregables ?? [])]
      .sort((a, b) => a.cargado_at.localeCompare(b.cargado_at))
      .map((e) => ({
        id_entregable: e.id_entregable,
        descripcion: e.descripcion,
        archivo_url: e.archivo_url,
        url_enlace: e.url_enlace,
        estado: e.estado,
        comentario_empresario: e.comentario_empresario,
        cargado_at: e.cargado_at,
        adjuntos: [...(e.entregable_adjuntos ?? [])]
          .sort((a, b) => a.orden - b.orden)
          .map((a) => ({
            id_adjunto: a.id_adjunto,
            tipo: a.tipo,
            archivo_url: a.archivo_url,
            orden: a.orden,
          })),
        comentarios: [...(e.comentarios_entregables ?? [])]
          .sort((a, b) => a.comentado_at.localeCompare(b.comentado_at))
          .map((c) => ({
            id_comentario_entregable: c.id_comentario_entregable,
            contenido: c.contenido,
            tipo_comentario: c.tipo_comentario,
            comentado_at: c.comentado_at,
          })),
      })),
  }))

  return ok(tareas)
}

/**
 * Entregables "huérfanos" de una contratación: los que NO cuelgan de una tarea
 * (`id_tarea` null) — filas legacy previas al modelo de 2 niveles. Se muestran en
 * una sección aparte para no perderlos. RLS limita la lectura a las dos partes.
 */
export async function getEntregablesHuerfanos(
  idContratacion: string,
): Promise<Result<PropuestaEntregable[]>> {
  if (!z.string().uuid().safeParse(idContratacion).success)
    return err('invalid_input')

  const supabase = await createSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return err('unauthenticated')

  const { data, error } = await supabase
    .from('entregables')
    .select(
      `id_entregable, descripcion, archivo_url, url_enlace, estado, comentario_empresario, cargado_at,
       entregable_adjuntos ( id_adjunto, tipo, archivo_url, orden ),
       comentarios_entregables ( id_comentario_entregable, contenido, tipo_comentario, comentado_at )`,
    )
    .eq('id_contratacion', idContratacion)
    .is('id_tarea', null)
    .order('cargado_at', { ascending: false })

  if (error) {
    logger.error('getEntregablesHuerfanos: query failed', {
      error: error.message,
    })
    return err('database_error')
  }

  const huerfanos: PropuestaEntregable[] = (data ?? []).map((e) => ({
    id_entregable: e.id_entregable,
    descripcion: e.descripcion,
    archivo_url: e.archivo_url,
    url_enlace: e.url_enlace,
    estado: e.estado,
    comentario_empresario: e.comentario_empresario,
    cargado_at: e.cargado_at,
    adjuntos: [...(e.entregable_adjuntos ?? [])]
      .sort((a, b) => a.orden - b.orden)
      .map((a) => ({
        id_adjunto: a.id_adjunto,
        tipo: a.tipo,
        archivo_url: a.archivo_url,
        orden: a.orden,
      })),
    comentarios: [...(e.comentarios_entregables ?? [])]
      .sort((a, b) => a.comentado_at.localeCompare(b.comentado_at))
      .map((c) => ({
        id_comentario_entregable: c.id_comentario_entregable,
        contenido: c.contenido,
        tipo_comentario: c.tipo_comentario,
        comentado_at: c.comentado_at,
      })),
  }))

  return ok(huerfanos)
}

/**
 * Lista todas las contrataciones del egresado autenticado (estado contratada
 * o finalizada) junto con los datos básicos del proyecto. RF-40/41.
 */
export async function getMisContrataciones(): Promise<
  Result<ContratacionResumen[]>
> {
  const roleResult = await requireRole('egresado')
  if (!roleResult.ok) return roleResult

  const supabase = await createSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return err('unauthenticated')

  const { data: estudiante, error: estError } = await supabase
    .from('estudiantes')
    .select('id_estudiante')
    .eq('id_usuario', userData.user.id)
    .single()
  if (estError || !estudiante) return err('estudiante_not_found')

  const { data: participaciones, error: partError } = await supabase
    .from('participaciones')
    .select('id_participacion, id_proyecto')
    .eq('id_estudiante', estudiante.id_estudiante)
    .in('estado', ['contratada', 'finalizada'])
  if (partError) {
    logger.error('getMisContrataciones: participaciones query failed', {
      error: partError.message,
    })
    return err('database_error')
  }
  if (!participaciones || participaciones.length === 0) return ok([])

  const idParticipaciones = participaciones.map((p) => p.id_participacion)

  const { data: contrataciones, error: contError } = await supabase
    .from('contrataciones')
    .select(
      'id_contratacion, id_participacion, estado_periodo, fecha_inicio, fecha_fin_estimada',
    )
    .in('id_participacion', idParticipaciones)
  if (contError) {
    logger.error('getMisContrataciones: contrataciones query failed', {
      error: contError.message,
    })
    return err('database_error')
  }
  if (!contrataciones || contrataciones.length === 0) return ok([])

  const idProyectos = participaciones.map((p) => p.id_proyecto)
  const { data: proyectos, error: proyError } = await supabase
    .from('proyectos')
    .select('id_proyecto, titulo, estado, id_empresario')
    .in('id_proyecto', idProyectos)
  if (proyError) {
    logger.error('getMisContrataciones: proyectos query failed', {
      error: proyError.message,
    })
    return err('database_error')
  }

  const proyectoMap = new Map((proyectos ?? []).map((p) => [p.id_proyecto, p]))
  const partMap = new Map(participaciones.map((p) => [p.id_participacion, p]))

  const result: ContratacionResumen[] = contrataciones
    .map((c) => {
      const part = partMap.get(c.id_participacion)
      if (!part) return null
      const proyecto = proyectoMap.get(part.id_proyecto)
      if (!proyecto) return null
      return {
        id_contratacion: c.id_contratacion,
        estado_periodo: c.estado_periodo as string,
        fecha_inicio: c.fecha_inicio,
        fecha_fin_estimada: c.fecha_fin_estimada,
        id_proyecto: part.id_proyecto,
        titulo_proyecto: proyecto.titulo,
        estado_proyecto: proyecto.estado as string,
        id_empresario: proyecto.id_empresario,
      } satisfies ContratacionResumen
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)

  return ok(result)
}
