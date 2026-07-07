'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Ban, CheckCircle2, Flag, Lock, ScrollText } from 'lucide-react'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils/cn'
import {
  actualizarPropuestaContratacion,
  cancelarContratacion,
  finalizarContratacion,
} from '@/lib/deliverables/actions'
import { PERIODO_STYLE, PERIODO_LABEL_KEY } from './periodo'

const MAX_CONDICIONES = 2000
const MAX_MOTIVO_CANCELACION = 1000

interface ContratoCardProps {
  idProyecto: string
  estadoPeriodo: string
  acuerdoAceptadoAt: string | null
  montoAcordado: number | null
  moneda: string
  condicionesEspeciales: string | null
  presupuestoMin: number | null
  presupuestoMax: number | null
}

export function ContratoCard({
  idProyecto,
  estadoPeriodo,
  acuerdoAceptadoAt,
  montoAcordado,
  moneda,
  condicionesEspeciales,
  presupuestoMin,
  presupuestoMax,
}: ContratoCardProps) {
  const t = useTranslations('Contrataciones')
  const router = useRouter()

  const isAceptado = acuerdoAceptadoAt !== null
  const [monto, setMonto] = useState(
    montoAcordado !== null ? String(montoAcordado) : '',
  )
  const [condiciones, setCondiciones] = useState(condicionesEspeciales ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [finalizarOpen, setFinalizarOpen] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [cancelarOpen, setCancelarOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [motivoCancelacion, setMotivoCancelacion] = useState('')

  const periodoLabelKey = PERIODO_LABEL_KEY[estadoPeriodo]
  const periodoStyle = PERIODO_STYLE[estadoPeriodo]

  const rangoPresupuesto =
    presupuestoMin !== null && presupuestoMax !== null
      ? `${moneda} ${presupuestoMin} – ${presupuestoMax}`
      : presupuestoMin !== null
        ? `${moneda} ≥ ${presupuestoMin}`
        : null

  const handleSave = async () => {
    const trimmed = monto.trim()
    const montoNum = trimmed === '' ? null : Number(trimmed)
    if (montoNum !== null && (Number.isNaN(montoNum) || montoNum <= 0)) {
      toast.error(t('montoInvalido'))
      return
    }
    if (
      montoNum !== null &&
      presupuestoMin !== null &&
      montoNum < presupuestoMin
    ) {
      toast.error(t('montoMinError', { min: `${moneda} ${presupuestoMin}` }))
      return
    }

    setIsSaving(true)
    const res = await actualizarPropuestaContratacion({
      idProyecto,
      monto: montoNum,
      condiciones: condiciones.trim() === '' ? null : condiciones.trim(),
    })
    setIsSaving(false)

    if (res.ok) {
      toast.success(t('propuestaGuardada'))
      router.refresh()
      return
    }
    toast.error(
      res.error === 'monto_menor_al_minimo'
        ? t('montoMinError', { min: `${moneda} ${presupuestoMin ?? ''}` })
        : res.error === 'acuerdo_ya_aceptado'
          ? t('errorAceptado')
          : t('errorGenerico'),
    )
  }

  const handleFinalizar = async () => {
    setIsFinalizing(true)
    const res = await finalizarContratacion({ idProyecto })
    setIsFinalizing(false)
    if (res.ok) {
      toast.success(t('contratacionFinalizada'))
      setFinalizarOpen(false)
      router.refresh()
      return
    }
    toast.error(
      res.error === 'contratacion_no_vigente'
        ? t('finalizarNoVigente')
        : t('errorGenerico'),
    )
  }

  const handleCancelar = async () => {
    const motivoTrim = motivoCancelacion.trim()
    if (motivoTrim === '') {
      toast.error(t('motivoRequerido'))
      return
    }
    setIsCancelling(true)
    const res = await cancelarContratacion({ idProyecto, motivo: motivoTrim })
    setIsCancelling(false)
    if (res.ok) {
      toast.success(t('contratacionCancelada'))
      setCancelarOpen(false)
      router.refresh()
      return
    }
    toast.error(
      res.error === 'contratacion_no_vigente'
        ? t('cancelarNoVigente')
        : res.error === 'motivo_requerido'
          ? t('motivoRequerido')
          : t('errorGenerico'),
    )
  }

  return (
    <Card className="border border-border bg-card/40">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-secondary" />
            <h2 className="font-heading text-lg font-bold text-foreground">
              {t('contratoTitle')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {periodoLabelKey && periodoStyle && (
              <span
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                  periodoStyle,
                )}
              >
                {t(periodoLabelKey)}
              </span>
            )}
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                isAceptado
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-warning/40 bg-warning/10 text-warning',
              )}
            >
              {isAceptado ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {isAceptado ? t('acuerdoAceptado') : t('enNegociacion')}
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {isAceptado ? t('acuerdoBloqueado') : t('esperandoEgresado')}
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="contrato-monto"
              className="text-sm font-semibold text-foreground"
            >
              {t('montoLabel')}
            </label>
            {isAceptado ? (
              <p className="text-base font-bold text-foreground">
                {montoAcordado !== null
                  ? `${moneda} ${montoAcordado}`
                  : t('sinMonto')}
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-muted-foreground">
                  {moneda}
                </span>
                <input
                  id="contrato-monto"
                  type="number"
                  inputMode="decimal"
                  min={presupuestoMin ?? 0}
                  step="1"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder={
                    presupuestoMin !== null ? String(presupuestoMin) : '0'
                  }
                  className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>
            )}
            {rangoPresupuesto && (
              <p className="text-xs text-muted-foreground">
                {t('presupuestoRango', { rango: rangoPresupuesto })}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="contrato-condiciones"
              className="text-sm font-semibold text-foreground"
            >
              {t('condicionesLabel')}
            </label>
            {isAceptado ? (
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {condicionesEspeciales ?? t('sinCondiciones')}
              </p>
            ) : (
              <Textarea
                id="contrato-condiciones"
                value={condiciones}
                onChange={(e) => setCondiciones(e.target.value)}
                maxLength={MAX_CONDICIONES}
                rows={4}
                placeholder={t('condicionesPlaceholder')}
              />
            )}
          </div>
        </div>

        {estadoPeriodo === 'vigente' && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFinalizarOpen(true)}
                className="rounded-full font-semibold border-magenta/30 text-magenta hover:bg-magenta/10"
              >
                <Flag className="h-3.5 w-3.5" />
                {t('finalizarContratacionBtn')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCancelarOpen(true)}
                className="rounded-full font-semibold text-muted-foreground hover:bg-magenta/10 hover:text-magenta"
              >
                <Ban className="h-3.5 w-3.5" />
                {t('cancelarContratacionBtn')}
              </Button>
            </div>
            {!isAceptado && (
              <Button
                type="button"
                variant="accent"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="rounded-full font-semibold"
              >
                {t('guardarPropuesta')}
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <Dialog
        open={finalizarOpen}
        onOpenChange={(open) => !open && setFinalizarOpen(false)}
      >
        <DialogContent className="sm:max-w-md border border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold">
              {t('finalizarContratacionTitle')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('finalizarContratacionDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFinalizarOpen(false)}
              disabled={isFinalizing}
            >
              {t('cancelar')}
            </Button>
            <Button
              type="button"
              variant="magenta"
              onClick={() => void handleFinalizar()}
              disabled={isFinalizing}
              className="font-semibold"
            >
              {t('confirmarFinalizar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={cancelarOpen}
        onOpenChange={(open) => !open && setCancelarOpen(false)}
      >
        <DialogContent className="sm:max-w-md border border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold">
              {t('cancelarContratacionTitle')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('cancelarContratacionDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <label
              htmlFor="cancelar-motivo"
              className="text-sm font-semibold text-foreground"
            >
              {t('motivoCancelacionLabel')}
            </label>
            <Textarea
              id="cancelar-motivo"
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              maxLength={MAX_MOTIVO_CANCELACION}
              rows={3}
              placeholder={t('motivoCancelacionPlaceholder')}
            />
          </div>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelarOpen(false)}
              disabled={isCancelling}
            >
              {t('cancelar')}
            </Button>
            <Button
              type="button"
              variant="magenta"
              onClick={() => void handleCancelar()}
              disabled={isCancelling}
              className="font-semibold"
            >
              {t('confirmarCancelar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
