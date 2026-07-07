-- ============================================================
-- RF-53 réplica bidireccional: la EMPRESA responde la reseña del egresado
-- ------------------------------------------------------------
-- Hoy solo el egresado puede replicar (evaluaciones.respuesta_evaluado, con la
-- policy evaluaciones_update_respuesta). Espejamos eso en evaluaciones_empresarios
-- (egresado -> empresa) para que el empresario responda UNA vez la reseña que le
-- dejó el egresado. Comportamiento idéntico al del egresado; sin notificaciones.
--
-- 1. Columna de la réplica (nullable; null = sin responder).
-- 2. Policy de UPDATE espejo de evaluaciones_update_respuesta, pero para el
--    empresario dueño de la fila. NOTA de seguridad (igual que en evaluaciones):
--    la policy permite al evaluado actualizar CUALQUIER columna de su fila, no
--    solo respuesta_evaluado; la server action solo escribe la réplica. Endurecer
--    ambas tablas (GRANT column-level / trigger) queda como mejora futura común.

alter table public.evaluaciones_empresarios
  add column if not exists respuesta_evaluado text;

drop policy if exists "evaluaciones_empresarios_update_respuesta" on public.evaluaciones_empresarios;
create policy "evaluaciones_empresarios_update_respuesta"
  on public.evaluaciones_empresarios for update
  to authenticated
  using (
    id_empresario in (
      select id_empresario from public.empresarios
      where id_usuario = (select auth.uid())
    )
  )
  with check (
    id_empresario in (
      select id_empresario from public.empresarios
      where id_usuario = (select auth.uid())
    )
  );
