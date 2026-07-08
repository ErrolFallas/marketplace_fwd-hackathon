import { createHash } from 'node:crypto'
import type { CodigoMotivo, CodigoSugerencia, RevisionModelo } from './schemas'
import type {
  CampoRevisable,
  RevisionDetalle,
  RevisionEstado,
  RevisionItem,
  RevisionResultado,
} from './types'

/**
 * Lógica PURA del revisor (sin I/O, testeable): mapea el veredicto crudo del
 * modelo a un resultado por-campo, deriva el estado y calcula el hash del
 * contenido revisado. La orquestación (llamar al modelo, persistir) vive aparte.
 */

/** A qué campo del formulario apunta cada código de problema. */
const MOTIVO_A_CAMPO: Record<CodigoMotivo, CampoRevisable> = {
  planteamiento_fuera_de_tema: 'planteamiento_solucion',
  planteamiento_generico: 'planteamiento_solucion',
  carta_fuera_de_tema: 'carta_postulacion',
  area_no_coincide: 'general',
  sin_relacion_con_proyecto: 'general',
}

/** A qué campo del formulario apunta cada código de sugerencia. */
const SUGERENCIA_A_CAMPO: Record<CodigoSugerencia, CampoRevisable> = {
  detallar_planteamiento: 'planteamiento_solucion',
  mencionar_tecnologias: 'planteamiento_solucion',
  personalizar_carta: 'carta_postulacion',
  ampliar_carta: 'carta_postulacion',
  agregar_enlace_github: 'prototipo',
  agregar_enlace_demo: 'prototipo',
}

/** relacionada del modelo → estado persistible. */
export function estadoDesdeModelo(modelo: RevisionModelo): RevisionEstado {
  return modelo.relacionada ? 'aprobada' : 'rechazada'
}

/** Arma el detalle por-campo (bloqueantes + sugerencias) desde el veredicto. */
export function construirDetalle(modelo: RevisionModelo): RevisionDetalle {
  const bloqueantes: RevisionItem[] = modelo.problemas.map((codigo) => ({
    campo: MOTIVO_A_CAMPO[codigo],
    tipo: 'bloqueante',
    codigo,
  }))
  const sugerencias: RevisionItem[] = modelo.sugerencias.map((codigo) => ({
    campo: SUGERENCIA_A_CAMPO[codigo],
    tipo: 'sugerencia',
    codigo,
  }))
  return {
    intentoManipulacion: modelo.intentoManipulacion,
    items: [...bloqueantes, ...sugerencias],
  }
}

/**
 * Hash SHA-256 del contenido revisado (planteamiento + carta, normalizados). Si
 * el egresado edita el texto tras revisar, el hash cambia y `postularse` trata la
 * revisión como no aplicable (evita registrar un veredicto sobre un texto viejo).
 */
export function hashContenidoRevisado(
  planteamiento: string,
  carta: string | null,
): string {
  const normalizado = `${planteamiento.trim()}\n${(carta ?? '').trim()}`
  return createHash('sha256').update(normalizado, 'utf8').digest('hex')
}

/** Junta veredicto + detalle + hash en el resultado que devuelve la action. */
export function construirResultado(params: {
  modelo: RevisionModelo
  modeloId: string
  planteamiento: string
  carta: string | null
}): RevisionResultado {
  return {
    estado: estadoDesdeModelo(params.modelo),
    modelo: params.modeloId,
    detalle: construirDetalle(params.modelo),
    contentHash: hashContenidoRevisado(params.planteamiento, params.carta),
  }
}

/** Lo que `postularse` persiste en las columnas revision_ia_* de la oferta. */
export interface RevisionRegistro {
  estado: RevisionEstado
  detalle: RevisionDetalle | null
  modelo: string | null
  at: string | null
}
