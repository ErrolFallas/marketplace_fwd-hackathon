'use server'

import { z } from 'zod'
import { ok, err, type Result } from '@/lib/result'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireRole, requireVerifiedEgresado } from '@/lib/auth/guards'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'
import { notificarEvaluacionRecibida } from './notificar-evaluacion'

const RateEgresadoSchema = z.object({
  idEstudiante: z.string().uuid(),
  idContratacion: z.string().uuid(),
  puntuacion: z.number().int().min(1).max(5),
  comentario: z.string().max(1000).optional(),
})

export type RateEgresadoInput = z.infer<typeof RateEgresadoSchema>

export async function rateEgresado(
  input: RateEgresadoInput,
): Promise<Result<void>> {
  const parsed = RateEgresadoSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')

  const roleResult = await requireRole('empresario')
  if (!roleResult.ok) return roleResult

  const supabase = await createSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return err('unauthenticated')

  const { data: empresario, error: empError } = await supabase
    .from('empresarios')
    .select('id_empresario')
    .eq('id_usuario', userData.user.id)
    .maybeSingle()

  if (empError || !empresario) {
    logger.error('rateEgresado: empresario no encontrado', {
      error: empError?.message,
    })
    return err('unauthorized')
  }

  const { data: contratacion, error: contError } = await supabase
    .from('contrataciones')
    .select(
      `
      id_contratacion,
      estado_periodo,
      participaciones!inner(
        id_estudiante,
        proyectos!inner(
          id_empresario,
          titulo
        )
      )
    `,
    )
    .eq('id_contratacion', parsed.data.idContratacion)
    .maybeSingle()

  if (contError || !contratacion) {
    logger.error('rateEgresado: contratacion no encontrada', {
      error: contError?.message,
    })
    return err('contratacion_not_found')
  }

  const part = contratacion.participaciones

  if (part.proyectos.id_empresario !== empresario.id_empresario) {
    return err('forbidden')
  }

  // Se puede calificar cuando la contratación quedó finalizada O cancelada
  // (reseñas atribuidas/visibles; la RLS de reseñas ya acepta ambos estados).
  if (
    contratacion.estado_periodo !== 'finalizado' &&
    contratacion.estado_periodo !== 'cancelado'
  ) {
    return err('contratacion_no_finalizada')
  }

  if (part.id_estudiante !== parsed.data.idEstudiante) {
    return err('invalid_input')
  }

  const { data: existing, error: existError } = await supabase
    .from('evaluaciones')
    .select('id_evaluacion')
    .eq('id_contratacion', parsed.data.idContratacion)
    .eq('id_empresario', empresario.id_empresario)
    .maybeSingle()

  if (existError) {
    logger.error('rateEgresado: fallo al validar duplicado', {
      error: existError.message,
    })
    return err('database_error')
  }

  if (existing) return err('ya_calificado')

  const { error: insertError } = await supabase.from('evaluaciones').insert({
    id_contratacion: parsed.data.idContratacion,
    id_empresario: empresario.id_empresario,
    id_estudiante: parsed.data.idEstudiante,
    puntuacion: parsed.data.puntuacion,
    comentario: parsed.data.comentario ?? null,
  })

  if (insertError) {
    if (insertError.code === '23505') return err('ya_calificado')
    logger.error('rateEgresado: inserción fallida', {
      error: insertError.message,
    })
    return err('database_error')
  }

  await notificarEvaluacionRecibida({
    destinatario: { rol: 'egresado', idEstudiante: parsed.data.idEstudiante },
    tituloProyecto: part.proyectos.titulo,
  })

  revalidatePath('/egresado/projects')
  revalidatePath('/empresario/portafolio-egresado')
  return ok(undefined)
}

export async function getEgresadoRatingForContract(
  idContratacion: string,
): Promise<Result<{ puntuacion: number; comentario: string | null } | null>> {
  if (!z.string().uuid().safeParse(idContratacion).success)
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

  const { data, error } = await supabase
    .from('evaluaciones')
    .select('puntuacion, comentario')
    .eq('id_contratacion', idContratacion)
    .eq('id_empresario', empresario.id_empresario)
    .maybeSingle()

  if (error) {
    logger.error('getEgresadoRatingForContract: fallo en consulta', {
      error: error.message,
    })
    return err('database_error')
  }

  return ok(data ?? null)
}

