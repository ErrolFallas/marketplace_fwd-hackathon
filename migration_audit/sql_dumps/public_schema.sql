


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


CREATE TYPE "public"."alcance_enum" AS ENUM (
    'nacional',
    'internacional',
    'ambos'
);


ALTER TYPE "public"."alcance_enum" OWNER TO "postgres";


CREATE TYPE "public"."estado_consent_portafolio_enum" AS ENUM (
    'pendiente',
    'aprobado',
    'revocado'
);


ALTER TYPE "public"."estado_consent_portafolio_enum" OWNER TO "postgres";


CREATE TYPE "public"."estado_conv_ia_enum" AS ENUM (
    'en_curso',
    'finalizada',
    'abandonada'
);


ALTER TYPE "public"."estado_conv_ia_enum" OWNER TO "postgres";


CREATE TYPE "public"."estado_cuenta_enum" AS ENUM (
    'pendiente',
    'activa',
    'suspendida',
    'suspendida_severa'
);


ALTER TYPE "public"."estado_cuenta_enum" OWNER TO "postgres";


CREATE TYPE "public"."estado_entregable_enum" AS ENUM (
    'enviado',
    'en_revision',
    'aprobado',
    'con_cambios'
);


ALTER TYPE "public"."estado_entregable_enum" OWNER TO "postgres";


CREATE TYPE "public"."estado_moderacion_enum" AS ENUM (
    'pendiente',
    'en_revision',
    'resuelto_a_favor',
    'resuelto_en_contra',
    'descartado'
);


ALTER TYPE "public"."estado_moderacion_enum" OWNER TO "postgres";


CREATE TYPE "public"."estado_participacion_enum" AS ENUM (
    'enviada',
    'en_revision',
    'contratada',
    'no_seleccionada',
    'retirada',
    'finalizada',
    'cancelada'
);


ALTER TYPE "public"."estado_participacion_enum" OWNER TO "postgres";


CREATE TYPE "public"."estado_periodo_enum" AS ENUM (
    'vigente',
    'pausado',
    'finalizado',
    'cancelado'
);


ALTER TYPE "public"."estado_periodo_enum" OWNER TO "postgres";


CREATE TYPE "public"."estado_proyecto_enum" AS ENUM (
    'borrador',
    'abierto',
    'en_recepcion',
    'adjudicado',
    'en_desarrollo',
    'finalizado',
    'cancelado'
);


ALTER TYPE "public"."estado_proyecto_enum" OWNER TO "postgres";


CREATE TYPE "public"."estado_verif_enum" AS ENUM (
    'pendiente',
    'verificado',
    'rechazado'
);


ALTER TYPE "public"."estado_verif_enum" OWNER TO "postgres";


CREATE TYPE "public"."modalidad_enum" AS ENUM (
    'remoto',
    'hibrido',
    'presencial'
);


ALTER TYPE "public"."modalidad_enum" OWNER TO "postgres";


CREATE TYPE "public"."moneda_enum" AS ENUM (
    'USD',
    'CRC'
);


ALTER TYPE "public"."moneda_enum" OWNER TO "postgres";


CREATE TYPE "public"."motivo_strike_enum" AS ENUM (
    'no_entrego',
    'abandono_proyecto',
    'conducta_inapropiada',
    'calificacion_baja_repetida',
    'fraude',
    'ghosting',
    'otro'
);


ALTER TYPE "public"."motivo_strike_enum" OWNER TO "postgres";


CREATE TYPE "public"."nivel_admin_enum" AS ENUM (
    'superadmin',
    'admin',
    'moderador'
);


ALTER TYPE "public"."nivel_admin_enum" OWNER TO "postgres";


CREATE TYPE "public"."nivel_habilidad_enum" AS ENUM (
    'basico',
    'intermedio',
    'avanzado'
);


ALTER TYPE "public"."nivel_habilidad_enum" OWNER TO "postgres";


CREATE TYPE "public"."nivel_tecnico_enum" AS ENUM (
    'no_tecnico',
    'basico',
    'intermedio',
    'avanzado'
);


ALTER TYPE "public"."nivel_tecnico_enum" OWNER TO "postgres";


CREATE TYPE "public"."origen_portafolio_enum" AS ENUM (
    'plataforma_no_contratada',
    'plataforma_contratada',
    'independiente'
);


ALTER TYPE "public"."origen_portafolio_enum" OWNER TO "postgres";


CREATE TYPE "public"."tipo_comentario_enum" AS ENUM (
    'revision_solicitada',
    'aclaracion',
    'aprobacion',
    'rechazo'
);


ALTER TYPE "public"."tipo_comentario_enum" OWNER TO "postgres";


CREATE TYPE "public"."tipo_consentimiento_enum" AS ENUM (
    'ia',
    'cotejo_fwd',
    'terminos_servicio',
    'politica_privacidad'
);


ALTER TYPE "public"."tipo_consentimiento_enum" OWNER TO "postgres";


CREATE TYPE "public"."tipo_dato_enum" AS ENUM (
    'integer',
    'decimal',
    'boolean',
    'string'
);


ALTER TYPE "public"."tipo_dato_enum" OWNER TO "postgres";


CREATE TYPE "public"."tipo_empresario_enum" AS ENUM (
    'empresa_formal',
    'emprendedor'
);


ALTER TYPE "public"."tipo_empresario_enum" OWNER TO "postgres";


CREATE TYPE "public"."tipo_entregable_enum" AS ENUM (
    'parcial',
    'final'
);


ALTER TYPE "public"."tipo_entregable_enum" OWNER TO "postgres";


CREATE TYPE "public"."tipo_notificacion_enum" AS ENUM (
    'mensaje_nuevo',
    'postulacion_recibida',
    'plazo_vence',
    'participacion_no_seleccionada',
    'participacion_contratada',
    'entregable_aprobado',
    'entregable_rechazado',
    'evaluacion_recibida',
    'cuenta_verificada',
    'cuenta_suspendida',
    'strike_recibido',
    'proyecto_modificado',
    'participacion_en_revision',
    'entregable_enviado',
    'cuenta_rechazada'
);


ALTER TYPE "public"."tipo_notificacion_enum" OWNER TO "postgres";


CREATE TYPE "public"."tipo_reporte_enum" AS ENUM (
    'conducta_abusiva',
    'contenido_inapropiado',
    'spam',
    'fraude',
    'otro'
);


ALTER TYPE "public"."tipo_reporte_enum" OWNER TO "postgres";


CREATE TYPE "public"."titulo_fwd_enum" AS ENUM (
    'frontend',
    'backend',
    'fullstack'
);


ALTER TYPE "public"."titulo_fwd_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."activar_cuenta_al_confirmar_correo"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if new.email_confirmed_at is not null
     and (tg_op = 'INSERT' or old.email_confirmed_at is null) then
    update public.usuarios
       set estado_cuenta = 'activa'
     where id_usuario = new.id
       and estado_cuenta = 'pendiente';
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."activar_cuenta_al_confirmar_correo"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."actualizar_strikes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare total_activos integer; umbral integer;
begin
  select count(*) into total_activos from strikes where id_usuario = new.id_usuario and revocado = false;
  update usuarios set cantidad_strikes = total_activos where id_usuario = new.id_usuario;
  select valor::integer into umbral from configuracion_sistema where clave = 'strikes_para_suspension';
  if umbral is null then umbral := 3; end if;
  if total_activos >= umbral then
    update usuarios set estado_cuenta = 'suspendida', suspendido_at = now()
    where id_usuario = new.id_usuario and estado_cuenta not in ('suspendida','suspendida_severa');
  end if;
  return new;
end; $$;


ALTER FUNCTION "public"."actualizar_strikes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."actualizar_url_participacion"("p_id_participacion" "uuid", "p_url" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_id_estudiante uuid;
begin
  if p_url is not null and p_url !~ '^https?://' then
    raise exception 'URL invalida: debe comenzar con http:// o https://'
      using errcode = 'P0001';
  end if;

  if p_url is not null and length(p_url) > 150 then
    raise exception 'URL demasiado larga (max 150 caracteres)'
      using errcode = 'P0002';
  end if;

  select e.id_estudiante into v_id_estudiante
  from public.estudiantes e
  where e.id_usuario = auth.uid();

  if v_id_estudiante is null then
    raise exception 'No autorizado'
      using errcode = 'P0003';
  end if;

  update public.participaciones
  set
    url_repositorio_proyecto = p_url,
    updated_at               = now()
  where id_participacion = p_id_participacion
    and id_estudiante    = v_id_estudiante;

  if not found then
    raise exception 'Participacion no encontrada o no autorizada'
      using errcode = 'P0004';
  end if;
end;
$$;


