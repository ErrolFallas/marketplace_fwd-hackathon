import 'server-only'
import { getCotizadorGithubToken } from './config'
import {
  construirDetectadas,
  extraerDependencias,
  parseRepoUrl,
} from './github-logic'
import type { StackReport } from './types'
import { ok, err } from '@/lib/result'
import type { Result } from '@/lib/result'
import { logger } from '@/lib/logger'

/**
 * Lectura del stack de un repo PÚBLICO de GitHub (I/O). El host está PINEADO a
 * api.github.com (nunca se deriva de la URL del usuario) — anti-SSRF. Lee
 * /languages y /contents/package.json; nunca camina el árbol. Best-effort: ante
 * repo privado/inexistente, rate-limit o timeout devuelve err y el llamador
 * degrada (el cálculo sigue sin stack).
 */

const API_HOST = 'https://api.github.com'
const TIMEOUT_MS = 8_000
const MAX_PACKAGE_JSON_BYTES = 200_000

// Códigos de error posibles (E = string, convención del repo):
// 'url_invalida' | 'repo_no_encontrado' | 'limite_alcanzado' | 'sin_respuesta'.

function headers(): HeadersInit {
  const base: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'fwd-marketplace-cotizador',
  }
  const token = getCotizadorGithubToken()
  if (token) base.Authorization = `Bearer ${token}`
  return base
}

function pedir(path: string): Promise<Response> {
  return fetch(`${API_HOST}${path}`, {
    method: 'GET',
    headers: headers(),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
}

export async function leerStackRepo(url: string): Promise<Result<StackReport>> {
  const ref = parseRepoUrl(url)
  if (!ref) return err('url_invalida')
  const { owner, repo } = ref

  let lenguajes: string[] = []
  let dependencias: string[] = []

  // 1) Lenguajes (base del stack). Un fallo aquí sí degrada todo el reporte.
  try {
    const res = await pedir(`/repos/${owner}/${repo}/languages`)
    if (res.status === 404) return err('repo_no_encontrado')
    if (res.status === 403 || res.status === 429) return err('limite_alcanzado')
    if (!res.ok) return err('sin_respuesta')
    const data = (await res.json()) as Record<string, unknown>
    lenguajes = Object.keys(data ?? {})
  } catch (error) {
    logger.info('cotizador_github_languages_fail', {
      error: error instanceof Error ? error.message : String(error),
    })
    return err('sin_respuesta')
  }

  // 2) package.json (best-effort: puede no existir en repos no-JS o monorepos).
  try {
    const res = await pedir(`/repos/${owner}/${repo}/contents/package.json`)
    if (res.ok) {
      const data = (await res.json()) as {
        content?: string
        encoding?: string
        size?: number
      }
      if (
        data?.content &&
        data.encoding === 'base64' &&
        (data.size ?? 0) <= MAX_PACKAGE_JSON_BYTES
      ) {
        const raw = Buffer.from(data.content, 'base64').toString('utf-8')
        dependencias = extraerDependencias(raw)
      }
    }
  } catch (error) {
    logger.info('cotizador_github_pkg_fail', {
      error: error instanceof Error ? error.message : String(error),
    })
    // no-op: seguimos solo con los lenguajes.
  }

  return ok({
    owner,
    repo,
    lenguajes,
    dependencias,
    detectadas: construirDetectadas(lenguajes, dependencias),
  })
}
