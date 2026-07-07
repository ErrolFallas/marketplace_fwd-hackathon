import { notFound } from 'next/navigation'
import { EgresadoShell } from '@/components/layout/EgresadoShell'
import { getMiPostulacion } from '@/lib/applications/queries'
import { ApplicationDetailClient } from './ApplicationDetailClient'

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>
}

/**
 * Detalle de una postulación del egresado (RF-30). Server component: trae la
 * participación (ya autorizada por propiedad en la query) y la pasa al cuerpo
 * client. Un id inválido, ajeno o inexistente cae en notFound() sin filtrar
 * si existe o no.
 */
export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params
  const result = await getMiPostulacion(id)

  if (!result.ok) {
    notFound()
  }

  return (
    <EgresadoShell>
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ApplicationDetailClient postulacion={result.data} />
      </div>
    </EgresadoShell>
  )
}
