import { describe, it, expect } from 'vitest'
import { computeEstadoEntregable } from './entregable-estado-logic'

describe('computeEstadoEntregable', () => {
  it('retorna cerrada si la tarea fue aprobada, sin importar las propuestas', () => {
    expect(
      computeEstadoEntregable('aprobada', [
        { estado: 'enviado', cargado_at: '2026-07-05T10:00:00Z' },
      ]),
    ).toBe('cerrada')
  })

  it('retorna abierta si la tarea está abierta y no hay propuestas', () => {
    expect(computeEstadoEntregable('abierta', [])).toBe('abierta')
  })

  it('retorna en_revision si la última propuesta está enviada', () => {
    expect(
      computeEstadoEntregable('abierta', [
        { estado: 'enviado', cargado_at: '2026-07-05T10:00:00Z' },
      ]),
    ).toBe('en_revision')
  })

  it('retorna requiere_cambios si la última propuesta pidió cambios', () => {
    expect(
      computeEstadoEntregable('abierta', [
        { estado: 'con_cambios', cargado_at: '2026-07-05T10:00:00Z' },
      ]),
    ).toBe('requiere_cambios')
  })

  it('usa la propuesta más reciente aunque el orden de entrada sea inverso', () => {
    expect(
      computeEstadoEntregable('abierta', [
        { estado: 'con_cambios', cargado_at: '2026-07-05T12:00:00Z' },
        { estado: 'enviado', cargado_at: '2026-07-05T09:00:00Z' },
      ]),
    ).toBe('requiere_cambios')
  })
})