export async function getReceivedRatingFromEmpresa(
  idContratacion: string,
): Promise<
  Result<{
    id_evaluacion: string
    puntuacion: number
    comentario: string | null
    respuesta_evaluado: string | null
  } | null>
> {
  if (!z.string().uuid().safeParse(idContratacion).success)
    return err('invalid_input')

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('evaluaciones')
    .select('id_evaluacion, puntuacion, comentario, respuesta_evaluado')
    .eq('id_contratacion', idContratacion)
    .maybeSingle()

  if (error) {
    logger.error('getReceivedRatingFromEmpresa: fallo en consulta', {
      error: error.message,
    })
    return err('database_error')
  }

  return ok(data ?? null)
}

const AddRespuestaSchema = z.object({
  idEvaluacion: z.string().uuid(),
  respuesta: z.string().min(1).max(1000),
})

export type AddRespuestaInput = z.infer<typeof AddRespuestaSchema>

export async function addRespuestaEvaluacion(
  input: AddRespuestaInput,
): Promise<Result<void>> {
  const parsed = AddRespuestaSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')

  // Defensa en profundidad (plan refactor-auth §8): un egresado des-verificado
  // no puede responder una calificación. La policy RLS de evaluaciones solo
  // cubre el INSERT del empresario, no este UPDATE, así que el gate va acá.
  const verified = await requireVerifiedEgresado()
  if (!verified.ok) return verified
  const idEstudiante = verified.data.id_estudiante

  const supabase = await createSupabaseServerClient()

  const { data: evaluacion, error: evError } = await supabase
    .from('evaluaciones')
    .select('id_evaluacion, respuesta_evaluado')
    .eq('id_evaluacion', parsed.data.idEvaluacion)
    .eq('id_estudiante', idEstudiante)
    .maybeSingle()

  if (evError || !evaluacion) return err('not_found')
  if (evaluacion.respuesta_evaluado !== null) return err('ya_respondido')

  const { error: updateError } = await supabase
    .from('evaluaciones')
    .update({ respuesta_evaluado: parsed.data.respuesta })
    .eq('id_evaluacion', parsed.data.idEvaluacion)
    .eq('id_estudiante', idEstudiante)

  if (updateError) {
    logger.error('addRespuestaEvaluacion: update fallido', {
      error: updateError.message,
    })
    return err('database_error')
  }

  revalidatePath('/egresado/projects')
  return ok(undefined)
}

export interface ContratacionConRating {
  id_contratacion: string
  id_participacion: string
  estado_periodo: string
  id_estudiante: string
  existingRating: { puntuacion: number; comentario: string | null } | null
}

export async function getContratacionConRatingByParticipacion(
  idParticipacion: string,
): Promise<Result<ContratacionConRating | null>> {
  if (!z.string().uuid().safeParse(idParticipacion).success)
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

  const { data: part, error: partError } = await supabase
    .from('participaciones')
    .select('id_estudiante')
    .eq('id_participacion', idParticipacion)
    .maybeSingle()

  if (partError) {
    logger.error(
      'getContratacionConRatingByParticipacion: participacion query failed',
      { error: partError.message },
    )
    return err('database_error')
  }
  if (!part) return ok(null)

  const { data: contratacion, error: contError } = await supabase
    .from('contrataciones')
    .select('id_contratacion, estado_periodo')
    .eq('id_participacion', idParticipacion)
    .maybeSingle()

  if (contError) {
    logger.error(
      'getContratacionConRatingByParticipacion: contratacion query failed',
      { error: contError.message },
    )
    return err('database_error')
  }
  if (!contratacion) return ok(null)

  const { data: rating } = await supabase
    .from('evaluaciones')
    .select('puntuacion, comentario')
    .eq('id_contratacion', contratacion.id_contratacion)
    .eq('id_empresario', empresario.id_empresario)
    .maybeSingle()

  return ok({
    id_contratacion: contratacion.id_contratacion,
    id_participacion: idParticipacion,
    estado_periodo: contratacion.estado_periodo,
    id_estudiante: part.id_estudiante,
    existingRating: rating ?? null,
  })
}

export interface CalificacionRecibida {
  id_evaluacion: string
  puntuacion: number
  comentario: string | null
  evaluado_at: string
  nombreEmpresa: string
  tituloProyecto: string
}

export async function getMisCalificacionesRecibidas(): Promise<
  Result<CalificacionRecibida[]>
