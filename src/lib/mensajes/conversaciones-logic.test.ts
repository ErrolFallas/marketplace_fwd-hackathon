import { describe, it, expect } from 'vitest'
import {
  classifyDay,
  isSameLocalDay,
  sortConversacionesByActividad,
  startOfLocalDay,
} from './conversaciones-logic'

describe('startOfLocalDay', () => {
  it('lleva la hora a medianoche local sin cambiar el día', () => {
    const resultado = startOfLocalDay(new Date(2026, 5, 15, 23, 59, 59))
    expect(resultado.getFullYear()).toBe(2026)
    expect(resultado.getMonth()).toBe(5)
    expect(resultado.getDate()).toBe(15)
    expect(resultado.getHours()).toBe(0)
    expect(resultado.getMinutes()).toBe(0)
  })
})

describe('classifyDay', () => {
  const ahora = new Date(2026, 6, 3, 14, 30)

  it('clasifica el mismo día como today aunque la hora sea distinta', () => {
    expect(classifyDay(new Date(2026, 6, 3, 8, 0), ahora)).toBe('today')
  })

  it('clasifica el día anterior como yesterday', () => {
    expect(classifyDay(new Date(2026, 6, 2, 23, 0), ahora)).toBe('yesterday')
  })

  it('clasifica dos o más días atrás como older', () => {
    expect(classifyDay(new Date(2026, 6, 1, 12, 0), ahora)).toBe('older')
  })

  it('cruza el límite de mes correctamente', () => {
    const primeroDeJulio = new Date(2026, 6, 1, 9, 0)
    const treintaDeJunio = new Date(2026, 5, 30, 23, 0)
    expect(classifyDay(treintaDeJunio, primeroDeJulio)).toBe('yesterday')
  })

  it('trata una fecha futura del mismo día como today', () => {
    expect(classifyDay(new Date(2026, 6, 3, 23, 0), ahora)).toBe('today')
  })
})

describe('isSameLocalDay', () => {
  it('es true para horas distintas del mismo día', () => {
    expect(
      isSameLocalDay(new Date(2026, 6, 3, 1, 0), new Date(2026, 6, 3, 22, 0)),
    ).toBe(true)
  })

  it('es false para días distintos', () => {
    expect(
      isSameLocalDay(new Date(2026, 6, 3, 23, 59), new Date(2026, 6, 4, 0, 1)),
    ).toBe(false)
  })
})

describe('sortConversacionesByActividad', () => {
  it('ordena por fecha descendente (más reciente primero)', () => {
    const entrada = [
      { id: 'a', ultimoMensajeFecha: '2026-07-01T10:00:00Z' },
      { id: 'b', ultimoMensajeFecha: '2026-07-03T10:00:00Z' },
      { id: 'c', ultimoMensajeFecha: '2026-07-02T10:00:00Z' },
    ]
    const orden = sortConversacionesByActividad(entrada).map((c) => c.id)
    expect(orden).toEqual(['b', 'c', 'a'])
  })

  it('coloca las conversaciones sin mensajes al final', () => {
    const entrada = [
      { id: 'sin', ultimoMensajeFecha: null },
      { id: 'con', ultimoMensajeFecha: '2026-07-01T10:00:00Z' },
    ]
    const orden = sortConversacionesByActividad(entrada).map((c) => c.id)
    expect(orden).toEqual(['con', 'sin'])
  })

  it('no muta el arreglo de entrada', () => {
    const entrada = [
      { id: 'a', ultimoMensajeFecha: '2026-07-01T10:00:00Z' },
      { id: 'b', ultimoMensajeFecha: '2026-07-03T10:00:00Z' },
    ]
    const copia = [...entrada]
    sortConversacionesByActividad(entrada)
    expect(entrada).toEqual(copia)
  })
})
