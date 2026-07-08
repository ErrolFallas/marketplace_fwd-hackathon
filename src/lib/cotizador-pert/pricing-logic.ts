import {
  IDIOMA_MULT,
  MARGEN_PCT,
  RECARGO_DEPLOY_GRATUITO,
  TARIFA_HORA_CRC,
  TC_REF,
} from './constants'
import { MODULOS_PERT } from './types'
import type {
  CotizadorInput,
  EscenarioCosto,
  HorasPorModulo,
  Idioma,
  ModuloPert,
} from './types'

/**
 * Motor de PRICING puro y determinista. Implementa el pipeline del doc CR
 * (§3, §7) para UN escenario (un vector de horas por módulo). Isomórfico: corre
 * igual en cliente y servidor, sin red ni IA.
 *
 * Nota de varianza: los pass-through fijos (infra de despliegue PAGO y
 * suscripciones) NO dependen de las horas, así que son constantes entre los
 * escenarios O/M/P/Beta; solo la infra de despliegue GRATUITO (15% de las horas
 * de configuración) hereda la varianza del PERT.
 */

const MODULO_DESPLIEGUE: ModuloPert = 'despliegue'

/** ₡/$ efectivo, con guarda contra valores inválidos. */
function tcSeguro(tc: number | undefined): number {
  return typeof tc === 'number' && tc > 0 ? tc : TC_REF
}

/** No-negativo y finito (0 si NaN/negativo). */
function noNeg(x: number): number {
  return Number.isFinite(x) && x > 0 ? x : 0
}

/** Tarifa por hora efectiva = tarifa base × multiplicador de idioma. */
export function tarifaEfectiva(idioma: Idioma): number {
  return TARIFA_HORA_CRC * (IDIOMA_MULT[idioma] ?? 1.0)
}

/** Suma de suscripciones ACTIVAS convertidas a ₡ (doc §3.6). */
export function costoSuscripciones(
  suscripciones: CotizadorInput['suscripciones'],
  tc: number,
): number {
  return suscripciones
    .filter((s) => s.activa)
    .reduce((acc, s) => acc + noNeg(s.costoUsdMes) * tc, 0)
}

/**
 * Costo de infraestructura de despliegue (doc §3.5).
 * - gratuito: 15% del costo de las horas de configuración (recargo de gestión).
 * - pago: server_usd_mes × meses × TC (FIJO, independiente de las horas).
 * - propio: 0.
 */
export function costoInfraDespliegue(
  input: CotizadorInput,
  costoHorasDespliegue: number,
  tc: number,
): number {
  const { tipo, costoServerUsdMes, mesesCobertura } = input.despliegue
  if (tipo === 'gratuito') return costoHorasDespliegue * RECARGO_DEPLOY_GRATUITO
  if (tipo === 'pago')
    return noNeg(costoServerUsdMes) * noNeg(mesesCobertura) * tc
  return 0
}

/** Calcula el costo de UN escenario a partir de su vector de horas por módulo. */
export function calcularEscenario(
  horas: HorasPorModulo,
  input: CotizadorInput,
): EscenarioCosto {
  const tc = tcSeguro(input.tc)
  const tarifa = tarifaEfectiva(input.idioma)

  const horasPorModulo = {} as HorasPorModulo
  const costoPorModulo = {} as HorasPorModulo
  let horasTotal = 0
  let sumaCostosModulos = 0

  for (const modulo of MODULOS_PERT) {
    const h = noNeg(horas[modulo])
    const costo = h * tarifa
    horasPorModulo[modulo] = h
    costoPorModulo[modulo] = costo
    horasTotal += h
    sumaCostosModulos += costo
  }

  const infra = costoInfraDespliegue(
    input,
    costoPorModulo[MODULO_DESPLIEGUE],
    tc,
  )
  const subsTotal = costoSuscripciones(input.suscripciones, tc)

  const subtotal = sumaCostosModulos + infra + subsTotal
  const margen = subtotal * MARGEN_PCT
  const totalCrc = subtotal + margen
  const totalUsd = totalCrc / tc

  return {
    horasPorModulo,
    horasTotal,
    tarifaEfectiva: tarifa,
    costoPorModulo,
    infra,
    subsTotal,
    subtotal,
    margen,
    totalCrc,
    totalUsd,
  }
}
