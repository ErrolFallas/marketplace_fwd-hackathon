import { z } from 'zod'
import { MODULOS_PERT } from './types'
import type { ModuloPert, RangosPropuestos } from './types'

/**
 * Contrato de la RESPUESTA del modelo: SOLO rangos O/P por módulo. El modelo
 * nunca emite texto libre que se muestre al usuario (la M la pone el egresado; el
 * dinero lo calcula el motor puro). Parser TOLERANTE: coacciona números, descarta
 * módulos desconocidos y entradas inválidas. La invariante 0 ≤ O ≤ M ≤ P la
 * aplica sanearTresPuntos aguas abajo, con la M ancla del egresado.
 */

const MODULOS = new Set<string>(MODULOS_PERT)

/** Coacciona a número finito, o null si no se puede. */
function aNumero(val: unknown): number | null {
  if (typeof val === 'number' && Number.isFinite(val)) return val
  if (typeof val === 'string') {
    const n = Number(val.trim())
    if (val.trim() !== '' && Number.isFinite(n)) return n
  }
  return null
}

const rangoCrudoSchema = z.object({
  modulo: z.string(),
  o: z.unknown(),
  p: z.unknown(),
})

export const rangosModeloSchema = z.object({
  rangos: z.array(rangoCrudoSchema).optional(),
})

/** Convierte la respuesta cruda del modelo en RangosPropuestos saneados. */
export function aRangosPropuestos(crudo: unknown): RangosPropuestos {
  const parsed = rangosModeloSchema.safeParse(crudo)
  if (!parsed.success || !parsed.data.rangos) return {}
  const salida: RangosPropuestos = {}
  for (const item of parsed.data.rangos) {
    const modulo = item.modulo.trim().toLowerCase()
    if (!MODULOS.has(modulo)) continue
    const o = aNumero(item.o)
    const p = aNumero(item.p)
    if (o === null || p === null) continue
    salida[modulo as ModuloPert] = { o, p }
  }
  return salida
}
