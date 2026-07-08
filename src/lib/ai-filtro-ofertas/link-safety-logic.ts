/**
 * Seguridad del link del prototipo — lógica PURA (sin red), testeable. Protege al
 * servidor y, en última instancia, al empresario: antes de que el backend haga
 * fetch de un URL escrito por el egresado, se rechaza todo lo que no sea https a
 * un host público (anti-SSRF, RNF-06). La comprobación de que el sitio RESPONDE y
 * la resolución DNS viven en link-check.ts (allí sí hay I/O).
 *
 * Nota: esto NO detecta malware ni phishing (fuera del brief); solo evita que el
 * link apunte a la red interna o use un esquema peligroso.
 */

export type MotivoLinkInvalido =
  | 'url_malformada'
  | 'esquema_no_https'
  | 'host_privado'

export type ResultadoValidacionLink =
  | { ok: true; url: URL }
  | { ok: false; motivo: MotivoLinkInvalido }

/** IPv4 en rango privado, loopback, link-local (metadata) o "this host". */
function esIpv4Bloqueada(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!m) return false
  const octetos = m.slice(1, 5).map((n) => Number(n))
  if (octetos.some((n) => n > 255)) return true // IP inválida: bloquear por las dudas
  const [a, b] = octetos as [number, number, number, number]
  if (a === 10) return true // 10.0.0.0/8
  if (a === 127) return true // loopback
  if (a === 0) return true // 0.0.0.0/8
  if (a === 169 && b === 254) return true // link-local + metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true // 172.16.0.0/12
  if (a === 192 && b === 168) return true // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true // CGNAT 100.64.0.0/10
  return false
}

/** IPv6 loopback/ULA/link-local (comparación laxa: ante duda, bloquear). */
function esIpv6Bloqueada(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, '').toLowerCase()
  if (h === '::1' || h === '::') return true
  if (h.startsWith('fe80')) return true // link-local
  if (h.startsWith('fc') || h.startsWith('fd')) return true // ULA fc00::/7
  if (h.startsWith('::ffff:')) return esIpv4Bloqueada(h.slice(7)) // IPv4-mapeada
  return false
}

/** ¿El hostname (nombre o IP literal) apunta a la red interna? */
export function esHostBloqueado(hostname: string): boolean {
  const host = hostname.trim().toLowerCase()
  if (host.length === 0) return true
  if (host === 'localhost' || host.endsWith('.localhost')) return true
  if (host.endsWith('.local') || host.endsWith('.internal')) return true
  if (esIpv4Bloqueada(host)) return true
  if (host.includes(':') || host.startsWith('[')) return esIpv6Bloqueada(host)
  return false
}

/**
 * Valida y normaliza un URL de prototipo para poder hacerle fetch con seguridad.
 * Exige https y host público. No comprueba que responda (eso es link-check).
 */
export function validarUrlPrototipo(raw: string): ResultadoValidacionLink {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return { ok: false, motivo: 'url_malformada' }
  }
  if (url.protocol !== 'https:') {
    return { ok: false, motivo: 'esquema_no_https' }
  }
  if (esHostBloqueado(url.hostname)) {
    return { ok: false, motivo: 'host_privado' }
  }
  return { ok: true, url }
}
