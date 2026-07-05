-- Propuesta multi-evidencia: una propuesta (fila de `entregables`) deja de tener UN
-- solo archivo y pasa a: un link opcional (`url_enlace`), una descripción
-- obligatoria (columna `descripcion` ya existe, la obligatoriedad la impone la
-- app) y una tabla hija de adjuntos (PDF + varias imágenes). La regla de negocio
-- "al menos un link o un archivo" se valida en la app (cruza tablas).
--
-- `entregables.archivo_url` / `archivo_hash` se dejan como están (ya nullable):
-- son para las filas legacy; las nuevas propuestas usan `url_enlace` + adjuntos.
-- Los archivos de adjuntos viven en el bucket `entregables` (sin restricción de
-- MIME, 50 MB, privado), en la carpeta `id_contratacion/...` — la policy de
-- Storage existente ya permite al egresado verificado subir ahí.
--
-- SAMIR: revisar especialmente las policies RLS de `entregable_adjuntos` (SELECT
-- de ambas partes / INSERT del egresado verificado) contra las de `entregables`.

-- 1. Link opcional de la propuesta ------------------------------------------
alter table public.entregables
  add column if not exists url_enlace text;

alter table public.entregables
  drop constraint if exists entregables_url_enlace_chk;
alter table public.entregables
  add constraint entregables_url_enlace_chk
  check (url_enlace is null or char_length(url_enlace) <= 500);

-- 2. Tipo de adjunto ---------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'tipo_adjunto_enum') then
    create type public.tipo_adjunto_enum as enum ('pdf', 'imagen');
  end if;
end $$;

-- 3. Tabla hija de adjuntos (PDF + imágenes) de una propuesta ----------------
create table if not exists public.entregable_adjuntos (
  id_adjunto    uuid primary key default gen_random_uuid(),
  id_entregable uuid not null
                references public.entregables(id_entregable) on delete cascade,
  tipo          public.tipo_adjunto_enum not null,
  archivo_url   text not null,
  orden         integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists entregable_adjuntos_entregable_idx
  on public.entregable_adjuntos (id_entregable);

alter table public.entregable_adjuntos enable row level security;

-- SELECT: ambas partes de la contratación (espejo de la lectura de entregables).
-- Cadena: adjunto -> entregable -> contratacion -> participacion -> proyecto.
drop policy if exists entregable_adjuntos_select_partes
  on public.entregable_adjuntos;
create policy entregable_adjuntos_select_partes
  on public.entregable_adjuntos for select
  using (
    exists (
      select 1
      from public.entregables e
      join public.contrataciones c
        on c.id_contratacion = e.id_contratacion
      join public.participaciones p
        on p.id_participacion = c.id_participacion
      join public.proyectos pr
        on pr.id_proyecto = p.id_proyecto
      where e.id_entregable = entregable_adjuntos.id_entregable
        and (
          p.id_estudiante in (
            select es.id_estudiante from public.estudiantes es
            where es.id_usuario = auth.uid()
          )
          or pr.id_empresario in (
            select em.id_empresario from public.empresarios em
            where em.id_usuario = auth.uid()
          )
        )
    )
  );

-- INSERT: el egresado (estudiante) dueño de la contratación y verificado
-- (espejo de la policy de Storage de entregables).
drop policy if exists entregable_adjuntos_insert_estudiante
  on public.entregable_adjuntos;
create policy entregable_adjuntos_insert_estudiante
  on public.entregable_adjuntos for insert
  with check (
    exists (
      select 1
      from public.entregables e
      join public.contrataciones c
        on c.id_contratacion = e.id_contratacion
      join public.participaciones p
        on p.id_participacion = c.id_participacion
      join public.estudiantes es
        on es.id_estudiante = p.id_estudiante
      where e.id_entregable = entregable_adjuntos.id_entregable
        and es.id_usuario = auth.uid()
        and es.estado_verificacion = 'verificado'
    )
  );

-- Sin UPDATE/DELETE (como entregables): el historial se conserva por auditoría.
