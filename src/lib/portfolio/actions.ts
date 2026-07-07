'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { ok, err, type Result } from '@/lib/result'
import { logger } from '@/lib/logger'
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import { serverEnv } from '@/lib/env.server'
import type { Database } from '@/types/database'
import { getLocale } from 'next-intl/server'
import { getCountryName, getSubdivisionName } from '@/lib/geo/catalog'

cloudinary.config({
  cloud_name: serverEnv.CLOUDINARY_CLOUD_NAME ?? '',
  api_key: serverEnv.CLOUDINARY_API_KEY ?? '',
  api_secret: serverEnv.CLOUDINARY_API_SECRET ?? '',
})
import type { StudentSkill, PortfolioProject } from '@/types'
import type { CalificacionRecibida } from '@/lib/evaluaciones/actions'

/**
 * Extrae el `public_id` de Cloudinary a partir de la URL segura que devuelve
 * el upload (no se persiste el public_id en ninguna tabla: se deriva de la
 * URL para poder limpiar el asset viejo sin agregar una columna nueva).
 * Formato esperado: `.../upload/v<version>/<folder>/<nombre>.<ext>`.
 */
function extractCloudinaryPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/)
  return match?.[1] ?? null
}

/**
 * Borra un asset de Cloudinary. Best-effort: si falla, se loguea pero nunca
 * interrumpe la operación principal (subir/guardar/eliminar) que la llamó.
 */
