import type { ContrasteStack } from './types'

/**
 * Lógica PURA de GitHub (sin red): valida/parsea la URL del repo con defensa
 * anti-SSRF, extrae dependencias de un package.json y contrasta el stack
 * detectado contra el requerido por el proyecto. El I/O real vive en github.ts.
 */

/** Solo repos de github.com; nada de hosts internos ni derivar el host de la URL. */
const GITHUB_URL_RE =
  /^https?:\/\/(www\.)?github\.com\/([\w.-]+)\/([\w.-]+?)(\.git)?\/?$/i

export interface RepoRef {
  owner: string
  repo: string
}

/** Devuelve {owner, repo} solo si la URL es un repo válido de github.com. */
export function parseRepoUrl(url: string): RepoRef | null {
  const m = GITHUB_URL_RE.exec(url.trim())
  if (!m) return null
  const owner = m[2]
  const repo = m[3]
  if (!owner || !repo) return null
  if ([owner, repo].some((s) => s === '.' || s === '..')) return null
  return { owner, repo }
}

/** Normaliza un nombre de tecnología para comparar sin ruido (Next.js → nextjs). */
export function normalizarNombre(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

const MAX_DEPS = 300

/** Extrae nombres de dependencies + devDependencies de un package.json crudo. */
export function extraerDependencias(packageJsonRaw: string): string[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(packageJsonRaw)
  } catch {
    return []
  }
  if (typeof parsed !== 'object' || parsed === null) return []
  const obj = parsed as Record<string, unknown>
  const nombres = new Set<string>()
  for (const clave of ['dependencies', 'devDependencies']) {
    const deps = obj[clave]
    if (typeof deps === 'object' && deps !== null) {
      for (const nombre of Object.keys(deps as Record<string, unknown>)) {
        if (nombre.trim()) nombres.add(nombre.trim())
        if (nombres.size >= MAX_DEPS) return [...nombres]
      }
    }
  }
  return [...nombres]
}

/** Une lenguajes + dependencias en el conjunto "detectadas" (sin duplicar). */
export function construirDetectadas(
  lenguajes: string[],
  dependencias: string[],
): string[] {
  const vistos = new Set<string>()
  const salida: string[] = []
  for (const nombre of [...lenguajes, ...dependencias]) {
    const norm = normalizarNombre(nombre)
    if (norm && !vistos.has(norm)) {
      vistos.add(norm)
      salida.push(nombre)
    }
  }
  return salida
}

/**
 * Contrasta el stack requerido por el proyecto contra el detectado (match laxo
 * por nombre, sin versiones). Advisory: es una señal, no un veredicto.
 */
export function contrastarStack(
  detectadas: string[],
  requeridas: string[],
): ContrasteStack {
  const detNorm = detectadas.map(normalizarNombre).filter(Boolean)
  const coinciden: string[] = []
  const faltantes: string[] = []
  for (const req of requeridas) {
    const reqNorm = normalizarNombre(req)
    if (!reqNorm) continue
    const hay = detNorm.some(
      (d) => d === reqNorm || d.includes(reqNorm) || reqNorm.includes(d),
    )
    if (hay) coinciden.push(req)
    else faltantes.push(req)
  }
  return { coinciden, faltantes }
}
