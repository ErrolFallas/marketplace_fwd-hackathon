import { describe, it, expect, vi, beforeEach } from 'vitest'
import { postularse } from '@/lib/applications/actions'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/guards'
import { verificarLinkVivo } from '@/lib/ai-filtro-ofertas/link-check'
import { ok, err } from '@/lib/result'
import type { UserRole } from '@/types'

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))

vi.mock('@/lib/auth/guards', () => ({
  requireRole: vi.fn(),
  requireVerifiedEgresado: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

// El registro de consentimientos lee cabeceras de la request.
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({ get: vi.fn().mockReturnValue(null) }),
}))

// La comprobación de link vivo hace I/O; se mockea (por defecto responde).
vi.mock('@/lib/ai-filtro-ofertas/link-check', () => ({
  verificarLinkVivo: vi.fn().mockResolvedValue('vivo'),
}))

// El cliente admin sirve para notificar al empresario y registrar consentimientos.
vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'proyectos') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  empresarios: {
                    id_usuario: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
                  },
                },
                error: null,
              }),
            })),
          })),
        }
      }
      // consentimientos: select encadenado + insert
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi
                  .fn()
                  .mockResolvedValue({ data: null, error: null }),
              })),
            })),
          })),
        })),
        insert: vi.fn().mockResolvedValue({ error: null }),
      }
    }),
  })),
}))

const ID_PROYECTO = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

const INPUT_VALIDO = {
  id_proyecto: ID_PROYECTO,
  planteamiento_solucion:
    'Desarrollaré la plataforma usando Next.js y Supabase, integrando pagos con Stripe.',
  prototipo_enlaces: ['https://mi-proto.vercel.app/demo'] as string[],
  carta_postulacion: 'Tengo experiencia en proyectos similares de e-commerce.',
}

interface FormOverrides {
  input?: typeof INPUT_VALIDO
  consentimientoPi?: string
  consentimientoIa?: string
}

// postularse recibe FormData: el documento va como File, los enlaces como JSON y
// los consentimientos como flags de texto.
function buildFormData(overrides: FormOverrides = {}): FormData {
  const input = overrides.input ?? INPUT_VALIDO
  const fd = new FormData()
  fd.append('id_proyecto', input.id_proyecto)
  fd.append('planteamiento_solucion', input.planteamiento_solucion)
  fd.append('carta_postulacion', input.carta_postulacion)
  fd.append('prototipo_enlaces', JSON.stringify(input.prototipo_enlaces))
  fd.append('consentimiento_pi', overrides.consentimientoPi ?? 'true')
  fd.append('consentimiento_ia', overrides.consentimientoIa ?? 'true')
  fd.append(
    'file',
    new File(['contenido del documento'], 'propuesta.pdf', {
      type: 'application/pdf',
    }),
  )
  return fd
}

const PROYECTO_ABIERTO = {
  titulo: 'Plataforma de delivery',
  descripcion: 'App web para pedir comida a restaurantes locales.',
  estado: 'abierto',
  fecha_cierre: null,
  is_active: true,
}

const ESTUDIANTE_VERIFICADO = {
  id_estudiante: 'est-abc-123',
  estado_verificacion: 'verificado',
}

function buildSupabaseMock(
  overrides: {
    estudiante?: unknown
    proyecto?: unknown
    insertError?: unknown
  } = {},
) {
  const estudiante =
    overrides.estudiante !== undefined
      ? overrides.estudiante
      : { data: ESTUDIANTE_VERIFICADO, error: null }

  const proyecto =
    overrides.proyecto !== undefined
      ? overrides.proyecto
      : { data: PROYECTO_ABIERTO, error: null }

  const insertError =
    overrides.insertError !== undefined ? overrides.insertError : null

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'usr-xyz' } },
        error: null,
      }),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi
          .fn()
          .mockResolvedValue({ data: { path: 'subido' }, error: null }),
        remove: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    },
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'estudiantes') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue(estudiante),
        }
      }
      if (table === 'proyectos') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue(proyecto),
        }
      }
      if (table === 'participaciones') {
        return {
          insert: vi.fn().mockResolvedValue({ error: insertError }),
        }
      }
      return {}
    }),
  }
}

