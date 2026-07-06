import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))
vi.mock('@/lib/auth/guards', () => ({ requireRole: vi.fn() }))
vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))

import { getMiContratacion } from './queries'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/guards'

const mockedServer = vi.mocked(createSupabaseServerClient)
const mockedRequireRole = vi.mocked(requireRole)

const USER_ID = 'usr-egresado-1'
const EST_ID = 'est-1'
const PROJ_ID = '123e4567-e89b-12d3-a456-426614174000'

function withAuth(fromImpl: (table: string) => unknown) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: USER_ID } },
        error: null,
      }),
    },
    from: vi.fn(fromImpl),
  }
}

function withNoAuth() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'no auth' },
      }),
    },
    from: vi.fn(),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedRequireRole.mockResolvedValue({ ok: true, data: 'egresado' })
})

// ─────────────────────────────────────────────────────────────────────────────
// getMiContratacion
// ─────────────────────────────────────────────────────────────────────────────

describe('getMiContratacion', () => {
  it('propaga error si el rol no es egresado', async () => {
    mockedRequireRole.mockResolvedValue({ ok: false, error: 'forbidden' })
    const result = await getMiContratacion(PROJ_ID)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('forbidden')
  })

  it('retorna unauthenticated si no hay usuario', async () => {
    mockedServer.mockResolvedValue(withNoAuth() as never)
    const result = await getMiContratacion(PROJ_ID)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('unauthenticated')
  })

  it('retorna estudiante_not_found si no existe el estudiante', async () => {
    mockedServer.mockResolvedValue(
      withAuth((table) => {
        if (table === 'estudiantes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'not found' },
                }),
              })),
            })),
          }
        }
        return {}
      }) as never,
    )

    const result = await getMiContratacion(PROJ_ID)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('estudiante_not_found')
  })

  it('retorna null si no hay participación activa', async () => {
    mockedServer.mockResolvedValue(
      withAuth((table) => {
        if (table === 'estudiantes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id_estudiante: EST_ID },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'participaciones') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockReturnThis(),
              in: vi.fn(() => ({
                maybeSingle: vi
                  .fn()
                  .mockResolvedValue({ data: null, error: null }),
              })),
            })),
          }
        }
        return {}
      }) as never,
    )

    const result = await getMiContratacion(PROJ_ID)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toBeNull()
  })

  it('retorna los datos de contratación activa', async () => {
    mockedServer.mockResolvedValue(
      withAuth((table) => {
        if (table === 'estudiantes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id_estudiante: EST_ID },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'participaciones') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockReturnThis(),
              in: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id_participacion: 'part-1' },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'contrataciones') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id_contratacion: 'cont-1',
                    estado_periodo: 'activo',
                    fecha_inicio: '2024-01-01',
                    fecha_fin_estimada: '2024-06-01',
                    monto_acordado: 300,
                    moneda: 'CRC',
                    condiciones_especiales: null,
                    acuerdo_aceptado_at: null,
                  },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'proyectos') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { presupuesto_min: 100, presupuesto_max: 500 },
                  error: null,
                }),
              })),
            })),
          }
        }
        return {}
      }) as never,
    )

    const result = await getMiContratacion(PROJ_ID)
    expect(result.ok).toBe(true)
    if (result.ok && result.data) {
      expect(result.data.id_contratacion).toBe('cont-1')
      expect(result.data.estado_periodo).toBe('activo')
      expect(result.data.monto_acordado).toBe(300)
      expect(result.data.presupuesto_min).toBe(100)
    }
  })

  it('retorna null si existe participación pero no contratación', async () => {
    mockedServer.mockResolvedValue(
      withAuth((table) => {
        if (table === 'estudiantes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id_estudiante: EST_ID },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'participaciones') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockReturnThis(),
              in: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id_participacion: 'part-1' },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'contrataciones') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi
                  .fn()
                  .mockResolvedValue({ data: null, error: null }),
              })),
            })),
          }
        }
        return {}
      }) as never,
    )

    const result = await getMiContratacion(PROJ_ID)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toBeNull()
  })
})
