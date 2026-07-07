'use client'

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  ArrowDownWideNarrow,
  ArrowLeft,
  ArrowUpNarrowWide,
  Briefcase,
  Lock,
  MessageSquare,
  Search,
  Send,
} from 'lucide-react'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils/cn'
import { PageTitle } from '@/components/features/brand/PageTitle'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  enviarMensaje,
  getMensajesDeProyecto,
  marcarLeidos,
  type ConversacionItem,
  type Mensaje,
} from '@/lib/mensajes/actions'
import { logger } from '@/lib/logger'
import { usePollingMensajes } from '@/hooks/use-polling-mensajes'
import {
  classifyDay,
  filtrarConversaciones,
  isSameLocalDay,
  sortConversacionesByActividad,
  type EstadoFiltro,
  type OrdenDireccion,
} from '@/lib/mensajes/conversaciones-logic'
import { ACENTO_MENSAJERIA, type RolMensajeria } from './mensajeria-acento'
import { ContactAvatar } from './ContactAvatar'
import { ConversationRow } from './ConversationRow'
import { MessageBubble } from './MessageBubble'
import { DateSeparator } from './DateSeparator'
import { EstadoBadge } from './EstadoBadge'
import { MensajeriaEmptyState } from './MensajeriaEmptyState'

const MIN_CONVERSACIONES_CONTROLES = 1

const ESTADOS_FILTRO = [
  'todas',
  'contratada',
  'finalizada',
  'cancelada',
] as const

const ESTADO_FILTRO_LABEL = {
  todas: 'filtroTodas',
  contratada: 'filtroActivas',
  finalizada: 'filtroFinalizadas',
  cancelada: 'filtroCancelados',
} as const satisfies Record<EstadoFiltro, string>

function claveErrorEnvio(
  error: string,
): 'errorRateLimit' | 'errorProyectoFinalizado' | 'errorEnvio' {
  switch (error) {
    case 'rate_limited':
      return 'errorRateLimit'
    case 'proyecto_finalizado':
      return 'errorProyectoFinalizado'
    default:
      return 'errorEnvio'
  }
}

function formatHoraCorta(fechaIso: string, locale: string): string {
  return new Date(fechaIso).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFechaCorta(fechaIso: string, locale: string): string {
  return new Date(fechaIso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  })
}

function formatTimestampLista(
  fechaIso: string | null,
  ahora: Date | null,
  locale: string,
  labelAyer: string,
): string {
  if (!fechaIso) return ''
  if (!ahora) return formatFechaCorta(fechaIso, locale)
  const bucket = classifyDay(new Date(fechaIso), ahora)
  if (bucket === 'today') return formatHoraCorta(fechaIso, locale)
  if (bucket === 'yesterday') return labelAyer
  return formatFechaCorta(fechaIso, locale)
}

