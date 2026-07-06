'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { RotateCcw } from 'lucide-react'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils/cn'
import { republicarProyecto } from '@/lib/projects/republicar'

interface RepublicarProyectoButtonProps {
  idProyecto: string
  size?: 'sm' | 'default'
  className?: string
}

/**
 * Botón + confirmación para republicar un proyecto cancelado como copia exacta.
 * Reutilizable: vive en el detalle de la contratación (dentro de un card) y en la
 * fila de cada proyecto cancelado de la lista. Confirma antes de crear (republicar
 * lanza un proyecto público). Al éxito navega al proyecto nuevo.
 */
export function RepublicarProyectoButton({
  idProyecto,
  size = 'default',
  className,
}: RepublicarProyectoButtonProps) {
  const t = useTranslations('Contrataciones')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isRepublishing, setIsRepublishing] = useState(false)

  const handleRepublicar = async () => {
    setIsRepublishing(true)
    const res = await republicarProyecto({ idProyecto })
    setIsRepublishing(false)
    if (res.ok) {
      toast.success(t('republicarExito'))
      setOpen(false)
      router.push(`/empresario/proyecto/${res.data}`)
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
        onClick={() => setOpen(true)}
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
