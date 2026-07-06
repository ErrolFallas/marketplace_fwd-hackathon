'use client'

import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Button } from '@/components/ui/button'
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

// Tamaño compartido de los CTAs del hero (superficie brand-expresiva §5.7).
const HERO_CTA_SIZE = 'h-12 rounded-lg px-6 text-sm font-semibold shadow-lg'

// CTA secundario: Link directo (no Button) porque las variants outline/ghost
// asumen fondo claro. Hover y foco en CSS; anillo de foco en highlight FWD,
// legible sobre el quiebre morado del hero (§5.7). Sin estado JS.
const HERO_SECONDARY_CLASSES = [
  'inline-flex items-center justify-center gap-1.5 h-12 rounded-lg px-6 text-sm font-semibold cursor-pointer backdrop-blur-sm',
  'border border-surface/55 bg-surface/8 text-surface',
  'transition-[background-color,border-color] duration-[var(--duration-base)] ease-[var(--ease-out)]',
  'hover:bg-surface/15 hover:border-surface/85',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-secondary',
].join(' ')

/**
 * Botones del hero de la landing, adaptados al rol de la sesión actual.
 * Sin rol asignado → CTA al onboarding (defensa en profundidad; el middleware
 * ya redirige, pero evita enlaces rotos si el cliente adelanta el render).
 */
export function LandingHeroCtas() {
  const t = useTranslations('Landing')
  const { userRole } = useAuth()

  if (!userRole) {
    return (
      <div className="flex flex-wrap gap-4 pt-2">
        <Button asChild className={HERO_CTA_SIZE}>
          <Link href="/onboarding">
            {t('ctaCompleteOnboarding')}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    )
  }

  const primary = PRIMARY_CTA_BY_ROLE[userRole]
  const secondary = SECONDARY_CTA_BY_ROLE[userRole]

  return (
    <div className="flex flex-wrap gap-4 pt-2">
      <Button asChild className={HERO_CTA_SIZE}>
        <Link href={primary.href}>
          {t(primary.labelKey)}
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
      {secondary && (
        <Link href={secondary.href} className={HERO_SECONDARY_CLASSES}>
          {t(secondary.labelKey)}
        </Link>
      )}
    </div>
  )
}
