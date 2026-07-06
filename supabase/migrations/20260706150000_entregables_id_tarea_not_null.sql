-- Endurece `entregables.id_tarea` a NOT NULL.
--
-- Contexto: el modelo de entregables de 2 niveles (entregable_tareas -> entregables)
-- reemplazó al modelo plano. `subirPropuesta` SIEMPRE setea `id_tarea`, y las
-- funciones legacy que insertaban sin tarea (`subirHito`/`subirEntregableFinal`) ya
-- no existen. El backfill dejó 0 huérfanos. Este constraint es el candado a nivel de
-- esquema: la BD rechaza cualquier entregable sin tarea (antes solo lo garantizaba el
-- código de la app).
--
-- Requisito verificado (2026-07-06, MCP read-only): 0 filas con `id_tarea` null.
-- Si en el futuro reaparecieran huérfanos, el guard de abajo aborta con un mensaje
-- claro en vez de dejar el ALTER a medias.

do $$
begin
  if exists (select 1 from public.entregables where id_tarea is null) then
    raise exception 'No se puede aplicar NOT NULL: hay entregables con id_tarea null (huérfanos). Backfillear id_tarea antes de esta migración.';
  end if;
end $$;

alter table public.entregables
  alter column id_tarea set not null;
