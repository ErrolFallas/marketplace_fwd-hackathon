-- Moderador IA — superficies de alcance ampliado (fase 2 de entidades).
--
-- Agrega al enum `entidad_moderable_enum` cuatro superficies de texto libre que
-- quedaron fuera del v1 (bajo riesgo de convivencia, pero en el pedido original):
--   · entregable_descripcion       → entregables.descripcion (egresado)
--   · contrato_condiciones         → contrataciones.condiciones_especiales (empresa)
--   · contrato_motivo_cancelacion  → contrataciones.motivo_cancelacion (empresa)
--   · empresa_descripcion          → empresarios.descripcion (empresa)
--
-- Solo AGREGA los valores (no los usa aquí), así que es seguro — misma convención
-- que 20260707130001. El código que los emite corre después, con la migración ya
-- aplicada. Idempotente con IF NOT EXISTS.
alter type public.entidad_moderable_enum
  add value if not exists 'entregable_descripcion';
alter type public.entidad_moderable_enum
  add value if not exists 'contrato_condiciones';
alter type public.entidad_moderable_enum
  add value if not exists 'contrato_motivo_cancelacion';
alter type public.entidad_moderable_enum
  add value if not exists 'empresa_descripcion';
