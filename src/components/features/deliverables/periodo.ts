/**
 * Estilo y clave i18n del badge de `estado_periodo` de una contratación
 * (vigente | pausado | finalizado | cancelado). Centraliza el mapeo que antes
 * estaba duplicado en EntregablesClient y MisContratacionesList.
 */
export const PERIODO_STYLE: Record<string, string> = {
  vigente: 'text-accent border-accent/40 bg-accent/10',
  pausado: 'text-warning border-warning/40 bg-warning/10',
  finalizado: 'text-primary border-primary/40 bg-primary/10',
  cancelado: 'text-magenta border-magenta/40 bg-magenta/10',
}

export const PERIODO_LABEL_KEY: Record<string, string> = {
  vigente: 'periodoVigente',
  pausado: 'periodoPausado',
  finalizado: 'periodoFinalizado',
  cancelado: 'periodoCancelado',
}
