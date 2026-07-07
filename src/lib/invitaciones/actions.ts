'use server'

import { z } from 'zod'
import { ok, err, type Result } from '@/lib/result'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'
import { notificarInvitacionProyecto } from './notificar-invitacion'

const InvitarSchema = z.object({
  idProyecto: z.string().uuid(),
  idEstudiante: z.string().uuid(),
})

export type InvitarEgresadoInput = z.infer<typeof InvitarSchema>

/** Estados de proyecto que aceptan invitar (aún recibe postulaciones). */
const ESTADOS_ABIERTOS = ['abierto', 'en_recepcion']
/** Participación viva: si ya existe, no tiene sentido invitar de nuevo. */
const PARTICIPACION_ACTIVA = [
  'enviada',
  'en_revision',
  'contratada',
  'finalizada',
] as const

/**
 * Invita a un egresado recomendado a postular a un proyecto (flujo push).
 * Crea una notificación in-app; NO inscribe al egresado (sigue el flujo formal).
 *
 * Guardas (render != click, así que se revalida TODO en el servidor):
 * - rol empresario y propiedad del proyecto,
 * - proyecto activo y abierto,
 * - egresado verificado, con portafolio público y cuenta activa,
 * - no está ya participando (estado vivo),
 * - idempotencia: no fue ya invitado a este proyecto.
 */
export async function invitarEgresado(
  input: InvitarEgresadoInput,
): Promise<Result<void>> {
  const parsed = InvitarSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')
  const { idProyecto, idEstudiante } = parsed.data

  const roleResult = await requireRole('empresario')
  if (!roleResult.ok) return err('forbidden')

  const supabase = await createSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return err('unauthenticated')

  const { data: empresario } = await supabase
    .from('empresarios')
    .select('id_empresario')
    .eq('id_usuario', userData.user.id)
    .maybeSingle()
  if (!empresario) return err('forbidden')

  // Proyecto: existe, es de este empresario y sigue abierto.
  const { data: proyecto } = await supabase
    .from('proyectos')
    .select('id_empresario, estado, is_active, titulo')
    .eq('id_proyecto', idProyecto)
    .maybeSingle()
  if (!proyecto || proyecto.id_empresario !== empresario.id_empresario) {
    return err('forbidden')
  }
  if (!proyecto.is_active || !ESTADOS_ABIERTOS.includes(proyecto.estado)) {
    return err('proyecto_cerrado')
  }

  // Re-validación del egresado en el momento del click (con admin: la RLS oculta
  // estado de cuenta de la contraparte). El acceso está gateado por el rol +
  // propiedad ya verificados arriba.
  const admin = createSupabaseAdminClient()
  const { data: estudiante } = await admin
    .from('estudiantes')
    .select(
      `
      id_usuario,
      estado_verificacion,
      portafolio_visible_publicamente,
      usuarios!estudiantes_id_usuario_fkey(estado_cuenta, is_active)
    `,
    )
    .eq('id_estudiante', idEstudiante)
    .maybeSingle()

  if (!estudiante) return err('estudiante_not_found')
  if (
    estudiante.estado_verificacion !== 'verificado' ||
    !estudiante.portafolio_visible_publicamente
  ) {
    return err('egresado_no_invitable')
  }
  const usuarioEstudiante = estudiante.usuarios
  if (
    !usuarioEstudiante?.is_active ||
    usuarioEstudiante.estado_cuenta !== 'activa'
  ) {
    return err('egresado_no_invitable')
  }

  // Ya participa (estado vivo) → no re-invitar.
  const { data: participacion } = await admin
    .from('participaciones')
    .select('id_participacion')
    .eq('id_proyecto', idProyecto)
    .eq('id_estudiante', idEstudiante)
    .in('estado', [...PARTICIPACION_ACTIVA])
    .maybeSingle()
  if (participacion) return err('ya_participa')

  // Idempotencia: ¿ya se lo invitó a ESTE proyecto? Se filtra en memoria por
  // params.idProyecto para no depender de un filtro jsonb en la query.
  const { data: invitacionesPrevias } = await admin
    .from('notificaciones')
    .select('params')
    .eq('id_usuario', estudiante.id_usuario)
    .eq('tipo_evento', 'invitacion_proyecto')

  const yaInvitado = (invitacionesPrevias ?? []).some((notif) => {
    const params = notif.params as { idProyecto?: string } | null
    return params?.idProyecto === idProyecto
  })
  if (yaInvitado) return err('ya_invitado')

  const enviada = await notificarInvitacionProyecto({
    idEstudiante,
    idProyecto,
    tituloProyecto: proyecto.titulo,
  })
  if (!enviada) {
    logger.error('invitarEgresado: no se pudo crear la notificación', {
      idProyecto,
      idEstudiante,
    })
    return err('notificacion_fallida')
  }

  revalidatePath(`/empresario/proyecto/${idProyecto}`)
  return ok(undefined)
}
