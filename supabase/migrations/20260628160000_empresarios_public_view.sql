-- ============================================================
-- empresarios_public: identidad pública de empresa para el marketplace
-- ------------------------------------------------------------
-- Problema: la única policy de lectura sobre `empresarios`
-- (empresarios_select_own) deja que cada empresario lea solo su propia
-- fila. Por eso el join proyectos -> empresarios(nombre_empresa) vuelve
-- NULL para egresados y la UI muestra "empresa desconocida".
--
-- Solución: una vista que expone SOLO id_empresario + nombre_empresa
-- (sin cédula, teléfono, sitio_web ni datos sensibles), con
-- security_invoker = false para saltar la RLS de la tabla base de forma
-- controlada y acotada a esas dos columnas. Se restringe a empresas con
-- al menos un proyecto visible (is_active y estado <> 'borrador'): el
-- mismo criterio de visibilidad que las policies proyectos_select_*.
--
-- Audiencia: authenticated, igual que proyectos_select_auth. Anon no ve
-- proyectos, así que tampoco necesita nombres.
--
-- Nota: get_advisors marcará "security_definer_view" sobre esta vista.
-- Es esperado e intencional: el bypass de RLS es justamente el objetivo y
-- la exposición se limita a dos columnas no sensibles.
-- ============================================================

create or replace view public.empresarios_public
with (security_invoker = false)
as
  select e.id_empresario,
         e.nombre_empresa
  from public.empresarios e
  where exists (
    select 1
    from public.proyectos p
    where p.id_empresario = e.id_empresario
      and p.is_active = true
      and p.estado <> 'borrador'
  );

comment on view public.empresarios_public is
  'Identidad pública (id + nombre) de empresas con proyectos visibles. Expone solo columnas no sensibles para el marketplace; security_invoker=false intencional (ver migración).';

revoke all on public.empresarios_public from anon, public;
grant select on public.empresarios_public to authenticated;
