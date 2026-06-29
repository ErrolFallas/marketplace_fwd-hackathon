import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))
vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))

import {
  getMarketplaceProjects,
  getMarketplaceProjectById,
  checkIfApplied,
} from './marketplace'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const mockedServer = vi.mocked(createSupabaseServerClient)

const USER_ID = 'usr-1'
const EST_ID = 'est-1'
const PROJ_ID = 'proj-1'

const mockProjectRow = {
  id_proyecto: PROJ_ID,
  titulo: 'App de ventas',
  descripcion: 'Sistema de ventas',
  id_empresario: 'emp-1',
  estado: 'abierto',
  modalidad: 'remoto',
  moneda: 'USD',
  presupuesto_min: 500,
  presupuesto_max: 1500,
  fecha_publicacion: '2024-06-01T00:00:00Z',
  fecha_cierre: '2024-06-08T00:00:00Z',
  created_at: '2024-06-01T00:00:00Z',
  is_active: true,
  proyecto_tecnologias: [
    { tecnologias: { nombre: 'React' } },
    { tecnologias: null },
  ],
}

type QueryResult = { data: unknown; error: unknown }

const DEFAULT_NAMES: QueryResult = {
  data: [{ id_empresario: 'emp-1', nombre_empresa: 'Tech Corp' }],
  error: null,
}

/**
 * Cliente Supabase mockeado para `getMarketplaceProjects`: la query de
 * `proyectos` (select→eq→in→order) y el lookup de nombres en la vista
 * `empresarios_public` (select→in).
 */
function listClient(projects: QueryResult, names: QueryResult = DEFAULT_NAMES) {
  return {
    from: vi.fn((table: string) => {
      if (table === 'empresarios_public') {
        return {
          select: vi.fn(() => ({
            in: vi.fn().mockResolvedValue(names),
          })),
        }
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            in: vi.fn(() => ({
              order: vi.fn().mockResolvedValue(projects),
            })),
          })),
        })),
      }
    }),
  } as never
}

/**
 * Cliente Supabase mockeado para `getMarketplaceProjectById`: la query de
 * `proyectos` (select→eq→single) más el lookup en `empresarios_public`.
 */
function byIdClient(project: QueryResult, names: QueryResult = DEFAULT_NAMES) {
  return {
    from: vi.fn((table: string) => {
      if (table === 'empresarios_public') {
        return {
          select: vi.fn(() => ({
            in: vi.fn().mockResolvedValue(names),
          })),
        }
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue(project),
          })),
        })),
      }
    }),
  } as never
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────
// getMarketplaceProjects
// ─────────────────────────────────────────────────────────────────────────────

describe('getMarketplaceProjects', () => {
  it('retorna lista de proyectos activos', async () => {
    mockedServer.mockResolvedValue(
      listClient({ data: [mockProjectRow], error: null }),
    )

    const result = await getMarketplaceProjects()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toMatchObject({
        id: PROJ_ID,
        title: 'App de ventas',
        companyName: 'Tech Corp',
        stack: ['React'],
      })
    }
  })

  it('mapea los campos derivados: estado a status, modalidad y duración', async () => {
    mockedServer.mockResolvedValue(
      listClient({ data: [mockProjectRow], error: null }),
    )

    const result = await getMarketplaceProjects()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data[0]?.status).toBe('active')
      expect(result.data[0]?.mode).toBe('remoto')
      expect(result.data[0]?.durationDays).toBe(7)
    }
  })

  it('deja companyName vacío si la vista no devuelve la empresa (i18n lo rotula)', async () => {
    mockedServer.mockResolvedValue(
      listClient(
        { data: [mockProjectRow], error: null },
        { data: [], error: null },
      ),
    )

    const result = await getMarketplaceProjects()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data[0]?.companyName).toBe('')
    }
  })

  it('retorna database_error si la query falla', async () => {
    mockedServer.mockResolvedValue(
      listClient({ data: null, error: { message: 'db error' } }),
    )

    const result = await getMarketplaceProjects()
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('database_error')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// getMarketplaceProjectById
// ─────────────────────────────────────────────────────────────────────────────

describe('getMarketplaceProjectById', () => {
  it('retorna el proyecto por ID', async () => {
    mockedServer.mockResolvedValue(
      byIdClient({ data: mockProjectRow, error: null }),
    )

    const result = await getMarketplaceProjectById(PROJ_ID)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.id).toBe(PROJ_ID)
      expect(result.data.title).toBe('App de ventas')
    }
  })

  it('retorna not_found si el error es PGRST116', async () => {
    mockedServer.mockResolvedValue(
      byIdClient({
        data: null,
        error: { code: 'PGRST116', message: 'row not found' },
      }),
    )

    const result = await getMarketplaceProjectById(PROJ_ID)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('not_found')
  })

  it('retorna database_error si el error es de otro tipo', async () => {
    mockedServer.mockResolvedValue(
      byIdClient({
        data: null,
        error: { code: 'OTHER', message: 'db error' },
      }),
    )

    const result = await getMarketplaceProjectById(PROJ_ID)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('database_error')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// checkIfApplied
// ─────────────────────────────────────────────────────────────────────────────

describe('checkIfApplied', () => {
  it('retorna unauthenticated si no hay usuario', async () => {
    mockedServer.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'no auth' },
        }),
      },
      from: vi.fn(),
    } as never)

    const result = await checkIfApplied(PROJ_ID)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('unauthenticated')
  })

  it('retorna estudiante_not_found si no existe el estudiante', async () => {
    mockedServer.mockResolvedValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: USER_ID } }, error: null }),
      },
      from: vi.fn((table: string) => {
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
      }),
    } as never)

    const result = await checkIfApplied(PROJ_ID)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('estudiante_not_found')
  })

  it('retorna false si el estudiante no ha aplicado', async () => {
    mockedServer.mockResolvedValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: USER_ID } }, error: null }),
      },
      from: vi.fn((table: string) => {
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
              maybeSingle: vi
                .fn()
                .mockResolvedValue({ data: null, error: null }),
            })),
          }
        }
        return {}
      }),
    } as never)

    const result = await checkIfApplied(PROJ_ID)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toBe(false)
  })

  it('retorna true si el estudiante ya aplicó', async () => {
    mockedServer.mockResolvedValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: USER_ID } }, error: null }),
      },
      from: vi.fn((table: string) => {
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
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id_participacion: 'part-1' },
                error: null,
              }),
            })),
          }
        }
        return {}
      }),
    } as never)

    const result = await checkIfApplied(PROJ_ID)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toBe(true)
  })
})