async function destroyCloudinaryAsset(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    logger.error('destroyCloudinaryAsset: fallo al borrar asset huérfano', {
      publicId,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

/**
 * Si `oldUrl` existe y es distinta de `newUrl`, borra el asset viejo de
 * Cloudinary. Se llama SIEMPRE después de que el cambio ya quedó persistido
 * en base de datos, nunca antes: si el guardado falla, el asset viejo se
 * conserva en vez de perderse.
 */
async function cleanupReplacedImage(
  oldUrl: string | null | undefined,
  newUrl: string | null | undefined,
): Promise<void> {
  if (!oldUrl || oldUrl === newUrl) return
  const publicId = extractCloudinaryPublicId(oldUrl)
  if (!publicId) return
  await destroyCloudinaryAsset(publicId)
}

export interface StudentProfileView {
  id_estudiante: string
  id_usuario: string
  descripcion: string
  portafolio_visible_publicamente: boolean
  firstName: string
  lastName1: string
  lastName2: string
  profilePhoto: string
  tituloFwd: string
  reputacion: number | null
  urlPortafolio?: string | null
  paisIsoResidencia?: string | null
  regionResidencia?: string | null
  paisNombre?: string | null
  regionNombre?: string | null
  skills: StudentSkill[]
  projects: PortfolioProject[]
  /** Participaciones finalizadas. Se pobla en el perfil público. */
  proyectosCompletados?: ProyectoCompletado[]
  /** Calificaciones recibidas de empresas. Se pobla en el perfil público. */
  calificaciones?: CalificacionRecibida[]
}

/**
 * Campos editables del perfil del egresado. Mezcla columnas de `estudiantes`
 * (descripcion, visibilidad, residencia, url_portafolio) con datos personales
 * que viven en `usuarios` (firstName/lastName1/lastName2). Todos opcionales:
 * `saveStudentProfile` solo escribe los que vengan definidos.
 */
export interface StudentProfileInput {
  descripcion?: string
  portafolio_visible_publicamente?: boolean
  paisIsoResidencia?: string | null
  regionResidencia?: string | null
  urlPortafolio?: string | null
  firstName?: string
  lastName1?: string
  lastName2?: string | null
}

/** Proyecto real completado por el egresado (participación finalizada). */
export interface ProyectoCompletado {
  id_participacion: string
  tituloProyecto: string
  nombreEmpresa: string
  /** Stack tecnológico declarado por la empresa al publicar el proyecto. */
  tecnologias: string[]
}

/**
 * Obtiene el perfil del estudiante para el usuario autenticado actual.
 */
export async function getStudentProfile(): Promise<
  Result<StudentProfileView | null>
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

    const { data: estudiante, error } = await supabase
      .from('estudiantes')
      .select(
        `
        id_estudiante,
        id_usuario,
        descripcion,
        portafolio_visible_publicamente,
        titulo_fwd,
        reputacion,
        url_portafolio,
        pais_iso_residencia,
        region_residencia,
        usuarios!estudiantes_id_usuario_fkey(nombre, apellido_1, apellido_2, foto_perfil),
        habilidades_tecnicas(nivel, id_tecnologia, tecnologias(nombre)),
        proyectos_portafolio(id_portafolio, titulo, descripcion, url_repositorio, url_demo, fecha, imagen_url, portafolio_tecnologias(tecnologias(nombre)))
        `,
      )
      .eq('id_usuario', user.id)
      .maybeSingle()

    if (error) {
      logger.error(
        'getStudentProfile: fallo al leer el registro en base de datos',
        { error: error.message },
      )
      return err(error.message)
    }

    if (!estudiante) {
      return ok(null)
    }

    const userInfo = estudiante.usuarios

    const rawSkills = estudiante.habilidades_tecnicas ?? []

    const skillsList = rawSkills.map((h) => ({
      id: h.id_tecnologia,
      name: h.tecnologias?.nombre ?? 'Desconocida',
      level: h.nivel,
    }))

    const rawProjects = estudiante.proyectos_portafolio ?? []

    const projectsList: PortfolioProject[] = rawProjects.map((p) => {
      const techNames = (p.portafolio_tecnologias || [])
        .map((pt) => pt.tecnologias?.nombre)
        .filter(Boolean)
      const proj: PortfolioProject = {
        id: p.id_portafolio,
        title: p.titulo,
        description: p.descripcion ?? '',
        technologies: techNames as string[],
      }
      if (p.fecha) proj.completionDate = p.fecha
      if (p.url_repositorio) proj.repositoryUrl = p.url_repositorio
      if (p.url_demo) proj.demoUrl = p.url_demo
      if (p.imagen_url) proj.imageUrl = p.imagen_url
      return proj
    })

    const profile: StudentProfileView = {
      id_estudiante: estudiante.id_estudiante,
      id_usuario: estudiante.id_usuario,
      descripcion: estudiante.descripcion ?? '',
      portafolio_visible_publicamente:
        estudiante.portafolio_visible_publicamente,
      firstName: userInfo?.nombre ?? '',
      lastName1: userInfo?.apellido_1 ?? '',
      lastName2: userInfo?.apellido_2 ?? '',
      profilePhoto: userInfo?.foto_perfil ?? '',
      tituloFwd: estudiante.titulo_fwd ?? '',
      reputacion: estudiante.reputacion ?? null,
      urlPortafolio: estudiante.url_portafolio ?? null,
      paisIsoResidencia: estudiante.pais_iso_residencia,
      regionResidencia: estudiante.region_residencia,
      paisNombre: estudiante.pais_iso_residencia
        ? getCountryName(estudiante.pais_iso_residencia, await getLocale())
        : null,
      regionNombre: estudiante.region_residencia
        ? getSubdivisionName(estudiante.region_residencia)
        : null,
      skills: skillsList,
      projects: projectsList,
    }

    return ok(profile)
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    logger.error('getStudentProfile: error inesperado', { error: errorMsg })
    return err(errorMsg)
  }
}

/**
 * Guarda o actualiza el perfil del estudiante para el usuario autenticado actual.
 */
export async function saveStudentProfile(
  profile: StudentProfileInput,
): Promise<Result<void>> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return err('unauthorized')
    }

    // 1. Columnas de `estudiantes`. La fila del egresado siempre existe (se
    // crea al registrarse), así que usamos UPDATE puro en vez de upsert: evita
    // que el WITH CHECK de la policy INSERT entre en juego y es semánticamente
    // correcto. El guard trigger congela reputacion/titulo_fwd/verificación.
    const estudianteProfile: Database['public']['Tables']['estudiantes']['Update'] =
      {}

    if (profile.descripcion !== undefined) {
      estudianteProfile.descripcion = profile.descripcion
    }
    if (profile.portafolio_visible_publicamente !== undefined) {
      estudianteProfile.portafolio_visible_publicamente =
        profile.portafolio_visible_publicamente
    }
    if (profile.paisIsoResidencia !== undefined) {
      estudianteProfile.pais_iso_residencia = profile.paisIsoResidencia
    }
    if (profile.regionResidencia !== undefined) {
      estudianteProfile.region_residencia = profile.regionResidencia
    }
    if (profile.urlPortafolio !== undefined) {
      estudianteProfile.url_portafolio = profile.urlPortafolio
    }

    if (Object.keys(estudianteProfile).length > 0) {
      const { error: estudianteError } = await supabase
        .from('estudiantes')
        .update(estudianteProfile)
        .eq('id_usuario', user.id)

      if (estudianteError) {
        logger.error('saveStudentProfile: fallo al actualizar estudiantes', {
          error: estudianteError.message,
        })
        return err(estudianteError.message)
      }
    }

    // 2. Datos personales (tabla usuarios): solo los campos enviados. La BD
    // congela el resto (correo, rol, estado de cuenta...) para `authenticated`.
    // Mismo patrón que saveCompanyProfile para el empresario.
    const personales: Database['public']['Tables']['usuarios']['Update'] = {}
    if (profile.firstName !== undefined && profile.firstName !== '') {
      personales.nombre = profile.firstName
    }
    if (profile.lastName1 !== undefined && profile.lastName1 !== '') {
      personales.apellido_1 = profile.lastName1
    }
    if (profile.lastName2 !== undefined) {
      personales.apellido_2 =
        profile.lastName2 === '' ? null : profile.lastName2
    }

    if (Object.keys(personales).length > 0) {
      const { error: usuarioError } = await supabase
        .from('usuarios')
        .update(personales)
        .eq('id_usuario', user.id)

      if (usuarioError) {
        logger.error(
          'saveStudentProfile: fallo al actualizar datos personales',
          { error: usuarioError.message },
        )
        return err(usuarioError.message)
      }
    }

    return ok(undefined)
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    logger.error('saveStudentProfile: error inesperado', { error: errorMsg })
    return err(errorMsg)
  }
}

