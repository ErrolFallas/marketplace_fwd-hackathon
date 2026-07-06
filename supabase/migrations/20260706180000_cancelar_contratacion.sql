-- ============================================================
-- Cancelar contratación + calificar en 'cancelado'
-- ============================================================
-- El empresario cancela una contratación VIGENTE (decisión soberana). Al cancelar:
--   - contrataciones.estado_periodo -> 'cancelado' (con motivo),
--   - proyectos.estado              -> 'cancelado' (terminal),
--   - participaciones.estado        -> 'cancelada'.
--
-- Espejo exacto de finalizar_contratacion (20260704160000): security invoker,
-- resuelve el empresario de la sesión, valida propiedad, serializa con
-- `for update of c` y exige estado 'vigente'. La única diferencia es que exige
-- motivo (P0006) y deja todo en 'cancelado' en vez de 'finalizado'.
--
-- Además amplía la RLS de INSERT de evaluaciones_empresarios a 'cancelado' para
-- habilitar calificar-en-cancelado (reseñas atribuidas y visibles a ambas partes,
-- decisión de producto). IMPORTANTE: se PRESERVA el check current_user_is_verified()
-- que agregó 20260622130000; esta migración solo amplía el estado, no relaja la
-- verificación.

-- 1. RPC de cancelación.
create or replace function public.cancelar_contratacion(
  p_id_contratacion uuid,
  p_motivo text
) returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id_empresario    uuid;
  v_id_proyecto      uuid;
  v_id_participacion uuid;
  v_estado_periodo   estado_periodo_enum;
begin
  if p_motivo is null or length(btrim(p_motivo)) = 0 then
    raise exception 'Motivo de cancelacion requerido'
      using errcode = 'P0006';
  end if;

  -- Empresario dueño resuelto desde la sesión.
  select em.id_empresario into v_id_empresario
  from public.empresarios em
  where em.id_usuario = auth.uid();

  if v_id_empresario is null then
    raise exception 'Empresario no encontrado'
      using errcode = 'P0003';
  end if;

  -- Contratación → participación → proyecto, validando propiedad del empresario.
  -- for update of c: serializa contra una aceptación/edición concurrente.
  select c.id_participacion, c.estado_periodo, pr.id_proyecto
  into v_id_participacion, v_estado_periodo, v_id_proyecto
  from public.contrataciones c
  join public.participaciones p on p.id_participacion = c.id_participacion
  join public.proyectos pr on pr.id_proyecto = p.id_proyecto
  where c.id_contratacion = p_id_contratacion
    and pr.id_empresario  = v_id_empresario
  for update of c;

  if not found then
    raise exception 'Contratacion no encontrada o no autorizada'
      using errcode = 'P0004';
  end if;

  if v_estado_periodo <> 'vigente' then
    raise exception 'La contratacion no esta vigente'
      using errcode = 'P0005';
  end if;

  -- Cierre por cancelación. Habilita calificaciones (RLS del punto 2).
  update public.proyectos
  set estado = 'cancelado'
  where id_proyecto = v_id_proyecto;

  update public.contrataciones
  set estado_periodo     = 'cancelado',
      motivo_cancelacion = p_motivo,
      updated_at         = now()
  where id_contratacion = p_id_contratacion;

  update public.participaciones
  set estado = 'cancelada'
  where id_participacion = v_id_participacion;
end;
$$;

revoke all on function public.cancelar_contratacion(uuid, text) from public, anon;
grant execute on function public.cancelar_contratacion(uuid, text) to authenticated;

-- 2. Ampliar la RLS de INSERT de evaluaciones_empresarios a 'cancelado'.
--    Copia fiel de la policy vigente (20260622130000) con el estado ampliado a
--    ('finalizado','cancelado'); se conserva current_user_is_verified().
drop policy if exists evaluaciones_empresarios_insert_estudiante on public.evaluaciones_empresarios;
create policy evaluaciones_empresarios_insert_estudiante on public.evaluaciones_empresarios
  for insert to authenticated
  with check (
    (
      id_estudiante in (
        select estudiantes.id_estudiante
        from public.estudiantes
        where estudiantes.id_usuario = (select auth.uid())
      )
      and exists (
        select 1
        from public.contrataciones c
        join public.participaciones pa on pa.id_participacion = c.id_participacion
        where c.id_contratacion = evaluaciones_empresarios.id_contratacion
          and pa.id_estudiante = evaluaciones_empresarios.id_estudiante
          and c.estado_periodo in ('finalizado'::estado_periodo_enum, 'cancelado'::estado_periodo_enum)
      )
    )
    and public.current_user_is_verified()
  );
