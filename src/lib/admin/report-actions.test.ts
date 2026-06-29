import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))
vi.mock('@/lib/auth/guards', () => ({ requireRole: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createSupabaseAdminClient: vi.fn() }))

import { exportProyectosCSV } from './report-actions'
import { requireRole } from '@/lib/auth/guards'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const mockedRequireRole = vi.mocked(requireRole)
const mockedAdmin = vi.mocked(createSupabaseAdminClient)

beforeEach(() => {
  vi.clearAllMocks()
  mockedRequireRole.mockResolvedValue({ ok: true, data: 'administrador' })
})

/**
 * Mock de la query de `proyectos`: soporta `.select().order()` y los
 * `.gte()/.lte()` opcionales del filtro de fechas, y es awaitable (resuelve con
 * `result`). Captura el argumento de `select` para poder verificar el embed FK.
 */
function mockProyectosQuery(result: { data: unknown; error: unknown }) {
  const selectSpy = vi.fn()
  const builder: Record<string, unknown> = {}
  const p = Promise.resolve(result)
  Object.assign(builder, {
    select: selectSpy.mockReturnValue(builder),
    order: () => builder,
    gte: () => builder,
    lte: () => builder,
    then: p.then.bind(p),
    catch: p.catch.bind(p),
    finally: p.finally.bind(p),
  })
  mockedAdmin.mockReturnValue({ from: vi.fn(() => builder) } as never)
  return { selectSpy }
}

const PROYECTO_BASE = {
  id_proyecto: 'p1',
  titulo: 'App de inventario',
  modalidad: 'remoto',
  estado: 'abierto',
  fecha_publicacion: '2026-06-01T00:00:00.000Z',
  presupuesto_max: 1000,
}

describe('exportProyectosCSV', () => {
  it('propaga el error si el caller no es admin', async () => {
    mockedRequireRole.mockResolvedValue({ ok: false, error: 'forbidden' })

    const result = await exportProyectosCSV({})

    expect(result).toEqual({ ok: false, error: 'forbidden' })
    expect(mockedAdmin).not.toHaveBeenCalled()
  })

  it('muestra nombre_empresa y embebe por la ruta FK correcta (regresión #11)', async () => {
    const { selectSpy } = mockProyectosQuery({
      data: [
        {
          ...PROYECTO_BASE,
          empresarios: {
            nombre_empresa: 'Acme Corp',
            usuarios: { nombre: 'Ana', apellido_1: 'Pérez', apellido_2: null },
          },
        },
      ],
      error: null,
    })

    const result = await exportProyectosCSV({})

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('"Acme Corp"')
      expect(result.data).not.toContain('"Desconocido"')
    }

    // Guardia del bug: el embed DEBE ir por `empresarios` (ese FK referencia
    // empresarios, no usuarios) y luego empresarios→usuarios. Si alguien
    // revierte al hint mal formado `usuarios!proyectos_id_empresario_fkey`,
    // esta aserción falla.
    const selectArg = selectSpy.mock.calls[0]?.[0] as string
    expect(selectArg).toContain('empresarios!proyectos_id_empresario_fkey')
    expect(selectArg).toContain('usuarios!empresarios_id_usuario_fkey')
    expect(selectArg).not.toContain('usuarios!proyectos_id_empresario_fkey')
  })

  it('cae al nombre del representante cuando no hay nombre_empresa (emprendedor)', async () => {
    mockProyectosQuery({
      data: [
        {
          ...PROYECTO_BASE,
          empresarios: {
            nombre_empresa: null,
            usuarios: { nombre: 'Ana', apellido_1: 'Pérez', apellido_2: null },
          },
        },
      ],
      error: null,
    })

    const result = await exportProyectosCSV({})

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('"Ana Pérez"')
      expect(result.data).not.toContain('"Desconocido"')
    }
  })

  it('usa "Desconocido" cuando el proyecto no tiene empresario asociado', async () => {
    mockProyectosQuery({
      data: [{ ...PROYECTO_BASE, empresarios: null }],
      error: null,
    })

    const result = await exportProyectosCSV({})

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toContain('"Desconocido"')
  })

  it('usa "Desconocido" cuando el empresario no tiene usuario', async () => {
    mockProyectosQuery({
      data: [
        {
          ...PROYECTO_BASE,
          empresarios: { nombre_empresa: null, usuarios: null },
        },
      ],
      error: null,
    })

    const result = await exportProyectosCSV({})

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toContain('"Desconocido"')
  })

  it('devuelve err con el mensaje si la query falla', async () => {
    mockProyectosQuery({ data: null, error: { message: 'boom' } })

    const result = await exportProyectosCSV({})

    expect(result).toEqual({ ok: false, error: 'boom' })
  })

  it('emite la cabecera CSV esperada', async () => {
    mockProyectosQuery({
      data: [
        {
          ...PROYECTO_BASE,
          empresarios: { usuarios: { nombre: 'Ana', apellido_1: 'Pérez' } },
        },
      ],
      error: null,
    })

    const result = await exportProyectosCSV({})

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.split('\n')[0]).toBe(
        'ID,Titulo,Modalidad,Estado,Empresario,Presupuesto Max,Fecha Publicacion',
      )
    }
  })
})
