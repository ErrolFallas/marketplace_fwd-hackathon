import { describe, it, expect } from 'vitest'
import {
  construirDetalle,
  estadoDesdeModelo,
  hashContenidoRevisado,
} from './review-logic'
import type { RevisionModelo } from './schemas'

const base: RevisionModelo = {
  relacionada: true,
  intentoManipulacion: false,
  problemas: [],
  sugerencias: [],
}

describe('estadoDesdeModelo', () => {
  it('relacionada true → aprobada', () => {
    expect(estadoDesdeModelo({ ...base, relacionada: true })).toBe('aprobada')
  })
  it('relacionada false → rechazada', () => {
    expect(estadoDesdeModelo({ ...base, relacionada: false })).toBe('rechazada')
  })
})

describe('construirDetalle', () => {
  it('mapea cada problema a su campo como bloqueante', () => {
    const detalle = construirDetalle({
      ...base,
      relacionada: false,
      problemas: ['carta_fuera_de_tema', 'area_no_coincide'],
    })
    expect(detalle.items).toEqual([
      {
        campo: 'carta_postulacion',
        tipo: 'bloqueante',
        codigo: 'carta_fuera_de_tema',
      },
      { campo: 'general', tipo: 'bloqueante', codigo: 'area_no_coincide' },
    ])
  })

  it('mapea sugerencias a su campo (incluso si está aprobada)', () => {
    const detalle = construirDetalle({
      ...base,
      sugerencias: ['agregar_enlace_github', 'ampliar_carta'],
    })
    expect(detalle.items).toEqual([
      {
        campo: 'prototipo',
        tipo: 'sugerencia',
        codigo: 'agregar_enlace_github',
      },
      {
        campo: 'carta_postulacion',
        tipo: 'sugerencia',
        codigo: 'ampliar_carta',
      },
    ])
  })

  it('propaga intentoManipulacion', () => {
    expect(
      construirDetalle({ ...base, intentoManipulacion: true })
        .intentoManipulacion,
    ).toBe(true)
  })
})

describe('hashContenidoRevisado', () => {
  it('es estable para el mismo contenido y no depende de bordes', () => {
    const a = hashContenidoRevisado('  hola  ', 'mundo')
    const b = hashContenidoRevisado('hola', '  mundo  ')
    expect(a).toBe(b)
  })

  it('cambia si el texto cambia', () => {
    const a = hashContenidoRevisado('planteamiento uno', 'carta')
    const b = hashContenidoRevisado('planteamiento dos', 'carta')
    expect(a).not.toBe(b)
  })

  it('trata carta null y vacía por igual', () => {
    expect(hashContenidoRevisado('x', null)).toBe(
      hashContenidoRevisado('x', ''),
    )
  })
})
