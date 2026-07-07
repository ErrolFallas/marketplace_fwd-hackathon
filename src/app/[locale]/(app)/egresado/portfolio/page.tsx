import { PortfolioManager } from '@/components/features/marketplace/PortfolioManager'
import { getTranslations } from 'next-intl/server'
import { getStudentProfile, getGoogleAvatarUrl } from '@/lib/portfolio/actions'
import { EgresadoShell } from '@/components/layout/EgresadoShell'
import { PageTitle } from '@/components/features/brand/PageTitle'
import { getCountryOptions, getSubdivisions } from '@/lib/geo/catalog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function PortfolioPage({
  params,
}: {
  params: { locale: string }
}) {
  const t = await getTranslations('Portfolio')

  const locale = await params.locale

  const [profileResult, googleAvatarResult] = await Promise.all([
    getStudentProfile(),
    getGoogleAvatarUrl(),
  ])

  const initialProfile = profileResult.ok ? profileResult.data : null
  const googleAvatarUrl = googleAvatarResult.ok ? googleAvatarResult.data : null

  const countries = getCountryOptions(locale).map((country) => ({
    value: country.code,
    label: country.name,
  }))
  const initialRegions = initialProfile?.paisIsoResidencia
    ? getSubdivisions(initialProfile.paisIsoResidencia).map((sub) => ({
        value: sub.code,
        label: sub.name,
      }))
    : []

  return (
    <EgresadoShell>
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main className="flex-1 min-w-0">
          <PageTitle
            title={t('title')}
            description={t('description')}
            dotColor="text-primary"
            action={
              <Button asChild variant="outline" className="shrink-0">
                <Link href={`/${locale}/egresado/perfil`}>
                  {t('viewMyProfile')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            }
          />

          <div className="mt-8">
            <PortfolioManager
              initialProfile={initialProfile}
              countries={countries}
              initialRegions={initialRegions}
              googleAvatarUrl={googleAvatarUrl}
            />
          </div>
        </main>
      </div>
    </EgresadoShell>
  )
}
