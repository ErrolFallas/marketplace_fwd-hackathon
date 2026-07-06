'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Bell, CheckCheck, ExternalLink, Loader2, X } from 'lucide-react'
import { useTranslations, useFormatter } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { cn } from '@/lib/utils/cn'
import { stripLocalePrefix } from '@/lib/i18n/strip-locale-prefix'
import { useNotificacionesResumen } from '@/hooks/use-notificaciones-resumen'
import type { NotificacionItem } from '@/lib/notifications/actions'
import {
  getNotificationTone,
  getNotificationTypeKey,
  resolveNotificationContent,
  type NotificationTone,
} from '@/lib/notifications/format'

const UNREAD_BADGE_CAP = 99

const TONE_CLASSES: Record<NotificationTone, string> = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  warning: 'bg-warning/10 text-warning',
  magenta: 'bg-magenta/10 text-magenta',
}

interface NotificationBellProps {
  isHero?: boolean
  /**
   * Cuando true, el panel de notificaciones se abre como Bottom Sheet
   * (mobile) con soporte de gestos de arrastre interactivos que cambian la altura.
   */
  isMobile?: boolean
  className?: string | undefined
}

export function NotificationBell({
  isHero = false,
  isMobile = false,
  className,
}: NotificationBellProps) {
  const t = useTranslations('Notifications')
  const format = useFormatter()
  const router = useRouter()

  const {
    notificaciones,
    conteoNoLeidas,
    estado,
    refrescar,
    marcarUna,
    marcarTodas,
  } = useNotificacionesResumen()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Estados para gestos del Bottom Sheet
  const [isExpanded, setIsExpanded] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const touchStartY = useRef(0)
  const vhRef = useRef(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)

  const isLoading = estado === 'cargando'

  // Restablecer estado de expansión al cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false)
      setDragOffset(0)
      setIsDragging(false)
    }
  }, [isOpen])

  // Click-outside solo aplica al dropdown de desktop
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen && !isMobile)
      document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, isMobile])

  const handleMarkOne = (id: string) => {
    startTransition(async () => {
      await marcarUna(id)
    })
  }

  const handleMarkAll = () => {
    startTransition(async () => {
      await marcarTodas()
    })
  }

  const handleGoToAction = (notification: NotificacionItem) => {
    if (!notification.leida) handleMarkOne(notification.id_notificacion)
    if (notification.url_destino) {
      router.push(
        stripLocalePrefix(notification.url_destino) as Parameters<
          typeof router.push
        >[0],
      )
      setIsOpen(false)
    }
  }

  const toggleOpen = () => {
    const next = !isOpen
    setIsOpen(next)
    if (next) refrescar()
  }

  // Lógica de gestos unificados con Pointer Events (sirve para mouse y táctil)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    touchStartY.current = e.clientY
    setIsDragging(true)
    vhRef.current = window.innerHeight || 800
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const diffY = e.clientY - touchStartY.current
    setDragOffset(diffY)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setIsDragging(false)
    const threshold = 65 // Píxeles requeridos para activar snap de tamaño

    if (dragOffset < -threshold) {
      // Arrastrar hacia arriba -> Expandir
      setIsExpanded(true)
    } else if (dragOffset > threshold) {
      // Arrastrar hacia abajo -> Contraer o cerrar
      if (isExpanded) {
        setIsExpanded(false)
      } else {
        setIsOpen(false)
      }
    }
    setDragOffset(0)
  }

  const badgeText =
    conteoNoLeidas > UNREAD_BADGE_CAP ? `${UNREAD_BADGE_CAP}+` : conteoNoLeidas

  const unreadBadge = conteoNoLeidas > 0 && (
    <span
      aria-live="polite"
      aria-label={t('unreadCount', { count: conteoNoLeidas })}
      className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-magenta px-1 text-[10px] font-bold text-magenta-foreground"
    >
      {badgeText}
    </span>
  )

  const bellButtonClasses = cn(
    'relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:scale-105 active:scale-95',
    isHero
      ? 'text-secondary-foreground/90 hover:bg-secondary-foreground/10 hover:text-secondary-foreground'
      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
    isOpen && !isHero && 'bg-muted/40 text-foreground',
  )

  const panelHeader = (
    <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 select-none">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-bold text-foreground">{t('title')}</h2>
        {conteoNoLeidas > 0 && (
          <span className="rounded-full bg-magenta px-1.5 py-0.5 text-[10px] font-bold text-magenta-foreground">
            {badgeText}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {conteoNoLeidas > 0 && (
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-secondary disabled:cursor-not-allowed disabled:text-ink-subtle"
          >
            <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {t('markAllRead')}
          </button>
        )}
        <button
          type="button"
          aria-label={t('close')}
          onClick={() => setIsOpen(false)}
          className="rounded-lg p-1 text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-muted/40 hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  )

  const panelList = (
    <div className="flex-1 divide-y divide-border overflow-y-auto">
      {isLoading && notificaciones.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <Loader2
            className="h-5 w-5 animate-spin text-primary"
            aria-label={t('loading')}
          />
        </div>
      ) : notificaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 px-6 py-12 text-center">
          <Bell
            className="mb-2 h-9 w-9 text-border-strong"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-ink-muted">{t('empty')}</p>
          <p className="text-xs text-ink-subtle">{t('emptyHint')}</p>
        </div>
      ) : (
        notificaciones.map((n) => {
          const tone = getNotificationTone(n.tipo_evento)
          const content = resolveNotificationContent({
            tipo: n.tipo_evento,
            mensaje: n.mensaje,
            params: n.params,
          })
          const body =
            content.kind === 'i18n'
              ? t(content.key, content.values)
              : content.text
          return (
            <div
              key={n.id_notificacion}
              className={cn(
                'flex items-start gap-3 px-4 py-3',
                n.leida ? 'bg-surface' : 'bg-primary/5',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                  TONE_CLASSES[tone],
                )}
              >
                {t(getNotificationTypeKey(n.tipo_evento))}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-xs leading-snug',
                    n.leida
                      ? 'font-medium text-ink-muted'
                      : 'font-semibold text-foreground',
                  )}
                >
                  {body}
                </p>
                <p className="mt-1 text-[10px] text-ink-subtle">
                  {format.relativeTime(new Date(n.generada_at), {
                    now: new Date(),
                  })}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-1">
                {n.url_destino && (
                  <button
                    type="button"
                    aria-label={t('goToAction')}
                    onClick={() => handleGoToAction(n)}
                    className="rounded-lg p-1 text-ink-subtle transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary/10 hover:text-primary"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
                {!n.leida && (
                  <button
                    type="button"
                    aria-label={t('markOne')}
                    disabled={isPending}
                    onClick={() => handleMarkOne(n.id_notificacion)}
                    className="rounded-lg p-1 text-ink-subtle transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary/10 hover:text-primary disabled:opacity-40"
                  >
                    <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )

  // Altura calculada dinámicamente en píxeles durante el arrastre táctil
  const dragHeight =
    isDragging && vhRef.current > 0
      ? Math.max(
          0.1 * vhRef.current,
          Math.min(
            0.9 * vhRef.current,
            (isExpanded ? 0.85 * vhRef.current : 0.5 * vhRef.current) -
              dragOffset,
          ),
        )
      : null

  // ── Bottom Sheet (mobile) ─────────────────────────────────────────────────
  if (isMobile) {
    return (
      <DialogPrimitive.Root
        open={isOpen}
        onOpenChange={(next) => {
          setIsOpen(next)
          if (next) refrescar()
        }}
      >
        <div className={cn(className)}>
          <DialogPrimitive.Trigger asChild>
            <button
              type="button"
              aria-label={t('title')}
              aria-haspopup="dialog"
              className={bellButtonClasses}
            >
              <Bell className="h-5 w-5" />
              {unreadBadge}
            </button>
          </DialogPrimitive.Trigger>
        </div>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink-strong/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
          <DialogPrimitive.Content
            aria-label={t('title')}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-2xl border-t border-border bg-surface shadow-elevated animate-slide-up-fade focus:outline-none"
            style={{
              height:
                dragHeight !== null
                  ? `${dragHeight}px`
                  : isExpanded
                    ? '85vh'
                    : '50vh',
              transition: isDragging
                ? 'none'
                : 'height var(--duration-base) var(--ease-out)',
            }}
          >
            {/* Zona táctil unificada para arrastre (Mouse y Táctil) con touch-none */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="w-full flex flex-col items-center pt-3 pb-2 select-none active:bg-muted/10 cursor-ns-resize touch-none"
              aria-hidden="true"
            >
              <div className="h-1.5 w-12 rounded-full bg-border-strong" />
            </div>
            {panelHeader}
            {panelList}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    )
  }

  // ── Dropdown (desktop) — comportamiento original intacto ──────────────────
  return (
    <div className={cn('relative', className)}>
      <button
        ref={bellRef}
        type="button"
        aria-label={t('title')}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={toggleOpen}
        className={bellButtonClasses}
      >
        <Bell className="h-5 w-5" />
        {unreadBadge}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={t('title')}
          className="absolute right-0 top-full z-50 mt-2 flex max-h-[480px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft"
        >
          {panelHeader}
          {panelList}
        </div>
      )}
    </div>
  )
}
