'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  Check,
  CheckCircle2,
  Lock,
  MessageSquarePlus,
  ScrollText,
} from 'lucide-react'
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
import { aceptarAcuerdo } from '@/lib/deliverables/actions'
import { enviarMensaje } from '@/lib/mensajes/actions'
import { PERIODO_STYLE, PERIODO_LABEL_KEY } from './periodo'

interface ContratoCardEgresadoProps {
  idProyecto: string
  estadoPeriodo: string
  acuerdoAceptadoAt: string | null
  montoAcordado: number | null
  moneda: string
  condicionesEspeciales: string | null
  presupuestoMin: number | null
  presupuestoMax: number | null
}

/**
 * Vista del contrato para el EGRESADO: solo lectura del monto/condiciones que
 * negoció la empresa, con acciones de aceptar el acuerdo (lo congela como
 * evidencia) o solicitar cambios (mensaje a la empresa). El botón de aceptar
 * pasa el monto/condiciones VISTOS para el candado optimista de la action.
 */
export function ContratoCardEgresado({
  idProyecto,
  estadoPeriodo,
  acuerdoAceptadoAt,
  montoAcordado,
  moneda,
  condicionesEspeciales,
  presupuestoMin,
  presupuestoMax,
}: ContratoCardEgresadoProps) {
  const t = useTranslations('Contrataciones')
  const router = useRouter()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [cambiosOpen, setCambiosOpen] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [isSending, setIsSending] = useState(false)

  const isAceptado = acuerdoAceptadoAt !== null
  const canAccept =
    estadoPeriodo === 'vigente' && !isAceptado && montoAcordado !== null

  const periodoLabelKey = PERIODO_LABEL_KEY[estadoPeriodo]
  const periodoStyle = PERIODO_STYLE[estadoPeriodo]

  const rangoPresupuesto =
    presupuestoMin !== null && presupuestoMax !== null
      ? `${moneda} ${presupuestoMin} – ${presupuestoMax}`
      : presupuestoMin !== null
        ? `${moneda} ≥ ${presupuestoMin}`
        : null

  const handleAceptar = async () => {
    setIsAccepting(true)
    const res = await aceptarAcuerdo({
      idProyecto,
      montoVisto: montoAcordado,
      condicionesVistas: condicionesEspeciales,
    })
    setIsAccepting(false)
    if (res.ok) {
      toast.success(t('acuerdoAceptadoOk'))
      setConfirmOpen(false)
      router.refresh()
      return
    }
    toast.error(
      res.error === 'contrato_cambio'
        ? t('contratoCambioError')
        : res.error === 'acuerdo_ya_aceptado'
          ? t('errorAceptado')
          : t('errorGenerico'),
    )
  }

  const handleSolicitarCambios = async () => {
    const contenido = mensaje.trim()
    if (contenido === '') {
      toast.error(t('solicitarCambiosVacio'))
      return
    }
    setIsSending(true)
    const res = await enviarMensaje({ idProyecto, contenido })
    setIsSending(false)
    if (res.ok) {
      toast.success(t('solicitudEnviada'))
      setMensaje('')
      setCambiosOpen(false)
      return
    }
    toast.error(t('errorGenerico'))
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
          {isAceptado
            ? t('acuerdoAceptadoEgresado')
            : canAccept
              ? t('revisaAcuerdo')
              : t('acuerdoNoVigente')}
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-foreground">
              {t('montoLabel')}
            </p>
            <p className="text-base font-bold text-foreground">
              {montoAcordado !== null
                ? `${moneda} ${montoAcordado}`
                : t('sinMonto')}
            </p>
            {rangoPresupuesto && (
              <p className="text-xs text-muted-foreground">
                {t('presupuestoRango', { rango: rangoPresupuesto })}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-foreground">
              {t('condicionesLabel')}
            </p>
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {condicionesEspeciales ?? t('sinCondiciones')}
            </p>
          </div>
        </div>

        {canAccept && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/40 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCambiosOpen(true)}
              className="rounded-full font-semibold"
            >
              <MessageSquarePlus className="h-4 w-4" />
              {t('solicitarCambiosBtn')}
            </Button>
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              className="rounded-full font-semibold"
            >
              <Check className="h-4 w-4" />
              {t('aceptarAcuerdoBtn')}
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => !open && setConfirmOpen(false)}
      >
        <DialogContent className="sm:max-w-md border border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold">
              {t('aceptarAcuerdoTitle')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('aceptarAcuerdoDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isAccepting}
            >
              {t('cancelar')}
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={() => void handleAceptar()}
              disabled={isAccepting}
              className="font-semibold"
            >
              {t('confirmarAceptar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={cambiosOpen}
        onOpenChange={(open) => !open && setCambiosOpen(false)}
      >
        <DialogContent className="sm:max-w-md border border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold">
              {t('solicitarCambiosTitle')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('solicitarCambiosDesc')}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder={t('solicitarCambiosPlaceholder')}
          />
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCambiosOpen(false)}
              disabled={isSending}
            >
              {t('cancelar')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleSolicitarCambios()}
              disabled={isSending}
              className="font-semibold"
            >
              {t('enviarSolicitud')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
