import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

interface ProjectEntregablesPageProps {
  params: Promise<{ id: string }>
}

/**
 * La zona de trabajo del empresario se consolidó en `contrataciones/[id]`
 * (keyeada por el id de proyecto, 1:1 con la contratación). Esta ruta antigua
 * de entregables redirige allí para no dejar dos pantallas compitiendo.
 */
export default async function ProjectEntregablesPage({
  params,
}: ProjectEntregablesPageProps) {
  const { id } = await params
  const locale = await getLocale()
  redirect(`/${locale}/empresario/contrataciones/${id}`)
}
