'use client'

import React from 'react'
import { Star, Briefcase, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ParticipacionConProyecto } from '@/lib/projects/project-detail'

interface ContratacionesListProps {
  contrataciones: ParticipacionConProyecto[]
}

type FiltroEstado = 'all' | 'contratada' | 'finalizada'

function InitialsAvatar({
  nombre,
  apellidos,
}: {
  nombre: string
  apellidos: string
}) {
  const iniciales =
    `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase() || '?'
  return (
    <div className="w-9 h-9 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-inner">
      {iniciales}
    </div>
  )
}

function ReputacionStars({ rating }: { rating: number | null }) {
  const t = useTranslations('EmpresaPerfil')
  if (rating === null) {
    return (
      <span className="text-[10px] text-muted-foreground">
        {t('noRatings')}
      </span>
    )
  }
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < rating
              ? 'text-highlight fill-highlight'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const t = useTranslations('EmpresaPerfil')
  const isActive = estado === 'contratada'
  return (
    <span
      className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
        isActive
          ? 'bg-warning/15 text-warning border-warning/30'
          : 'bg-accent/15 text-accent border-accent/30'
      }`}
    >
      {isActive ? t('estadoEnDesarrollo') : t('estadoFinalizado')}
    </span>
  )
}

export function ContratacionesList({
  contrataciones,
}: ContratacionesListProps) {
  const t = useTranslations('EmpresaPerfil')
  const tCommon = useTranslations('Common')
  const [filtro, setFiltro] = React.useState<FiltroEstado>('all')
  const [selectedMotivacion, setSelectedMotivacion] =
    React.useState<ParticipacionConProyecto | null>(null)

  const tituloLabels: Record<string, string> = {
    frontend: t('tituloFrontend'),
    backend: t('tituloBackend'),
    fullstack: t('tituloFullstack'),
  }

  const filtros: { key: FiltroEstado; label: string }[] = [
    { key: 'all', label: t('filterAll') },
    { key: 'contratada', label: t('filterEnDesarrollo') },
    { key: 'finalizada', label: t('filterFinalizado') },
  ]

  const visibles =
    filtro === 'all'
      ? contrataciones
      : contrataciones.filter((c) => c.estado === filtro)

  if (contrataciones.length === 0) {
    return (
      <div className="p-12 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center bg-card/20 w-full">
        <Briefcase className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-bold text-foreground">
          {t('sinContrataciones')}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          {t('sinContratacionesDesc')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Filtros por estado */}
      <div className="flex items-center gap-2 flex-wrap">
        {filtros.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFiltro(key)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] ${
              filtro === key
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {visibles.length} / {contrataciones.length}
        </span>
      </div>

      {/* Lista filtrada: grid de 2 columnas */}
      {visibles.length === 0 ? (
        <div className="p-10 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center bg-card/20">
          <Briefcase className="w-8 h-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            {t('sinResultadosFiltro')}
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {visibles.map((item) => (
            <li key={item.idParticipacion}>
              <Card className="h-full border-border/60 hover:shadow-md transition-shadow duration-[var(--duration-base)] ease-[var(--ease-out)]">
                <CardContent className="p-4 flex flex-col gap-3 h-full">
                  {/* Identidad (enlaza al perfil) + estado */}
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/empresario/portafolio-egresado/${item.idParticipacion}`}
                      className="group flex items-center gap-2.5 min-w-0"
                    >
                      {item.fotoPerfil ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.fotoPerfil}
                          alt={item.estudianteNombre}
                          className="w-9 h-9 rounded-full object-cover border border-border shrink-0"
                        />
                      ) : (
                        <InitialsAvatar
                          nombre={item.estudianteNombre}
                          apellidos={item.estudianteApellidos}
                        />
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-foreground leading-tight truncate group-hover:text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]">
                          {item.estudianteNombre} {item.estudianteApellidos}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant="secondary"
                            className="px-1.5 py-0 text-[9px] font-bold tracking-wide uppercase bg-primary/10 text-primary border-primary/20"
                          >
                            {tituloLabels[item.tituloFwd ?? ''] ??
                              t('tituloEgresado')}
                          </Badge>
                          <ReputacionStars rating={item.reputacion} />
                        </div>
                      </div>
                    </Link>
                    <EstadoBadge estado={item.estado} />
                  </div>

                  {/* Proyecto */}
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t('contratadoPara')}
                    </span>
                    <span
                      className="text-sm font-semibold text-foreground line-clamp-2 leading-snug"
                      title={item.proyecto.titulo}
                    >
                      {item.proyecto.titulo}
                    </span>
                  </div>

                  {/* Acciones: primaria (entorno de trabajo) + postulación */}
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/40 pt-3">
                    <Button
                      asChild
                      size="sm"
                      variant="accent"
                      className="h-8 text-xs font-semibold gap-1.5 rounded-full"
                    >
                      <Link
                        href={`/empresario/contrataciones/${item.proyecto.id}`}
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        {tCommon('workspace')}
                      </Link>
                    </Button>
                    <button
                      type="button"
                      onClick={() => setSelectedMotivacion(item)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {t('verPostulacion')}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* Dialog: postulación (carta + planteamiento) */}
      <Dialog
        open={selectedMotivacion !== null}
        onOpenChange={(open) => !open && setSelectedMotivacion(null)}
      >
        <DialogContent className="sm:max-w-[600px] border-border max-h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0 pb-4 border-b border-border/50">
            <DialogTitle className="font-heading text-xl">
              {t('motivacionYSolucion')}
            </DialogTitle>
            {selectedMotivacion && (
              <p className="text-sm text-muted-foreground mt-1">
                {t('postulacionDe', {
                  nombre: selectedMotivacion.estudianteNombre,
                })}
              </p>
            )}
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-6">
            {selectedMotivacion?.cartaPostulacion ? (
              <div className="space-y-2">
                <h4 className="font-bold text-sm uppercase tracking-wider text-primary">
                  {t('cartaPresentacion')}
                </h4>
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/20 p-4 rounded-xl border border-border/40 prose-body">
                  {selectedMotivacion.cartaPostulacion}
                </div>
              </div>
            ) : null}
            {selectedMotivacion?.planteamientoSolucion ? (
              <div className="space-y-2">
                <h4 className="font-bold text-sm uppercase tracking-wider text-accent">
                  {t('planteamientoSolucionLabel')}
                </h4>
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-accent/5 p-4 rounded-xl border border-accent/10 prose-body">
                  {selectedMotivacion.planteamientoSolucion}
                </div>
              </div>
            ) : null}
            {!selectedMotivacion?.cartaPostulacion &&
              !selectedMotivacion?.planteamientoSolucion && (
                <div className="text-center p-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>{t('sinMotivacion')}</p>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
