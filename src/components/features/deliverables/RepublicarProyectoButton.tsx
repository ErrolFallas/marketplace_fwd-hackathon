'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { RotateCcw, ExternalLink } from 'lucide-react'
import { Link, useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'
import { republicarProyecto } from '@/lib/projects/republicar'
import { PLAZO_MIN_DIAS, PLAZO_MAX_DIAS } from '@/lib/projects/schemas'

interface RepublicarProyectoButtonProps {
  idProyecto: string
  plazoOriginalDias: number
  size?: 'sm' | 'default'
  className?: string
}

const OPCIONES_PLAZO = Array.from(
  { length: PLAZO_MAX_DIAS - PLAZO_MIN_DIAS + 1 },
  (_, i) => PLAZO_MIN_DIAS + i,
)

/**
 * Botón + confirmación para republicar un proyecto cancelado como copia exacta.
 * El diálogo deja elegir el plazo de cierre (5-15 días, precargado con el plazo
 * original). Al éxito navega al proyecto nuevo; si el proyecto ya fue republicado
 * (gate `republicado_a` en la BD) avisa y refresca para ocultar el botón.
 */
export function RepublicarProyectoButton({
  idProyecto,
  plazoOriginalDias,
  size = 'default',
  className,
}: RepublicarProyectoButtonProps) {
  const t = useTranslations('Contrataciones')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isRepublishing, setIsRepublishing] = useState(false)
  const [plazoDias, setPlazoDias] = useState(plazoOriginalDias)

  const cierre = new Date()
  cierre.setDate(cierre.getDate() + plazoDias)
  const fechaCierre = cierre.toLocaleDateString()

  const handleRepublicar = async () => {
    setIsRepublishing(true)
    const res = await republicarProyecto({ idProyecto, plazoDias })
    setIsRepublishing(false)
    if (res.ok) {
      toast.success(t('republicarExito'))
      setOpen(false)
      router.push(`/empresario/proyecto/${res.data}`)
      return
    }
    if (res.error === 'ya_republicado') {
      toast.error(t('republicarYaHecho'))
      setOpen(false)
      router.refresh()
      return
    }
    toast.error(t('errorGenerico'))
  }

  return (
    <>
      <Button
        type="button"
        variant="accent"
        size={size}
        onClick={() => {
          setPlazoDias(plazoOriginalDias)
          setOpen(true)
        }}
        className={cn('rounded-full font-semibold', className)}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {t('republicarBtn')}
      </Button>

      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent className="sm:max-w-md border border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold">
              {t('republicarConfirmTitle')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('republicarConfirmDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label
              htmlFor="republicar-plazo"
              className="text-sm font-semibold text-foreground"
            >
              {t('republicarPlazoLabel')}
            </label>
            <Select
              value={String(plazoDias)}
              onValueChange={(v) => setPlazoDias(Number(v))}
            >
              <SelectTrigger
                id="republicar-plazo"
                className="w-full bg-card/50 border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPCIONES_PLAZO.map((dias) => (
                  <SelectItem key={dias} value={String(dias)}>
                    {t('republicarPlazoDias', { dias })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('republicarCierreHint', { fecha: fechaCierre })}
            </p>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isRepublishing}
            >
              {t('cancelar')}
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={() => void handleRepublicar()}
              disabled={isRepublishing}
              className="font-semibold"
            >
              {t('confirmarRepublicar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Reemplaza al botón cuando el proyecto YA fue republicado: enlaza al proyecto
 * nuevo. Compartido por la lista de proyectos y el card de la contratación.
 */
export function ProyectoRepublicadoLink({
  idNuevo,
  className,
}: {
  idNuevo: string
  className?: string
}) {
  const t = useTranslations('Contrataciones')
  return (
    <Link
      href={`/empresario/proyecto/${idNuevo}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs font-semibold text-accent transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-accent/10',
        className,
      )}
    >
      <ExternalLink className="h-3.5 w-3.5" />
      {t('verProyectoRepublicado')}
    </Link>
  )
}