// ----------------------------------------------------------------------------
// Habilidades (Skills)
// ----------------------------------------------------------------------------

export async function getActiveTechnologies(): Promise<
  Result<{ id: string; name: string }[]>
> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('tecnologias')
      .select('id_tecnologia, nombre')
      .eq('is_active', true)
      .order('nombre')

    if (error) return err(error.message)

    return ok(data.map((t) => ({ id: t.id_tecnologia, name: t.nombre })))
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    logger.error('getActiveTechnologies: error inesperado', { error: errorMsg })
    return err(errorMsg)
  }
}

export async function addStudentSkill(
  name: string,
  level: 'basico' | 'intermedio' | 'avanzado',
): Promise<Result<void>> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return err('unauthorized')

    // Obtener id_estudiante
    const { data: estData } = await supabase
      .from('estudiantes')
      .select('id_estudiante')
      .eq('id_usuario', user.id)
      .single()
    if (!estData) return err('estudiante_not_found')

    // Buscar o crear tecnología
    let id_tecnologia: string
    const { data: techData } = await supabase
      .from('tecnologias')
      .select('id_tecnologia')
      .ilike('nombre', name)
      .maybeSingle()

    if (techData) {
      id_tecnologia = techData.id_tecnologia
    } else {
      const { data: newTech, error: newTechErr } = await supabase
        .from('tecnologias')
        .insert({ nombre: name, is_active: true })
        .select('id_tecnologia')
        .single()
      if (newTechErr) return err(newTechErr.message)
      id_tecnologia = newTech.id_tecnologia
    }

    // Insertar en habilidades_tecnicas
    const { error: insertErr } = await supabase
      .from('habilidades_tecnicas')
      .upsert(
        {
          id_estudiante: estData.id_estudiante,
          id_tecnologia,
          nivel: level,
        },
        { onConflict: 'id_estudiante,id_tecnologia' },
      )

    if (insertErr) return err(insertErr.message)

    return ok(undefined)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'unexpected_error')
  }
}

export async function deleteStudentSkill(
  id_tecnologia: string,
): Promise<Result<void>> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return err('unauthorized')

    const { data: estData } = await supabase
      .from('estudiantes')
      .select('id_estudiante')
      .eq('id_usuario', user.id)
      .single()
    if (!estData) return err('estudiante_not_found')

    const { error } = await supabase
      .from('habilidades_tecnicas')
      .delete()
      .eq('id_estudiante', estData.id_estudiante)
      .eq('id_tecnologia', id_tecnologia)

    if (error) return err(error.message)
    return ok(undefined)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'unexpected_error')
  }
}

