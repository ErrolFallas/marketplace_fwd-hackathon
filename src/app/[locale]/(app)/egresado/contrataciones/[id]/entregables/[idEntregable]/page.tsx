import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { EgresadoShell } from '@/components/layout/EgresadoShell'
import { PageTitle } from '@/components/features/brand/PageTitle'
import { TareaCard } from '@/components/features/deliverables/TareaCard'
import { getTareaDetalle } from '@/lib/deliverables/queries'

interface PageProps {
  params: Promise<{ id: string; idEntregable: string }>
}

/**
 * Detalle de UN entregable del egresado: encabezado + todas sus propuestas + el
 * form multi-evidencia para subir la siguiente. `[id]` = id del proyecto;
 * `[idEntregable]` = id de la tarea.
 */
export default async function EntregableDetalleEgresadoPage({
  params,
}: PageProps) {
  const { id, idEntregable } = await params
  const t = await getTranslations('Contrataciones')

  const detalleResult = await getTareaDetalle(idEntregable)
  if (!detalleResult.ok || !detalleResult.data) notFound()
  const detalle = detalleResult.data
  if (detalle.idProyecto !== id) notFound()

  return (
    <EgresadoShell>
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link
          href={`/egresado/contrataciones/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('volverEntregables')}
        </Link>

        <PageTitle
          title={detalle.tarea.titulo}
          description={t('detalleDesc')}
          dotColor="text-primary"
        />

        <TareaCard
          rol="egresado"
          tarea={detalle.tarea}
          idProyecto={id}
          canManage={detalle.estadoPeriodo === 'vigente'}
        />
      </div>
    </EgresadoShell>
  )
}
