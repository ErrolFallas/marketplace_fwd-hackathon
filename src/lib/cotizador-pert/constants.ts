import type { Idioma, Suscripcion } from './types'

/**
 * Datos duros de la calculadora, tomados del doc de metodología
 * (docs/informativos/cotizacion_freelancer.md, Costa Rica 2025), salvo donde se
 * marca DECISIÓN (de producto). Todas son constantes editables en un solo lugar.
 */

/**
 * Tarifa plana junior, igual para todos ("todos iguales ante la experiencia,
 * solo el trabajo"). DECISIÓN: el doc deja la tarifa libre (sus ejemplos usan
 * ₡15.000); aquí se fija en la banda junior / mínimo-viable.
 */
export const TARIFA_HORA_CRC = 8_000

/** Tipo de cambio ₡/$ de referencia (doc §3.1). */
export const TC_REF = 520

/** Recargo por idioma (doc §2.3). */
export const IDIOMA_MULT: Record<Idioma, number> = {
  es: 1.0,
  bilingue: 1.1,
  ingles: 1.2,
}

/** Margen de utilidad sobre el subtotal (doc §8.2). */
export const MARGEN_PCT = 0.3

/** Recargo de gestión sobre las horas de despliegue gratuito (doc §3.5). */
export const RECARGO_DEPLOY_GRATUITO = 0.15

/**
 * Buffer de contingencia (doc §8.1). INFORMATIVO: NO infla el precio. El rango
 * O/M/P del PERT ya captura la incertidumbre; cobrar buffer encima la duplicaría
 * (el propio ejemplo §6.2 del doc arma el subtotal con las horas base, no con
 * las horas con buffer). Se muestra solo como referencia ("≈ N meses").
 */
export const BUFFER_PCT = 0.2

/** Horas facturables/mes de referencia (doc §1.3), para el sanity "≈ N meses". */
export const H_MES_REF = 140

/** Factores del fallback fail-open cuando la IA no propone O/P. */
export const O_FACTOR = 0.8
export const P_FACTOR = 1.5

/** Umbral de divergencia cobro-M vs cobro-Beta para la línea de reconciliación. */
export const RECONCILIACION_UMBRAL_PCT = 0.1

/** Tope defensivo de horas por módulo (evita totales absurdos / IA maliciosa). */
export const MAX_HORAS_MODULO = 2_000

/** Catálogo de suscripciones de referencia (doc §5), en USD/mes. */
export const CATALOGO_SUSCRIPCIONES: ReadonlyArray<
  Omit<Suscripcion, 'activa'>
> = [
  { nombre: 'Pasarela de pagos (Stripe/PayPal)', costoUsdMes: 25 },
  { nombre: 'Correo/SMTP (SendGrid/Resend)', costoUsdMes: 20 },
  { nombre: 'Mapas/geolocalización (Google Maps)', costoUsdMes: 50 },
  { nombre: 'API de IA (OpenAI/Anthropic)', costoUsdMes: 30 },
  { nombre: 'BD gestionada (Supabase/PlanetScale)', costoUsdMes: 25 },
  { nombre: 'Autenticación (Auth0/Clerk)', costoUsdMes: 35 },
  { nombre: 'Monitoreo (Sentry/Datadog)', costoUsdMes: 30 },
  { nombre: 'CDN/almacenamiento (Cloudflare/S3)', costoUsdMes: 25 },
]