// ----------------------------------------------------------------------------
// Proyectos (Projects)
// ----------------------------------------------------------------------------

export async function savePortfolioProject(
  projectData: Omit<PortfolioProject, 'id'>,
  projectId?: string,
): Promise<Result<void>> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return err('unauthorized')

    const { data: estData } = await supabase
      .from('estudiantes')
      .select('id_estudiante')
      .eq('id_usuario', user.id)
      .single()
    if (!estData) return err('estudiante_not_found')

    let id_portafolio = projectId
    if (projectId) {
      // Update: nunca se toca origen/id_participacion/consentimiento. Esos
      // campos se fijan una sola vez al crear el proyecto; re-guardarlos en
      // cada edición pisaría un 'plataforma_contratada' + 'aprobado' de
      // vuelta a los valores del flujo manual.
      const { data: previo } = await supabase
        .from('proyectos_portafolio')
        .select('imagen_url')
        .eq('id_portafolio', projectId)
        .maybeSingle()

      const { error } = await supabase
        .from('proyectos_portafolio')
        .update({
          titulo: projectData.title,
          descripcion: projectData.description,
          fecha: projectData.completionDate || null,
          url_repositorio: projectData.repositoryUrl || null,
          url_demo: projectData.demoUrl || null,
          imagen_url: projectData.imageUrl || null,
        })
        .eq('id_portafolio', projectId)
      if (error) return err(error.message)

      await cleanupReplacedImage(previo?.imagen_url, projectData.imageUrl)
    } else {
      // Insert. `idParticipacion` presente = se declaró desde un proyecto
      // real finalizado: la RLS de RF-10 (portafolio_select_own_or_public)
      // exige estado_consentimiento = 'aprobado' para que otros lo vean, así
      // que el aviso de consentimiento ya aceptado por el egresado se
      // traduce directo en ese estado.
      const origen = projectData.idParticipacion
        ? ('plataforma_contratada' as const)
        : ('independiente' as const)

      const { data: newProj, error } = await supabase
        .from('proyectos_portafolio')
        .insert({
          id_estudiante: estData.id_estudiante,
          titulo: projectData.title,
          descripcion: projectData.description,
          fecha: projectData.completionDate || null,
          url_repositorio: projectData.repositoryUrl || null,
          url_demo: projectData.demoUrl || null,
          imagen_url: projectData.imageUrl || null,
          origen,
          id_participacion: projectData.idParticipacion || null,
          estado_consentimiento: projectData.idParticipacion
            ? ('aprobado' as const)
            : null,
          consentimiento_at: projectData.idParticipacion
            ? new Date().toISOString()
            : null,
          is_active: true,
        })
        .select('id_portafolio')
        .single()
      if (error) return err(error.message)
      id_portafolio = newProj.id_portafolio
    }

    // Actualizar tecnologías del proyecto
    if (id_portafolio) {
      // 1. Borrar anteriores
      await supabase
        .from('portafolio_tecnologias')
        .delete()
        .eq('id_portafolio', id_portafolio)

      // 2. Insertar nuevas
      for (const techName of projectData.technologies) {
        if (!techName.trim()) continue

        let id_tecnologia: string
        const { data: techData } = await supabase
          .from('tecnologias')
          .select('id_tecnologia')
          .ilike('nombre', techName.trim())
          .maybeSingle()
        if (techData) {
          id_tecnologia = techData.id_tecnologia
        } else {
          const { data: newTech } = await supabase
            .from('tecnologias')
            .insert({ nombre: techName.trim(), is_active: true })
            .select('id_tecnologia')
            .single()
          if (!newTech) continue
          id_tecnologia = newTech.id_tecnologia
        }

        await supabase.from('portafolio_tecnologias').insert({
          id_portafolio,
          id_tecnologia,
        })
      }
    }

    return ok(undefined)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'unexpected_error')
  }
}

export async function deletePortfolioProject(
  id_portafolio: string,
): Promise<Result<void>> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return err('unauthorized')

    const { data: borrado, error } = await supabase
      .from('proyectos_portafolio')
      .delete()
      .eq('id_portafolio', id_portafolio)
      .select('imagen_url')
      .maybeSingle()
    if (error) return err(error.message)

    if (borrado?.imagen_url) {
      const publicId = extractCloudinaryPublicId(borrado.imagen_url)
      if (publicId) await destroyCloudinaryAsset(publicId)
    }

    return ok(undefined)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'unexpected_error')
  }
}

