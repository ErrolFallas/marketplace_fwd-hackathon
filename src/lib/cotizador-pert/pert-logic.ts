import {
  BUFFER_PCT,
  H_MES_REF,
  MARGEN_PCT,
  MAX_HORAS_MODULO,
  O_FACTOR,
  P_FACTOR,
  RECONCILIACION_UMBRAL_PCT,
} from './constants'
import { calcularEscenario } from './pricing-logic'
import { MODULOS_PERT } from './types'
import type {
  AlineacionM,
  CotizacionResultado,
  CotizadorInput,
  FuenteOP,
  HorasPorModulo,
  ModuloPert,
  TresPuntos,
} from './types'

/**
 * Motor PERT puro. Aplica la estimación de tres puntos a las HORAS por módulo,
 * arma los cuatro escenarios (O/M/P/Beta), corre el pricing determinista en cada
 * uno y agrega la incertidumbre (σ). NO depende de la IA: si no hay propuesta,
 * deriva O/P de la M del egresado (fail-open, RNF-34). La M del egresado es
 * siempre la autoridad; la IA solo abre el rango alrededor de ella.
 */

function finito(x: number): number {
  return Number.isFinite(x) ? x : 0
}

function noNeg(x: number): number {
  const n = finito(x)
  return n > 0 ? n : 0
}

/** Valor esperado PERT-Beta de un módulo: (O + 4M + P) / 6. */
export function beta(t: TresPuntos): number {
  return (t.o + 4 * t.m + t.p) / 6
}

/** Desviación estándar PERT de un módulo: (P − O) / 6. */
export function sigmaModulo(t: TresPuntos): number {
  return (t.p - t.o) / 6
}

/** Deriva O/P desde M cuando la IA no propone (fail-open). */
export function derivarFallback(m: number): TresPuntos {
  const mm = noNeg(m)
  return { o: mm * O_FACTOR, m: mm, p: mm * P_FACTOR }
}

/**
 * Sanea la propuesta de un módulo contra la M ANCLA del egresado.
 * Invariante 0 ≤ O ≤ M ≤ P. M = 0 ⇒ módulo nulo. O/P inválidos ⇒ fallback.
 */
export function sanearTresPuntos(
  mAncla: number,
  propuesta: Partial<TresPuntos> | undefined,
): TresPuntos {
  const m = noNeg(mAncla)
  if (m === 0) return { o: 0, m: 0, p: 0 }

  const oRaw = propuesta?.o
  const pRaw = propuesta?.p
  const oValido = typeof oRaw === 'number' && Number.isFinite(oRaw)
  const pValido = typeof pRaw === 'number' && Number.isFinite(pRaw)
  if (!oValido || !pValido) return derivarFallback(m)

  const o = Math.min(Math.max(noNeg(oRaw), 0), m) // 0 ≤ O ≤ M
  const pFloor = Math.max(finito(pRaw), m) // P ≥ M
  const p = Math.min(pFloor, Math.max(m, MAX_HORAS_MODULO)) // cap sin romper P ≥ M
  return { o, m, p }
}

function puntoHoras(
  tres: Record<ModuloPert, TresPuntos>,
  punto: keyof TresPuntos,
): HorasPorModulo {
  const h = {} as HorasPorModulo
  for (const modulo of MODULOS_PERT) h[modulo] = tres[modulo][punto]
  return h
}

function betaHoras(tres: Record<ModuloPert, TresPuntos>): HorasPorModulo {
  const h = {} as HorasPorModulo
  for (const modulo of MODULOS_PERT) h[modulo] = beta(tres[modulo])
  return h
}

/** σ total en horas: √(Σ σ_módulo²) — independencia entre módulos, no suma simple. */
export function sigmaTotalHoras(tres: Record<ModuloPert, TresPuntos>): number {
  let varianza = 0
  for (const modulo of MODULOS_PERT) {
    const s = sigmaModulo(tres[modulo])
    varianza += s * s
  }
  return Math.sqrt(varianza)
}

/** Clasifica la M del egresado frente al cobro esperado (Beta). */
export function clasificarAlineacion(
  cobroM: number,
  cobroBeta: number,
): AlineacionM {
  if (cobroBeta <= 0) return 'm_alineado'
  const div = (cobroM - cobroBeta) / cobroBeta
  if (div < -RECONCILIACION_UMBRAL_PCT) return 'm_muy_optimista'
  if (div > RECONCILIACION_UMBRAL_PCT) return 'm_muy_pesimista'
  return 'm_alineado'
}

/**
 * Arma la cotización completa: sanea la propuesta por módulo contra la M ancla,
 * corre los 4 escenarios y agrega σ + banda de confianza ~68%.
 *
 * @param propuesta rangos O/P por módulo (de la IA). Si falta, todo cae a fallback.
 * @param fuenteOP etiqueta de origen; se fuerza a 'fallback' si no hay propuesta.
 */
export function calcularCotizacion(
  input: CotizadorInput,
  propuesta?: Partial<Record<ModuloPert, Partial<TresPuntos>>>,
  fuenteOP: FuenteOP = 'fallback',
): CotizacionResultado {
  const tres = {} as Record<ModuloPert, TresPuntos>
  for (const modulo of MODULOS_PERT) {
    tres[modulo] = sanearTresPuntos(input.horasM[modulo], propuesta?.[modulo])
  }

  const optimista = calcularEscenario(puntoHoras(tres, 'o'), input)
  const masProbable = calcularEscenario(puntoHoras(tres, 'm'), input)
  const pesimista = calcularEscenario(puntoHoras(tres, 'p'), input)
  const esperado = calcularEscenario(betaHoras(tres), input)

  const sigmaH = sigmaTotalHoras(tres)
  // σ en ₡: horas × tarifa efectiva × (1 + margen). Aproxima la banda 68%.
  const sigmaCrc = sigmaH * esperado.tarifaEfectiva * (1 + MARGEN_PCT)
  const bandaEsperadoCrc = {
    min: Math.max(0, esperado.totalCrc - sigmaCrc),
    max: esperado.totalCrc + sigmaCrc,
  }

  const alineacionM = clasificarAlineacion(
    masProbable.totalCrc,
    esperado.totalCrc,
  )

  const horasBaseM = masProbable.horasTotal
  const informativo = {
    horasBaseM,
    horasConBufferM: horasBaseM * (1 + BUFFER_PCT),
    mesesAprox: esperado.horasTotal / H_MES_REF,
  }

  return {
    escenarios: { optimista, masProbable, pesimista, esperado },
    tresPorModulo: tres,
    sigmaTotalHoras: sigmaH,
    bandaEsperadoCrc,
    alineacionM,
    fuenteOP: propuesta ? fuenteOP : 'fallback',
    informativo,
  }
}
