'use client'

import { useTranslations } from 'next-intl'
import { Briefcase } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SectionLabel } from '@/components/features/shared/SectionLabel'
import { PublishedProjectsBoard } from '@/components/features/projects/PublishedProjectsBoard'
import type { CompanyProfileView } from '@/lib/company/schemas'
import type { PublishedProject } from '@/lib/projects/dashboard'

interface CompanyProfileDetailsProps {
  profile: CompanyProfileView
  projects: PublishedProject[]
}

const SCOPE_KEY = {
  nacional: 'scopeNacional',
  internacional: 'scopeInternacional',
  ambos: 'scopeAmbos',
} as const

const VERIF_KEY = {
  pendiente: 'verifPendiente',
  verificado: 'verifVerificado',
  rechazado: 'verifRechazado',
} as const

/**
 * Detalle del perfil del empresario (identidad). SOLO datos reales de la BD
 * (empresarios + usuarios + proyectos). Reusa el lenguaje visual del egresado:
 * una credencial en scroll único con separadores `SectionLabel`. Los proyectos
 * publicados se muestran completos (board inline), bajo su propia sección.
 */
export function CompanyProfileDetails({
  profile,
  projects,
}: CompanyProfileDetailsProps) {
  const t = useTranslations('EmpresaPerfil')
  const tE = useTranslations('Empresa')

  const fullName = [profile.firstName, profile.lastName1, profile.lastName2]
    .filter(Boolean)
    .join(' ')
  const ubicacion = [profile.city, profile.country].filter(Boolean).join(', ')

  return (
    <Card className="overflow-hidden border border-primary/20 bg-surface shadow-sm">
      {/* Banda arcoíris FWD: misma credencial que el egresado */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent" />

      <CardContent className="space-y-6 pt-6 font-sans">
        {/* === Sobre la empresa === */}
        <div className="space-y-2">
          <SectionLabel>{t('aboutCompany')}</SectionLabel>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground prose-body">
            {profile.description ? (
              profile.description
            ) : (
              <span className="italic text-muted-foreground">
                {t('noDescription')}
              </span>
            )}
          </p>
        </div>

        {/* === Datos de la empresa === */}
        <div className="space-y-3">
          <SectionLabel>{t('companyData')}</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <DataItem label={tE('fieldSector')} value={profile.sector} />
            <DataItem
              label={tE('fieldType')}
              value={
                profile.companyType === 'formal'
                  ? tE('typeFormal')
                  : tE('typeEmprendedor')
              }
            />
            {profile.cedula ? (
              <DataItem
                label={
                  profile.companyType === 'emprendedor'
                    ? tE('fieldCedulaIdentidad')
                    : tE('fieldCedulaJuridica')
                }
                value={profile.cedula}
              />
            ) : null}
            {ubicacion ? (
              <DataItem label={tE('fieldCountry')} value={ubicacion} />
            ) : null}
            {profile.operatingScope ? (
              <DataItem
                label={tE('fieldScope')}
                value={tE(SCOPE_KEY[profile.operatingScope])}
              />
            ) : null}
            <DataItem
              label={tE('verificationLabel')}
              value={
                profile.verificationStatus
                  ? tE(VERIF_KEY[profile.verificationStatus])
                  : tE('verifNone')
              }
            />
          </div>
        </div>

        {/* === Representante === */}
        <div className="space-y-3">
          <SectionLabel>{t('representative')}</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <DataItem label={t('fullName')} value={fullName} />
            <DataItem
              label={tE('emailReadonly')}
              value={profile.contactEmail}
            />
            {profile.website ? (
              <DataItem label={t('website')} value={profile.website} />
            ) : null}
          </div>
        </div>

        {/* === Proyectos publicados (board completo inline) === */}
        <div className="space-y-3">
          <SectionLabel accent icon={<Briefcase className="h-3.5 w-3.5" />}>
            {t('activeOpportunities')}
          </SectionLabel>
          <PublishedProjectsBoard projects={projects} />
        </div>
      </CardContent>
    </Card>
  )
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="block text-sm font-medium text-foreground break-words">
        {value}
      </span>
    </div>
  )
}
