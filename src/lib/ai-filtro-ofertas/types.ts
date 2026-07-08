/**
 * Tipos de dominio del revisor IA de postulaciones. El agente juzga SOLO la
 * coherencia temática del TEXTO del egresado (planteamiento + carta) contra el
 * proyecto; nunca lee el link ni decide sobre seguridad (eso es código, ver
 * link-safety-logic / link-check).
 */

/** Estado de la revisión IA sobre una oferta (espeja revision_ia_estado_enum). */
export const REVISION_ESTADOS = [
  'aprobada',
  'rechazada',
  'no_disponible',
  'no_solicitada',
] as const
export type RevisionEstado = (typeof REVISION_ESTADOS)[number]

/** Campos de la postulación a los que puede apuntar el coaching por-campo. */
export const CAMPOS_REVISABLES = [
  'planteamiento_solucion',
  'carta_postulacion',
  'prototipo',
  'general',
] as const
export type CampoRevisable = (typeof CAMPOS_REVISABLES)[number]

/** Entrada de una revisión: el proyecto y el texto que escribió el egresado. */
export interface RevisarPostulacionInput {
  projectTitle: string
  projectDescription: string
  projectArea: string | null
  planteamientoSolucion: string
  cartaPostulacion: string | null
}

/** Un ítem de coaching: a qué campo apunta, si bloquea o solo sugiere, y su código. */
export interface RevisionItem {
  campo: CampoRevisable
  tipo: 'bloqueante' | 'sugerencia'
  codigo: string
}

/**
 * Detalle estructurado que se persiste en participaciones.revision_ia_detalle
 * (jsonb) y alimenta el cuadro "comentario de nuestro supervisor". Solo códigos
 * de enums cerrados: nunca texto libre del modelo (evita el oráculo de injection).
 */
export interface RevisionDetalle {
  intentoManipulacion: boolean
  items: RevisionItem[]
}

/** Resultado completo de una revisión, tal como lo devuelve la server action. */
export interface RevisionResultado {
  estado: RevisionEstado
  modelo: string | null
  detalle: RevisionDetalle
  contentHash: string
}
