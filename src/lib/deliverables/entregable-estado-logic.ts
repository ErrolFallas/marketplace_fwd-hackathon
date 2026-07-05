/**
 * Estado "de cara al usuario" de un entregable (tarea nivel 1), derivado de su
 * propia `estado` y de la última propuesta. Determina el badge de la lista y si
 * el egresado todavía puede subir otra propuesta o es solo lectura.
 *
 * - `cerrada`         → la tarea fue aprobada (fin del ciclo de ese entregable).
 * - `en_revision`     → hay una propuesta esperando veredicto del empresario.
 * - `requiere_cambios`→ la última propuesta pidió cambios; falta re-subir.
 * - `abierta`         → sin propuestas todavía (o listo para la primera ronda).
 */
export type EstadoEntregable =
  | 'abierta'
  | 'en_revision'
  | 'requiere_cambios'
  | 'cerrada'

export function computeEstadoEntregable(
  estadoTarea: string,
  propuestas: { estado: string; cargado_at: string }[],
): EstadoEntregable {
  if (estadoTarea === 'aprobada') return 'cerrada'

  const ultima = [...propuestas].sort((a, b) =>
    b.cargado_at.localeCompare(a.cargado_at),
  )[0]
  if (!ultima) return 'abierta'
  if (ultima.estado === 'enviado' || ultima.estado === 'en_revision') {
    return 'en_revision'
  }
  if (ultima.estado === 'con_cambios') return 'requiere_cambios'
  return 'abierta'
}
