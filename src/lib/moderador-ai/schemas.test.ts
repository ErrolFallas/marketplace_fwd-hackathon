import { describe, it, expect } from 'vitest'
import { veredictoSchema } from './schemas'

describe('veredictoSchema (parser tolerante con sesgo a la seguridad)', () => {
  it('acepta un veredicto bien formado', () => {
    const parsed = veredictoSchema.parse({
      hayFalta: true,
      criterio: 'conducta_abusiva',
      severidad: 'alta',
      confianza: 0.92,
      accionSugerida: 'strike',
      extracto: 'texto ofensivo',
      razon: 'amenaza directa',
    })
    expect(parsed.hayFalta).toBe(true)
    expect(parsed.confianza).toBe(0.92)
  })

  it('coerciona booleanos y números en string (JSON flojo del modelo)', () => {
    const parsed = veredictoSchema.parse({
      hayFalta: 'true',
      criterio: 'spam',
      severidad: 'baja',
      confianza: '0.7',
      accionSugerida: 'advertir',
      extracto: '',
      razon: 'publicidad repetida',
    })
    expect(parsed.hayFalta).toBe(true)
    expect(parsed.confianza).toBe(0.7)
  })

  it('recorta la confianza fuera de rango a [0,1]', () => {
    expect(
      veredictoSchema.parse({
        hayFalta: true,
        criterio: 'conducta_abusiva',
        severidad: 'alta',
        confianza: 1.5,
        accionSugerida: 'advertir',
        extracto: 'x',
        razon: 'y',
      }).confianza,
    ).toBe(1)
    expect(
      veredictoSchema.parse({
        hayFalta: false,
        criterio: 'ninguno',
        severidad: 'baja',
        confianza: -3,
        accionSugerida: 'ignorar',
        extracto: '',
        razon: 'ok',
      }).confianza,
    ).toBe(0)
  })

  it('mapea valores desconocidos al valor seguro por defecto', () => {
    const parsed = veredictoSchema.parse({
      hayFalta: true,
      criterio: 'algo_inventado',
      severidad: 'gravisima',
      confianza: 0.6,
      accionSugerida: 'expulsar',
      extracto: 'x',
      razon: 'y',
    })
    expect(parsed.criterio).toBe('ninguno')
    expect(parsed.severidad).toBe('baja')
    expect(parsed.accionSugerida).toBe('ignorar')
  })

  it('convierte confianza basura en 0 (no acusar ante la duda)', () => {
    const parsed = veredictoSchema.parse({
      hayFalta: true,
      criterio: 'conducta_abusiva',
      severidad: 'media',
      confianza: 'no-numero',
      accionSugerida: 'advertir',
      extracto: 'x',
      razon: 'y',
    })
    expect(parsed.confianza).toBe(0)
  })
})
