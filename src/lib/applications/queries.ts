'use server'

import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/dal'
import { ok, err, type Result } from '@/lib/result'
import { logger } from '@/lib/logger'
import {
  computeEstadoParticipacionEfectivo,
  type EstadoParticipacion,
} from '@/lib/projects/project-detail-logic'
import type { PostulacionPropia } from '@/components/features/applications/PostulacionCard'

/** Estados en los que el egresado aún puede retirar su oferta (RF-31). */
const RETIRABLE_ESTADOS: EstadoParticipacion[] = ['enviada', 'en_revision']

export interface MisPostulacionesStats {
  total: number
  activas: number
  contratadas: number
}

export async function getMisPostulacionesStats(): Promise<
  Result<MisPostulacionesStats>
> {
  const user = await getCurrentUser()
  if (!user) return err('unauthorized')

  const supabase = await createSupabaseServerClient()

  const { data: estudiante, error: estError } = await supabase
    .from('estudiantes')
    .select('id_estudiante')
    .eq('id_usuario', user.id)
    .maybeSingle()

  if (estError) {
    logger.error('getMisPostulacionesStats: fallo al leer estudiante', {
      error: estError.message,
    })
    return err('unexpected')
  }

  if (!estudiante) return ok({ total: 0, activas: 0, contratadas: 0 })

  const { data, error } = await supabase
    .from('participaciones')
    .select('estado, proyectos(estado)')
    .eq('id_estudiante', estudiante.id_estudiante)

  if (error) {
    logger.error('getMisPostulacionesStats: fallo al contar', {
      error: error.message,
    })
    return err('unexpected')
  }

  // Estado EFECTIVO (RF-32): una oferta viva sobre un proyecto ya cerrado se
  // cuenta como cerrada, no como activa. Misma derivación que la lista.
  const estados = (data ?? []).map((f) => {
    const proyectoEstado = f.proyectos?.estado ?? null
    return proyectoEstado
      ? computeEstadoParticipacionEfectivo(f.estado, proyectoEstado)
      : f.estado
  })
  const total = estados.length
  const activas = estados.filter(
    (e) => e === 'enviada' || e === 'en_revision',
  ).length
  const contratadas = estados.filter(
    (e) => e === 'contratada' || e === 'finalizada',
  ).length

  return ok({ total, activas, contratadas })
}

/**
 * Lista las postulaciones del egresado autenticado para la pantalla "mis
 * postulaciones" (RF-30). Lectura server-side: el browser client colgaba en
 * `auth.getUser()`, así que el fetch vive en el servidor y la página solo
 * recibe los datos ya resueltos.
 */
export async function getMisPostulaciones(): Promise<
  Result<PostulacionPropia[]>
> {
  const user = await getCurrentUser()
  if (!user) return err('unauthorized')

  const supabase = await createSupabaseServerClient()

  const { data: estudiante, error: estError } = await supabase
    .from('estudiantes')
    .select('id_estudiante')
    .eq('id_usuario', user.id)
    .maybeSingle()

  if (estError) {
    logger.error('getMisPostulaciones: fallo al leer estudiante', {
      error: estError.message,
    })
    return err('unexpected')
  }

  if (!estudiante) return ok([])

  const { data, error } = await supabase
    .from('participaciones')
    .select(
      `
      id_participacion,
      id_proyecto,
      estado,
      fecha_postulacion,
      revision_iniciada_at,
      adjudicada_at,
      no_seleccionada_at,
      retirada_at,
      proyectos (
        titulo,
        estado,
        id_empresario,
        empresarios (
          nombre_empresa
        )
      )
    `,
    )
    .eq('id_estudiante', estudiante.id_estudiante)
    .order('fecha_postulacion', { ascending: false })

  if (error) {
    logger.error('getMisPostulaciones: fallo al leer participaciones', {
      error: error.message,
    })
    return err('unexpected')
  }

  const postulaciones: PostulacionPropia[] = (data ?? []).map((p) => {
    const companyName = Array.isArray(p.proyectos?.empresarios)
      ? (p.proyectos?.empresarios[0]?.nombre_empresa ?? 'Empresa Desconocida')
      : (p.proyectos?.empresarios?.nombre_empresa ?? 'Empresa Desconocida')

    const proyectoEstado = p.proyectos?.estado ?? null

    return {
      id_participacion: p.id_participacion,
      id_proyecto: p.id_proyecto,
      projectTitle: p.proyectos?.titulo ?? 'Proyecto Desconocido',
      companyName,
      estado: p.estado,
      estadoEfectivo: proyectoEstado
        ? computeEstadoParticipacionEfectivo(p.estado, proyectoEstado)
        : p.estado,
      fecha_postulacion: p.fecha_postulacion,
      revisionIniciadaAt: p.revision_iniciada_at,
      adjudicadaAt: p.adjudicada_at,
      noSeleccionadaAt: p.no_seleccionada_at,
      retiradaAt: p.retirada_at,
    }
  })

  return ok(postulaciones)
}

