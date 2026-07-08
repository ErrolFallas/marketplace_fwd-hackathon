/**
 * Tipos de dominio del agente moderador. Las superficies de texto que el agente
 * puede analizar (`EntidadModerable`) coinciden EXACTAMENTE con el enum
 * `entidad_moderable_enum` de la migración 20260707130000: son el puntero
 * polimórfico (entidad, id_entidad) de un reporte IA en `reportes_moderacion`.
 */

export const ENTIDADES_MODERABLES = [
  'mensaje',
  'evaluacion_comentario',
  'evaluacion_respuesta',
  'evaluacion_empresario_comentario',
  'evaluacion_empresario_respuesta',
  'comentario_entregable',
  'carta_postulacion',
  'portafolio',
  'bio_estudiante',
  'entregable_descripcion',
  'contrato_condiciones',
  'contrato_motivo_cancelacion',
  'empresa_descripcion',
] as const

export type EntidadModerable = (typeof ENTIDADES_MODERABLES)[number]

/** Entrada de una llamada de moderación: una superficie + su texto. */
export interface ModerarTextoInput {
  entidad: EntidadModerable
  texto: string
}
