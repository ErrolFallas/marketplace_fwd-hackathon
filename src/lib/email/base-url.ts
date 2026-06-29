import 'server-only'
import { headers } from 'next/headers'

/**
 * baseUrl absoluta del request (protocolo + host) para construir los links de
 * los correos. Lee los headers del request; cae a `localhost:3000` en dev sin
 * proxy. Compartida por los productores de correo (adjudicación, edición de
 * proyecto, mensajes, entregables) para no duplicar la resolución.
 */
export async function resolveBaseUrl(): Promise<string> {
  const reqHeaders = await headers()
  const host =
    reqHeaders.get('x-forwarded-host') ??
    reqHeaders.get('host') ??
    'localhost:3000'
  const proto = reqHeaders.get('x-forwarded-proto') ?? 'https'
  return `${proto}://${host}`
}
