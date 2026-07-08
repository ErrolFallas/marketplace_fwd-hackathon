'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Calculator, ChevronDown, Download, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CotizacionBreakdown } from './CotizacionBreakdown'
import { useCotizadorPert } from './use-cotizador-pert'
import { calcularCotizacion } from '@/lib/cotizador-pert/pert-logic'
import { cotizarConIA } from '@/lib/cotizador-pert/actions'
import { generarCotizacionPdf } from '@/lib/cotizador-pert/pdf/cotizacion-pdf'
import type { CotizacionPdfTextos } from '@/lib/cotizador-pert/pdf/cotizacion-pdf'
import { TC_REF } from '@/lib/cotizador-pert/constants'
import { MODULOS_PERT } from '@/lib/cotizador-pert/types'
import type {
  CotizadorInput,
  Idioma,
  ModuloPert,
  TipoDespliegue,
} from '@/lib/cotizador-pert/types'

interface Props {
  projectId: string
  projectTitle: string
  projectCompanyName: string
  /** URL del prototipo (campo del formulario): va como nota en el PDF. */
  prototipoUrl: string
  /** Estado del consentimiento IA del formulario: gatea el botón de IA. */
  consintioIa: boolean
  /** Sube al padre el monto elegido (₡) para adjuntarlo a la postulación. */
  onMontoChange: (montoCrc: number | null) => void
  /** Sube al padre el PDF si el egresado decide adjuntarlo (opt-in), o null. */
  onPdfChange: (pdf: File | null) => void
}

/**
 * Sección OPCIONAL y colapsable del cotizador PERT, embebida en el formulario de
 * postulación. El cálculo es determinista y se ve al instante SIN IA; el botón
 * "Estimar con IA" solo afina los rangos O/P y lee el stack de GitHub. El PDF y
 * su adjunto son opt-in: el egresado decide si lo sube. Nunca bloquea el envío.
 */
