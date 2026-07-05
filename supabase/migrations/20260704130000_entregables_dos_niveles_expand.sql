-- ============================================================
-- Tanda 0.2 — Entregables a 2 niveles (fase EXPAND, aditiva)
-- Fecha: 2026-07-04
--
-- Modelo nuevo (decidido): una TAREA (entregable) agrupa varias PROPUESTAS
-- (las filas de `entregables`, que ya existen). La tarea la abre el empresario
-- ("quiero esto") o el egresado ("hice esto"); el empresario elige parcial/final
-- y da el veredicto de cada propuesta; lo rechazado queda como historial.
--
-- Estrategia expand-and-contract (veredicto del consejo): en ESTA migracion
-- solo se AGREGA. No se dropea, no se renombra, no se mueve `tipo`, no se toca
-- el RPC `finalizar_proyecto_por_entregable` ni el UNIQUE(version). El codigo
-- viejo sigue funcionando: la columna `id_tarea` es NULLABLE y `entregables`
-- conserva su propio `tipo_entregable`.
--
-- Lo que hace:
--   1. Enum `estado_tarea_enum` (abierta | aprobada).
--   2. Tabla padre `entregable_tareas` con RLS (SELECT/INSERT para ambas partes
--      verificadas; el `tipo` vive aca, espejado desde el hijo).
--   3. Columna `entregables.id_tarea` (FK, NULLABLE) + indice.
--   4. Backfill: una tarea por entregable existente (1:1). Las 5 filas reales
--      estan en proyectos `finalizado`, asi que el trigger de validacion de
--      estado bloquearia el UPDATE; se desactiva SOLO ese trigger (y el de
--      updated_at, para no pisar la fecha historica) durante el vinculo. El FK
--      se valida normalmente porque los padres se insertan primero.
--
-- Diferido a la fase CONTRACT (Tanda 0.3, con el deploy de codigo nuevo vivo):
--   - `entregables.id_tarea` NOT NULL.
--   - UNIQUE(id_contratacion, version) -> UNIQUE(id_tarea, version).
--   - reescribir `finalizar_proyecto_por_entregable` para leer `tipo` del padre.
-- Diferido al cableado de UI:
--   - `entregables.descripcion` (el "hice esto" de cada propuesta).
--   - UPDATE policy de `entregable_tareas` + guard de transicion de estado
--     (solo el empresario aprueba) + guard de "solo abrir tareas si vigente".
-- ============================================================

-- 1. Enum de estado de la tarea (idempotente) -----------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'estado_tarea_enum') then
    create type public.estado_tarea_enum as enum ('abierta', 'aprobada');
  end if;
end $$;

-- 2. Tabla padre: entregable_tareas ---------------------------------------

create table if not exists public.entregable_tareas (
  id_tarea         uuid primary key default gen_random_uuid(),
  id_contratacion  uuid not null references public.contrataciones(id_contratacion),
  titulo           text not null,
  descripcion      text,
  tipo_entregable  public.tipo_entregable_enum not null,
  estado           public.estado_tarea_enum not null default 'abierta',
  abierta_por      uuid references public.usuarios(id_usuario),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint entregable_tareas_titulo_chk
    check (char_length(titulo) between 1 and 160),
  constraint entregable_tareas_descripcion_chk
    check (descripcion is null or char_length(descripcion) <= 2000)
);

comment on table public.entregable_tareas is
  'Tarea/entregable (nivel 1). Agrupa las propuestas (filas de entregables). '
  'La abre el empresario o el egresado; el empresario define tipo parcial/final.';

create index if not exists entregable_tareas_id_contratacion_idx
  on public.entregable_tareas(id_contratacion);

drop trigger if exists trg_entregable_tareas_updated_at on public.entregable_tareas;
create trigger trg_entregable_tareas_updated_at
  before update on public.entregable_tareas
  for each row execute function public.set_updated_at();

-- RLS: espeja el patron "ambas partes" de entregables, por id_contratacion.
alter table public.entregable_tareas enable row level security;

drop policy if exists entregable_tareas_select on public.entregable_tareas;
create policy entregable_tareas_select on public.entregable_tareas
  for select using (
    id_contratacion in (
      select c.id_contratacion
      from public.contrataciones c
      join public.participaciones pa on pa.id_participacion = c.id_participacion
      where pa.id_estudiante in (
              select id_estudiante from public.estudiantes
              where id_usuario = (select auth.uid()))
         or pa.id_proyecto in (
              select p.id_proyecto from public.proyectos p
              join public.empresarios e on e.id_empresario = p.id_empresario
              where e.id_usuario = (select auth.uid()))
    )
  );

-- INSERT abierto a AMBAS partes verificadas (el hijo es solo-estudiante;
-- la tarea la puede abrir el empresario o el egresado).
drop policy if exists entregable_tareas_insert on public.entregable_tareas;
create policy entregable_tareas_insert on public.entregable_tareas
  for insert with check (
    current_user_is_verified()
    and id_contratacion in (
      select c.id_contratacion
      from public.contrataciones c
      join public.participaciones pa on pa.id_participacion = c.id_participacion
      where pa.id_estudiante in (
              select id_estudiante from public.estudiantes
              where id_usuario = (select auth.uid()))
         or pa.id_proyecto in (
              select p.id_proyecto from public.proyectos p
              join public.empresarios e on e.id_empresario = p.id_empresario
              where e.id_usuario = (select auth.uid()))
    )
  );

-- 3. Vinculo estructural en el hijo: id_tarea (NULLABLE en esta fase) -------

alter table public.entregables
  add column if not exists id_tarea uuid references public.entregable_tareas(id_tarea);

comment on column public.entregables.id_tarea is
  'Tarea (nivel 1) a la que pertenece esta propuesta. NULLABLE durante expand; '
  'pasa a NOT NULL en la fase contract (Tanda 0.3).';

create index if not exists entregables_id_tarea_idx
  on public.entregables(id_tarea);

-- 4. Backfill (idempotente) -----------------------------------------------

-- 4a. Un padre por cada entregable existente. Reutiliza id_entregable como
-- id_tarea para mapear 1:1 sin ambiguedad. El estado y tipo se copian del hijo.
insert into public.entregable_tareas
  (id_tarea, id_contratacion, titulo, tipo_entregable, estado, created_at, updated_at)
select
  e.id_entregable,
  e.id_contratacion,
  'Entregable historico v' || e.version,
  e.tipo_entregable,
  case when e.estado = 'aprobado' then 'aprobada'::public.estado_tarea_enum
       else 'abierta'::public.estado_tarea_enum end,
  e.cargado_at,
  e.updated_at
from public.entregables e
where not exists (
  select 1 from public.entregable_tareas t where t.id_tarea = e.id_entregable
);

-- 4b. Vincular cada entregable a su tarea. Las filas reales viven en proyectos
-- `finalizado`; el trigger de validacion de estado bloquearia este UPDATE, y el
-- de updated_at pisaria la fecha real. Se desactivan SOLO esos dos durante el
-- vinculo (el FK se valida normal porque los padres ya existen).
alter table public.entregables disable trigger trg_validar_estado_entregable;
alter table public.entregables disable trigger trg_entregables_updated_at;

update public.entregables e
set id_tarea = e.id_entregable
where e.id_tarea is null;

alter table public.entregables enable trigger trg_entregables_updated_at;
alter table public.entregables enable trigger trg_validar_estado_entregable;