export async function uploadAndSaveProfilePhoto(
  formData: FormData,
): Promise<Result<string>> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return err('unauthorized')
    }

    const file = formData.get('file') as File
    if (!file) {
      return err('No file provided')
    }

    const { data: usuarioPrevio } = await supabase
      .from('usuarios')
      .select('foto_perfil')
      .eq('id_usuario', user.id)
      .maybeSingle()

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`

    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader.upload(
          base64Image,
          {
            folder: 'imagenes',
            public_id: `profile_${user.id}_${Date.now()}`,
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error)
            else if (result) resolve(result)
            else reject(new Error('Upload result is undefined'))
          },
        )
      },
    )

    const secureUrl = uploadResult.secure_url

    const { error: dbError } = await supabase
      .from('usuarios')
      .update({ foto_perfil: secureUrl })
      .eq('id_usuario', user.id)

    if (dbError) {
      logger.error('Error updating foto_perfil in usuarios', { error: dbError })
      return err('Error updating profile photo in database')
    }

    await cleanupReplacedImage(usuarioPrevio?.foto_perfil, secureUrl)

    return ok(secureUrl)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'unexpected_error'
    logger.error('uploadAndSaveProfilePhoto: unexpected error', {
      error: errorMsg,
    })
    return err(errorMsg)
  }
}

export async function getGoogleAvatarUrl(): Promise<Result<string | null>> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) return err('unauthorized')

    const adminClient = createSupabaseAdminClient()
    const {
      data: { user: authUser },
      error,
    } = await adminClient.auth.admin.getUserById(user.id)
    if (error || !authUser) return ok(null)

    const googleIdentity = authUser.identities?.find(
      (i) => i.provider === 'google',
    )
    if (!googleIdentity) return ok(null)

    const identityAvatar = googleIdentity.identity_data?.['avatar_url']
    const metaAvatar = authUser.user_metadata?.['avatar_url']
    const avatarUrl =
      typeof identityAvatar === 'string'
        ? identityAvatar
        : typeof metaAvatar === 'string'
          ? metaAvatar
          : null

    return ok(avatarUrl)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'unexpected_error')
  }
}

export async function revertToGoogleAvatar(): Promise<Result<string>> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) return err('unauthorized')

    const adminClient = createSupabaseAdminClient()
    const {
      data: { user: authUser },
      error,
    } = await adminClient.auth.admin.getUserById(user.id)
    if (error || !authUser) return err('user_not_found')

    const googleIdentity = authUser.identities?.find(
      (i) => i.provider === 'google',
    )
    const identityAvatar = googleIdentity?.identity_data?.['avatar_url']
    const metaAvatar = authUser.user_metadata?.['avatar_url']
    const googleAvatarUrl =
      typeof identityAvatar === 'string'
        ? identityAvatar
        : typeof metaAvatar === 'string'
          ? metaAvatar
          : null

    if (!googleAvatarUrl) return err('no_google_avatar')

    const { error: dbError } = await supabase
      .from('usuarios')
      .update({ foto_perfil: googleAvatarUrl })
      .eq('id_usuario', user.id)

    if (dbError) return err(dbError.message)

    return ok(googleAvatarUrl)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'unexpected_error')
  }
}

/**
 * Sube la imagen opcional de un proyecto de portafolio a Cloudinary y
 * devuelve la URL. A diferencia de `uploadAndSaveProfilePhoto`, no escribe
 * en base de datos: el formulario todavía no tiene `id_portafolio` cuando
 * se sube (proyecto nuevo), así que la URL viaja en el payload de
 * `savePortfolioProject` y se persiste junto con el resto del proyecto.
 */
export async function uploadPortfolioProjectImage(
  formData: FormData,
): Promise<Result<string>> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return err('unauthorized')
    }

    const file = formData.get('file') as File
    if (!file) {
      return err('No file provided')
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`

    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader.upload(
          base64Image,
          {
            folder: 'imagenes',
            public_id: `portafolio_proyecto_${user.id}_${Date.now()}`,
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error)
            else if (result) resolve(result)
            else reject(new Error('Upload result is undefined'))
          },
        )
      },
    )

    return ok(uploadResult.secure_url)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'unexpected_error'
    logger.error('uploadPortfolioProjectImage: unexpected error', {
      error: errorMsg,
    })
    return err(errorMsg)
  }
}

