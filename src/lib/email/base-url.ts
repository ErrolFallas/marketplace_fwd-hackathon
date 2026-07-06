import 'server-only'
import { headers } from 'next/headers'
import { serverEnv } from '@/lib/env.server'

/**
 * baseUrl absoluta para construir los enlaces de los correos. Orden de
 * prioridad:
 *
 *  1. `NEXT_PUBLIC_APP_URL` — URL pública canónica del sitio desplegado. Gana en
 *     producción y en cualquier acción disparada desde una consola que no sea la
 *     web pública (p. ej. un admin operando desde localhost), para que el correo
 *     nunca lleve un enlace a localhost.
 *  2. Host del request (`x-forwarded-host` / `host`) — cuando la var no está.
 *  3. `localhost:3000` — último recurso en dev sin proxy.
 *
 * Solo para enlaces informativos (adjudicación, edición de proyecto, mensajes,
 * entregables, invitación admin, cuenta verificada). Los flujos de auth con
 * intercambio de código (PKCE: reset de contraseña, magic link, OAuth) NO usan
 * esto: deben volver al mismo origen donde arrancaron.
 */
export async function resolveBaseUrl(): Promise<string> {
  const configured = serverEnv.NEXT_PUBLIC_APP_URL
  if (configured) return configured.replace(/\/+$/, '')

  const reqHeaders = await headers()
  const host =
    reqHeaders.get('x-forwarded-host') ??
    reqHeaders.get('host') ??
    'localhost:3000'
  const proto = reqHeaders.get('x-forwarded-proto') ?? 'https'
  return `${proto}://${host}`
}