describe('postularse — server action de postulaciones', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireRole).mockResolvedValue(ok('egresado' as UserRole))
    vi.mocked(verificarLinkVivo).mockResolvedValue('vivo')
  })

  it('retorna invalid_input si los parámetros no pasan la validación de Zod', async () => {
    const res = await postularse(
      buildFormData({
        input: {
          ...INPUT_VALIDO,
          id_proyecto: 'no-es-uuid',
          planteamiento_solucion: 'corto',
          prototipo_enlaces: [],
        },
      }),
    )
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('invalid_input')
  })

  it('retorna consentimiento_requerido si falta un consentimiento', async () => {
    const res = await postularse(buildFormData({ consentimientoPi: 'false' }))
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('consentimiento_requerido')
  })

  it('retorna link_invalido si un enlace no es https a host público', async () => {
    const res = await postularse(
      buildFormData({
        input: { ...INPUT_VALIDO, prototipo_enlaces: ['http://example.com'] },
      }),
    )
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('link_invalido')
  })

  it('retorna link_sin_respuesta si el link principal no responde', async () => {
    vi.mocked(verificarLinkVivo).mockResolvedValue('sin_respuesta')
    const res = await postularse(buildFormData())
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('link_sin_respuesta')
  })

  it('retorna forbidden si el usuario no tiene rol egresado', async () => {
    vi.mocked(requireRole).mockResolvedValue(err('forbidden'))
    const res = await postularse(buildFormData())
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('forbidden')
  })

  it('retorna unauthenticated si no hay sesión activa', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
      },
    }
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as unknown as Awaited<
        ReturnType<typeof createSupabaseServerClient>
      >,
    )
    const res = await postularse(buildFormData())
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('unauthenticated')
  })

  it('retorna estudiante_not_found si no se encuentra el perfil del egresado', async () => {
    const mockSupabase = buildSupabaseMock({
      estudiante: { data: null, error: { message: 'not found' } },
    })
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as unknown as Awaited<
        ReturnType<typeof createSupabaseServerClient>
      >,
    )
    const res = await postularse(buildFormData())
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('estudiante_not_found')
  })

  it('retorna cuenta_no_verificada si el egresado no está verificado', async () => {
    const mockSupabase = buildSupabaseMock({
      estudiante: {
        data: {
          id_estudiante: 'est-abc-123',
          estado_verificacion: 'pendiente',
        },
        error: null,
      },
    })
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as unknown as Awaited<
        ReturnType<typeof createSupabaseServerClient>
      >,
    )
    const res = await postularse(buildFormData())
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('cuenta_no_verificada')
  })

  it('retorna proyecto_cerrado si el proyecto no está activo', async () => {
    const mockSupabase = buildSupabaseMock({
      proyecto: {
        data: { ...PROYECTO_ABIERTO, is_active: false, estado: 'cerrado' },
        error: null,
      },
    })
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as unknown as Awaited<
        ReturnType<typeof createSupabaseServerClient>
      >,
    )
    const res = await postularse(buildFormData())
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('proyecto_cerrado')
  })

  it('retorna plazo_vencido si la fecha de cierre ya pasó', async () => {
    const mockSupabase = buildSupabaseMock({
      proyecto: {
        data: { ...PROYECTO_ABIERTO, fecha_cierre: '2020-01-01T00:00:00Z' },
        error: null,
      },
    })
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as unknown as Awaited<
        ReturnType<typeof createSupabaseServerClient>
      >,
    )
    const res = await postularse(buildFormData())
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('plazo_vencido')
  })

  it('retorna database_error si falla el insert en Supabase', async () => {
    const mockSupabase = buildSupabaseMock({
      insertError: { message: 'Connection timeout', code: '08006' },
    })
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as unknown as Awaited<
        ReturnType<typeof createSupabaseServerClient>
      >,
    )
    const res = await postularse(buildFormData())
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('database_error')
  })

  it('retorna cupo_excedido si el trigger de Postgres rechaza por cupo', async () => {
    const mockSupabase = buildSupabaseMock({
      insertError: {
        message: 'se superó el cupo máximo de postulaciones activas',
        code: 'P0001',
      },
    })
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as unknown as Awaited<
        ReturnType<typeof createSupabaseServerClient>
      >,
    )
    const res = await postularse(buildFormData())
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('cupo_excedido')
  })

  it('retorna ok cuando todo el flujo es exitoso', async () => {
    const mockSupabase = buildSupabaseMock()
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as unknown as Awaited<
        ReturnType<typeof createSupabaseServerClient>
      >,
    )
    const res = await postularse(buildFormData())
    expect(res.ok).toBe(true)
    expect(verificarLinkVivo).toHaveBeenCalledOnce()
  })
})
