'use client'

import { Star, MessageSquare } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { EmptyState } from '@/components/features/shared/EmptyState'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface AdminRatingRow {
  idEvaluacion: string
  nombreEgresado: string
  nombreEmpresa: string
  proyectoTitulo: string
  puntuacion: number
  comentario: string | null
  /** Réplica del evaluado a esta calificación (RF-53). Opcional: la dirección
   *  empresa→egresado la agrega tras su migración; egresado→empresa ya la trae. */
  respuestaEvaluado?: string | null
  evaluadoAt: string
}

interface AdminRatingsTableProps {
  items: AdminRatingRow[]
}

const STAR_POSITIONS = [1, 2, 3, 4, 5] as const

/**
 * Tabla de calificaciones para el panel admin. Es agnóstica a la dirección
 * (empresa->egresado o egresado->empresa): siempre muestra ambos nombres y el
 * encabezado de cada sección aclara quién recibe la calificación.
 */
export function AdminRatingsTable({ items }: AdminRatingsTableProps) {
  const t = useTranslations('Admin')
  const locale = useLocale()

  if (items.length === 0) {
    return (
      <EmptyState
        title={t('noRatingsYet')}
        description={t('noRatingsYetDesc')}
        icon={Star}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabla para Desktop (oculta en móvil) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('ratingsCount', { count: items.length })}
        </div>
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="font-semibold text-foreground/80 pl-6">
                {t('ratingEgresado')}
              </TableHead>
              <TableHead className="font-semibold text-foreground/80">
                {t('ratingEmpresa')}
              </TableHead>
              <TableHead className="font-semibold text-foreground/80">
                {t('ratingScore')}
              </TableHead>
              <TableHead className="font-semibold text-foreground/80">
                {t('ratingComment')}
              </TableHead>
              <TableHead className="text-right pr-6 font-semibold text-foreground/80">
                {t('ratingDate')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((rating) => (
              <TableRow
                key={rating.idEvaluacion}
                className="hover:bg-muted/40 transition-colors duration-200 border-b border-border/60"
              >
                <TableCell className="py-3.5 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full shrink-0 bg-primary" />
                    <div>
                      <span className="font-semibold text-foreground leading-snug">
                        {rating.nombreEgresado}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="font-semibold text-foreground/80 text-sm">
                    {rating.nombreEmpresa}
                  </div>
                  {rating.proyectoTitulo && (
                    <div className="text-[10px] text-muted-foreground mt-0.5 max-w-[200px] truncate">
                      {rating.proyectoTitulo}
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-0.5">
                    {STAR_POSITIONS.map((star) => (
                      <Star
                        key={star}
                        className={
                          star <= rating.puntuacion
                            ? 'h-3.5 w-3.5 fill-warning text-warning'
                            : 'h-3.5 w-3.5 text-muted-foreground/40'
                        }
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="py-3.5 max-w-xs align-top text-muted-foreground">
                  {rating.comentario ? (
                    <div className="flex items-start gap-1">
                      <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span
                        className="line-clamp-2 text-xs"
                        title={rating.comentario}
                      >
                        {rating.comentario}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs italic text-muted-foreground/40">
                      -
                    </span>
                  )}
                  {rating.respuestaEvaluado && (
                    <div className="mt-1.5 rounded-md border border-primary/20 bg-primary/5 px-2 py-1">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-primary">
                        {t('ratingReplica')}
                      </span>
                      <span
                        className="line-clamp-2 text-[11px] italic text-foreground/80"
                        title={rating.respuestaEvaluado}
                      >
                        {rating.respuestaEvaluado}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-3.5 text-right pr-6 text-xs text-muted-foreground">
                  {new Date(rating.evaluadoAt).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Tarjetas para Móvil (oculta en desktop) */}
      <div className="block md:hidden space-y-4">
        <div className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('ratingsCount', { count: items.length })}
        </div>
        {items.map((rating) => {
          const ratingBorderClass =
            rating.puntuacion >= 4
              ? 'border-l-accent'
              : rating.puntuacion === 3
                ? 'border-l-warning'
                : 'border-l-destructive'

          return (
            <div
              key={rating.idEvaluacion}
              className={`rounded-2xl border border-border border-l-4 bg-surface p-5 shadow-sm space-y-3 ${ratingBorderClass}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    {rating.nombreEgresado}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('ratingEmpresa')}:{' '}
                    <span className="font-semibold text-foreground/80">
                      {rating.nombreEmpresa}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0 bg-muted/30 px-2 py-1 rounded-full border border-border/40">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  <span className="text-xs font-bold text-foreground">
                    {rating.puntuacion}
                  </span>
                </div>
              </div>

              {rating.proyectoTitulo && (
                <div className="text-xs text-muted-foreground border-t border-border/60 pt-2">
                  <span className="font-semibold text-foreground/80 block mb-0.5">
                    Proyecto
                  </span>
                  {rating.proyectoTitulo}
                </div>
              )}

              {rating.comentario && (
                <div className="text-xs text-muted-foreground border-t border-border/60 pt-2">
                  <span className="font-semibold text-foreground/80 block mb-0.5">
                    {t('ratingComment')}
                  </span>
                  <div className="flex items-start gap-1 text-foreground/80 bg-muted/20 p-2.5 rounded-xl border border-border/50">
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-xs">{rating.comentario}</span>
                  </div>
                </div>
              )}

              {rating.respuestaEvaluado && (
                <div className="border-t border-border/60 pt-2 text-xs">
                  <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-primary">
                    {t('ratingReplica')}
                  </span>
                  <p className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-xs italic text-foreground/80 prose-body">
                    {rating.respuestaEvaluado}
                  </p>
                </div>
              )}

              <div className="text-[10px] text-muted-foreground text-right border-t border-border/60 pt-2">
                {new Date(rating.evaluadoAt).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
