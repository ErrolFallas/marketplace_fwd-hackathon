import 'server-only'

import { unstable_rethrow } from 'next/navigation'
import type { QueryData } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ok, err, type Result } from '@/lib/result'
import type { Project } from '@/types'
import { logger } from '@/lib/logger'
import { estadoToStatus } from './status'
import { durationInDays } from './duration'
import {
  calculateMatchScore,
  type MatchProjectTech,
  type MatchStudentSkill,
} from './match-logic'

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

const PROYECTO_SELECT = `
  *,
  proyecto_tecnologias (
    id_tecnologia,
    tecnologias (nombre)
  )
` as const

function selectProyectos(supabase: ServerClient) {
  return supabase.from('proyectos').select(PROYECTO_SELECT)
}

type ProyectoRow = QueryData<ReturnType<typeof selectProyectos>>[number]

/**
 * Nombres de empresa para un conjunto de empresarios, vía la vista
 * `empresarios_public` (expone solo id + nombre, saltando la RLS de
 * `empresarios` de forma acotada — ver migración empresarios_public_view).
 * Si la vista todavía no existe (migración sin aplicar) o falla, se loguea y
 * se devuelve un mapa vacío: los proyectos cargan igual, sin nombre.
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
    logger.error('Error fetching company names', { error: error.message })
    return names
  }

  for (const row of data) {
    if (row.id_empresario && row.nombre_empresa) {
      names.set(row.id_empresario, row.nombre_empresa)
    }
  }
  return names
}

/** Mapea una fila de Supabase (tipo inferido del `.select`) a la interfaz `Project`. */
function mapProject(
  row: ProyectoRow,
  companyNames: Map<string, string>,
  studentSkills?: MatchStudentSkill[],
): Project {
  const stack: string[] = []
  const projectTechs: MatchProjectTech[] = []

  // `requerimientos_funcionales` es jsonb (array de strings); se filtra por si
  // llega algo no-string desde la BD.
  const requerimientosFuncionales = Array.isArray(
    row.requerimientos_funcionales,
  )
    ? row.requerimientos_funcionales.filter(
        (rf): rf is string => typeof rf === 'string',
      )
    : []

  for (const pt of row.proyecto_tecnologias) {
    if (pt.tecnologias?.nombre) stack.push(pt.tecnologias.nombre)
    projectTechs.push({
      id_tecnologia: pt.id_tecnologia,
      nombre_tecnologia: pt.tecnologias?.nombre,
    })
  }

  let matchScore: number | undefined
  let matchDetalles: import('./match-logic').MatchDetail[] | undefined

  if (studentSkills && projectTechs.length > 0) {
    const match = calculateMatchScore(studentSkills, projectTechs)
    matchScore = match.score
    matchDetalles = match.detalles
  }

  return {
    id: row.id_proyecto,
    title: row.titulo,
    companyId: row.id_empresario,
    // El nombre viene de la vista empresarios_public (la RLS de empresarios
    // bloquea el join directo). Si falta, la UI rotula el vacío vía i18n
    // (sin string hardcodeado acá, reglas.md §4).
    companyName: companyNames.get(row.id_empresario) ?? '',
    description: row.descripcion,
    requerimientosFuncionales,
    stack,
    durationDays: durationInDays(row.fecha_publicacion, row.fecha_cierre),
    budget: row.presupuesto_max ?? row.presupuesto_min ?? 0,
    currency: row.moneda,
    budgetMin: row.presupuesto_min,
    budgetMax: row.presupuesto_max,
    mode: row.modalidad,
    countryIso: row.pais_iso_proyecto,
    region: row.region_proyecto,
    startDate: row.fecha_publicacion
      ? new Date(row.fecha_publicacion).toISOString()
      : row.created_at,
    closingDate: row.fecha_cierre,
    status: estadoToStatus(row.estado),
    createdAt: row.created_at,
    matchScore,
    matchDetalles,
  }
}

/**
 * Proyectos activos del marketplace (estados `abierto` o `en_recepcion`).
 */
export async function getMarketplaceProjects(): Promise<
  Result<Project[], string>
