'use client'

import { useTranslations } from 'next-intl'

/**
 * Enlace de salto al contenido principal. Oculto hasta recibir foco por teclado
 * (primer tabulador de la página). El destino debe tener id="main-content".
 */
export function SkipToContent() {
  const t = useTranslations('Nav')
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {t('skipToContent')}
    </a>
  )
}
