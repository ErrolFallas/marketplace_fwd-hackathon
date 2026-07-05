import {
  getMiContratacion,
  getTareasByContratacion,
  getEntregablesHuerfanos,
} from '@/lib/deliverables/queries'
import { getMarketplaceProjectById } from '@/lib/projects/marketplace'
import { getCompanyRatingForContract } from '@/lib/company/ratings'
import { getReceivedRatingFromEmpresa } from '@/lib/evaluaciones/actions'
import { EntregablesClient } from '@/components/features/deliverables/EntregablesClient'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Entorno de trabajo del egresado sobre una contratación (`[id]` = id del
 * proyecto). Espeja a `empresario/contrataciones/[id]`. Consolida contrato,
 * entregables (lista compacta) y calificación.
 */
export default async function ContratacionEgresadoPage({ params }: PageProps) {
  const { id } = await params

  const [projectResult, contratacionResult] = await Promise.all([
    getMarketplaceProjectById(id),
    getMiContratacion(id),
  ])

  if (!projectResult.ok) notFound()

  if (!contratacionResult.ok || !contratacionResult.data) {
    redirect('/egresado/applications')
  }

  const contratacion = contratacionResult.data

  const [tareasResult, huerfanosResult, ratingResult, receivedRatingResult] =
    await Promise.all([
      getTareasByContratacion(contratacion.id_contratacion),
      getEntregablesHuerfanos(contratacion.id_contratacion),
      getCompanyRatingForContract(contratacion.id_contratacion),
      getReceivedRatingFromEmpresa(contratacion.id_contratacion),
    ])

  const tareas = tareasResult.ok ? tareasResult.data : []
  const huerfanos = huerfanosResult.ok ? huerfanosResult.data : []
  const existingRating = ratingResult.ok ? ratingResult.data : null
  const receivedRating = receivedRatingResult.ok
    ? receivedRatingResult.data
    : null

  return (
    <EntregablesClient
      projectId={id}
      projectTitle={projectResult.data.title}
      companyId={projectResult.data.companyId}
      contratacion={contratacion}
      tareas={tareas}
      huerfanos={huerfanos}
      existingRating={existingRating}
      receivedRating={receivedRating}
    />
  )
}