> {
  try {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await selectProyectos(supabase)
      .eq('is_active', true)
      .in('estado', ['abierto', 'en_recepcion'])
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching marketplace projects', {
        error: error.message,
      })
      return err('database_error')
    }

    // Attempt to fetch student skills if user is an egresado
    let studentSkills: MatchStudentSkill[] = []
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        const { data: estData } = await supabase
          .from('estudiantes')
          .select('id_estudiante')
          .eq('id_usuario', userData.user.id)
          .maybeSingle()

        if (estData) {
          const { data: skillsData } = await supabase
            .from('habilidades_tecnicas')
            .select('id_tecnologia, nivel')
            .eq('id_estudiante', estData.id_estudiante)
          if (skillsData) {
            studentSkills = skillsData as MatchStudentSkill[]
          }
        }
      }
    } catch (skillsError) {
      // Anónimos / no-egresados no tienen skills y se continúa sin match; un
      // fallo real de BD se registra en vez de tragarse (reglas.md §8).
      logger.warn('getMarketplaceProjects: no se pudieron leer skills', {
        error:
          skillsError instanceof Error
            ? skillsError.message
            : String(skillsError),
      })
    }

    const empresarioIds = [...new Set(data.map((row) => row.id_empresario))]
    const companyNames = await fetchCompanyNames(supabase, empresarioIds)

    return ok(data.map((row) => mapProject(row, companyNames, studentSkills)))
  } catch (error) {
    unstable_rethrow(error)
    logger.error('Unexpected error fetching marketplace projects', { error })
    return err('unexpected_error')
  }
}

/**
 * Detalle de un proyecto específico.
 */
export async function getMarketplaceProjectById(
  id: string,
  context?: string,
): Promise<Result<Project, string>> {
  try {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await selectProyectos(supabase)
      .eq('id_proyecto', id)
      .maybeSingle()

    if (error) {
      logger.error('Error fetching project by ID', { id, error: error.message })
      return err('database_error')
    }

    // maybeSingle() devuelve null (sin error) cuando el proyecto no existe o el
    // RLS lo oculta (p. ej. un no-participante abriendo un proyecto no publicado):
    // es un not_found legítimo, se registra como warn para no ensuciar el canal
    // de error con lo que en realidad es un 404 esperado.
    if (!data) {
      logger.warn(
        'getMarketplaceProjectById: proyecto no visible o inexistente',
        {
          id,
          context,
        },
      )
      return err('not_found')
    }

    let studentSkills: MatchStudentSkill[] = []
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        const { data: estData } = await supabase
          .from('estudiantes')
          .select('id_estudiante')
          .eq('id_usuario', userData.user.id)
          .maybeSingle()

        if (estData) {
          const { data: skillsData } = await supabase
            .from('habilidades_tecnicas')
            .select('id_tecnologia, nivel')
            .eq('id_estudiante', estData.id_estudiante)
          if (skillsData) {
            studentSkills = skillsData as MatchStudentSkill[]
          }
        }
      }
    } catch (skillsError) {
      // Anónimos / no-egresados no tienen skills y se continúa sin match; un
      // fallo real de BD se registra en vez de tragarse (reglas.md §8).
      logger.warn('getMarketplaceProjectById: no se pudieron leer skills', {
        error:
          skillsError instanceof Error
            ? skillsError.message
            : String(skillsError),
      })
    }

    const companyNames = await fetchCompanyNames(supabase, [data.id_empresario])
    return ok(mapProject(data, companyNames, studentSkills))
  } catch (error) {
    unstable_rethrow(error)
    logger.error('Unexpected error fetching project by id', { error })
    return err('unexpected_error')
  }
}

/**
 * Verifica si el egresado actual ya aplicó a este proyecto.
 */
export async function checkIfApplied(
  projectId: string,
): Promise<Result<boolean, string>> {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) return err('unauthenticated')

    const { data: estudiante, error: estError } = await supabase
      .from('estudiantes')
      .select('id_estudiante')
      .eq('id_usuario', userData.user.id)
      .single()

    if (estError || !estudiante) return err('estudiante_not_found')

    const { data: participacion, error: partError } = await supabase
      .from('participaciones')
      .select('id_participacion')
      .eq('id_proyecto', projectId)
      .eq('id_estudiante', estudiante.id_estudiante)
      .maybeSingle()

    if (partError) {
      logger.error('Error checking application status', {
        error: partError.message,
      })
      return err('database_error')
    }

    return ok(!!participacion)
  } catch (error) {
    unstable_rethrow(error)
    logger.error('Unexpected error checking application status', { error })
    return err('unexpected_error')
  }
}
