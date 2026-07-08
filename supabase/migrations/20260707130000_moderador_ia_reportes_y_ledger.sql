-- ============================================================================
-- Moderador IA — Convivencia sana (agente que reporta, no decide)
-- Fecha: 2026-07-07
--
-- Un agente de IA analiza texto libre entre usuarios (mensajes, comentarios y
-- réplicas de evaluaciones, comentarios de entregables, carta de postulación,
-- descripción de portafolio y bio) y, cuando detecta lenguaje ofensivo o
-- conducta inapropiada, INSERTA un reporte en `reportes_moderacion` con una
-- ACCIÓN SUGERIDA. NO ejecuta nada: un admin revisa y decide (reusa el flujo
-- resolver + strike ya existente). Ver src/lib/moderador-ai/.
--
-- Decisión de diseño (consejo): NO se crea una tabla paralela de reportes. Se
-- EXTIENDE `reportes_moderacion` con un discriminador `origen` (usuario|ia), de
-- modo que la cola de moderación queda unificada y el admin reusa el mismo
-- handler de resolución/strike. Las superficies que NO tienen columna-objetivo
-- tipada (evaluación, comentario_entregable, participación, bio) se referencian
-- con un puntero genérico (entidad, id_entidad) que solo usan los reportes IA.
--
-- Esta migración:
--   (a) Enums nuevos: origen, entidad moderable, acción sugerida, severidad,
--       estado del análisis IA.
--   (b) Columnas nuevas en `reportes_moderacion` (todas nullable / con default
--       que preserva el camino humano existente).
--   (c) id_reportante pasa a nullable (los reportes IA no tienen denunciante
--       humano; se insertan con service role, que salta RLS).
--   (d) CHECK consciente del `origen`: preserva EXACTAMENTE la invariante humana
--       ("exactamente un objetivo de los 5 tipados") y agrega la invariante IA.
--   (e) Tabla-libro `moderacion_ia_analisis` (dedup + estado para reintento).
--   (f) Interruptor `moderador_ia_activo` en configuracion_sistema.
--
-- Pre-flight para Samir (re-correr en remoto antes de aplicar): confirmar que
-- todos los reportes existentes son de origen humano y cumplen la invariante,
-- para que el CHECK nuevo ligue sin rechazar filas:
--   select count(*) from public.reportes_moderacion
--    where (id_reportado  is not null)::int
--        + (id_proyecto   is not null)::int
--        + (id_mensaje    is not null)::int
--        + (id_entregable is not null)::int
--        + (id_portafolio is not null)::int <> 1;   -- debe dar 0
--
-- IMPORTANTE (tipos generados): esta migración AGREGA columnas y enums, así que
-- src/types/database.ts debe actualizarse antes de usar las columnas nuevas en
-- código (Fase 2). Preferir editar database.ts a mano (ver CLAUDE.md) o
-- regenerar con `npx supabase gen types typescript --linked`.
-- ============================================================================

-- ── (a) Enums nuevos ────────────────────────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_type where typname = 'origen_reporte_enum') then
    create type public.origen_reporte_enum as enum ('usuario', 'ia');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'entidad_moderable_enum') then
    create type public.entidad_moderable_enum as enum (
      'mensaje',
      'evaluacion_comentario',
      'evaluacion_respuesta',
      'evaluacion_empresario_comentario',
      'evaluacion_empresario_respuesta',
      'comentario_entregable',
      'carta_postulacion',
      'portafolio',
      'bio_estudiante'
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'accion_moderacion_enum') then
    create type public.accion_moderacion_enum as enum ('advertir', 'strike', 'ignorar');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'severidad_moderacion_enum') then
    create type public.severidad_moderacion_enum as enum ('baja', 'media', 'alta');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'estado_analisis_ia_enum') then
    create type public.estado_analisis_ia_enum as enum (
      'pendiente',    -- encolado; aún no analizado (o reintento tras fallo)
      'analizado',    -- analizado y generó un reporte (id_reporte no nulo)
      'sin_hallazgos',-- analizado, sin falta detectada
      'fallido',      -- error del proveedor; lo reprocesa "Escanear pendientes"
      'omitido'       -- texto vacío/demasiado corto para analizar
    );
  end if;
end $$;

-- ── (b) Columnas nuevas en reportes_moderacion ──────────────────────────────
alter table public.reportes_moderacion
  add column if not exists origen          public.origen_reporte_enum    not null default 'usuario',
  add column if not exists entidad         public.entidad_moderable_enum,
  add column if not exists id_entidad      uuid,
  add column if not exists accion_sugerida public.accion_moderacion_enum,
  add column if not exists severidad       public.severidad_moderacion_enum,
  add column if not exists confianza       numeric(3, 2),
  add column if not exists extracto        text,
  add column if not exists modelo_ia       text;

comment on column public.reportes_moderacion.origen is
  'Quién generó el reporte: usuario (denuncia humana, RF-69) o ia (agente moderador).';
