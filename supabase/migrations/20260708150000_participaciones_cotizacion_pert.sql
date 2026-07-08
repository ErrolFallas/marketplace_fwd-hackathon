-- ============================================================
-- MIGRACIÓN — Cotizador PERT: monto + PDF opcional en participaciones
-- Fecha: 2026-07-08
--
-- Agrega a `participaciones`:
--   · cotizacion_monto_crc: monto (₡) que el egresado cotiza y que verá el
--     empresario. Opcional (nullable) — no bloquea postular.
--   · cotizacion_pdf_path: ruta en storage al PDF de desglose (opcional, opt-in).
-- Crea el bucket privado `cotizaciones_pert` (solo PDF, 5MB) con RLS espejo de
-- documentacion_tecnica. Estructura de carpetas: {id_proyecto}/{id_usuario}/...
-- ============================================================

-- 1. Columnas nuevas (ambas opcionales)
alter table public.participaciones
  add column cotizacion_monto_crc numeric(12, 2),
  add column cotizacion_pdf_path text;

alter table public.participaciones
  add constraint participaciones_cotizacion_monto_chk
    check (cotizacion_monto_crc is null or cotizacion_monto_crc >= 0),
  add constraint participaciones_cotizacion_pdf_max_chk
    check (cotizacion_pdf_path is null or char_length(cotizacion_pdf_path) <= 300);

-- 2. Bucket privado para los PDF de cotización (solo PDF, 5MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cotizaciones_pert', 'cotizaciones_pert', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

-- 3. Políticas RLS (espejo de documentacion_tecnica)
-- ------------------------------------------------------------
-- INSERT: solo el estudiante verificado dueño de la ruta.
create policy "cotizaciones_pert_insert_estudiante"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'cotizaciones_pert'
    and (storage.foldername(name))[2] = (select auth.uid())::text
    and exists (
      select 1 from public.estudiantes e
      where e.id_usuario = (select auth.uid())
      and e.estado_verificacion = 'verificado'
    )
  );

-- SELECT (estudiante): sus propios archivos.
create policy "cotizaciones_pert_select_estudiante"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'cotizaciones_pert'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

-- SELECT (empresario): archivos de sus proyectos con participación registrada.
create policy "cotizaciones_pert_select_empresario"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'cotizaciones_pert'
    and (storage.foldername(name))[1] in (
      select p.id_proyecto::text
      from public.proyectos p
      join public.empresarios emp on emp.id_empresario = p.id_empresario
      where emp.id_usuario = (select auth.uid())
    )
    and exists (
      select 1 from public.participaciones pa
      join public.estudiantes est on est.id_estudiante = pa.id_estudiante
      where pa.id_proyecto::text = (storage.foldername(name))[1]
      and est.id_usuario::text = (storage.foldername(name))[2]
    )
  );

-- UPDATE / DELETE (estudiante): solo si aún no oficializó su participación.
create policy "cotizaciones_pert_update_estudiante"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'cotizaciones_pert'
    and (storage.foldername(name))[2] = (select auth.uid())::text
    and not exists (
      select 1 from public.participaciones pa
      join public.estudiantes est on est.id_estudiante = pa.id_estudiante
      where pa.id_proyecto::text = (storage.foldername(name))[1]
      and est.id_usuario::text = (storage.foldername(name))[2]
    )
  )
  with check (
    bucket_id = 'cotizaciones_pert'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

create policy "cotizaciones_pert_delete_estudiante"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'cotizaciones_pert'
    and (storage.foldername(name))[2] = (select auth.uid())::text
    and not exists (
      select 1 from public.participaciones pa
      join public.estudiantes est on est.id_estudiante = pa.id_estudiante
      where pa.id_proyecto::text = (storage.foldername(name))[1]
      and est.id_usuario::text = (storage.foldername(name))[2]
    )
  );

-- 4. Interruptor del cotizador IA (RNF-34: kill-switch, apagable sin tocar código)
insert into public.configuracion_sistema (clave, valor, tipo_dato, descripcion, modificado_at)
values (
  'cotizador_pert_ia_activo',
  'true',
  'boolean',
  'Interruptor del cotizador IA. true = "Estimar con IA" llama al agente (stack de GitHub + rangos O/P). false = no disponible (el cálculo determinista sigue funcionando).',
  now()
)
on conflict (clave) do nothing;

comment on column public.participaciones.cotizacion_monto_crc is
  'Monto (₡) que el egresado cotiza por construir el proyecto. Lo ve el empresario al abrir el sobre (RF-34). Opcional.';
comment on column public.participaciones.cotizacion_pdf_path is
  'Ruta en el bucket cotizaciones_pert al PDF de desglose que el egresado decidió adjuntar (opt-in). Opcional.';
