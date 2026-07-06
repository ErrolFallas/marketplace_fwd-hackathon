-- ============================================================
-- Republicar: una sola vez por cancelación + plazo elegible
-- ============================================================
-- Dos arreglos sobre el flujo de republicar (RPC de 20260706140000):
--
-- 1) IDEMPOTENCIA. El RPC clonaba el proyecto pero nunca marcaba el origen, que
--    quedaba 'cancelado' para siempre -> el boton seguia visible y se podia
--    republicar infinitas veces (X proyectos duplicados). Se agrega la columna
--    proyectos.republicado_a (id del clon) y el RPC:
--      - bloquea si el origen ya tiene republicado_a (errcode P0008),
--      - al final marca republicado_a = <nuevo> en la MISMA transaccion, bajo el
--        `for update` que ya serializa. Un republish por cancelacion; si el clon
--        se cancela, su propio republicado_a arranca null y se republica otra vez.
--
-- 2) PLAZO ELEGIBLE. Antes reusaba el plazo original; ahora el empresario elige
--    p_plazo_dias (5-15, validado; errcode P0009), espejo de publicar_proyecto.
--    La firma cambia (nuevo parametro), asi que se DROPEA la version de 1 arg.

alter table public.proyectos
  add column if not exists republicado_a uuid references public.proyectos(id_proyecto);

drop function if exists public.republicar_proyecto(uuid);

create or replace function public.republicar_proyecto(
  p_id_origen uuid,
  p_plazo_dias integer
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id_empresario uuid;
  v_nuevo         uuid;
  v_origen        public.proyectos%rowtype;
  v_fecha_pub     timestamptz := date_trunc('day', now());
begin
  if p_plazo_dias is null or p_plazo_dias < 5 or p_plazo_dias > 15 then
    raise exception 'Plazo fuera de rango (5-15)' using errcode = 'P0009';
  end if;

  -- Empresario dueño resuelto desde la sesión.
  select em.id_empresario into v_id_empresario
  from public.empresarios em
  where em.id_usuario = auth.uid();

  if v_id_empresario is null then
    raise exception 'Empresario no encontrado' using errcode = 'P0003';
  end if;

  -- Cargar el origen validando propiedad; `for update` serializa contra un
  -- republish concurrente (dos clicks / dos pestañas).
  select * into v_origen
  from public.proyectos
  where id_proyecto  = p_id_origen
    and id_empresario = v_id_empresario
  for update;

  if not found then
    raise exception 'Proyecto no encontrado o no autorizado'
      using errcode = 'P0004';
  end if;

  if v_origen.estado <> 'cancelado' then
    raise exception 'Solo se republica un proyecto cancelado'
      using errcode = 'P0007';
  end if;

  if v_origen.republicado_a is not null then
    raise exception 'El proyecto ya fue republicado'
      using errcode = 'P0008';
  end if;

  -- Copia exacta con id nuevo, estado 'abierto', ventana nueva desde hoy con el
  -- plazo elegido. El CHECK chk_proyectos_plazo (5..15) siempre pasa.
  insert into public.proyectos (
    id_empresario, id_area_negocio, titulo, descripcion,
    requerimientos_funcionales, involucra_ia, generado_por_ia,
    modalidad, pais_iso_proyecto, region_proyecto, moneda,
    presupuesto_min, presupuesto_max, estado,
    fecha_publicacion, fecha_cierre
  ) values (
    v_origen.id_empresario, v_origen.id_area_negocio, v_origen.titulo, v_origen.descripcion,
    v_origen.requerimientos_funcionales, v_origen.involucra_ia, v_origen.generado_por_ia,
    v_origen.modalidad, v_origen.pais_iso_proyecto, v_origen.region_proyecto, v_origen.moneda,
    v_origen.presupuesto_min, v_origen.presupuesto_max, 'abierto',
    v_fecha_pub, v_fecha_pub + make_interval(days => p_plazo_dias)
  )
  returning id_proyecto into v_nuevo;

  -- Copiar puentes N:M.
  insert into public.proyecto_tecnologias (id_proyecto, id_tecnologia)
  select v_nuevo, id_tecnologia
  from public.proyecto_tecnologias
  where id_proyecto = p_id_origen;

  insert into public.proyecto_categorias (id_proyecto, id_categoria)
  select v_nuevo, id_categoria
  from public.proyecto_categorias
  where id_proyecto = p_id_origen;

  -- Gate durable: marca el origen para que no se pueda volver a republicar.
  update public.proyectos
  set republicado_a = v_nuevo
  where id_proyecto = p_id_origen;

  return v_nuevo;
end;
$$;

revoke all on function public.republicar_proyecto(uuid, integer) from public, anon;
grant execute on function public.republicar_proyecto(uuid, integer) to authenticated;
