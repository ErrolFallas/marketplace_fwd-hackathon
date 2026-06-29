-- ============================================================
-- Idempotencia de correo para plazo_vence (RF-46)
-- ------------------------------------------------------------
-- Marca por-notificacion de "correo ya enviado". El aviso in-app de
-- plazo_vence (RF-33) ya funciona via pg_cron; el correo (RF-46, Must) lo
-- emitira un proceso TS aparte (Node, porque nodemailer no corre en Postgres),
-- disparado por tiempo. Ese emisor leera las notificaciones plazo_vence con
-- correo_enviado_at IS NULL, enviara el correo y sellara la columna con now()
-- para no reenviar en la siguiente corrida.
--
-- Mismo patron de idempotencia que participaciones.plazo_aviso_enviado_at
-- (esa marca el in-app; esta marca el correo: son dos canales distintos, por
-- eso no se reusa la misma columna).
--
-- IDEMPOTENCIA: ADD COLUMN IF NOT EXISTS. Seguro de re-ejecutar.
--
-- NO aplicar sin Samir (las migraciones las aplica el dueno de la BD). Esta
-- migracion NO habilita pg_net ni agenda ningun job: esa infra la configura
-- Samir aparte (ver docs/plazo-vence-pg-cron.md, seccion 14).
-- ============================================================

alter table public.notificaciones
  add column if not exists correo_enviado_at timestamptz;

comment on column public.notificaciones.correo_enviado_at is
  'Idempotencia de correo (RF-46): fecha/hora en que el emisor TS envio el correo de esta notificacion. NULL = aun no enviado. Solo lo escribe el emisor (service_role).';
