import { describe, it, expect } from 'vitest'
import { calcularEscenario } from './pricing-logic'
import { TARIFA_HORA_CRC, TC_REF } from './constants'
import type { CotizadorInput, HorasPorModulo } from './types'

// 80 h repartidas en los 6 módulos — números limpios para verificar a mano.
const HORAS: HorasPorModulo = {
  analisis_diseno: 10,
  frontend: 20,
  backend: 30,
  base_datos: 8,
  pruebas_calidad: 6,
  despliegue: 6,
}

function baseInput(over: Partial<CotizadorInput> = {}): CotizadorInput {
  return {
    horasM: HORAS,
    idioma: 'es',
    despliegue: { tipo: 'propio', costoServerUsdMes: 0, mesesCobertura: 0 },
    suscripciones: [],
    ...over,
  }
}

describe('calcularEscenario — pipeline del doc CR', () => {
  it('deploy propio, es, sin subs: total = horas × tarifa × 1.30', () => {
    const r = calcularEscenario(HORAS, baseInput())
    expect(r.tarifaEfectiva).toBe(8_000)
    expect(r.horasTotal).toBe(80)
    expect(r.infra).toBe(0)
    expect(r.subsTotal).toBe(0)
    expect(r.subtotal).toBe(640_000) // 80 × 8.000
    expect(r.margen).toBeCloseTo(192_000, 6) // 30%
    expect(r.totalCrc).toBeCloseTo(832_000, 6)
    expect(r.totalUsd).toBeCloseTo(1_600, 6) // 832.000 / 520
  })

  it('idioma inglés aplica ×1.2 a la tarifa efectiva', () => {
    const r = calcularEscenario(HORAS, baseInput({ idioma: 'ingles' }))
    expect(r.tarifaEfectiva).toBe(9_600)
  })

  it('idioma bilingüe aplica ×1.1', () => {
    const r = calcularEscenario(HORAS, baseInput({ idioma: 'bilingue' }))
    expect(r.tarifaEfectiva).toBeCloseTo(8_800, 6)
  })

  it('deploy gratuito: infra = horas_despliegue × tarifa × 0.15, + subs activas', () => {
    const r = calcularEscenario(
      HORAS,
      baseInput({
        idioma: 'ingles',
        despliegue: {
          tipo: 'gratuito',
          costoServerUsdMes: 0,
          mesesCobertura: 0,
        },
        suscripciones: [
          { nombre: 'Stripe', costoUsdMes: 20, activa: true },
          { nombre: 'SendGrid', costoUsdMes: 15, activa: false },
        ],
      }),
    )
    expect(r.infra).toBeCloseTo(8_640, 6) // 6 × 9.600 × 0.15
    expect(r.subsTotal).toBeCloseTo(10_400, 6) // 20 USD × 520
    expect(r.subtotal).toBeCloseTo(787_040, 6) // 768.000 + 8.640 + 10.400
    expect(r.totalCrc).toBeCloseTo(1_023_152, 6) // × 1.30
  })

  it('deploy pago: infra = server × meses × TC (fijo, no depende de horas)', () => {
    const r = calcularEscenario(
      HORAS,
      baseInput({
        despliegue: { tipo: 'pago', costoServerUsdMes: 20, mesesCobertura: 3 },
      }),
    )
    expect(r.infra).toBeCloseTo(31_200, 6) // 20 × 3 × 520
    expect(r.subtotal).toBeCloseTo(671_200, 6) // 640.000 + 31.200
    expect(r.totalCrc).toBeCloseTo(872_560, 6)
  })

  it('suscripciones inactivas no suman', () => {
    const r = calcularEscenario(
      HORAS,
      baseInput({
        suscripciones: [{ nombre: 'X', costoUsdMes: 99, activa: false }],
      }),
    )
    expect(r.subsTotal).toBe(0)
  })

  it('idioma fuera del tipo cae a ×1.0', () => {
    // @ts-expect-error probando entrada inválida en runtime
    const r = calcularEscenario(HORAS, baseInput({ idioma: 'zz' }))
    expect(r.tarifaEfectiva).toBe(TARIFA_HORA_CRC)
  })

  it('tc inválido (0) cae a TC_REF', () => {
    const r = calcularEscenario(HORAS, baseInput({ tc: 0 }))
    expect(r.totalUsd).toBeCloseTo(r.totalCrc / TC_REF, 6)
  })

  it('horas negativas/NaN se tratan como 0', () => {
    const horasSucias: HorasPorModulo = {
      ...HORAS,
      backend: -5,
      frontend: NaN,
    }
    const r = calcularEscenario(horasSucias, baseInput())
    expect(r.horasPorModulo.backend).toBe(0)
    expect(r.horasPorModulo.frontend).toBe(0)
    expect(r.horasTotal).toBe(30) // 10 + 0 + 0 + 8 + 6 + 6
  })
})
