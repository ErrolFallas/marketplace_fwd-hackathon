import { notFound } from 'next/navigation'
import { ShowcaseClient } from './ShowcaseClient'

// Catálogo del design system (dev-only). Fuera de desarrollo la ruta no existe:
// en `next build` (NODE_ENV=production) `notFound()` la prerenderiza como 404 y
// el bundle del catálogo no se envía a producción. En `next dev` se renderiza.
export default function ShowcasePage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  return <ShowcaseClient />
}