/** Detalle de una postulación del egresado para `/egresado/applications/[id]`. */
export interface MiPostulacionDetalle {
  idParticipacion: string
  idProyecto: string
  projectTitle: string
  companyName: string
  estado: EstadoParticipacion
  estadoEfectivo: EstadoParticipacion
  fechaPostulacion: string
  revisionIniciadaAt: string | null
  adjudicadaAt: string | null
  noSeleccionadaAt: string | null
  retiradaAt: string | null
  cartaPostulacion: string | null
  planteamientoSolucion: string | null
  prototipoEnlaces: string[]
  urlRepositorioProyecto: string | null
  tieneDocumentacion: boolean
  /** El egresado todavía puede retirar (RF-31); la action revalida el plazo. */
  canWithdraw: boolean
}

/**
 * Detalle de UNA postulación del egresado autenticado (RF-30). Lectura bajo RLS +
 * doble filtro por `id_estudiante`: solo devuelve la fila si es SUYA. Trae los
 * timestamps para el stepper fechado y el recap de lo que envió (su propia data).
 */
export async function getMiPostulacion(
  idParticipacion: string,
): Promise<Result<MiPostulacionDetalle>> {
  if (!z.string().uuid().safeParse(idParticipacion).success) {
    return err('invalid_input')
  }

  const user = await getCurrentUser()
  if (!user) return err('unauthorized')

  const supabase = await createSupabaseServerClient()

  const { data: estudiante, error: estError } = await supabase
    .from('estudiantes')
    .select('id_estudiante')
    .eq('id_usuario', user.id)
    .maybeSingle()

  if (estError) {
    logger.error('getMiPostulacion: fallo al leer estudiante', {
      error: estError.message,
    })
    return err('unexpected')
  }
  if (!estudiante) return err('not_found')

  const { data, error } = await supabase
    .from('participaciones')
    .select(
      `
      id_participacion,
      id_proyecto,
      estado,
      fecha_postulacion,
      revision_iniciada_at,
      adjudicada_at,
      no_seleccionada_at,
      retirada_at,
      carta_postulacion,
      planteamiento_solucion,
      prototipo_enlaces,
      url_repositorio_proyecto,
      documentacion_tecnica,
      proyectos (
        titulo,
        estado,
        empresarios (
          nombre_empresa
        )
      )
    `,
    )
    .eq('id_participacion', idParticipacion)
    .eq('id_estudiante', estudiante.id_estudiante)
    .maybeSingle()

  if (error) {
    logger.error('getMiPostulacion: fallo al leer participación', {
      error: error.message,
    })
    return err('unexpected')
  }
  if (!data) return err('not_found')

  const companyName = Array.isArray(data.proyectos?.empresarios)
    ? (data.proyectos?.empresarios[0]?.nombre_empresa ?? 'Empresa Desconocida')
    : (data.proyectos?.empresarios?.nombre_empresa ?? 'Empresa Desconocida')

  const proyectoEstado = data.proyectos?.estado ?? null
  const estadoEfectivo = proyectoEstado
    ? computeEstadoParticipacionEfectivo(data.estado, proyectoEstado)
    : data.estado

  return ok({
    idParticipacion: data.id_participacion,
    idProyecto: data.id_proyecto,
    projectTitle: data.proyectos?.titulo ?? 'Proyecto Desconocido',
    companyName,
    estado: data.estado,
    estadoEfectivo,
    fechaPostulacion: data.fecha_postulacion,
    revisionIniciadaAt: data.revision_iniciada_at,
    adjudicadaAt: data.adjudicada_at,
    noSeleccionadaAt: data.no_seleccionada_at,
    retiradaAt: data.retirada_at,
    cartaPostulacion: data.carta_postulacion,
    planteamientoSolucion: data.planteamiento_solucion,
    prototipoEnlaces: data.prototipo_enlaces ?? [],
    urlRepositorioProyecto: data.url_repositorio_proyecto,
    tieneDocumentacion: Boolean(data.documentacion_tecnica),
    canWithdraw: RETIRABLE_ESTADOS.includes(estadoEfectivo),
  })
}
