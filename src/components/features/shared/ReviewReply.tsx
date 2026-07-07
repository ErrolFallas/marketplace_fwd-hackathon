interface ReviewReplyProps {
  /** Etiqueta de la réplica (i18n propio de cada superficie). */
  label: string
  /** Texto de la réplica del evaluado. */
  text: string
}

/**
 * Caja read-only de la réplica del evaluado a una reseña (RF-53). Estilo único
 * para las tres superficies; la variante editable la aporta cada superficie por
 * separado (p. ej. `CompanyReviewReplyBox`).
 */
export function ReviewReply({ label, text }: ReviewReplyProps) {
  return (
    <div
      className="rounded-lg border border-primary/20 px-3 py-2.5"
      style={{
        background: 'color-mix(in oklch, var(--primary) 6%, transparent)',
      }}
    >
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-primary">
        {label}
      </span>
      <p className="text-xs italic leading-relaxed text-foreground/85 prose-body">
        {text}
      </p>
    </div>
  )
}
