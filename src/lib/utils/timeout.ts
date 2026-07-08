/** Límite explícito para no dejar un botón de guardar colgado si un upload no responde. */
export const UPLOAD_TIMEOUT_MS = 20_000

/**
 * Corre `promise` con un límite de tiempo: si no resuelve/rechaza dentro de
 * `ms`, rechaza con `Error('upload_timeout')`. No cancela `promise` (fetch no
 * es cancelable acá), solo deja de esperarla.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error('upload_timeout')), ms)
    promise.then(
      (value) => {
        clearTimeout(timeoutId)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timeoutId)
        reject(error)
      },
    )
  })
}