/**
 * Borra de Cloudinary una imagen de proyecto que el formulario subió pero
 * todavía no guardó (el egresado la reemplazó, la quitó o canceló el
 * formulario). El `public_id` de `uploadPortfolioProjectImage` incluye el
 * `user.id` del que sube, así que se valida que la URL sea del propio
 * usuario antes de borrar (nadie puede pedir borrar el asset de otro).
 */
export async function deletePortfolioProjectImage(
  url: string,
): Promise<Result<void>> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return err('unauthorized')

    const publicId = extractCloudinaryPublicId(url)
    if (!publicId || !publicId.includes(user.id)) {
      return err('invalid_image')
    }

    await destroyCloudinaryAsset(publicId)
    return ok(undefined)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'unexpected_error')
  }
}

/**
 * Obtiene el perfil de un estudiante por su id_estudiante para vista pública o empresarial.
 * RF-12: Verifica que sea público o que el empresario tenga una postulación de este estudiante.
 */
export async function getPublicStudentProfile(
  id_estudiante: string,
): Promise<Result<StudentProfileView | null>> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return err('unauthorized')
    }

    const adminClient = await createSupabaseAdminClient()
    const { data: estudiante, error } = await adminClient
      .from('estudiantes')
      .select(
        `
        id_estudiante,
        id_usuario,
        descripcion,
        portafolio_visible_publicamente,
        titulo_fwd,
        reputacion,
        url_portafolio,
        pais_iso_residencia,
        region_residencia,
        usuarios!estudiantes_id_usuario_fkey(nombre, apellido_1, apellido_2, foto_perfil),
        habilidades_tecnicas(nivel, id_tecnologia, tecnologias(nombre)),
        proyectos_portafolio(id_portafolio, titulo, descripcion, url_repositorio, url_demo, fecha, imagen_url, portafolio_tecnologias(tecnologias(nombre)))
`,
      )
      .eq('id_estudiante', id_estudiante)
      .maybeSingle()

    if (error) {
      logger.error('getPublicStudentProfile: fallo al leer base de datos', {
        error: error.message,
      })
      return err(error.message)
    }

    if (!estudiante) {
      return ok(null)
    }

    // Verificar permisos RF-12
    if (!estudiante.portafolio_visible_publicamente) {
      const { data: empresario } = await supabase
        .from('empresarios')
        .select('id_empresario')
        .eq('id_usuario', user.id)
        .maybeSingle()

      if (!empresario) return err('unauthorized_private_portfolio')

      const { data: participacion } = await supabase
        .from('participaciones')
        .select('id_participacion, proyectos!inner(id_empresario)')
        .eq('id_estudiante', id_estudiante)
        .eq('proyectos.id_empresario', empresario.id_empresario)
        .limit(1)
        .maybeSingle()

      if (!participacion) {
        return err('unauthorized_private_portfolio')
      }
    }

    const userInfo = estudiante.usuarios
    const rawSkills = estudiante.habilidades_tecnicas ?? []
    const skillsList = rawSkills.map((h) => ({
      id: h.id_tecnologia,
      name: h.tecnologias?.nombre ?? 'Desconocida',
      level: h.nivel,
    }))

    const rawProjects = estudiante.proyectos_portafolio ?? []
    const projectsList: PortfolioProject[] = rawProjects.map((p) => {
      const techNames = (p.portafolio_tecnologias || [])
        .map((pt) => pt.tecnologias?.nombre)
        .filter(Boolean)
      const proj: PortfolioProject = {
        id: p.id_portafolio,
        title: p.titulo,
        description: p.descripcion ?? '',
        technologies: techNames as string[],
      }
      if (p.fecha) proj.completionDate = p.fecha
      if (p.url_repositorio) proj.repositoryUrl = p.url_repositorio
      if (p.url_demo) proj.demoUrl = p.url_demo
      if (p.imagen_url) proj.imageUrl = p.imagen_url
      return proj
    })

    // Datos reales del marketplace. Se pueblan DESPUÉS del check RF-12, así
    // que solo se exponen a quien ya tiene permiso de ver este perfil.
    const [proyectosCompletados, calificaciones] = await Promise.all([
      fetchProyectosCompletadosByEstudiante(estudiante.id_estudiante),
      fetchCalificacionesByEstudiante(estudiante.id_estudiante),
    ])

    const profile: StudentProfileView = {
      id_estudiante: estudiante.id_estudiante,
      id_usuario: estudiante.id_usuario,
      descripcion: estudiante.descripcion ?? '',
      portafolio_visible_publicamente:
        estudiante.portafolio_visible_publicamente,
      firstName: userInfo?.nombre ?? '',
      lastName1: userInfo?.apellido_1 ?? '',
      lastName2: userInfo?.apellido_2 ?? '',
      profilePhoto: userInfo?.foto_perfil ?? '',
      tituloFwd: estudiante.titulo_fwd ?? '',
      reputacion: estudiante.reputacion ?? null,
      urlPortafolio: estudiante.url_portafolio ?? null,
      paisIsoResidencia: estudiante.pais_iso_residencia,
      regionResidencia: estudiante.region_residencia,
      paisNombre: estudiante.pais_iso_residencia
        ? getCountryName(estudiante.pais_iso_residencia, await getLocale())
        : null,
      regionNombre: estudiante.region_residencia
        ? getSubdivisionName(estudiante.region_residencia)
        : null,
      skills: skillsList,
      projects: projectsList,
      proyectosCompletados,
      calificaciones,
    }

    return ok(profile)
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    logger.error('getPublicStudentProfile: error inesperado', {
      error: errorMsg,
    })
    return err(errorMsg)
  }
}