> {
  const roleResult = await requireRole('egresado')
  if (!roleResult.ok) return err('forbidden')

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return err('unauthenticated')

  const { data: estudiante, error: estError } = await supabase
    .from('estudiantes')
    .select('id_estudiante')
    .eq('id_usuario', user.id)
    .maybeSingle()

  if (estError || !estudiante) return err('unauthorized')

  const { data, error } = await supabase
    .from('evaluaciones')
    .select(
      `
      id_evaluacion,
      puntuacion,
      comentario,
      evaluado_at,
      empresarios!inner(
        nombre_empresa,
        usuarios!empresarios_id_usuario_fkey(nombre, apellido_1)
      ),
      contrataciones!inner(
        participaciones!inner(
          proyectos!inner(titulo)
        )
      )
    `,
    )
    .eq('id_estudiante', estudiante.id_estudiante)
    .order('evaluado_at', { ascending: false })

  if (error) {
    logger.error('getMisCalificacionesRecibidas: fallo en consulta', {
      error: error.message,
    })
    return err('database_error')
  }

  const items: CalificacionRecibida[] = (data ?? []).map((row) => {
    const emp = row.empresarios
    const nombreEmpresa =
      emp.nombre_empresa ||
      [emp.usuarios?.nombre, emp.usuarios?.apellido_1].filter(Boolean).join(' ')

    const tituloProyecto =
      row.contrataciones?.participaciones?.proyectos?.titulo ?? ''

    return {
      id_evaluacion: row.id_evaluacion,
      puntuacion: row.puntuacion,
      comentario: row.comentario,
      evaluado_at: row.evaluado_at,
      nombreEmpresa,
      tituloProyecto,
    }
  })

  return ok(items)
}

export interface AdminEgresadoRatingItem {
  idEvaluacion: string
  idContratacion: string
  proyectoTitulo: string
  nombreEgresado: string
  nombreEmpresa: string
  puntuacion: number
  comentario: string | null
  evaluadoAt: string
}

/**
 * Lista todas las calificaciones empresa->egresado del sistema para el panel de
 * administración (pestaña Calificaciones en /admin/users). Usa el cliente
 * service-role (salta RLS) protegido por requireRole: los joins a
 * empresarios/usuarios/estudiantes están restringidos por RLS a "lo
 * propio/público", así que con el cliente RLS el `!inner` descartaría todo.
 */
export async function getAllEgresadoRatingsForAdmin(): Promise<
  Result<AdminEgresadoRatingItem[]>
> {
  const roleResult = await requireRole('administrador')
  if (!roleResult.ok) return err('forbidden')

  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('evaluaciones')
    .select(
      `
      id_evaluacion,
      id_contratacion,
      puntuacion,
      comentario,
      evaluado_at,
      estudiantes!inner(
        usuarios!estudiantes_id_usuario_fkey(
          nombre,
          apellido_1,
          apellido_2
        )
      ),
      empresarios!inner(
        nombre_empresa,
        usuarios!empresarios_id_usuario_fkey(
          nombre,
          apellido_1,
          apellido_2
        )
      ),
      contrataciones(
        participaciones(
          proyectos(
            titulo
          )
        )
      )
    `,
    )
    .order('evaluado_at', { ascending: false })

  if (error) {
    logger.error('getAllEgresadoRatingsForAdmin: fallo en consulta', {
      error: error.message,
    })
    return err('database_error')
  }

  const items: AdminEgresadoRatingItem[] = (data ?? []).map((row) => {
    const estUser = row.estudiantes.usuarios
    const nombreEgresado = [
      estUser.nombre,
      estUser.apellido_1,
      estUser.apellido_2,
    ]
      .filter(Boolean)
      .join(' ')

    const emp = row.empresarios
    const empUser = emp.usuarios
    const repName = [empUser.nombre, empUser.apellido_1, empUser.apellido_2]
      .filter(Boolean)
      .join(' ')
    const nombreEmpresa = emp.nombre_empresa || repName

    const proy = row.contrataciones?.participaciones?.proyectos
    const proyectoTitulo = proy?.titulo || ''

    return {
      idEvaluacion: row.id_evaluacion,
      idContratacion: row.id_contratacion,
      proyectoTitulo,
      nombreEgresado,
      nombreEmpresa,
      puntuacion: row.puntuacion,
      comentario: row.comentario,
      evaluadoAt: row.evaluado_at,
    }
  })

  return ok(items)
}
