-- ============================================================
-- MIGRACIÓN 20260706140000 — Republicar un proyecto cancelado
-- ============================================================
-- Segunda mitad del flujo de cancelación: tras cancelar (proyecto → 'cancelado',
-- terminal), el empresario puede republicar con un botón manual. Republicar hace
-- una COPIA EXACTA del proyecto cancelado en un id NUEVO, estado 'abierto', con una
-- ventana de plazo nueva desde hoy (reusando el plazo original). No pasa por el form
-- ni por la IA (que reformularía la propuesta): copia la fila tal cual.
--
-- SECURITY DEFINER para insertar saltando RLS, pero valida dueño + estado
-- 'cancelado' adentro. Copia la fila + los puentes N:M (tecnologías, categorías) en
-- UNA transacción. Incluye `requerimientos_funcionales` (columna agregada en
-- 20260706120000). Idempotente: create or replace.
-- ============================================================

create or replace function public.republicar_proyecto(
  p_id_origen uuid
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
  v_plazo         interval;
begin
  -- Empresario dueño resuelto desde la sesión.
  select em.id_empresario into v_id_empresario
  from public.empresarios em
  where em.id_usuario = auth.uid();

  if v_id_empresario is null then
    raise exception 'Empresario no encontrado' using errcode = 'P0003';
  end if;

  -- Cargar el origen validando propiedad + que esté cancelado.
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

  -- Plazo original (5-15 días garantizado al publicar); fallback 15 si faltara.
  v_plazo := coalesce(
    v_origen.fecha_cierre - v_origen.fecha_publicacion,
    make_interval(days => 15)
  );

  -- Copia exacta con id nuevo, estado 'abierto', ventana nueva desde hoy.
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
    v_fecha_pub, v_fecha_pub + v_plazo
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

  return v_nuevo;
end;
$$;

revoke all on function public.republicar_proyecto(uuid) from public, anon;
grant execute on function public.republicar_proyecto(uuid) to authenticated;