function formatLabelSeparador(
  fechaIso: string,
  ahora: Date | null,
  locale: string,
  labelHoy: string,
  labelAyer: string,
): string {
  if (ahora) {
    const bucket = classifyDay(new Date(fechaIso), ahora)
    if (bucket === 'today') return labelHoy
    if (bucket === 'yesterday') return labelAyer
  }
  return new Date(fechaIso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface MensajeriaWorkspaceProps {
  rol: RolMensajeria
  conversaciones: ConversacionItem[]
  initialProjectId: string | null
  initialMensajes: { mensajes: Mensaje[]; puedeEnviar: boolean } | null
  currentUserId: string
}

export function MensajeriaWorkspace({
  rol,
  conversaciones,
  initialProjectId,
  initialMensajes,
  currentUserId,
}: MensajeriaWorkspaceProps) {
  const t = useTranslations('Mensajes')
  const tCommon = useTranslations('Common')
  const tEgresado = useTranslations('Mensajes.egresado')
  const tEmpresario = useTranslations('Mensajes.empresario')
  const tRol = rol === 'egresado' ? tEgresado : tEmpresario
  const locale = useLocale()
  const acento = ACENTO_MENSAJERIA

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const prevLenRef = useRef(0)

  const [convs, setConvs] = useState<ConversacionItem[]>(() =>
    conversaciones.map((c) =>
      c.idProyecto === initialProjectId ? { ...c, noLeidos: 0 } : c,
    ),
  )
  const [selectedConv, setSelectedConv] = useState<ConversacionItem | null>(
    () =>
      initialProjectId
        ? (conversaciones.find((c) => c.idProyecto === initialProjectId) ??
          null)
        : null,
  )
  const [mostrarHiloMovil, setMostrarHiloMovil] = useState<boolean>(
    () =>
      initialProjectId !== null &&
      conversaciones.some((c) => c.idProyecto === initialProjectId),
  )
  const [mensajes, setMensajes] = useState<Mensaje[]>(
    initialMensajes?.mensajes ?? [],
  )
  const [puedeEnviar, setPuedeEnviar] = useState<boolean>(
    initialMensajes?.puedeEnviar ?? false,
  )
  const [isLoadingMensajes, setIsLoadingMensajes] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [input, setInput] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('todas')
  const [direccion, setDireccion] = useState<OrdenDireccion>('desc')
  const [ahora, setAhora] = useState<Date | null>(null)

  // Se resuelve solo en cliente para no arriesgar un desajuste de hidratación en
  // las etiquetas relativas (hoy/ayer): antes del montaje se muestra fecha absoluta.
  useEffect(() => {
    setAhora(new Date())
  }, [])

  useEffect(() => {
    setConvs(
      conversaciones.map((c) =>
        c.idProyecto === selectedConv?.idProyecto ? { ...c, noLeidos: 0 } : c,
      ),
    )
  }, [conversaciones, selectedConv])

  usePollingMensajes(selectedConv?.idProyecto ?? null, (datos) => {
    setMensajes(datos.mensajes)
    setPuedeEnviar(datos.puedeEnviar)
    const idActivo = selectedConv?.idProyecto
    if (
      idActivo &&
      datos.mensajes.some((m) => m.idRemitente !== currentUserId && !m.leido)
    ) {
      void marcarLeidos(idActivo).then((res) => {
        if (!res.ok) {
          logger.warn('marcarLeidos: no se pudo marcar como leído', {
            error: res.error,
          })
        }
      })
    }
  })

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container && mensajes.length > prevLenRef.current) {
      container.scrollTop = container.scrollHeight
    }
    prevLenRef.current = mensajes.length
  }, [mensajes])

  const filteredConvs = useMemo(
    () =>
      sortConversacionesByActividad(
        filtrarConversaciones(convs, busqueda, estadoFiltro),
        direccion,
      ),
    [convs, busqueda, estadoFiltro, direccion],
  )

  const mostrarControles = conversaciones.length >= MIN_CONVERSACIONES_CONTROLES

  const handleSelectConv = async (conv: ConversacionItem) => {
    setMostrarHiloMovil(true)
    if (selectedConv?.idProyecto === conv.idProyecto) return
    setSelectedConv(conv)
    setConvs((prev) =>
      prev.map((c) =>
        c.idProyecto === conv.idProyecto ? { ...c, noLeidos: 0 } : c,
      ),
    )
    setMensajes([])
    setIsLoadingMensajes(true)

    const result = await getMensajesDeProyecto(conv.idProyecto)
    setIsLoadingMensajes(false)

    if (!result.ok) {
      toast.error(t('errorCarga'))
      return
    }

    setMensajes(result.data.mensajes)
    setPuedeEnviar(result.data.puedeEnviar)
    void marcarLeidos(conv.idProyecto).then((res) => {
      if (!res.ok) {
        logger.warn('marcarLeidos: no se pudo marcar como leído', {
          error: res.error,
        })
      }
    })
  }

  const handleVolver = () => {
    setMostrarHiloMovil(false)
  }

  const handleSend = async () => {
    if (!selectedConv || !input.trim() || !puedeEnviar || isSending) return
    const contenido = input.trim()
    setInput('')
    setIsSending(true)

    const result = await enviarMensaje({
      idProyecto: selectedConv.idProyecto,
      contenido,
    })
    setIsSending(false)

    if (!result.ok) {
      setInput(contenido)
      toast.error(t(claveErrorEnvio(result.error)))
      return
    }

    setMensajes((prev) => [...prev, result.data])
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <section className="flex h-[calc(100dvh-5rem)] min-h-[540px] w-full min-w-0 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <PageTitle title={tRol('title')} description={tRol('description')} />
      </div>

      {conversaciones.length === 0 ? (
        <div className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-sm">
          <MensajeriaEmptyState
            icon={<MessageSquare className="size-8" />}
            title={tRol('noConversaciones')}
            description={tRol('noConversacionesDesc')}
            texturaClass={acento.textura}
            textoClass={acento.texto}
          />
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-sm">
          {/* Panel izquierdo — lista de conversaciones */}
          <aside
            className={cn(
              'w-full shrink-0 flex-col border-r border-border/60 bg-canvas/40 md:flex md:w-80',
              mostrarHiloMovil ? 'hidden' : 'flex',
            )}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border/50 px-4 py-3">
              <p className="font-heading text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t('conversacionesLabel')}
              </p>
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full font-mono text-xs font-bold',
                  acento.contadorPill,
                )}
              >
                {conversaciones.length}
              </span>
            </div>

            {mostrarControles && (
              <div className="space-y-2 border-b border-border/50 px-3 py-2.5">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder={t('buscarPlaceholder')}
                    aria-label={t('buscarPlaceholder')}
                    className="h-9 w-full rounded-lg border border-border/60 bg-surface pl-8 pr-3 text-sm outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div
                    role="group"
                    aria-label={t('filtroEstadoLabel')}
                    className="flex items-center gap-1"
                  >
                    {ESTADOS_FILTRO.map((opcion) => (
                      <button
                        key={opcion}
                        type="button"
                        onClick={() => setEstadoFiltro(opcion)}
                        aria-pressed={estadoFiltro === opcion}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                          estadoFiltro === opcion
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/70',
                        )}
                      >
                        {t(ESTADO_FILTRO_LABEL[opcion])}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDireccion((prev) => (prev === 'desc' ? 'asc' : 'desc'))
                    }
                    aria-label={
                      direccion === 'desc'
                        ? t('ordenDescLabel')
                        : t('ordenAscLabel')
                    }
                    title={
                      direccion === 'desc'
                        ? t('ordenDescLabel')
                        : t('ordenAscLabel')
                    }
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-muted hover:text-foreground"
                  >
                    {direccion === 'desc' ? (
                      <ArrowDownWideNarrow className="size-4" />
                    ) : (
                      <ArrowUpNarrowWide className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="min-h-0 flex-1 divide-y divide-border/40 overflow-y-auto">
              {filteredConvs.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {t('buscarSinResultados')}
                </p>
              ) : (
                filteredConvs.map((conv) => (
                  <ConversationRow
                    key={conv.idProyecto}
                    conv={conv}
                    isActive={selectedConv?.idProyecto === conv.idProyecto}
                    timestampLabel={formatTimestampLista(
                      conv.ultimoMensajeFecha,
                      ahora,
                      locale,
                      t('dateYesterday'),
                    )}
                    filaActivaClass={acento.filaActiva}
                    onSelect={() => void handleSelectConv(conv)}
                  />
                ))
              )}
            </div>
          </aside>

          {/* Panel derecho — hilo de mensajes */}
          <div
            className={cn(
              'min-w-0 flex-1 flex-col md:flex',
              mostrarHiloMovil ? 'flex' : 'hidden',
            )}
          >
            {selectedConv === null ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <div
                  className={cn(
                    'flex size-14 items-center justify-center rounded-2xl bg-muted',
                    acento.texto,
                  )}
                >
                  <MessageSquare className="size-7" />
                </div>
                <p className="font-semibold text-foreground">
                  {t('selectConversacion')}
                </p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  {t('selectConversacionDesc')}
                </p>
              </div>
            ) : (
              <>
                {/* Header del hilo */}
                <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
                  <button
                    type="button"
                    onClick={handleVolver}
                    aria-label={t('volverLista')}
                    className="-ml-1 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <ContactAvatar
                    name={selectedConv.nombreContraparte}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {selectedConv.nombreContraparte}
                      </p>
                      <EstadoBadge estado={selectedConv.estado} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {t('proyectoLabel')}: {selectedConv.tituloProyecto}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="shrink-0 gap-1.5 rounded-full font-semibold text-accent hover:bg-accent/10"
                  >
                    <Link
                      href={
                        rol === 'empresario'
                          ? `/empresario/contrataciones/${selectedConv.idProyecto}`
                          : `/egresado/contrataciones/${selectedConv.idProyecto}`
                      }
                    >
                      <Briefcase className="size-4" />
                      <span className="hidden sm:inline">
                        {tCommon('workspace')}
                      </span>
                    </Link>
                  </Button>
                </div>

                {/* Mensajes */}
                <div
                  ref={messagesContainerRef}
                  className="min-h-0 flex-1 overflow-y-auto px-4 py-3"
                >
                  {isLoadingMensajes ? (
                    <div className="flex h-full items-center justify-center">
                      <div
                        className={cn(
                          'size-6 animate-spin rounded-full border-2 border-t-transparent',
                          acento.spinnerBorde,
                        )}
                      />
                    </div>
                  ) : mensajes.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                      <p className="font-semibold text-foreground">
                        {t('mensajesEmpty')}
                      </p>
                      <p className="max-w-xs text-sm text-muted-foreground">
                        {t('mensajesEmptyDesc')}
                      </p>
                    </div>
                  ) : (
                    mensajes.map((mensaje, i) => {
                      const prev = i > 0 ? mensajes[i - 1] : undefined
                      const fecha = new Date(mensaje.fechaEnvio)
                      const nuevoDia =
                        !prev ||
                        !isSameLocalDay(new Date(prev.fechaEnvio), fecha)
                      const nuevoBloque =
                        nuevoDia ||
                        !prev ||
                        prev.idRemitente !== mensaje.idRemitente
                      return (
                        <Fragment key={mensaje.idMensaje}>
                          {nuevoDia && (
                            <DateSeparator
                              label={formatLabelSeparador(
                                mensaje.fechaEnvio,
                                ahora,
                                locale,
                                t('dateToday'),
                                t('dateYesterday'),
                              )}
                            />
                          )}
                          <div
                            className={cn(
                              i === 0 ? '' : nuevoBloque ? 'mt-3' : 'mt-1',
                            )}
                          >
                            <MessageBubble
                              mensaje={mensaje}
                              isMine={mensaje.idRemitente === currentUserId}
                              burbujaPropiaClass={acento.burbujaPropia}
                            />
                          </div>
                        </Fragment>
                      )
                    })
                  )}
                </div>

                {/* Composer */}
                <div className="border-t border-border/50 bg-canvas/30 px-4 py-3">
                  {!puedeEnviar && (
                    <div className="mb-2 flex items-center gap-2 rounded-lg border border-warning/20 bg-warning/10 px-3 py-2">
                      <Lock className="size-3.5 shrink-0 text-warning" />
                      <p className="text-xs text-warning">
                        {selectedConv?.estado === 'cancelada'
                          ? t('inputDisabledHintCancelado')
                          : t('inputDisabledHint')}
                      </p>
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={puedeEnviar ? t('inputPlaceholder') : ''}
                      disabled={!puedeEnviar || isSending}
                      rows={1}
                      className="max-h-[120px] min-h-[40px] flex-1 resize-none rounded-xl text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant={acento.botonEnviarVariant}
                      onClick={() => void handleSend()}
                      disabled={
                        !puedeEnviar || isSending || input.trim().length === 0
                      }
                      className="size-10 shrink-0 rounded-xl"
                      aria-label={t('sendBtn')}
                    >
                      {isSending ? (
                        <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Send className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
