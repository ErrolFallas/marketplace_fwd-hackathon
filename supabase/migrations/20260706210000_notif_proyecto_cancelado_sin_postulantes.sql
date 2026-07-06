-- Nuevo tipo de notificación: un proyecto que venció sin postulaciones y el cron
-- (20260706220000) lo cancela automáticamente para que el empresario lo republique.
-- Va en migración aparte del uso: `alter type add value` no se puede usar en la
-- misma transacción que lo agrega (patrón de 20260706170000).
alter type public.tipo_notificacion_enum
  add value if not exists 'proyecto_cancelado_sin_postulantes';
