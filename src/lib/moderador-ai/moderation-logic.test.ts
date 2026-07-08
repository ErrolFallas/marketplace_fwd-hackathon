import { describe, it, expect } from 'vitest'
import {
  hashContenido,
  esAnalizable,
  debeGenerarReporte,
  accionConPiso,
  construirReporteIa,
  UMBRAL_CONFIANZA_REPORTE,
  UMBRAL_CONFIANZA_STRIKE,
} from './moderation-logic'
import type { Veredicto } from './schemas'

const veredictoBase: Veredicto = {
  hayFalta: true,
  criterio: 'conducta_abusiva',
  severidad: 'media',
  confianza: 0.9,
  accionSugerida: 'advertir',
  extracto: 'sos un inútil',
  razon: 'insulto personal dirigido al usuario',
}

describe('hashContenido', () => {
  it('es determinista para el mismo texto', () => {
    expect(hashContenido('hola mundo')).toBe(hashContenido('hola mundo'))
  })

  it('ignora espacios en los bordes (no re-analiza por whitespace)', () => {
    expect(hashContenido('  hola  ')).toBe(hashContenido('hola'))
  })

  it('cambia cuando el texto cambia (una edición se re-analiza)', () => {
    expect(hashContenido('hola')).not.toBe(hashContenido('hola!'))
  })
})

describe('esAnalizable', () => {
  it('descarta vacío y textos demasiado cortos', () => {
    expect(esAnalizable('')).toBe(false)
    expect(esAnalizable('   ')).toBe(false)
    expect(esAnalizable('a')).toBe(false)
  })

  it('acepta textos con suficiente contenido', () => {
    expect(esAnalizable('ok')).toBe(true)
    expect(esAnalizable('un mensaje normal')).toBe(true)
  })
})

describe('debeGenerarReporte', () => {
  it('genera reporte cuando hay falta con confianza suficiente', () => {
    expect(debeGenerarReporte(veredictoBase)).toBe(true)
  })

  it('no genera si no hay falta', () => {
    expect(debeGenerarReporte({ ...veredictoBase, hayFalta: false })).toBe(
      false,
    )
  })

  it("no genera si el criterio es 'ninguno'", () => {
    expect(debeGenerarReporte({ ...veredictoBase, criterio: 'ninguno' })).toBe(
      false,
    )
  })

  it('no genera bajo el umbral de confianza (sesgo a ignorar)', () => {
    expect(
      debeGenerarReporte({
        ...veredictoBase,
        confianza: UMBRAL_CONFIANZA_REPORTE - 0.01,
      }),
    ).toBe(false)
  })
})

describe('accionConPiso', () => {
  it('respeta strike con confianza alta', () => {
    expect(
      accionConPiso({
        ...veredictoBase,
        accionSugerida: 'strike',
        confianza: UMBRAL_CONFIANZA_STRIKE,
      }),
    ).toBe('strike')
  })

  it('degrada strike a advertir con confianza baja', () => {
    expect(
      accionConPiso({
        ...veredictoBase,
        accionSugerida: 'strike',
        confianza: UMBRAL_CONFIANZA_STRIKE - 0.1,
      }),
    ).toBe('advertir')
  })

  it('no toca advertir ni ignorar', () => {
    expect(
      accionConPiso({ ...veredictoBase, accionSugerida: 'advertir' }),
    ).toBe('advertir')
    expect(accionConPiso({ ...veredictoBase, accionSugerida: 'ignorar' })).toBe(
      'ignorar',
    )
  })
})

describe('construirReporteIa', () => {
  const params = {
    idReportado: '11111111-1111-1111-1111-111111111111',
    entidad: 'mensaje' as const,
    idEntidad: '22222222-2222-2222-2222-222222222222',
    veredicto: veredictoBase,
    modelo: 'openai/gpt-4o-mini',
  }

  it('marca origen ia y sin denunciante humano', () => {
    const row = construirReporteIa(params)
    expect(row.origen).toBe('ia')
    expect(row.id_reportante).toBeNull()
    expect(row.id_reportado).toBe(params.idReportado)
  })

  it('mapea criterio a tipo_reporte y conserva el puntero polimórfico', () => {
    const row = construirReporteIa(params)
    expect(row.tipo_reporte).toBe('conducta_abusiva')
    expect(row.entidad).toBe('mensaje')
    expect(row.id_entidad).toBe(params.idEntidad)
  })

  it('usa un texto por defecto si el modelo no dio razón', () => {
    const row = construirReporteIa({
      ...params,
      veredicto: { ...veredictoBase, razon: '   ' },
    })
    expect(row.descripcion.length).toBeGreaterThan(0)
  })
})
