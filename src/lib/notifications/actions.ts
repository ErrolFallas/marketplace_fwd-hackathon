'use server'

import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/dal'
import { ok, err, type Result } from '@/lib/result'
import { logger } from '@/lib/logger'
import type { Database } from '@/types/database'

export type TipoNotificacion =
  Database['public']['Enums']['tipo_notificacion_enum']

export interface NotificacionItem {
  id_notificacion: string
  mensaje: string
  tipo_evento: TipoNotificacion
  leida: boolean
  url_destino: string | null
  generada_at: string
  params: Record<string, string> | null
}

const MAX_NOTIFICACIONES = 30
const NOTIFICACION_COLUMNS =
  'id_notificacion, mensaje, tipo_evento, leida, url_destino, generada_at, params'
const idSchema = z.string().uuid()

export interface ResumenNotificaciones {
  notificaciones: NotificacionItem[]
  conteoNoLeidas: number
}

/**
 * Lee en una sola llamada la lista y el conteo sin leer del usuario autenticado
 * (estudiante o empresario). Al correr ambas queries dentro del mismo request,
 * la sesión se valida una vez (`getCurrentUser` memoizado) en lugar de dos.
 * El conteo es `exact` e independiente del límite de la lista, para que el badge
 * nunca subestime el total cuando hay más de {@link MAX_NOTIFICACIONES} sin
 * leer. RLS (`notificaciones_select_own`) garantiza que solo se devuelvan las
 * propias (RF-47).
 */
export async function getMiResumenNotificaciones(): Promise<
  Result<ResumenNotificaciones>
> {
  const user = await getCurrentUser()
  if (!user) return err('unauthenticated')

  const supabase = await createSupabaseServerClient()
  const [listaRes, conteoRes] = await Promise.all([
    supabase
      .from('notificaciones')
      .select(NOTIFICACION_COLUMNS)
      .eq('id_usuario', user.id)
      .order('generada_at', { ascending: false })
      .limit(MAX_NOTIFICACIONES),
    supabase
      .from('notificaciones')
      .select('id_notificacion', { count: 'exact', head: true })
      .eq('id_usuario', user.id)
      .eq('leida', false),
  ])

  if (listaRes.error) {
    logger.error('getMiResumenNotificaciones: fallo al leer lista', {
      error: listaRes.error.message,
    })
    return err(listaRes.error.message)
  }
  if (conteoRes.error) {
    logger.error('getMiResumenNotificaciones: fallo al contar', {
      error: conteoRes.error.message,
    })
    return err(conteoRes.error.message)
  }

  return ok({
    notificaciones: (listaRes.data ?? []) as NotificacionItem[],
    conteoNoLeidas: conteoRes.count ?? 0,
  })
}

/**
 * Marca una notificación propia como leída. El filtro por `id_usuario` y la
 * RLS (`notificaciones_update_own`) impiden tocar notificaciones de otros.
 */
export async function marcarNotificacionLeida(
  id: string,
): Promise<Result<void>> {
  const parsed = idSchema.safeParse(id)
  if (!parsed.success) return err('invalid_id')

  const user = await getCurrentUser()
  if (!user) return err('unauthenticated')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('id_notificacion', parsed.data)
    .eq('id_usuario', user.id)

  if (error) {
    logger.error('marcarNotificacionLeida: fallo al actualizar', {
      error: error.message,
    })
    return err(error.message)
  }

  return ok(undefined)
}

/**
 * Marca como leídas todas las notificaciones sin leer del usuario autenticado.
 */
export async function marcarTodasMisNotificacionesLeidas(): Promise<
  Result<void>
> {
  const user = await getCurrentUser()
  if (!user) return err('unauthenticated')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('id_usuario', user.id)
    .eq('leida', false)

  if (error) {
    logger.error('marcarTodasMisNotificacionesLeidas: fallo al actualizar', {
      error: error.message,
    })
    return err(error.message)
  }

  return ok(undefined)
}
