import type { Currency } from '@/types'

/**
 * Formateo de presupuesto para display. Puro (solo `Intl`), sin i18n: las
 * plantillas de texto las inyecta el componente que sí tiene el traductor.
 * Reutilizado por la tarjeta y el detalle del marketplace para que la moneda
 * real del proyecto (USD o CRC) no se muestre siempre como dólares.
 */

/** Formatea un monto con su moneda, sin decimales. */
export function formatMoney(
  amount: number,
  currency: Currency,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export interface BudgetLabelTexts {
  /** Plantilla "Desde X" ya interpolada por el caller. */
  from: (amount: string) => string
  /** Plantilla "Hasta X" ya interpolada por el caller. */
  to: (amount: string) => string
  /** Texto cuando el proyecto no trae ninguna cota de presupuesto. */
  fallback: string
}

/**
 * Etiqueta según el rango disponible: ambos → "min – max"; solo uno →
 * "Desde/Hasta X"; ninguno → `fallback`. La moneda es la real del proyecto.
 */
export function formatBudgetLabel(
  budgetMin: number | null,
  budgetMax: number | null,
  currency: Currency,
  locale: string,
  texts: BudgetLabelTexts,
): string {
  const fmt = (value: number) => formatMoney(value, currency, locale)
  if (budgetMin !== null && budgetMax !== null) {
    return `${fmt(budgetMin)} – ${fmt(budgetMax)}`
  }
  if (budgetMin !== null) return texts.from(fmt(budgetMin))
  if (budgetMax !== null) return texts.to(fmt(budgetMax))
  return texts.fallback
}

/**
 * Deja en el texto solo lo que `Number`/`parseMoney` entienden: dígitos y un
 * único punto decimal. Descarta separadores de miles, espacios y letras. Se usa
 * al escribir el monto para guardar siempre el número crudo; el agrupado es
 * presentación.
 */
export function sanitizeMoneyInput(raw: string): string {
  const soloValidos = raw.replace(/[^\d.]/g, '')
  const [entera = '', ...resto] = soloValidos.split('.')
  return resto.length === 0 ? soloValidos : `${entera}.${resto.join('')}`
}

/**
 * Formatea un monto con separadores de miles según el locale, SIN símbolo de
 * moneda y sin redondear centavos (hasta 2 decimales). Ayuda visual dentro del
 * campo de monto para leer la magnitud (miles vs millones) sin contar ceros.
 */
export function formatMoneyGrouped(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(amount)
}
