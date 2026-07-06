-- Tercer apartado de la propuesta de IA (RF-57): requerimientos funcionales
-- (criterios de aceptación para el programador). Se genera como array en la
-- propuesta (`propuesta_generada`/`propuesta_aprobada` jsonb) y al publicar se
-- persiste en su propia columna del proyecto para mostrarlo al egresado en el
-- detalle del marketplace (que lee `proyectos` con `select('*')`).

-- 1. Columna nueva. NOT NULL con default '[]' para no romper filas existentes.
alter table public.proyectos
  add column if not exists requerimientos_funcionales jsonb not null default '[]'::jsonb;

comment on column public.proyectos.requerimientos_funcionales is
  'Criterios de aceptación (array de strings) generados por la IA; RF-57. Se copian de la propuesta al publicar.';

-- 2. Recrear `publicar_proyecto` para copiar el campo desde `p_propuesta`.
--    Firma idéntica a la versión previa (no cambia database.ts en su forma de
--    parámetros): solo se agrega una columna al INSERT.
create or replace function public.publicar_proyecto(
  p_conversacion uuid,
  p_titulo character varying,
  p_descripcion text,
  p_id_area uuid,
  p_modalidad modalidad_enum,
  p_pais_iso character varying,
  p_region character varying,
  p_moneda moneda_enum,
  p_presupuesto_min numeric,
  p_presupuesto_max numeric,
  p_plazo_dias integer,
  p_categorias uuid[],
  p_tecnologias uuid[],
  p_propuesta jsonb,
  p_involucra_ia boolean,
  p_generado_por_ia boolean
)
returns uuid
language plpgsql
set search_path to 'public'
as $function$
declare
  v_empresario uuid;
  v_proyecto   uuid;
  v_fecha_pub    timestamptz := date_trunc('day', now());
  v_fecha_cierre timestamptz;
  v_requerimientos jsonb;
begin
  -- 1. Resolver el empresario del usuario autenticado.
  select id_empresario into v_empresario
  from public.empresarios
  where id_usuario = auth.uid();

  if v_empresario is null then
    raise exception 'EMPRESARIO_NO_ENCONTRADO';
  end if;

  -- 2. Validación dura de plazo (RF-21): duración entre 5 y 15 días.
  if p_plazo_dias is null or p_plazo_dias < 5 or p_plazo_dias > 15 then
    raise exception 'PLAZO_INVALIDO';
  end if;

  v_fecha_cierre := v_fecha_pub + make_interval(days => p_plazo_dias);

  -- Requerimientos funcionales: solo si vienen como array en la propuesta;
  -- cualquier otra cosa (ausente, null, no-array) cae a '[]'.
  v_requerimientos := case
    when jsonb_typeof(p_propuesta -> 'requerimientosFuncionales') = 'array'
      then p_propuesta -> 'requerimientosFuncionales'
    else '[]'::jsonb
  end;

  -- 3. Insertar el proyecto. RLS exige empresario verificado; los CHECK de
  --    plazo/ubicación/presupuesto validan los datos.
  insert into public.proyectos (
    id_empresario, id_area_negocio, titulo, descripcion,
    requerimientos_funcionales,
    involucra_ia, generado_por_ia,
    modalidad, pais_iso_proyecto, region_proyecto, moneda,
    presupuesto_min, presupuesto_max, estado,
    fecha_publicacion, fecha_cierre
  ) values (
    v_empresario, p_id_area, p_titulo, p_descripcion,
    v_requerimientos,
    p_involucra_ia, p_generado_por_ia,
    p_modalidad, p_pais_iso, p_region, p_moneda,
    p_presupuesto_min, p_presupuesto_max, 'abierto',
    v_fecha_pub, v_fecha_cierre
  )
  returning id_proyecto into v_proyecto;

  -- 4. Puentes N:M (RF-19 categorías, RF-22 tecnologías).
  if p_categorias is not null and array_length(p_categorias, 1) is not null then
    insert into public.proyecto_categorias (id_proyecto, id_categoria)
    select v_proyecto, unnest(p_categorias);
  end if;

  if p_tecnologias is not null and array_length(p_tecnologias, 1) is not null then
    insert into public.proyecto_tecnologias (id_proyecto, id_tecnologia)
    select v_proyecto, unnest(p_tecnologias);
  end if;

  -- 5. Cerrar la conversación y enlazarla al proyecto (flujo paso 7).
  update public.conversaciones_ia
  set id_proyecto        = v_proyecto,
      propuesta_aprobada = p_propuesta,
      estado             = 'finalizada',
      fecha_fin          = now()
  where id_conversacion = p_conversacion
    and id_empresario   = v_empresario;

  return v_proyecto;
end;
$function$;
