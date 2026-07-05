import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { CompanyShell } from '@/components/layout/CompanyShell'
import { SidebarEmpresaNuevo } from '@/components/layout/SidebarEmpresaNuevo'
import { PageTitle } from '@/components/features/brand/PageTitle'
import { EntregablesTareas } from '@/components/features/deliverables/EntregablesTareas'
import { ContratoCard } from '@/components/features/deliverables/ContratoCard'
import { EmpresarioRatingCard } from '@/components/features/evaluaciones/EmpresarioRatingCard'
import { getMyPublishedProjects } from '@/lib/projects/dashboard'
import {
  getContratacionParaGestion,
  getTareasByContratacion,
  getEntregablesHuerfanos,
} from '@/lib/deliverables/queries'
import { getProjectParticipations } from '@/lib/projects/project-detail'
import { isCompanyProfileComplete } from '@/lib/company/actions'
import { getEgresadoRatingForContract } from '@/lib/evaluaciones/actions'

interface ContratacionDetallePageProps {
  params: Promise<{ id: string }>
}

/**
 * Zona de trabajo del empresario sobre UNA contratación. `[id]` es el id del
 * proyecto (1:1 con la contratación). Consolida el contrato (negociación de
 * monto/condiciones), los entregables de 2 niveles y la calificación.
 */
export default async function ContratacionDetallePage({
  params,
}: ContratacionDetallePageProps) {
  const { id } = await params
  const locale = await getLocale()
  const t = await getTranslations('Contrataciones')
  const tEmpresa = await getTranslations('EmpresaPerfil')

  const complete = await isCompanyProfileComplete()
  if (!complete.ok || !complete.data) {
    redirect(`/${locale}/empresario/formulario-empresa`)
  }

  const projectsResult = await getMyPublishedProjects()
  const project = projectsResult.ok
    ? projectsResult.data.find((proyecto) => proyecto.id === id)
    : undefined
  if (!project) {
    notFound()
  }

  const [participationsResult, gestionResult] = await Promise.all([
    getProjectParticipations(id),
    getContratacionParaGestion(id),
  ])
  const gestion = gestionResult.ok ? gestionResult.data : null

  const [tareasResult, huerfanosResult, existingRating] = gestion
    ? await Promise.all([
        getTareasByContratacion(gestion.id_contratacion),
        getEntregablesHuerfanos(gestion.id_contratacion),
        getEgresadoRatingForContract(gestion.id_contratacion).then((r) =>
          r.ok ? r.data : null,
        ),
      ])
    : [null, null, null]
  const tareas = tareasResult?.ok ? tareasResult.data : []
  const huerfanos = huerfanosResult?.ok ? huerfanosResult.data : []

  const contratado = participationsResult.ok
    ? participationsResult.data.find(
        (p) => p.estado === 'contratada' || p.estado === 'finalizada',
      )
    : undefined
  const egresadoNombre = contratado
    ? `${contratado.estudianteNombre} ${contratado.estudianteApellidos}`
    : null

  const isFinalizado = gestion?.estado_periodo === 'finalizado'

  return (
    <CompanyShell>
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <SidebarEmpresaNuevo />

        <main className="flex-1 space-y-8">
          <Link
            href="/empresario/contrataciones"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]"
          >
            <ArrowLeft className="w-4 h-4" />
            {tEmpresa('backToContrataciones')}
          </Link>

          <PageTitle
            title={project.titulo}
            description={
              egresadoNombre
                ? t('pageDescEgresado', { nombre: egresadoNombre })
                : t('pageDesc')
            }
            dotColor="text-secondary"
            action={
              <Link
                href={`/empresario/mensajes?proyecto=${id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary/10"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {t('chatButton')}
              </Link>
            }
          />

          {gestion && (
            <ContratoCard
              idProyecto={id}
              estadoPeriodo={gestion.estado_periodo}
              acuerdoAceptadoAt={gestion.acuerdo_aceptado_at}
              montoAcordado={gestion.monto_acordado}
              moneda={gestion.moneda}
              condicionesEspeciales={gestion.condiciones_especiales}
              presupuestoMin={gestion.presupuesto_min}
              presupuestoMax={gestion.presupuesto_max}
            />
          )}

          {gestion && (
            <EntregablesTareas
              rol="empresario"
              idProyecto={id}
              tareas={tareas}
              huerfanos={huerfanos}
              canManage={gestion.estado_periodo === 'vigente'}
            />
          )}

          {isFinalizado && gestion && (
            <EmpresarioRatingCard
              idEstudiante={gestion.id_estudiante}
              idContratacion={gestion.id_contratacion}
              existingRating={existingRating}
            />
          )}
        </main>
      </div>
    </CompanyShell>
  )
}
