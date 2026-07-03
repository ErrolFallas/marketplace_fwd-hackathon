'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import type { ConversacionItem } from '@/lib/mensajes/actions'
import { ContactAvatar } from './ContactAvatar'
import { EstadoDot } from './EstadoBadge'

interface ConversationRowProps {
  conv: ConversacionItem
  isActive: boolean
  timestampLabel: string
  filaActivaClass: string
  onSelect: () => void
}

export function ConversationRow({
  conv,
  isActive,
  timestampLabel,
  filaActivaClass,
  onSelect,
}: ConversationRowProps) {
  const t = useTranslations('Mensajes')

  const preview: string =
    conv.ultimoMensaje === null
      ? t('sinMensajePreview')
      : conv.ultimoMensajeEsMio
        ? t('ultimoMensajePropio', { snippet: conv.ultimoMensaje })
        : conv.ultimoMensaje

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'w-full border-l-2 px-3 py-3 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
        isActive ? filaActivaClass : 'border-l-transparent hover:bg-muted/40',
      )}
    >
      <div className="flex items-start gap-2.5">
        <ContactAvatar name={conv.nombreContraparte} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
              {conv.nombreContraparte}
            </p>
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
              {timestampLabel}
            </span>
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p
              className={cn(
                'min-w-0 flex-1 truncate text-xs',
                conv.ultimoMensaje === null
                  ? 'text-muted-foreground/60 italic'
                  : 'text-muted-foreground',
              )}
            >
              {preview}
            </p>
            {conv.noLeidos > 0 && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-magenta px-1.5 font-mono text-[10px] font-bold text-magenta-foreground">
                {conv.noLeidos}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <EstadoDot estado={conv.estado} />
            <p className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground/80">
              {conv.tituloProyecto}
            </p>
          </div>
        </div>
      </div>
    </button>
  )
}
