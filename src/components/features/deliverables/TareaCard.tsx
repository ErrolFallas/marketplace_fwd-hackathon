'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Download,
  ExternalLink,
  FileImage,
  FileText,
  Paperclip,
  RotateCcw,
  Send,
  X,
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
import {
  getSignedUrlEntregable,
  getSignedUrlAdjunto,
} from '@/lib/deliverables/queries'
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

const ACCEPT_ARCHIVOS = 'application/pdf,image/png,image/jpeg,image/webp'

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
  const [urlEnlace, setUrlEnlace] = useState('')
  const [archivos, setArchivos] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

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

  const agregarArchivos = (lista: FileList | null) => {
    if (!lista) return
    setArchivos((prev) => [...prev, ...Array.from(lista)])
  }

  const quitarArchivo = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index))
  }

  const openConfirm = () => {
    if (descripcion.trim() === '') {
      toast.error(t('descripcionRequerida'))
      return
    }
    if (urlEnlace.trim() === '' && archivos.length === 0) {
      toast.error(t('evidenciaRequerida'))
      return
    }
    setConfirmOpen(true)
  }

  const handleSubir = async () => {
    if (descripcion.trim() === '') {
      toast.error(t('descripcionRequerida'))
      return
    }
    if (urlEnlace.trim() === '' && archivos.length === 0) {
      toast.error(t('evidenciaRequerida'))
      return
    }
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('idTarea', tarea.id_tarea)
      formData.append('idProyecto', idProyecto)
      formData.append('descripcion', descripcion.trim())
      if (urlEnlace.trim() !== '')
        formData.append('urlEnlace', urlEnlace.trim())
      for (const archivo of archivos) formData.append('archivos', archivo)
      const res = await subirPropuesta(formData)
      if (res.ok) {
        toast.success(t('propuestaEnviada'))
        setDescripcion('')
        setUrlEnlace('')
        setArchivos([])
        router.refresh()
        return
      }
      toast.error(
        res.error === 'evidencia_requerida'
          ? t('evidenciaRequerida')
          : res.error === 'tipo_no_permitido'
            ? t('tipoNoPermitido')
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
              {isFinal && (
                <span className="rounded-full border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary">
                  {t('badgeFinal')}
                </span>
              )}
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
          <div className="space-y-3 border-t border-border/40 pt-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {t('nuevaPropuestaTitle')}
            </p>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={2000}
              rows={2}
              placeholder={t('propuestaDescPlaceholder')}
            />
            <input
              type="url"
              value={urlEnlace}
              onChange={(e) => setUrlEnlace(e.target.value)}
              maxLength={500}
              placeholder={t('linkPlaceholder')}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
            <div className="space-y-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-accent/50 hover:text-accent">
                <Paperclip className="h-3.5 w-3.5" />
                {t('subirArchivos')}
                <input
                  type="file"
                  multiple
                  accept={ACCEPT_ARCHIVOS}
                  className="sr-only"
                  onChange={(e) => {
                    agregarArchivos(e.target.files)
                    e.target.value = ''
                  }}
                />
              </label>
              {archivos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {archivos.map((archivo, i) => (
                    <span
                      key={`${archivo.name}-${i}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-foreground"
                    >
                      {archivo.type === 'application/pdf' ? (
                        <FileText className="h-3.5 w-3.5 text-secondary" />
                      ) : (
                        <FileImage className="h-3.5 w-3.5 text-accent" />
                      )}
                      <span className="max-w-[140px] truncate">
                        {archivo.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => quitarArchivo(i)}
                        aria-label={t('quitarArchivo')}
                        className="text-muted-foreground hover:text-magenta"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t('evidenciaHint')}
            </p>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="accent"
                size="sm"
                disabled={isUploading}
                onClick={openConfirm}
                className="rounded-full font-semibold"
              >
                <Send className="h-3.5 w-3.5" />
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
                    ? t('aprobarTitle')
                    : t('pedirCambiosTitle')}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {veredicto.decision === 'aprobado'
                    ? t('aprobarDesc')
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

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => !open && setConfirmOpen(false)}
      >
        <DialogContent className="sm:max-w-md border border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold">
              {t('confirmarEnvioTitle')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('confirmarEnvioAviso')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isUploading}
            >
              {t('cancelar')}
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={() => {
                setConfirmOpen(false)
                void handleSubir()
              }}
              disabled={isUploading}
              className="font-semibold"
            >
              {t('enviarPropuesta')}
            </Button>
          </DialogFooter>
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

  const pdfs = propuesta.adjuntos.filter((a) => a.tipo === 'pdf')
  const imagenes = propuesta.adjuntos.filter((a) => a.tipo === 'imagen')
  const tieneEvidencia =
    propuesta.url_enlace !== null ||
    propuesta.adjuntos.length > 0 ||
    propuesta.archivo_url !== null

  const abrirAdjunto = async (idAdjunto: string) => {
    const res = await getSignedUrlAdjunto(idAdjunto)
    if (res.ok) {
      window.open(res.data.url, '_blank', 'noopener,noreferrer')
    } else {
      toast.error(t('descargaError'))
    }
  }

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
      </div>

      {propuesta.descripcion && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
          {propuesta.descripcion}
        </p>
      )}

      {/* Tira de evidencia: link (primary) + PDF (secondary) + imágenes (accent) */}
      {tieneEvidencia && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {propuesta.url_enlace && (
            <a
              href={propuesta.url_enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary/10"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t('verCambios')}
            </a>
          )}
          {pdfs.map((adj, i) => (
            <button
              key={adj.id_adjunto}
              type="button"
              onClick={() => void abrirAdjunto(adj.id_adjunto)}
              className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/5 px-2.5 py-1 text-xs font-semibold text-secondary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-secondary/10"
            >
              <FileText className="h-3.5 w-3.5" />
              {t('adjuntoPdf')} {pdfs.length > 1 ? i + 1 : ''}
            </button>
          ))}
          {imagenes.map((adj, i) => (
            <button
              key={adj.id_adjunto}
              type="button"
              onClick={() => void abrirAdjunto(adj.id_adjunto)}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 px-2.5 py-1 text-xs font-semibold text-accent transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-accent/10"
            >
              <FileImage className="h-3.5 w-3.5" />
              {t('adjuntoImagen')} {imagenes.length > 1 ? i + 1 : ''}
            </button>
          ))}
          {rol === 'empresario' && propuesta.archivo_url && (
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-semibold text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary/10"
            >
              <Download className="h-3.5 w-3.5" />
              {t('descargar')}
            </button>
          )}
        </div>
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
