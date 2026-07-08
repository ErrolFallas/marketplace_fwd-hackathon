import 'server-only'
import { after } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { ok, err, type Result } from '@/lib/result'
import { logger } from '@/lib/logger'
import { getModeradorProvider } from './provider'
import {
  hashContenido,
  esAnalizable,
  debeGenerarReporte,
  construirReporteIa,
} from './moderation-logic'
import type { EntidadModerable } from './types'

/**
 * Orquestador del agente moderador. Se invoca best-effort (típicamente desde
 * `after()` de Next, tras un insert de contenido) con el AUTOR ya resuelto por el
 * sitio que escribe. NUNCA lanza: captura todo y devuelve Result, para no romper
 * la acción de usuario que lo disparó.
 *
 * Resiliencia: antes de llamar al LLM marca el contenido como 'pendiente' en el
 * ledger. Si el proceso muere a mitad, la fila queda 'pendiente' y el botón
 * "Escanear pendientes" la reprocesa. El dedup por (entidad, id_entidad, hash)
 * evita re-analizar lo idéntico; editar el texto cambia el hash y sí se re-analiza.
 */

const CLAVE_ACTIVO = 'moderador_ia_activo'

type AdminClient = ReturnType<typeof createSupabaseAdminClient>

export type ResultadoModeracion =
  | 'inactivo'
  | 'omitido'
  | 'duplicado'
  | 'sin_hallazgos'
  | 'reportado'

export interface ModerarContenidoInput {
  entidad: EntidadModerable
  idEntidad: string
  texto: string
  /** id_usuario del autor del texto (lo conoce el sitio de escritura). */
  idAutor: string
}

/** El agente está activo salvo que la clave exista y valga explícitamente 'false'. */
async function estaActivo(admin: AdminClient): Promise<boolean> {
  const { data } = await admin
    .from('configuracion_sistema')
    .select('valor')
    .eq('clave', CLAVE_ACTIVO)
    .maybeSingle()
  return data?.valor !== 'false'
}

export async function moderarContenido(
  input: ModerarContenidoInput,
): Promise<Result<ResultadoModeracion>> {
  const { entidad, idEntidad, texto, idAutor } = input
  try {
    const admin = createSupabaseAdminClient()

    if (!(await estaActivo(admin))) return ok('inactivo')

    const hash = hashContenido(texto)

    if (!esAnalizable(texto)) {
      await admin.from('moderacion_ia_analisis').insert({
        entidad,
        id_entidad: idEntidad,
        content_hash: hash,
        estado: 'omitido',
        analizado_at: new Date().toISOString(),
      })
      return ok('omitido')
    }

    // Dedup: ¿ya se analizó este contenido exacto?
    const { data: previo } = await admin
      .from('moderacion_ia_analisis')
      .select('id_analisis, estado')
      .eq('entidad', entidad)
      .eq('id_entidad', idEntidad)
      .eq('content_hash', hash)
      .maybeSingle()
    if (
      previo &&
      previo.estado !== 'pendiente' &&
      previo.estado !== 'fallido'
    ) {
      return ok('duplicado')
    }

    // Marca 'pendiente' antes de llamar al LLM (resiliencia ante caídas).
    const idAnalisis = await marcarPendiente(admin, {
      entidad,
      idEntidad,
      hash,
      idPrevio: previo?.id_analisis ?? null,
    })
    if (!idAnalisis) return err('ledger_no_disponible')

    const provider = getModeradorProvider()
    let veredicto
    try {
      veredicto = await provider.moderar({ entidad, texto })
    } catch (e) {
      await cerrarLedger(admin, idAnalisis, {
        estado: 'fallido',
        error: e instanceof Error ? e.message : String(e),
        modelo: provider.modelId,
      })
      logger.error('moderarContenido: fallo del proveedor', {
        entidad,
        error: e instanceof Error ? e.message : String(e),
      })
      return err('moderacion_fallida')
    }

    if (!debeGenerarReporte(veredicto)) {
      await cerrarLedger(admin, idAnalisis, {
        estado: 'sin_hallazgos',
        modelo: provider.modelId,
      })
      return ok('sin_hallazgos')
    }

    const reporteRow = construirReporteIa({
      idReportado: idAutor,
      entidad,
      idEntidad,
      veredicto,
      modelo: provider.modelId,
    })
    const { data: reporte, error: insError } = await admin
      .from('reportes_moderacion')
      .insert(reporteRow)
      .select('id_reporte')
      .single()

    if (insError || !reporte) {
      await cerrarLedger(admin, idAnalisis, {
        estado: 'fallido',
        error: insError?.message ?? 'insert_reporte_fallido',
        modelo: provider.modelId,
      })
      logger.error('moderarContenido: fallo al insertar el reporte', {
        error: insError?.message,
      })
      return err('reporte_no_insertado')
    }

    await cerrarLedger(admin, idAnalisis, {
      estado: 'analizado',
      idReporte: reporte.id_reporte,
      modelo: provider.modelId,
    })
    logger.info('moderarContenido: reporte generado', {
      entidad,
      idReporte: reporte.id_reporte,
      criterio: reporteRow.tipo_reporte,
      accion: reporteRow.accion_sugerida,
    })
    return ok('reportado')
  } catch (e) {
    logger.error('moderarContenido: excepción inesperada', {
      error: e instanceof Error ? e.message : String(e),
    })
    return err('moderacion_excepcion')
  }
}

