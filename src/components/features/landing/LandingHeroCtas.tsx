'use client'

import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useState } from 'react'
import type { UserRole } from '@/types'

interface HeroCta {
  href: string
  labelKey: string
}

// CTA principal del hero por rol: lleva a la acción central de cada perfil.
const PRIMARY_CTA_BY_ROLE: Record<UserRole, HeroCta> = {
  egresado: { href: '/egresado/projects', labelKey: 'ctaFindProjects' },
  empresario: {
    href: '/empresario/new-project',
    labelKey: 'ctaPublishProject',
  },
  administrador: { href: '/admin', labelKey: 'ctaGoToPanel' },
}

// CTA secundario (estilo contorno): atajo al panel propio. El admin no lo usa.
const SECONDARY_CTA_BY_ROLE: Record<UserRole, HeroCta | null> = {
  egresado: { href: '/egresado', labelKey: 'ctaGoToPanel' },
  empresario: { href: '/empresario', labelKey: 'ctaGoToPanel' },
  administrador: null,
}

const TRANSITION_BASE =
  'background-color var(--duration-base) var(--ease-out), border-color var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out)'

/**
 * Botones del hero de la landing, adaptados al rol de la sesión actual.
 * Sin rol asignado → CTA al onboarding (defensa en profundidad; el middleware
 * ya redirige, pero evita enlaces rotos si el cliente adelanta el render).
 */
export function LandingHeroCtas() {
  const t = useTranslations('Landing')
  const { userRole } = useAuth()
  const [hovPrimary, setHovPrimary] = useState(false)
  const [hovSecondary, setHovSecondary] = useState(false)

  if (!userRole) {
    return (
      <div className="flex flex-wrap gap-4 pt-2">
        <Link
          href="/onboarding"
          className="shadow-lg font-semibold px-6 py-3.5 rounded-lg text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
          style={{
            background: hovPrimary ? 'var(--accent)' : 'var(--primary)',
            color: 'var(--primary-foreground)',
            transform: hovPrimary ? 'scale(1.02)' : 'scale(1)',
            transition: TRANSITION_BASE,
          }}
          onMouseEnter={() => setHovPrimary(true)}
          onMouseLeave={() => setHovPrimary(false)}
        >
          {t('ctaCompleteOnboarding')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  const primary = PRIMARY_CTA_BY_ROLE[userRole]
  const secondary = SECONDARY_CTA_BY_ROLE[userRole]

  return (
    <div className="flex flex-wrap gap-4 pt-2">
      <Link
        href={primary.href}
        className="shadow-lg font-semibold px-6 py-3.5 rounded-lg text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
        style={{
          background: hovPrimary ? 'var(--accent)' : 'var(--primary)',
          color: 'var(--primary-foreground)',
          transform: hovPrimary ? 'scale(1.02)' : 'scale(1)',
          transition: TRANSITION_BASE,
        }}
        onMouseEnter={() => setHovPrimary(true)}
        onMouseLeave={() => setHovPrimary(false)}
      >
        {t(primary.labelKey)}
        <ArrowRight className="w-4 h-4" />
      </Link>
      {secondary && (
        <Link
          href={secondary.href}
          className="font-semibold px-6 py-3.5 rounded-lg text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
          style={{
            border: `1.5px solid color-mix(in oklch, var(--surface) ${hovSecondary ? 85 : 55}%, transparent)`,
            color: 'var(--surface)',
            background: `color-mix(in oklch, var(--surface) ${hovSecondary ? 18 : 8}%, transparent)`,
            backdropFilter: 'blur(6px)',
            transition: TRANSITION_BASE,
          }}
          onMouseEnter={() => setHovSecondary(true)}
          onMouseLeave={() => setHovSecondary(false)}
        >
          {t(secondary.labelKey)}
        </Link>
      )}
    </div>
  )
}
