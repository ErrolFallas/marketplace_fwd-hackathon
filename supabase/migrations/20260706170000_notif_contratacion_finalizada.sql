-- ============================================================
-- MIGRACIÓN 20260706170000 — Tipo de notificación 'contratacion_finalizada'
-- ============================================================
-- Aviso al egresado cuando el empresario finaliza la contratación (RPC
-- `finalizar_contratacion`, decisión global desacoplada de los entregables): el
-- proyecto quedó finalizado y ya puede calificar a la empresa (RF-47/RF-49).
-- Ningún tipo existente encajaba (el badge quedaría equivocado), así que se agrega
-- un valor nuevo al enum. `add value` solo agrega el valor (se usa en runtime,
-- después). Idempotente con `if not exists`.
-- ============================================================

alter type public.tipo_notificacion_enum
  add value if not exists 'contratacion_finalizada';
