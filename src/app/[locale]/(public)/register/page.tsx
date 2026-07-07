import { getLocale } from 'next-intl/server'
import { getCountryOptions } from '@/lib/geo/catalog'
import { RegisterWizard } from '@/components/features/auth/RegisterWizard'

/**
 * Registro (RF-01 / RF-02) como wizard de 3 pasos. Server component: resuelve el
 * catálogo de países al locale y lo pasa por props al wizard cliente (el JSON de
 * subdivisiones es server-only; las regiones se cargan bajo demanda por el route
 * handler `/api/geo/subdivisions`). La lógica de alta vive en `signUpWithPassword`.
 */
export default async function RegisterPage() {
  const locale = await getLocale()
  const countries = getCountryOptions(locale).map((country) => ({
    value: country.code,
    label: country.name,
  }))

  return <RegisterWizard countries={countries} />
}
