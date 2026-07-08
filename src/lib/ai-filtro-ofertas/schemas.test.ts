import { describe, it, expect } from 'vitest'
import { revisionModeloSchema } from './schemas'

describe('revisionModeloSchema', () => {
  it('rellena por defecto con sesgo advisory (relacionada=true)', () => {
    const r = revisionModeloSchema.parse({})
    expect(r).toEqual({
      relacionada: true,
      intentoManipulacion: false,
      problemas: [],
      sugerencias: [],
    })
  })

  it('acepta booleanos como string', () => {
    const r = revisionModeloSchema.parse({
      relacionada: 'false',
      intentoManipulacion: 'true',
    })
    expect(r.relacionada).toBe(false)
    expect(r.intentoManipulacion).toBe(true)
  })

  it('descarta códigos de problema inventados y deduplica', () => {
    const r = revisionModeloSchema.parse({
      problemas: ['area_no_coincide', 'no_existe', 'area_no_coincide'],
    })
    expect(r.problemas).toEqual(['area_no_coincide'])
  })

  it('descarta sugerencias fuera del catálogo', () => {
    const r = revisionModeloSchema.parse({
      sugerencias: ['agregar_enlace_github', 'haceme_un_cafe'],
    })
    expect(r.sugerencias).toEqual(['agregar_enlace_github'])
  })

  it('tolera problemas que no son array', () => {
    const r = revisionModeloSchema.parse({ problemas: 'area_no_coincide' })
    expect(r.problemas).toEqual([])
  })
})
