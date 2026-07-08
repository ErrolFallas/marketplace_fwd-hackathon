import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { isCompanyProfileComplete } from '@/lib/company/actions'
import { getCurrentUser } from '@/lib/auth/dal'
import {
  getConversacionesEmpresario,
  getMensajesDeProyecto,
  type Mensaje,
} from '@/lib/mensajes/actions'
import { CompanyShell } from '@/components/layout/CompanyShell'
import { SidebarEmpresaNuevo } from '@/components/layout/SidebarEmpresaNuevo'
import { MensajeriaWorkspace } from '@/components/features/mensajes/MensajeriaWorkspace'

export default async function CompanyMensajesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const locale = await getLocale()

  const complete = await isCompanyProfileComplete()
  if (!complete.ok || !complete.data) {
    redirect(`/${locale}/empresario/formulario-empresa`)
  }

  const params = await searchParams
  const proyectoParam = params['proyecto']
  const initialProjectId =
    typeof proyectoParam === 'string' ? proyectoParam : null

  const [conversacionesResult, user] = await Promise.all([
    getConversacionesEmpresario(),
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
    <CompanyShell>
      <div className="flex w-full flex-col md:flex-row">
        <SidebarEmpresaNuevo />
        <MensajeriaWorkspace
          rol="empresario"
          conversaciones={conversaciones}
          initialProjectId={initialProjectId}
          initialMensajes={initialMensajes}
          currentUserId={user?.id ?? ''}
        />
      </div>
    </CompanyShell>
  )
}
