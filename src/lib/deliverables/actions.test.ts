import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))
vi.mock('@/lib/auth/guards', () => ({
  requireVerifiedEgresado: vi.fn(),
  requireVerifiedEmpresario: vi.fn(),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}))
vi.mock('@/lib/notifications/create', () => ({
  crearNotificacion: vi.fn().mockResolvedValue({ ok: true, data: undefined }),
}))
vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import {
  subirPropuesta,
  responderEntregable,
  actualizarUrlProyecto,
} from './actions'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  requireVerifiedEgresado,
  requireVerifiedEmpresario,
} from '@/lib/auth/guards'

const mockedServer = vi.mocked(createSupabaseServerClient)
const mockedVerifiedEgresado = vi.mocked(requireVerifiedEgresado)
const mockedVerifiedEmpresario = vi.mocked(requireVerifiedEmpresario)

const CONT_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const TAREA_UUID = 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const ENTR_UUID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const PROJ_UUID = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const PART_UUID = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const STUD_UUID = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const USER_ID = 'usr-1'

function makeFile(name = 'entregable.pdf') {
  return new File(['contenido del entregable'], name, {
    type: 'application/pdf',
  })
}

// La propuesta viaja por FormData a subirPropuesta: idTarea, idProyecto,
// descripcion (obligatoria), urlEnlace (opcional) y N archivos. Default válido
// (descripción + un PDF), sobreescribible.
function makePropuestaFormData(overrides?: {
  idTarea?: string
  idProyecto?: string
  descripcion?: string
  urlEnlace?: string | null
  archivos?: File[]
}): FormData {
  const formData = new FormData()
  formData.append('idTarea', overrides?.idTarea ?? TAREA_UUID)
  formData.append('idProyecto', overrides?.idProyecto ?? PROJ_UUID)
  formData.append(
    'descripcion',
    overrides && 'descripcion' in overrides
      ? (overrides.descripcion ?? '')
      : 'hice esto',
  )
  const urlEnlace =
    overrides && 'urlEnlace' in overrides ? overrides.urlEnlace : null
  if (urlEnlace) formData.append('urlEnlace', urlEnlace)
  const archivos =
    overrides && 'archivos' in overrides ? overrides.archivos : [makeFile()]
  for (const archivo of archivos ?? []) formData.append('archivos', archivo)
  return formData
}

// Mock del Storage: por defecto upload/remove resuelven sin error; se le puede
// inyectar un error de upload para probar el path `storage_error`.
function makeStorage(uploadError: unknown = null) {
  return {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ error: uploadError }),
      remove: vi.fn().mockResolvedValue({ error: null }),
    })),
  }
}

function withAuth(
  fromImpl: (table: string) => unknown,
  storage: unknown = makeStorage(),
) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: USER_ID } },
        error: null,
      }),
    },
    from: vi.fn(fromImpl),
    storage,
  }
}

type MockChain = {
  eq: () => MockChain
  in: () => MockChain
  order: () => MockChain
  limit: () => MockChain
  maybeSingle: () => Promise<{ data: unknown; error: null }>
}

// Mock de la tabla `entregables`. subirPropuesta la consulta, en orden:
//   - propuesta abierta: select('id_entregable').eq().in('estado').limit().maybeSingle()
//   - version:           select('version').eq().order().limit().maybeSingle()
// y luego insert().select('id_entregable').single() -> { data: {id_entregable}, error }.
// La de propuesta abierta se distingue porque usa .in(); la de version por 'version'.
function makeEntregablesTable({
  maxVersion = null,
  insertError = null,
  openPropuesta = null,
}: {
  maxVersion?: unknown
  insertError?: unknown
  openPropuesta?: unknown
} = {}): unknown {
  return {
    select: (cols: string) => {
      const isVersion = String(cols).includes('version')
      let usedIn = false
      const chain: MockChain = {
        eq: () => chain,
        in: () => {
          usedIn = true
          return chain
        },
        order: () => chain,
        limit: () => chain,
        maybeSingle: () =>
          Promise.resolve({
            data: isVersion ? maxVersion : usedIn ? openPropuesta : null,
            error: null,
          }),
      }
      return chain
    },
    insert: vi.fn(() => ({
      select: () => ({
        single: () =>
          Promise.resolve(
            insertError
              ? { data: null, error: insertError }
              : { data: { id_entregable: ENTR_UUID }, error: null },
          ),
      }),
    })),
  }
}