/**
 * Lee las participaciones finalizadas de un estudiante (por id) con admin
 * client, con título del proyecto y nombre de la empresa. Centraliza la query
 * para reusarla desde el perfil del dueño y el perfil público. El admin client
 * sortea el bloqueo RLS del egresado sobre `empresarios` (ver memoria
 * rls-bloquea-join-empresarios). Devuelve [] ante error para no romper el
 * render del perfil; el llamador decide cómo presentarlo.
 */
async function fetchProyectosCompletadosByEstudiante(
  id_estudiante: string,
): Promise<ProyectoCompletado[]> {
  const adminClient = await createSupabaseAdminClient()
  const { data, error } = await adminClient
    .from('participaciones')
    .select(
      `
      id_participacion,
      proyectos!inner(
        titulo,
        empresarios!inner(
          nombre_empresa,
          usuarios!empresarios_id_usuario_fkey(nombre, apellido_1)
        ),
        proyecto_tecnologias(tecnologias(nombre))
      )
      `,
    )
    .eq('id_estudiante', id_estudiante)
    .eq('estado', 'finalizada')

  if (error) {
    logger.error('fetchProyectosCompletadosByEstudiante: fallo en consulta', {
      error: error.message,
    })
    return []
  }

  return (data ?? []).map((row) => {
    const proy = row.proyectos
    const emp = proy?.empresarios
    const nombreEmpresa =
      emp?.nombre_empresa ||
      [emp?.usuarios?.nombre, emp?.usuarios?.apellido_1]
        .filter(Boolean)
        .join(' ')
    const tecnologias = (proy?.proyecto_tecnologias || [])
      .map((pt) => pt.tecnologias?.nombre)
      .filter((nombre): nombre is string => Boolean(nombre))

    return {
      id_participacion: row.id_participacion,
      tituloProyecto: proy?.titulo ?? '',
      nombreEmpresa,
      tecnologias,
    }
  })
}

/**
 * Proyectos finalizados del egresado autenticado que todavía NO declaró en
 * su portafolio (para el selector de "agregar desde proyecto finalizado").
 * Una vez declarado (queda un `proyectos_portafolio.id_participacion`
 * apuntando a la participación), desaparece de este listado para no
 * permitir declarar el mismo trabajo real dos veces.
 */