export function CotizadorPert({
  projectId,
  projectTitle,
  projectCompanyName,
  prototipoUrl,
  consintioIa,
  onMontoChange,
  onPdfChange,
}: Props) {
  const t = useTranslations('CotizadorPert')
  const [abierto, setAbierto] = useState(false)
  const [cargandoIa, setCargandoIa] = useState(false)
  const [generandoPdf, setGenerandoPdf] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [adjuntarPdf, setAdjuntarPdf] = useState(false)
  const [state, dispatch] = useCotizadorPert()

  const moduloLabel: Record<ModuloPert, string> = {
    analisis_diseno: t('modulo_analisis_diseno'),
    frontend: t('modulo_frontend'),
    backend: t('modulo_backend'),
    base_datos: t('modulo_base_datos'),
    pruebas_calidad: t('modulo_pruebas_calidad'),
    despliegue: t('modulo_despliegue'),
  }

  const input: CotizadorInput = useMemo(
    () => ({
      horasM: state.horasM,
      idioma: state.idioma,
      despliegue: {
        tipo: state.despliegueTipo,
        costoServerUsdMes: state.serverUsdMes,
        mesesCobertura: state.mesesCobertura,
      },
      suscripciones: state.suscripciones,
    }),
    [
      state.horasM,
      state.idioma,
      state.despliegueTipo,
      state.serverUsdMes,
      state.mesesCobertura,
      state.suscripciones,
    ],
  )

  const resultado = useMemo(
    () =>
      calcularCotizacion(input, state.propuestaIa ?? undefined, state.fuenteOP),
    [input, state.propuestaIa, state.fuenteOP],
  )

  const esperadoCrc = Math.round(resultado.escenarios.esperado.totalCrc)
  const montoCrc =
    Number(state.montoFinal) > 0
      ? Math.round(Number(state.montoFinal))
      : esperadoCrc

  // Autorrellena el monto con el esperado (Beta) mientras el egresado no lo edite.
  useEffect(() => {
    if (!state.montoTocado) {
      dispatch({
        type: 'montoFinal',
        valor: String(esperadoCrc),
        tocado: false,
      })
    }
  }, [esperadoCrc, state.montoTocado, dispatch])

  // Sube el monto al padre para adjuntarlo a la postulación.
  useEffect(() => {
    const n = Number(state.montoFinal)
    onMontoChange(
      state.montoFinal.trim() !== '' && Number.isFinite(n) && n > 0
        ? Math.round(n)
        : null,
    )
  }, [state.montoFinal, onMontoChange])

  // Anti-stale del PDF: cualquier cambio en insumos o monto invalida el PDF ya
  // generado (evita adjuntar un desglose que no corresponde a lo actual).
  useEffect(() => {
    setPdfFile(null)
    setAdjuntarPdf(false)
  }, [input, state.montoFinal])

  // Sube el PDF al padre solo si el egresado lo generó y marcó adjuntarlo.
  useEffect(() => {
    onPdfChange(adjuntarPdf && pdfFile ? pdfFile : null)
  }, [adjuntarPdf, pdfFile, onPdfChange])

  const totalHoras = MODULOS_PERT.reduce(
    (acc, m) => acc + (state.horasM[m] || 0),
    0,
  )

  const handleEstimarIa = async () => {
    if (!consintioIa) {
      toast.error(t('requiereConsentimiento'))
      return
    }
    if (totalHoras <= 0) {
      toast.error(t('requiereHoras'))
      return
    }
    setCargandoIa(true)
    try {
      const res = await cotizarConIA({
        id_proyecto: projectId,
        horas_m: state.horasM,
        github_url: state.githubUrl.trim() || undefined,
        consentimiento_ia: consintioIa,
      })
      if (res.ok) {
        dispatch({ type: 'iaResult', valor: res.data })
        toast.success(t('iaListo'))
      } else {
        toast.error(t('iaError'))
      }
    } catch {
      toast.error(t('iaError'))
    } finally {
      setCargandoIa(false)
    }
  }

  const handleGenerarPdf = async () => {
    if (totalHoras <= 0) {
      toast.error(t('requiereHoras'))
      return
    }
    setGenerandoPdf(true)
    try {
      const textos: CotizacionPdfTextos = {
        titulo: t('pdfTitulo'),
        subtitulo: t('pdfSubtitulo', {
          proyecto: projectTitle,
          empresa: projectCompanyName,
        }),
        montoLabel: t('montoFinalLabel'),
        escenariosTitulo: t('pdfEscenarios'),
        optimista: t('escOptimista'),
        masProbable: t('escMasProbable'),
        esperado: t('escEsperado'),
        pesimista: t('escPesimista'),
        colModulo: t('colModulo'),
        colHorasM: t('colHorasM'),
        colBetaH: t('colBetaH'),
        colCosto: t('colCosto'),
        totalLabel: t('pdfTotal'),
        notasTitulo: t('pdfNotas'),
        githubLabel: t('githubLabel'),
        prototipoLabel: t('prototipoLabel'),
        usuarioPruebaLabel: t('usuarioPruebaLabel'),
        noVinculante: t('noVinculante'),
        moduloLabels: moduloLabel,
      }
      const blob = await generarCotizacionPdf({
        resultado,
        montoCrc,
        tcRef: TC_REF,
        githubUrl: state.githubUrl,
        prototipoUrl,
        usuarioPruebaJson: state.usuarioPruebaJson,
        textos,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cotizacion-fwd.pdf'
      a.click()
      URL.revokeObjectURL(url)
      setPdfFile(
        new File([blob], 'cotizacion-fwd.pdf', { type: 'application/pdf' }),
      )
    } catch {
      toast.error(t('pdfError'))
    } finally {
      setGenerandoPdf(false)
    }
  }

  const numOrCero = (v: string) => Math.max(0, Number(v) || 0)

  return (
    <div className="rounded-xl border border-dashed border-border/70 bg-muted/20">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex w-full items-center justify-between gap-2 p-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Calculator className="h-4 w-4 text-primary" />
          {t('titulo')}
          <span className="text-xs font-normal text-muted-foreground">
            {t('opcional')}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            abierto ? 'rotate-180' : ''
          }`}
        />
      </button>

      {abierto && (
        <div className="space-y-5 border-t border-border/60 p-4">
          <p className="text-xs text-muted-foreground">{t('intro')}</p>

          <div className="space-y-2">
            <Label className="text-sm font-bold">{t('horasTitulo')}</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {MODULOS_PERT.map((m) => (
                <div
                  key={m}
                  className="flex items-center justify-between gap-2"
                >
                  <Label htmlFor={`h-${m}`} className="text-xs">
                    {moduloLabel[m]}
                  </Label>
                  <Input
                    id={`h-${m}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="0"
                    value={state.horasM[m] === 0 ? '' : state.horasM[m]}
                    onChange={(e) =>
                      dispatch({
                        type: 'hora',
                        modulo: m,
                        valor: numOrCero(e.target.value),
                      })
                    }
                    className="max-w-[100px]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">{t('idiomaLabel')}</Label>
              <Select
                value={state.idioma}
                onValueChange={(v) =>
                  dispatch({ type: 'idioma', valor: v as Idioma })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">{t('idioma_es')}</SelectItem>
                  <SelectItem value="bilingue">
                    {t('idioma_bilingue')}
                  </SelectItem>
                  <SelectItem value="ingles">{t('idioma_ingles')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">
                {t('despliegueLabel')}
              </Label>
              <Select
                value={state.despliegueTipo}
                onValueChange={(v) =>
                  dispatch({
                    type: 'despliegueTipo',
                    valor: v as TipoDespliegue,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gratuito">
                    {t('despliegue_gratuito')}
                  </SelectItem>
                  <SelectItem value="pago">{t('despliegue_pago')}</SelectItem>
                  <SelectItem value="propio">
                    {t('despliegue_propio')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {state.despliegueTipo === 'pago' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="server-usd" className="text-xs">
                  {t('serverUsdLabel')}
                </Label>
                <Input
                  id="server-usd"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={state.serverUsdMes === 0 ? '' : state.serverUsdMes}
                  onChange={(e) =>
                    dispatch({
                      type: 'server',
                      valor: numOrCero(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meses" className="text-xs">
                  {t('mesesLabel')}
                </Label>
                <Input
                  id="meses"
                  type="number"
                  min={1}
                  value={state.mesesCobertura}
                  onChange={(e) =>
                    dispatch({
                      type: 'meses',
                      valor: numOrCero(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-bold">{t('subsTitulo')}</Label>
            <div className="space-y-1.5">
              {state.suscripciones.map((s, i) => (
                <div key={s.nombre} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={s.activa}
                    onChange={() => dispatch({ type: 'toggleSub', index: i })}
                    className="h-4 w-4 rounded border-border accent-primary"
                    aria-label={s.nombre}
                  />
                  <span className="flex-1 text-xs text-foreground">
                    {s.nombre}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={s.costoUsdMes}
                    disabled={!s.activa}
                    onChange={(e) =>
                      dispatch({
                        type: 'subCosto',
                        index: i,
                        valor: numOrCero(e.target.value),
                      })
                    }
                    className="h-8 max-w-[90px]"
                  />
                  <span className="text-xs text-muted-foreground">
                    {t('usdMes')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border/60 bg-card/40 p-3">
            <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Sparkles className="h-4 w-4 text-secondary" />
              {t('iaTitulo')}
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="github-url" className="text-xs">
                {t('githubLabel')}
              </Label>
              <Input
                id="github-url"
                type="url"
                placeholder="https://github.com/usuario/repo"
                value={state.githubUrl}
                onChange={(e) =>
                  dispatch({ type: 'githubUrl', valor: e.target.value })
                }
              />
              <p className="text-[11px] text-muted-foreground">
                {t('githubHelp')}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="test-user" className="text-xs">
                {t('usuarioPruebaLabel')}
              </Label>
              <Textarea
                id="test-user"
                rows={2}
                placeholder='{"email":"...","password":"..."}'
                value={state.usuarioPruebaJson}
                onChange={(e) =>
                  dispatch({ type: 'usuarioPrueba', valor: e.target.value })
                }
              />
              <p className="text-[11px] text-muted-foreground">
                {t('usuarioPruebaHelp')}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleEstimarIa}
              disabled={cargandoIa || !consintioIa}
              className="flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              {cargandoIa ? t('iaCargando') : t('iaCta')}
            </Button>
            {!consintioIa && (
              <p className="text-[11px] text-warning">
                {t('requiereConsentimiento')}
              </p>
            )}
          </div>

          <CotizacionBreakdown
            resultado={resultado}
            montoFinal={state.montoFinal}
            onMontoChange={(v) =>
              dispatch({ type: 'montoFinal', valor: v, tocado: true })
            }
            stackContraste={state.contraste}
            avisos={state.avisos}
            fuenteOP={state.fuenteOP}
          />

          {/* PDF de desglose: opt-in, el egresado decide si lo adjunta. */}
          <div className="space-y-2 border-t border-border/60 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerarPdf}
              disabled={generandoPdf}
              className="flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              {generandoPdf ? t('pdfGenerando') : t('pdfCta')}
            </Button>
            {pdfFile && (
              <label className="flex items-start gap-2.5 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={adjuntarPdf}
                  onChange={(e) => setAdjuntarPdf(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
                />
                <span>{t('adjuntarPdfLabel')}</span>
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
