import { notFound } from 'next/navigation'
import {
  getMarketplaceProjectById,
  checkIfApplied,
} from '@/lib/projects/marketplace'
import { ProjectDetailClient } from '@/components/features/marketplace/ProjectDetailClient'
import { getMiContratacion } from '@/lib/deliverables/queries'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function ProjectDetailsPage({ params }: PageProps) {
  const { id } = await params

  const projectResult = await getMarketplaceProjectById(id, 'projects-detail')

  if (!projectResult.ok) {
    notFound()
  }

  const appliedResult = await checkIfApplied(id)
  const alreadyApplied = appliedResult.ok ? appliedResult.data : false

  // Si el egresado ya está contratado en este proyecto, ofrecemos un puente a su
  // entorno de trabajo (la lista devuelve null si no hay contratación).
  const contratacionResult = await getMiContratacion(id)
  const hasWorkspace = contratacionResult.ok && contratacionResult.data !== null

  const supabase = await createSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()
  let studentCountry: string | null = null
  let studentRegion: string | null = null

  if (userData?.user) {
    const { data: estData } = await supabase
      .from('estudiantes')
      .select('pais_iso_residencia, region_residencia')
      .eq('id_usuario', userData.user.id)
      .maybeSingle()
    if (estData) {
      studentCountry = estData.pais_iso_residencia
      studentRegion = estData.region_residencia
    }
  }

  return (
    <ProjectDetailClient
      project={projectResult.data}
      alreadyApplied={alreadyApplied}
      hasWorkspace={hasWorkspace}
      studentCountry={studentCountry}
      studentRegion={studentRegion}
    />
  )
}
