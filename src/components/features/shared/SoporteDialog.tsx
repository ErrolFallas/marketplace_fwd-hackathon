'use client'

import React, { useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createSupportTicket } from '@/lib/company/actions'

const MIN_LENGTH = 15

/**
 * Modal de soporte compartido por egresado y empresario. El `children` es el
 * botón que abre el modal (cada sidebar lo estiliza según su contexto). Inserta
 * el ticket con `createSupportTicket`, que es genérica para cualquier usuario
 * autenticado (RLS soporte_tickets_insert_own por auth.uid()).
 */
export function SoporteDialog({ children }: { children: ReactNode }) {
  const t = useTranslations('Soporte')
  const [isOpen, setIsOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (description.length < MIN_LENGTH) {
      toast.error(t('minLength'))
      return
    }
    setIsSubmitting(true)
    const res = await createSupportTicket(description)
    setIsSubmitting(false)
    if (res.ok) {
      toast.success(t('success'))
      setDescription('')
      setIsOpen(false)
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-left font-heading text-lg font-extrabold text-foreground">
            {t('modalTitle')}
          </DialogTitle>
          <DialogDescription className="pt-1 text-left text-xs leading-relaxed text-muted-foreground">
            {t('modalDesc')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2 text-left">
            <Label
              htmlFor="soporte-description"
              className="text-xs font-bold text-foreground"
            >
              {t('fieldLabel')}
            </Label>
            <Textarea
              id="soporte-description"
              rows={4}
              placeholder={t('placeholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-border bg-card/50 text-sm focus-visible:ring-primary"
            />
            <p className="text-right text-[10px] text-muted-foreground">
              {description.length}/{MIN_LENGTH} {t('minCharsInfo')}
            </p>
          </div>
          <div className="flex justify-end gap-3 border-t border-border/40 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="flex items-center gap-1.5 bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/95"
            >
              {isSubmitting && <Loader2 className="size-3 animate-spin" />}
              {t('submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
