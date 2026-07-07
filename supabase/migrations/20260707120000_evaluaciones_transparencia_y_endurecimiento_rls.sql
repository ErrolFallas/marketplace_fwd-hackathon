-- ============================================================
-- Endurecimiento RLS + transparencia total de reseñas
-- ------------------------------------------------------------
-- Tres cambios de política/seguridad agrupados en una sola migración:
--
-- 1. TRANSPARENCIA TOTAL de `evaluaciones` (empresa -> egresado). Antes el
--    SELECT era solo para las partes involucradas + admin (privada); ahora
--    cualquier usuario autenticado ve la reseña completa (puntaje, comentario,
--    respuesta), igual que `evaluaciones_empresarios`, que ya es pública para
--    autenticados. Reputación transparente y homogénea en ambos sentidos
--    (modelo Upwork/Amazon). La exposición se limita a `authenticated`, nunca
--    `anon`, para no volver las reseñas atribuidas indexables en la web abierta.
--
-- 2. `configuracion_sistema`: SELECT restringido a administradores (antes era
--    legible por cualquier autenticado con `using (true)`). Defensa en
--    profundidad (RNF-04): la config operativa solo la consume el panel admin.
--
-- 3. FIX: `guard_empresarios_protected_cols` ahora congela `reputacion` igual
--    que el guard de estudiantes. Sin esta línea, un empresario podía inflar su
--    propia reputacion con un UPDATE directo por el cliente anon (la policy de
--    UPDATE permite tocar cualquier columna de la fila propia; el guard es la
--    barrera). Cierra la "mejora futura común" anotada en 20260706240000.

-- 1. Transparencia total de evaluaciones (empresa -> egresado).
--    Se reemplazan las policies privada + admin por una única de lectura para
--    todo autenticado. Las partes siguen incluidas (son un subconjunto).
drop policy if exists "evaluaciones_select" on public.evaluaciones;
drop policy if exists "evaluaciones_select_admin" on public.evaluaciones;
create policy "evaluaciones_select_authenticated"
  on public.evaluaciones for select
  to authenticated
  using (true);

-- 2. configuracion_sistema legible solo por administradores.
--    Mismo patrón de rol que reportes_moderacion / soporte_tickets.
drop policy if exists "config_select_authenticated" on public.configuracion_sistema;
create policy "config_select_admin"
  on public.configuracion_sistema for select
  to authenticated
  using (
    exists (
      select 1
      from public.usuarios u
      join public.roles r on r.id_rol = u.id_rol
      where u.id_usuario = (select auth.uid())
        and r.nombre_rol = 'administrador'
    )
  );

-- 3. El guard de empresarios protege `reputacion` frente a UPDATE del propio
--    empresario (rol authenticated). El service_role sigue exento (el guard
--    solo actúa cuando current_user = 'authenticated'), así que el recálculo
--    por trigger desde evaluaciones_empresarios no se ve afectado.
create or replace function public.guard_empresarios_protected_cols()
returns trigger
language plpgsql
as $function$
begin
  if current_user is distinct from 'authenticated' then
    return new;
  end if;

  new.id_usuario          := old.id_usuario;
  new.estado_verificacion := old.estado_verificacion;
  new.verificado_at       := old.verificado_at;
  new.verificado_por      := old.verificado_por;
  new.motivo_rechazo      := old.motivo_rechazo;
  new.reputacion          := old.reputacion;
  return new;
end;
$function$;
