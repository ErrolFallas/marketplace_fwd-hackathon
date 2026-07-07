import {
  getMiContratacion,
  getTareasByContratacion,
} from '@/lib/deliverables/queries'
import { getCompanyRatingForContract } from '@/lib/company/ratings'
import { getReceivedRatingFromEmpresa } from '@/lib/evaluaciones/actions'
import { EntregablesClient } from '@/components/features/deliverables/EntregablesClient'
import { redirect } from 'next/navigation'

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

  const contratacionResult = await getMiContratacion(id)

  if (!contratacionResult.ok || !contratacionResult.data) {
    redirect('/egresado/applications')
  }

  const contratacion = contratacionResult.data

  const [tareasResult, ratingResult, receivedRatingResult] = await Promise.all([
    getTareasByContratacion(contratacion.id_contratacion),
    getCompanyRatingForContract(contratacion.id_contratacion),
    getReceivedRatingFromEmpresa(contratacion.id_contratacion),
  ])

  const tareas = tareasResult.ok ? tareasResult.data : []
  const existingRating = ratingResult.ok ? ratingResult.data : null
  const receivedRating = receivedRatingResult.ok
    ? receivedRatingResult.data
    : null

  return (
    <EntregablesClient
      projectId={id}
      projectTitle={contratacion.titulo_proyecto}
      companyId={contratacion.id_empresario}
      contratacion={contratacion}
      tareas={tareas}
      existingRating={existingRating}
      receivedRating={receivedRating}
    />
  )
}