// fromImpl para subirPropuesta: resuelve la tarea (entregable_tareas), la tabla
// `entregables` y los adjuntos; el resto vacío. Tarea default: abierta y parcial.
function propuestaFrom(
  opts?: Parameters<typeof makeEntregablesTable>[0] & {
    adjuntosError?: unknown
  },
  tarea: unknown = {
    id_contratacion: CONT_UUID,
    tipo_entregable: 'parcial',
    estado: 'abierta',
  },
): (table: string) => unknown {
  return (table) => {
    if (table === 'entregable_tareas') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: tarea, error: null }),
          }),
        }),
      }
    }
    if (table === 'entregables') return makeEntregablesTable(opts)
    if (table === 'entregable_adjuntos') {
      return {
        insert: vi
          .fn()
          .mockResolvedValue({ error: opts?.adjuntosError ?? null }),
      }
    }
    return {}
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedVerifiedEgresado.mockResolvedValue({
    ok: true,
    data: { id_estudiante: STUD_UUID, id_usuario: USER_ID },
  })
  mockedVerifiedEmpresario.mockResolvedValue({
    ok: true,
    data: { id_empresario: 'emp-1', id_usuario: USER_ID },
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// subirPropuesta (reemplaza a subirHito/subirEntregableFinal: la subida ahora
// cuelga de una tarea; cubre su lógica propia + los paths de registrarEntregable)
// ─────────────────────────────────────────────────────────────────────────────

describe('subirPropuesta', () => {
  it('retorna invalid_input si el UUID de tarea es inválido', async () => {
    const result = await subirPropuesta(
      makePropuestaFormData({ idTarea: 'no-uuid' }),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('invalid_input')
  })

  it('retorna invalid_input si la descripción está vacía', async () => {
    const result = await subirPropuesta(
      makePropuestaFormData({ descripcion: '' }),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('invalid_input')
  })

  it('retorna evidencia_requerida si no hay link ni archivos', async () => {
    const result = await subirPropuesta(
      makePropuestaFormData({ urlEnlace: null, archivos: [] }),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('evidencia_requerida')
  })

  it('propaga el error del guard si el egresado no está verificado', async () => {
    mockedVerifiedEgresado.mockResolvedValue({
      ok: false,
      error: 'cuenta_no_verificada',
    })
    const result = await subirPropuesta(makePropuestaFormData())
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('cuenta_no_verificada')
  })

  it('retorna tarea_no_encontrada si la tarea no existe', async () => {
    mockedServer.mockResolvedValue(
      withAuth(propuestaFrom(undefined, null)) as never,
    )
    const result = await subirPropuesta(makePropuestaFormData())
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('tarea_no_encontrada')
  })

  it('retorna tarea_no_abierta si la tarea ya está aprobada', async () => {
    mockedServer.mockResolvedValue(
      withAuth(
        propuestaFrom(undefined, {
          id_contratacion: CONT_UUID,
          tipo_entregable: 'parcial',
          estado: 'aprobada',
        }),
      ) as never,
    )
    const result = await subirPropuesta(makePropuestaFormData())
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('tarea_no_abierta')
  })

  it('retorna propuesta_abierta_existente si ya hay una en revisión', async () => {
    mockedServer.mockResolvedValue(
      withAuth(
        propuestaFrom({ openPropuesta: { id_entregable: ENTR_UUID } }),
      ) as never,
    )
    const result = await subirPropuesta(makePropuestaFormData())
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('propuesta_abierta_existente')
  })

  it('retorna storage_error si falla el upload al storage', async () => {
    mockedServer.mockResolvedValue(
      withAuth(propuestaFrom(), makeStorage({ message: 'boom' })) as never,
    )
    const result = await subirPropuesta(makePropuestaFormData())
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('storage_error')
  })

  it('registra la propuesta con archivos exitosamente', async () => {
    mockedServer.mockResolvedValue(withAuth(propuestaFrom()) as never)
    const result = await subirPropuesta(makePropuestaFormData())
    expect(result.ok).toBe(true)
  })

  it('acepta un PNG con file.type vacío validando por extensión (caso Windows)', async () => {
    mockedServer.mockResolvedValue(withAuth(propuestaFrom()) as never)
    const pngSinType = new File(['imagen'], 'Captura de pantalla.png')
    expect(pngSinType.type).toBe('')
    const result = await subirPropuesta(
      makePropuestaFormData({ archivos: [pngSinType] }),
    )
    expect(result.ok).toBe(true)
  })

  it('retorna tipo_no_permitido si la extensión no está permitida', async () => {
    mockedServer.mockResolvedValue(withAuth(propuestaFrom()) as never)
    const result = await subirPropuesta(
      makePropuestaFormData({ archivos: [new File(['x'], 'archivo.exe')] }),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('tipo_no_permitido')
  })

  it('registra una propuesta solo con link (sin archivos)', async () => {
    mockedServer.mockResolvedValue(withAuth(propuestaFrom()) as never)
    const result = await subirPropuesta(
      makePropuestaFormData({
        urlEnlace: 'https://demo.fwd.cr/cambios',
        archivos: [],
      }),
    )
    expect(result.ok).toBe(true)
  })

  it('usa version incrementada si ya existe una propuesta previa', async () => {
    mockedServer.mockResolvedValue(
      withAuth(propuestaFrom({ maxVersion: { version: 2 } })) as never,
    )
    const result = await subirPropuesta(makePropuestaFormData())
    expect(result.ok).toBe(true)
  })

  it('retorna database_error si el insert de la propuesta falla', async () => {
    mockedServer.mockResolvedValue(
      withAuth(
        propuestaFrom({ insertError: { message: 'insert failed' } }),
      ) as never,
    )
    const result = await subirPropuesta(makePropuestaFormData())
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('database_error')
  })

  it('retorna adjuntos_fallidos si el insert de adjuntos falla', async () => {
    mockedServer.mockResolvedValue(
      withAuth(
        propuestaFrom({ adjuntosError: { message: 'adj failed' } }),
      ) as never,
    )
    const result = await subirPropuesta(makePropuestaFormData())
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('adjuntos_fallidos')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// responderEntregable
// ─────────────────────────────────────────────────────────────────────────────

describe('responderEntregable', () => {
  const validInput = {
    idEntregable: ENTR_UUID,
    decision: 'aprobado' as const,
    comentario: 'Excelente trabajo.',
  }

  it('retorna invalid_input si la decisión no es válida', async () => {
    const result = await responderEntregable({
      idEntregable: ENTR_UUID,
      decision: 'rechazado' as never,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('invalid_input')
  })

  it('propaga el error del guard si el empresario no está verificado', async () => {
    mockedVerifiedEmpresario.mockResolvedValue({
      ok: false,
      error: 'not_verified',
    })
    const result = await responderEntregable(validInput)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('not_verified')
  })

  it('retorna entregable_not_found si el entregable no existe', async () => {
    mockedServer.mockResolvedValue(
      withAuth((table) => {
        if (table === 'entregables') {
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

    const result = await responderEntregable(validInput)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('entregable_not_found')
  })

  it('retorna estado_invalido si el entregable está aprobado', async () => {
    mockedServer.mockResolvedValue(
      withAuth((table) => {
        if (table === 'entregables') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id_entregable: ENTR_UUID,
                    estado: 'aprobado',
                    id_contratacion: CONT_UUID,
                  },
                  error: null,
                }),
              })),
            })),
          }
        }
        return {}
      }) as never,
    )

    const result = await responderEntregable(validInput)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('estado_invalido')
  })

  it('retorna estado_invalido si el entregable está con_cambios', async () => {
    mockedServer.mockResolvedValue(
      withAuth((table) => {
        if (table === 'entregables') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id_entregable: ENTR_UUID,
                    estado: 'con_cambios',
                    id_contratacion: CONT_UUID,
                  },
                  error: null,
                }),
              })),
            })),
          }
        }
        return {}
      }) as never,
    )

    const result = await responderEntregable(validInput)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('estado_invalido')
  })

  it('aprueba el entregable exitosamente', async () => {
    mockedServer.mockResolvedValue(
      withAuth((table) => {
        if (table === 'entregables') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id_entregable: ENTR_UUID,
                    estado: 'enviado',
                    id_contratacion: CONT_UUID,
                  },
                  error: null,
                }),
              })),
            })),
            update: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: null }),
            })),
          }
        }
        if (table === 'contrataciones') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id_participacion: PART_UUID },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'participaciones') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id_proyecto: PROJ_UUID, id_estudiante: STUD_UUID },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'estudiantes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id_usuario: USER_ID },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'empresarios') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id_empresario: 'emp-1' },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'proyectos') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id_proyecto: PROJ_UUID, titulo: 'Proyecto Test' },
                error: null,
              }),
            })),
          }
        }
        if (table === 'comentarios_entregables') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          }
        }
        return {}
      }) as never,
    )

    const result = await responderEntregable(validInput)
    expect(result.ok).toBe(true)
  })

  it('aborta sin cambiar el estado si falla el insert del comentario', async () => {
    const updateSpy = vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }))
    mockedServer.mockResolvedValue(
      withAuth((table) => {
        if (table === 'entregables') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id_entregable: ENTR_UUID,
                    estado: 'enviado',
                    id_contratacion: CONT_UUID,
                  },
                  error: null,
                }),
              })),
            })),
            update: updateSpy,
          }
        }
        if (table === 'contrataciones') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id_participacion: PART_UUID },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'participaciones') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id_proyecto: PROJ_UUID, id_estudiante: STUD_UUID },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'estudiantes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id_usuario: USER_ID },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'empresarios') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id_empresario: 'emp-1' },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'proyectos') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id_proyecto: PROJ_UUID, titulo: 'Proyecto Test' },
                error: null,
              }),
            })),
          }
        }
        if (table === 'comentarios_entregables') {
          return {
            insert: vi
              .fn()
              .mockResolvedValue({ error: { message: 'insert failed' } }),
          }
        }
        return {}
      }) as never,
    )

    const result = await responderEntregable(validInput)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('database_error')
    // El estado no se toca si no se pudo guardar el comentario.
    expect(updateSpy).not.toHaveBeenCalled()
  })

  it('aprueba el entregable cuando estado es en_revision (RF-41)', async () => {
    mockedServer.mockResolvedValue(
      withAuth((table) => {
        if (table === 'entregables') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id_entregable: ENTR_UUID,
                    estado: 'en_revision',
                    id_contratacion: CONT_UUID,
                  },
                  error: null,
                }),
              })),
            })),
            update: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: null }),
            })),
          }
        }
        if (table === 'contrataciones') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id_participacion: PART_UUID },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'participaciones') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id_proyecto: PROJ_UUID, id_estudiante: STUD_UUID },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'estudiantes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id_usuario: USER_ID },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'empresarios') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id_empresario: 'emp-1' },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'proyectos') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id_proyecto: PROJ_UUID, titulo: 'Proyecto Test' },
                error: null,
              }),
            })),
          }
        }
        if (table === 'comentarios_entregables') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          }
        }
        return {}
      }) as never,
    )

    const result = await responderEntregable(validInput)
    expect(result.ok).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// actualizarUrlProyecto
