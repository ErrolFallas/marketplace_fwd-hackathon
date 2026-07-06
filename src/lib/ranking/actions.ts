import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { Result, ok, err } from '@/lib/result'
import { logger } from '@/lib/logger'
import { Database } from '@/types/database'

export type TituloFwd = Database['public']['Enums']['titulo_fwd_enum']

/**
 * Máximo de posiciones que expone cualquier ranking: la UI muestra el top 3 y
 * "Ver más" expande hasta este tope, nunca más.
 */
export const RANKING_MAX_RESULTS = 10

export interface TalentRankingItem {
  idEstudiante: string
  nombreCompleto: string
  fotoPerfil: string | null
  tituloFwd: TituloFwd | null
  reputacion: number
  tecnologias: string[]
}

export interface CompanyRankingItem {
  idEmpresario: string
  nombreEmpresa: string
  logo: string | null
  reputacion: number
}

/**
 * Top de egresados por reputación. Solo incluye a quienes tienen calificación
 * (`reputacion > 0`): los perfiles nuevos sin evaluaciones quedan fuera. El
 * desempate es determinista (reputación y luego `id_estudiante`) para que el
 * orden no "baile" entre recargas. Usa el cliente service-role porque la RLS
 * restringe la lectura cruzada de estudiantes/usuarios.
 */
export async function getTopTalents(
  limit: number = RANKING_MAX_RESULTS,
): Promise<Result<TalentRankingItem[]>> {
  try {
    const supabase = createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('estudiantes')
      .select(
        `
        id_estudiante,
        reputacion,
        titulo_fwd,
        usuarios!estudiantes_id_usuario_fkey!inner(nombre, apellido_1, apellido_2, foto_perfil),
        habilidades_tecnicas(tecnologias(nombre))
      `,
      )
      .eq('portafolio_visible_publicamente', true)
      .gt('reputacion', 0)
      .order('reputacion', { ascending: false, nullsFirst: false })
      .order('id_estudiante', { ascending: true })
      .limit(limit)

    if (error) {
      logger.error('getTopTalents: query failed', { error: error.message })
      return err('database_error')
    }

    type DbRow = {
      id_estudiante: string
      reputacion: number | null
      titulo_fwd: TituloFwd | null
      usuarios: {
        nombre: string | null
        apellido_1: string | null
        apellido_2: string | null
        foto_perfil: string | null
      } | null
      habilidades_tecnicas:
        | {
            tecnologias: { nombre: string } | null
          }[]
        | null
    }

    const items: TalentRankingItem[] = (data ?? []).map((rawRow: unknown) => {
      const row = rawRow as DbRow
      const nombreCompleto = [
        row.usuarios?.nombre,
        row.usuarios?.apellido_1,
        row.usuarios?.apellido_2,
      ]
        .filter(Boolean)
        .join(' ')
        .trim()

      const tecnologias = (row.habilidades_tecnicas ?? [])
        .map((h) => h.tecnologias?.nombre)
        .filter((nombre): nombre is string => Boolean(nombre))

      return {
        idEstudiante: row.id_estudiante,
        nombreCompleto,
        fotoPerfil: row.usuarios?.foto_perfil ?? null,
        tituloFwd: row.titulo_fwd,
        reputacion: row.reputacion ?? 0,
        tecnologias,
      }
    })

    return ok(items)
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    logger.error('getTopTalents: unexpected error', { error: errorMsg })
    return err(errorMsg)
  }
}

/**
 * Top de empresas por reputación (`empresarios.reputacion`, promedio mantenido
 * de `evaluaciones_empresarios`). Mismas reglas que el talento: solo con
 * calificación (`reputacion > 0`) y desempate determinista. El nombre cae al del
 * representante si `nombre_empresa` es nulo, igual que el perfil público.
 */
export async function getTopCompanies(
  limit: number = RANKING_MAX_RESULTS,
): Promise<Result<CompanyRankingItem[]>> {
  try {
    const supabase = createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('empresarios')
      .select(
        `
        id_empresario,
        nombre_empresa,
        logo,
        reputacion,
        usuarios!empresarios_id_usuario_fkey(nombre, apellido_1, apellido_2)
      `,
      )
      .gt('reputacion', 0)
      .order('reputacion', { ascending: false, nullsFirst: false })
      .order('id_empresario', { ascending: true })
      .limit(limit)

    if (error) {
      logger.error('getTopCompanies: query failed', { error: error.message })
      return err('database_error')
    }

    type DbRow = {
      id_empresario: string
      nombre_empresa: string | null
      logo: string | null
      reputacion: number | null
      usuarios: {
        nombre: string | null
        apellido_1: string | null
        apellido_2: string | null
      } | null
    }

    const items: CompanyRankingItem[] = (data ?? []).map((rawRow: unknown) => {
      const row = rawRow as DbRow
      const repName = [
        row.usuarios?.nombre,
        row.usuarios?.apellido_1,
        row.usuarios?.apellido_2,
      ]
        .filter(Boolean)
        .join(' ')
        .trim()

      return {
        idEmpresario: row.id_empresario,
        nombreEmpresa: row.nombre_empresa ?? repName,
        logo: row.logo,
        reputacion: row.reputacion ?? 0,
      }
    })

    return ok(items)
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    logger.error('getTopCompanies: unexpected error', { error: errorMsg })
    return err(errorMsg)
  }
}