/**
 * Agenda la moderación para DESPUÉS de la respuesta (Next `after()`), sin bloquear
 * ni poder romper la acción de usuario que la dispara. Se llama desde cada sitio
 * de escritura con el autor y el id de la fila ya conocidos. Los errores se
 * loguean dentro de `moderarContenido`; aquí se ignora el Result a propósito.
 */
export function programarModeracion(input: ModerarContenidoInput): void {
  try {
    after(() => moderarContenido(input))
  } catch (e) {
    // `after()` solo existe dentro de un request scope; fuera de él (p. ej. en
    // tests unitarios) lanza. La moderación es best-effort: se omite sin tumbar
    // la acción que la llamó.
    logger.warn('programarModeracion: after() no disponible, se omite', {
      entidad: input.entidad,
      error: e instanceof Error ? e.message : String(e),
    })
  }
}

export interface ModeracionDiferidaInput {
  entidad: EntidadModerable
  texto: string
  /** id_usuario del autor del texto. */
  idAutor: string
  /** Se ejecuta DENTRO del after() para obtener el id de la fila recién escrita. */
  resolverIdEntidad: () => Promise<string | null>
}

/**
 * Variante de {@link programarModeracion} para sitios donde el id de la fila NO
 * está a mano al escribir (p. ej. un insert que no devuelve el id). Resuelve el
 * `id_entidad` DENTRO del after() con el cliente admin, sin tocar el camino de
 * escritura ni sus tests. best-effort: nunca lanza.
 */
export function programarModeracionDiferida(
  input: ModeracionDiferidaInput,
): void {
  try {
    after(async () => {
      const idEntidad = await input.resolverIdEntidad()
      if (!idEntidad) return
      await moderarContenido({
        entidad: input.entidad,
        idEntidad,
        texto: input.texto,
        idAutor: input.idAutor,
      })
    })
  } catch (e) {
    logger.warn(
      'programarModeracionDiferida: after() no disponible, se omite',
      {
        entidad: input.entidad,
        error: e instanceof Error ? e.message : String(e),
      },
    )
  }
}

/** Crea o reabre la fila del ledger como 'pendiente'; devuelve su id o null. */
async function marcarPendiente(
  admin: AdminClient,
  p: {
    entidad: EntidadModerable
    idEntidad: string
    hash: string
    idPrevio: string | null
  },
): Promise<string | null> {
  if (p.idPrevio) {
    const { error } = await admin
      .from('moderacion_ia_analisis')
      .update({ estado: 'pendiente' })
      .eq('id_analisis', p.idPrevio)
    return error ? null : p.idPrevio
  }
  const { data, error } = await admin
    .from('moderacion_ia_analisis')
    .insert({
      entidad: p.entidad,
      id_entidad: p.idEntidad,
      content_hash: p.hash,
      estado: 'pendiente',
    })
    .select('id_analisis')
    .single()
  if (error || !data) {
    logger.error('moderarContenido: no se pudo crear la fila del ledger', {
      error: error?.message,
    })
    return null
  }
  return data.id_analisis
}

/** Cierra la fila del ledger en un estado terminal. */
async function cerrarLedger(
  admin: AdminClient,
  idAnalisis: string,
  p: {
    estado: 'analizado' | 'sin_hallazgos' | 'fallido'
    idReporte?: string
    error?: string
    modelo?: string
  },
): Promise<void> {
  await admin
    .from('moderacion_ia_analisis')
    .update({
      estado: p.estado,
      id_reporte: p.idReporte ?? null,
      error: p.error ?? null,
      modelo_ia: p.modelo ?? null,
      analizado_at: new Date().toISOString(),
    })
    .eq('id_analisis', idAnalisis)
}
