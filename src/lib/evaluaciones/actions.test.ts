import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: vi.fn(),
}))
vi.mock('@/lib/auth/guards', () => ({
  requireRole: vi.fn(),
  requireVerifiedEgresado: vi.fn(),
}))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn(), info: vi.fn() } }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { getAllEgresadoRatingsForAdmin } from './actions'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'

const mockedAdmin = vi.mocked(createSupabaseAdminClient)
const mockedRequireRole = vi.mocked(requireRole)

beforeEach(() => {
  vi.clearAllMocks()
  mockedRequireRole.mockResolvedValue({ ok: true, data: 'administrador' })
})

describe('getAllEgresadoRatingsForAdmin', () => {
  it('propaga el error si el caller no es admin', async () => {
    mockedRequireRole.mockResolvedValue({ ok: false, error: 'forbidden' })
    const result = await getAllEgresadoRatingsForAdmin()
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('forbidden')
  })

  it('devuelve lista vacía si no hay calificaciones', async () => {
    mockedAdmin.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
    } as never)

    const result = await getAllEgresadoRatingsForAdmin()
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toEqual([])
  })

  it('mapea la calificación empresa->egresado', async () => {
    const mockRow = {
      id_evaluacion: 'eval-1',
      id_contratacion: 'contract-1',
      puntuacion: 5,
      comentario: 'Gran trabajo',
      evaluado_at: '2024-06-01T10:00:00Z',
      estudiantes: {
        usuarios: { nombre: 'Ana', apellido_1: 'García', apellido_2: null },
      },
      empresarios: {
        nombre_empresa: 'Tech Corp',
        usuarios: { nombre: 'Carlos', apellido_1: 'López', apellido_2: null },
      },
      contrataciones: {
        participaciones: { proyectos: { titulo: 'App móvil' } },
      },
    }

    mockedAdmin.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: [mockRow], error: null }),
        })),
      })),
    } as never)

    const result = await getAllEgresadoRatingsForAdmin()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toMatchObject({
        idEvaluacion: 'eval-1',
        proyectoTitulo: 'App móvil',
        nombreEgresado: 'Ana García',
        nombreEmpresa: 'Tech Corp',
        puntuacion: 5,
      })
    }
  })

  it('usa el nombre del representante y título vacío si faltan datos', async () => {
    const mockRow = {
      id_evaluacion: 'eval-2',
      id_contratacion: 'contract-2',
      puntuacion: 3,
      comentario: null,
      evaluado_at: '2024-06-02T10:00:00Z',
      estudiantes: {
        usuarios: { nombre: 'Luis', apellido_1: 'Pérez', apellido_2: null },
      },
      empresarios: {
        nombre_empresa: null,
        usuarios: { nombre: 'Marta', apellido_1: 'Ruíz', apellido_2: null },
      },
      contrataciones: null,
    }

    mockedAdmin.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: [mockRow], error: null }),
        })),
      })),
    } as never)

    const result = await getAllEgresadoRatingsForAdmin()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data[0]?.proyectoTitulo).toBe('')
      expect(result.data[0]?.nombreEmpresa).toBe('Marta Ruíz')
    }
  })

  it('devuelve error si la query falla', async () => {
    mockedAdmin.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'db error' } }),
        })),
      })),
    } as never)

    const result = await getAllEgresadoRatingsForAdmin()
    expect(result.ok).toBe(false)
  })
})
