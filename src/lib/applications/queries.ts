'use server'

import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
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

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

/**
 * Nombres de empresa vía la vista `empresarios_public`. La RLS de `empresarios`
 * bloquea el join directo desde la sesión del egresado (mismo motivo que en
 * `marketplace.ts`), así que el nombre se resuelve aparte por la vista, que solo
 * expone id + nombre. Si la vista falla o no trae el nombre, se devuelve el mapa
 * como esté y la UI rotula el vacío vía i18n (sin string hardcodeado, reglas §4).
 */
async function fetchCompanyNames(
  supabase: ServerClient,
  empresarioIds: readonly string[],
): Promise<Map<string, string>> {
  const names = new Map<string, string>()
  if (empresarioIds.length === 0) return names

  const { data, error } = await supabase
    .from('empresarios_public')
    .select('id_empresario, nombre_empresa')
    .in('id_empresario', [...empresarioIds])

  if (error) {
    logger.error('fetchCompanyNames: fallo al leer empresarios_public', {
      error: error.message,
    })
    return names
  }

  for (const row of data ?? []) {
    if (row.id_empresario && row.nombre_empresa) {
      names.set(row.id_empresario, row.nombre_empresa)
    }
  }
  return names
}

/**
 * Logos de empresa vía admin client. La vista `empresarios_public` solo expone
 * id + nombre; el campo `logo` requiere acceso directo a `empresarios`, que la
 * RLS bloquea para el egresado. Se usa el admin client igual que en
 * `deliverables/queries.ts` (getMisContrataciones). Best-effort: si falla,
 * devuelve el mapa vacío y la UI muestra iniciales en lugar del logo.
 */
async function fetchCompanyLogos(
  empresarioIds: readonly string[],
): Promise<Map<string, string | null>> {
  const logos = new Map<string, string | null>()
  if (empresarioIds.length === 0) return logos

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('empresarios')
    .select('id_empresario, logo')
    .in('id_empresario', [...empresarioIds])

  if (error) {
    logger.error('fetchCompanyLogos: fallo al leer logos de empresarios', {
      error: error.message,
    })
    return logos
  }

  for (const row of data ?? []) {
    if (row.id_empresario) {
      logos.set(row.id_empresario, row.logo ?? null)
    }
  }
  return logos
}

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
        id_empresario
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

  const rows = data ?? []
  const empresarioIds = [
    ...new Set(
      rows
        .map((p) => p.proyectos?.id_empresario)
        .filter((id): id is string => Boolean(id)),
    ),
  ]
  const [companyNames, companyLogos] = await Promise.all([
    fetchCompanyNames(supabase, empresarioIds),
    fetchCompanyLogos(empresarioIds),
  ])

  const postulaciones: PostulacionPropia[] = rows.map((p) => {
    const proyectoEstado = p.proyectos?.estado ?? null
    const idEmpresario = p.proyectos?.id_empresario ?? null

    return {
      id_participacion: p.id_participacion,
      id_proyecto: p.id_proyecto,
      projectTitle: p.proyectos?.titulo ?? '',
      companyName: idEmpresario ? (companyNames.get(idEmpresario) ?? '') : '',
      companyLogo: idEmpresario
        ? (companyLogos.get(idEmpresario) ?? null)
        : null,
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
  companyLogo: string | null
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
        id_empresario
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

  const idEmpresario = data.proyectos?.id_empresario ?? null
  const ids = idEmpresario ? [idEmpresario] : []
  const [companyNames, companyLogos] = await Promise.all([
    fetchCompanyNames(supabase, ids),
    fetchCompanyLogos(ids),
  ])
  const companyName = idEmpresario ? (companyNames.get(idEmpresario) ?? '') : ''
  const companyLogo = idEmpresario
    ? (companyLogos.get(idEmpresario) ?? null)
    : null

  const proyectoEstado = data.proyectos?.estado ?? null
  const estadoEfectivo = proyectoEstado
    ? computeEstadoParticipacionEfectivo(data.estado, proyectoEstado)
    : data.estado

  return ok({
    idParticipacion: data.id_participacion,
    idProyecto: data.id_proyecto,
    projectTitle: data.proyectos?.titulo ?? '',
    companyName,
    companyLogo,
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