// ─────────────────────────────────────────────────────────────────────────────

function withRpc(rpcError: unknown = null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: USER_ID } },
        error: null,
      }),
    },
    from: vi.fn(),
    storage: makeStorage(),
    rpc: vi.fn().mockResolvedValue({ error: rpcError }),
  }
}

describe('actualizarUrlProyecto', () => {
  it('retorna invalid_input si el UUID de participación es inválido', async () => {
    const result = await actualizarUrlProyecto({
      idParticipacion: 'no-es-uuid',
      url: 'https://github.com/repo',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('invalid_input')
  })

  it('retorna invalid_input si la URL no tiene formato válido', async () => {
    const result = await actualizarUrlProyecto({
      idParticipacion: PART_UUID,
      url: 'no-es-url',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('invalid_input')
  })

  it('retorna invalid_input si la URL supera 150 caracteres', async () => {
    const result = await actualizarUrlProyecto({
      idParticipacion: PART_UUID,
      url: 'https://example.com/' + 'a'.repeat(135),
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('invalid_input')
  })

  it('propaga error si el rol no es egresado', async () => {
    mockedVerifiedEgresado.mockResolvedValue({
      ok: false,
      error: 'forbidden',
    })
    const result = await actualizarUrlProyecto({
      idParticipacion: PART_UUID,
      url: 'https://github.com/repo',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('forbidden')
  })

  it('retorna database_error si el RPC falla', async () => {
    mockedServer.mockResolvedValue(withRpc({ message: 'rpc error' }) as never)
    const result = await actualizarUrlProyecto({
      idParticipacion: PART_UUID,
      url: 'https://github.com/repo',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('database_error')
  })

  it('actualiza la URL exitosamente', async () => {
    mockedServer.mockResolvedValue(withRpc() as never)
    const result = await actualizarUrlProyecto({
      idParticipacion: PART_UUID,
      url: 'https://github.com/repo',
    })
    expect(result.ok).toBe(true)
  })

  it('acepta url nula para limpiar el enlace', async () => {
    mockedServer.mockResolvedValue(withRpc() as never)
    const result = await actualizarUrlProyecto({
      idParticipacion: PART_UUID,
      url: null,
    })
    expect(result.ok).toBe(true)
  })
})
