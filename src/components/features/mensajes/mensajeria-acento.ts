export type RolMensajeria = 'egresado' | 'empresario'

/**
 * Tokens de acento por rol (§5.1). El egresado usa teal (`accent`) y el
 * empresario azul (`primary`) como identidad de rol; el resto del layout es
 * idéntico entre ambos. Solo classnames tokenizadas, nunca hex.
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

export const ACENTO_POR_ROL: Record<RolMensajeria, AcentoMensajeria> = {
  egresado: {
    filaActiva: 'border-l-accent bg-accent/10',
    burbujaPropia: 'bg-accent text-accent-foreground',
    spinnerBorde: 'border-accent',
    contadorPill: 'bg-accent/15 text-accent',
    texto: 'text-accent',
    textura: 'bg-accent/10',
    botonEnviarVariant: 'accent',
  },
  empresario: {
    filaActiva: 'border-l-primary bg-primary/10',
    burbujaPropia: 'bg-primary text-primary-foreground',
    spinnerBorde: 'border-primary',
    contadorPill: 'bg-primary/15 text-primary',
    texto: 'text-primary',
    textura: 'bg-primary/10',
    botonEnviarVariant: 'default',
  },
}
