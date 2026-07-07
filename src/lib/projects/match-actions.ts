import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Result, ok, err } from '@/lib/result'
import { logger } from '@/lib/logger'
import {
  calculateMatchScore,
  type MatchStudentSkill,
  type MatchProjectTech,
  type MatchDetail,
  type MatchBreakdown,
  type HistorialContrato,
} from './match-logic'
import {
  getPublicStudentProfile,
  type StudentProfileView,
} from '@/lib/portfolio/actions'

export interface MatchStudentItem {
  profile: StudentProfileView
  matchScore: number
  matchDetalles: MatchDetail[]
  matchDesglose: MatchBreakdown
}

export interface GetProjectMatchesResponse {
  items: MatchStudentItem[]
  totalCount: number
}

/**
 * Egresados con afinidad > 0 para el proyecto dado, paginados y ordenados por
 * afinidad (0–100) con desempate determinista (reputación, luego id). El score
 * pondera tecnología + ubicación (según modalidad) y ajusta por el historial de
 * contratos previos con este mismo empresario. Devuelve el perfil completo para
 * pintarlo en PortfolioViewer.
 */
export async function getProjectMatches(
  projectId: string,
  page: number = 1,
  pageSize: number = 1, // Paginación singular por defecto
): Promise<Result<GetProjectMatchesResponse>> {
  try {
    const supabase = await createSupabaseServerClient()

    // 1. Datos del proyecto: empresario dueño, modalidad y ubicación.
    const { data: proyecto, error: proyectoError } = await supabase
      .from('proyectos')
      .select('id_empresario, modalidad, pais_iso_proyecto, region_proyecto')
      .eq('id_proyecto', projectId)
      .maybeSingle()

    if (proyectoError) {
      logger.error('Error fetching project for matches', {
        error: proyectoError.message,
      })
      return err(proyectoError.message)
    }
    if (!proyecto) return ok({ items: [], totalCount: 0 })

    // 2. Tecnologías del proyecto. Sin tecnologías no hay afinidad que calcular.
    const { data: projectData, error: projectError } = await supabase
      .from('proyecto_tecnologias')
      .select('id_tecnologia, tecnologias(nombre)')
      .eq('id_proyecto', projectId)

    if (projectError) {
      logger.error('Error fetching project technologies for matches', {
        error: projectError,
      })
      return err(projectError.message)
    }
    if (!projectData || projectData.length === 0) {
      return ok({ items: [], totalCount: 0 })
    }

    const projectTechs: MatchProjectTech[] = projectData.map((pt) => ({
      id_tecnologia: pt.id_tecnologia,
      nombre_tecnologia: (pt.tecnologias as { nombre: string } | null)?.nombre,
    }))

    // 3. Estudiantes públicos con habilidades, ubicación y reputación.
    const { data: studentsData, error: studentsError } = await supabase
      .from('estudiantes')
      .select(
        `
        id_estudiante,
        reputacion,
        pais_iso_residencia,
        region_residencia,
        habilidades_tecnicas(id_tecnologia, nivel)
      `,
      )
      .eq('portafolio_visible_publicamente', true)

    if (studentsError) {
      logger.error('Error fetching public students for matches', {
        error: studentsError,
      })
      return err(studentsError.message)
    }

    // 4. Historial de contratos de este empresario con cada egresado.
    const historialPorEstudiante = new Map<string, HistorialContrato>()
    const { data: histData, error: histError } = await supabase
      .from('contrataciones')
      .select(
        'estado_periodo, participaciones!inner(id_estudiante, proyectos!inner(id_empresario))',
      )
      .in('estado_periodo', ['finalizado', 'cancelado'])
      .eq('participaciones.proyectos.id_empresario', proyecto.id_empresario)

    if (histError) {
      // No es fatal: sin historial, el factor queda 'ninguno' para todos.
      logger.warn('getProjectMatches: no se pudo leer historial', {
        error: histError.message,
      })
    } else {
      for (const row of histData ?? []) {
        const idEstudiante = row.participaciones?.id_estudiante
        if (!idEstudiante) continue
        const desenlace: HistorialContrato =
          row.estado_periodo === 'cancelado' ? 'cancelada' : 'finalizada'
        if (
          desenlace === 'cancelada' ||
          !historialPorEstudiante.has(idEstudiante)
        ) {
          historialPorEstudiante.set(idEstudiante, desenlace)
        }
      }
    }

    // 5. Calcular afinidad por estudiante (descarta score 0).
    const matches: {
      id_estudiante: string
      reputacion: number
      score: number
      detalles: MatchDetail[]
      desglose: MatchBreakdown
    }[] = []

    for (const row of studentsData ?? []) {
      const skills = (row.habilidades_tecnicas ?? []) as MatchStudentSkill[]
      const { score, detalles, desglose } = calculateMatchScore({
        studentSkills: skills,
        projectTechs,
        modalidad: proyecto.modalidad,
        projectLocation: {
          paisIso: proyecto.pais_iso_proyecto,
          region: proyecto.region_proyecto,
        },
        studentLocation: {
          paisIso: row.pais_iso_residencia,
          region: row.region_residencia,
        },
        historial: historialPorEstudiante.get(row.id_estudiante) ?? 'ninguno',
      })

      if (score > 0) {
        matches.push({
          id_estudiante: row.id_estudiante,
          reputacion: row.reputacion ?? 0,
          score,
          detalles,
          desglose,
        })
      }
    }

    // 6. Orden determinista: afinidad, luego reputación, luego id (estable).
    matches.sort(
      (a, b) =>
        b.score - a.score ||
        b.reputacion - a.reputacion ||
        a.id_estudiante.localeCompare(b.id_estudiante),
    )

    // 7. Paginar y traer perfiles completos solo de la página actual.
    const totalCount = matches.length
    const startIndex = (page - 1) * pageSize
    const paginatedItems = matches.slice(startIndex, startIndex + pageSize)

    const fullProfiles: MatchStudentItem[] = []
    for (const item of paginatedItems) {
      const profileResult = await getPublicStudentProfile(item.id_estudiante)
      if (profileResult.ok && profileResult.data) {
        fullProfiles.push({
          profile: profileResult.data,
          matchScore: item.score,
          matchDetalles: item.detalles,
          matchDesglose: item.desglose,
        })
      }
    }

    return ok({
      items: fullProfiles,
      totalCount,
    })
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    logger.error('getProjectMatches: unexpected error', { error: errorMsg })
    return err(errorMsg)
  }
}
