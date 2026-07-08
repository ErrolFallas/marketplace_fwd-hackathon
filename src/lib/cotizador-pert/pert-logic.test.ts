import { describe, it, expect } from 'vitest'
import {
  beta,
  sigmaModulo,
  derivarFallback,
  sanearTresPuntos,
  sigmaTotalHoras,
  clasificarAlineacion,
  calcularCotizacion,
} from './pert-logic'
import type {
  CotizadorInput,
  HorasPorModulo,
  ModuloPert,
  TresPuntos,
} from './types'

describe('beta y sigmaModulo', () => {
  it('beta = (O + 4M + P) / 6', () => {
    expect(beta({ o: 30, m: 40, p: 70 })).toBeCloseTo(43.3333, 4)
  })
  it('sigmaModulo = (P − O) / 6', () => {
    expect(sigmaModulo({ o: 30, m: 40, p: 70 })).toBeCloseTo(6.6667, 4)
  })
})

describe('derivarFallback (O=0.8M, P=1.5M)', () => {
  it('Beta = 1.05M y σ = 0.11667M', () => {
    const t = derivarFallback(40)
    expect(t).toEqual({ o: 32, m: 40, p: 60 })
    expect(beta(t)).toBeCloseTo(42, 6) // 1.05 × 40
    expect(sigmaModulo(t)).toBeCloseTo(4.6667, 4) // 0.11667 × 40
  })
  it('M = 0 ⇒ todo 0', () => {
    expect(derivarFallback(0)).toEqual({ o: 0, m: 0, p: 0 })
  })
})

describe('sanearTresPuntos — invariante 0 ≤ O ≤ M ≤ P', () => {
  it('clampa O > M a M y P < M a M', () => {
    expect(sanearTresPuntos(40, { o: 50, p: 30 })).toEqual({
      o: 40,
      m: 40,
      p: 40,
    })
  })
  it('M = 0 anula el módulo aunque la IA proponga', () => {
    expect(sanearTresPuntos(0, { o: 5, p: 99 })).toEqual({ o: 0, m: 0, p: 0 })
  })
  it('O/P inválidos o ausentes ⇒ fallback', () => {
    expect(sanearTresPuntos(40, { o: NaN, p: 60 })).toEqual({
      o: 32,
      m: 40,
      p: 60,
    })
    expect(sanearTresPuntos(40, undefined)).toEqual({ o: 32, m: 40, p: 60 })
  })
  it('O negativo se clampa a 0', () => {
    expect(sanearTresPuntos(40, { o: -10, p: 60 })).toEqual({
      o: 0,
      m: 40,
      p: 60,
    })
  })
  it('P absurdo (IA maliciosa) se topa a MAX_HORAS_MODULO', () => {
    expect(sanearTresPuntos(40, { o: 30, p: 1_000_000 }).p).toBe(2_000)
  })
})

describe('sigmaTotalHoras — √(Σσ²), no suma simple', () => {
  it('agrega en cuadratura', () => {
    const tres = {
      analisis_diseno: { o: 0, m: 0, p: 36 }, // σ = 6
      frontend: { o: 0, m: 0, p: 48 }, // σ = 8
      backend: { o: 0, m: 0, p: 0 },
      base_datos: { o: 0, m: 0, p: 0 },
      pruebas_calidad: { o: 0, m: 0, p: 0 },
      despliegue: { o: 0, m: 0, p: 0 },
    } as Record<ModuloPert, TresPuntos>
    expect(sigmaTotalHoras(tres)).toBeCloseTo(10, 6) // √(36+64)=10, no 14
  })
})

describe('clasificarAlineacion (umbral 10%)', () => {
  it('dentro de ±10% ⇒ alineado', () => {
    expect(clasificarAlineacion(100, 105)).toBe('m_alineado') // −4.8%
  })
  it('cobroM muy por debajo del Beta ⇒ optimista', () => {
    expect(clasificarAlineacion(80, 100)).toBe('m_muy_optimista') // −20%
  })
  it('cobroM muy por encima del Beta ⇒ pesimista', () => {
    expect(clasificarAlineacion(120, 100)).toBe('m_muy_pesimista') // +20%
  })
})

describe('calcularCotizacion — integración', () => {
  const horasM: HorasPorModulo = {
    analisis_diseno: 10,
    frontend: 20,
    backend: 30,
    base_datos: 8,
    pruebas_calidad: 6,
    despliegue: 6,
  }
  const input: CotizadorInput = {
    horasM,
    idioma: 'es',
    despliegue: { tipo: 'propio', costoServerUsdMes: 0, mesesCobertura: 0 },
    suscripciones: [],
  }

  it('fail-open (sin propuesta): Beta = 1.05 × horas M y M queda alineado', () => {
    const r = calcularCotizacion(input)
    expect(r.fuenteOP).toBe('fallback')
    expect(r.escenarios.masProbable.horasTotal).toBe(80)
    expect(r.escenarios.esperado.horasTotal).toBeCloseTo(84, 6) // 1.05 × 80
    // cobro M vs Beta ≈ −4.76% ⇒ nunca dispara la divergencia en fail-open
    expect(r.alineacionM).toBe('m_alineado')
    expect(r.bandaEsperadoCrc.min).toBeLessThan(r.escenarios.esperado.totalCrc)
    expect(r.bandaEsperadoCrc.max).toBeGreaterThan(
      r.escenarios.esperado.totalCrc,
    )
  })

  it('escenarios ordenados O ≤ M ≤ Beta ≤ P', () => {
    const r = calcularCotizacion(input)
    const { optimista, masProbable, pesimista, esperado } = r.escenarios
    expect(optimista.totalCrc).toBeLessThanOrEqual(masProbable.totalCrc)
    expect(masProbable.totalCrc).toBeLessThanOrEqual(esperado.totalCrc)
    expect(esperado.totalCrc).toBeLessThanOrEqual(pesimista.totalCrc)
  })

  it('propuesta IA válida marca fuenteOP=ia y respeta la M ancla', () => {
    const r = calcularCotizacion(input, { backend: { o: 20, p: 60 } }, 'ia')
    expect(r.fuenteOP).toBe('ia')
    expect(r.tresPorModulo.backend).toEqual({ o: 20, m: 30, p: 60 })
    // módulo sin propuesta cae a fallback pero fuenteOP global sigue 'ia'
    expect(r.tresPorModulo.frontend).toEqual({ o: 16, m: 20, p: 30 })
  })

  it('forzar fuenteOP=ia sin propuesta igual reporta fallback', () => {
    const r = calcularCotizacion(input, undefined, 'ia')
    expect(r.fuenteOP).toBe('fallback')
  })
})
