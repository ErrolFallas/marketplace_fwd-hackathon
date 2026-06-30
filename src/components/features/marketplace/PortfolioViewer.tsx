import { ProfileView } from './ProfileView'
import type { StudentProfileView } from '@/lib/portfolio/actions'
import type { MatchDetail } from '@/lib/projects/match-logic'

interface PortfolioViewerProps {
  profile: StudentProfileView
  matchScore?: number
  matchDetalles?: MatchDetail[]
}

/**
 * Vista del perfil de un egresado tal como la ven empresas y otros egresados.
 * Es un wrapper delgado sobre ProfileView (la plantilla canónica): inyecta el
 * modo visitante (isOwner=false, reportable) y, cuando aplica, el match score.
 * Los proyectos completados y las calificaciones llegan ya poblados dentro de
 * `profile` desde getPublicStudentProfile (filtrados por RF-12).
 */
export function PortfolioViewer({
  profile,
  matchScore,
  matchDetalles,
}: PortfolioViewerProps) {
  return (
    <ProfileView
      profile={profile}
      proyectosCompletados={profile.proyectosCompletados ?? []}
      calificaciones={profile.calificaciones ?? []}
      isOwner={false}
      reportable
      {...(matchScore !== undefined ? { matchScore } : {})}
      {...(matchDetalles !== undefined ? { matchDetalles } : {})}
    />
  )
}
