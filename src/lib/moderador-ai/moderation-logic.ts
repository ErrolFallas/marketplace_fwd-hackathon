import { createHash } from 'node:crypto'
import type { AccionSugerida, Criterio, Severidad, Veredicto } from './schemas'
import type { EntidadModerable } from './types'

/**
 * Lógica PURA del moderador (sin I/O, testeable): hash de contenido para dedup,
 * umbrales de confianza y el armado de la fila de reporte a partir del veredicto.
 * La orquestación con la BD (leer el ledger, insertar el reporte) vive aparte y
 * usa estas funciones.
 */

/** Textos más cortos que esto no se analizan (ruido: "ok", "👍", vacío). */
export const MIN_LONGITUD_ANALIZABLE = 2

/** Debajo de esta confianza, el veredicto no genera reporte (sesgo a ignorar). */
export const UMBRAL_CONFIANZA_REPORTE = 0.5

/** Solo se sugiere "strike" con confianza alta; si no, se degrada a "advertir". */
export const UMBRAL_CONFIANZA_STRIKE = 0.85

/** criterio del modelo → tipo_reporte_enum (identidad salvo 'ninguno'). */
type CriterioFalta = Exclude<Criterio, 'ninguno'>
export const CRITERIO_A_TIPO_REPORTE: Record<CriterioFalta, CriterioFalta> = {
  conducta_abusiva: 'conducta_abusiva',
  contenido_inapropiado: 'contenido_inapropiado',
  spam: 'spam',
  fraude: 'fraude',
}

/** Fila lista para insertar en `reportes_moderacion` como reporte de IA. */
export interface ReporteIaInsert {
  origen: 'ia'
  id_reportante: null
  id_reportado: string
  entidad: EntidadModerable
  id_entidad: string
  tipo_reporte: CriterioFalta
  descripcion: string
  accion_sugerida: AccionSugerida
  severidad: Severidad
  confianza: number
  extracto: string
  modelo_ia: string
}

/** Normaliza el texto para hashear (recorta bordes: evita re-análisis por espacios). */
export function normalizarParaHash(texto: string): string {
  return texto.trim()
}

/** SHA-256 hex del contenido normalizado. Editar el texto cambia el hash. */
export function hashContenido(texto: string): string {
  return createHash('sha256')
    .update(normalizarParaHash(texto), 'utf8')
    .digest('hex')
}

/** ¿Vale la pena analizar este texto? (descarta ruido demasiado corto). */
export function esAnalizable(texto: string): boolean {
  return normalizarParaHash(texto).length >= MIN_LONGITUD_ANALIZABLE
}

/** ¿El veredicto amerita crear un reporte para el admin? */
export function debeGenerarReporte(veredicto: Veredicto): boolean {
  return (
    veredicto.hayFalta &&
    veredicto.criterio !== 'ninguno' &&
    veredicto.confianza >= UMBRAL_CONFIANZA_REPORTE
  )
}

/**
 * Aplica el piso de confianza a la acción sugerida: nunca se sugiere "strike"
 * sin confianza alta (mitigación anti sesgo de automatización). Degrada a
 * "advertir" en ese caso; el resto se respeta.
 */
export function accionConPiso(veredicto: Veredicto): AccionSugerida {
  if (
    veredicto.accionSugerida === 'strike' &&
    veredicto.confianza < UMBRAL_CONFIANZA_STRIKE
  ) {
    return 'advertir'
  }
  return veredicto.accionSugerida
}

/**
 * Arma la fila de `reportes_moderacion` para un reporte de IA. Asume que el
 * veredicto ya pasó `debeGenerarReporte` (criterio != 'ninguno'). La descripción
 * cae a un texto por defecto si el modelo no dio razón, porque la columna es
 * NOT NULL.
 */
export function construirReporteIa(params: {
  idReportado: string
  entidad: EntidadModerable
  idEntidad: string
  veredicto: Veredicto
  modelo: string
}): ReporteIaInsert {
  const { idReportado, entidad, idEntidad, veredicto, modelo } = params
  const criterio = veredicto.criterio as CriterioFalta
  const razon = veredicto.razon.trim()

  return {
    origen: 'ia',
    id_reportante: null,
    id_reportado: idReportado,
    entidad,
    id_entidad: idEntidad,
    tipo_reporte: CRITERIO_A_TIPO_REPORTE[criterio],
    descripcion:
      razon.length > 0
        ? razon
        : `Posible ${criterio.replace(/_/g, ' ')} detectado por el agente moderador.`,
    accion_sugerida: accionConPiso(veredicto),
    severidad: veredicto.severidad,
    confianza: veredicto.confianza,
    extracto: veredicto.extracto.trim(),
    modelo_ia: modelo,
  }
}
