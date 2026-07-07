import { getCurrentUser } from '@/lib/auth/dal'
import {
  getConversacionesEgresado,
  getMensajesDeProyecto,
  type Mensaje,
} from '@/lib/mensajes/actions'
import { EgresadoShell } from '@/components/layout/EgresadoShell'
import { MensajeriaWorkspace } from '@/components/features/mensajes/MensajeriaWorkspace'

export default async function EgresadoMensajesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const proyectoParam = params['proyecto']
  const initialProjectId =
    typeof proyectoParam === 'string' ? proyectoParam : null

  const [conversacionesResult, user] = await Promise.all([
    getConversacionesEgresado(),
    getCurrentUser(),
  ])

  const conversaciones = conversacionesResult.ok
    ? conversacionesResult.data
    : []

  let initialMensajes: { mensajes: Mensaje[]; puedeEnviar: boolean } | null =
    null
  if (initialProjectId) {
    const result = await getMensajesDeProyecto(initialProjectId)
    if (result.ok) initialMensajes = result.data
  }

  return (
    <EgresadoShell>
      <MensajeriaWorkspace
        rol="egresado"
        conversaciones={conversaciones}
        initialProjectId={initialProjectId}
        initialMensajes={initialMensajes}
        currentUserId={user?.id ?? ''}
      />
    </EgresadoShell>
  )
}
