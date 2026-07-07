-- ============================================================
-- Nuevo tipo de notificación: invitación de un empresario a un egresado
-- ------------------------------------------------------------
-- Habilita el flujo push (RF-61 extendido): desde el cuadro de candidatos
-- recomendados del detalle de proyecto, el empresario invita a un egresado a
-- postular. La invitación es solo un aviso in-app (correo diferido): NO inscribe
-- al egresado, que debe realizar la postulación formal como siempre.
-- Idempotente: `add value if not exists` permite reaplicar sin error.
-- ============================================================
alter type public.tipo_notificacion_enum
  add value if not exists 'invitacion_proyecto';
