import { ProfileView } from './ProfileView'
import type { StudentProfileView } from '@/lib/portfolio/actions'
import type { MatchDetail, MatchBreakdown } from '@/lib/projects/match-logic'

interface PortfolioViewerProps {
  profile: StudentProfileView
  matchScore?: number
  matchDetalles?: MatchDetail[]
  matchDesglose?: MatchBreakdown
  /** Permite reportar perfil/proyectos. Default true; false cuando el visitante es el propio dueño. */
  reportable?: boolean
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
  matchDesglose,
  reportable = true,
}: PortfolioViewerProps) {
  return (
    <ProfileView
      profile={profile}
      proyectosCompletados={profile.proyectosCompletados ?? []}
      calificaciones={profile.calificaciones ?? []}
      isOwner={false}
      reportable={reportable}
      {...(matchScore !== undefined ? { matchScore } : {})}
      {...(matchDetalles !== undefined ? { matchDetalles } : {})}
      {...(matchDesglose !== undefined ? { matchDesglose } : {})}
    />
  )
}
