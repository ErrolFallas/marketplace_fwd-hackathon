'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MODULOS_PERT } from '@/lib/cotizador-pert/types'
import type {
  AlineacionM,
  ContrasteStack,
  CotizacionResultado,
  FuenteOP,
  ModuloPert,
} from '@/lib/cotizador-pert/types'

interface Props {
  resultado: CotizacionResultado
  montoFinal: string
  onMontoChange: (valor: string) => void
  stackContraste: ContrasteStack | null
  avisos: string[]
  fuenteOP: FuenteOP
}

/**
 * Desglose visual de la cotización: 4 escenarios (O/M/P/Beta), tabla por módulo,
 * banda σ, reconciliación M↔Beta y el monto final editable que verá el
 * empresario. Todo el texto humano sale de i18n (nunca del modelo).
 */
export function CotizacionBreakdown({
  resultado,
  montoFinal,
  onMontoChange,
  stackContraste,
  avisos,
  fuenteOP,
}: Props) {
  const t = useTranslations('CotizadorPert')
  const locale = useLocale()
  const fmtCrc = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0,
  })
  const fmtUsd = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

  const moduloLabel: Record<ModuloPert, string> = {
    analisis_diseno: t('modulo_analisis_diseno'),
    frontend: t('modulo_frontend'),
    backend: t('modulo_backend'),
    base_datos: t('modulo_base_datos'),
    pruebas_calidad: t('modulo_pruebas_calidad'),
    despliegue: t('modulo_despliegue'),
  }
  const alignMsg: Record<AlineacionM, string> = {
    m_alineado: t('align_m_alineado'),
    m_muy_optimista: t('align_m_muy_optimista'),
    m_muy_pesimista: t('align_m_muy_pesimista'),
  }
  const avisoMsg = (codigo: string): string => {
    switch (codigo) {
      case 'ia_no_disponible':
        return t('aviso_ia_no_disponible')
      case 'repo_no_leido':
        return t('aviso_repo_no_leido')
      case 'repo_url_invalida':
        return t('aviso_repo_url_invalida')
      case 'ia_sin_propuesta':
        return t('aviso_ia_sin_propuesta')
      default:
        return codigo
    }
  }

  const { optimista, masProbable, pesimista, esperado } = resultado.escenarios
  const escenarios = [
    {
      key: 'o',
      label: t('escOptimista'),
      esc: optimista,
      variant: 'outline' as const,
    },
    {
      key: 'm',
      label: t('escMasProbable'),
      esc: masProbable,
      variant: 'secondary' as const,
    },
    {
      key: 'b',
      label: t('escEsperado'),
      esc: esperado,
      variant: 'default' as const,
    },
    {
      key: 'p',
      label: t('escPesimista'),
      esc: pesimista,
      variant: 'outline' as const,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {escenarios.map(({ key, label, esc, variant }) => (
          <div
            key={key}
            className="rounded-lg border border-border/60 bg-card/40 p-3 text-center"
          >
            <Badge variant={variant} className="mb-1">
              {label}
            </Badge>
            <p className="text-sm font-bold text-foreground">
              {fmtCrc.format(esc.totalCrc)}
            </p>
            <p className="text-xs text-muted-foreground">
              {fmtUsd.format(esc.totalUsd)}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {t('bandaConfianza', {
          min: fmtCrc.format(resultado.bandaEsperadoCrc.min),
          max: fmtCrc.format(resultado.bandaEsperadoCrc.max),
        })}
        {' · '}
        {t('mesesAprox', {
          meses: resultado.informativo.mesesAprox.toFixed(1),
        })}
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('colModulo')}</TableHead>
            <TableHead className="text-right">{t('colHorasM')}</TableHead>
            <TableHead className="text-right">{t('colBetaH')}</TableHead>
            <TableHead className="text-right">{t('colCosto')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MODULOS_PERT.map((m) => (
            <TableRow key={m}>
              <TableCell className="font-medium">{moduloLabel[m]}</TableCell>
              <TableCell className="text-right">
                {masProbable.horasPorModulo[m]} h
              </TableCell>
              <TableCell className="text-right">
                {esperado.horasPorModulo[m].toFixed(1)} h
              </TableCell>
              <TableCell className="text-right">
                {fmtCrc.format(esperado.costoPorModulo[m])}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-3">
        <p className="text-xs font-semibold text-foreground">
          {alignMsg[resultado.alineacionM]}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t('fuenteOP', {
            fuente: fuenteOP === 'ia' ? t('fuente_ia') : t('fuente_fallback'),
          })}
        </p>
      </div>

      {stackContraste &&
        (stackContraste.coinciden.length > 0 ||
          stackContraste.faltantes.length > 0) && (
          <div className="space-y-1 text-xs">
            {stackContraste.coinciden.length > 0 && (
              <p className="text-primary">
                {t('stackCoinciden', {
                  techs: stackContraste.coinciden.join(', '),
                })}
              </p>
            )}
            {stackContraste.faltantes.length > 0 && (
              <p className="text-warning">
                {t('stackFaltantes', {
                  techs: stackContraste.faltantes.join(', '),
                })}
              </p>
            )}
          </div>
        )}

      {avisos.length > 0 && (
        <ul className="list-disc pl-4 text-xs text-muted-foreground">
          {avisos.map((a) => (
            <li key={a}>{avisoMsg(a)}</li>
          ))}
        </ul>
      )}

      <div className="space-y-1.5 rounded-lg border border-border/70 bg-card/40 p-3">
        <Label htmlFor="cotizacion-monto" className="text-sm font-bold">
          {t('montoFinalLabel')}
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">₡</span>
          <Input
            id="cotizacion-monto"
            type="number"
            inputMode="numeric"
            min={0}
            value={montoFinal}
            onChange={(e) => onMontoChange(e.target.value)}
            className="max-w-[200px]"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {t('montoFinalHelp', { beta: fmtCrc.format(esperado.totalCrc) })}
        </p>
        <p className="text-xs font-semibold text-muted-foreground">
          {t('noVinculante')}
        </p>
      </div>
    </div>
  )
}
