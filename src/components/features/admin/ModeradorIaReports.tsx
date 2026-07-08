'use client'

import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import {
  ScanLine,
  ShieldAlert,
  Gavel,
  BellRing,
  Archive,
  Quote,
  Bot,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/features/shared/EmptyState'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  resolverReporteIa,
  escanearPendientes,
  type ReporteIaItem,
} from '@/lib/moderador-ai/admin'

type Accion = 'advertir' | 'strike' | 'ignorar'

interface ModeradorIaReportsProps {
  items: ReporteIaItem[]
  pendientesCount: number
}

const SEVERIDAD_CLASS: Record<string, string> = {
  baja: 'border-accent/30 bg-accent/10 text-accent',
  media: 'border-warning/30 bg-warning/10 text-warning',
  alta: 'border-destructive/30 bg-destructive/10 text-destructive',
}

const ACCION_CLASS: Record<Accion, string> = {
  advertir: 'border-warning/30 bg-warning/10 text-warning',
  strike: 'border-destructive/30 bg-destructive/10 text-destructive',
  ignorar: 'border-border bg-muted/30 text-muted-foreground',
}

const MAX_NOTA = 500

export function ModeradorIaReports({
  items,
  pendientesCount,
}: ModeradorIaReportsProps) {
  const t = useTranslations('Admin')
  const locale = useLocale()
  const router = useRouter()

  const [leidos, setLeidos] = useState<Set<string>>(new Set())
  const [dialog, setDialog] = useState<{ id: string; accion: Accion } | null>(
    null,
  )
  const [nota, setNota] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanning, startScan] = useTransition()

  const marcarLeido = (id: string) => setLeidos((prev) => new Set(prev).add(id))

  const abrir = (id: string, accion: Accion) => {
    setNota('')
    setDialog({ id, accion })
  }

  const confirmar = async () => {
    if (!dialog) return
    setLoading(true)
    const result = await resolverReporteIa({
      idReporte: dialog.id,
      accion: dialog.accion,
      ...(nota.trim() ? { nota: nota.trim() } : {}),
    })
    setLoading(false)
    if (result.ok) {
      toast.success(t(`moderadorIaDone_${dialog.accion}`))
      setDialog(null)
      router.refresh()
    } else {
      toast.error(t('moderadorIaError'))
    }
  }

  const escanear = () =>
    startScan(async () => {
      const result = await escanearPendientes()
      if (result.ok) {
        toast.success(t('moderadorIaScanDone', { count: result.data }))
        router.refresh()
      } else {
        toast.error(t('moderadorIaError'))
      }
    })

  const formatFecha = (value: string) =>
    new Date(value).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <div className="space-y-5">
      {/* Cabecera: identidad del agente + escaneo de pendientes */}
      <div className="flex flex-col gap-3 rounded-2xl border border-secondary/20 bg-secondary/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground">
              {t('moderadorIaHeading')}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground prose-body">
              {t('moderadorIaSubheading')}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={escanear}
          disabled={scanning}
          className="shrink-0 gap-1.5"
        >
          <ScanLine className="h-3.5 w-3.5" />
          {scanning
            ? t('moderadorIaScanning')
            : pendientesCount > 0
              ? t('moderadorIaScanPending', { count: pendientesCount })
              : t('moderadorIaScan')}
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={t('moderadorIaEmpty')}
          description={t('moderadorIaEmptyDesc')}
          icon={ShieldAlert}
        />
      ) : (
        <ul className="space-y-4">
          {items.map((item) => {
            const leido = leidos.has(item.idReporte)
            const confianzaPct =
              item.confianza != null ? Math.round(item.confianza * 100) : null
            return (
              <li
                key={item.idReporte}
                className="rounded-2xl border border-border border-l-4 border-l-secondary bg-surface p-5 shadow-sm"
              >
                {/* Fila 1: usuario + lugar/fecha + veredicto */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {item.nombreReportado}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.entidad
                        ? t(`entidadModerable_${item.entidad}`)
                        : '—'}
                      {item.proyecto ? ` · ${item.proyecto}` : ''}
                      {' · '}
                      {formatFecha(item.reportadoAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    >
                      {t(`tipoReporte_${item.tipoReporte}`)}
                    </Badge>
                    {item.severidad && (
                      <Badge
                        variant="outline"
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${SEVERIDAD_CLASS[item.severidad] ?? ''}`}
                      >
                        {t(`severidad_${item.severidad}`)}
                      </Badge>
                    )}
                    {confianzaPct != null && (
                      <span className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                        {t('moderadorIaConfidence', { pct: confianzaPct })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Razón del agente */}
                <p className="mt-3 text-sm text-foreground/80 prose-body">
                  {item.descripcion}
                </p>

                {/* Fragmento señalado: oculto hasta que el admin lo abre. */}
                {item.extracto ? (
                  leido ? (
                    <blockquote className="mt-3 flex gap-2 rounded-xl border border-border bg-muted/20 p-3">
                      <Quote className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <p className="text-sm italic text-foreground/90 prose-body">
                        {item.extracto}
                      </p>
                    </blockquote>
                  ) : (
                    <button
                      type="button"
                      onClick={() => marcarLeido(item.idReporte)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-muted/40"
                    >
                      <Quote className="h-3.5 w-3.5" />
                      {t('moderadorIaShowExtract')}
                    </button>
                  )
                ) : null}

                {/* Acción sugerida + acciones del admin */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
                  {item.accionSugerida ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      {t('moderadorIaSuggests')}
                      <Badge
                        variant="outline"
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACCION_CLASS[item.accionSugerida]}`}
                      >
                        {t(`moderadorIaAccion_${item.accionSugerida}`)}
                      </Badge>
                    </span>
                  ) : (
                    <span />
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrir(item.idReporte, 'advertir')}
                      className="gap-1 border-warning/30 text-warning hover:bg-warning/10 hover:text-warning"
                    >
                      <BellRing className="h-3.5 w-3.5" />
                      {t('moderadorIaAccion_advertir')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrir(item.idReporte, 'strike')}
                      disabled={!leido}
                      title={leido ? undefined : t('moderadorIaStrikeGate')}
                      className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                    >
                      <Gavel className="h-3.5 w-3.5" />
                      {t('moderadorIaAccion_strike')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => abrir(item.idReporte, 'ignorar')}
                      className="gap-1 text-muted-foreground hover:bg-muted"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      {t('moderadorIaAccion_ignorar')}
                    </Button>
                  </div>
                </div>
                {item.extracto && !leido && (
                  <p className="mt-2 text-right text-[10px] text-muted-foreground">
                    {t('moderadorIaStrikeGate')}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <Dialog
        open={dialog !== null}
        onOpenChange={(o) => !o && !loading && setDialog(null)}
      >
        <DialogContent className="border border-border sm:max-w-md">
          {dialog && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl font-bold">
                  {t(`moderadorIaConfirmTitle_${dialog.accion}`)}
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm text-muted-foreground prose-body">
                  {t(`moderadorIaConfirmHint_${dialog.accion}`)}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-3 space-y-1.5">
                <Label
                  htmlFor="moderador-ia-nota"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  {t('moderadorIaNoteLabel')}
                </Label>
                <Textarea
                  id="moderador-ia-nota"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder={t('moderadorIaNotePlaceholder')}
                  rows={3}
                  maxLength={MAX_NOTA}
                  className="resize-none text-sm"
                />
              </div>
              <DialogFooter className="mt-4 flex gap-2 border-t border-border/40 pt-4 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDialog(null)}
                  disabled={loading}
                >
                  {t('moderadorIaCancel')}
                </Button>
                <Button
                  onClick={confirmar}
                  disabled={loading}
                  className={
                    dialog.accion === 'strike'
                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      : dialog.accion === 'advertir'
                        ? 'bg-warning text-warning-foreground hover:bg-warning/90'
                        : ''
                  }
                >
                  {loading
                    ? t('moderadorIaProcessing')
                    : t(`moderadorIaAccion_${dialog.accion}`)}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
