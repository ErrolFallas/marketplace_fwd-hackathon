'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { ChevronRight, Download, ListTodo, Plus } from 'lucide-react'
import { Link, useRouter } from '@/i18n/routing'
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
import { abrirTarea, abrirTareaEgresado } from '@/lib/deliverables/actions'
import { getSignedUrlEntregable } from '@/lib/deliverables/queries'
import type {
  TareaEntregable,
  PropuestaEntregable,
} from '@/lib/deliverables/queries'
import { cn } from '@/lib/utils/cn'
import {
  computeEstadoEntregable,
  type EstadoEntregable,
} from '@/lib/deliverables/entregable-estado-logic'

const ESTADO_ENTREGABLE_STYLE: Record<EstadoEntregable, string> = {
  abierta: 'text-warning border-warning/40 bg-warning/10',
  en_revision: 'text-primary border-primary/40 bg-primary/10',
  requiere_cambios: 'text-magenta border-magenta/40 bg-magenta/10',
  cerrada: 'text-accent border-accent/40 bg-accent/10',
}

const ESTADO_ENTREGABLE_LABEL: Record<EstadoEntregable, string> = {
  abierta: 'entregableAbierta',
  en_revision: 'entregableEnRevision',
  requiere_cambios: 'entregableRequiereCambios',
  cerrada: 'entregableCerrada',
}

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
        <ul className="space-y-3">
          {tareas.map((tarea) => {
            const estado = computeEstadoEntregable(
              tarea.estado,
              tarea.propuestas,
            )
            const href =
              rol === 'empresario'
                ? `/empresario/contrataciones/${idProyecto}/entregables/${tarea.id_tarea}`
                : `/egresado/contrataciones/${idProyecto}/entregables/${tarea.id_tarea}`
            return (
              <li key={tarea.id_tarea}>
                <Link href={href} className="group block">
                  <Card className="border border-border/60 transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:border-primary/40 hover:shadow-sm">
                    <CardContent className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-heading text-sm font-bold text-foreground">
                            {tarea.titulo}
                          </h3>
                          <span
                            className={cn(
                              'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                              ESTADO_ENTREGABLE_STYLE[estado],
                            )}
                          >
                            {t(
                              ESTADO_ENTREGABLE_LABEL[estado] as Parameters<
                                typeof t
                              >[0],
                            )}
                          </span>
                        </div>
                        {tarea.descripcion && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {tarea.descripcion}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {t('propuestasCount', { n: tarea.propuestas.length })}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] group-hover:text-primary">
                        {t('verPropuestas')}
                        <ChevronRight className="h-3.5 w-3.5 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)] group-hover:translate-x-0.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            )
          })}
        </ul>
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
