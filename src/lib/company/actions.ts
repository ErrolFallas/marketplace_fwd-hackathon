'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/dal'
import { ok, err, type Result } from '@/lib/result'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'
import {
  CompanyProfileDbSchema,
  MINIMUM_EMPRESARIO_AGE,
  type CompanyProfileInput,
  type CompanyProfileView,
} from './schemas'
import type { Database } from '@/types/database'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/guards'
import { isAtLeastYearsOld } from '@/lib/utils/age'
import { programarModeracionDiferida } from '@/lib/moderador-ai/moderar'

export interface SupportTicket {
  id: string
  userId: string
  description: string
  createdAt: string
  userEmail?: string
  userName?: string
  companyName?: string
}

/**
 * Datos que un empresario RECHAZADO puede actualizar para re-verificarse
 * (A2 Fase 2). Espeja el set del onboarding (datos del representante + empresa
 * core), sin logo/sector/descripción. No incluye términos: ya se aceptaron.
 */
const ReverificarEmpresaSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  primerApellido: z.string().trim().min(2).max(80),
  segundoApellido: z.string().trim().max(80).optional(),
  fechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((v) => isAtLeastYearsOld(v, MINIMUM_EMPRESARIO_AGE, new Date())),
  fotoPerfilUrl: z.string().url().nullable().optional(),
  nombreEmpresa: z.string().trim().min(2).max(150),
  cedula: z.string().trim().min(1).max(50),
  sitioWeb: z.string().url().max(200).optional().or(z.literal('')),
  tipoEmpresario: z.enum(['empresa_formal', 'emprendedor']),
  pais: z.string().min(2).max(80),
  region: z.string().max(80),
  alcanceOperativo: z.enum(['nacional', 'internacional', 'ambos']),
})

export type ReverificarEmpresaInput = z.infer<typeof ReverificarEmpresaSchema>

/**
 * Re-verificación del empresario rechazado (A2 Fase 2): actualiza sus datos de
 * verificación y devuelve su `estado_verificacion` a 'pendiente', limpiando el
 * `motivo_rechazo`, para reentrar a la cola del admin. El rechazo NO es
 * definitivo (RF-17). Solo aplica a empresarios en estado 'rechazado'.
 *
 * Usa service_role: el guard-trigger congela `estado_verificacion` y
 * `motivo_rechazo` ante `authenticated`, así que el reset solo lo hace el server.
 */
export async function reverificarEmpresa(
  input: ReverificarEmpresaInput,
): Promise<Result<void>> {
  const parsed = ReverificarEmpresaSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')
  const data = parsed.data

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return err('unauthorized')

  const admin = createSupabaseAdminClient()

  // Solo un empresario en estado 'rechazado' puede re-verificarse.
  const { data: empresario, error: readErr } = await admin
    .from('empresarios')
    .select('id_empresario, estado_verificacion')
    .eq('id_usuario', user.id)
    .maybeSingle()
  if (readErr || !empresario) return err('empresa_no_encontrada')
  if (empresario.estado_verificacion !== 'rechazado') {
    return err('estado_invalido')
  }

  // Datos personales del representante (usuarios).
  const usuarioUpdate: Database['public']['Tables']['usuarios']['Update'] = {
    nombre: data.nombre,
    apellido_1: data.primerApellido,
    apellido_2: data.segundoApellido || null,
    fecha_nacimiento: data.fechaNacimiento,
  }
  if (data.fotoPerfilUrl) usuarioUpdate.foto_perfil = data.fotoPerfilUrl

  const { error: usuarioErr } = await admin
    .from('usuarios')
    .update(usuarioUpdate)
    .eq('id_usuario', user.id)
  if (usuarioErr) {
    logger.error('reverificarEmpresa: fallo al actualizar usuarios', {
      error: usuarioErr.message,
    })
    return err('database_error')
  }

  // Datos de empresa + RESET de verificación (vuelve a 'pendiente').
  const { error: empErr } = await admin
    .from('empresarios')
    .update({
      tipo_empresario: data.tipoEmpresario,
      nombre_empresa: data.nombreEmpresa,
      cedula: data.cedula,
      sitio_web: data.sitioWeb ? data.sitioWeb : null,
      pais_iso_sede: data.pais,
      region_sede: data.region,
      alcance_operativo: data.alcanceOperativo,
      estado_verificacion: 'pendiente',
      motivo_rechazo: null,
      verificado_at: null,
      verificado_por: null,
    })
    .eq('id_empresario', empresario.id_empresario)
  if (empErr) {
    logger.error('reverificarEmpresa: fallo al actualizar empresarios', {
      error: empErr.message,
    })
    return err('database_error')
  }

  revalidatePath('/pending-approval')
  return ok(undefined)
}

