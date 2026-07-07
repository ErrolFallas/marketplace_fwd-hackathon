import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { CompanyShell } from '@/components/layout/CompanyShell'
import { SidebarEmpresaNuevo } from '@/components/layout/SidebarEmpresaNuevo'
import { PageTitle } from '@/components/features/brand/PageTitle'
import { TareaCard } from '@/components/features/deliverables/TareaCard'
import { getTareaDetalle } from '@/lib/deliverables/queries'
import { isCompanyProfileComplete } from '@/lib/company/actions'

interface PageProps {
  params: Promise<{ id: string; idEntregable: string }>
}

/**
 * Detalle de UN entregable del empresario: encabezado + todas sus propuestas +
 * veredicto. `[id]` = id del proyecto; `[idEntregable]` = id de la tarea.
 */
export default async function EntregableDetalleEmpresarioPage({
  params,
}: PageProps) {
  const { id, idEntregable } = await params
  const locale = await getLocale()
  const t = await getTranslations('Contrataciones')

  const complete = await isCompanyProfileComplete()
  if (!complete.ok || !complete.data) {
    redirect(`/${locale}/empresario/formulario-empresa`)
  }

  const detalleResult = await getTareaDetalle(idEntregable)
  if (!detalleResult.ok || !detalleResult.data) notFound()
  const detalle = detalleResult.data
  if (detalle.idProyecto !== id) notFound()

  return (
    <CompanyShell>
      <div className="flex-1 w-full flex flex-col lg:flex-row">
        <SidebarEmpresaNuevo />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Link
            href={`/empresario/contrataciones/${id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('volverEntregables')}
          </Link>

          <PageTitle
            title={detalle.tarea.titulo}
            description={t('detalleDesc')}
            dotColor="text-secondary"
          />

          <TareaCard
            rol="empresario"
            tarea={detalle.tarea}
            idProyecto={id}
            canManage={detalle.estadoPeriodo === 'vigente'}
          />
        </main>
      </div>
    </CompanyShell>
  )
}