comment on column public.reportes_moderacion.entidad is
  'Solo reportes IA: qué superficie de texto se analizó (puntero polimórfico con id_entidad).';
comment on column public.reportes_moderacion.id_entidad is
  'Solo reportes IA: PK de la fila analizada en la tabla que indica `entidad` (sin FK por ser polimórfico).';
comment on column public.reportes_moderacion.accion_sugerida is
  'Solo reportes IA: recomendación del agente (advertir|strike|ignorar). El admin decide; el agente NO ejecuta.';
comment on column public.reportes_moderacion.extracto is
  'Solo reportes IA: fragmento textual señalado. El admin DEBE leerlo antes de sancionar.';

-- ── (c) id_reportante nullable (los reportes IA no tienen denunciante) ───────
alter table public.reportes_moderacion
  alter column id_reportante drop not null;

-- ── (d) CHECK consciente del origen ─────────────────────────────────────────
-- Reemplaza la invariante "exactamente un objetivo" por una por-origen:
--  · usuario: idéntica a antes (exactamente 1 de los 5 objetivos tipados),
--             sin puntero genérico ni acción sugerida.
--  · ia:      apunta al usuario infractor (id_reportado) + al contenido exacto
--             (entidad, id_entidad) + acción sugerida; sin objetivos tipados.
alter table public.reportes_moderacion
  drop constraint if exists "reportes_moderacion_exactamente_uno_objetivo";

alter table public.reportes_moderacion
  add constraint "reportes_moderacion_objetivo_por_origen" check (
    case origen
      when 'usuario' then
            entidad is null
        and id_entidad is null
        and accion_sugerida is null
        and (
              (id_reportado  is not null)::int
            + (id_proyecto   is not null)::int
            + (id_mensaje    is not null)::int
            + (id_entregable is not null)::int
            + (id_portafolio is not null)::int
            = 1
        )
      when 'ia' then
            id_reportado is not null
        and entidad is not null
        and id_entidad is not null
        and accion_sugerida is not null
        and id_proyecto   is null
        and id_mensaje    is null
        and id_entregable is null
        and id_portafolio is null
    end
  );

-- id_reportante presente para humanos, ausente para IA.
alter table public.reportes_moderacion
  add constraint "reportes_moderacion_reportante_por_origen" check (
    (origen = 'usuario' and id_reportante is not null)
    or (origen = 'ia' and id_reportante is null)
  );

-- confianza (si presente) en [0, 1].
alter table public.reportes_moderacion
  add constraint "reportes_moderacion_confianza_rango" check (
    confianza is null or (confianza >= 0 and confianza <= 1)
  );

-- Índice para la cola IA del admin (filtra por origen + estado).
create index if not exists idx_reportes_moderacion_origen
  on public.reportes_moderacion (origen, estado_moderacion);

-- ── (e) Tabla-libro de análisis IA (dedup + estado para reintento) ──────────
-- Registra qué contenido ya pasó por el agente. El hash del contenido permite
-- re-analizar si el usuario EDITA el texto (bio/portafolio son editables) sin
-- re-analizar lo idéntico. Sin FK en (entidad, id_entidad) por ser polimórfico.
create table if not exists public.moderacion_ia_analisis (
  id_analisis  uuid primary key default gen_random_uuid(),
  entidad      public.entidad_moderable_enum not null,
  id_entidad   uuid not null,
  content_hash text not null,
  estado       public.estado_analisis_ia_enum not null default 'pendiente',
  id_reporte   uuid references public.reportes_moderacion (id_reporte) on delete set null,
  intentos     integer not null default 0,
  error        text,
  modelo_ia    text,
  analizado_at timestamptz,
  created_at   timestamptz not null default now(),
  constraint moderacion_ia_analisis_unico unique (entidad, id_entidad, content_hash)
);

comment on table public.moderacion_ia_analisis is
  'Libro del agente moderador: dedup por (entidad, id_entidad, hash) y estado para reintento ("Escanear pendientes").';

create index if not exists idx_moderacion_ia_analisis_estado
  on public.moderacion_ia_analisis (estado);

-- RLS: escritura SOLO por service role (que salta RLS); lectura directa para admin.
alter table public.moderacion_ia_analisis enable row level security;

drop policy if exists "moderacion_ia_analisis_select_admin" on public.moderacion_ia_analisis;
create policy "moderacion_ia_analisis_select_admin"
  on public.moderacion_ia_analisis for select
  to authenticated
  using (
    exists (
      select 1 from public.usuarios u
      join public.roles r on u.id_rol = r.id_rol
      where u.id_usuario = (select auth.uid()) and r.nombre_rol = 'administrador'
    )
  );

-- ── (f) Interruptor del agente ──────────────────────────────────────────────
insert into public.configuracion_sistema (clave, valor, tipo_dato, descripcion, modificado_at)
values (
  'moderador_ia_activo',
  'true',
  'boolean',
  'Interruptor del agente de moderación IA. true = analiza el contenido nuevo y genera reportes.',
  now()
)
on conflict (clave) do nothing;
