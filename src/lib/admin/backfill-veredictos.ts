'use server'

import { ok, err, type Result } from '@/lib/result'
import { logger } from '@/lib/logger'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/guards'
import { revalidatePath } from 'next/cache'
import { revisarPostulacion } from '@/lib/ai-filtro-ofertas/review'
import type { Json } from '@/types/database'

// Tope por corrida para no disparar cientos de llamadas al LLM de golpe.
const MAX_POR_CORRIDA = 50

/**
 * Backfill: regenera el veredicto del revisor IA para las postulaciones que
 * quedaron `no_solicitada` (históricas, previas al registro automático en el
 * envío). Corre en la app porque necesita la key del revisor. Solo admin. No
 * toca las filas donde el revisor falla (`no_disponible`), para poder reintentar.
 */
export async function regenerarVeredictosPendientes(): Promise<
  Result<{ procesadas: number; pendientes: number }>
> {
  const auth = await requireRole('administrador')
  if (!auth.ok) return auth

  const admin = createSupabaseAdminClient()

  const { data: pendientes, error } = await admin
    .from('participaciones')
    .select(
      'id_participacion, id_proyecto, planteamiento_solucion, carta_postulacion',
    )
    .eq('revision_ia_estado', 'no_solicitada')
    .limit(MAX_POR_CORRIDA)
  if (error) {
    logger.error('regenerarVeredictosPendientes: fallo al leer pendientes', {
      error: error.message,
    })
    return err(error.message)
  }
  if (!pendientes || pendientes.length === 0) {
    return ok({ procesadas: 0, pendientes: 0 })
  }

  // Contexto de proyecto (título, descripción, área) cacheado por id.
  const idsProyecto = [...new Set(pendientes.map((p) => p.id_proyecto))]
  const { data: proyectos } = await admin
    .from('proyectos')
    .select('id_proyecto, titulo, descripcion, id_area_negocio')
    .in('id_proyecto', idsProyecto)
  const proyectoPorId = new Map(
    (proyectos ?? []).map((p) => [p.id_proyecto, p]),
  )

  const idsArea = [
    ...new Set(
      (proyectos ?? [])
        .map((p) => p.id_area_negocio)
        .filter((id): id is string => Boolean(id)),
    ),
  ]
  const { data: areas } = idsArea.length
    ? await admin
        .from('areas_negocio')
        .select('id_area, nombre')
        .in('id_area', idsArea)
    : { data: [] }
  const areaPorId = new Map((areas ?? []).map((a) => [a.id_area, a.nombre]))

  let procesadas = 0
  for (const p of pendientes) {
    const proy = proyectoPorId.get(p.id_proyecto)
    if (!proy) continue
    const projectArea = proy.id_area_negocio
      ? (areaPorId.get(proy.id_area_negocio) ?? null)
      : null

    const resultado = await revisarPostulacion({
      projectTitle: proy.titulo ?? 'Proyecto FWD',
      projectDescription: proy.descripcion ?? '',
      projectArea,
      planteamientoSolucion: p.planteamiento_solucion,
      cartaPostulacion: p.carta_postulacion ?? null,
    })
    // Si el revisor no está disponible, no tocar la fila (se reintenta luego).
    if (resultado.estado === 'no_disponible') continue

    const { error: updateError } = await admin
      .from('participaciones')
      .update({
        revision_ia_estado: resultado.estado,
        // Objeto plano JSON-serializable → columna jsonb (patrón de supabase-js).
        revision_ia_detalle: resultado.detalle as unknown as Json,
        revision_ia_modelo: resultado.modelo,
        revision_ia_at: new Date().toISOString(),
      })
      .eq('id_participacion', p.id_participacion)
    if (updateError) {
      logger.error('regenerarVeredictosPendientes: fallo al actualizar', {
        idParticipacion: p.id_participacion,
        error: updateError.message,
      })
      continue
    }
    procesadas += 1
  }

  revalidatePath('/admin/moderation', 'page')
  return ok({ procesadas, pendientes: pendientes.length })
}
