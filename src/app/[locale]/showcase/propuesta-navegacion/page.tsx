import { notFound } from 'next/navigation'
import { NavegacionPreview } from './NavegacionPreview'

// Prototipo dev-only de la Fase 2 (navbar + sidebars unificados). Igual que el
// resto del showcase: fuera de desarrollo `notFound()` lo deja en 404.
export default function PropuestaNavegacionPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  return (
    <main className="min-h-screen bg-canvas px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ink-strong">
            Propuesta de navegación<span className="text-primary">.</span>
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Prototipo dev-only de la Fase 2: navbar y un sidebar unificado
            (AppSidebar) para egresado y empresario. Mejoras: jerarquía,
            contraste sobre morado, versión móvil del egresado y consistencia
            entre roles.
          </p>
        </header>
        <NavegacionPreview />
      </div>
    </main>
  )
}
