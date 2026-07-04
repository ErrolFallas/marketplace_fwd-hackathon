import { describe, it, expect } from 'vitest'
import {
  computeParticipacionProgress,
  type ParticipacionTimestamps,
} from './progress-logic'

const BASE: ParticipacionTimestamps = {
  fechaPostulacion: '2026-01-01T10:00:00Z',
  revisionIniciadaAt: null,
  adjudicadaAt: null,
  noSeleccionadaAt: null,
  retiradaAt: null,
}

describe('computeParticipacionProgress', () => {
  it('enviada: sobre sellado, hito 1 actual y el resto pendiente', () => {
    const p = computeParticipacionProgress('enviada', BASE)
    expect(p.outcome).toBe('pending')
    expect(p.resultadoEstado).toBeNull()
    expect(p.steps.map((s) => s.status)).toEqual([
      'current',
      'pending',
      'pending',
    ])
    expect(p.steps[0].date).toBe(BASE.fechaPostulacion)
  })

  it('en_revision: hito 1 hecho (fechado), hito 2 actual con su fecha', () => {
    const p = computeParticipacionProgress('en_revision', {
      ...BASE,
      revisionIniciadaAt: '2026-01-03T09:00:00Z',
    })
    expect(p.outcome).toBe('pending')
    expect(p.steps.map((s) => s.status)).toEqual(['done', 'current', 'pending'])
    expect(p.steps[1].date).toBe('2026-01-03T09:00:00Z')
  })

  it('contratada: desenlace positivo, los tres hitos hechos y fechados', () => {
    const p = computeParticipacionProgress('contratada', {
      ...BASE,
      revisionIniciadaAt: '2026-01-03T09:00:00Z',
      adjudicadaAt: '2026-01-05T12:00:00Z',
    })
    expect(p.outcome).toBe('positive')
    expect(p.resultadoEstado).toBe('contratada')
    expect(p.steps.map((s) => s.status)).toEqual(['done', 'done', 'done'])
    expect(p.steps[2].date).toBe('2026-01-05T12:00:00Z')
  })

  it('finalizada: también es positivo y conserva su etiqueta', () => {
    const p = computeParticipacionProgress('finalizada', {
      ...BASE,
      revisionIniciadaAt: '2026-01-03T09:00:00Z',
      adjudicadaAt: '2026-01-05T12:00:00Z',
    })
    expect(p.outcome).toBe('positive')
    expect(p.resultadoEstado).toBe('finalizada')
  })

  it('no_seleccionada tras revisión: hito 2 hecho, resultado failed y fechado', () => {
    const p = computeParticipacionProgress('no_seleccionada', {
      ...BASE,
      revisionIniciadaAt: '2026-01-03T09:00:00Z',
      noSeleccionadaAt: '2026-01-06T08:00:00Z',
    })
    expect(p.outcome).toBe('negative')
    expect(p.resultadoEstado).toBe('no_seleccionada')
    expect(p.steps.map((s) => s.status)).toEqual(['done', 'done', 'failed'])
    expect(p.steps[2].date).toBe('2026-01-06T08:00:00Z')
  })

  it('no_seleccionada DERIVADA (nunca abrieron el sobre): hito 2 queda pendiente', () => {
    // RF-32: proyecto adjudicado a otro; la oferta seguía `enviada` sin abrir.
    const p = computeParticipacionProgress('no_seleccionada', BASE)
    expect(p.outcome).toBe('negative')
    expect(p.steps.map((s) => s.status)).toEqual(['done', 'pending', 'failed'])
    expect(p.steps[1].date).toBeNull()
  })

  it('retirada: aborto por el egresado, resultado failed con fecha de retiro', () => {
    const p = computeParticipacionProgress('retirada', {
      ...BASE,
      retiradaAt: '2026-01-04T15:00:00Z',
    })
    expect(p.outcome).toBe('aborted')
    expect(p.resultadoEstado).toBe('retirada')
    expect(p.steps[2].status).toBe('failed')
    expect(p.steps[2].date).toBe('2026-01-04T15:00:00Z')
  })

  it('cancelada: aborto por la empresa, sin timestamp en la participación', () => {
    const p = computeParticipacionProgress('cancelada', BASE)
    expect(p.outcome).toBe('aborted')
    expect(p.resultadoEstado).toBe('cancelada')
    expect(p.steps[2].status).toBe('failed')
    expect(p.steps[2].date).toBeNull()
  })
})
