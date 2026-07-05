'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Download,
  FileText,
  MessageSquare,
  RotateCcw,
  Upload,
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
import { subirPropuesta, responderEntregable } from '@/lib/deliverables/actions'
import { getSignedUrlEntregable } from '@/lib/deliverables/queries'
import type {
  TareaEntregable,
  PropuestaEntregable,
} from '@/lib/deliverables/queries'
import { logger } from '@/lib/logger'

const PROPUESTA_STYLE: Record<string, string> = {
  enviado: 'text-warning border-warning/40 bg-warning/10',
  en_revision: 'text-warning border-warning/40 bg-warning/10',
  aprobado: 'text-accent border-accent/40 bg-accent/10',
  con_cambios: 'text-magenta border-magenta/40 bg-magenta/10',
}

const PROPUESTA_LABEL_KEY: Record<string, string> = {
  enviado: 'propEstadoEnviado',
  en_revision: 'propEstadoEnviado',
  aprobado: 'propEstadoAprobado',
  con_cambios: 'propEstadoCambios',
}

interface TareaCardProps {
  rol: 'empresario' | 'egresado'
  tarea: TareaEntregable
  idProyecto: string
  canManage: boolean
}

export function TareaCard({
  rol,
  tarea,
  idProyecto,
  canManage,
}: TareaCardProps) {
  const t = useTranslations('Contrataciones')
  const router = useRouter()

  const [descripcion, setDescripcion] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [veredicto, setVeredicto] = useState<{
    idEntregable: string
    decision: 'aprobado' | 'con_cambios'
  } | null>(null)
  const [comentario, setComentario] = useState('')
  const [isDeciding, setIsDeciding] = useState(false)

  const isFinal = tarea.tipo_entregable === 'final'
  const hayPropuestaAbierta = tarea.propuestas.some(
    (p) => p.estado === 'enviado' || p.estado === 'en_revision',
  )
  const puedeSubir =
    rol === 'egresado' &&
    canManage &&
    tarea.estado === 'abierta' &&
    !hayPropuestaAbierta

  const handleDownload = async (idEntregable: string) => {
    const res = await getSignedUrlEntregable(idEntregable)
    if (res.ok) {
      window.open(res.data.url, '_blank', 'noopener,noreferrer')
    } else {
      toast.error(t('descargaError'))
    }
  }

  const handleSubir = async () => {
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('idTarea', tarea.id_tarea)
      formData.append('idProyecto', idProyecto)
      formData.append('descripcion', descripcion.trim())
      const res = await subirPropuesta(formData)
      if (res.ok) {
        toast.success(t('propuestaEnviada'))
        setDescripcion('')
        setFile(null)
        if (fileRef.current) fileRef.current.value = ''
        router.refresh()
        return
      }
      toast.error(
        res.error === 'archivo_duplicado'
          ? t('archivoDuplicado')
          : res.error === 'propuesta_abierta_existente'
            ? t('propuestaAbiertaExistente')
            : t('errorGenerico'),
      )
    } catch (error) {
      logger.error('TareaCard.handleSubir', {
        error: error instanceof Error ? error.message : String(error),
      })
      toast.error(t('errorGenerico'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleVeredicto = async () => {
    if (!veredicto) return
    if (veredicto.decision === 'con_cambios' && comentario.trim() === '') {
      toast.error(t('comentarioRequerido'))
      return
    }
    setIsDeciding(true)
    const res = await responderEntregable({
      idEntregable: veredicto.idEntregable,
      decision: veredicto.decision,
      ...(comentario.trim() !== '' ? { comentario: comentario.trim() } : {}),
    })
    setIsDeciding(false)
    if (res.ok) {
      toast.success(
        res.data.finalizado
          ? t('proyectoFinalizado')
          : veredicto.decision === 'aprobado'
            ? t('veredictoAprobado')
            : t('veredictoCambios'),
      )
      setVeredicto(null)
      setComentario('')
      router.refresh()
      return
    }
    toast.error(t('errorGenerico'))
  }

  return (
    <Card className="border border-border bg-card/40">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-base font-bold text-foreground">
                {tarea.titulo}
              </h3>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                  isFinal
                    ? 'border-secondary/40 bg-secondary/10 text-secondary'
                    : 'border-primary/30 bg-primary/10 text-primary',
                )}
              >
                {isFinal ? t('badgeFinal') : t('badgeParcial')}
              </span>
            </div>
            {tarea.descripcion && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {tarea.descripcion}
              </p>
            )}
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
              tarea.estado === 'aprobada'
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-warning/40 bg-warning/10 text-warning',
            )}
          >
            {tarea.estado === 'aprobada'
              ? t('tareaAprobada')
              : t('tareaAbierta')}
          </span>
        </div>

        <div className="space-y-3 border-t border-border/40 pt-3">
          {tarea.propuestas.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">
              {t('sinPropuestas')}
            </p>
          ) : (
            tarea.propuestas.map((propuesta, i) => (
              <PropuestaRow
                key={propuesta.id_entregable}
                rol={rol}
                canManage={canManage}
                propuesta={propuesta}
                ordinal={i + 1}
                onDownload={() => handleDownload(propuesta.id_entregable)}
                onAprobar={() =>
                  setVeredicto({
                    idEntregable: propuesta.id_entregable,
                    decision: 'aprobado',
                  })
                }
                onPedirCambios={() =>
                  setVeredicto({
                    idEntregable: propuesta.id_entregable,
                    decision: 'con_cambios',
                  })
                }
              />
            ))
          )}
        </div>

        {puedeSubir && (
          <div className="space-y-2 border-t border-border/40 pt-3">
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={2000}
              rows={2}
              placeholder={t('propuestaDescPlaceholder')}
            />
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full max-w-xs text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
              />
              <Button
                type="button"
                variant="accent"
                size="sm"
                disabled={isUploading || !file}
                onClick={() => void handleSubir()}
                className="rounded-full font-semibold"
              >
                <Upload className="h-3.5 w-3.5" />
                {t('enviarPropuesta')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog
        open={veredicto !== null}
        onOpenChange={(open) => !open && setVeredicto(null)}
      >
        <DialogContent className="sm:max-w-md border border-border">
          {veredicto && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl font-bold">
                  {veredicto.decision === 'aprobado'
                    ? isFinal
                      ? t('aprobarFinalTitle')
                      : t('aprobarTitle')
                    : t('pedirCambiosTitle')}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {veredicto.decision === 'aprobado'
                    ? isFinal
                      ? t('aprobarFinalDesc')
                      : t('aprobarDesc')
                    : t('pedirCambiosDesc')}
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder={
                  veredicto.decision === 'aprobado'
                    ? t('comentarioOpcional')
                    : t('comentarioCambiosPlaceholder')
                }
              />
              <DialogFooter className="flex gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setVeredicto(null)}
                  disabled={isDeciding}
                >
                  {t('cancelar')}
                </Button>
                <Button
                  type="button"
                  variant={
                    veredicto.decision === 'aprobado' ? 'accent' : 'warning'
                  }
                  onClick={() => void handleVeredicto()}
                  disabled={isDeciding}
                  className="font-semibold"
                >
                  {veredicto.decision === 'aprobado'
                    ? t('aprobarBtn')
                    : t('pedirCambiosBtn')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

interface PropuestaRowProps {
  rol: 'empresario' | 'egresado'
  canManage: boolean
  propuesta: PropuestaEntregable
  ordinal: number
  onDownload: () => void
  onAprobar: () => void
  onPedirCambios: () => void
}

function PropuestaRow({
  rol,
  canManage,
  propuesta,
  ordinal,
  onDownload,
  onAprobar,
  onPedirCambios,
}: PropuestaRowProps) {
  const t = useTranslations('Contrataciones')
  const estilo = PROPUESTA_STYLE[propuesta.estado]
  const labelKey = PROPUESTA_LABEL_KEY[propuesta.estado]
  const enRevision =
    propuesta.estado === 'enviado' || propuesta.estado === 'en_revision'

  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">
            {t('propuestaN', { n: ordinal })}
          </span>
          {estilo && labelKey && (
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                estilo,
              )}
            >
              {t(labelKey)}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">
            {propuesta.cargado_at.slice(0, 10)}
          </span>
        </div>
        {rol === 'empresario' && propuesta.archivo_url && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDownload}
            className="h-7 gap-1 text-xs font-semibold text-primary hover:bg-primary/10"
          >
            <Download className="h-3.5 w-3.5" />
            {t('descargar')}
          </Button>
        )}
      </div>

      {propuesta.descripcion && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
          {propuesta.descripcion}
        </p>
      )}

      {propuesta.comentario_empresario && (
        <p className="mt-2 flex gap-1.5 text-sm text-muted-foreground">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="whitespace-pre-wrap">
            {propuesta.comentario_empresario}
          </span>
        </p>
      )}

      {propuesta.comentarios.length > 0 && (
        <div className="mt-2 space-y-1 border-t border-border/40 pt-2">
          {propuesta.comentarios.map((c) => (
            <p
              key={c.id_comentario_entregable}
              className="flex gap-1.5 text-xs text-muted-foreground"
            >
              <FileText className="mt-0.5 h-3 w-3 shrink-0" />
              <span className="whitespace-pre-wrap">{c.contenido}</span>
            </p>
          ))}
        </div>
      )}

      {rol === 'empresario' && canManage && enRevision && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border/40 pt-3">
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={onAprobar}
            className="rounded-full font-semibold"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t('aprobarBtn')}
          </Button>
          <Button
            type="button"
            variant="warning"
            size="sm"
            onClick={onPedirCambios}
            className="rounded-full font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t('pedirCambiosBtn')}
          </Button>
        </div>
      )}
    </div>
  )
}
