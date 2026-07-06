# Deuda: columnas legacy en el dominio de entregables

> Auditoría de datos hecha el 2026-07-06 sobre la BD real (`vnamdoocvzaholoftqja`, vía MCP
> read-only `fwd-db-env`). Documenta columnas/datos que la versión actual ya **no llena** pero
> que **no se deben dropear sin migración** cuidadosa. No es una tarea urgente: no rompe nada.

## Contexto

El dominio de entregables migró del **modelo plano** (una fila `entregables` = una versión, con un
archivo por fila) al **modelo de 2 niveles** (`entregable_tareas` padre → `entregables` propuesta,
con evidencia multi-archivo en `entregable_adjuntos` + `url_enlace`). El único camino que hoy crea
filas en `entregables` es `subirPropuesta` (`src/lib/deliverables/actions.ts`).

## Números de la auditoría (2026-07-06)

`entregables` (9 filas en total en la BD):

| Columna | Filas con dato | Estado |
|---|---|---|
| `archivo_url` | 5 / 9 | **Legacy pero SE LEE** — no dropear |
| `archivo_hash` | 3 / 9 | **Legacy y no se lee** — única dropeable (con cuidado) |
| `url_enlace` | 4 / 9 | Modelo nuevo (vivo) |
| `descripcion` | 4 / 9 | Modelo nuevo (vivo) |
| `id_tarea` null (huérfanos) | 0 / 9 | Sin huérfanos |
| `tipo_entregable = 'final'` | 2 / 9 | Valor legacy del enum |

`entregable_tareas`: 8 filas (6 `parcial`, 2 `final`). `entregable_adjuntos`: **0 filas**.

## Detalle por columna

### `entregables.archivo_url` — NO dropear
Legacy del modelo plano (lo llenaban `subirHito`/`subirEntregableFinal`, ya borradas). `subirPropuesta`
**no** lo escribe (los archivos van a `entregable_adjuntos`). PERO se **sigue leyendo** en
`getSignedUrlEntregable` (`queries.ts`) para descargar adjuntos de las contrataciones viejas
(las 5 filas). Dropearla rompe esas descargas.

### `entregables.archivo_hash` — dropeable con migración + verificación
Era el SHA-256 para deduplicar `archivo_url`. El código nuevo **ni la lee ni la escribe** (no aparece
en el dominio `deliverables`). Es la única candidata real a `DROP COLUMN`, pero: (1) migración por el
proceso con Samir, (2) `grep -r archivo_hash src/` de confirmación antes. Valor bajo (3 filas).

### `entregables.tipo_entregable` — la columna vive; solo el valor `final` es legacy
La columna se usa (`parcial`), como espejo de `entregable_tareas.tipo_entregable`. Desde el cambio a
"finalizar contratación global", `abrirTarea` inserta **siempre `parcial`**; el valor `final` (2 filas)
quedó de contrataciones viejas ya finalizadas. No se toca la columna.

## Dos hallazgos extra (no bloqueantes)

- **`entregable_adjuntos` = 0 filas:** la subida de archivos (PDF/imágenes) **nunca se usó** con datos
  reales — todas las evidencias fueron por `url_enlace` (link). No es legacy, es feature sin estrenar.
- **Huérfanos = 0:** `getEntregablesHuerfanos` y su sección de UI **nunca muestran nada** (el backfill
  asignó `id_tarea` a todas las filas). Es código de facto muerto; candidato a limpieza futura, pero
  requiere confirmar que ninguna contratación futura pueda volver a generar huérfanos.

## Recomendación

No dropear nada ahora. Si algún día se limpia: solo `archivo_hash`, por migración de Samir y con el
grep de confirmación. `archivo_url` se queda mientras existan descargas de filas viejas.

## Relacionado (resuelto en el mismo pase, 2026-07-06)

- Se borró `comentarEntregable` (server action huérfana tras quitar la pantalla vieja del empresario).
  Las 2 filas históricas `tipo_comentario = 'aclaracion'` que generó **se conservan** y se siguen
  mostrando en el hilo del entregable (historial válido).
- Se desduplicó `entregables.comentario_empresario`: el veredicto se guardaba literalmente en esa
  columna **y** en `comentarios_entregables` (7/7 exactos). Ahora el veredicto vive **solo** en el hilo
  `comentarios_entregables`: `responderEntregable` dejó de escribir la columna y se quitó el campo de los
  tipos/selects/mapeos del dominio `deliverables`. La columna **NO** se dropeó (las filas viejas conservan
  su dato); un `DROP COLUMN` futuro requeriría migración de Samir.
