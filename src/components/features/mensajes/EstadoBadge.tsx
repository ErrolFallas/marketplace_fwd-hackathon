'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

type EstadoConversacion = 'contratada' | 'finalizada' | 'cancelada'

/** Etiqueta, color de badge y color de punto según el estado de la conversación. */
function useEstadoConfig(estado: EstadoConversacion) {
  const t = useTranslations('Mensajes')
  if (estado === 'contratada') {
    return {
      label: t('estadoActivo'),
      badge: 'bg-accent/15 text-accent',
      dot: 'bg-accent',
    }
  }
  if (estado === 'cancelada') {
    return {
      label: t('estadoCancelado'),
      badge: 'bg-magenta/15 text-magenta',
      dot: 'bg-magenta',
    }
  }
  return {
    label: t('estadoFinalizado'),
    badge: 'bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground/50',
  }
}

interface EstadoBadgeProps {
  estado: EstadoConversacion
}

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const cfg = useEstadoConfig(estado)
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        cfg.badge,
      )}
    >
      <span className={cn('size-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

interface EstadoDotProps {
  estado: EstadoConversacion
}

export function EstadoDot({ estado }: EstadoDotProps) {
  const cfg = useEstadoConfig(estado)
  return (
    <span
      className={cn('size-2 shrink-0 rounded-full', cfg.dot)}
      title={cfg.label}
      role="img"
      aria-label={cfg.label}
    />
  )
}
