-- Elimina columnas legacy de `entregables` que la versión de 2 niveles ya no usa.
--
-- Auditoría de dependencias (2026-07-06, MCP read-only):
--
-- `archivo_hash`: SHA-256 para deduplicar `archivo_url` en el modelo plano. El código
--   nuevo NI la lee NI la escribe. Al dropearla, Postgres elimina automáticamente el
--   índice único parcial `entregables_contratacion_hash_uniq` (id_contratacion,
--   archivo_hash) — era el candado de dedup del modelo viejo, ya sin uso. Efecto esperado,
--   no requiere CASCADE ni falla.
--
-- `comentario_empresario`: el veredicto se desduplicó (ahora vive solo en
--   `comentarios_entregables`). La única dependencia era la RPC legacy
--   `finalizar_proyecto_por_entregable`, que ya NADIE invoca (0 llamadas en la app y 0 en
--   otras funciones/triggers; la reemplazó `finalizar_contratacion` global). Por eso esta
--   migración DROPEA esa función PRIMERO: sin eso, dropear la columna dejaría la función
--   rota en silencio (Postgres no valida cuerpos plpgsql al hacer DROP COLUMN, así que
--   fallaría recién al invocarla). Dropear la columna es DESTRUCTIVO del histórico, pero las
--   filas que la tenían coinciden 1:1 con su espejo en `comentarios_entregables` (verificado
--   2026-07-06), así que no se pierde el texto del veredicto.
--
-- NO se toca `archivo_url`: se lee en `getSignedUrlEntregable` para descargar adjuntos de
--   contrataciones viejas.
--
-- Verificado que NO dependen de estas columnas: vistas, RLS policies, columnas generadas,
-- constraints CHECK/UNIQUE (salvo el índice de hash, ya contemplado).
--
-- Tras aplicar: sincronizar `src/types/database.ts` — quitar `archivo_hash` y
-- `comentario_empresario` de las definiciones Row/Insert/Update de `entregables`, y quitar
-- la entrada de la función `finalizar_proyecto_por_entregable`.

-- 1. Quitar la RPC legacy que referencia comentario_empresario (sin invocadores).
drop function if exists public.finalizar_proyecto_por_entregable(uuid, text);

-- 2. Dropear las columnas legacy (archivo_hash arrastra su índice de dedup).
alter table public.entregables
  drop column if exists archivo_hash,
  drop column if exists comentario_empresario;
