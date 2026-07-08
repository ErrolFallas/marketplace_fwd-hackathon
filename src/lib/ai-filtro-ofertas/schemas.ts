import { z } from 'zod'
import { CAMPOS_REVISABLES } from './types'

/**
 * Contrato de la RESPUESTA del modelo (reglas §5: "Zod en respuestas de IA").
 *
 * El modelo NUNCA devuelve texto libre que se muestre al usuario: solo un veredicto
 * booleano y listas de CÓDIGOS de dos catálogos cerrados. El texto humano lo pone
 * la UI vía i18n (mapeado por código). Así, aunque el egresado intente inyectar
 * instrucciones, lo peor que puede lograr es un código del catálogo — nunca hacer
 * que el modelo filtre su prompt o emita HTML/enlaces.
 *
 * Parser TOLERANTE con SESGO ADVISORY: ante ambigüedad NO se rechaza al egresado
 * (relacionada por defecto true) y los códigos desconocidos se descartan.
 */

/** Motivos por los que la postulación NO guarda relación (bloqueantes). */
export const CODIGOS_MOTIVO = [
  'planteamiento_fuera_de_tema',
  'planteamiento_generico',
  'carta_fuera_de_tema',
  'area_no_coincide',
  'sin_relacion_con_proyecto',
] as const
export type CodigoMotivo = (typeof CODIGOS_MOTIVO)[number]

/** Recomendaciones de mejora (aplican aunque la postulación esté aprobada). */
export const CODIGOS_SUGERENCIA = [
  'detallar_planteamiento',
  'mencionar_tecnologias',
  'personalizar_carta',
  'ampliar_carta',
  'agregar_enlace_github',
  'agregar_enlace_demo',
] as const
export type CodigoSugerencia = (typeof CODIGOS_SUGERENCIA)[number]

/** boolean flexible con valor por defecto: acepta true/false o "true"/"false". */
const toBoolCon =
  (porDefecto: boolean) =>
  (val: unknown): boolean => {
    if (typeof val === 'boolean') return val
    if (typeof val === 'string') {
      const s = val.trim().toLowerCase()
      if (s === 'true') return true
      if (s === 'false') return false
    }
    return porDefecto
  }

/** Filtra un array del modelo a los códigos conocidos del catálogo, sin duplicados. */
const soloCodigos =
  (catalogo: readonly string[]) =>
  (val: unknown): string[] => {
    if (!Array.isArray(val)) return []
    const vistos = new Set<string>()
    for (const item of val) {
      const s = String(item ?? '')
        .trim()
        .toLowerCase()
      if (catalogo.includes(s)) vistos.add(s)
    }
    return [...vistos]
  }

/** Veredicto crudo del modelo, ya tolerado y saneado. */
export const revisionModeloSchema = z.object({
  relacionada: z.preprocess(toBoolCon(true), z.boolean()),
  intentoManipulacion: z.preprocess(toBoolCon(false), z.boolean()),
  problemas: z.preprocess(
    soloCodigos(CODIGOS_MOTIVO),
    z.array(z.enum(CODIGOS_MOTIVO)),
  ),
  sugerencias: z.preprocess(
    soloCodigos(CODIGOS_SUGERENCIA),
    z.array(z.enum(CODIGOS_SUGERENCIA)),
  ),
})
export type RevisionModelo = z.infer<typeof revisionModeloSchema>

/** Detalle por-campo del veredicto (lo que va en participaciones.revision_ia_detalle). */
export const revisionDetalleSchema = z.object({
  intentoManipulacion: z.boolean(),
  items: z.array(
    z.object({
      campo: z.enum(CAMPOS_REVISABLES),
      tipo: z.enum(['bloqueante', 'sugerencia']),
      codigo: z.string(),
    }),
  ),
})
