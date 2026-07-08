import 'server-only'
import { getRevisorProvider } from './provider'
import { construirResultado, hashContenidoRevisado } from './review-logic'
import type { RevisarPostulacionInput, RevisionResultado } from './types'
import { logger } from '@/lib/logger'

/**
 * Orquesta una revisión completa y ENCAPSULA EL FAIL-OPEN (RNF-34): si el feature
 * no está configurado o el proveedor falla, nunca lanza — devuelve un resultado
 * 'no_disponible'. El envío del egresado jamás se bloquea por un fallo de IA.
 */
export async function revisarPostulacion(
  input: RevisarPostulacionInput,
): Promise<RevisionResultado> {
  const noDisponible = (): RevisionResultado => ({
    estado: 'no_disponible',
    modelo: null,
    detalle: { intentoManipulacion: false, items: [] },
    contentHash: hashContenidoRevisado(
      input.planteamientoSolucion,
      input.cartaPostulacion,
    ),
  })

  const provider = getRevisorProvider()
  if (!provider) {
    logger.warn('revisarPostulacion: revisor no configurado, no_disponible')
    return noDisponible()
  }

  try {
    const modelo = await provider.revisar(input)
    return construirResultado({
      modelo,
      modeloId: provider.modelId,
      planteamiento: input.planteamientoSolucion,
      carta: input.cartaPostulacion,
    })
  } catch (error) {
    logger.error('revisarPostulacion: fallo del proveedor', {
      error: error instanceof Error ? error.message : String(error),
    })
    return noDisponible()
  }
}
