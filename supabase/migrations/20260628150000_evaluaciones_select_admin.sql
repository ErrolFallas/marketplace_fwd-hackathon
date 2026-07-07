-- Migración: política de lectura admin sobre public.evaluaciones
-- Contexto: el panel de administración necesita listar TODAS las calificaciones
-- empresa->egresado (tabla `evaluaciones`) para la pestaña de Calificaciones en
-- /admin/users. La policy vigente `evaluaciones_select` solo deja leer al
-- empresario o al estudiante involucrado, por lo que un admin obtiene cero filas.
-- Esta policy ADITIVA (permisiva, se OR-ea con la existente) habilita la lectura
-- completa únicamente a usuarios con rol 'administrador'. No otorga insert/update/delete.
-- Mismo patrón de detección de admin que `reportes_select_admin` (RF-69).
-- Idempotente: drop policy if exists + create.

drop policy if exists "evaluaciones_select_admin" on public.evaluaciones;
create policy "evaluaciones_select_admin"
  on public.evaluaciones for select
  to authenticated
  using (
    exists (
      select 1
      from public.usuarios u
      join public.roles r on u.id_rol = r.id_rol
      where u.id_usuario = (select auth.uid())
        and r.nombre_rol = 'administrador'
    )
  );
