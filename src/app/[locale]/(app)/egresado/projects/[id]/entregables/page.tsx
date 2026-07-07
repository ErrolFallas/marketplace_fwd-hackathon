import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * El entorno de trabajo del egresado se movió a `egresado/contrataciones/[id]`
 * (espejo del empresario). Este redirect conserva vivos los links viejos y
 * externos (correos/notificaciones) que apuntaban a la ruta anterior.
 */
export default async function EntregablesRedirectPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/egresado/contrataciones/${id}`)
}