ALTER FUNCTION "public"."actualizar_url_participacion"("p_id_participacion" "uuid", "p_url" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."adjudicar_participacion"("p_id_participacion" "uuid", "p_id_proyecto" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_empresario uuid;
  v_estado     estado_participacion_enum;
begin
  -- 1. Empresario del usuario autenticado.
  select id_empresario into v_empresario
  from public.empresarios
  where id_usuario = auth.uid();

  if v_empresario is null then
    raise exception 'EMPRESARIO_NO_ENCONTRADO';
  end if;

  -- 2. La participación debe existir, pertenecer al proyecto indicado y ese
  --    proyecto ser del empresario. Leemos su estado de paso.
  select pa.estado into v_estado
  from public.participaciones pa
  join public.proyectos p on p.id_proyecto = pa.id_proyecto
  where pa.id_participacion = p_id_participacion
    and pa.id_proyecto      = p_id_proyecto
    and p.id_empresario     = v_empresario;

  if v_estado is null then
    raise exception 'PARTICIPACION_NO_ENCONTRADA';
  end if;

  if v_estado <> 'en_revision' then
    raise exception 'TRANSICION_INVALIDA';
  end if;

  -- 3. Ganador -> contratada (dispara crear_contratacion_al_adjudicar).
  update public.participaciones
  set estado = 'contratada'
  where id_participacion = p_id_participacion;

  -- 4a. Sobres cerrados (enviada) -> en_revision. Paso legal y transitorio para
  --     no violar la máquina de estados (no existe enviada -> no_seleccionada
  --     directo); el estado intermedio es invisible fuera de esta transacción.
  update public.participaciones
  set estado = 'en_revision'
  where id_proyecto      = p_id_proyecto
    and estado           = 'enviada'
    and id_participacion <> p_id_participacion;

  -- 4b. Resto de ofertas en revisión (las ya revisadas + las recién barridas)
  --     -> no_seleccionada.
  update public.participaciones
  set estado = 'no_seleccionada',
      no_seleccionada_at = now()
  where id_proyecto      = p_id_proyecto
    and estado           = 'en_revision'
    and id_participacion <> p_id_participacion;

  -- 5. Proyecto -> adjudicado.
  update public.proyectos
  set estado = 'adjudicado'
  where id_proyecto = p_id_proyecto;
end;
$$;


ALTER FUNCTION "public"."adjudicar_participacion"("p_id_participacion" "uuid", "p_id_proyecto" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."adjudicar_participacion"("p_id_participacion" "uuid", "p_id_proyecto" "uuid") IS 'Adjudica un proyecto a una participación de forma atómica (RF-37 + RF-39): ganador a contratada (crea contratación vía trigger), el resto de ofertas vivas (revisadas Y sobres cerrados, estos vía enviada->en_revision->no_seleccionada) a no_seleccionada, y proyecto a adjudicado, en una sola transacción. SECURITY INVOKER: respeta RLS y la máquina de estados.';



CREATE OR REPLACE FUNCTION "public"."assign_my_role"("p_role" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  raise exception 'assign_my_role_deprecated: use completarOnboarding/crearPerfilUsuario para crear rol y perfil juntos'
    using errcode = 'P0001';
end;
$$;


ALTER FUNCTION "public"."assign_my_role"("p_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_set_estado_entregable_final"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  if new.tipo_entregable = 'final' then
    new.estado := 'en_revision';
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."auto_set_estado_entregable_final"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_mensaje_rate_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_window constant interval := interval '10 seconds';
  v_max    constant integer  := 10;
  v_count  integer;
begin
  select count(*) into v_count
  from mensajes
  where id_remitente = new.id_remitente
    and fecha_envio > now() - v_window;

  if v_count >= v_max then
    raise exception 'rate_limit_exceeded'
      using errcode = 'P0001',
            hint = 'Demasiados mensajes en poco tiempo';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."check_mensaje_rate_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."crear_contratacion_al_adjudicar"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if new.estado = 'contratada' and (old.estado is null or old.estado <> 'contratada') then
    insert into contrataciones (id_participacion, fecha_inicio, estado_periodo)
    values (new.id_participacion, current_date, 'vigente')
    on conflict (id_participacion) do nothing;
  end if;
  return new;
end; $$;


ALTER FUNCTION "public"."crear_contratacion_al_adjudicar"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_is_verified"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select exists (
    select 1 from public.estudiantes e
    where e.id_usuario = (select auth.uid()) and e.estado_verificacion = 'verificado'
  ) or exists (
    select 1 from public.empresarios em
    where em.id_usuario = (select auth.uid()) and em.estado_verificacion = 'verificado'
  );
$$;


ALTER FUNCTION "public"."current_user_is_verified"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emitir_avisos_plazo_vence"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_horas    integer;
  v_emitidas integer;
begin
  select coalesce(nullif(valor, '')::integer, 24) into v_horas
  from public.configuracion_sistema
  where clave = 'plazo_aviso_horas';
  if v_horas is null then v_horas := 24; end if;

  with objetivo as (
    select pa.id_participacion, pa.id_estudiante, p.id_proyecto, p.titulo
    from public.participaciones pa
    join public.proyectos p on p.id_proyecto = pa.id_proyecto
    where p.estado in ('abierto', 'en_recepcion')
      and p.is_active = true
      and p.fecha_cierre is not null
      and p.fecha_cierre >  now()
      and p.fecha_cierre <= now() + make_interval(hours => v_horas)
      and pa.estado in ('enviada', 'en_revision')
      and pa.plazo_aviso_enviado_at is null
  ),
  marcadas as (
    update public.participaciones pa
    set plazo_aviso_enviado_at = now()
    from objetivo o
    where pa.id_participacion = o.id_participacion
    returning o.id_estudiante, o.id_proyecto, o.titulo
  )
  insert into public.notificaciones (id_usuario, tipo_evento, mensaje, url_destino, params, leida)
  select
    est.id_usuario,
    'plazo_vence',
    left('La ventana de ofertas de "' || m.titulo || '" esta por cerrar.', 255),
    '/es/egresado/projects/' || m.id_proyecto,
    jsonb_build_object('titulo', m.titulo),
    false
  from marcadas m
  join public.estudiantes est on est.id_estudiante = m.id_estudiante;

  get diagnostics v_emitidas = row_count;
  return v_emitidas;
end;
$$;


ALTER FUNCTION "public"."emitir_avisos_plazo_vence"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."finalizar_proyecto_por_entregable"("p_id_entregable" "uuid", "p_comentario" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_empresario       uuid;
  v_id_contratacion  uuid;
  v_id_participacion uuid;
  v_id_proyecto      uuid;
  v_tipo             tipo_entregable_enum;
  v_estado_ent       estado_entregable_enum;
begin
  -- 1. Empresario del usuario autenticado.
  select id_empresario into v_empresario
  from public.empresarios
  where id_usuario = auth.uid();

  if v_empresario is null then
    raise exception 'EMPRESARIO_NO_ENCONTRADO';
  end if;

  -- 2. Resolver la cadena entregable -> contrataciÃ³n -> participaciÃ³n -> proyecto
  --    y comprobar que el proyecto es del empresario.
  select e.tipo_entregable, e.estado, e.id_contratacion,
         c.id_participacion, pa.id_proyecto
    into v_tipo, v_estado_ent, v_id_contratacion, v_id_participacion, v_id_proyecto
  from public.entregables e
  join public.contrataciones  c  on c.id_contratacion  = e.id_contratacion
  join public.participaciones pa on pa.id_participacion = c.id_participacion
  join public.proyectos       p  on p.id_proyecto       = pa.id_proyecto
  where e.id_entregable = p_id_entregable
    and p.id_empresario = v_empresario;

  if v_id_proyecto is null then
    raise exception 'ENTREGABLE_NO_ENCONTRADO';
  end if;

  if v_tipo <> 'final' then
    raise exception 'ENTREGABLE_NO_FINAL';
  end if;

  -- Acepta 'enviado' (filas previas al deploy de este trigger) y 'en_revision'
  -- (estado que el trigger trg_auto_estado_entregable_final asigna desde ahora).
  if v_estado_ent not in ('enviado', 'en_revision') then
    raise exception 'ESTADO_INVALIDO';
  end if;

  -- 3. Aprobar el entregable final (con el proyecto aÃºn en adjudicado/en_desarrollo).
  -- ORDEN CRÃTICO: se aprueba el entregable ANTES de cambiar el proyecto. El
  -- trigger trg_validar_estado_entregable exige que el proyecto estÃ© en
  -- ('adjudicado','en_desarrollo') para tocar entregables; si finalizÃ¡ramos
  -- el proyecto primero, ese UPDATE del entregable serÃ­a rechazado.
  update public.entregables
  set estado = 'aprobado',
      comentario_empresario = p_comentario
  where id_entregable = p_id_entregable;

  -- 4. Cierre del ciclo: proyecto, contrataciÃ³n y participaciÃ³n.
  update public.proyectos
  set estado = 'finalizado'
  where id_proyecto = v_id_proyecto;

  update public.contrataciones
  set estado_periodo = 'finalizado'
  where id_contratacion = v_id_contratacion;

  update public.participaciones
  set estado = 'finalizada'
  where id_participacion = v_id_participacion;
end;
$$;


ALTER FUNCTION "public"."finalizar_proyecto_por_entregable"("p_id_entregable" "uuid", "p_comentario" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."finalizar_proyecto_por_entregable"("p_id_entregable" "uuid", "p_comentario" "text") IS 'Cierra el ciclo (RF-41) al aprobar el entregable final: aprueba el entregable y pasa proyecto/contrataciÃ³n/participaciÃ³n a finalizado, en una transacciÃ³n. Acepta entregables en estado enviado (filas previas) o en_revision (estado por defecto desde RF-41). Habilita las calificaciones mutuas. SECURITY INVOKER: respeta RLS.';



CREATE OR REPLACE FUNCTION "public"."get_my_account_status"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select u.estado_cuenta::text
  from public.usuarios u
  where u.id_usuario = auth.uid()
$$;


ALTER FUNCTION "public"."get_my_account_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select r.nombre_rol
  from public.usuarios u
  join public.roles r on r.id_rol = u.id_rol
  where u.id_usuario = auth.uid()
    and (
      r.nombre_rol = 'administrador'
      or (
        r.nombre_rol = 'egresado'
        and exists (
          select 1
          from public.estudiantes e
          where e.id_usuario = u.id_usuario
        )
      )
      or (
        r.nombre_rol = 'empresario'
        and exists (
          select 1
          from public.empresarios emp
          where emp.id_usuario = u.id_usuario
        )
      )
    )
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_participaciones_de_proyecto"("p_id_proyecto" "uuid") RETURNS TABLE("id_participacion" "uuid", "estado" "public"."estado_participacion_enum", "estudiante_nombre" character varying, "estudiante_apellido_1" character varying, "estudiante_apellido_2" character varying, "foto_perfil" character varying, "reputacion" numeric, "titulo_fwd" "public"."titulo_fwd_enum", "carta_postulacion" "text", "planteamiento_solucion" "text", "prototipo_enlaces" "text"[], "documentacion_tecnica" character varying, "url_repositorio_proyecto" character varying, "fecha_postulacion" timestamp with time zone, "fecha_entrega_prototipo" timestamp with time zone, "calificacion_prototipo" integer, "comentario_prototipo" "text", "tiene_prototipo" boolean, "tiene_repositorio" boolean, "tiene_documentacion" boolean)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select
    pa.id_participacion,
    pa.estado,
    u.nombre,
    u.apellido_1,
    u.apellido_2,
    u.foto_perfil,
    e.reputacion,
    e.titulo_fwd,
    -- Contenido SELLADO mientras la oferta no se abrió (`enviada`).
    case when pa.estado = 'enviada' then null else pa.carta_postulacion end,
    case when pa.estado = 'enviada' then null else pa.planteamiento_solucion end,
    case when pa.estado = 'enviada' then null::text[] else pa.prototipo_enlaces end,
    case when pa.estado = 'enviada' then null else pa.documentacion_tecnica end,
    case when pa.estado = 'enviada' then null else pa.url_repositorio_proyecto end,
    pa.fecha_postulacion,
    pa.fecha_entrega_prototipo,
    pa.calificacion_prototipo,
    pa.comentario_prototipo,
    -- Booleanos de la tapa: existencia, NO contenido. Se calculan siempre.
    coalesce(cardinality(pa.prototipo_enlaces), 0) > 0,
    pa.url_repositorio_proyecto is not null,
    pa.documentacion_tecnica is not null
  from public.participaciones pa
  join public.estudiantes e on e.id_estudiante = pa.id_estudiante
  join public.usuarios    u on u.id_usuario    = e.id_usuario
  where pa.id_proyecto = p_id_proyecto
    and exists (
      select 1
      from public.proyectos   p
      join public.empresarios emp on emp.id_empresario = p.id_empresario
      where p.id_proyecto = p_id_proyecto
        and emp.id_usuario = auth.uid()
    )
  order by pa.fecha_postulacion desc;
$$;


ALTER FUNCTION "public"."get_participaciones_de_proyecto"("p_id_proyecto" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_participaciones_de_proyecto"("p_id_proyecto" "uuid") IS 'Participaciones de un proyecto con identidad del estudiante (RF-34). Sobre cerrado: oculta el contenido de las `enviada` y expone solo booleanos de existencia. SECURITY DEFINER: reimpone que auth.uid() sea el empresario dueño; si no, devuelve 0 filas.';



CREATE OR REPLACE FUNCTION "public"."guard_empresarios_protected_cols"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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


ALTER FUNCTION "public"."guard_empresarios_protected_cols"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."guard_estudiantes_protected_cols"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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


ALTER FUNCTION "public"."guard_estudiantes_protected_cols"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."guard_participaciones_estudiante_cols"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  if current_user is distinct from 'authenticated' then
    return new;
  end if;

  new.id_participacion       := old.id_participacion;
  new.id_proyecto            := old.id_proyecto;
  new.id_estudiante          := old.id_estudiante;
  new.fecha_postulacion      := old.fecha_postulacion;
  new.carta_postulacion      := old.carta_postulacion;
  new.planteamiento_solucion := old.planteamiento_solucion;
  return new;
end;
$$;


ALTER FUNCTION "public"."guard_participaciones_estudiante_cols"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."guard_usuarios_protected_cols"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  if current_user is distinct from 'authenticated' then
    return new;
  end if;

  new.id_usuario        := old.id_usuario;
  new.correo            := old.correo;
  new.id_rol            := old.id_rol;
  new.nivel_admin       := old.nivel_admin;
  new.estado_cuenta     := old.estado_cuenta;
  new.is_active         := old.is_active;
  new.cantidad_strikes  := old.cantidad_strikes;
  new.intentos_fallidos := old.intentos_fallidos;
  new.bloqueado_hasta   := old.bloqueado_hasta;
  new.suspendido_at     := old.suspendido_at;
  new.fecha_registro    := old.fecha_registro;
  new.ultimo_login_at   := old.ultimo_login_at;
  return new;
end;
$$;


ALTER FUNCTION "public"."guard_usuarios_protected_cols"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_full_name  text;
  v_nombre     varchar(80);
  v_apellido   varchar(80);
begin
  v_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    ''
  );
  v_nombre  := coalesce(nullif(split_part(v_full_name, ' ', 1), ''), split_part(new.email, '@', 1));
  v_apellido := coalesce(nullif(split_part(v_full_name, ' ', 2), ''), '');

  insert into public.usuarios (
    id_usuario,
    nombre,
    apellido_1,
    correo,
    foto_perfil,
    estado_cuenta,
    is_active
  ) values (
    new.id,
    v_nombre,
    v_apellido,
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    'pendiente',
    true
  )
  on conflict (id_usuario) do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."limpiar_huerfanos_oauth"("p_dry_run" boolean DEFAULT true) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_huerfano record;
  v_total integer := 0;
begin
  for v_huerfano in
    select u.id_usuario, u.correo, u.fecha_registro
    from public.usuarios u
    where u.id_rol is null
      and u.fecha_registro < now() - interval '30 days'
  loop
    insert into public.auditoria (
      id_actor, accion, entidad, id_entidad, valores_antes
    ) values (
      null,
      case when p_dry_run then 'huerfano_oauth_detectado'
           else 'huerfano_oauth_eliminado' end,
      'usuarios',
      v_huerfano.id_usuario,
      jsonb_build_object(
        'correo', v_huerfano.correo,
        'fecha_registro', v_huerfano.fecha_registro,
        'dry_run', p_dry_run
      )
    );

    if not p_dry_run then
      delete from auth.users where id = v_huerfano.id_usuario;
    end if;

    v_total := v_total + 1;
  end loop;

  return v_total;
end;
$$;


ALTER FUNCTION "public"."limpiar_huerfanos_oauth"("p_dry_run" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mis_proyectos_como_empresario"() RETURNS SETOF "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select p.id_proyecto
  from public.proyectos p
  join public.empresarios e on e.id_empresario = p.id_empresario
  where e.id_usuario = (select auth.uid())
$$;


ALTER FUNCTION "public"."mis_proyectos_como_empresario"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."mis_proyectos_como_empresario"() IS 'IDs de proyectos del empresario autenticado. SECURITY DEFINER para romper la recursión RLS proyectos<->participaciones; filtra por auth.uid(), no expone datos ajenos.';



CREATE OR REPLACE FUNCTION "public"."mis_proyectos_como_estudiante"() RETURNS SETOF "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select pa.id_proyecto
  from public.participaciones pa
  join public.estudiantes e on e.id_estudiante = pa.id_estudiante
  where e.id_usuario = (select auth.uid())
$$;


ALTER FUNCTION "public"."mis_proyectos_como_estudiante"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."mis_proyectos_como_estudiante"() IS 'IDs de proyectos donde el usuario autenticado participa como estudiante. SECURITY DEFINER para romper la recursión RLS proyectos<->participaciones en INSERT/UPDATE; filtra por auth.uid(), no expone datos ajenos.';



CREATE OR REPLACE FUNCTION "public"."publicar_proyecto"("p_conversacion" "uuid", "p_titulo" character varying, "p_descripcion" "text", "p_id_area" "uuid", "p_modalidad" "public"."modalidad_enum", "p_pais_iso" character varying, "p_region" character varying, "p_moneda" "public"."moneda_enum", "p_presupuesto_min" numeric, "p_presupuesto_max" numeric, "p_plazo_dias" integer, "p_categorias" "uuid"[], "p_tecnologias" "uuid"[], "p_propuesta" "jsonb", "p_involucra_ia" boolean, "p_generado_por_ia" boolean) RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_empresario uuid;
  v_proyecto   uuid;
  v_fecha_pub    timestamptz := date_trunc('day', now());
  v_fecha_cierre timestamptz;
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

  -- 3. Insertar el proyecto. RLS exige empresario verificado; los CHECK de
  --    plazo/ubicación/presupuesto validan los datos.
  insert into public.proyectos (
    id_empresario, id_area_negocio, titulo, descripcion,
    involucra_ia, generado_por_ia,
    modalidad, pais_iso_proyecto, region_proyecto, moneda,
    presupuesto_min, presupuesto_max, estado,
    fecha_publicacion, fecha_cierre
  ) values (
    v_empresario, p_id_area, p_titulo, p_descripcion,
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
$$;


ALTER FUNCTION "public"."publicar_proyecto"("p_conversacion" "uuid", "p_titulo" character varying, "p_descripcion" "text", "p_id_area" "uuid", "p_modalidad" "public"."modalidad_enum", "p_pais_iso" character varying, "p_region" character varying, "p_moneda" "public"."moneda_enum", "p_presupuesto_min" numeric, "p_presupuesto_max" numeric, "p_plazo_dias" integer, "p_categorias" "uuid"[], "p_tecnologias" "uuid"[], "p_propuesta" "jsonb", "p_involucra_ia" boolean, "p_generado_por_ia" boolean) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."publicar_proyecto"("p_conversacion" "uuid", "p_titulo" character varying, "p_descripcion" "text", "p_id_area" "uuid", "p_modalidad" "public"."modalidad_enum", "p_pais_iso" character varying, "p_region" character varying, "p_moneda" "public"."moneda_enum", "p_presupuesto_min" numeric, "p_presupuesto_max" numeric, "p_plazo_dias" integer, "p_categorias" "uuid"[], "p_tecnologias" "uuid"[], "p_propuesta" "jsonb", "p_involucra_ia" boolean, "p_generado_por_ia" boolean) IS 'Publica un proyecto de forma atómica desde la propuesta aprobada. Ubicación como códigos ISO (país 3166-1 en pais_iso_proyecto, región 3166-2 en region_proyecto). El plazo es duración en días (5..15). SECURITY INVOKER: respeta RLS.';



CREATE OR REPLACE FUNCTION "public"."recalcular_reputacion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update estudiantes set reputacion = coalesce(
    (select round(avg(puntuacion)::numeric, 2) from evaluaciones where id_estudiante = new.id_estudiante), 0.00)
  where id_estudiante = new.id_estudiante;
  return new;
end; $$;


ALTER FUNCTION "public"."recalcular_reputacion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recalcular_reputacion_empresario"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.empresarios
  SET reputacion = (
    SELECT ROUND(AVG(puntuacion)::NUMERIC, 2)
    FROM public.evaluaciones_empresarios
    WHERE id_empresario = NEW.id_empresario
  )
  WHERE id_empresario = NEW.id_empresario;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."recalcular_reputacion_empresario"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recalcular_reputacion_estudiante"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.estudiantes
  SET reputacion = (
    SELECT ROUND(AVG(puntuacion)::NUMERIC, 2)
    FROM public.evaluaciones
    WHERE id_estudiante = NEW.id_estudiante
  )
  WHERE id_estudiante = NEW.id_estudiante;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."recalcular_reputacion_estudiante"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."register_failed_login"("p_email" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_max          integer;
  v_lock_minutes integer;
begin
  select coalesce(
    (select valor::int from public.configuracion_sistema
     where clave = 'intentos_login_max' limit 1), 5
  ) into v_max;

  select coalesce(
    (select valor::int from public.configuracion_sistema
     where clave = 'tiempo_bloqueo_minutos' limit 1), 30
  ) into v_lock_minutes;

  -- UPDATE único = atómico a nivel de fila.
  -- Si el correo no existe, la sentencia simplemente no actualiza filas (sin error).
  update public.usuarios
  set
    intentos_fallidos = intentos_fallidos + 1,
    bloqueado_hasta = case
      when intentos_fallidos + 1 >= v_max
        then now() + make_interval(mins => v_lock_minutes)
      else bloqueado_hasta
    end
  where correo = p_email;
end;
$$;


ALTER FUNCTION "public"."register_failed_login"("p_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
declare
  cmd record;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table','partitioned table')
  loop
     if cmd.schema_name is not null and cmd.schema_name in ('public') and cmd.schema_name not in ('pg_catalog','information_schema') and cmd.schema_name not like 'pg_toast%' and cmd.schema_name not like 'pg_temp%' then
      begin
        execute format('alter table if exists %s enable row level security', cmd.object_identity);
        raise log 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      exception
        when others then
          raise log 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      end;
     else
        raise log 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     end if;
  end loop;
end;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_contadores_estudiante"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare id_est uuid;
begin
  id_est := coalesce(new.id_estudiante, old.id_estudiante);
  update estudiantes set
    participaciones_activas = (select count(*) from participaciones
      where id_estudiante = id_est and estado in ('enviada','en_revision','contratada')),
    proyectos_completados = (select count(*) from participaciones
      where id_estudiante = id_est and estado = 'finalizada')
  where id_estudiante = id_est;
  return coalesce(new, old);
end; $$;


ALTER FUNCTION "public"."sync_contadores_estudiante"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_postulaciones_pendientes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare id_proy uuid;
begin
  id_proy := coalesce(new.id_proyecto, old.id_proyecto);
  update proyectos set postulaciones_pendientes_revisar = (
    select count(*) from participaciones where id_proyecto = id_proy and estado = 'enviada')
  where id_proyecto = id_proy;
  return coalesce(new, old);
end; $$;


ALTER FUNCTION "public"."sync_postulaciones_pendientes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validar_cupo_participaciones"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare activas integer; cupo_max integer;
begin
  select valor::integer into cupo_max from configuracion_sistema where clave = 'cupo_max_participaciones';
  if cupo_max is null then cupo_max := 3; end if;
  select count(*) into activas from participaciones
  where id_estudiante = new.id_estudiante and estado in ('enviada','en_revision','contratada');
  if activas >= cupo_max then
    raise exception 'Cupo de % participaciones activas alcanzado', cupo_max using errcode='check_violation';
  end if;
  return new;
end; $$;


ALTER FUNCTION "public"."validar_cupo_participaciones"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validar_estado_proyecto_para_entregable"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare estado_actual estado_proyecto_enum;
begin
  select p.estado into estado_actual
  from proyectos p
  join participaciones pa on pa.id_proyecto = p.id_proyecto
  join contrataciones  c  on c.id_participacion = pa.id_participacion
  where c.id_contratacion = new.id_contratacion;
  if estado_actual not in ('adjudicado','en_desarrollo') then
    raise exception 'No se puede subir entregable: proyecto en estado %', estado_actual using errcode='check_violation';
  end if;
  return new;
end; $$;


ALTER FUNCTION "public"."validar_estado_proyecto_para_entregable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validar_nivel_admin"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare nombre_rol_actual varchar(30);
begin
  select nombre_rol into nombre_rol_actual from roles where id_rol = new.id_rol;
  if nombre_rol_actual = 'administrador' and new.nivel_admin is null then
    raise exception 'Los administradores requieren nivel_admin no nulo' using errcode='check_violation';
  end if;
  if nombre_rol_actual <> 'administrador' and new.nivel_admin is not null then
    raise exception 'nivel_admin solo aplica para rol administrador' using errcode='check_violation';
  end if;
  return new;
end; $$;


ALTER FUNCTION "public"."validar_nivel_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validar_transicion_participacion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  if current_user is distinct from 'authenticated' then
    return new;
  end if;

  if new.estado = old.estado then
    return new;
  end if;

  if (old.estado = 'enviada'     and new.estado in ('en_revision', 'retirada'))
  or (old.estado = 'en_revision' and new.estado in ('contratada', 'no_seleccionada', 'retirada'))
  or (old.estado = 'contratada'  and new.estado in ('finalizada', 'cancelada')) then
    return new;
  end if;

  raise exception 'Transicion de estado invalida: % -> %', old.estado, new.estado
    using errcode = 'check_violation';
end;
$$;


ALTER FUNCTION "public"."validar_transicion_participacion"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."areas_negocio" (
    "id_area" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" character varying(80) NOT NULL,
    "descripcion" character varying(255),
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."areas_negocio" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auditoria" (
    "id_auditoria" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_actor" "uuid",
    "accion" character varying(100) NOT NULL,
    "entidad" character varying(80) NOT NULL,
    "id_entidad" "uuid" NOT NULL,
    "valores_antes" "jsonb",
    "valores_despues" "jsonb",
    "ip_origen" character varying(80),
    "ocurrida_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."auditoria" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categorias" (
    "id_categoria" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" character varying(80) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."categorias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comentarios_entregables" (
    "id_comentario_entregable" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_entregable" "uuid" NOT NULL,
    "id_autor" "uuid" NOT NULL,
    "contenido" "text" NOT NULL,
    "tipo_comentario" "public"."tipo_comentario_enum" NOT NULL,
    "comentado_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."comentarios_entregables" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."configuracion_sistema" (
    "clave" character varying(100) NOT NULL,
    "valor" "text" NOT NULL,
    "tipo_dato" "public"."tipo_dato_enum" NOT NULL,
    "descripcion" "text",
    "modificado_por" "uuid",
    "modificado_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."configuracion_sistema" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."consentimientos" (
    "id_consentimiento" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_usuario" "uuid" NOT NULL,
    "tipo_consentimiento" "public"."tipo_consentimiento_enum" NOT NULL,
    "otorgado" boolean NOT NULL,
    "version_documento" character varying(20),
    "ip_origen" character varying(60),
    "user_agent" character varying(255),
    "consentimiento_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."consentimientos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contrataciones" (
    "id_contratacion" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_participacion" "uuid" NOT NULL,
    "fecha_inicio" "date",
    "fecha_fin_estimada" "date",
    "fecha_fin_real" "date",
    "monto_acordado" numeric(12,2),
    "moneda" "public"."moneda_enum" DEFAULT 'USD'::"public"."moneda_enum" NOT NULL,
    "condiciones_especiales" "text",
    "estado_periodo" "public"."estado_periodo_enum" DEFAULT 'vigente'::"public"."estado_periodo_enum" NOT NULL,
    "motivo_cancelacion" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."contrataciones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversaciones_ia" (
    "id_conversacion" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_empresario" "uuid" NOT NULL,
    "id_proyecto" "uuid",
    "contexto_inicial" "text",
    "contexto_inicial_pdf_url" character varying(150),
    "historial" "jsonb",
    "nivel_tecnico_empresario" "public"."nivel_tecnico_enum",
    "stack_sugerido" "jsonb",
    "propuesta_generada" "jsonb",
    "propuesta_aprobada" "jsonb",
    "estado" "public"."estado_conv_ia_enum" DEFAULT 'en_curso'::"public"."estado_conv_ia_enum" NOT NULL,
    "modelo_ia" character varying(80),
    "fecha_inicio" timestamp with time zone DEFAULT "now"() NOT NULL,
    "fecha_fin" timestamp with time zone,
    "logistica" "jsonb"
);


ALTER TABLE "public"."conversaciones_ia" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."egresados_fwd_oficial" (
    "correo" "text" NOT NULL,
    "fecha_agregado" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."egresados_fwd_oficial" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresarios" (
    "id_empresario" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_usuario" "uuid" NOT NULL,
    "tipo_empresario" "public"."tipo_empresario_enum" NOT NULL,
    "nombre_empresa" character varying(150),
    "sector" character varying(80),
    "descripcion" "text",
    "logo" character varying(150),
    "sitio_web" character varying(150),
    "cedula" character varying(50),
    "alcance_operativo" "public"."alcance_enum",
    "pais_iso_sede" character varying(2),
    "region_sede" character varying(6),
    "estado_verificacion" "public"."estado_verif_enum" DEFAULT 'pendiente'::"public"."estado_verif_enum" NOT NULL,
    "verificado_at" timestamp with time zone,
    "verificado_por" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reputacion" numeric(3,2),
    "motivo_rechazo" "text"
);


ALTER TABLE "public"."empresarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proyectos" (
    "id_proyecto" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_empresario" "uuid" NOT NULL,
    "id_area_negocio" "uuid",
    "titulo" character varying(150) NOT NULL,
    "descripcion" "text" NOT NULL,
    "involucra_ia" boolean DEFAULT false NOT NULL,
    "presupuesto_min" numeric(12,2),
    "presupuesto_max" numeric(12,2),
    "moneda" "public"."moneda_enum" DEFAULT 'USD'::"public"."moneda_enum" NOT NULL,
    "modalidad" "public"."modalidad_enum" NOT NULL,
    "pais_iso_proyecto" character varying(2),
    "region_proyecto" character varying(6),
    "estado" "public"."estado_proyecto_enum" DEFAULT 'borrador'::"public"."estado_proyecto_enum" NOT NULL,
    "motivo_cancelacion" "text",
    "fecha_publicacion" timestamp with time zone,
    "fecha_cierre" timestamp with time zone,
    "postulaciones_pendientes_revisar" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "generado_por_ia" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."proyectos" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."empresarios_public" WITH ("security_invoker"='false') AS
 SELECT "id_empresario",
    "nombre_empresa"
   FROM "public"."empresarios" "e"
  WHERE (EXISTS ( SELECT 1
           FROM "public"."proyectos" "p"
          WHERE (("p"."id_empresario" = "e"."id_empresario") AND ("p"."is_active" = true) AND ("p"."estado" <> 'borrador'::"public"."estado_proyecto_enum"))));


ALTER VIEW "public"."empresarios_public" OWNER TO "postgres";


COMMENT ON VIEW "public"."empresarios_public" IS 'Identidad pública (id + nombre) de empresas con proyectos visibles. Expone solo columnas no sensibles para el marketplace; security_invoker=false intencional (ver migración).';



CREATE TABLE IF NOT EXISTS "public"."entregables" (
    "id_entregable" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_contratacion" "uuid" NOT NULL,
    "tipo_entregable" "public"."tipo_entregable_enum" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "archivo_url" character varying(150),
    "estado" "public"."estado_entregable_enum" DEFAULT 'enviado'::"public"."estado_entregable_enum" NOT NULL,
    "cargado_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "comentario_empresario" "text",
    "archivo_hash" "text"
);


ALTER TABLE "public"."entregables" OWNER TO "postgres";


COMMENT ON COLUMN "public"."entregables"."archivo_hash" IS 'SHA-256 (hex) del contenido del archivo. Dedup por contratacion. Null en filas legacy.';



CREATE TABLE IF NOT EXISTS "public"."estudiantes" (
    "id_estudiante" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_usuario" "uuid" NOT NULL,
    "titulo_fwd" "public"."titulo_fwd_enum",
    "estado_verificacion" "public"."estado_verif_enum" DEFAULT 'pendiente'::"public"."estado_verif_enum" NOT NULL,
    "verificado_at" timestamp with time zone,
    "verificado_por" "uuid",
    "reputacion" numeric(3,2),
    "proyectos_completados" integer DEFAULT 0 NOT NULL,
    "participaciones_activas" integer DEFAULT 0 NOT NULL,
    "descripcion" "text",
    "modalidad_preferida" "public"."modalidad_enum",
    "url_portafolio" character varying(150),
    "portafolio_visible_publicamente" boolean DEFAULT true NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "pais_iso_residencia" character varying(2),
    "region_residencia" character varying(6),
    "motivo_rechazo" "text"
);


ALTER TABLE "public"."estudiantes" OWNER TO "postgres";


COMMENT ON COLUMN "public"."estudiantes"."pais_iso_residencia" IS 'País de residencia del estudiante (ISO 3166-1 alpha-2, ej. CR). Nullable.';



COMMENT ON COLUMN "public"."estudiantes"."region_residencia" IS 'Región/subdivisión de residencia (ISO 3166-2, ej. CR-SJ). Opcional/nullable.';



CREATE TABLE IF NOT EXISTS "public"."evaluaciones" (
    "id_evaluacion" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_contratacion" "uuid" NOT NULL,
    "id_empresario" "uuid" NOT NULL,
    "id_estudiante" "uuid" NOT NULL,
    "puntuacion" integer NOT NULL,
    "comentario" "text",
    "respuesta_evaluado" "text",
    "evaluado_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "evaluaciones_puntuacion_check" CHECK ((("puntuacion" >= 1) AND ("puntuacion" <= 5)))
);


ALTER TABLE "public"."evaluaciones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evaluaciones_empresarios" (
    "id_evaluacion" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_contratacion" "uuid" NOT NULL,
    "id_estudiante" "uuid" NOT NULL,
    "id_empresario" "uuid" NOT NULL,
    "puntuacion" integer NOT NULL,
    "comentario" "text",
    "evaluado_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "respuesta_evaluado" "text",
    CONSTRAINT "evaluaciones_empresarios_puntuacion_check" CHECK ((("puntuacion" >= 1) AND ("puntuacion" <= 5)))
);


ALTER TABLE "public"."evaluaciones_empresarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."habilidades_tecnicas" (
    "id_estudiante" "uuid" NOT NULL,
    "id_tecnologia" "uuid" NOT NULL,
    "nivel" "public"."nivel_habilidad_enum" NOT NULL
);


ALTER TABLE "public"."habilidades_tecnicas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mensajes" (
    "id_mensaje" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_proyecto" "uuid" NOT NULL,
    "id_remitente" "uuid" NOT NULL,
    "contenido" "text" NOT NULL,
    "leido" boolean DEFAULT false NOT NULL,
    "fecha_envio" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mensajes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notificaciones" (
    "id_notificacion" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_usuario" "uuid" NOT NULL,
    "tipo_evento" "public"."tipo_notificacion_enum" NOT NULL,
    "mensaje" character varying(255) NOT NULL,
    "url_destino" character varying(255),
    "leida" boolean DEFAULT false NOT NULL,
    "generada_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "params" "jsonb",
    "correo_enviado_at" timestamp with time zone
);


ALTER TABLE "public"."notificaciones" OWNER TO "postgres";


COMMENT ON COLUMN "public"."notificaciones"."correo_enviado_at" IS 'Idempotencia de correo (RF-46): fecha/hora en que el emisor TS envio el correo de esta notificacion. NULL = aun no enviado. Solo lo escribe el emisor (service_role).';



CREATE TABLE IF NOT EXISTS "public"."participaciones" (
    "id_participacion" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_proyecto" "uuid" NOT NULL,
    "id_estudiante" "uuid" NOT NULL,
    "estado" "public"."estado_participacion_enum" DEFAULT 'enviada'::"public"."estado_participacion_enum" NOT NULL,
    "carta_postulacion" "text",
    "fecha_postulacion" timestamp with time zone DEFAULT "now"() NOT NULL,
    "revision_iniciada_at" timestamp with time zone,
    "planteamiento_solucion" "text" NOT NULL,
    "prototipo_enlaces" "text"[] NOT NULL,
    "documentacion_tecnica" "text",
    "fecha_entrega_prototipo" timestamp with time zone,
    "calificacion_prototipo" integer,
    "comentario_prototipo" "text",
    "adjudicada_at" timestamp with time zone,
    "no_seleccionada_at" timestamp with time zone,
    "retirada_at" timestamp with time zone,
    "motivo_retiro" "text",
    "url_repositorio_proyecto" character varying(150),
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "plazo_aviso_enviado_at" timestamp with time zone,
    CONSTRAINT "participaciones_carta_max_chk" CHECK ((("carta_postulacion" IS NULL) OR ("char_length"("carta_postulacion") <= 2800))),
    CONSTRAINT "participaciones_documentacion_max_chk" CHECK ((("documentacion_tecnica" IS NULL) OR ("char_length"("documentacion_tecnica") <= 300))),
    CONSTRAINT "participaciones_planteamiento_min_chk" CHECK (("char_length"("planteamiento_solucion") >= 30)),
    CONSTRAINT "participaciones_prototipo_enlaces_card_chk" CHECK ((("cardinality"("prototipo_enlaces") >= 1) AND ("cardinality"("prototipo_enlaces") <= 4)))
);


ALTER TABLE "public"."participaciones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."portafolio_tecnologias" (
    "id_portafolio" "uuid" NOT NULL,
    "id_tecnologia" "uuid" NOT NULL
);


ALTER TABLE "public"."portafolio_tecnologias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proyecto_categorias" (
    "id_proyecto" "uuid" NOT NULL,
    "id_categoria" "uuid" NOT NULL
);


ALTER TABLE "public"."proyecto_categorias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proyecto_tecnologias" (
    "id_proyecto" "uuid" NOT NULL,
    "id_tecnologia" "uuid" NOT NULL
);


ALTER TABLE "public"."proyecto_tecnologias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proyectos_portafolio" (
    "id_portafolio" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_estudiante" "uuid" NOT NULL,
    "titulo" character varying(150) NOT NULL,
    "descripcion" "text",
    "imagen_url" character varying(150),
    "fecha" "date",
    "origen" "public"."origen_portafolio_enum" NOT NULL,
    "id_participacion" "uuid",
    "url_repositorio" character varying(150),
    "url_demo" character varying(150),
    "estado_consentimiento" "public"."estado_consent_portafolio_enum",
    "consentimiento_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."proyectos_portafolio" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reportes_moderacion" (
    "id_reporte" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_reportante" "uuid" NOT NULL,
    "id_reportado" "uuid",
    "id_proyecto" "uuid",
    "id_mensaje" "uuid",
    "id_entregable" "uuid",
    "id_portafolio" "uuid",
    "tipo_reporte" "public"."tipo_reporte_enum" NOT NULL,
    "descripcion" "text" NOT NULL,
    "estado_moderacion" "public"."estado_moderacion_enum" DEFAULT 'pendiente'::"public"."estado_moderacion_enum" NOT NULL,
    "resolucion" "text",
    "resuelto_por" "uuid",
    "reportado_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "resuelto_at" timestamp with time zone,
    CONSTRAINT "reportes_moderacion_exactamente_uno_objetivo" CHECK ((((((
CASE
    WHEN ("id_reportado" IS NOT NULL) THEN 1
    ELSE 0
END +
CASE
    WHEN ("id_proyecto" IS NOT NULL) THEN 1
    ELSE 0
END) +
CASE
    WHEN ("id_mensaje" IS NOT NULL) THEN 1
    ELSE 0
END) +
CASE
    WHEN ("id_entregable" IS NOT NULL) THEN 1
    ELSE 0
END) +
CASE
    WHEN ("id_portafolio" IS NOT NULL) THEN 1
    ELSE 0
END) = 1))
);


ALTER TABLE "public"."reportes_moderacion" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id_rol" smallint NOT NULL,
    "nombre_rol" character varying(30) NOT NULL,
    "descripcion" character varying(255)
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


ALTER TABLE "public"."roles" ALTER COLUMN "id_rol" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."roles_id_rol_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."soporte_tickets" (
    "id_ticket" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_usuario" "uuid" NOT NULL,
    "descripcion" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."soporte_tickets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."strikes" (
    "id_strike" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_usuario" "uuid" NOT NULL,
    "id_proyecto" "uuid",
    "id_reporte" "uuid",
    "motivo" "public"."motivo_strike_enum" NOT NULL,
    "descripcion" "text",
    "aplicado_por" "uuid" NOT NULL,
    "aplicado_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "revocado" boolean DEFAULT false NOT NULL,
    "revocado_por" "uuid",
    "motivo_revocacion" "text",
    "revocado_at" timestamp with time zone
);


ALTER TABLE "public"."strikes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tecnologias" (
    "id_tecnologia" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" character varying(80) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."tecnologias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usuarios" (
    "id_usuario" "uuid" NOT NULL,
    "nombre" character varying(80) NOT NULL,
    "apellido_1" character varying(80) NOT NULL,
    "apellido_2" character varying(80),
    "fecha_nacimiento" "date",
    "correo" character varying(150) NOT NULL,
    "id_rol" smallint,
    "foto_perfil" character varying(150),
    "estado_cuenta" "public"."estado_cuenta_enum" DEFAULT 'pendiente'::"public"."estado_cuenta_enum" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "cantidad_strikes" integer DEFAULT 0 NOT NULL,
    "intentos_fallidos" integer DEFAULT 0 NOT NULL,
    "bloqueado_hasta" timestamp with time zone,
    "fecha_registro" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ultimo_login_at" timestamp with time zone,
    "suspendido_at" timestamp with time zone,
    "nivel_admin" "public"."nivel_admin_enum",
    "tipos_notificacion_silenciados" "public"."tipo_notificacion_enum"[] DEFAULT '{}'::"public"."tipo_notificacion_enum"[] NOT NULL
);


ALTER TABLE "public"."usuarios" OWNER TO "postgres";


ALTER TABLE ONLY "public"."areas_negocio"
    ADD CONSTRAINT "areas_negocio_nombre_key" UNIQUE ("nombre");



ALTER TABLE ONLY "public"."areas_negocio"
    ADD CONSTRAINT "areas_negocio_pkey" PRIMARY KEY ("id_area");



ALTER TABLE ONLY "public"."auditoria"
    ADD CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id_auditoria");



ALTER TABLE ONLY "public"."categorias"
    ADD CONSTRAINT "categorias_nombre_key" UNIQUE ("nombre");



ALTER TABLE ONLY "public"."categorias"
    ADD CONSTRAINT "categorias_pkey" PRIMARY KEY ("id_categoria");



ALTER TABLE "public"."proyectos"
    ADD CONSTRAINT "chk_proyectos_plazo" CHECK ((("fecha_publicacion" IS NULL) OR ("fecha_cierre" IS NULL) OR ((("fecha_cierre" - "fecha_publicacion") >= '5 days'::interval) AND (("fecha_cierre" - "fecha_publicacion") <= '15 days'::interval)))) NOT VALID;



ALTER TABLE "public"."proyectos"
    ADD CONSTRAINT "chk_proyectos_presupuesto" CHECK ((("presupuesto_min" IS NULL) OR ("presupuesto_max" IS NULL) OR ("presupuesto_min" <= "presupuesto_max"))) NOT VALID;



ALTER TABLE "public"."proyectos"
    ADD CONSTRAINT "chk_proyectos_ubicacion" CHECK ((("modalidad" = 'remoto'::"public"."modalidad_enum") OR ("pais_iso_proyecto" IS NOT NULL))) NOT VALID;



ALTER TABLE ONLY "public"."comentarios_entregables"
    ADD CONSTRAINT "comentarios_entregables_pkey" PRIMARY KEY ("id_comentario_entregable");



ALTER TABLE ONLY "public"."configuracion_sistema"
    ADD CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("clave");



ALTER TABLE ONLY "public"."consentimientos"
    ADD CONSTRAINT "consentimientos_pkey" PRIMARY KEY ("id_consentimiento");



ALTER TABLE ONLY "public"."contrataciones"
    ADD CONSTRAINT "contrataciones_id_participacion_key" UNIQUE ("id_participacion");



ALTER TABLE ONLY "public"."contrataciones"
    ADD CONSTRAINT "contrataciones_pkey" PRIMARY KEY ("id_contratacion");



ALTER TABLE ONLY "public"."conversaciones_ia"
    ADD CONSTRAINT "conversaciones_ia_pkey" PRIMARY KEY ("id_conversacion");



ALTER TABLE ONLY "public"."egresados_fwd_oficial"
    ADD CONSTRAINT "egresados_fwd_oficial_pkey" PRIMARY KEY ("correo");



ALTER TABLE ONLY "public"."empresarios"
    ADD CONSTRAINT "empresarios_id_usuario_key" UNIQUE ("id_usuario");



ALTER TABLE ONLY "public"."empresarios"
    ADD CONSTRAINT "empresarios_pkey" PRIMARY KEY ("id_empresario");



ALTER TABLE ONLY "public"."entregables"
    ADD CONSTRAINT "entregables_contratacion_version_key" UNIQUE ("id_contratacion", "version");



ALTER TABLE ONLY "public"."entregables"
    ADD CONSTRAINT "entregables_pkey" PRIMARY KEY ("id_entregable");



ALTER TABLE ONLY "public"."estudiantes"
    ADD CONSTRAINT "estudiantes_id_usuario_key" UNIQUE ("id_usuario");



ALTER TABLE ONLY "public"."estudiantes"
    ADD CONSTRAINT "estudiantes_pkey" PRIMARY KEY ("id_estudiante");



ALTER TABLE ONLY "public"."evaluaciones_empresarios"
    ADD CONSTRAINT "evaluaciones_empresarios_pkey" PRIMARY KEY ("id_evaluacion");



ALTER TABLE ONLY "public"."evaluaciones"
    ADD CONSTRAINT "evaluaciones_pkey" PRIMARY KEY ("id_evaluacion");



ALTER TABLE ONLY "public"."habilidades_tecnicas"
    ADD CONSTRAINT "habilidades_tecnicas_pkey" PRIMARY KEY ("id_estudiante", "id_tecnologia");



ALTER TABLE ONLY "public"."mensajes"
    ADD CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id_mensaje");



ALTER TABLE ONLY "public"."notificaciones"
    ADD CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id_notificacion");



ALTER TABLE ONLY "public"."participaciones"
    ADD CONSTRAINT "participaciones_pkey" PRIMARY KEY ("id_participacion");



ALTER TABLE ONLY "public"."participaciones"
    ADD CONSTRAINT "participaciones_proyecto_estudiante_key" UNIQUE ("id_proyecto", "id_estudiante");



ALTER TABLE ONLY "public"."portafolio_tecnologias"
    ADD CONSTRAINT "portafolio_tecnologias_pkey" PRIMARY KEY ("id_portafolio", "id_tecnologia");



ALTER TABLE ONLY "public"."proyecto_categorias"
    ADD CONSTRAINT "proyecto_categorias_pkey" PRIMARY KEY ("id_proyecto", "id_categoria");



ALTER TABLE ONLY "public"."proyecto_tecnologias"
    ADD CONSTRAINT "proyecto_tecnologias_pkey" PRIMARY KEY ("id_proyecto", "id_tecnologia");



ALTER TABLE ONLY "public"."proyectos"
    ADD CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id_proyecto");



ALTER TABLE ONLY "public"."proyectos_portafolio"
    ADD CONSTRAINT "proyectos_portafolio_pkey" PRIMARY KEY ("id_portafolio");



ALTER TABLE ONLY "public"."reportes_moderacion"
    ADD CONSTRAINT "reportes_moderacion_pkey" PRIMARY KEY ("id_reporte");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_nombre_rol_key" UNIQUE ("nombre_rol");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id_rol");



ALTER TABLE ONLY "public"."soporte_tickets"
    ADD CONSTRAINT "soporte_tickets_pkey" PRIMARY KEY ("id_ticket");



ALTER TABLE ONLY "public"."strikes"
    ADD CONSTRAINT "strikes_pkey" PRIMARY KEY ("id_strike");



ALTER TABLE ONLY "public"."tecnologias"
    ADD CONSTRAINT "tecnologias_nombre_key" UNIQUE ("nombre");



ALTER TABLE ONLY "public"."tecnologias"
    ADD CONSTRAINT "tecnologias_pkey" PRIMARY KEY ("id_tecnologia");



ALTER TABLE ONLY "public"."evaluaciones_empresarios"
    ADD CONSTRAINT "uq_contratacion_estudiante" UNIQUE ("id_contratacion", "id_estudiante");



ALTER TABLE ONLY "public"."evaluaciones"
    ADD CONSTRAINT "uq_evaluaciones_contratacion_empresario" UNIQUE ("id_contratacion", "id_empresario");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_correo_key" UNIQUE ("correo");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario");



CREATE UNIQUE INDEX "entregables_contratacion_hash_uniq" ON "public"."entregables" USING "btree" ("id_contratacion", "archivo_hash") WHERE ("archivo_hash" IS NOT NULL);



CREATE INDEX "idx_auditoria_actor" ON "public"."auditoria" USING "btree" ("id_actor", "ocurrida_at" DESC);



CREATE INDEX "idx_auditoria_entidad" ON "public"."auditoria" USING "btree" ("entidad", "id_entidad", "ocurrida_at" DESC);



CREATE INDEX "idx_comentarios_entregable_fecha" ON "public"."comentarios_entregables" USING "btree" ("id_entregable", "comentado_at" DESC);



CREATE INDEX "idx_comentarios_entregables_id_autor" ON "public"."comentarios_entregables" USING "btree" ("id_autor");



CREATE INDEX "idx_consentimientos_usuario_tipo" ON "public"."consentimientos" USING "btree" ("id_usuario", "tipo_consentimiento", "consentimiento_at" DESC);



CREATE INDEX "idx_conversaciones_ia_empresario" ON "public"."conversaciones_ia" USING "btree" ("id_empresario", "fecha_inicio" DESC);



CREATE INDEX "idx_entregables_id_contratacion" ON "public"."entregables" USING "btree" ("id_contratacion");



CREATE INDEX "idx_evaluaciones_emp_id_contratacion" ON "public"."evaluaciones_empresarios" USING "btree" ("id_contratacion");



CREATE INDEX "idx_evaluaciones_emp_id_empresario" ON "public"."evaluaciones_empresarios" USING "btree" ("id_empresario");



CREATE INDEX "idx_evaluaciones_estudiante" ON "public"."evaluaciones" USING "btree" ("id_estudiante");



CREATE INDEX "idx_evaluaciones_id_contratacion" ON "public"."evaluaciones" USING "btree" ("id_contratacion");



CREATE INDEX "idx_evaluaciones_id_empresario" ON "public"."evaluaciones" USING "btree" ("id_empresario");



CREATE INDEX "idx_hab_tec_tecnologia" ON "public"."habilidades_tecnicas" USING "btree" ("id_tecnologia");



CREATE INDEX "idx_mensajes_proyecto_fecha" ON "public"."mensajes" USING "btree" ("id_proyecto", "fecha_envio" DESC);



CREATE INDEX "idx_mensajes_remitente_fecha" ON "public"."mensajes" USING "btree" ("id_remitente", "fecha_envio" DESC);



CREATE INDEX "idx_notificaciones_usuario_leida" ON "public"."notificaciones" USING "btree" ("id_usuario", "leida", "generada_at" DESC);



CREATE INDEX "idx_participaciones_estudiante_estado" ON "public"."participaciones" USING "btree" ("id_estudiante", "estado");



CREATE INDEX "idx_participaciones_proyecto_estado" ON "public"."participaciones" USING "btree" ("id_proyecto", "estado");



CREATE INDEX "idx_portafolio_estudiante" ON "public"."proyectos_portafolio" USING "btree" ("id_estudiante") WHERE ("is_active" = true);



CREATE INDEX "idx_portafolio_tecnologias_tec" ON "public"."portafolio_tecnologias" USING "btree" ("id_tecnologia");



CREATE INDEX "idx_proyecto_categorias_cat" ON "public"."proyecto_categorias" USING "btree" ("id_categoria");



CREATE INDEX "idx_proyecto_tecnologias_tecnologia" ON "public"."proyecto_tecnologias" USING "btree" ("id_tecnologia");



CREATE INDEX "idx_proyectos_area" ON "public"."proyectos" USING "btree" ("id_area_negocio");



CREATE INDEX "idx_proyectos_estado_fecha" ON "public"."proyectos" USING "btree" ("estado", "fecha_publicacion" DESC) WHERE ("is_active" = true);



CREATE INDEX "idx_proyectos_id_empresario" ON "public"."proyectos" USING "btree" ("id_empresario");



CREATE INDEX "idx_reportes_estado" ON "public"."reportes_moderacion" USING "btree" ("estado_moderacion", "reportado_at" DESC) WHERE ("estado_moderacion" = ANY (ARRAY['pendiente'::"public"."estado_moderacion_enum", 'en_revision'::"public"."estado_moderacion_enum"]));



CREATE INDEX "idx_reportes_id_reportante" ON "public"."reportes_moderacion" USING "btree" ("id_reportante");



CREATE INDEX "idx_strikes_id_usuario" ON "public"."strikes" USING "btree" ("id_usuario");



CREATE INDEX "idx_strikes_usuario_activos" ON "public"."strikes" USING "btree" ("id_usuario") WHERE ("revocado" = false);



CREATE INDEX "idx_usuarios_correo" ON "public"."usuarios" USING "btree" ("correo");



CREATE INDEX "idx_usuarios_estado" ON "public"."usuarios" USING "btree" ("estado_cuenta");



CREATE INDEX "idx_usuarios_nivel_admin" ON "public"."usuarios" USING "btree" ("nivel_admin") WHERE ("nivel_admin" IS NOT NULL);



CREATE INDEX "idx_usuarios_rol" ON "public"."usuarios" USING "btree" ("id_rol");



CREATE OR REPLACE TRIGGER "trg_auto_estado_entregable_final" BEFORE INSERT ON "public"."entregables" FOR EACH ROW EXECUTE FUNCTION "public"."auto_set_estado_entregable_final"();



CREATE OR REPLACE TRIGGER "trg_contadores_estudiante" AFTER INSERT OR DELETE OR UPDATE ON "public"."participaciones" FOR EACH ROW EXECUTE FUNCTION "public"."sync_contadores_estudiante"();



CREATE OR REPLACE TRIGGER "trg_contrataciones_updated_at" BEFORE UPDATE ON "public"."contrataciones" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_crear_contratacion" AFTER UPDATE OF "estado" ON "public"."participaciones" FOR EACH ROW EXECUTE FUNCTION "public"."crear_contratacion_al_adjudicar"();



CREATE OR REPLACE TRIGGER "trg_cupo_participaciones" BEFORE INSERT ON "public"."participaciones" FOR EACH ROW EXECUTE FUNCTION "public"."validar_cupo_participaciones"();



CREATE OR REPLACE TRIGGER "trg_empresarios_updated_at" BEFORE UPDATE ON "public"."empresarios" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_entregables_updated_at" BEFORE UPDATE ON "public"."entregables" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_estudiantes_updated_at" BEFORE UPDATE ON "public"."estudiantes" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_guard_empresarios_protected" BEFORE INSERT OR UPDATE ON "public"."empresarios" FOR EACH ROW EXECUTE FUNCTION "public"."guard_empresarios_protected_cols"();



CREATE OR REPLACE TRIGGER "trg_guard_estudiantes_protected" BEFORE INSERT OR UPDATE ON "public"."estudiantes" FOR EACH ROW EXECUTE FUNCTION "public"."guard_estudiantes_protected_cols"();



CREATE OR REPLACE TRIGGER "trg_guard_participaciones_estudiante" BEFORE UPDATE ON "public"."participaciones" FOR EACH ROW EXECUTE FUNCTION "public"."guard_participaciones_estudiante_cols"();



CREATE OR REPLACE TRIGGER "trg_guard_usuarios_protected" BEFORE UPDATE ON "public"."usuarios" FOR EACH ROW EXECUTE FUNCTION "public"."guard_usuarios_protected_cols"();



CREATE OR REPLACE TRIGGER "trg_mensajes_rate_limit" BEFORE INSERT ON "public"."mensajes" FOR EACH ROW EXECUTE FUNCTION "public"."check_mensaje_rate_limit"();



CREATE OR REPLACE TRIGGER "trg_participaciones_updated_at" BEFORE UPDATE ON "public"."participaciones" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_postulaciones_pendientes" AFTER INSERT OR DELETE OR UPDATE ON "public"."participaciones" FOR EACH ROW EXECUTE FUNCTION "public"."sync_postulaciones_pendientes"();



CREATE OR REPLACE TRIGGER "trg_proyectos_updated_at" BEFORE UPDATE ON "public"."proyectos" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_reputacion" AFTER INSERT OR UPDATE OF "puntuacion" ON "public"."evaluaciones" FOR EACH ROW EXECUTE FUNCTION "public"."recalcular_reputacion"();



CREATE OR REPLACE TRIGGER "trg_reputacion_empresario" AFTER INSERT OR UPDATE OF "puntuacion" ON "public"."evaluaciones_empresarios" FOR EACH ROW EXECUTE FUNCTION "public"."recalcular_reputacion_empresario"();



CREATE OR REPLACE TRIGGER "trg_reputacion_estudiante" AFTER INSERT OR UPDATE OF "puntuacion" ON "public"."evaluaciones" FOR EACH ROW EXECUTE FUNCTION "public"."recalcular_reputacion_estudiante"();



CREATE OR REPLACE TRIGGER "trg_strikes_actualizar" AFTER INSERT OR UPDATE OF "revocado" ON "public"."strikes" FOR EACH ROW EXECUTE FUNCTION "public"."actualizar_strikes"();



CREATE OR REPLACE TRIGGER "trg_transicion_participaciones" BEFORE UPDATE OF "estado" ON "public"."participaciones" FOR EACH ROW EXECUTE FUNCTION "public"."validar_transicion_participacion"();



CREATE OR REPLACE TRIGGER "trg_validar_estado_entregable" BEFORE INSERT OR UPDATE ON "public"."entregables" FOR EACH ROW EXECUTE FUNCTION "public"."validar_estado_proyecto_para_entregable"();



CREATE OR REPLACE TRIGGER "trg_validar_nivel_admin" BEFORE INSERT OR UPDATE OF "id_rol", "nivel_admin" ON "public"."usuarios" FOR EACH ROW EXECUTE FUNCTION "public"."validar_nivel_admin"();



ALTER TABLE ONLY "public"."auditoria"
    ADD CONSTRAINT "auditoria_id_actor_fkey" FOREIGN KEY ("id_actor") REFERENCES "public"."usuarios"("id_usuario");



ALTER TABLE ONLY "public"."comentarios_entregables"
    ADD CONSTRAINT "comentarios_entregables_id_autor_fkey" FOREIGN KEY ("id_autor") REFERENCES "public"."usuarios"("id_usuario");



ALTER TABLE ONLY "public"."comentarios_entregables"
    ADD CONSTRAINT "comentarios_entregables_id_entregable_fkey" FOREIGN KEY ("id_entregable") REFERENCES "public"."entregables"("id_entregable") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."configuracion_sistema"
    ADD CONSTRAINT "configuracion_sistema_modificado_por_fkey" FOREIGN KEY ("modificado_por") REFERENCES "public"."usuarios"("id_usuario");



ALTER TABLE ONLY "public"."consentimientos"
    ADD CONSTRAINT "consentimientos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contrataciones"
    ADD CONSTRAINT "contrataciones_id_participacion_fkey" FOREIGN KEY ("id_participacion") REFERENCES "public"."participaciones"("id_participacion");



ALTER TABLE ONLY "public"."conversaciones_ia"
    ADD CONSTRAINT "conversaciones_ia_id_empresario_fkey" FOREIGN KEY ("id_empresario") REFERENCES "public"."empresarios"("id_empresario");



ALTER TABLE ONLY "public"."conversaciones_ia"
    ADD CONSTRAINT "conversaciones_ia_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "public"."proyectos"("id_proyecto");



ALTER TABLE ONLY "public"."empresarios"
    ADD CONSTRAINT "empresarios_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresarios"
    ADD CONSTRAINT "empresarios_verificado_por_fkey" FOREIGN KEY ("verificado_por") REFERENCES "public"."usuarios"("id_usuario");



ALTER TABLE ONLY "public"."entregables"
    ADD CONSTRAINT "entregables_id_contratacion_fkey" FOREIGN KEY ("id_contratacion") REFERENCES "public"."contrataciones"("id_contratacion");



ALTER TABLE ONLY "public"."estudiantes"
    ADD CONSTRAINT "estudiantes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."estudiantes"
    ADD CONSTRAINT "estudiantes_verificado_por_fkey" FOREIGN KEY ("verificado_por") REFERENCES "public"."usuarios"("id_usuario");



ALTER TABLE ONLY "public"."evaluaciones_empresarios"
    ADD CONSTRAINT "evaluaciones_empresarios_id_contratacion_fkey" FOREIGN KEY ("id_contratacion") REFERENCES "public"."contrataciones"("id_contratacion") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evaluaciones_empresarios"
    ADD CONSTRAINT "evaluaciones_empresarios_id_empresario_fkey" FOREIGN KEY ("id_empresario") REFERENCES "public"."empresarios"("id_empresario") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evaluaciones_empresarios"
    ADD CONSTRAINT "evaluaciones_empresarios_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "public"."estudiantes"("id_estudiante") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evaluaciones"
    ADD CONSTRAINT "evaluaciones_id_contratacion_fkey" FOREIGN KEY ("id_contratacion") REFERENCES "public"."contrataciones"("id_contratacion");



ALTER TABLE ONLY "public"."evaluaciones"
    ADD CONSTRAINT "evaluaciones_id_empresario_fkey" FOREIGN KEY ("id_empresario") REFERENCES "public"."empresarios"("id_empresario");



ALTER TABLE ONLY "public"."evaluaciones"
    ADD CONSTRAINT "evaluaciones_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "public"."estudiantes"("id_estudiante");



ALTER TABLE ONLY "public"."strikes"
    ADD CONSTRAINT "fk_strikes_reporte" FOREIGN KEY ("id_reporte") REFERENCES "public"."reportes_moderacion"("id_reporte");



ALTER TABLE ONLY "public"."habilidades_tecnicas"
    ADD CONSTRAINT "habilidades_tecnicas_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "public"."estudiantes"("id_estudiante") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."habilidades_tecnicas"
    ADD CONSTRAINT "habilidades_tecnicas_id_tecnologia_fkey" FOREIGN KEY ("id_tecnologia") REFERENCES "public"."tecnologias"("id_tecnologia") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mensajes"
    ADD CONSTRAINT "mensajes_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "public"."proyectos"("id_proyecto");



ALTER TABLE ONLY "public"."mensajes"
    ADD CONSTRAINT "mensajes_id_remitente_fkey" FOREIGN KEY ("id_remitente") REFERENCES "public"."usuarios"("id_usuario");



ALTER TABLE ONLY "public"."notificaciones"
    ADD CONSTRAINT "notificaciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."participaciones"
    ADD CONSTRAINT "participaciones_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "public"."estudiantes"("id_estudiante");



ALTER TABLE ONLY "public"."participaciones"
    ADD CONSTRAINT "participaciones_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "public"."proyectos"("id_proyecto");



ALTER TABLE ONLY "public"."portafolio_tecnologias"
    ADD CONSTRAINT "portafolio_tecnologias_id_portafolio_fkey" FOREIGN KEY ("id_portafolio") REFERENCES "public"."proyectos_portafolio"("id_portafolio") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portafolio_tecnologias"
    ADD CONSTRAINT "portafolio_tecnologias_id_tecnologia_fkey" FOREIGN KEY ("id_tecnologia") REFERENCES "public"."tecnologias"("id_tecnologia") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proyecto_categorias"
    ADD CONSTRAINT "proyecto_categorias_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "public"."categorias"("id_categoria") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proyecto_categorias"
    ADD CONSTRAINT "proyecto_categorias_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "public"."proyectos"("id_proyecto") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proyecto_tecnologias"
    ADD CONSTRAINT "proyecto_tecnologias_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "public"."proyectos"("id_proyecto") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proyecto_tecnologias"
    ADD CONSTRAINT "proyecto_tecnologias_id_tecnologia_fkey" FOREIGN KEY ("id_tecnologia") REFERENCES "public"."tecnologias"("id_tecnologia") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proyectos"
    ADD CONSTRAINT "proyectos_id_area_negocio_fkey" FOREIGN KEY ("id_area_negocio") REFERENCES "public"."areas_negocio"("id_area");



ALTER TABLE ONLY "public"."proyectos"
    ADD CONSTRAINT "proyectos_id_empresario_fkey" FOREIGN KEY ("id_empresario") REFERENCES "public"."empresarios"("id_empresario");



ALTER TABLE ONLY "public"."proyectos_portafolio"
    ADD CONSTRAINT "proyectos_portafolio_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "public"."estudiantes"("id_estudiante") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proyectos_portafolio"
    ADD CONSTRAINT "proyectos_portafolio_id_participacion_fkey" FOREIGN KEY ("id_participacion") REFERENCES "public"."participaciones"("id_participacion");



ALTER TABLE ONLY "public"."reportes_moderacion"
    ADD CONSTRAINT "reportes_moderacion_id_entregable_fkey" FOREIGN KEY ("id_entregable") REFERENCES "public"."entregables"("id_entregable");



ALTER TABLE ONLY "public"."reportes_moderacion"
    ADD CONSTRAINT "reportes_moderacion_id_mensaje_fkey" FOREIGN KEY ("id_mensaje") REFERENCES "public"."mensajes"("id_mensaje");



ALTER TABLE ONLY "public"."reportes_moderacion"
    ADD CONSTRAINT "reportes_moderacion_id_portafolio_fkey" FOREIGN KEY ("id_portafolio") REFERENCES "public"."proyectos_portafolio"("id_portafolio");



ALTER TABLE ONLY "public"."reportes_moderacion"
    ADD CONSTRAINT "reportes_moderacion_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "public"."proyectos"("id_proyecto");



ALTER TABLE ONLY "public"."reportes_moderacion"
    ADD CONSTRAINT "reportes_moderacion_id_reportado_fkey" FOREIGN KEY ("id_reportado") REFERENCES "public"."usuarios"("id_usuario");



ALTER TABLE ONLY "public"."reportes_moderacion"
    ADD CONSTRAINT "reportes_moderacion_id_reportante_fkey" FOREIGN KEY ("id_reportante") REFERENCES "public"."usuarios"("id_usuario");



ALTER TABLE ONLY "public"."reportes_moderacion"
    ADD CONSTRAINT "reportes_moderacion_resuelto_por_fkey" FOREIGN KEY ("resuelto_por") REFERENCES "public"."usuarios"("id_usuario");



ALTER TABLE ONLY "public"."soporte_tickets"
    ADD CONSTRAINT "soporte_tickets_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."strikes"
    ADD CONSTRAINT "strikes_aplicado_por_fkey" FOREIGN KEY ("aplicado_por") REFERENCES "public"."usuarios"("id_usuario");



ALTER TABLE ONLY "public"."strikes"
    ADD CONSTRAINT "strikes_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "public"."proyectos"("id_proyecto");



ALTER TABLE ONLY "public"."strikes"
    ADD CONSTRAINT "strikes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario");



ALTER TABLE ONLY "public"."strikes"
    ADD CONSTRAINT "strikes_revocado_por_fkey" FOREIGN KEY ("revocado_por") REFERENCES "public"."usuarios"("id_usuario");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "public"."roles"("id_rol");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."areas_negocio" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "areas_negocio_select_active" ON "public"."areas_negocio" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."auditoria" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categorias" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "categorias_select_active" ON "public"."categorias" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."comentarios_entregables" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "comentarios_entregables_insert" ON "public"."comentarios_entregables" FOR INSERT WITH CHECK ((("id_autor" = ( SELECT "auth"."uid"() AS "uid")) AND ("id_entregable" IN ( SELECT "e"."id_entregable"
   FROM (("public"."entregables" "e"
     JOIN "public"."contrataciones" "c" ON (("c"."id_contratacion" = "e"."id_contratacion")))
     JOIN "public"."participaciones" "pa" ON (("pa"."id_participacion" = "c"."id_participacion")))
  WHERE (("pa"."id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
           FROM "public"."estudiantes"
          WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) OR ("pa"."id_proyecto" IN ( SELECT "p"."id_proyecto"
           FROM ("public"."proyectos" "p"
             JOIN "public"."empresarios" "emp" ON (("emp"."id_empresario" = "p"."id_empresario")))
          WHERE ("emp"."id_usuario" = ( SELECT "auth"."uid"() AS "uid"))))))) AND "public"."current_user_is_verified"()));



CREATE POLICY "comentarios_entregables_select" ON "public"."comentarios_entregables" FOR SELECT USING (("id_entregable" IN ( SELECT "e"."id_entregable"
   FROM (("public"."entregables" "e"
     JOIN "public"."contrataciones" "c" ON (("c"."id_contratacion" = "e"."id_contratacion")))
     JOIN "public"."participaciones" "pa" ON (("pa"."id_participacion" = "c"."id_participacion")))
  WHERE (("pa"."id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
           FROM "public"."estudiantes"
          WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) OR ("pa"."id_proyecto" IN ( SELECT "p"."id_proyecto"
           FROM ("public"."proyectos" "p"
             JOIN "public"."empresarios" "emp" ON (("emp"."id_empresario" = "p"."id_empresario")))
          WHERE ("emp"."id_usuario" = ( SELECT "auth"."uid"() AS "uid"))))))));



CREATE POLICY "config_select_authenticated" ON "public"."configuracion_sistema" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."configuracion_sistema" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."consentimientos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "consentimientos_insert_own" ON "public"."consentimientos" FOR INSERT WITH CHECK (("id_usuario" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "consentimientos_select_own" ON "public"."consentimientos" FOR SELECT USING (("id_usuario" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."contrataciones" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "contrataciones_insert_empresario" ON "public"."contrataciones" FOR INSERT WITH CHECK ((("id_participacion" IN ( SELECT "pa"."id_participacion"
   FROM (("public"."participaciones" "pa"
     JOIN "public"."proyectos" "p" ON (("p"."id_proyecto" = "pa"."id_proyecto")))
     JOIN "public"."empresarios" "e" ON (("e"."id_empresario" = "p"."id_empresario")))
  WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) AND "public"."current_user_is_verified"()));



