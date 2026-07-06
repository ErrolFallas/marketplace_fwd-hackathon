'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireVerifiedEmpresario } from '@/lib/auth/guards'
import { ok, err, type Result } from '@/lib/result'
import { logger } from '@/lib/logger'

const RepublicarProyectoSchema = z.object({
  idProyecto: z.string().uuid(),
})

/**
 * El empresario republica un proyecto cancelado como COPIA EXACTA con id nuevo
 * (estado `abierto`, ventana de plazo nueva). Llama al RPC `republicar_proyecto`
 * (SECURITY DEFINER: valida dueño + estado `cancelado`, copia la fila y los puentes
 * N:M en una transacción). Devuelve el id del proyecto nuevo.
 */
export async function republicarProyecto(
  input: z.infer<typeof RepublicarProyectoSchema>,
): Promise<Result<string>> {
  const parsed = RepublicarProyectoSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')

  const guard = await requireVerifiedEmpresario()
  if (!guard.ok) return guard

  const supabase = await createSupabaseServerClient()
  const { data, error: rpcError } = await supabase.rpc('republicar_proyecto', {
    p_id_origen: parsed.data.idProyecto,
  })
  if (rpcError) {
    logger.error('republicarProyecto: RPC failed', {
      code: rpcError.code,
      error: rpcError.message,
    })
    if (rpcError.code === 'P0007') return err('proyecto_no_cancelado')
    if (rpcError.code === 'P0004' || rpcError.code === 'P0003')
      return err('unauthorized')
    return err('database_error')
  }

  revalidatePath('/empresario')
  revalidatePath(`/empresario/contrataciones/${parsed.data.idProyecto}`)
  return ok(data)
}
