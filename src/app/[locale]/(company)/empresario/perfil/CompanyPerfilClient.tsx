'use client'

import { CompanyShell } from '@/components/layout/CompanyShell'
import { SidebarEmpresaNuevo } from '@/components/layout/SidebarEmpresaNuevo'
import { CompanyProfileBanner } from '@/components/features/companies/CompanyProfileBanner'
import { CompanyProfileDetails } from '@/components/features/companies/CompanyProfileDetails'
import { CompanyReviewsReceived } from '@/components/features/companies/CompanyReviewsReceived'
import { FwdLogo } from '@/components/features/brand/FwdLogo'
import type { Company } from '@/types'
import type { CompanyProfileView } from '@/lib/company/schemas'
import type { PublishedProject } from '@/lib/projects/dashboard'
import type { CalificacionRecibidaEmpresa } from '@/lib/company/ratings'

interface CompanyPerfilClientProps {
  company: Company
  profile: CompanyProfileView
  projects: PublishedProject[]
  reviews: CalificacionRecibidaEmpresa[]
  googleAvatarUrl: string | null
}

/**
 * Cuerpo (client) del perfil del empresario. Comparte el sidebar unificado de
 * empresario (CompanyShell + grid) con el resto de sus rutas. La identidad de la
 * empresa vive en el banner; debajo, un scroll único presenta los datos con el
 * mismo lenguaje visual que el perfil del egresado (separadores SectionLabel).
 */
export function CompanyPerfilClient({
  company,
  profile,
  projects,
  reviews,
  googleAvatarUrl,
}: CompanyPerfilClientProps) {
  return (
    <CompanyShell>
      <div className="relative flex-1 w-full flex flex-col md:flex-row">
        {/* Watermark de marca (decorativo, sin datos) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -bottom-24 -left-24 w-96 h-96 opacity-[0.04] blur-[1px]">
            <FwdLogo className="w-full h-full" />
          </div>
        </div>

        <SidebarEmpresaNuevo />

        <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <CompanyProfileBanner
            company={company}
            profilePhotoUrl={profile.profilePhoto || googleAvatarUrl}
          />
          <CompanyReviewsReceived reviews={reviews} />
          <CompanyProfileDetails
            profile={profile}
            projects={projects}
            googleAvatarUrl={googleAvatarUrl}
          />
        </main>
      </div>
    </CompanyShell>
  )
}
