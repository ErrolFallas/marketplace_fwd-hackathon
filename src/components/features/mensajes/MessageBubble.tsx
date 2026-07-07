'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Check, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ReportButton } from '@/components/features/moderation/ReportButton'
import type { Mensaje } from '@/lib/mensajes/actions'

function formatHora(fechaEnvio: string, locale: string): string {
  return new Date(fechaEnvio).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface MessageBubbleProps {
  mensaje: Mensaje
  isMine: boolean
  burbujaPropiaClass: string
}

export function MessageBubble({
  mensaje,
  isMine,
  burbujaPropiaClass,
}: MessageBubbleProps) {
  const t = useTranslations('Mensajes')
  const locale = useLocale()

  return (
    <div
      className={cn(
        'group/mensaje flex max-w-[82%] items-end gap-1.5 sm:max-w-[70%]',
        isMine ? 'ml-auto flex-row-reverse' : 'mr-auto',
      )}
    >
      <div
        className={cn(
          'rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words',
          isMine
            ? cn(burbujaPropiaClass, 'rounded-br-sm')
            : 'rounded-bl-sm border border-border/60 bg-surface text-foreground',
        )}
      >
        <p className="whitespace-pre-wrap">{mensaje.contenido}</p>
        <div
          className={cn(
            'mt-0.5 flex items-center gap-1',
            isMine ? 'justify-end' : 'justify-start',
          )}
        >
          <span
            className={cn(
              'font-mono text-[10px] tabular-nums',
              isMine ? 'text-current opacity-70' : 'text-muted-foreground',
            )}
          >
            {formatHora(mensaje.fechaEnvio, locale)}
          </span>
          {isMine &&
            (mensaje.leido ? (
              <CheckCheck
                className="size-3.5 shrink-0 text-highlight"
                aria-label={t('msgLeido')}
              />
            ) : (
              <Check
                className="size-3.5 shrink-0 text-current opacity-60"
                aria-label={t('msgNoLeido')}
              />
            ))}
        </div>
      </div>
      {!isMine && (
        <div className="opacity-0 transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out)] group-hover/mensaje:opacity-100 focus-within:opacity-100">
          <ReportButton
            target={{ tipo: 'mensaje', id: mensaje.idMensaje }}
            iconOnly
          />
        </div>
      )}
    </div>
  )
}