/**
 * Obtiene el perfil del empresario para el usuario autenticado actual.
 */
export async function getCompanyProfile(): Promise<
  Result<CompanyProfileView | null>
> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return err('unauthorized')
    }

    const { data: empresario, error } = await supabase
      .from('empresarios')
      .select('*')
      .eq('id_usuario', user.id)
      .maybeSingle()

    if (error) {
      logger.error(
        'getCompanyProfile: fallo al leer el registro en base de datos',
        { error: error.message },
      )
      return err(error.message)
    }

    if (!empresario) {
      return ok(null)
    }

    // Datos personales del empresario (tabla usuarios).
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('nombre, apellido_1, apellido_2, fecha_nacimiento, foto_perfil')
      .eq('id_usuario', user.id)
      .maybeSingle()

    if (usuarioError) {
      logger.error('getCompanyProfile: fallo al leer datos personales', {
        error: usuarioError.message,
      })
      return err(usuarioError.message)
    }

    // Mapear columnas de la BD al formato del frontend.
    const profile: CompanyProfileView = {
      firstName: usuario?.nombre ?? '',
      lastName1: usuario?.apellido_1 ?? '',
      lastName2: usuario?.apellido_2 ?? '',
      birthDate: usuario?.fecha_nacimiento ?? '',
      profilePhoto: usuario?.foto_perfil ?? '',
      name: empresario.nombre_empresa ?? '',
      companyType:
        empresario.tipo_empresario === 'empresa_formal'
          ? 'formal'
          : 'emprendedor',
      sector: empresario.sector ?? '',
      cedula: empresario.cedula ?? '',
      description: empresario.descripcion ?? '',
      contactEmail: user.email ?? '',
      website: empresario.sitio_web ?? '',
      logo: empresario.logo ?? '',
      country: empresario.pais_iso_sede ?? '',
      city: empresario.region_sede ?? '',
      verificationStatus: empresario.estado_verificacion ?? null,
      reputacion: empresario.reputacion ? Number(empresario.reputacion) : 0,
      ...(empresario.alcance_operativo
        ? { operatingScope: empresario.alcance_operativo }
        : {}),
    }

    return ok(profile)
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    logger.error('getCompanyProfile: error inesperado', { error: errorMsg })
    return err(errorMsg)
  }
}

/**
 * Igual que getCompanyProfile pero SIEMPRE devuelve la vista (nunca null), con
 * los datos personales de `usuarios` aunque todavía no exista la fila en
 * `empresarios` (primera visita). Lo usa el formulario para precargar el nombre
 * del empresario y el correo de la cuenta.
 */
export async function getCompanyProfileForEdit(): Promise<
  Result<CompanyProfileView>
> {
  try {
    const user = await getCurrentUser()
    if (!user) return err('unauthorized')

    const supabase = await createSupabaseServerClient()
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('nombre, apellido_1, apellido_2, fecha_nacimiento, foto_perfil')
      .eq('id_usuario', user.id)
      .maybeSingle()

    if (usuarioError) {
      logger.error('getCompanyProfileForEdit: fallo al leer datos personales', {
        error: usuarioError.message,
      })
      return err(usuarioError.message)
    }

    const { data: empresario, error: empError } = await supabase
      .from('empresarios')
      .select('*')
      .eq('id_usuario', user.id)
      .maybeSingle()

    if (empError) {
      logger.error('getCompanyProfileForEdit: fallo al leer empresario', {
        error: empError.message,
      })
      return err(empError.message)
    }

    const profile: CompanyProfileView = {
      firstName: usuario?.nombre ?? '',
      lastName1: usuario?.apellido_1 ?? '',
      lastName2: usuario?.apellido_2 ?? '',
      birthDate: usuario?.fecha_nacimiento ?? '',
      profilePhoto: usuario?.foto_perfil ?? '',
      name: empresario?.nombre_empresa ?? '',
      companyType:
        empresario?.tipo_empresario === 'emprendedor'
          ? 'emprendedor'
          : 'formal',
      sector: empresario?.sector ?? '',
      cedula: empresario?.cedula ?? '',
      description: empresario?.descripcion ?? '',
      contactEmail: user.email ?? '',
      website: empresario?.sitio_web ?? '',
      logo: empresario?.logo ?? '',
      country: empresario?.pais_iso_sede ?? '',
      city: empresario?.region_sede ?? '',
      verificationStatus: empresario?.estado_verificacion ?? null,
      reputacion: empresario?.reputacion ? Number(empresario.reputacion) : 0,
      ...(empresario?.alcance_operativo
        ? { operatingScope: empresario.alcance_operativo }
        : {}),
    }

    return ok(profile)
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    logger.error('getCompanyProfileForEdit: error inesperado', {
      error: errorMsg,
    })
    return err(errorMsg)
  }
}

