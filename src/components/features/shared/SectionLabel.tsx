import React from 'react'

/**
 * Separador con etiqueta centrada para marcar zonas de una credencial o perfil.
 * Lenguaje visual compartido entre el perfil del egresado y el del empresario:
 * dos líneas finas con una etiqueta en mayúsculas al centro. La variante
 * `accent` la tiñe de teal para destacar una zona distinta.
 */
export function SectionLabel({
  children,
  icon,
  accent = false,
}: {
  children: React.ReactNode
  icon?: React.ReactNode
  accent?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-px flex-1 ${accent ? 'bg-accent/40' : 'bg-primary/20'}`}
      />
      <div
        className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest font-display ${
          accent ? 'text-accent' : 'text-primary/70'
        }`}
      >
        {icon}
        {children}
      </div>
      <div
        className={`h-px flex-1 ${accent ? 'bg-accent/40' : 'bg-primary/20'}`}
      />
    </div>
  )
}
