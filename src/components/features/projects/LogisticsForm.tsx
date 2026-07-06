'use client'

import { useState } from 'react'
import {
  useFormContext,
  useController,
  Controller,
  useWatch,
} from 'react-hook-form'
import { useTranslations, useLocale } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MODALIDADES,
  MONEDAS,
  parseMoney,
  parsePlazo,
  PLAZO_MAX_DIAS,
  PLAZO_MIN_DIAS,
  type LogisticsFormValues,
} from '@/lib/projects/schemas'
import {
  formatMoneyGrouped,
  sanitizeMoneyInput,
} from '@/lib/projects/budget-format'
import { CountryRegionFields } from '@/components/features/geo/CountryRegionFields'
import type { ComboboxOption } from '@/components/ui/combobox'

interface LogisticsFormProps {
  disabled: boolean
  todayIso: string
  countries: ComboboxOption[]
  initialRegions: ComboboxOption[]
}

/** Opciones del plazo de recepción (RF-21): 5..15 días. */
const PLAZO_OPCIONES = Array.from(
  { length: PLAZO_MAX_DIAS - PLAZO_MIN_DIAS + 1 },
  (_, i) => PLAZO_MIN_DIAS + i,
)

/**
 * Fecha de cierre estimada para mostrarle al empresario: `todayIso` + plazo, en
 * UTC (consistente server/cliente, sin desajuste de hidratación). Es solo una
 * referencia visual; la fecha real la fija el RPC con `now()` al publicar.
 */
