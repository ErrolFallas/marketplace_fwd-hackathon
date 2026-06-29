import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NotificacionItem } from '@/lib/notifications/actions'

vi.mock('@/lib/notifications/actions', () => ({
  getMiResumenNotificaciones: vi.fn(),
  marcarNotificacionLeida: vi.fn(),
  marcarTodasMisNotificacionesLeidas: vi.fn(),
}))

import {
  getMiResumenNotificaciones,
  marcarNotificacionLeida,
} from '@/lib/notifications/actions'
import {
  computeBackoffDelay,
  getResumenSnapshot,
  getResumenServerSnapshot,
  marcarUnaComoLeida,
  refrescarResumen,
  resetStoreForTests,
} from './notifications-poll-store'

function crearNotificacion(
  overrides: Partial<NotificacionItem> = {},
): NotificacionItem {
  return {
    id_notificacion: 'n1',
    mensaje: 'hola',
    tipo_evento: 'mensaje_nuevo',
    leida: false,
    url_destino: null,
    generada_at: '2026-01-01T00:00:00.000Z',
    params: null,
    ...overrides,
  }
}

beforeEach(() => {
  resetStoreForTests()
  vi.clearAllMocks()
})

afterEach(() => {
  resetStoreForTests()
})

describe('computeBackoffDelay', () => {
  it('devuelve el intervalo base cuando no hay fallos', () => {
    expect(computeBackoffDelay(0)).toBe(60_000)
  })

  it('crece exponencialmente y respeta el techo', () => {
    expect(computeBackoffDelay(1)).toBe(120_000)
    expect(computeBackoffDelay(2)).toBe(240_000)
    expect(computeBackoffDelay(99)).toBe(300_000)
  })
})

describe('snapshot', () => {
  it('arranca vacío y devuelve una referencia estable', () => {
    const primero = getResumenSnapshot()
    const segundo = getResumenSnapshot()
    expect(primero).toBe(segundo)
    expect(primero.estado).toBe('inicial')
    expect(primero.conteoNoLeidas).toBe(0)
    expect(getResumenServerSnapshot().estado).toBe('inicial')
  })
})

describe('refrescarResumen', () => {
  it('carga lista y conteo cuando la lectura tiene éxito', async () => {
    vi.mocked(getMiResumenNotificaciones).mockResolvedValue({
      ok: true,
      data: { notificaciones: [crearNotificacion()], conteoNoLeidas: 1 },
    })

    refrescarResumen()
    await vi.waitFor(() => expect(getResumenSnapshot().estado).toBe('listo'))

    expect(getResumenSnapshot().conteoNoLeidas).toBe(1)
    expect(getResumenSnapshot().notificaciones).toHaveLength(1)
  })

  it('marca el estado como error cuando la lectura falla', async () => {
    vi.mocked(getMiResumenNotificaciones).mockResolvedValue({
      ok: false,
      error: 'boom',
    })

    refrescarResumen()
    await vi.waitFor(() => expect(getResumenSnapshot().estado).toBe('error'))

    expect(getResumenSnapshot().conteoNoLeidas).toBe(0)
  })
})

describe('marcarUnaComoLeida', () => {
  it('revierte el optimismo si la mutación falla', async () => {
    vi.mocked(getMiResumenNotificaciones).mockResolvedValue({
      ok: true,
      data: {
        notificaciones: [crearNotificacion({ leida: false })],
        conteoNoLeidas: 1,
      },
    })
    refrescarResumen()
    await vi.waitFor(() => expect(getResumenSnapshot().estado).toBe('listo'))

    vi.mocked(marcarNotificacionLeida).mockResolvedValue({
      ok: false,
      error: 'boom',
    })
    await marcarUnaComoLeida('n1')

    expect(getResumenSnapshot().conteoNoLeidas).toBe(1)
    expect(getResumenSnapshot().notificaciones[0]?.leida).toBe(false)
  })

  it('mantiene el optimismo si la mutación tiene éxito', async () => {
    vi.mocked(getMiResumenNotificaciones).mockResolvedValue({
      ok: true,
      data: {
        notificaciones: [crearNotificacion({ leida: false })],
        conteoNoLeidas: 1,
      },
    })
    refrescarResumen()
    await vi.waitFor(() => expect(getResumenSnapshot().estado).toBe('listo'))

    vi.mocked(marcarNotificacionLeida).mockResolvedValue({
      ok: true,
      data: undefined,
    })
    await marcarUnaComoLeida('n1')

    expect(getResumenSnapshot().conteoNoLeidas).toBe(0)
    expect(getResumenSnapshot().notificaciones[0]?.leida).toBe(true)
  })
})
