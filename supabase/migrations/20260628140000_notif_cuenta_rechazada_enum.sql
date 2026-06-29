-- A2 Fase 2 (2a) — Notificación in-app de rechazo de verificación.
--
-- Agrega el valor 'cuenta_rechazada' al enum `tipo_notificacion_enum` para poder
-- avisar in-app (además del correo de Fase 1) cuando el admin rechaza la
-- verificación de un egresado (RF-64) o empresa (RF-17).
--
-- Nota: `ALTER TYPE ... ADD VALUE` no permite USAR el valor nuevo en la misma
-- transacción que lo agrega. Esta migración solo lo AGREGA (no lo usa), así que
-- es segura; el código que lo emite corre después, con la migración ya aplicada.
-- Idempotente con IF NOT EXISTS (Postgres 17).

alter type public.tipo_notificacion_enum
  add value if not exists 'cuenta_rechazada';
