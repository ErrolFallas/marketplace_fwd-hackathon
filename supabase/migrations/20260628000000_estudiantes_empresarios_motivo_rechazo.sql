-- A2 Fase 1 — Motivo de rechazo de verificación (RF-17 empresa / RF-64 egresado).
--
-- Problema: al rechazar una empresa o un egresado el admin escribe un motivo en
-- la UI, pero ese texto se descarta porque no existe columna donde guardarlo
-- (ver auditoría de persistencia). Esta migración agrega `motivo_rechazo` a
-- `estudiantes` y `empresarios` para persistir la razón, que luego se le
-- comunica al usuario por correo y queda visible para el admin.
--
-- El rechazo NO es permanente: `motivo_rechazo` es nullable (null = nunca
-- rechazado, o motivo limpiado al re-aprobar). La re-verificación (volver a
-- 'pendiente' tras editar datos) es Fase 2 y no se incluye aquí.
--
-- Seguridad: solo el admin (service_role) puede escribir el motivo. Se congela
-- la columna contra `authenticated` extendiendo los guard-triggers existentes
-- (mismo patrón que `estado_verificacion`, definido en
-- 20260610000006_security_hardening_rls.sql). Idempotente.

-- ============================================================
-- 1. Columna nueva
-- ============================================================
alter table public.estudiantes add column if not exists motivo_rechazo text;
alter table public.empresarios  add column if not exists motivo_rechazo text;

-- ============================================================
-- 2. Congelar motivo_rechazo contra el usuario autenticado
--    (service_role / postgres / supabase_admin pasan intactos)
-- ============================================================
create or replace function public.guard_empresarios_protected_cols()
returns trigger
language plpgsql
as $$
begin
  if current_user is distinct from 'authenticated' then
    return new;
  end if;

  new.id_usuario          := old.id_usuario;
  new.estado_verificacion := old.estado_verificacion;
  new.verificado_at       := old.verificado_at;
  new.verificado_por      := old.verificado_por;
  new.motivo_rechazo      := old.motivo_rechazo;
  return new;
end;
$$;

create or replace function public.guard_estudiantes_protected_cols()
returns trigger
language plpgsql
as $$
begin
  if current_user is distinct from 'authenticated' then
    return new;
  end if;

  new.id_usuario              := old.id_usuario;
  new.estado_verificacion     := old.estado_verificacion;
  new.verificado_at           := old.verificado_at;
  new.verificado_por          := old.verificado_por;
  new.reputacion              := old.reputacion;
  new.proyectos_completados   := old.proyectos_completados;
  new.participaciones_activas := old.participaciones_activas;
  new.titulo_fwd              := old.titulo_fwd;
  new.motivo_rechazo          := old.motivo_rechazo;
  return new;
end;
$$;

-- Los triggers trg_guard_empresarios_protected y trg_guard_estudiantes_protected
-- ya apuntan a estas funciones; create or replace las actualiza en sitio.