/**
 * Guarda o actualiza el perfil del empresario para el usuario autenticado actual.
 */
export async function saveCompanyProfile(
  profile: CompanyProfileInput,
): Promise<Result<void>> {
  try {
    const parsed = CompanyProfileDbSchema.safeParse(profile)
    if (!parsed.success) {
      logger.error('saveCompanyProfile: error de validación del esquema', {
        error: parsed.error.format(),
      })
      return err('invalid_input')
    }

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return err('unauthorized')
    }

    const data = parsed.data

    // 1. Datos de la empresa (tabla empresarios). La BD congela la verificación.
    const empresaProfile: Database['public']['Tables']['empresarios']['Insert'] =
      {
        id_usuario: user.id,
        nombre_empresa: data.name,
        tipo_empresario:
          data.companyType === 'formal' ? 'empresa_formal' : 'emprendedor',
        sector: data.sector,
        // Cédula obligatoria para ambos tipos: jurídica (empresa) o de identidad
        // (emprendedor). La validación garantiza que venga; el null es defensa.
        cedula: data.cedula?.trim() ? data.cedula.trim() : null,
        descripcion: data.description,
        logo: data.logo,
        sitio_web: data.website,
        pais_iso_sede: data.country ?? null,
        region_sede: data.city ?? null,
        alcance_operativo: data.operatingScope ?? null,
      }

    // Leer-y-decidir en vez de upsert. El upsert es INSERT ... ON CONFLICT DO
    // UPDATE: dispara la policy de INSERT, cuyo WITH CHECK exige
    // estado_verificacion = 'pendiente'. Un empresario ya 'verificado' la viola
    // al editar su perfil. Con UPDATE directo solo aplica la policy de UPDATE
    // (propiedad por id_usuario), que sí permite editar tras la verificación.
    const { data: existing, error: existsError } = await supabase
      .from('empresarios')
      .select('id_empresario')
      .eq('id_usuario', user.id)
      .maybeSingle()

    if (existsError) {
      logger.error(
        'saveCompanyProfile: fallo al verificar la existencia del empresario',
        { error: existsError.message },
      )
      return err(existsError.message)
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('empresarios')
        .update(empresaProfile)
        .eq('id_usuario', user.id)

      if (updateError) {
        logger.error('saveCompanyProfile: fallo al actualizar empresarios', {
          error: updateError.message,
        })
        return err(updateError.message)
      }
    } else {
      const { error: insertError } = await supabase
        .from('empresarios')
        .insert(empresaProfile)

      if (insertError) {
        logger.error('saveCompanyProfile: fallo al insertar empresarios', {
          error: insertError.message,
        })
        return err(insertError.message)
      }
    }

    // 2. Datos personales (tabla usuarios): solo los campos enviados. La BD
    // congela el resto (correo, rol, estado de cuenta...) para `authenticated`.
    const personales: Database['public']['Tables']['usuarios']['Update'] = {}
    if (data.firstName !== undefined && data.firstName !== '') {
      personales.nombre = data.firstName
    }
    if (data.lastName1 !== undefined && data.lastName1 !== '') {
      personales.apellido_1 = data.lastName1
    }
    if (data.lastName2 !== undefined) {
      personales.apellido_2 = data.lastName2 === '' ? null : data.lastName2
    }
    if (data.birthDate !== undefined) {
      personales.fecha_nacimiento =
        data.birthDate === '' ? null : data.birthDate
    }
    if (data.profilePhoto !== undefined) {
      personales.foto_perfil =
        data.profilePhoto === '' ? null : data.profilePhoto
    }

    if (Object.keys(personales).length > 0) {
      const { error: usuarioError } = await supabase
        .from('usuarios')
        .update(personales)
        .eq('id_usuario', user.id)

      if (usuarioError) {
        logger.error(
          'saveCompanyProfile: fallo al actualizar datos personales',
          { error: usuarioError.message },
        )
        return err(usuarioError.message)
      }
    }

    // Modera la descripción de la empresa (best-effort). El id_empresario se
    // resuelve dentro del after() con admin: sirve tanto para insert como update.
    if (data.description) {
      const descripcion = data.description
      const idUsuario = user.id
      programarModeracionDiferida({
        entidad: 'empresa_descripcion',
        texto: descripcion,
        idAutor: idUsuario,
        resolverIdEntidad: async () => {
          const admin = createSupabaseAdminClient()
          const { data: emp } = await admin
            .from('empresarios')
            .select('id_empresario')
            .eq('id_usuario', idUsuario)
            .maybeSingle()
          return emp?.id_empresario ?? null
        },
      })
    }

    revalidatePath('/empresario/perfil')
    revalidatePath('/empresario/formulario-empresa')

    return ok(undefined)
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    logger.error('saveCompanyProfile: error inesperado', { error: errorMsg })
    return err(errorMsg)
  }
}

