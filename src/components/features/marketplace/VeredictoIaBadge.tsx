'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import type { RevisionEstado } from '@/lib/ai-filtro-ofertas/types'

type EstiloBadge = {
  key: 'badgeAprobada' | 'badgeRechazada'
  cls: string
  Icon: typeof CheckCircle2
}

// Solo aprobada/rechazada pintan badge; no_disponible y no_solicitada no aportan
// señal al empresario, así que no muestran nada. Tokens alineados con
// SupervisorFeedbackCard (accent = relacionada, warning = a revisar).
const ESTILO: Partial<Record<RevisionEstado, EstiloBadge>> = {
  aprobada: {
    key: 'badgeAprobada',
    cls: 'bg-accent/15 text-accent border-accent/30',
    Icon: CheckCircle2,
  },
  rechazada: {
    key: 'badgeRechazada',
    cls: 'bg-warning/15 text-warning border-warning/30',
    Icon: AlertTriangle,
  },
}

interface VeredictoIaBadgeProps {
  estado: RevisionEstado
  className?: string
}

/**
 * Badge compacto del veredicto advisory del revisor IA de postulaciones. Es
 * orientativo: no significa un juicio definitivo sobre la oferta.
 */
export function VeredictoIaBadge({ estado, className }: VeredictoIaBadgeProps) {
  const t = useTranslations('RevisorIa')
  const estilo = ESTILO[estado]
  if (!estilo) return null
  const { Icon } = estilo
  return (
    <span
      title={t('badgeTooltip')}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${estilo.cls} ${className ?? ''}`}
    >
      <Icon className="h-3 w-3" />
      {t(estilo.key)}
    </span>
  )
}
