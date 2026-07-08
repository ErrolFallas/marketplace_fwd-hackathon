import { z } from 'zod'

/**
 * Esquema Zod de la RESPUESTA del modelo (reglas §5: "Zod en respuestas de IA").
 * El LLM devuelve JSON; lo validamos antes de confiar en él.
 *
 * Parser TOLERANTE con SESGO A LA SEGURIDAD: gpt-4o-mini con JSON mode devuelve
 * JSON válido, pero un tipo flojo (string "true", un criterio inventado, una
 * confianza fuera de rango) no debe volverse un reporte erróneo. Por eso cada
 * campo se coerciona hacia el valor MÁS CONSERVADOR ante la duda: criterio →
 * 'ninguno', acción → 'ignorar', severidad → 'baja', confianza → recortada a
 * [0,1]. Un modelo confundido tiende a "no hacer nada", no a acusar.
 */

export const CRITERIOS = [
  'conducta_abusiva',
  'contenido_inapropiado',
  'spam',
  'fraude',
  'ninguno',
] as const
export type Criterio = (typeof CRITERIOS)[number]

export const SEVERIDADES = ['baja', 'media', 'alta'] as const
export type Severidad = (typeof SEVERIDADES)[number]

export const ACCIONES_SUGERIDAS = ['advertir', 'strike', 'ignorar'] as const
export type AccionSugerida = (typeof ACCIONES_SUGERIDAS)[number]

/** booleano flexible: acepta true/false o "true"/"false". */
const toBool = (val: unknown): boolean => {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') return val.trim().toLowerCase() === 'true'
  return false
}

/** array u otro tipo → texto (el modelo a veces parte un texto en array). */
const toText = (val: unknown): string => {
  if (typeof val === 'string') return val
  if (Array.isArray(val)) return val.map((x) => String(x)).join('\n')
  if (val == null) return ''
  return String(val)
}

/** confianza tolerante: número o string numérico, recortada a [0,1]; basura → 0. */
const toConfianza = (val: unknown): number => {
  const n = typeof val === 'number' ? val : Number(String(val ?? '').trim())
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

/** criterio desconocido → 'ninguno' (no acusar ante la duda). */
const toCriterio = (val: unknown): string => {
  const s = String(val ?? '')
    .trim()
    .toLowerCase()
  return (CRITERIOS as readonly string[]).includes(s) ? s : 'ninguno'
}

/** severidad desconocida → 'baja'. */
const toSeveridad = (val: unknown): string => {
  const s = String(val ?? '')
    .trim()
    .toLowerCase()
  return (SEVERIDADES as readonly string[]).includes(s) ? s : 'baja'
}

/** acción desconocida → 'ignorar' (la opción segura por defecto). */
const toAccion = (val: unknown): string => {
  const s = String(val ?? '')
    .trim()
    .toLowerCase()
  return (ACCIONES_SUGERIDAS as readonly string[]).includes(s) ? s : 'ignorar'
}

/** Veredicto del agente sobre un fragmento de texto. */
export const veredictoSchema = z.object({
  hayFalta: z.preprocess(toBool, z.boolean()),
  criterio: z.preprocess(toCriterio, z.enum(CRITERIOS)),
  severidad: z.preprocess(toSeveridad, z.enum(SEVERIDADES)),
  confianza: z.preprocess(toConfianza, z.number().min(0).max(1)),
  accionSugerida: z.preprocess(toAccion, z.enum(ACCIONES_SUGERIDAS)),
  extracto: z.preprocess(toText, z.string()),
  razon: z.preprocess(toText, z.string()),
})
export type Veredicto = z.infer<typeof veredictoSchema>
