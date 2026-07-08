-- ============================================================================
-- Filtro de Ofertas IA — Revisión advisory de postulaciones (agente que
-- aconseja, no bloquea)
-- Fecha: 2026-07-07
--
-- Rediseño del filtro `OPENROUTER_FILTRO_OFERTAS`. El agente deja de ser un
-- gate fail-open que aprueba/rechaza en silencio y pasa a ser un REVISOR
-- ADVISORY: cuando el egresado pulsa "Revisar con IA", el agente juzga la
-- COHERENCIA TEMÁTICA del texto (planteamiento + carta) contra el proyecto y
-- devuelve coaching por-campo ("comentario de nuestro supervisor"). Su veredicto
-- se REGISTRA en la postulación, pero NO bloquea el envío: lo único que bloquea
-- "Enviar" es el gate determinista (campos obligatorios + consentimiento + link
-- válido y vivo, todo en código). Ver src/lib/ai-filtro-ofertas/.
--
-- Config del agente: usa SUS PROPIAS vars OPENROUTER_FILTRO_OFERTAS_API_KEY /
-- _MODEL (env.server.ts). No comparte key ni modelo con el moderador IA.
--
-- Modelo de estados (revision_ia_estado_enum):
--   · aprobada       — el agente revisó el texto y lo aprobó (con o sin sugerencias)
--   · rechazada      — el agente revisó y señaló problemas (el egresado envió igual)
--   · no_disponible  — el agente no pudo ejecutarse (caída/timeout/sin key): fail-open
--   · no_solicitada  — el egresado envió sin pulsar "Revisar con IA" (default)
--
-- Esta migración:
--   (a) Enum nuevo: revision_ia_estado_enum.
--   (b) Columnas nuevas en `participaciones` (nullable / con default que preserva
--       las filas históricas como 'no_solicitada').
--   (c) Interruptor `filtro_ofertas_ia_activo` en configuracion_sistema (RNF-34:
--       permite apagar el agente sin tocar código).
--
-- NOTA (get_participaciones_de_proyecto): exponer el veredicto al empresario
-- (RF-34, "sobre cerrado") es Fase B y se hace en una migración aparte que
-- modifica esa RPC con cuidado; esta migración NO la toca.
--
-- IMPORTANTE (tipos generados): esta migración AGREGA una columna con tipo enum
-- nuevo, así que src/types/database.ts debe actualizarse a mano antes de usarla
-- en código (ver CLAUDE.md). Se actualiza junto con esta migración.
-- ============================================================================

-- ── (a) Enum de estado de la revisión IA ────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_type where typname = 'revision_ia_estado_enum') then
    create type public.revision_ia_estado_enum as enum (
      'aprobada',
      'rechazada',
      'no_disponible',
      'no_solicitada'
    );
  end if;
end $$;

-- ── (b) Columnas nuevas en participaciones ──────────────────────────────────
alter table public.participaciones
  add column if not exists revision_ia_estado  public.revision_ia_estado_enum not null default 'no_solicitada',
  add column if not exists revision_ia_detalle jsonb,
  add column if not exists revision_ia_modelo  text,
  add column if not exists revision_ia_at      timestamptz;

comment on column public.participaciones.revision_ia_estado is
  'Veredicto del revisor IA sobre esta oferta (advisory, NO bloquea el envío): aprobada|rechazada|no_disponible|no_solicitada.';
comment on column public.participaciones.revision_ia_detalle is
  'Coaching por-campo del revisor IA: [{ campo, codigo_motivo, sugerencias[] }]. Alimenta el cuadro "comentario de nuestro supervisor" y la auditoría (RNF-32).';
comment on column public.participaciones.revision_ia_modelo is
  'Modelo OpenRouter que produjo el veredicto (auditoría RNF-32).';
comment on column public.participaciones.revision_ia_at is
  'Momento en que el egresado ejecutó la revisión IA. NULL si nunca la solicitó.';

-- ── (c) Interruptor del agente (RNF-34: fallback / kill-switch) ──────────────
insert into public.configuracion_sistema (clave, valor, tipo_dato, descripcion, modificado_at)
values (
  'filtro_ofertas_ia_activo',
  'true',
  'boolean',
  'Interruptor del revisor IA de postulaciones. true = el botón "Revisar con IA" llama al agente. false = revisión no disponible (el envío no se bloquea).',
  now()
)
on conflict (clave) do nothing;
