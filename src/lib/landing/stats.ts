import 'server-only'
import { unstable_cache } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export interface LandingStats {
  proyectos: number
  estudiantes: number
  empresarios: number
}

const EMPTY_STATS: LandingStats = {
  proyectos: 0,
  estudiantes: 0,
  empresarios: 0,
}

const LANDING_STATS_TAG = 'landing-stats'
const LANDING_STATS_REVALIDATE_SECONDS = 3600

/**
 * Conteos reales para los stats de la landing pública. Usa el cliente de
 * servicio (server-only) porque la landing no tiene sesión y la RLS de
 * `estudiantes`/`empresarios`/`proyectos` exige `authenticated` (el rol `anon`
 * no puede contar). Cuenta con `count: 'exact', head: true` (no trae filas).
 * Proyectos = visibles públicamente (`is_active` y no borrador).
 *
 * NOTA: los conteos incluyen registros de prueba (empresas de prueba, etc.)
 * hasta la limpieza de BD diferida; se autocorrigen en la próxima
 * revalidación, o de inmediato con `revalidateTag('landing-stats')`.
 */
async function computeLandingStats(): Promise<LandingStats> {
  try {
    const admin = createSupabaseAdminClient()
    const [estudiantes, empresarios, proyectos] = await Promise.all([
      admin.from('estudiantes').select('*', { count: 'exact', head: true }),
      admin.from('empresarios').select('*', { count: 'exact', head: true }),
      admin
        .from('proyectos')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .neq('estado', 'borrador'),
    ])

    const failed = [estudiantes, empresarios, proyectos].find((r) => r.error)
    if (failed?.error) {
      logger.error('getLandingStats: fallo al contar', {
        error: failed.error.message,
      })
      return EMPTY_STATS
    }

    return {
      estudiantes: estudiantes.count ?? 0,
      empresarios: empresarios.count ?? 0,
      proyectos: proyectos.count ?? 0,
    }
  } catch (error) {
    logger.error('getLandingStats: excepción', {
      error: error instanceof Error ? error.message : String(error),
    })
    return EMPTY_STATS
  }
}

/**
 * Versión cacheada (revalida cada hora) para mantener la landing estática/ISR
 * en vez de dinámica por request. La función cacheada solo devuelve números
 * serializables.
 */
export const getLandingStats = unstable_cache(
  computeLandingStats,
  ['landing-stats'],
  { revalidate: LANDING_STATS_REVALIDATE_SECONDS, tags: [LANDING_STATS_TAG] },
)
