import { getTranslations, getLocale } from 'next-intl/server'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { CompanyShell } from '@/components/layout/CompanyShell'
import { SidebarEmpresaNuevo } from '@/components/layout/SidebarEmpresaNuevo'
import { FwdLogo } from '@/components/features/brand/FwdLogo'
import { PageTitle } from '@/components/features/brand/PageTitle'
import { CompanyProfileForm } from '@/components/features/companies/CompanyProfileForm'
import { getCompanyProfileForEdit } from '@/lib/company/actions'
import { getCurrentUser } from '@/lib/auth/dal'
import { getGoogleAvatarUrl } from '@/lib/portfolio/actions'
import { getCountryOptions, getSubdivisions } from '@/lib/geo/catalog'

/**
 * Formulario de empresa. Server Component: el perfil (datos de empresa + datos
 * personales del empresario) se trae en el server y se pasa al formulario por
 * prop (sin `useEffect` de fetch). El rol y la autenticación los garantiza el
 * layout (company) + middleware.
 */
export default async function CompanyProfileFormPage() {
  const tEmpresa = await getTranslations('Empresa')
  const [user, profileRes, googleAvatarResult] = await Promise.all([
    getCurrentUser(),
    getCompanyProfileForEdit(),
    getGoogleAvatarUrl(),
  ])
  const googleAvatarUrl = googleAvatarResult.ok ? googleAvatarResult.data : null
  const locale = await getLocale()
  const countries = getCountryOptions(locale).map((country) => ({
    value: country.code,
    label: country.name,
  }))
  const profileCountry = profileRes.ok ? profileRes.data.country : ''
  const initialRegions = profileCountry
    ? getSubdivisions(profileCountry).map((subdivision) => ({
        value: subdivision.code,
        label: subdivision.name,
      }))
    : []

  return (
    <CompanyShell>
      <div className="relative flex-1 w-full flex flex-col lg:flex-row">
        {/* Watermark de marca (decorativo, sin datos) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -bottom-24 -left-24 w-96 h-96 opacity-[0.04] blur-[1px]">
            <FwdLogo className="w-full h-full" />
          </div>
        </div>

        <SidebarEmpresaNuevo />

        <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link
              href="/empresario/perfil"
              className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              {tEmpresa('backToProfile')}
            </Link>
          </div>

          <PageTitle
            title={tEmpresa('profileTitle')}
            description={tEmpresa('profileDesc')}
            dotColor="text-secondary"
          />

          {user && profileRes.ok ? (
            <CompanyProfileForm
              initialProfile={profileRes.data}
              userId={user.id}
              countries={countries}
              initialRegions={initialRegions}
              googleAvatarUrl={googleAvatarUrl}
            />
          ) : (
            <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-center">
              <p className="text-sm font-bold text-destructive">
                {tEmpresa('profileNotFound')}
              </p>
            </div>
          )}
        </main>
      </div>
    </CompanyShell>
  )
}
