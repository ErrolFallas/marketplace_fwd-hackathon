import { getTranslations } from 'next-intl/server'
import {
  getStudentProfile,
  getProyectosCompletados,
} from '@/lib/portfolio/actions'
import { getMisCalificacionesRecibidas } from '@/lib/evaluaciones/actions'
import { EgresadoShell } from '@/components/layout/EgresadoShell'
import { PageTitle } from '@/components/features/brand/PageTitle'
import { ProfileView } from '@/components/features/marketplace/ProfileView'

export default async function PerfilEgresadoPage() {
  const t = await getTranslations('Portfolio')

  const [profileResult, completadosResult, calificacionesResult] =
    await Promise.all([
      getStudentProfile(),
      getProyectosCompletados(),
      getMisCalificacionesRecibidas(),
    ])

  const profile = profileResult.ok ? profileResult.data : null
  const proyectosCompletados = completadosResult.ok
    ? completadosResult.data
    : []
  const calificaciones = calificacionesResult.ok
    ? calificacionesResult.data
    : []

  return (
    <EgresadoShell>
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main className="flex-1 min-w-0">
          <PageTitle
            title={t('profilePageTitle')}
            description={t('profilePageDesc')}
            dotColor="text-primary"
          />

          <div className="mt-8 mx-auto w-full max-w-3xl">
            {profile ? (
              <ProfileView
                profile={profile}
                proyectosCompletados={proyectosCompletados}
                calificaciones={calificaciones}
                isOwner
              />
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">{t('profileEmpty')}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </EgresadoShell>
  )
}
