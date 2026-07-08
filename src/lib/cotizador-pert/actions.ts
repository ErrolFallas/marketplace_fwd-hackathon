'use server'

import { z } from 'zod'
import { ok, err, type Result } from '@/lib/result'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireVerifiedEgresado } from '@/lib/auth/guards'
import { estimarConIA } from './estimate'
import { MAX_HORAS_MODULO } from './constants'
import type { EstimacionIaResultado } from './types'

/**
 * Server action del cotizador IA. ADVISORY y on-demand: el egresado la dispara
 * con un botón para que la IA proponga los rangos O/P y lea el stack de su repo.
 * NUNCA bloquea la postulación ni calcula dinero (eso es el motor puro en el
 * cliente). Requiere egresado verificado + consentimiento IA, respeta el
 * kill-switch global y degrada al fallback determinista si algo falla (RNF-34).
 */

const KILL_SWITCH_CLAVE = 'cotizador_pert_ia_activo'

const horasSchema = z.number().min(0).max(MAX_HORAS_MODULO)

const CotizarSchema = z.object({
  id_proyecto: z.string().uuid(),
  horas_m: z.object({
    analisis_diseno: horasSchema,
    frontend: horasSchema,
    backend: horasSchema,
    base_datos: horasSchema,
    pruebas_calidad: horasSchema,
    despliegue: horasSchema,
  }),
  github_url: z.string().trim().max(500).optional(),
  consentimiento_ia: z.boolean(),
})

const FALLBACK_RESULT: EstimacionIaResultado = {
  propuesta: {},
  fuenteOP: 'fallback',
  stack: null,
  contraste: null,
  avisos: ['ia_no_disponible'],
}

export async function cotizarConIA(
  input: z.infer<typeof CotizarSchema>,
): Promise<Result<EstimacionIaResultado>> {
  const parsed = CotizarSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')

  const verified = await requireVerifiedEgresado()
  if (!verified.ok) return verified

  // El consentimiento IA es obligatorio para procesar datos con el modelo.
  if (!parsed.data.consentimiento_ia) return err('consentimiento_requerido')

  const supabase = await createSupabaseServerClient()

  const { data: proyecto, error: proyectoError } = await supabase
    .from('proyectos')
    .select('titulo, descripcion')
    .eq('id_proyecto', parsed.data.id_proyecto)
    .single()
  if (proyectoError || !proyecto) return err('proyecto_not_found')

  // Kill-switch global: apagado ⇒ fallback determinista, sin llamar al modelo.
  const { data: flag } = await supabase
    .from('configuracion_sistema')
    .select('valor')
    .eq('clave', KILL_SWITCH_CLAVE)
    .maybeSingle()
  if (flag?.valor === 'false') return ok(FALLBACK_RESULT)

  // Stack requerido del proyecto (best-effort: si no hay, se omite el contraste).
  let tecnologiasRequeridas: string[] = []
  const { data: techRows } = await supabase
    .from('proyecto_tecnologias')
    .select('tecnologias(nombre)')
    .eq('id_proyecto', parsed.data.id_proyecto)
  if (techRows) {
    tecnologiasRequeridas = techRows
      .map((r) => r.tecnologias?.nombre)
      .filter((n): n is string => typeof n === 'string' && n.trim().length > 0)
  }

  const resultado = await estimarConIA({
    projectTitle: proyecto.titulo ?? 'Proyecto FWD',
    projectDescription: proyecto.descripcion ?? '',
    tecnologiasRequeridas,
    horasM: parsed.data.horas_m,
    githubUrl: parsed.data.github_url ?? null,
  })

  return ok(resultado)
}
