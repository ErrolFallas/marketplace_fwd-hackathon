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
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t('ratingsCount', { count: items.length })}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('ratingEgresado')}</TableHead>
            <TableHead>{t('ratingEmpresa')}</TableHead>
            <TableHead>{t('ratingScore')}</TableHead>
            <TableHead>{t('ratingComment')}</TableHead>
            <TableHead>{t('ratingDate')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((rating) => (
            <TableRow key={rating.idEvaluacion}>
              <TableCell className="font-semibold text-foreground">
                {rating.nombreEgresado}
              </TableCell>
              <TableCell>
                <div className="font-semibold text-foreground">
                  {rating.nombreEmpresa}
                </div>
                {rating.proyectoTitulo && (
                  <div className="text-[10px] text-muted-foreground">
                    {rating.proyectoTitulo}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-0.5">
                  {STAR_POSITIONS.map((star) => (
                    <Star
                      key={star}
                      className={
                        star <= rating.puntuacion
                          ? 'h-3.5 w-3.5 fill-highlight text-highlight'
                          : 'h-3.5 w-3.5 text-muted-foreground/40'
                      }
                    />
                  ))}
                </div>
              </TableCell>
              <TableCell
                className="max-w-xs truncate text-muted-foreground"
                title={rating.comentario || ''}
              >
                {rating.comentario ? (
                  <div className="flex items-start gap-1">
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate text-xs">
                      {rating.comentario}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs italic text-muted-foreground/40">
                    -
                  </span>
                )}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
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
  )
}