CREATE POLICY "contrataciones_select" ON "public"."contrataciones" FOR SELECT USING (("id_participacion" IN ( SELECT "participaciones"."id_participacion"
   FROM "public"."participaciones"
  WHERE (("participaciones"."id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
           FROM "public"."estudiantes"
          WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) OR ("participaciones"."id_proyecto" IN ( SELECT "p"."id_proyecto"
           FROM ("public"."proyectos" "p"
             JOIN "public"."empresarios" "e" ON (("e"."id_empresario" = "p"."id_empresario")))
          WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid"))))))));



CREATE POLICY "contrataciones_update_empresario" ON "public"."contrataciones" FOR UPDATE USING ((("id_participacion" IN ( SELECT "pa"."id_participacion"
   FROM (("public"."participaciones" "pa"
     JOIN "public"."proyectos" "p" ON (("p"."id_proyecto" = "pa"."id_proyecto")))
     JOIN "public"."empresarios" "e" ON (("e"."id_empresario" = "p"."id_empresario")))
  WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) AND "public"."current_user_is_verified"()));



CREATE POLICY "conv_ia_insert_own" ON "public"."conversaciones_ia" FOR INSERT WITH CHECK (("id_empresario" IN ( SELECT "empresarios"."id_empresario"
   FROM "public"."empresarios"
  WHERE ("empresarios"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "conv_ia_select_own" ON "public"."conversaciones_ia" FOR SELECT USING (("id_empresario" IN ( SELECT "empresarios"."id_empresario"
   FROM "public"."empresarios"
  WHERE ("empresarios"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "conv_ia_update_own" ON "public"."conversaciones_ia" FOR UPDATE USING (("id_empresario" IN ( SELECT "empresarios"."id_empresario"
   FROM "public"."empresarios"
  WHERE ("empresarios"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))));



ALTER TABLE "public"."conversaciones_ia" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."egresados_fwd_oficial" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "egresados_fwd_oficial_all_admin" ON "public"."egresados_fwd_oficial" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id_usuario" = "auth"."uid"()) AND ("usuarios"."is_active" = true) AND (EXISTS ( SELECT 1
           FROM "public"."roles"
          WHERE (("roles"."id_rol" = "usuarios"."id_rol") AND (("roles"."nombre_rol")::"text" = 'administrador'::"text"))))))));



CREATE POLICY "egresados_fwd_oficial_select_admin" ON "public"."egresados_fwd_oficial" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id_usuario" = "auth"."uid"()) AND ("usuarios"."is_active" = true) AND (EXISTS ( SELECT 1
           FROM "public"."roles"
          WHERE (("roles"."id_rol" = "usuarios"."id_rol") AND (("roles"."nombre_rol")::"text" = 'administrador'::"text"))))))));



ALTER TABLE "public"."empresarios" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "empresarios_insert_own" ON "public"."empresarios" FOR INSERT WITH CHECK ((("id_usuario" = ( SELECT "auth"."uid"() AS "uid")) AND ("estado_verificacion" = 'pendiente'::"public"."estado_verif_enum")));



CREATE POLICY "empresarios_select_own" ON "public"."empresarios" FOR SELECT USING (("id_usuario" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "empresarios_update_own" ON "public"."empresarios" FOR UPDATE USING (("id_usuario" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("id_usuario" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."entregables" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "entregables_insert_estudiante" ON "public"."entregables" FOR INSERT WITH CHECK ((("id_contratacion" IN ( SELECT "c"."id_contratacion"
   FROM ("public"."contrataciones" "c"
     JOIN "public"."participaciones" "pa" ON (("pa"."id_participacion" = "c"."id_participacion")))
  WHERE ("pa"."id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
           FROM "public"."estudiantes"
          WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))))) AND "public"."current_user_is_verified"()));



CREATE POLICY "entregables_select" ON "public"."entregables" FOR SELECT USING (("id_contratacion" IN ( SELECT "c"."id_contratacion"
   FROM ("public"."contrataciones" "c"
     JOIN "public"."participaciones" "pa" ON (("pa"."id_participacion" = "c"."id_participacion")))
  WHERE (("pa"."id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
           FROM "public"."estudiantes"
          WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) OR ("pa"."id_proyecto" IN ( SELECT "p"."id_proyecto"
           FROM ("public"."proyectos" "p"
             JOIN "public"."empresarios" "e" ON (("e"."id_empresario" = "p"."id_empresario")))
          WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid"))))))));



CREATE POLICY "entregables_update" ON "public"."entregables" FOR UPDATE TO "authenticated" USING ((((("estado" <> 'aprobado'::"public"."estado_entregable_enum") AND ("id_contratacion" IN ( SELECT "c"."id_contratacion"
   FROM ("public"."contrataciones" "c"
     JOIN "public"."participaciones" "pa" ON (("pa"."id_participacion" = "c"."id_participacion")))
  WHERE ("pa"."id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
           FROM "public"."estudiantes"
          WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid"))))))) OR (("estado" <> 'aprobado'::"public"."estado_entregable_enum") AND ("id_contratacion" IN ( SELECT "c"."id_contratacion"
   FROM ((("public"."contrataciones" "c"
     JOIN "public"."participaciones" "pa" ON (("pa"."id_participacion" = "c"."id_participacion")))
     JOIN "public"."proyectos" "p" ON (("p"."id_proyecto" = "pa"."id_proyecto")))
     JOIN "public"."empresarios" "e" ON (("e"."id_empresario" = "p"."id_empresario")))
  WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))))) AND "public"."current_user_is_verified"())) WITH CHECK ((((("estado" <> 'aprobado'::"public"."estado_entregable_enum") AND ("id_contratacion" IN ( SELECT "c"."id_contratacion"
   FROM ("public"."contrataciones" "c"
     JOIN "public"."participaciones" "pa" ON (("pa"."id_participacion" = "c"."id_participacion")))
  WHERE ("pa"."id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
           FROM "public"."estudiantes"
          WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid"))))))) OR (("estado" = ANY (ARRAY['en_revision'::"public"."estado_entregable_enum", 'aprobado'::"public"."estado_entregable_enum", 'con_cambios'::"public"."estado_entregable_enum"])) AND ("id_contratacion" IN ( SELECT "c"."id_contratacion"
   FROM ((("public"."contrataciones" "c"
     JOIN "public"."participaciones" "pa" ON (("pa"."id_participacion" = "c"."id_participacion")))
     JOIN "public"."proyectos" "p" ON (("p"."id_proyecto" = "pa"."id_proyecto")))
     JOIN "public"."empresarios" "e" ON (("e"."id_empresario" = "p"."id_empresario")))
  WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))))) AND "public"."current_user_is_verified"()));



CREATE POLICY "est_hab_delete_own" ON "public"."habilidades_tecnicas" FOR DELETE USING (("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "est_hab_insert_own" ON "public"."habilidades_tecnicas" FOR INSERT WITH CHECK (("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "est_hab_select" ON "public"."habilidades_tecnicas" FOR SELECT TO "authenticated" USING (("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE (("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")) OR ("estudiantes"."portafolio_visible_publicamente" = true)))));



CREATE POLICY "est_hab_update_own" ON "public"."habilidades_tecnicas" FOR UPDATE USING (("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))));



ALTER TABLE "public"."estudiantes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "estudiantes_insert_own" ON "public"."estudiantes" FOR INSERT WITH CHECK ((("id_usuario" = ( SELECT "auth"."uid"() AS "uid")) AND ("estado_verificacion" = 'pendiente'::"public"."estado_verif_enum")));



CREATE POLICY "estudiantes_select_own_or_public" ON "public"."estudiantes" FOR SELECT TO "authenticated" USING ((("id_usuario" = ( SELECT "auth"."uid"() AS "uid")) OR ("portafolio_visible_publicamente" = true)));



CREATE POLICY "estudiantes_update_own" ON "public"."estudiantes" FOR UPDATE USING (("id_usuario" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("id_usuario" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."evaluaciones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."evaluaciones_empresarios" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "evaluaciones_empresarios_insert_estudiante" ON "public"."evaluaciones_empresarios" FOR INSERT TO "authenticated" WITH CHECK ((("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) AND (EXISTS ( SELECT 1
   FROM ("public"."contrataciones" "c"
     JOIN "public"."participaciones" "pa" ON (("pa"."id_participacion" = "c"."id_participacion")))
  WHERE (("c"."id_contratacion" = "evaluaciones_empresarios"."id_contratacion") AND ("pa"."id_estudiante" = "evaluaciones_empresarios"."id_estudiante") AND ("c"."estado_periodo" = 'finalizado'::"public"."estado_periodo_enum")))) AND "public"."current_user_is_verified"()));



CREATE POLICY "evaluaciones_empresarios_select" ON "public"."evaluaciones_empresarios" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "evaluaciones_insert_empresario" ON "public"."evaluaciones" FOR INSERT WITH CHECK ((("id_empresario" IN ( SELECT "empresarios"."id_empresario"
   FROM "public"."empresarios"
  WHERE ("empresarios"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) AND (EXISTS ( SELECT 1
   FROM ((("public"."contrataciones" "c"
     JOIN "public"."participaciones" "pa" ON (("pa"."id_participacion" = "c"."id_participacion")))
     JOIN "public"."proyectos" "p" ON (("p"."id_proyecto" = "pa"."id_proyecto")))
     JOIN "public"."empresarios" "emp" ON (("emp"."id_empresario" = "p"."id_empresario")))
  WHERE (("c"."id_contratacion" = "evaluaciones"."id_contratacion") AND ("pa"."id_estudiante" = "evaluaciones"."id_estudiante") AND ("emp"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")) AND ("c"."estado_periodo" = 'finalizado'::"public"."estado_periodo_enum")))) AND "public"."current_user_is_verified"()));



CREATE POLICY "evaluaciones_select" ON "public"."evaluaciones" FOR SELECT USING ((("id_empresario" IN ( SELECT "empresarios"."id_empresario"
   FROM "public"."empresarios"
  WHERE ("empresarios"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) OR ("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "evaluaciones_select_admin" ON "public"."evaluaciones" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."usuarios" "u"
     JOIN "public"."roles" "r" ON (("u"."id_rol" = "r"."id_rol")))
  WHERE (("u"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")) AND (("r"."nombre_rol")::"text" = 'administrador'::"text")))));



CREATE POLICY "evaluaciones_update_respuesta" ON "public"."evaluaciones" FOR UPDATE USING (("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))));



ALTER TABLE "public"."habilidades_tecnicas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mensajes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notificaciones" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notificaciones_select_own" ON "public"."notificaciones" FOR SELECT USING (("id_usuario" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "notificaciones_update_own" ON "public"."notificaciones" FOR UPDATE USING (("id_usuario" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("id_usuario" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."participaciones" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "participaciones_insert_egresado" ON "public"."participaciones" FOR INSERT TO "authenticated" WITH CHECK ((("estado" = 'enviada'::"public"."estado_participacion_enum") AND ("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE (("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")) AND ("estudiantes"."estado_verificacion" = 'verificado'::"public"."estado_verif_enum")))) AND ("id_proyecto" IN ( SELECT "proyectos"."id_proyecto"
   FROM "public"."proyectos"
  WHERE (("proyectos"."estado" = ANY (ARRAY['abierto'::"public"."estado_proyecto_enum", 'en_recepcion'::"public"."estado_proyecto_enum"])) AND ("proyectos"."is_active" = true) AND (("proyectos"."fecha_cierre" IS NULL) OR ("proyectos"."fecha_cierre" > "now"())))))));



CREATE POLICY "participaciones_select" ON "public"."participaciones" FOR SELECT TO "authenticated" USING ((("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) OR ("id_proyecto" IN ( SELECT "public"."mis_proyectos_como_empresario"() AS "mis_proyectos_como_empresario"))));



CREATE POLICY "participaciones_update" ON "public"."participaciones" FOR UPDATE TO "authenticated" USING ((((("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) AND ("estado" = ANY (ARRAY['enviada'::"public"."estado_participacion_enum", 'en_revision'::"public"."estado_participacion_enum"]))) OR (("estado" <> 'retirada'::"public"."estado_participacion_enum") AND ("id_proyecto" IN ( SELECT "p"."id_proyecto"
   FROM ("public"."proyectos" "p"
     JOIN "public"."empresarios" "e" ON (("e"."id_empresario" = "p"."id_empresario")))
  WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))))) AND "public"."current_user_is_verified"())) WITH CHECK ((((("estado" = 'retirada'::"public"."estado_participacion_enum") AND ("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid"))))) OR (("estado" <> 'retirada'::"public"."estado_participacion_enum") AND ("id_proyecto" IN ( SELECT "p"."id_proyecto"
   FROM ("public"."proyectos" "p"
     JOIN "public"."empresarios" "e" ON (("e"."id_empresario" = "p"."id_empresario")))
  WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))))) AND "public"."current_user_is_verified"()));



CREATE POLICY "portafolio_delete_own" ON "public"."proyectos_portafolio" FOR DELETE USING (("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "portafolio_insert_own" ON "public"."proyectos_portafolio" FOR INSERT WITH CHECK (("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "portafolio_select_own_or_public" ON "public"."proyectos_portafolio" FOR SELECT TO "authenticated" USING ((("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) OR (("is_active" = true) AND (("origen" <> 'plataforma_contratada'::"public"."origen_portafolio_enum") OR ("estado_consentimiento" = 'aprobado'::"public"."estado_consent_portafolio_enum")) AND ("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE ("estudiantes"."portafolio_visible_publicamente" = true))))));



CREATE POLICY "portafolio_tec_delete_own" ON "public"."portafolio_tecnologias" FOR DELETE USING (("id_portafolio" IN ( SELECT "proyectos_portafolio"."id_portafolio"
   FROM "public"."proyectos_portafolio"
  WHERE ("proyectos_portafolio"."id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
           FROM "public"."estudiantes"
          WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "portafolio_tec_insert_own" ON "public"."portafolio_tecnologias" FOR INSERT WITH CHECK (("id_portafolio" IN ( SELECT "proyectos_portafolio"."id_portafolio"
   FROM "public"."proyectos_portafolio"
  WHERE ("proyectos_portafolio"."id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
           FROM "public"."estudiantes"
          WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "portafolio_tec_select" ON "public"."portafolio_tecnologias" FOR SELECT TO "authenticated" USING (("id_portafolio" IN ( SELECT "proyectos_portafolio"."id_portafolio"
   FROM "public"."proyectos_portafolio"
  WHERE (("proyectos_portafolio"."id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
           FROM "public"."estudiantes"
          WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) OR (("proyectos_portafolio"."is_active" = true) AND (("proyectos_portafolio"."origen" <> 'plataforma_contratada'::"public"."origen_portafolio_enum") OR ("proyectos_portafolio"."estado_consentimiento" = 'aprobado'::"public"."estado_consent_portafolio_enum")) AND ("proyectos_portafolio"."id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
           FROM "public"."estudiantes"
          WHERE ("estudiantes"."portafolio_visible_publicamente" = true))))))));



CREATE POLICY "portafolio_tec_update_own" ON "public"."portafolio_tecnologias" FOR UPDATE USING (("id_portafolio" IN ( SELECT "proyectos_portafolio"."id_portafolio"
   FROM "public"."proyectos_portafolio"
  WHERE ("proyectos_portafolio"."id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
           FROM "public"."estudiantes"
          WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))))));



ALTER TABLE "public"."portafolio_tecnologias" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "portafolio_update_own" ON "public"."proyectos_portafolio" FOR UPDATE USING (("id_estudiante" IN ( SELECT "estudiantes"."id_estudiante"
   FROM "public"."estudiantes"
  WHERE ("estudiantes"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "proy_cat_delete_own" ON "public"."proyecto_categorias" FOR DELETE USING (("id_proyecto" IN ( SELECT "p"."id_proyecto"
   FROM ("public"."proyectos" "p"
     JOIN "public"."empresarios" "e" ON (("e"."id_empresario" = "p"."id_empresario")))
  WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "proy_cat_insert_own" ON "public"."proyecto_categorias" FOR INSERT WITH CHECK (("id_proyecto" IN ( SELECT "p"."id_proyecto"
   FROM ("public"."proyectos" "p"
     JOIN "public"."empresarios" "e" ON (("e"."id_empresario" = "p"."id_empresario")))
  WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "proy_cat_select_auth" ON "public"."proyecto_categorias" FOR SELECT TO "authenticated" USING ((("id_proyecto" IN ( SELECT "proyectos"."id_proyecto"
   FROM "public"."proyectos"
  WHERE (("proyectos"."is_active" = true) AND ("proyectos"."estado" = ANY (ARRAY['abierto'::"public"."estado_proyecto_enum", 'en_recepcion'::"public"."estado_proyecto_enum"]))))) OR ("id_proyecto" IN ( SELECT "p"."id_proyecto"
   FROM ("public"."proyectos" "p"
     JOIN "public"."empresarios" "e" ON (("e"."id_empresario" = "p"."id_empresario")))
  WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) OR ("id_proyecto" IN ( SELECT "pa"."id_proyecto"
   FROM ("public"."participaciones" "pa"
     JOIN "public"."estudiantes" "e" ON (("e"."id_estudiante" = "pa"."id_estudiante")))
  WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "proy_cat_update_own" ON "public"."proyecto_categorias" FOR UPDATE USING (("id_proyecto" IN ( SELECT "p"."id_proyecto"
   FROM ("public"."proyectos" "p"
     JOIN "public"."empresarios" "e" ON (("e"."id_empresario" = "p"."id_empresario")))
  WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "proy_tec_delete_own" ON "public"."proyecto_tecnologias" FOR DELETE USING (("id_proyecto" IN ( SELECT "p"."id_proyecto"
   FROM ("public"."proyectos" "p"
     JOIN "public"."empresarios" "e" ON (("e"."id_empresario" = "p"."id_empresario")))
  WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "proy_tec_insert_own" ON "public"."proyecto_tecnologias" FOR INSERT WITH CHECK (("id_proyecto" IN ( SELECT "p"."id_proyecto"
   FROM ("public"."proyectos" "p"
     JOIN "public"."empresarios" "e" ON (("e"."id_empresario" = "p"."id_empresario")))
  WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "proy_tec_select_auth" ON "public"."proyecto_tecnologias" FOR SELECT TO "authenticated" USING ((("id_proyecto" IN ( SELECT "proyectos"."id_proyecto"
   FROM "public"."proyectos"
  WHERE (("proyectos"."is_active" = true) AND ("proyectos"."estado" = ANY (ARRAY['abierto'::"public"."estado_proyecto_enum", 'en_recepcion'::"public"."estado_proyecto_enum"]))))) OR ("id_proyecto" IN ( SELECT "p"."id_proyecto"
   FROM ("public"."proyectos" "p"
     JOIN "public"."empresarios" "e" ON (("e"."id_empresario" = "p"."id_empresario")))
  WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) OR ("id_proyecto" IN ( SELECT "pa"."id_proyecto"
   FROM ("public"."participaciones" "pa"
     JOIN "public"."estudiantes" "e" ON (("e"."id_estudiante" = "pa"."id_estudiante")))
  WHERE ("e"."id_usuario" = ( SELECT "auth"."uid"() AS "uid"))))));



ALTER TABLE "public"."proyecto_categorias" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."proyecto_tecnologias" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."proyectos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "proyectos_insert_verified_empresario" ON "public"."proyectos" FOR INSERT WITH CHECK (("id_empresario" IN ( SELECT "empresarios"."id_empresario"
   FROM "public"."empresarios"
  WHERE (("empresarios"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")) AND ("empresarios"."estado_verificacion" = 'verificado'::"public"."estado_verif_enum")))));



ALTER TABLE "public"."proyectos_portafolio" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "proyectos_select_auth" ON "public"."proyectos" FOR SELECT TO "authenticated" USING (((("is_active" = true) AND ("estado" = ANY (ARRAY['abierto'::"public"."estado_proyecto_enum", 'en_recepcion'::"public"."estado_proyecto_enum"]))) OR ("id_empresario" IN ( SELECT "empresarios"."id_empresario"
   FROM "public"."empresarios"
  WHERE ("empresarios"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) OR ("id_proyecto" IN ( SELECT "public"."mis_proyectos_como_estudiante"() AS "mis_proyectos_como_estudiante"))));



CREATE POLICY "proyectos_update_own" ON "public"."proyectos" FOR UPDATE USING ((("id_empresario" IN ( SELECT "empresarios"."id_empresario"
   FROM "public"."empresarios"
  WHERE ("empresarios"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) AND "public"."current_user_is_verified"())) WITH CHECK ((("id_empresario" IN ( SELECT "empresarios"."id_empresario"
   FROM "public"."empresarios"
  WHERE ("empresarios"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")))) AND "public"."current_user_is_verified"()));



CREATE POLICY "reportes_insert_auth" ON "public"."reportes_moderacion" FOR INSERT WITH CHECK (("id_reportante" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."reportes_moderacion" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reportes_select_admin" ON "public"."reportes_moderacion" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."usuarios" "u"
     JOIN "public"."roles" "r" ON (("u"."id_rol" = "r"."id_rol")))
  WHERE (("u"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")) AND (("r"."nombre_rol")::"text" = 'administrador'::"text")))));



CREATE POLICY "reportes_select_own" ON "public"."reportes_moderacion" FOR SELECT USING (("id_reportante" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "reportes_update_admin" ON "public"."reportes_moderacion" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."usuarios" "u"
     JOIN "public"."roles" "r" ON (("u"."id_rol" = "r"."id_rol")))
  WHERE (("u"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")) AND (("r"."nombre_rol")::"text" = 'administrador'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."usuarios" "u"
     JOIN "public"."roles" "r" ON (("u"."id_rol" = "r"."id_rol")))
  WHERE (("u"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")) AND (("r"."nombre_rol")::"text" = 'administrador'::"text")))));



ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "roles_select_public" ON "public"."roles" FOR SELECT USING (true);



ALTER TABLE "public"."soporte_tickets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "soporte_tickets_insert_own" ON "public"."soporte_tickets" FOR INSERT TO "authenticated" WITH CHECK (("id_usuario" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "soporte_tickets_select_admin" ON "public"."soporte_tickets" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."usuarios" "u"
     JOIN "public"."roles" "r" ON (("u"."id_rol" = "r"."id_rol")))
  WHERE (("u"."id_usuario" = ( SELECT "auth"."uid"() AS "uid")) AND (("r"."nombre_rol")::"text" = 'administrador'::"text")))));



CREATE POLICY "soporte_tickets_select_own" ON "public"."soporte_tickets" FOR SELECT TO "authenticated" USING (("id_usuario" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."strikes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "strikes_select_own" ON "public"."strikes" FOR SELECT USING (("id_usuario" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."tecnologias" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tecnologias_select_active" ON "public"."tecnologias" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."usuarios" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "usuarios_select_own" ON "public"."usuarios" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "id_usuario"));



CREATE POLICY "usuarios_update_own" ON "public"."usuarios" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id_usuario")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id_usuario"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."activar_cuenta_al_confirmar_correo"() TO "anon";
GRANT ALL ON FUNCTION "public"."activar_cuenta_al_confirmar_correo"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."activar_cuenta_al_confirmar_correo"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."actualizar_strikes"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."actualizar_strikes"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."actualizar_url_participacion"("p_id_participacion" "uuid", "p_url" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."actualizar_url_participacion"("p_id_participacion" "uuid", "p_url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."actualizar_url_participacion"("p_id_participacion" "uuid", "p_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."actualizar_url_participacion"("p_id_participacion" "uuid", "p_url" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."adjudicar_participacion"("p_id_participacion" "uuid", "p_id_proyecto" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."adjudicar_participacion"("p_id_participacion" "uuid", "p_id_proyecto" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."adjudicar_participacion"("p_id_participacion" "uuid", "p_id_proyecto" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."assign_my_role"("p_role" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."assign_my_role"("p_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_set_estado_entregable_final"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_set_estado_entregable_final"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_set_estado_entregable_final"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_mensaje_rate_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_mensaje_rate_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_mensaje_rate_limit"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."crear_contratacion_al_adjudicar"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."crear_contratacion_al_adjudicar"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."current_user_is_verified"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."current_user_is_verified"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_is_verified"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_is_verified"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."emitir_avisos_plazo_vence"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."emitir_avisos_plazo_vence"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."finalizar_proyecto_por_entregable"("p_id_entregable" "uuid", "p_comentario" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."finalizar_proyecto_por_entregable"("p_id_entregable" "uuid", "p_comentario" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."finalizar_proyecto_por_entregable"("p_id_entregable" "uuid", "p_comentario" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_my_account_status"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_my_account_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_account_status"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_my_role"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_participaciones_de_proyecto"("p_id_proyecto" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_participaciones_de_proyecto"("p_id_proyecto" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_participaciones_de_proyecto"("p_id_proyecto" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."guard_empresarios_protected_cols"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."guard_empresarios_protected_cols"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."guard_estudiantes_protected_cols"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."guard_estudiantes_protected_cols"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."guard_participaciones_estudiante_cols"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."guard_participaciones_estudiante_cols"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."guard_usuarios_protected_cols"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."guard_usuarios_protected_cols"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."limpiar_huerfanos_oauth"("p_dry_run" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."limpiar_huerfanos_oauth"("p_dry_run" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."mis_proyectos_como_empresario"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mis_proyectos_como_empresario"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mis_proyectos_como_empresario"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."mis_proyectos_como_estudiante"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mis_proyectos_como_estudiante"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mis_proyectos_como_estudiante"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."publicar_proyecto"("p_conversacion" "uuid", "p_titulo" character varying, "p_descripcion" "text", "p_id_area" "uuid", "p_modalidad" "public"."modalidad_enum", "p_pais_iso" character varying, "p_region" character varying, "p_moneda" "public"."moneda_enum", "p_presupuesto_min" numeric, "p_presupuesto_max" numeric, "p_plazo_dias" integer, "p_categorias" "uuid"[], "p_tecnologias" "uuid"[], "p_propuesta" "jsonb", "p_involucra_ia" boolean, "p_generado_por_ia" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."publicar_proyecto"("p_conversacion" "uuid", "p_titulo" character varying, "p_descripcion" "text", "p_id_area" "uuid", "p_modalidad" "public"."modalidad_enum", "p_pais_iso" character varying, "p_region" character varying, "p_moneda" "public"."moneda_enum", "p_presupuesto_min" numeric, "p_presupuesto_max" numeric, "p_plazo_dias" integer, "p_categorias" "uuid"[], "p_tecnologias" "uuid"[], "p_propuesta" "jsonb", "p_involucra_ia" boolean, "p_generado_por_ia" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."publicar_proyecto"("p_conversacion" "uuid", "p_titulo" character varying, "p_descripcion" "text", "p_id_area" "uuid", "p_modalidad" "public"."modalidad_enum", "p_pais_iso" character varying, "p_region" character varying, "p_moneda" "public"."moneda_enum", "p_presupuesto_min" numeric, "p_presupuesto_max" numeric, "p_plazo_dias" integer, "p_categorias" "uuid"[], "p_tecnologias" "uuid"[], "p_propuesta" "jsonb", "p_involucra_ia" boolean, "p_generado_por_ia" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."recalcular_reputacion"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."recalcular_reputacion"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."recalcular_reputacion_empresario"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."recalcular_reputacion_empresario"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."recalcular_reputacion_estudiante"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."recalcular_reputacion_estudiante"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."register_failed_login"("p_email" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."register_failed_login"("p_email" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."rls_auto_enable"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_updated_at"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."sync_contadores_estudiante"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."sync_contadores_estudiante"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."sync_postulaciones_pendientes"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."sync_postulaciones_pendientes"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."validar_cupo_participaciones"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."validar_cupo_participaciones"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."validar_estado_proyecto_para_entregable"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."validar_estado_proyecto_para_entregable"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."validar_nivel_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."validar_nivel_admin"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."validar_transicion_participacion"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."validar_transicion_participacion"() TO "service_role";



GRANT ALL ON TABLE "public"."areas_negocio" TO "anon";
GRANT ALL ON TABLE "public"."areas_negocio" TO "authenticated";
GRANT ALL ON TABLE "public"."areas_negocio" TO "service_role";



GRANT ALL ON TABLE "public"."auditoria" TO "anon";
GRANT ALL ON TABLE "public"."auditoria" TO "authenticated";
GRANT ALL ON TABLE "public"."auditoria" TO "service_role";



GRANT ALL ON TABLE "public"."categorias" TO "anon";
GRANT ALL ON TABLE "public"."categorias" TO "authenticated";
GRANT ALL ON TABLE "public"."categorias" TO "service_role";



GRANT ALL ON TABLE "public"."comentarios_entregables" TO "anon";
GRANT ALL ON TABLE "public"."comentarios_entregables" TO "authenticated";
GRANT ALL ON TABLE "public"."comentarios_entregables" TO "service_role";



GRANT ALL ON TABLE "public"."configuracion_sistema" TO "anon";
GRANT ALL ON TABLE "public"."configuracion_sistema" TO "authenticated";
GRANT ALL ON TABLE "public"."configuracion_sistema" TO "service_role";



GRANT ALL ON TABLE "public"."consentimientos" TO "anon";
GRANT ALL ON TABLE "public"."consentimientos" TO "authenticated";
GRANT ALL ON TABLE "public"."consentimientos" TO "service_role";



GRANT ALL ON TABLE "public"."contrataciones" TO "anon";
GRANT ALL ON TABLE "public"."contrataciones" TO "authenticated";
GRANT ALL ON TABLE "public"."contrataciones" TO "service_role";



GRANT ALL ON TABLE "public"."conversaciones_ia" TO "anon";
GRANT ALL ON TABLE "public"."conversaciones_ia" TO "authenticated";
GRANT ALL ON TABLE "public"."conversaciones_ia" TO "service_role";



GRANT ALL ON TABLE "public"."egresados_fwd_oficial" TO "anon";
GRANT ALL ON TABLE "public"."egresados_fwd_oficial" TO "authenticated";
GRANT ALL ON TABLE "public"."egresados_fwd_oficial" TO "service_role";



GRANT ALL ON TABLE "public"."empresarios" TO "anon";
GRANT ALL ON TABLE "public"."empresarios" TO "authenticated";
GRANT ALL ON TABLE "public"."empresarios" TO "service_role";



GRANT ALL ON TABLE "public"."proyectos" TO "anon";
GRANT ALL ON TABLE "public"."proyectos" TO "authenticated";
GRANT ALL ON TABLE "public"."proyectos" TO "service_role";



GRANT ALL ON TABLE "public"."empresarios_public" TO "authenticated";
GRANT ALL ON TABLE "public"."empresarios_public" TO "service_role";



GRANT ALL ON TABLE "public"."entregables" TO "anon";
GRANT ALL ON TABLE "public"."entregables" TO "authenticated";
GRANT ALL ON TABLE "public"."entregables" TO "service_role";



GRANT ALL ON TABLE "public"."estudiantes" TO "anon";
GRANT ALL ON TABLE "public"."estudiantes" TO "authenticated";
GRANT ALL ON TABLE "public"."estudiantes" TO "service_role";



GRANT ALL ON TABLE "public"."evaluaciones" TO "anon";
GRANT ALL ON TABLE "public"."evaluaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluaciones" TO "service_role";



GRANT ALL ON TABLE "public"."evaluaciones_empresarios" TO "anon";
GRANT ALL ON TABLE "public"."evaluaciones_empresarios" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluaciones_empresarios" TO "service_role";



GRANT ALL ON TABLE "public"."habilidades_tecnicas" TO "anon";
GRANT ALL ON TABLE "public"."habilidades_tecnicas" TO "authenticated";
GRANT ALL ON TABLE "public"."habilidades_tecnicas" TO "service_role";



GRANT ALL ON TABLE "public"."mensajes" TO "anon";
GRANT ALL ON TABLE "public"."mensajes" TO "authenticated";
GRANT ALL ON TABLE "public"."mensajes" TO "service_role";



GRANT ALL ON TABLE "public"."notificaciones" TO "anon";
GRANT ALL ON TABLE "public"."notificaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."notificaciones" TO "service_role";



GRANT ALL ON TABLE "public"."participaciones" TO "anon";
GRANT ALL ON TABLE "public"."participaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."participaciones" TO "service_role";



GRANT ALL ON TABLE "public"."portafolio_tecnologias" TO "anon";
GRANT ALL ON TABLE "public"."portafolio_tecnologias" TO "authenticated";
GRANT ALL ON TABLE "public"."portafolio_tecnologias" TO "service_role";



GRANT ALL ON TABLE "public"."proyecto_categorias" TO "anon";
GRANT ALL ON TABLE "public"."proyecto_categorias" TO "authenticated";
GRANT ALL ON TABLE "public"."proyecto_categorias" TO "service_role";



GRANT ALL ON TABLE "public"."proyecto_tecnologias" TO "anon";
GRANT ALL ON TABLE "public"."proyecto_tecnologias" TO "authenticated";
GRANT ALL ON TABLE "public"."proyecto_tecnologias" TO "service_role";



GRANT ALL ON TABLE "public"."proyectos_portafolio" TO "anon";
GRANT ALL ON TABLE "public"."proyectos_portafolio" TO "authenticated";
GRANT ALL ON TABLE "public"."proyectos_portafolio" TO "service_role";



GRANT ALL ON TABLE "public"."reportes_moderacion" TO "anon";
GRANT ALL ON TABLE "public"."reportes_moderacion" TO "authenticated";
GRANT ALL ON TABLE "public"."reportes_moderacion" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."roles_id_rol_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."roles_id_rol_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."roles_id_rol_seq" TO "service_role";



GRANT ALL ON TABLE "public"."soporte_tickets" TO "anon";
GRANT ALL ON TABLE "public"."soporte_tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."soporte_tickets" TO "service_role";



GRANT ALL ON TABLE "public"."strikes" TO "anon";
GRANT ALL ON TABLE "public"."strikes" TO "authenticated";
GRANT ALL ON TABLE "public"."strikes" TO "service_role";



GRANT ALL ON TABLE "public"."tecnologias" TO "anon";
GRANT ALL ON TABLE "public"."tecnologias" TO "authenticated";
GRANT ALL ON TABLE "public"."tecnologias" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios" TO "anon";
GRANT ALL ON TABLE "public"."usuarios" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";




