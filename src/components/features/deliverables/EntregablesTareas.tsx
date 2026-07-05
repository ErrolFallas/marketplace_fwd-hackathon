'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Download, ListTodo, Plus } from 'lucide-react'
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
import { abrirTarea, abrirTareaEgresado } from '@/lib/deliverables/actions'
import { getSignedUrlEntregable } from '@/lib/deliverables/queries'
import type {
  TareaEntregable,
  PropuestaEntregable,
} from '@/lib/deliverables/queries'
import { TareaCard } from './TareaCard'

interface EntregablesTareasProps {
  rol: 'empresario' | 'egresado'
  idProyecto: string
  tareas: TareaEntregable[]
  huerfanos: PropuestaEntregable[]
  canManage: boolean
}

export function EntregablesTareas({
  rol,
  idProyecto,
  tareas,
  huerfanos,
  canManage,
}: EntregablesTareasProps) {
  const t = useTranslations('Contrataciones')
  const router = useRouter()

  const [abrirOpen, setAbrirOpen] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [requerimiento, setRequerimiento] = useState('')
  const [tipo, setTipo] = useState<'parcial' | 'final'>('parcial')
  const [isCreating, setIsCreating] = useState(false)

  const handleCrearTarea = async () => {
    if (titulo.trim() === '') {
      toast.error(t('tituloRequerido'))
      return
    }
    setIsCreating(true)
    const desc = requerimiento.trim() === '' ? null : requerimiento.trim()
    const res =
      rol === 'empresario'
        ? await abrirTarea({
            idProyecto,
            titulo: titulo.trim(),
            descripcion: desc,
            tipo,
          })
        : await abrirTareaEgresado({
            idProyecto,
            titulo: titulo.trim(),
            descripcion: desc,
          })
    setIsCreating(false)
    if (res.ok) {
      toast.success(t('tareaCreada'))
      setAbrirOpen(false)
      setTitulo('')
      setRequerimiento('')
      setTipo('parcial')
      router.refresh()
      return
    }
    toast.error(t('errorGenerico'))
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-secondary" />
          <h2 className="font-heading text-lg font-bold text-foreground">
            {t('tareasTitle')}
          </h2>
        </div>
        {canManage && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setAbrirOpen(true)}
            className="rounded-full font-semibold"
          >
            <Plus className="h-4 w-4" />
            {rol === 'empresario' ? t('abrirTareaBtn') : t('nuevaEntregaBtn')}
          </Button>
        )}
      </div>

      {tareas.length === 0 ? (
        <Card className="border border-dashed border-border bg-card/20">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            {t('sinTareas')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tareas.map((tarea) => (
            <TareaCard
              key={tarea.id_tarea}
              rol={rol}
              tarea={tarea}
              idProyecto={idProyecto}
              canManage={canManage}
            />
          ))}
        </div>
      )}

      {huerfanos.length > 0 && (
        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-4">
          <h3 className="text-sm font-bold text-foreground">
            {t('huerfanosTitle')}
          </h3>
          <p className="text-xs text-muted-foreground">{t('huerfanosDesc')}</p>
          <div className="space-y-2 pt-1">
            {huerfanos.map((h) => (
              <HuerfanoRow key={h.id_entregable} rol={rol} propuesta={h} />
            ))}
          </div>
        </div>
      )}

      <Dialog
        open={abrirOpen}
        onOpenChange={(open) => !open && setAbrirOpen(false)}
      >
        <DialogContent className="sm:max-w-md border border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold">
              {rol === 'empresario'
                ? t('abrirTareaTitle')
                : t('nuevaEntregaTitle')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {rol === 'empresario'
                ? t('abrirTareaDesc')
                : t('nuevaEntregaDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={160}
              placeholder={t('tareaTituloPlaceholder')}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
            <Textarea
              value={requerimiento}
              onChange={(e) => setRequerimiento(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder={
                rol === 'empresario'
                  ? t('requerimientoPlaceholder')
                  : t('hiceEstoPlaceholder')
              }
            />
            {rol === 'empresario' && (
              <div className="flex gap-2">
                {(['parcial', 'final'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setTipo(opt)}
                    className={cn(
                      'flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                      tipo === opt
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {opt === 'parcial' ? t('tipoParcial') : t('tipoFinal')}
                  </button>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAbrirOpen(false)}
              disabled={isCreating}
            >
              {t('cancelar')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleCrearTarea()}
              disabled={isCreating}
              className="font-semibold"
            >
              {t('crearTarea')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function HuerfanoRow({
  rol,
  propuesta,
}: {
  rol: 'empresario' | 'egresado'
  propuesta: PropuestaEntregable
}) {
  const t = useTranslations('Contrataciones')

  const handleDownload = async () => {
    const res = await getSignedUrlEntregable(propuesta.id_entregable)
    if (res.ok) {
      window.open(res.data.url, '_blank', 'noopener,noreferrer')
    } else {
      toast.error(t('descargaError'))
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2">
      <span className="text-xs text-muted-foreground">
        {propuesta.cargado_at.slice(0, 10)}
        {propuesta.descripcion ? ` · ${propuesta.descripcion}` : ''}
      </span>
      {rol === 'empresario' && propuesta.archivo_url && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void handleDownload()}
          className="h-7 gap-1 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          <Download className="h-3.5 w-3.5" />
          {t('descargar')}
        </Button>
      )}
    </div>
  )
}
