'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

type EstadoConversacion = 'contratada' | 'finalizada'

interface EstadoBadgeProps {
  estado: EstadoConversacion
}

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const t = useTranslations('Mensajes')
  const isActivo = estado === 'contratada'
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        isActivo
          ? 'bg-accent/15 text-accent'
          : 'bg-muted text-muted-foreground',
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          isActivo ? 'bg-accent' : 'bg-muted-foreground/50',
        )}
      />
      {isActivo ? t('estadoActivo') : t('estadoFinalizado')}
    </span>
  )
}

interface EstadoDotProps {
  estado: EstadoConversacion
}

export function EstadoDot({ estado }: EstadoDotProps) {
  const t = useTranslations('Mensajes')
  const isActivo = estado === 'contratada'
  const label = isActivo ? t('estadoActivo') : t('estadoFinalizado')
  return (
    <span
      className={cn(
        'size-2 shrink-0 rounded-full',
        isActivo ? 'bg-accent' : 'bg-muted-foreground/40',
      )}
      title={label}
      role="img"
      aria-label={label}
    />
  )
}