/**
 * ¿El empresario completó su perfil? True si existe la fila en `empresarios`
 * con los datos mínimos (nombre de empresa y tipo). Lo usa el guard server-side
 * que decide si forzar el formulario de empresa (reemplaza al useEffect mock).
 */
export async function isCompanyProfileComplete(): Promise<Result<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user) return err('unauthorized')

    const supabase = await createSupabaseServerClient()
    const { data: empresario, error } = await supabase
      .from('empresarios')
      .select('nombre_empresa, tipo_empresario')
      .eq('id_usuario', user.id)
      .maybeSingle()

    if (error) {
      logger.error('isCompanyProfileComplete: fallo al leer empresario', {
        error: error.message,
      })
      return err(error.message)
    }

    const complete = Boolean(
      empresario && empresario.nombre_empresa && empresario.tipo_empresario,
    )
    return ok(complete)
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    logger.error('isCompanyProfileComplete: error inesperado', {
      error: errorMsg,
    })
    return err(errorMsg)
  }
}

/**
 * Crea un ticket de soporte técnico / necesidad de negocio.
 */
export async function createSupportTicket(
  description: string,
): Promise<Result<void>> {
  try {
    const parsed = z.string().min(15).safeParse(description)
    if (!parsed.success) {
      return err('La descripción debe tener al menos 15 caracteres')
    }

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return err('unauthorized')
    }

    const { error } = await supabase.from('soporte_tickets').insert({
      id_usuario: user.id,
      descripcion: parsed.data,
    })

    if (error) {
      logger.error('createSupportTicket: fallo al insertar ticket', {
        error: error.message,
      })
      return err(error.message)
    }

    return ok(undefined)
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    logger.error('createSupportTicket: error inesperado', { error: errorMsg })
    return err(errorMsg)
  }
}

/**
 * Obtiene todos los tickets de soporte (solo administradores).
 */
export async function getSupportTickets(): Promise<Result<SupportTicket[]>> {
  try {
    const authResult = await requireRole('administrador')
    if (!authResult.ok) {
      return err('forbidden')
    }

    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('soporte_tickets')
      .select(
        '*, usuarios(nombre, correo, empresarios!empresarios_id_usuario_fkey(nombre_empresa))',
      )
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('getSupportTickets: fallo al consultar tickets', {
        error: error.message,
      })
      return err(error.message)
    }

    const tickets: SupportTicket[] = (data || []).map((ticket) => {
      const usuarios = ticket.usuarios
      const empresarios = usuarios?.empresarios
      return {
        id: ticket.id_ticket,
        userId: ticket.id_usuario,
        description: ticket.descripcion,
        createdAt: ticket.created_at,
        userEmail: usuarios?.correo ?? '',
        userName: usuarios?.nombre ?? '',
        companyName: empresarios?.nombre_empresa ?? '',
      }
    })

    return ok(tickets)
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    logger.error('getSupportTickets: error inesperado', { error: errorMsg })
    return err(errorMsg)
  }
}
