-- ============================================================
-- Tanda B.1 (Etapa 2 Parte B) — Entregables 2-niveles: soporte de UI (aditiva)
-- Fecha: 2026-07-04
--
-- Completa la capa de datos para cablear el modelo tarea → propuestas:
--   1. `entregables.descripcion`: el "hice esto" de cada propuesta del egresado.
--   2. UPDATE policy en `entregable_tareas` para el empresario dueño: cierra la
--      tarea (estado -> 'aprobada') al aprobar su propuesta ganadora.
--
-- ADITIVA y retrocompatible: no dropea, no cambia `version`/UNIQUE ni el RPC
-- `finalizar_proyecto_por_entregable` (el hijo conserva `tipo_entregable`, así
-- que la finalización lee tipo del hijo sin cambios). NO es la Tanda 0.3.
-- Las reglas de negocio ("una propuesta abierta a la vez", "solo el empresario
-- da veredicto", "el egresado solo abre tareas parciales") se aplican en las
-- server actions; acá solo se abre el permiso mínimo.
-- ============================================================

-- 1. Descripción de la propuesta ------------------------------------------

alter table public.entregables
  add column if not exists descripcion text;

alter table public.entregables
  drop constraint if exists entregables_descripcion_chk;
alter table public.entregables
  add constraint entregables_descripcion_chk
  check (descripcion is null or char_length(descripcion) <= 2000);

comment on column public.entregables.descripcion is
  'Texto de la propuesta ("hice esto") que el egresado adjunta a cada ronda.';

-- 2. UPDATE policy de entregable_tareas para el empresario dueño -----------
-- El empresario cierra la tarea (estado -> 'aprobada') al aprobar su propuesta.
-- El egresado no actualiza tareas: solo las abre (INSERT) y sube propuestas.

drop policy if exists entregable_tareas_update on public.entregable_tareas;
create policy entregable_tareas_update on public.entregable_tareas
  for update
  using (
    current_user_is_verified()
    and id_contratacion in (
      select c.id_contratacion
      from public.contrataciones c
      join public.participaciones pa on pa.id_participacion = c.id_participacion
      join public.proyectos p on p.id_proyecto = pa.id_proyecto
      join public.empresarios e on e.id_empresario = p.id_empresario
      where e.id_usuario = (select auth.uid())
    )
  )
  with check (
    current_user_is_verified()
    and id_contratacion in (
      select c.id_contratacion
      from public.contrataciones c
      join public.participaciones pa on pa.id_participacion = c.id_participacion
      join public.proyectos p on p.id_proyecto = pa.id_proyecto
      join public.empresarios e on e.id_empresario = p.id_empresario
      where e.id_usuario = (select auth.uid())
    )
  );
