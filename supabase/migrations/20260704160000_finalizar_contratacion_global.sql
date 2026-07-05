-- Finalización GLOBAL de la contratación (decisión soberana del empresario).
--
-- Hasta ahora la única forma de finalizar un proyecto era aprobar un entregable de
-- tipo 'final' (`finalizar_proyecto_por_entregable`), lo que acopla "entregar
-- trabajo" con "dar por terminada la contratación" y obliga a designar por
-- adelantado cuál entrega es la última. Este RPC desacopla: el empresario finaliza
-- cuando decide, sin pasar por un entregable. La app deja de crear entregables
-- 'final' (las tareas quedan planas) y `responderEntregable` deja de finalizar al
-- aprobar; el enum `tipo_entregable` se mantiene intacto (no requiere migración de
-- esquema).
--
-- Hace los tres cierres en UNA transacción, con la fila de la contratación
-- bloqueada, y `security invoker` (la RLS del empresario aplica igual — es la misma
-- estrategia de `finalizar_proyecto_por_entregable`). Poner
-- `estado_periodo='finalizado'` habilita las calificaciones mutuas (la RLS de
-- evaluaciones lo exige). Las tareas abiertas quedan como histórico, no se tocan.

create or replace function public.finalizar_contratacion(
  p_id_contratacion uuid
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

  -- Cierre: proyecto, contratación y participación. Habilita calificaciones.
  update public.proyectos
  set estado = 'finalizado'
  where id_proyecto = v_id_proyecto;

  update public.contrataciones
  set estado_periodo = 'finalizado',
      updated_at     = now()
  where id_contratacion = p_id_contratacion;

  update public.participaciones
  set estado = 'finalizada'
  where id_participacion = v_id_participacion;
end;
$$;

revoke all on function public.finalizar_contratacion(uuid) from public, anon;
grant execute on function public.finalizar_contratacion(uuid) to authenticated;