function calcularCierreEstimado(
  todayIso: string,
  plazoDias: string,
  locale: string,
): string | null {
  const dias = parsePlazo(plazoDias)
  if (dias === null || dias < PLAZO_MIN_DIAS || dias > PLAZO_MAX_DIAS) {
    return null
  }
  const base = Date.parse(`${todayIso}T00:00:00.000Z`)
  if (Number.isNaN(base)) return null
  const cierre = new Date(base + dias * 86_400_000)
  return cierre.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function FieldError({ code }: { code?: string | undefined }) {
  const t = useTranslations('ProjectPublish')
  if (!code) return null
  return (
    <p className="text-xs font-semibold text-destructive">
      {t(`errors.${code}`)}
    </p>
  )
}

/**
 * Campo de monto: muestra el valor agrupado (1 000 000) cuando no está en
 * edición y el número crudo (1000000) mientras se escribe, así el cursor no
 * salta al insertar separadores (RF logística). El valor almacenado en el
 * formulario es siempre el crudo; el agrupado es puramente visual.
 */
function MoneyField({
  name,
  id,
  disabled,
  placeholder,
  locale,
  inputMode,
}: {
  name: 'presupuestoMin' | 'presupuestoMax'
  id: string
  disabled: boolean
  placeholder: string
  locale: string
  inputMode: 'numeric' | 'decimal'
}) {
  const { control } = useFormContext<LogisticsFormValues>()
  const { field, fieldState } = useController({ name, control })
  const [isEditing, setIsEditing] = useState(false)

  const monto = parseMoney(field.value)
  const valorMostrado =
    isEditing || monto === null || monto <= 0
      ? field.value
      : formatMoneyGrouped(monto, locale)

  return (
    <>
      <Input
        id={id}
        type="text"
        inputMode={inputMode}
        disabled={disabled}
        placeholder={placeholder}
        className="bg-card/50 border-border focus-visible:ring-primary"
        name={field.name}
        ref={field.ref}
        value={valorMostrado}
        onFocus={() => setIsEditing(true)}
        onChange={(event) =>
          field.onChange(sanitizeMoneyInput(event.target.value))
        }
        onBlur={() => {
          setIsEditing(false)
          field.onBlur()
        }}
      />
      <FieldError code={fieldState.error?.message} />
    </>
  )
}

/**
 * Pantalla 1 — logística (errolpendiente §1): modalidad, moneda, presupuesto,
 * fecha de cierre, país/ciudad (solo si la modalidad ≠ remoto) y `titulo`
 * OPCIONAL. El fondo (descripción, área, categorías, tecnologías) NO va acá: lo
 * produce la IA y se revisa en la propuesta (Pantalla 2).
 */
export function LogisticsForm({
  disabled,
  todayIso,
  countries,
  initialRegions,
}: LogisticsFormProps) {
  const t = useTranslations('ProjectPublish')
  const tCommon = useTranslations('Common')
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<LogisticsFormValues>()

  const locale = useLocale()
  const modalidad = useWatch({ control, name: 'modalidad' })
  const requiereUbicacion = modalidad !== '' && modalidad !== 'remoto'
  const paisIso = useWatch({ control, name: 'paisIso' })
  const region = useWatch({ control, name: 'region' })

  // En CRC solo enteros (céntimos en desuso); USD admite decimales. Define el
  // teclado numérico en móvil (`inputMode`); la validación dura de enteros y
  // rango vive en el schema/backend.
  const moneda = useWatch({ control, name: 'moneda' })
  const montoInputMode = moneda === 'CRC' ? 'numeric' : 'decimal'

  const plazoDias = useWatch({ control, name: 'plazoDias' })
  const cierreEstimado = calcularCierreEstimado(todayIso, plazoDias, locale)

  return (
    <section className="space-y-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {t('sectionLogistics')}
      </h2>

      <div className="space-y-2">
        <Label
          htmlFor="titulo"
          className="text-sm font-bold flex justify-between gap-2"
        >
          <span>{t('fieldTitle')}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {t('fieldTitleOptional')}
          </span>
        </Label>
        <Input
          id="titulo"
          type="text"
          disabled={disabled}
          placeholder={t('fieldTitlePlaceholder')}
          className="bg-card/50 border-border focus-visible:ring-primary"
          {...register('titulo')}
        />
        <FieldError code={errors.titulo?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="modalidad" className="text-sm font-bold">
          {t('fieldModality')}
        </Label>
        <Controller
          name="modalidad"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <SelectTrigger
                id="modalidad"
                className="w-full bg-card/50 border-border focus:ring-primary"
              >
                <SelectValue placeholder={t('fieldModalityPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {MODALIDADES.map((modo) => (
                  <SelectItem key={modo} value={modo}>
                    {tCommon(modo)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError code={errors.modalidad?.message} />
      </div>

      {requiereUbicacion && (
        <div className="space-y-2">
          <CountryRegionFields
            countries={countries}
            initialRegions={initialRegions}
            countryValue={paisIso ?? ''}
            regionValue={region ?? ''}
            onCountryChange={(code) =>
              setValue('paisIso', code, { shouldValidate: true })
            }
            onRegionChange={(code) =>
              setValue('region', code, { shouldValidate: true })
            }
            countryLabel={t('fieldCountry')}
            countryId="paisIso"
            regionId="region"
            disabled={disabled}
            countryInvalid={Boolean(errors.paisIso)}
          />
          <FieldError code={errors.paisIso?.message} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="moneda" className="text-sm font-bold">
            {t('fieldCurrency')}
          </Label>
          <Controller
            name="moneda"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger
                  id="moneda"
                  className="w-full bg-card/50 border-border focus:ring-primary"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONEDAS.map((codigo) => (
                    <SelectItem key={codigo} value={codigo}>
                      {codigo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="presupuestoMin" className="text-sm font-bold">
            {t('fieldBudgetMin')}
          </Label>
          <MoneyField
            name="presupuestoMin"
            id="presupuestoMin"
            disabled={disabled}
            placeholder={t('fieldBudgetPlaceholder')}
            locale={locale}
            inputMode={montoInputMode}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="presupuestoMax" className="text-sm font-bold">
            {t('fieldBudgetMax')}
          </Label>
          <MoneyField
            name="presupuestoMax"
            id="presupuestoMax"
            disabled={disabled}
            placeholder={t('fieldBudgetPlaceholder')}
            locale={locale}
            inputMode={montoInputMode}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="plazoDias" className="text-sm font-bold">
          {t('fieldDeadline')}
        </Label>
        <Controller
          name="plazoDias"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <SelectTrigger
                id="plazoDias"
                className="w-full bg-card/50 border-border focus:ring-primary"
              >
                <SelectValue placeholder={t('deadlinePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {PLAZO_OPCIONES.map((dias) => (
                  <SelectItem key={dias} value={String(dias)}>
                    {t('deadlineDays', { dias })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError code={errors.plazoDias?.message} />
        {cierreEstimado ? (
          <p className="text-xs text-muted-foreground">
            {t('deadlineEstimate', { fecha: cierreEstimado })}{' '}
            {t('deadlineEstimateHint')}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t('plazoHint', { min: PLAZO_MIN_DIAS, max: PLAZO_MAX_DIAS })}
          </p>
        )}
      </div>
    </section>
  )
}
