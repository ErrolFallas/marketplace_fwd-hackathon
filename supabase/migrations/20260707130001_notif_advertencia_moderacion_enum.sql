-- Moderador IA — valor de notificación para la ADVERTENCIA al usuario.
--
-- Cuando el admin, sobre un reporte del agente, elige "advertir", se emite una
-- notificación in-app con este tipo de evento (reusa crearNotificacion). Ver
-- src/lib/moderador-ai/ y el flujo admin de la pestaña "Moderador IA".
--
-- Nota: `ALTER TYPE ... ADD VALUE` no permite USAR el valor en la misma
-- transacción que lo agrega. Por eso va en su PROPIA migración (solo lo AGREGA);
-- el código que lo emite corre después, con la migración ya aplicada. Es la
-- misma convención de 20260628140000_notif_cuenta_rechazada_enum.sql.
-- Idempotente con IF NOT EXISTS (Postgres 17).

alter type public.tipo_notificacion_enum
  add value if not exists 'advertencia_moderacion';
