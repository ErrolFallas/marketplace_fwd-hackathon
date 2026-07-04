export type RolMensajeria = 'egresado' | 'empresario'

/**
 * Acento único de mensajería (§5.1). Egresado y empresario comparten el azul
 * FWD (`primary`), el token que el brief designa para "botones, links, acento".
 * El layout es idéntico entre ambos roles; el `rol` solo diferencia el copy
 * (i18n), no el color. Solo classnames tokenizadas, nunca hex.
 */
export interface AcentoMensajeria {
  filaActiva: string
  burbujaPropia: string
  spinnerBorde: string
  contadorPill: string
  texto: string
  textura: string
  botonEnviarVariant: 'accent' | 'default'
}

export const ACENTO_MENSAJERIA: AcentoMensajeria = {
  filaActiva: 'border-l-primary bg-primary/10',
  burbujaPropia: 'bg-primary text-primary-foreground',
  spinnerBorde: 'border-primary',
  contadorPill: 'bg-primary/15 text-primary',
  texto: 'text-primary',
  textura: 'bg-primary/10',
  botonEnviarVariant: 'default',
}