export async function getProyectosCompletadosDisponibles(): Promise<
  Result<ProyectoCompletado[]>
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

    const { data: estudiante, error: estError } = await supabase
      .from('estudiantes')
      .select('id_estudiante')
      .eq('id_usuario', user.id)
      .maybeSingle()

    if (estError || !estudiante) {
      return err('unauthorized')
    }

    const [completados, { data: declarados, error: declaradosError }] =
      await Promise.all([
        fetchProyectosCompletadosByEstudiante(estudiante.id_estudiante),
        supabase
          .from('proyectos_portafolio')
          .select('id_participacion')
          .eq('id_estudiante', estudiante.id_estudiante)
          .not('id_participacion', 'is', null),
      ])

    if (declaradosError) {
      logger.error(
        'getProyectosCompletadosDisponibles: fallo al leer declarados',
        { error: declaradosError.message },
      )
      return err(declaradosError.message)
    }

    const idsDeclarados = new Set(
      (declarados ?? []).map((d) => d.id_participacion),
    )

    return ok(completados.filter((p) => !idsDeclarados.has(p.id_participacion)))
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    logger.error('getProyectosCompletadosDisponibles: error inesperado', {
      error: errorMsg,
    })
    return err(errorMsg)
  }
}

/**
 * Lee las calificaciones recibidas por un estudiante (por id) con admin client.
 * Misma forma que getMisCalificacionesRecibidas pero parametrizada por id, para
 * poblar el perfil público. Devuelve [] ante error.
 */
async function fetchCalificacionesByEstudiante(
  id_estudiante: string,
): Promise<CalificacionRecibida[]> {
  const adminClient = await createSupabaseAdminClient()
  const { data, error } = await adminClient
    .from('evaluaciones')
    .select(
      `
      id_evaluacion,
      puntuacion,
      comentario,
      respuesta_evaluado,
      evaluado_at,
      empresarios!inner(
        nombre_empresa,
        usuarios!empresarios_id_usuario_fkey(nombre, apellido_1)
      ),
      contrataciones!inner(
        participaciones!inner(
          proyectos!inner(titulo)
        )
      )
      `,
    )
    .eq('id_estudiante', id_estudiante)
    .order('evaluado_at', { ascending: false })

  if (error) {
    logger.error('fetchCalificacionesByEstudiante: fallo en consulta', {
      error: error.message,
    })
    return []
  }

  return (data ?? []).map((row) => {
    const emp = row.empresarios
    const nombreEmpresa =
      emp?.nombre_empresa ||
      [emp?.usuarios?.nombre, emp?.usuarios?.apellido_1]
        .filter(Boolean)
        .join(' ')
    const tituloProyecto =
      row.contrataciones?.participaciones?.proyectos?.titulo ?? ''

    return {
      id_evaluacion: row.id_evaluacion,
      puntuacion: row.puntuacion,
      comentario: row.comentario,
      evaluado_at: row.evaluado_at,
      nombreEmpresa,
      tituloProyecto,
      respuesta_evaluado: row.respuesta_evaluado,
    }
  })
}

/**
 * Lista los proyectos REALES completados por el egresado autenticado: sus
 * participaciones en estado 'finalizada'. A diferencia de los proyectos del
 * portafolio (auto-declarados), estos provienen de contrataciones reales.
 */
export async function getProyectosCompletados(): Promise<
  Result<ProyectoCompletado[]>
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

    const { data: estudiante, error: estError } = await supabase
      .from('estudiantes')
      .select('id_estudiante')
      .eq('id_usuario', user.id)
      .maybeSingle()

    if (estError || !estudiante) {
      return err('unauthorized')
    }

    return ok(
      await fetchProyectosCompletadosByEstudiante(estudiante.id_estudiante),
    )
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    logger.error('getProyectosCompletados: error inesperado', {
      error: errorMsg,
    })
    return err(errorMsg)
  }
}

/**
 * Helper to fetch the profile using the participacion id when the client only has that ID available.
 */
export async function getPublicStudentProfileByParticipacion(
  id_participacion: string,
): Promise<Result<StudentProfileView | null>> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: participacion, error } = await supabase
      .from('participaciones')
      .select('id_estudiante')
      .eq('id_participacion', id_participacion)
      .maybeSingle()

    if (error) {
      logger.error('getPublicStudentProfileByParticipacion: database error', {
        error: error.message,
      })
      return err(error.message)
    }

    if (!participacion) {
      return err('not_found')
    }

    return getPublicStudentProfile(participacion.id_estudiante)
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'unexpected_error'
    return err(errorMsg)
  }
}
