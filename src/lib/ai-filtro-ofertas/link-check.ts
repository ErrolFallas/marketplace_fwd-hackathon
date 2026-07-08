import 'server-only'
import { lookup } from 'node:dns/promises'
import { esHostBloqueado, validarUrlPrototipo } from './link-safety-logic'
import { logger } from '@/lib/logger'

/**
 * Comprobación de que el link del prototipo RESPONDE (I/O). Complementa a
 * link-safety-logic (validación de forma) con la parte de red: resuelve DNS y
 * rechaza si el host apunta a una IP interna (SSRF con hostname público), luego
 * hace fetch siguiendo redirects a mano y validando cada salto.
 *
 * Clasificación deliberada (evita falsos bloqueos por anti-bot de Vercel/
 * Netlify/Cloudflare): CUALQUIER respuesta HTTP (2xx/3xx/4xx/5xx, incluidos
 * 401/403/429) cuenta como 'vivo' — el servidor existe y el empresario con su
 * browser va a entrar. Solo 'sin_respuesta' cuando no hay respuesta alguna: DNS
 * falla, conexión rechazada, timeout total o redirect a host interno.
 */

export type EstadoLink = 'vivo' | 'sin_respuesta'

const TIMEOUT_MS = 8_000
const MAX_REDIRECTS = 4
// UA de browser real: reduce que un host devuelva un bloqueo distinto a un bot.
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

/** ¿Alguna IP a la que resuelve el host está en un rango interno? (anti-SSRF). */
async function resuelveAHostInterno(hostname: string): Promise<boolean> {
  try {
    const direcciones = await lookup(hostname, { all: true })
    return direcciones.some((d) => esHostBloqueado(d.address))
  } catch {
    // No resuelve DNS: el fetch fallará y se clasifica sin_respuesta más abajo.
    return false
  }
}

/**
 * Verifica que el link esté vivo. Asume que `rawUrl` ya pasó validarUrlPrototipo
 * en el gate; igual revalida cada salto de redirect por seguridad.
 */
export async function verificarLinkVivo(rawUrl: string): Promise<EstadoLink> {
  let actual = rawUrl
  for (let salto = 0; salto <= MAX_REDIRECTS; salto++) {
    const validado = validarUrlPrototipo(actual)
    if (!validado.ok) return 'sin_respuesta'
    if (await resuelveAHostInterno(validado.url.hostname)) {
      logger.warn('filtro_ofertas_link_ssrf', { host: validado.url.hostname })
      return 'sin_respuesta'
    }

    let res: Response
    try {
      res = await fetch(validado.url, {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { 'User-Agent': BROWSER_UA, Accept: '*/*' },
      })
    } catch (error) {
      logger.info('filtro_ofertas_link_sin_respuesta', {
        error: error instanceof Error ? error.message : String(error),
      })
      return 'sin_respuesta'
    }

    // No consumimos el cuerpo: solo interesa el estado/headers.
    void res.body?.cancel()

    const esRedirect = res.status >= 300 && res.status < 400
    const location = res.headers.get('location')
    if (esRedirect && location) {
      actual = new URL(location, validado.url).toString()
      continue
    }
    // Cualquier respuesta HTTP no-redirect (o redirect sin Location) = vivo.
    return 'vivo'
  }
  // Demasiados redirects: el servidor responde, así que cuenta como vivo.
  return 'vivo'
}
