--
-- PostgreSQL database dump
--

\restrict nFwhn7e669o8iXluhC2lAyuecRhzIGdXPCF8PcL218gxm60wJzuhskcPyYULG1B

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.10 (Debian 17.10-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: alcance_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.alcance_enum AS ENUM (
    'nacional',
    'internacional',
    'ambos'
);


ALTER TYPE public.alcance_enum OWNER TO postgres;

--
-- Name: estado_consent_portafolio_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_consent_portafolio_enum AS ENUM (
    'pendiente',
    'aprobado',
    'revocado'
);


ALTER TYPE public.estado_consent_portafolio_enum OWNER TO postgres;

--
-- Name: estado_conv_ia_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_conv_ia_enum AS ENUM (
    'en_curso',
    'finalizada',
    'abandonada'
);


ALTER TYPE public.estado_conv_ia_enum OWNER TO postgres;

--
-- Name: estado_cuenta_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_cuenta_enum AS ENUM (
    'pendiente',
    'activa',
    'suspendida',
    'suspendida_severa'
);


ALTER TYPE public.estado_cuenta_enum OWNER TO postgres;

--
-- Name: estado_entregable_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_entregable_enum AS ENUM (
    'enviado',
    'en_revision',
    'aprobado',
    'con_cambios'
);


ALTER TYPE public.estado_entregable_enum OWNER TO postgres;

--
-- Name: estado_moderacion_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_moderacion_enum AS ENUM (
    'pendiente',
    'en_revision',
    'resuelto_a_favor',
    'resuelto_en_contra',
    'descartado'
);


ALTER TYPE public.estado_moderacion_enum OWNER TO postgres;

--
-- Name: estado_participacion_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_participacion_enum AS ENUM (
    'enviada',
    'en_revision',
    'contratada',
    'no_seleccionada',
    'retirada',
    'finalizada',
    'cancelada'
);


ALTER TYPE public.estado_participacion_enum OWNER TO postgres;

--
-- Name: estado_periodo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_periodo_enum AS ENUM (
    'vigente',
    'pausado',
    'finalizado',
    'cancelado'
);


ALTER TYPE public.estado_periodo_enum OWNER TO postgres;

--
-- Name: estado_proyecto_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_proyecto_enum AS ENUM (
    'borrador',
    'abierto',
    'en_recepcion',
    'adjudicado',
    'en_desarrollo',
    'finalizado',
    'cancelado'
);


ALTER TYPE public.estado_proyecto_enum OWNER TO postgres;

--
-- Name: estado_verif_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_verif_enum AS ENUM (
    'pendiente',
    'verificado',
    'rechazado'
);


ALTER TYPE public.estado_verif_enum OWNER TO postgres;

--
-- Name: modalidad_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.modalidad_enum AS ENUM (
    'remoto',
    'hibrido',
    'presencial'
);


ALTER TYPE public.modalidad_enum OWNER TO postgres;

--
-- Name: moneda_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.moneda_enum AS ENUM (
    'USD',
    'CRC'
);


ALTER TYPE public.moneda_enum OWNER TO postgres;

--
-- Name: motivo_strike_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.motivo_strike_enum AS ENUM (
    'no_entrego',
    'abandono_proyecto',
    'conducta_inapropiada',
    'calificacion_baja_repetida',
    'fraude',
    'ghosting',
    'otro'
);


ALTER TYPE public.motivo_strike_enum OWNER TO postgres;

--
-- Name: nivel_admin_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nivel_admin_enum AS ENUM (
    'superadmin',
    'admin',
    'moderador'
);


ALTER TYPE public.nivel_admin_enum OWNER TO postgres;

--
-- Name: nivel_habilidad_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nivel_habilidad_enum AS ENUM (
    'basico',
    'intermedio',
    'avanzado'
);


ALTER TYPE public.nivel_habilidad_enum OWNER TO postgres;

--
-- Name: nivel_tecnico_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nivel_tecnico_enum AS ENUM (
    'no_tecnico',
    'basico',
    'intermedio',
    'avanzado'
);


ALTER TYPE public.nivel_tecnico_enum OWNER TO postgres;

--
-- Name: origen_portafolio_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.origen_portafolio_enum AS ENUM (
    'plataforma_no_contratada',
    'plataforma_contratada',
    'independiente'
);


ALTER TYPE public.origen_portafolio_enum OWNER TO postgres;

--
-- Name: tipo_comentario_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_comentario_enum AS ENUM (
    'revision_solicitada',
    'aclaracion',
    'aprobacion',
    'rechazo'
);


ALTER TYPE public.tipo_comentario_enum OWNER TO postgres;

--
-- Name: tipo_consentimiento_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_consentimiento_enum AS ENUM (
    'ia',
    'cotejo_fwd',
    'terminos_servicio',
    'politica_privacidad'
);


ALTER TYPE public.tipo_consentimiento_enum OWNER TO postgres;

--
-- Name: tipo_dato_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_dato_enum AS ENUM (
    'integer',
    'decimal',
    'boolean',
    'string'
);


ALTER TYPE public.tipo_dato_enum OWNER TO postgres;

--
-- Name: tipo_empresario_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_empresario_enum AS ENUM (
    'empresa_formal',
    'emprendedor'
);


ALTER TYPE public.tipo_empresario_enum OWNER TO postgres;

--
-- Name: tipo_entregable_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_entregable_enum AS ENUM (
    'parcial',
    'final'
);


ALTER TYPE public.tipo_entregable_enum OWNER TO postgres;

--
-- Name: tipo_notificacion_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_notificacion_enum AS ENUM (
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


ALTER TYPE public.tipo_notificacion_enum OWNER TO postgres;

--
-- Name: tipo_reporte_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_reporte_enum AS ENUM (
    'conducta_abusiva',
    'contenido_inapropiado',
    'spam',
    'fraude',
    'otro'
);


ALTER TYPE public.tipo_reporte_enum OWNER TO postgres;

--
-- Name: titulo_fwd_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.titulo_fwd_enum AS ENUM (
    'frontend',
    'backend',
    'fullstack'
);


ALTER TYPE public.titulo_fwd_enum OWNER TO postgres;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in',
    'like',
    'ilike',
    'is',
    'match',
    'imatch',
    'isdistinct'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text,
	negate boolean
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
begin
    if not exists (
        select 1
        from pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: supabase_admin
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


ALTER FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) OWNER TO supabase_admin;

--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: activar_cuenta_al_confirmar_correo(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.activar_cuenta_al_confirmar_correo() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.activar_cuenta_al_confirmar_correo() OWNER TO postgres;

--
-- Name: actualizar_strikes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_strikes() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.actualizar_strikes() OWNER TO postgres;

--
-- Name: actualizar_url_participacion(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_url_participacion(p_id_participacion uuid, p_url text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.actualizar_url_participacion(p_id_participacion uuid, p_url text) OWNER TO postgres;

--
-- Name: adjudicar_participacion(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.adjudicar_participacion(p_id_participacion uuid, p_id_proyecto uuid) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'public'
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


ALTER FUNCTION public.adjudicar_participacion(p_id_participacion uuid, p_id_proyecto uuid) OWNER TO postgres;

--
-- Name: FUNCTION adjudicar_participacion(p_id_participacion uuid, p_id_proyecto uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.adjudicar_participacion(p_id_participacion uuid, p_id_proyecto uuid) IS 'Adjudica un proyecto a una participación de forma atómica (RF-37 + RF-39): ganador a contratada (crea contratación vía trigger), el resto de ofertas vivas (revisadas Y sobres cerrados, estos vía enviada->en_revision->no_seleccionada) a no_seleccionada, y proyecto a adjudicado, en una sola transacción. SECURITY INVOKER: respeta RLS y la máquina de estados.';


--
-- Name: assign_my_role(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assign_my_role(p_role text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  raise exception 'assign_my_role_deprecated: use completarOnboarding/crearPerfilUsuario para crear rol y perfil juntos'
    using errcode = 'P0001';
end;
$$;


ALTER FUNCTION public.assign_my_role(p_role text) OWNER TO postgres;

--
-- Name: auto_set_estado_entregable_final(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.auto_set_estado_entregable_final() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
begin
  if new.tipo_entregable = 'final' then
    new.estado := 'en_revision';
  end if;
  return new;
end;
$$;


ALTER FUNCTION public.auto_set_estado_entregable_final() OWNER TO postgres;

--
-- Name: check_mensaje_rate_limit(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_mensaje_rate_limit() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
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


ALTER FUNCTION public.check_mensaje_rate_limit() OWNER TO postgres;

--
-- Name: crear_contratacion_al_adjudicar(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.crear_contratacion_al_adjudicar() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if new.estado = 'contratada' and (old.estado is null or old.estado <> 'contratada') then
    insert into contrataciones (id_participacion, fecha_inicio, estado_periodo)
    values (new.id_participacion, current_date, 'vigente')
    on conflict (id_participacion) do nothing;
  end if;
  return new;
end; $$;


ALTER FUNCTION public.crear_contratacion_al_adjudicar() OWNER TO postgres;

--
-- Name: current_user_is_verified(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.current_user_is_verified() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select exists (
    select 1 from public.estudiantes e
    where e.id_usuario = (select auth.uid()) and e.estado_verificacion = 'verificado'
  ) or exists (
    select 1 from public.empresarios em
    where em.id_usuario = (select auth.uid()) and em.estado_verificacion = 'verificado'
  );
$$;


ALTER FUNCTION public.current_user_is_verified() OWNER TO postgres;

--
-- Name: emitir_avisos_plazo_vence(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.emitir_avisos_plazo_vence() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_horas    integer;
  v_emitidas integer;
begin
  -- Umbral configurable; default 24 si la fila no existe o está vacía.
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


ALTER FUNCTION public.emitir_avisos_plazo_vence() OWNER TO postgres;

--
-- Name: finalizar_proyecto_por_entregable(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.finalizar_proyecto_por_entregable(p_id_entregable uuid, p_comentario text) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'public'
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

  -- 2. Resolver la cadena entregable -> contratación -> participación -> proyecto
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

  -- 3. Aprobar el entregable final (con el proyecto aún en adjudicado/en_desarrollo).
  -- ORDEN CRÍTICO: se aprueba el entregable ANTES de cambiar el proyecto. El
  -- trigger trg_validar_estado_entregable exige que el proyecto esté en
  -- ('adjudicado','en_desarrollo') para tocar entregables; si finalizáramos
  -- el proyecto primero, ese UPDATE del entregable sería rechazado.
  update public.entregables
  set estado = 'aprobado',
      comentario_empresario = p_comentario
  where id_entregable = p_id_entregable;

  -- 4. Cierre del ciclo: proyecto, contratación y participación.
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


ALTER FUNCTION public.finalizar_proyecto_por_entregable(p_id_entregable uuid, p_comentario text) OWNER TO postgres;

--
-- Name: FUNCTION finalizar_proyecto_por_entregable(p_id_entregable uuid, p_comentario text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.finalizar_proyecto_por_entregable(p_id_entregable uuid, p_comentario text) IS 'Cierra el ciclo (RF-41) al aprobar el entregable final: aprueba el entregable y pasa proyecto/contratación/participación a finalizado, en una transacción. Acepta entregables en estado enviado (filas previas) o en_revision (estado por defecto desde RF-41). Habilita las calificaciones mutuas. SECURITY INVOKER: respeta RLS.';


--
-- Name: get_my_account_status(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_my_account_status() RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select u.estado_cuenta::text
  from public.usuarios u
  where u.id_usuario = auth.uid()
$$;


ALTER FUNCTION public.get_my_account_status() OWNER TO postgres;

--
-- Name: get_my_role(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_my_role() RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.get_my_role() OWNER TO postgres;

--
-- Name: get_participaciones_de_proyecto(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_participaciones_de_proyecto(p_id_proyecto uuid) RETURNS TABLE(id_participacion uuid, estado public.estado_participacion_enum, estudiante_nombre character varying, estudiante_apellido_1 character varying, estudiante_apellido_2 character varying, foto_perfil character varying, reputacion numeric, titulo_fwd public.titulo_fwd_enum, carta_postulacion text, planteamiento_solucion text, prototipo_enlaces text[], documentacion_tecnica character varying, url_repositorio_proyecto character varying, fecha_postulacion timestamp with time zone, fecha_entrega_prototipo timestamp with time zone, calificacion_prototipo integer, comentario_prototipo text, tiene_prototipo boolean, tiene_repositorio boolean, tiene_documentacion boolean)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO ''
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


ALTER FUNCTION public.get_participaciones_de_proyecto(p_id_proyecto uuid) OWNER TO postgres;

--
-- Name: FUNCTION get_participaciones_de_proyecto(p_id_proyecto uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_participaciones_de_proyecto(p_id_proyecto uuid) IS 'Participaciones de un proyecto con identidad del estudiante (RF-34). Sobre cerrado: oculta el contenido de las `enviada` y expone solo booleanos de existencia. SECURITY DEFINER: reimpone que auth.uid() sea el empresario dueño; si no, devuelve 0 filas.';


--
-- Name: guard_empresarios_protected_cols(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.guard_empresarios_protected_cols() RETURNS trigger
    LANGUAGE plpgsql
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


ALTER FUNCTION public.guard_empresarios_protected_cols() OWNER TO postgres;

--
-- Name: guard_estudiantes_protected_cols(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.guard_estudiantes_protected_cols() RETURNS trigger
    LANGUAGE plpgsql
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


ALTER FUNCTION public.guard_estudiantes_protected_cols() OWNER TO postgres;

--
-- Name: guard_participaciones_estudiante_cols(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.guard_participaciones_estudiante_cols() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
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


ALTER FUNCTION public.guard_participaciones_estudiante_cols() OWNER TO postgres;

--
-- Name: guard_usuarios_protected_cols(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.guard_usuarios_protected_cols() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
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


ALTER FUNCTION public.guard_usuarios_protected_cols() OWNER TO postgres;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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
    -- id_rol intencionalmente omitido: queda NULL hasta que el
    -- usuario elija su rol en /onboarding mediante assign_my_role().
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


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: limpiar_huerfanos_oauth(boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.limpiar_huerfanos_oauth(p_dry_run boolean DEFAULT true) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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
    -- Auditoría (RNF-05): un registro por candidato, en dry-run o real.
    -- id_actor = null: es una acción del sistema (el cron), no de un admin.
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


ALTER FUNCTION public.limpiar_huerfanos_oauth(p_dry_run boolean) OWNER TO postgres;

--
-- Name: mis_proyectos_como_empresario(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mis_proyectos_como_empresario() RETURNS SETOF uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select p.id_proyecto
  from public.proyectos p
  join public.empresarios e on e.id_empresario = p.id_empresario
  where e.id_usuario = (select auth.uid())
$$;


ALTER FUNCTION public.mis_proyectos_como_empresario() OWNER TO postgres;

--
-- Name: FUNCTION mis_proyectos_como_empresario(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.mis_proyectos_como_empresario() IS 'IDs de proyectos del empresario autenticado. SECURITY DEFINER para romper la recursión RLS proyectos<->participaciones; filtra por auth.uid(), no expone datos ajenos.';


--
-- Name: mis_proyectos_como_estudiante(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mis_proyectos_como_estudiante() RETURNS SETOF uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select pa.id_proyecto
  from public.participaciones pa
  join public.estudiantes e on e.id_estudiante = pa.id_estudiante
  where e.id_usuario = (select auth.uid())
$$;


ALTER FUNCTION public.mis_proyectos_como_estudiante() OWNER TO postgres;

--
-- Name: FUNCTION mis_proyectos_como_estudiante(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.mis_proyectos_como_estudiante() IS 'IDs de proyectos donde el usuario autenticado participa como estudiante. SECURITY DEFINER para romper la recursión RLS proyectos<->participaciones en INSERT/UPDATE; filtra por auth.uid(), no expone datos ajenos.';


--
-- Name: publicar_proyecto(uuid, character varying, text, uuid, public.modalidad_enum, character varying, character varying, public.moneda_enum, numeric, numeric, integer, uuid[], uuid[], jsonb, boolean, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.publicar_proyecto(p_conversacion uuid, p_titulo character varying, p_descripcion text, p_id_area uuid, p_modalidad public.modalidad_enum, p_pais_iso character varying, p_region character varying, p_moneda public.moneda_enum, p_presupuesto_min numeric, p_presupuesto_max numeric, p_plazo_dias integer, p_categorias uuid[], p_tecnologias uuid[], p_propuesta jsonb, p_involucra_ia boolean, p_generado_por_ia boolean) RETURNS uuid
    LANGUAGE plpgsql
    SET search_path TO 'public'
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


ALTER FUNCTION public.publicar_proyecto(p_conversacion uuid, p_titulo character varying, p_descripcion text, p_id_area uuid, p_modalidad public.modalidad_enum, p_pais_iso character varying, p_region character varying, p_moneda public.moneda_enum, p_presupuesto_min numeric, p_presupuesto_max numeric, p_plazo_dias integer, p_categorias uuid[], p_tecnologias uuid[], p_propuesta jsonb, p_involucra_ia boolean, p_generado_por_ia boolean) OWNER TO postgres;

--
-- Name: FUNCTION publicar_proyecto(p_conversacion uuid, p_titulo character varying, p_descripcion text, p_id_area uuid, p_modalidad public.modalidad_enum, p_pais_iso character varying, p_region character varying, p_moneda public.moneda_enum, p_presupuesto_min numeric, p_presupuesto_max numeric, p_plazo_dias integer, p_categorias uuid[], p_tecnologias uuid[], p_propuesta jsonb, p_involucra_ia boolean, p_generado_por_ia boolean); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.publicar_proyecto(p_conversacion uuid, p_titulo character varying, p_descripcion text, p_id_area uuid, p_modalidad public.modalidad_enum, p_pais_iso character varying, p_region character varying, p_moneda public.moneda_enum, p_presupuesto_min numeric, p_presupuesto_max numeric, p_plazo_dias integer, p_categorias uuid[], p_tecnologias uuid[], p_propuesta jsonb, p_involucra_ia boolean, p_generado_por_ia boolean) IS 'Publica un proyecto de forma atómica desde la propuesta aprobada. Ubicación como códigos ISO (país 3166-1 en pais_iso_proyecto, región 3166-2 en region_proyecto). El plazo es duración en días (5..15). SECURITY INVOKER: respeta RLS.';


--
-- Name: recalcular_reputacion(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.recalcular_reputacion() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  update estudiantes set reputacion = coalesce(
    (select round(avg(puntuacion)::numeric, 2) from evaluaciones where id_estudiante = new.id_estudiante), 0.00)
  where id_estudiante = new.id_estudiante;
  return new;
end; $$;


ALTER FUNCTION public.recalcular_reputacion() OWNER TO postgres;

--
-- Name: recalcular_reputacion_empresario(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.recalcular_reputacion_empresario() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.recalcular_reputacion_empresario() OWNER TO postgres;

--
-- Name: recalcular_reputacion_estudiante(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.recalcular_reputacion_estudiante() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.recalcular_reputacion_estudiante() OWNER TO postgres;

--
-- Name: register_failed_login(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.register_failed_login(p_email text) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'public'
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


ALTER FUNCTION public.register_failed_login(p_email text) OWNER TO postgres;

--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
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


ALTER FUNCTION public.rls_auto_enable() OWNER TO postgres;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

--
-- Name: sync_contadores_estudiante(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_contadores_estudiante() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.sync_contadores_estudiante() OWNER TO postgres;

--
-- Name: sync_postulaciones_pendientes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_postulaciones_pendientes() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare id_proy uuid;
begin
  id_proy := coalesce(new.id_proyecto, old.id_proyecto);
  update proyectos set postulaciones_pendientes_revisar = (
    select count(*) from participaciones where id_proyecto = id_proy and estado = 'enviada')
  where id_proyecto = id_proy;
  return coalesce(new, old);
end; $$;


ALTER FUNCTION public.sync_postulaciones_pendientes() OWNER TO postgres;

--
-- Name: validar_cupo_participaciones(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validar_cupo_participaciones() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.validar_cupo_participaciones() OWNER TO postgres;

--
-- Name: validar_estado_proyecto_para_entregable(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validar_estado_proyecto_para_entregable() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.validar_estado_proyecto_para_entregable() OWNER TO postgres;

--
-- Name: validar_nivel_admin(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validar_nivel_admin() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.validar_nivel_admin() OWNER TO postgres;

--
-- Name: validar_transicion_participacion(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validar_transicion_participacion() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
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


ALTER FUNCTION public.validar_transicion_participacion() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
declare
    op_symbol text;
    res boolean;
begin
    -- IS DISTINCT FROM / IS NOT DISTINCT FROM: infix, both sides typed literals
    if op = 'isdistinct' then
        execute format(
            'select %L::%s %s %L::%s',
            val_1,
            type_::text,
            case when negate then 'IS NOT DISTINCT FROM' else 'IS DISTINCT FROM' end,
            val_2,
            type_::text
        ) into res;
        return res;
    end if;

    -- IS requires a keyword RHS (NULL, TRUE, FALSE, UNKNOWN), not a typed literal
    if op = 'is' then
        if val_2 not in ('null', 'true', 'false', 'unknown') then
            raise exception 'invalid value for is filter: must be null, true, false, or unknown';
        end if;
        execute format(
            'select %L::%s %s %s',
            val_1,
            type_::text,
            case when negate then 'IS NOT' else 'IS' end,
            upper(val_2)
        ) into res;
        return res;
    end if;

    op_symbol = case
        when op = 'eq'    then '='
        when op = 'neq'   then '!='
        when op = 'lt'    then '<'
        when op = 'lte'   then '<='
        when op = 'gt'    then '>'
        when op = 'gte'   then '>='
        when op = 'in'    then '= any'
        when op = 'like'   then 'LIKE'
        when op = 'ilike'  then 'ILIKE'
        when op = 'match'  then '~'
        when op = 'imatch' then '~*'
        else null
    end;

    if op_symbol is null then
        raise exception 'unsupported equality operator: %', op::text;
    end if;

    execute format(
        'select %L::%s %s (%L::%s)',
        val_1,
        type_::text,
        op_symbol,
        val_2,
        case when op = 'in' then type_::text || '[]' else type_::text end
    ) into res;

    return case when negate then not res else res end;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    select
        filters is null
        or array_length(filters, 1) is null
        or coalesce(
            count(col.name) = count(1)
            and sum(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(col.type_oid::regtype, col.type_name::regtype),
                    val_1:=col.value #>> '{}',
                    val_2:=f.value,
                    negate:=coalesce(f.negate, false)
                )::int
            ) filter (where col.name is not null) = count(col.name),
            false
        )
    from
        unnest(filters) f
        left join unnest(columns) col
            on f.column_name = col.name;
$$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        elsif filter.op = 'is'::realtime.equality_op then
            -- `is` requires a keyword RHS rather than a typed literal
            if filter.value not in ('null', 'true', 'false', 'unknown') then
                raise exception 'invalid value for is filter: must be null, true, false, or unknown';
            end if;
            -- IS NULL works for any type, but IS TRUE/FALSE/UNKNOWN require a boolean
            -- operand. Reject the non-null keywords on non-boolean columns here so they
            -- don't abort apply_rls at WAL time.
            if filter.value <> 'null' and col_type <> 'boolean'::regtype then
                raise exception 'is % filter requires a boolean column, got %', filter.value, col_type::text;
            end if;
        elsif filter.op in ('like'::realtime.equality_op, 'ilike'::realtime.equality_op) then
            -- like/ilike apply the text pattern operator (~~); reject column types that
            -- have no such operator instead of failing at WAL time
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = '~~' and oprleft = col_type
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
        elsif filter.op in ('match'::realtime.equality_op, 'imatch'::realtime.equality_op) then
            -- match/imatch apply the regex operators ~ / ~*; reject column types that have
            -- no such operator (e.g. integer) instead of failing at WAL time, mirroring the
            -- like/ilike guard above.
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = case when filter.op = 'imatch'::realtime.equality_op then '~*' else '~' end
                  and oprleft = col_type
                  and oprright = col_type
                  and oprresult = 'boolean'::regtype
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
            -- validate the regex eagerly so a bad pattern is rejected here, not inside
            -- apply_rls where it would abort the WAL stream for the entity
            begin
                perform '' ~ filter.value;
            exception when others then
                raise exception 'invalid regular expression for % filter: %', filter.op::text, sqlerrm;
            end;
        else
            -- eq/neq/lt/lte/gt/gte: value must be coercable to the type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint can't be tricked by a
    -- different filter order. negate is part of the sort key.
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value, f.negate),
        '{}'
    ) from unnest(new.filters) f;

    new.selected_columns = (
        select array_agg(c order by c)
        from unnest(new.selected_columns) c
    );

    return new;
end;
$$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


ALTER FUNCTION realtime.wal2json_escape_identifier(name text) OWNER TO supabase_admin;

--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


ALTER FUNCTION storage.allow_any_operation(expected_operations text[]) OWNER TO supabase_storage_admin;

--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


ALTER FUNCTION storage.allow_only_operation(expected_operation text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


ALTER TABLE auth.custom_oauth_providers OWNER TO supabase_auth_admin;

--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


ALTER TABLE auth.webauthn_challenges OWNER TO supabase_auth_admin;

--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


ALTER TABLE auth.webauthn_credentials OWNER TO supabase_auth_admin;

--
-- Name: areas_negocio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.areas_negocio (
    id_area uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(80) NOT NULL,
    descripcion character varying(255),
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.areas_negocio OWNER TO postgres;

--
-- Name: auditoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria (
    id_auditoria uuid DEFAULT gen_random_uuid() NOT NULL,
    id_actor uuid,
    accion character varying(100) NOT NULL,
    entidad character varying(80) NOT NULL,
    id_entidad uuid NOT NULL,
    valores_antes jsonb,
    valores_despues jsonb,
    ip_origen character varying(80),
    ocurrida_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.auditoria OWNER TO postgres;

--
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id_categoria uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(80) NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- Name: comentarios_entregables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comentarios_entregables (
    id_comentario_entregable uuid DEFAULT gen_random_uuid() NOT NULL,
    id_entregable uuid NOT NULL,
    id_autor uuid NOT NULL,
    contenido text NOT NULL,
    tipo_comentario public.tipo_comentario_enum NOT NULL,
    comentado_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comentarios_entregables OWNER TO postgres;

--
-- Name: configuracion_sistema; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracion_sistema (
    clave character varying(100) NOT NULL,
    valor text NOT NULL,
    tipo_dato public.tipo_dato_enum NOT NULL,
    descripcion text,
    modificado_por uuid,
    modificado_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.configuracion_sistema OWNER TO postgres;

--
-- Name: consentimientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consentimientos (
    id_consentimiento uuid DEFAULT gen_random_uuid() NOT NULL,
    id_usuario uuid NOT NULL,
    tipo_consentimiento public.tipo_consentimiento_enum NOT NULL,
    otorgado boolean NOT NULL,
    version_documento character varying(20),
    ip_origen character varying(60),
    user_agent character varying(255),
    consentimiento_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.consentimientos OWNER TO postgres;

--
-- Name: contrataciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contrataciones (
    id_contratacion uuid DEFAULT gen_random_uuid() NOT NULL,
    id_participacion uuid NOT NULL,
    fecha_inicio date,
    fecha_fin_estimada date,
    fecha_fin_real date,
    monto_acordado numeric(12,2),
    moneda public.moneda_enum DEFAULT 'USD'::public.moneda_enum NOT NULL,
    condiciones_especiales text,
    estado_periodo public.estado_periodo_enum DEFAULT 'vigente'::public.estado_periodo_enum NOT NULL,
    motivo_cancelacion text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.contrataciones OWNER TO postgres;

--
-- Name: conversaciones_ia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversaciones_ia (
    id_conversacion uuid DEFAULT gen_random_uuid() NOT NULL,
    id_empresario uuid NOT NULL,
    id_proyecto uuid,
    contexto_inicial text,
    contexto_inicial_pdf_url character varying(150),
    historial jsonb,
    nivel_tecnico_empresario public.nivel_tecnico_enum,
    stack_sugerido jsonb,
    propuesta_generada jsonb,
    propuesta_aprobada jsonb,
    estado public.estado_conv_ia_enum DEFAULT 'en_curso'::public.estado_conv_ia_enum NOT NULL,
    modelo_ia character varying(80),
    fecha_inicio timestamp with time zone DEFAULT now() NOT NULL,
    fecha_fin timestamp with time zone,
    logistica jsonb
);


ALTER TABLE public.conversaciones_ia OWNER TO postgres;

--
-- Name: egresados_fwd_oficial; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.egresados_fwd_oficial (
    correo text NOT NULL,
    fecha_agregado timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.egresados_fwd_oficial OWNER TO postgres;

--
-- Name: empresarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresarios (
    id_empresario uuid DEFAULT gen_random_uuid() NOT NULL,
    id_usuario uuid NOT NULL,
    tipo_empresario public.tipo_empresario_enum NOT NULL,
    nombre_empresa character varying(150),
    sector character varying(80),
    descripcion text,
    logo character varying(150),
    sitio_web character varying(150),
    cedula character varying(50),
    alcance_operativo public.alcance_enum,
    pais_iso_sede character varying(2),
    region_sede character varying(6),
    estado_verificacion public.estado_verif_enum DEFAULT 'pendiente'::public.estado_verif_enum NOT NULL,
    verificado_at timestamp with time zone,
    verificado_por uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    reputacion numeric(3,2),
    motivo_rechazo text
);


ALTER TABLE public.empresarios OWNER TO postgres;

--
-- Name: proyectos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proyectos (
    id_proyecto uuid DEFAULT gen_random_uuid() NOT NULL,
    id_empresario uuid NOT NULL,
    id_area_negocio uuid,
    titulo character varying(150) NOT NULL,
    descripcion text NOT NULL,
    involucra_ia boolean DEFAULT false NOT NULL,
    presupuesto_min numeric(12,2),
    presupuesto_max numeric(12,2),
    moneda public.moneda_enum DEFAULT 'USD'::public.moneda_enum NOT NULL,
    modalidad public.modalidad_enum NOT NULL,
    pais_iso_proyecto character varying(2),
    region_proyecto character varying(6),
    estado public.estado_proyecto_enum DEFAULT 'borrador'::public.estado_proyecto_enum NOT NULL,
    motivo_cancelacion text,
    fecha_publicacion timestamp with time zone,
    fecha_cierre timestamp with time zone,
    postulaciones_pendientes_revisar integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    generado_por_ia boolean DEFAULT false NOT NULL
);


ALTER TABLE public.proyectos OWNER TO postgres;

--
-- Name: empresarios_public; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.empresarios_public WITH (security_invoker='false') AS
 SELECT id_empresario,
    nombre_empresa
   FROM public.empresarios e
  WHERE (EXISTS ( SELECT 1
           FROM public.proyectos p
          WHERE ((p.id_empresario = e.id_empresario) AND (p.is_active = true) AND (p.estado <> 'borrador'::public.estado_proyecto_enum))));


ALTER VIEW public.empresarios_public OWNER TO postgres;

--
-- Name: VIEW empresarios_public; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.empresarios_public IS 'Identidad pública (id + nombre) de empresas con proyectos visibles. Expone solo columnas no sensibles para el marketplace; security_invoker=false intencional (ver migración).';


--
-- Name: entregables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entregables (
    id_entregable uuid DEFAULT gen_random_uuid() NOT NULL,
    id_contratacion uuid NOT NULL,
    tipo_entregable public.tipo_entregable_enum NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    archivo_url character varying(150),
    estado public.estado_entregable_enum DEFAULT 'enviado'::public.estado_entregable_enum NOT NULL,
    cargado_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    comentario_empresario text,
    archivo_hash text
);


ALTER TABLE public.entregables OWNER TO postgres;

--
-- Name: COLUMN entregables.archivo_hash; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.entregables.archivo_hash IS 'SHA-256 (hex) del contenido del archivo. Dedup por contratacion. Null en filas legacy.';


--
-- Name: estudiantes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estudiantes (
    id_estudiante uuid DEFAULT gen_random_uuid() NOT NULL,
    id_usuario uuid NOT NULL,
    titulo_fwd public.titulo_fwd_enum,
    estado_verificacion public.estado_verif_enum DEFAULT 'pendiente'::public.estado_verif_enum NOT NULL,
    verificado_at timestamp with time zone,
    verificado_por uuid,
    reputacion numeric(3,2),
    proyectos_completados integer DEFAULT 0 NOT NULL,
    participaciones_activas integer DEFAULT 0 NOT NULL,
    descripcion text,
    modalidad_preferida public.modalidad_enum,
    url_portafolio character varying(150),
    portafolio_visible_publicamente boolean DEFAULT true NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    pais_iso_residencia character varying(2),
    region_residencia character varying(6),
    motivo_rechazo text
);


ALTER TABLE public.estudiantes OWNER TO postgres;

--
-- Name: COLUMN estudiantes.pais_iso_residencia; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estudiantes.pais_iso_residencia IS 'País de residencia del estudiante (ISO 3166-1 alpha-2, ej. CR). Nullable.';


--
-- Name: COLUMN estudiantes.region_residencia; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estudiantes.region_residencia IS 'Región/subdivisión de residencia (ISO 3166-2, ej. CR-SJ). Opcional/nullable.';


--
-- Name: evaluaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluaciones (
    id_evaluacion uuid DEFAULT gen_random_uuid() NOT NULL,
    id_contratacion uuid NOT NULL,
    id_empresario uuid NOT NULL,
    id_estudiante uuid NOT NULL,
    puntuacion integer NOT NULL,
    comentario text,
    respuesta_evaluado text,
    evaluado_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT evaluaciones_puntuacion_check CHECK (((puntuacion >= 1) AND (puntuacion <= 5)))
);


ALTER TABLE public.evaluaciones OWNER TO postgres;

--
-- Name: evaluaciones_empresarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluaciones_empresarios (
    id_evaluacion uuid DEFAULT gen_random_uuid() NOT NULL,
    id_contratacion uuid NOT NULL,
    id_estudiante uuid NOT NULL,
    id_empresario uuid NOT NULL,
    puntuacion integer NOT NULL,
    comentario text,
    evaluado_at timestamp with time zone DEFAULT now() NOT NULL,
    respuesta_evaluado text,
    CONSTRAINT evaluaciones_empresarios_puntuacion_check CHECK (((puntuacion >= 1) AND (puntuacion <= 5)))
);


ALTER TABLE public.evaluaciones_empresarios OWNER TO postgres;

--
-- Name: habilidades_tecnicas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.habilidades_tecnicas (
    id_estudiante uuid NOT NULL,
    id_tecnologia uuid NOT NULL,
    nivel public.nivel_habilidad_enum NOT NULL
);


ALTER TABLE public.habilidades_tecnicas OWNER TO postgres;

--
-- Name: mensajes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mensajes (
    id_mensaje uuid DEFAULT gen_random_uuid() NOT NULL,
    id_proyecto uuid NOT NULL,
    id_remitente uuid NOT NULL,
    contenido text NOT NULL,
    leido boolean DEFAULT false NOT NULL,
    fecha_envio timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mensajes OWNER TO postgres;

--
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificaciones (
    id_notificacion uuid DEFAULT gen_random_uuid() NOT NULL,
    id_usuario uuid NOT NULL,
    tipo_evento public.tipo_notificacion_enum NOT NULL,
    mensaje character varying(255) NOT NULL,
    url_destino character varying(255),
    leida boolean DEFAULT false NOT NULL,
    generada_at timestamp with time zone DEFAULT now() NOT NULL,
    params jsonb,
    correo_enviado_at timestamp with time zone
);


ALTER TABLE public.notificaciones OWNER TO postgres;

--
-- Name: COLUMN notificaciones.correo_enviado_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notificaciones.correo_enviado_at IS 'Idempotencia de correo (RF-46): fecha/hora en que el emisor TS envio el correo de esta notificacion. NULL = aun no enviado. Solo lo escribe el emisor (service_role).';


--
-- Name: participaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participaciones (
    id_participacion uuid DEFAULT gen_random_uuid() NOT NULL,
    id_proyecto uuid NOT NULL,
    id_estudiante uuid NOT NULL,
    estado public.estado_participacion_enum DEFAULT 'enviada'::public.estado_participacion_enum NOT NULL,
    carta_postulacion text,
    fecha_postulacion timestamp with time zone DEFAULT now() NOT NULL,
    revision_iniciada_at timestamp with time zone,
    planteamiento_solucion text NOT NULL,
    prototipo_enlaces text[] NOT NULL,
    documentacion_tecnica text,
    fecha_entrega_prototipo timestamp with time zone,
    calificacion_prototipo integer,
    comentario_prototipo text,
    adjudicada_at timestamp with time zone,
    no_seleccionada_at timestamp with time zone,
    retirada_at timestamp with time zone,
    motivo_retiro text,
    url_repositorio_proyecto character varying(150),
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    plazo_aviso_enviado_at timestamp with time zone,
    CONSTRAINT participaciones_carta_max_chk CHECK (((carta_postulacion IS NULL) OR (char_length(carta_postulacion) <= 2800))),
    CONSTRAINT participaciones_documentacion_max_chk CHECK (((documentacion_tecnica IS NULL) OR (char_length(documentacion_tecnica) <= 300))),
    CONSTRAINT participaciones_planteamiento_min_chk CHECK ((char_length(planteamiento_solucion) >= 30)),
    CONSTRAINT participaciones_prototipo_enlaces_card_chk CHECK (((cardinality(prototipo_enlaces) >= 1) AND (cardinality(prototipo_enlaces) <= 4)))
);


ALTER TABLE public.participaciones OWNER TO postgres;

--
-- Name: portafolio_tecnologias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.portafolio_tecnologias (
    id_portafolio uuid NOT NULL,
    id_tecnologia uuid NOT NULL
);


ALTER TABLE public.portafolio_tecnologias OWNER TO postgres;

--
-- Name: proyecto_categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proyecto_categorias (
    id_proyecto uuid NOT NULL,
    id_categoria uuid NOT NULL
);


ALTER TABLE public.proyecto_categorias OWNER TO postgres;

--
-- Name: proyecto_tecnologias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proyecto_tecnologias (
    id_proyecto uuid NOT NULL,
    id_tecnologia uuid NOT NULL
);


ALTER TABLE public.proyecto_tecnologias OWNER TO postgres;

--
-- Name: proyectos_portafolio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proyectos_portafolio (
    id_portafolio uuid DEFAULT gen_random_uuid() NOT NULL,
    id_estudiante uuid NOT NULL,
    titulo character varying(150) NOT NULL,
    descripcion text,
    imagen_url character varying(150),
    fecha date,
    origen public.origen_portafolio_enum NOT NULL,
    id_participacion uuid,
    url_repositorio character varying(150),
    url_demo character varying(150),
    estado_consentimiento public.estado_consent_portafolio_enum,
    consentimiento_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.proyectos_portafolio OWNER TO postgres;

--
-- Name: reportes_moderacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reportes_moderacion (
    id_reporte uuid DEFAULT gen_random_uuid() NOT NULL,
    id_reportante uuid NOT NULL,
    id_reportado uuid,
    id_proyecto uuid,
    id_mensaje uuid,
    id_entregable uuid,
    id_portafolio uuid,
    tipo_reporte public.tipo_reporte_enum NOT NULL,
    descripcion text NOT NULL,
    estado_moderacion public.estado_moderacion_enum DEFAULT 'pendiente'::public.estado_moderacion_enum NOT NULL,
    resolucion text,
    resuelto_por uuid,
    reportado_at timestamp with time zone DEFAULT now() NOT NULL,
    resuelto_at timestamp with time zone,
    CONSTRAINT reportes_moderacion_exactamente_uno_objetivo CHECK ((((((
CASE
    WHEN (id_reportado IS NOT NULL) THEN 1
    ELSE 0
END +
CASE
    WHEN (id_proyecto IS NOT NULL) THEN 1
    ELSE 0
END) +
CASE
    WHEN (id_mensaje IS NOT NULL) THEN 1
    ELSE 0
END) +
CASE
    WHEN (id_entregable IS NOT NULL) THEN 1
    ELSE 0
END) +
CASE
    WHEN (id_portafolio IS NOT NULL) THEN 1
    ELSE 0
END) = 1))
);


ALTER TABLE public.reportes_moderacion OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id_rol smallint NOT NULL,
    nombre_rol character varying(30) NOT NULL,
    descripcion character varying(255)
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.roles ALTER COLUMN id_rol ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.roles_id_rol_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: soporte_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.soporte_tickets (
    id_ticket uuid DEFAULT gen_random_uuid() NOT NULL,
    id_usuario uuid NOT NULL,
    descripcion text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.soporte_tickets OWNER TO postgres;

--
-- Name: strikes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strikes (
    id_strike uuid DEFAULT gen_random_uuid() NOT NULL,
    id_usuario uuid NOT NULL,
    id_proyecto uuid,
    id_reporte uuid,
    motivo public.motivo_strike_enum NOT NULL,
    descripcion text,
    aplicado_por uuid NOT NULL,
    aplicado_at timestamp with time zone DEFAULT now() NOT NULL,
    revocado boolean DEFAULT false NOT NULL,
    revocado_por uuid,
    motivo_revocacion text,
    revocado_at timestamp with time zone
);


ALTER TABLE public.strikes OWNER TO postgres;

--
-- Name: tecnologias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tecnologias (
    id_tecnologia uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(80) NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.tecnologias OWNER TO postgres;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario uuid NOT NULL,
    nombre character varying(80) NOT NULL,
    apellido_1 character varying(80) NOT NULL,
    apellido_2 character varying(80),
    fecha_nacimiento date,
    correo character varying(150) NOT NULL,
    id_rol smallint,
    foto_perfil character varying(150),
    estado_cuenta public.estado_cuenta_enum DEFAULT 'pendiente'::public.estado_cuenta_enum NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    cantidad_strikes integer DEFAULT 0 NOT NULL,
    intentos_fallidos integer DEFAULT 0 NOT NULL,
    bloqueado_hasta timestamp with time zone,
    fecha_registro timestamp with time zone DEFAULT now() NOT NULL,
    ultimo_login_at timestamp with time zone,
    suspendido_at timestamp with time zone,
    nivel_admin public.nivel_admin_enum,
    tipos_notificacion_silenciados public.tipo_notificacion_enum[] DEFAULT '{}'::public.tipo_notificacion_enum[] NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: areas_negocio areas_negocio_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas_negocio
    ADD CONSTRAINT areas_negocio_nombre_key UNIQUE (nombre);


--
-- Name: areas_negocio areas_negocio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas_negocio
    ADD CONSTRAINT areas_negocio_pkey PRIMARY KEY (id_area);


--
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id_auditoria);


--
-- Name: categorias categorias_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_nombre_key UNIQUE (nombre);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id_categoria);


--
-- Name: proyectos chk_proyectos_plazo; Type: CHECK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.proyectos
    ADD CONSTRAINT chk_proyectos_plazo CHECK (((fecha_publicacion IS NULL) OR (fecha_cierre IS NULL) OR (((fecha_cierre - fecha_publicacion) >= '5 days'::interval) AND ((fecha_cierre - fecha_publicacion) <= '15 days'::interval)))) NOT VALID;


--
-- Name: proyectos chk_proyectos_presupuesto; Type: CHECK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.proyectos
    ADD CONSTRAINT chk_proyectos_presupuesto CHECK (((presupuesto_min IS NULL) OR (presupuesto_max IS NULL) OR (presupuesto_min <= presupuesto_max))) NOT VALID;


--
-- Name: proyectos chk_proyectos_ubicacion; Type: CHECK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.proyectos
    ADD CONSTRAINT chk_proyectos_ubicacion CHECK (((modalidad = 'remoto'::public.modalidad_enum) OR (pais_iso_proyecto IS NOT NULL))) NOT VALID;


--
-- Name: comentarios_entregables comentarios_entregables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentarios_entregables
    ADD CONSTRAINT comentarios_entregables_pkey PRIMARY KEY (id_comentario_entregable);


--
-- Name: configuracion_sistema configuracion_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_sistema
    ADD CONSTRAINT configuracion_sistema_pkey PRIMARY KEY (clave);


--
-- Name: consentimientos consentimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consentimientos
    ADD CONSTRAINT consentimientos_pkey PRIMARY KEY (id_consentimiento);


--
-- Name: contrataciones contrataciones_id_participacion_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrataciones
    ADD CONSTRAINT contrataciones_id_participacion_key UNIQUE (id_participacion);


--
-- Name: contrataciones contrataciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrataciones
    ADD CONSTRAINT contrataciones_pkey PRIMARY KEY (id_contratacion);


--
-- Name: conversaciones_ia conversaciones_ia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversaciones_ia
    ADD CONSTRAINT conversaciones_ia_pkey PRIMARY KEY (id_conversacion);


--
-- Name: egresados_fwd_oficial egresados_fwd_oficial_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.egresados_fwd_oficial
    ADD CONSTRAINT egresados_fwd_oficial_pkey PRIMARY KEY (correo);


--
-- Name: empresarios empresarios_id_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresarios
    ADD CONSTRAINT empresarios_id_usuario_key UNIQUE (id_usuario);


--
-- Name: empresarios empresarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresarios
    ADD CONSTRAINT empresarios_pkey PRIMARY KEY (id_empresario);


--
-- Name: entregables entregables_contratacion_version_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entregables
    ADD CONSTRAINT entregables_contratacion_version_key UNIQUE (id_contratacion, version);


--
-- Name: entregables entregables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entregables
    ADD CONSTRAINT entregables_pkey PRIMARY KEY (id_entregable);


--
-- Name: estudiantes estudiantes_id_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_id_usuario_key UNIQUE (id_usuario);


--
-- Name: estudiantes estudiantes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_pkey PRIMARY KEY (id_estudiante);


--
-- Name: evaluaciones_empresarios evaluaciones_empresarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones_empresarios
    ADD CONSTRAINT evaluaciones_empresarios_pkey PRIMARY KEY (id_evaluacion);


--
-- Name: evaluaciones evaluaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_pkey PRIMARY KEY (id_evaluacion);


--
-- Name: habilidades_tecnicas habilidades_tecnicas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habilidades_tecnicas
    ADD CONSTRAINT habilidades_tecnicas_pkey PRIMARY KEY (id_estudiante, id_tecnologia);


--
-- Name: mensajes mensajes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT mensajes_pkey PRIMARY KEY (id_mensaje);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id_notificacion);


--
-- Name: participaciones participaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participaciones
    ADD CONSTRAINT participaciones_pkey PRIMARY KEY (id_participacion);


--
-- Name: participaciones participaciones_proyecto_estudiante_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participaciones
    ADD CONSTRAINT participaciones_proyecto_estudiante_key UNIQUE (id_proyecto, id_estudiante);


--
-- Name: portafolio_tecnologias portafolio_tecnologias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portafolio_tecnologias
    ADD CONSTRAINT portafolio_tecnologias_pkey PRIMARY KEY (id_portafolio, id_tecnologia);


--
-- Name: proyecto_categorias proyecto_categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_categorias
    ADD CONSTRAINT proyecto_categorias_pkey PRIMARY KEY (id_proyecto, id_categoria);


--
-- Name: proyecto_tecnologias proyecto_tecnologias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_tecnologias
    ADD CONSTRAINT proyecto_tecnologias_pkey PRIMARY KEY (id_proyecto, id_tecnologia);


--
-- Name: proyectos proyectos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_pkey PRIMARY KEY (id_proyecto);


--
-- Name: proyectos_portafolio proyectos_portafolio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyectos_portafolio
    ADD CONSTRAINT proyectos_portafolio_pkey PRIMARY KEY (id_portafolio);


--
-- Name: reportes_moderacion reportes_moderacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_moderacion
    ADD CONSTRAINT reportes_moderacion_pkey PRIMARY KEY (id_reporte);


--
-- Name: roles roles_nombre_rol_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_rol_key UNIQUE (nombre_rol);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- Name: soporte_tickets soporte_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.soporte_tickets
    ADD CONSTRAINT soporte_tickets_pkey PRIMARY KEY (id_ticket);


--
-- Name: strikes strikes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strikes
    ADD CONSTRAINT strikes_pkey PRIMARY KEY (id_strike);


--
-- Name: tecnologias tecnologias_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tecnologias
    ADD CONSTRAINT tecnologias_nombre_key UNIQUE (nombre);


--
-- Name: tecnologias tecnologias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tecnologias
    ADD CONSTRAINT tecnologias_pkey PRIMARY KEY (id_tecnologia);


--
-- Name: evaluaciones_empresarios uq_contratacion_estudiante; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones_empresarios
    ADD CONSTRAINT uq_contratacion_estudiante UNIQUE (id_contratacion, id_estudiante);


--
-- Name: evaluaciones uq_evaluaciones_contratacion_empresario; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT uq_evaluaciones_contratacion_empresario UNIQUE (id_contratacion, id_empresario);


--
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: entregables_contratacion_hash_uniq; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX entregables_contratacion_hash_uniq ON public.entregables USING btree (id_contratacion, archivo_hash) WHERE (archivo_hash IS NOT NULL);


--
-- Name: idx_auditoria_actor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_actor ON public.auditoria USING btree (id_actor, ocurrida_at DESC);


--
-- Name: idx_auditoria_entidad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_entidad ON public.auditoria USING btree (entidad, id_entidad, ocurrida_at DESC);


--
-- Name: idx_comentarios_entregable_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comentarios_entregable_fecha ON public.comentarios_entregables USING btree (id_entregable, comentado_at DESC);


--
-- Name: idx_comentarios_entregables_id_autor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comentarios_entregables_id_autor ON public.comentarios_entregables USING btree (id_autor);


--
-- Name: idx_consentimientos_usuario_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consentimientos_usuario_tipo ON public.consentimientos USING btree (id_usuario, tipo_consentimiento, consentimiento_at DESC);


--
-- Name: idx_conversaciones_ia_empresario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversaciones_ia_empresario ON public.conversaciones_ia USING btree (id_empresario, fecha_inicio DESC);


--
-- Name: idx_entregables_id_contratacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_entregables_id_contratacion ON public.entregables USING btree (id_contratacion);


--
-- Name: idx_evaluaciones_emp_id_contratacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_evaluaciones_emp_id_contratacion ON public.evaluaciones_empresarios USING btree (id_contratacion);


--
-- Name: idx_evaluaciones_emp_id_empresario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_evaluaciones_emp_id_empresario ON public.evaluaciones_empresarios USING btree (id_empresario);


--
-- Name: idx_evaluaciones_estudiante; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_evaluaciones_estudiante ON public.evaluaciones USING btree (id_estudiante);


--
-- Name: idx_evaluaciones_id_contratacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_evaluaciones_id_contratacion ON public.evaluaciones USING btree (id_contratacion);


--
-- Name: idx_evaluaciones_id_empresario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_evaluaciones_id_empresario ON public.evaluaciones USING btree (id_empresario);


--
-- Name: idx_hab_tec_tecnologia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_hab_tec_tecnologia ON public.habilidades_tecnicas USING btree (id_tecnologia);


--
-- Name: idx_mensajes_proyecto_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mensajes_proyecto_fecha ON public.mensajes USING btree (id_proyecto, fecha_envio DESC);


--
-- Name: idx_mensajes_remitente_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mensajes_remitente_fecha ON public.mensajes USING btree (id_remitente, fecha_envio DESC);


--
-- Name: idx_notificaciones_usuario_leida; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notificaciones_usuario_leida ON public.notificaciones USING btree (id_usuario, leida, generada_at DESC);


--
-- Name: idx_participaciones_estudiante_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_participaciones_estudiante_estado ON public.participaciones USING btree (id_estudiante, estado);


--
-- Name: idx_participaciones_proyecto_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_participaciones_proyecto_estado ON public.participaciones USING btree (id_proyecto, estado);


--
-- Name: idx_portafolio_estudiante; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_portafolio_estudiante ON public.proyectos_portafolio USING btree (id_estudiante) WHERE (is_active = true);


--
-- Name: idx_portafolio_tecnologias_tec; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_portafolio_tecnologias_tec ON public.portafolio_tecnologias USING btree (id_tecnologia);


--
-- Name: idx_proyecto_categorias_cat; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_proyecto_categorias_cat ON public.proyecto_categorias USING btree (id_categoria);


--
-- Name: idx_proyecto_tecnologias_tecnologia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_proyecto_tecnologias_tecnologia ON public.proyecto_tecnologias USING btree (id_tecnologia);


--
-- Name: idx_proyectos_area; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_proyectos_area ON public.proyectos USING btree (id_area_negocio);


--
-- Name: idx_proyectos_estado_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_proyectos_estado_fecha ON public.proyectos USING btree (estado, fecha_publicacion DESC) WHERE (is_active = true);


--
-- Name: idx_proyectos_id_empresario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_proyectos_id_empresario ON public.proyectos USING btree (id_empresario);


--
-- Name: idx_reportes_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reportes_estado ON public.reportes_moderacion USING btree (estado_moderacion, reportado_at DESC) WHERE (estado_moderacion = ANY (ARRAY['pendiente'::public.estado_moderacion_enum, 'en_revision'::public.estado_moderacion_enum]));


--
-- Name: idx_reportes_id_reportante; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reportes_id_reportante ON public.reportes_moderacion USING btree (id_reportante);


--
-- Name: idx_strikes_id_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_strikes_id_usuario ON public.strikes USING btree (id_usuario);


--
-- Name: idx_strikes_usuario_activos; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_strikes_usuario_activos ON public.strikes USING btree (id_usuario) WHERE (revocado = false);


--
-- Name: idx_usuarios_correo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_correo ON public.usuarios USING btree (correo);


--
-- Name: idx_usuarios_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_estado ON public.usuarios USING btree (estado_cuenta);


--
-- Name: idx_usuarios_nivel_admin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_nivel_admin ON public.usuarios USING btree (nivel_admin) WHERE (nivel_admin IS NOT NULL);


--
-- Name: idx_usuarios_rol; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_rol ON public.usuarios USING btree (id_rol);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: supabase_auth_admin
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: users on_email_confirmed_activate; Type: TRIGGER; Schema: auth; Owner: supabase_auth_admin
--

CREATE TRIGGER on_email_confirmed_activate AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users FOR EACH ROW EXECUTE FUNCTION public.activar_cuenta_al_confirmar_correo();


--
-- Name: entregables trg_auto_estado_entregable_final; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_auto_estado_entregable_final BEFORE INSERT ON public.entregables FOR EACH ROW EXECUTE FUNCTION public.auto_set_estado_entregable_final();


--
-- Name: participaciones trg_contadores_estudiante; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_contadores_estudiante AFTER INSERT OR DELETE OR UPDATE ON public.participaciones FOR EACH ROW EXECUTE FUNCTION public.sync_contadores_estudiante();


--
-- Name: contrataciones trg_contrataciones_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_contrataciones_updated_at BEFORE UPDATE ON public.contrataciones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: participaciones trg_crear_contratacion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_crear_contratacion AFTER UPDATE OF estado ON public.participaciones FOR EACH ROW EXECUTE FUNCTION public.crear_contratacion_al_adjudicar();


--
-- Name: participaciones trg_cupo_participaciones; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_cupo_participaciones BEFORE INSERT ON public.participaciones FOR EACH ROW EXECUTE FUNCTION public.validar_cupo_participaciones();


--
-- Name: empresarios trg_empresarios_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_empresarios_updated_at BEFORE UPDATE ON public.empresarios FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: entregables trg_entregables_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_entregables_updated_at BEFORE UPDATE ON public.entregables FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: estudiantes trg_estudiantes_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_estudiantes_updated_at BEFORE UPDATE ON public.estudiantes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: empresarios trg_guard_empresarios_protected; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_guard_empresarios_protected BEFORE INSERT OR UPDATE ON public.empresarios FOR EACH ROW EXECUTE FUNCTION public.guard_empresarios_protected_cols();


--
-- Name: estudiantes trg_guard_estudiantes_protected; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_guard_estudiantes_protected BEFORE INSERT OR UPDATE ON public.estudiantes FOR EACH ROW EXECUTE FUNCTION public.guard_estudiantes_protected_cols();


--
-- Name: participaciones trg_guard_participaciones_estudiante; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_guard_participaciones_estudiante BEFORE UPDATE ON public.participaciones FOR EACH ROW EXECUTE FUNCTION public.guard_participaciones_estudiante_cols();


--
-- Name: usuarios trg_guard_usuarios_protected; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_guard_usuarios_protected BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.guard_usuarios_protected_cols();


--
-- Name: mensajes trg_mensajes_rate_limit; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_mensajes_rate_limit BEFORE INSERT ON public.mensajes FOR EACH ROW EXECUTE FUNCTION public.check_mensaje_rate_limit();


--
-- Name: participaciones trg_participaciones_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_participaciones_updated_at BEFORE UPDATE ON public.participaciones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: participaciones trg_postulaciones_pendientes; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_postulaciones_pendientes AFTER INSERT OR DELETE OR UPDATE ON public.participaciones FOR EACH ROW EXECUTE FUNCTION public.sync_postulaciones_pendientes();


--
-- Name: proyectos trg_proyectos_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_proyectos_updated_at BEFORE UPDATE ON public.proyectos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: evaluaciones trg_reputacion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_reputacion AFTER INSERT OR UPDATE OF puntuacion ON public.evaluaciones FOR EACH ROW EXECUTE FUNCTION public.recalcular_reputacion();


--
-- Name: evaluaciones_empresarios trg_reputacion_empresario; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_reputacion_empresario AFTER INSERT OR UPDATE OF puntuacion ON public.evaluaciones_empresarios FOR EACH ROW EXECUTE FUNCTION public.recalcular_reputacion_empresario();


--
-- Name: evaluaciones trg_reputacion_estudiante; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_reputacion_estudiante AFTER INSERT OR UPDATE OF puntuacion ON public.evaluaciones FOR EACH ROW EXECUTE FUNCTION public.recalcular_reputacion_estudiante();


--
-- Name: strikes trg_strikes_actualizar; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_strikes_actualizar AFTER INSERT OR UPDATE OF revocado ON public.strikes FOR EACH ROW EXECUTE FUNCTION public.actualizar_strikes();


--
-- Name: participaciones trg_transicion_participaciones; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_transicion_participaciones BEFORE UPDATE OF estado ON public.participaciones FOR EACH ROW EXECUTE FUNCTION public.validar_transicion_participacion();


--
-- Name: entregables trg_validar_estado_entregable; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_validar_estado_entregable BEFORE INSERT OR UPDATE ON public.entregables FOR EACH ROW EXECUTE FUNCTION public.validar_estado_proyecto_para_entregable();


--
-- Name: usuarios trg_validar_nivel_admin; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_validar_nivel_admin BEFORE INSERT OR UPDATE OF id_rol, nivel_admin ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.validar_nivel_admin();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: auditoria auditoria_id_actor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_id_actor_fkey FOREIGN KEY (id_actor) REFERENCES public.usuarios(id_usuario);


--
-- Name: comentarios_entregables comentarios_entregables_id_autor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentarios_entregables
    ADD CONSTRAINT comentarios_entregables_id_autor_fkey FOREIGN KEY (id_autor) REFERENCES public.usuarios(id_usuario);


--
-- Name: comentarios_entregables comentarios_entregables_id_entregable_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentarios_entregables
    ADD CONSTRAINT comentarios_entregables_id_entregable_fkey FOREIGN KEY (id_entregable) REFERENCES public.entregables(id_entregable) ON DELETE CASCADE;


--
-- Name: configuracion_sistema configuracion_sistema_modificado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_sistema
    ADD CONSTRAINT configuracion_sistema_modificado_por_fkey FOREIGN KEY (modificado_por) REFERENCES public.usuarios(id_usuario);


--
-- Name: consentimientos consentimientos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consentimientos
    ADD CONSTRAINT consentimientos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: contrataciones contrataciones_id_participacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrataciones
    ADD CONSTRAINT contrataciones_id_participacion_fkey FOREIGN KEY (id_participacion) REFERENCES public.participaciones(id_participacion);


--
-- Name: conversaciones_ia conversaciones_ia_id_empresario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversaciones_ia
    ADD CONSTRAINT conversaciones_ia_id_empresario_fkey FOREIGN KEY (id_empresario) REFERENCES public.empresarios(id_empresario);


--
-- Name: conversaciones_ia conversaciones_ia_id_proyecto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversaciones_ia
    ADD CONSTRAINT conversaciones_ia_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyectos(id_proyecto);


--
-- Name: empresarios empresarios_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresarios
    ADD CONSTRAINT empresarios_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: empresarios empresarios_verificado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresarios
    ADD CONSTRAINT empresarios_verificado_por_fkey FOREIGN KEY (verificado_por) REFERENCES public.usuarios(id_usuario);


--
-- Name: entregables entregables_id_contratacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entregables
    ADD CONSTRAINT entregables_id_contratacion_fkey FOREIGN KEY (id_contratacion) REFERENCES public.contrataciones(id_contratacion);


--
-- Name: estudiantes estudiantes_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: estudiantes estudiantes_verificado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_verificado_por_fkey FOREIGN KEY (verificado_por) REFERENCES public.usuarios(id_usuario);


--
-- Name: evaluaciones_empresarios evaluaciones_empresarios_id_contratacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones_empresarios
    ADD CONSTRAINT evaluaciones_empresarios_id_contratacion_fkey FOREIGN KEY (id_contratacion) REFERENCES public.contrataciones(id_contratacion) ON DELETE CASCADE;


--
-- Name: evaluaciones_empresarios evaluaciones_empresarios_id_empresario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones_empresarios
    ADD CONSTRAINT evaluaciones_empresarios_id_empresario_fkey FOREIGN KEY (id_empresario) REFERENCES public.empresarios(id_empresario) ON DELETE CASCADE;


--
-- Name: evaluaciones_empresarios evaluaciones_empresarios_id_estudiante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones_empresarios
    ADD CONSTRAINT evaluaciones_empresarios_id_estudiante_fkey FOREIGN KEY (id_estudiante) REFERENCES public.estudiantes(id_estudiante) ON DELETE CASCADE;


--
-- Name: evaluaciones evaluaciones_id_contratacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_id_contratacion_fkey FOREIGN KEY (id_contratacion) REFERENCES public.contrataciones(id_contratacion);


--
-- Name: evaluaciones evaluaciones_id_empresario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_id_empresario_fkey FOREIGN KEY (id_empresario) REFERENCES public.empresarios(id_empresario);


--
-- Name: evaluaciones evaluaciones_id_estudiante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_id_estudiante_fkey FOREIGN KEY (id_estudiante) REFERENCES public.estudiantes(id_estudiante);


--
-- Name: strikes fk_strikes_reporte; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strikes
    ADD CONSTRAINT fk_strikes_reporte FOREIGN KEY (id_reporte) REFERENCES public.reportes_moderacion(id_reporte);


--
-- Name: habilidades_tecnicas habilidades_tecnicas_id_estudiante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habilidades_tecnicas
    ADD CONSTRAINT habilidades_tecnicas_id_estudiante_fkey FOREIGN KEY (id_estudiante) REFERENCES public.estudiantes(id_estudiante) ON DELETE CASCADE;


--
-- Name: habilidades_tecnicas habilidades_tecnicas_id_tecnologia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habilidades_tecnicas
    ADD CONSTRAINT habilidades_tecnicas_id_tecnologia_fkey FOREIGN KEY (id_tecnologia) REFERENCES public.tecnologias(id_tecnologia) ON DELETE CASCADE;


--
-- Name: mensajes mensajes_id_proyecto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT mensajes_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyectos(id_proyecto);


--
-- Name: mensajes mensajes_id_remitente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT mensajes_id_remitente_fkey FOREIGN KEY (id_remitente) REFERENCES public.usuarios(id_usuario);


--
-- Name: notificaciones notificaciones_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: participaciones participaciones_id_estudiante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participaciones
    ADD CONSTRAINT participaciones_id_estudiante_fkey FOREIGN KEY (id_estudiante) REFERENCES public.estudiantes(id_estudiante);


--
-- Name: participaciones participaciones_id_proyecto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participaciones
    ADD CONSTRAINT participaciones_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyectos(id_proyecto);


--
-- Name: portafolio_tecnologias portafolio_tecnologias_id_portafolio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portafolio_tecnologias
    ADD CONSTRAINT portafolio_tecnologias_id_portafolio_fkey FOREIGN KEY (id_portafolio) REFERENCES public.proyectos_portafolio(id_portafolio) ON DELETE CASCADE;


--
-- Name: portafolio_tecnologias portafolio_tecnologias_id_tecnologia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portafolio_tecnologias
    ADD CONSTRAINT portafolio_tecnologias_id_tecnologia_fkey FOREIGN KEY (id_tecnologia) REFERENCES public.tecnologias(id_tecnologia) ON DELETE CASCADE;


--
-- Name: proyecto_categorias proyecto_categorias_id_categoria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_categorias
    ADD CONSTRAINT proyecto_categorias_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria) ON DELETE CASCADE;


--
-- Name: proyecto_categorias proyecto_categorias_id_proyecto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_categorias
    ADD CONSTRAINT proyecto_categorias_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyectos(id_proyecto) ON DELETE CASCADE;


--
-- Name: proyecto_tecnologias proyecto_tecnologias_id_proyecto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_tecnologias
    ADD CONSTRAINT proyecto_tecnologias_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyectos(id_proyecto) ON DELETE CASCADE;


--
-- Name: proyecto_tecnologias proyecto_tecnologias_id_tecnologia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_tecnologias
    ADD CONSTRAINT proyecto_tecnologias_id_tecnologia_fkey FOREIGN KEY (id_tecnologia) REFERENCES public.tecnologias(id_tecnologia) ON DELETE CASCADE;


--
-- Name: proyectos proyectos_id_area_negocio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_id_area_negocio_fkey FOREIGN KEY (id_area_negocio) REFERENCES public.areas_negocio(id_area);


--
-- Name: proyectos proyectos_id_empresario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_id_empresario_fkey FOREIGN KEY (id_empresario) REFERENCES public.empresarios(id_empresario);


--
-- Name: proyectos_portafolio proyectos_portafolio_id_estudiante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyectos_portafolio
    ADD CONSTRAINT proyectos_portafolio_id_estudiante_fkey FOREIGN KEY (id_estudiante) REFERENCES public.estudiantes(id_estudiante) ON DELETE CASCADE;


--
-- Name: proyectos_portafolio proyectos_portafolio_id_participacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyectos_portafolio
    ADD CONSTRAINT proyectos_portafolio_id_participacion_fkey FOREIGN KEY (id_participacion) REFERENCES public.participaciones(id_participacion);


--
-- Name: reportes_moderacion reportes_moderacion_id_entregable_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_moderacion
    ADD CONSTRAINT reportes_moderacion_id_entregable_fkey FOREIGN KEY (id_entregable) REFERENCES public.entregables(id_entregable);


--
-- Name: reportes_moderacion reportes_moderacion_id_mensaje_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_moderacion
    ADD CONSTRAINT reportes_moderacion_id_mensaje_fkey FOREIGN KEY (id_mensaje) REFERENCES public.mensajes(id_mensaje);


--
-- Name: reportes_moderacion reportes_moderacion_id_portafolio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_moderacion
    ADD CONSTRAINT reportes_moderacion_id_portafolio_fkey FOREIGN KEY (id_portafolio) REFERENCES public.proyectos_portafolio(id_portafolio);


--
-- Name: reportes_moderacion reportes_moderacion_id_proyecto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_moderacion
    ADD CONSTRAINT reportes_moderacion_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyectos(id_proyecto);


--
-- Name: reportes_moderacion reportes_moderacion_id_reportado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_moderacion
    ADD CONSTRAINT reportes_moderacion_id_reportado_fkey FOREIGN KEY (id_reportado) REFERENCES public.usuarios(id_usuario);


--
-- Name: reportes_moderacion reportes_moderacion_id_reportante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_moderacion
    ADD CONSTRAINT reportes_moderacion_id_reportante_fkey FOREIGN KEY (id_reportante) REFERENCES public.usuarios(id_usuario);


--
-- Name: reportes_moderacion reportes_moderacion_resuelto_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_moderacion
    ADD CONSTRAINT reportes_moderacion_resuelto_por_fkey FOREIGN KEY (resuelto_por) REFERENCES public.usuarios(id_usuario);


--
-- Name: soporte_tickets soporte_tickets_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.soporte_tickets
    ADD CONSTRAINT soporte_tickets_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: strikes strikes_aplicado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strikes
    ADD CONSTRAINT strikes_aplicado_por_fkey FOREIGN KEY (aplicado_por) REFERENCES public.usuarios(id_usuario);


--
-- Name: strikes strikes_id_proyecto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strikes
    ADD CONSTRAINT strikes_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyectos(id_proyecto);


--
-- Name: strikes strikes_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strikes
    ADD CONSTRAINT strikes_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- Name: strikes strikes_revocado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strikes
    ADD CONSTRAINT strikes_revocado_por_fkey FOREIGN KEY (revocado_por) REFERENCES public.usuarios(id_usuario);


--
-- Name: usuarios usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol);


--
-- Name: usuarios usuarios_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: areas_negocio; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.areas_negocio ENABLE ROW LEVEL SECURITY;

--
-- Name: areas_negocio areas_negocio_select_active; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY areas_negocio_select_active ON public.areas_negocio FOR SELECT USING ((is_active = true));


--
-- Name: auditoria; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

--
-- Name: categorias; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

--
-- Name: categorias categorias_select_active; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY categorias_select_active ON public.categorias FOR SELECT USING ((is_active = true));


--
-- Name: comentarios_entregables; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.comentarios_entregables ENABLE ROW LEVEL SECURITY;

--
-- Name: comentarios_entregables comentarios_entregables_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY comentarios_entregables_insert ON public.comentarios_entregables FOR INSERT WITH CHECK (((id_autor = ( SELECT auth.uid() AS uid)) AND (id_entregable IN ( SELECT e.id_entregable
   FROM ((public.entregables e
     JOIN public.contrataciones c ON ((c.id_contratacion = e.id_contratacion)))
     JOIN public.participaciones pa ON ((pa.id_participacion = c.id_participacion)))
  WHERE ((pa.id_estudiante IN ( SELECT estudiantes.id_estudiante
           FROM public.estudiantes
          WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))) OR (pa.id_proyecto IN ( SELECT p.id_proyecto
           FROM (public.proyectos p
             JOIN public.empresarios emp ON ((emp.id_empresario = p.id_empresario)))
          WHERE (emp.id_usuario = ( SELECT auth.uid() AS uid))))))) AND public.current_user_is_verified()));


--
-- Name: comentarios_entregables comentarios_entregables_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY comentarios_entregables_select ON public.comentarios_entregables FOR SELECT USING ((id_entregable IN ( SELECT e.id_entregable
   FROM ((public.entregables e
     JOIN public.contrataciones c ON ((c.id_contratacion = e.id_contratacion)))
     JOIN public.participaciones pa ON ((pa.id_participacion = c.id_participacion)))
  WHERE ((pa.id_estudiante IN ( SELECT estudiantes.id_estudiante
           FROM public.estudiantes
          WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))) OR (pa.id_proyecto IN ( SELECT p.id_proyecto
           FROM (public.proyectos p
             JOIN public.empresarios emp ON ((emp.id_empresario = p.id_empresario)))
          WHERE (emp.id_usuario = ( SELECT auth.uid() AS uid))))))));


--
-- Name: configuracion_sistema config_select_authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY config_select_authenticated ON public.configuracion_sistema FOR SELECT TO authenticated USING (true);


--
-- Name: configuracion_sistema; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.configuracion_sistema ENABLE ROW LEVEL SECURITY;

--
-- Name: consentimientos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.consentimientos ENABLE ROW LEVEL SECURITY;

--
-- Name: consentimientos consentimientos_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY consentimientos_insert_own ON public.consentimientos FOR INSERT WITH CHECK ((id_usuario = ( SELECT auth.uid() AS uid)));


--
-- Name: consentimientos consentimientos_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY consentimientos_select_own ON public.consentimientos FOR SELECT USING ((id_usuario = ( SELECT auth.uid() AS uid)));


--
-- Name: contrataciones; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.contrataciones ENABLE ROW LEVEL SECURITY;

--
-- Name: contrataciones contrataciones_insert_empresario; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY contrataciones_insert_empresario ON public.contrataciones FOR INSERT WITH CHECK (((id_participacion IN ( SELECT pa.id_participacion
   FROM ((public.participaciones pa
     JOIN public.proyectos p ON ((p.id_proyecto = pa.id_proyecto)))
     JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid)))) AND public.current_user_is_verified()));


--
-- Name: contrataciones contrataciones_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY contrataciones_select ON public.contrataciones FOR SELECT USING ((id_participacion IN ( SELECT participaciones.id_participacion
   FROM public.participaciones
  WHERE ((participaciones.id_estudiante IN ( SELECT estudiantes.id_estudiante
           FROM public.estudiantes
          WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))) OR (participaciones.id_proyecto IN ( SELECT p.id_proyecto
           FROM (public.proyectos p
             JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
          WHERE (e.id_usuario = ( SELECT auth.uid() AS uid))))))));


--
-- Name: contrataciones contrataciones_update_empresario; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY contrataciones_update_empresario ON public.contrataciones FOR UPDATE USING (((id_participacion IN ( SELECT pa.id_participacion
   FROM ((public.participaciones pa
     JOIN public.proyectos p ON ((p.id_proyecto = pa.id_proyecto)))
     JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid)))) AND public.current_user_is_verified()));


--
-- Name: conversaciones_ia conv_ia_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY conv_ia_insert_own ON public.conversaciones_ia FOR INSERT WITH CHECK ((id_empresario IN ( SELECT empresarios.id_empresario
   FROM public.empresarios
  WHERE (empresarios.id_usuario = ( SELECT auth.uid() AS uid)))));


--
-- Name: conversaciones_ia conv_ia_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY conv_ia_select_own ON public.conversaciones_ia FOR SELECT USING ((id_empresario IN ( SELECT empresarios.id_empresario
   FROM public.empresarios
  WHERE (empresarios.id_usuario = ( SELECT auth.uid() AS uid)))));


--
-- Name: conversaciones_ia conv_ia_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY conv_ia_update_own ON public.conversaciones_ia FOR UPDATE USING ((id_empresario IN ( SELECT empresarios.id_empresario
   FROM public.empresarios
  WHERE (empresarios.id_usuario = ( SELECT auth.uid() AS uid)))));


--
-- Name: conversaciones_ia; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.conversaciones_ia ENABLE ROW LEVEL SECURITY;

--
-- Name: egresados_fwd_oficial; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.egresados_fwd_oficial ENABLE ROW LEVEL SECURITY;

--
-- Name: egresados_fwd_oficial egresados_fwd_oficial_all_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY egresados_fwd_oficial_all_admin ON public.egresados_fwd_oficial USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.id_usuario = auth.uid()) AND (usuarios.is_active = true) AND (EXISTS ( SELECT 1
           FROM public.roles
          WHERE ((roles.id_rol = usuarios.id_rol) AND ((roles.nombre_rol)::text = 'administrador'::text))))))));


--
-- Name: egresados_fwd_oficial egresados_fwd_oficial_select_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY egresados_fwd_oficial_select_admin ON public.egresados_fwd_oficial FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.id_usuario = auth.uid()) AND (usuarios.is_active = true) AND (EXISTS ( SELECT 1
           FROM public.roles
          WHERE ((roles.id_rol = usuarios.id_rol) AND ((roles.nombre_rol)::text = 'administrador'::text))))))));


--
-- Name: empresarios; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.empresarios ENABLE ROW LEVEL SECURITY;

--
-- Name: empresarios empresarios_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY empresarios_insert_own ON public.empresarios FOR INSERT WITH CHECK (((id_usuario = ( SELECT auth.uid() AS uid)) AND (estado_verificacion = 'pendiente'::public.estado_verif_enum)));


--
-- Name: empresarios empresarios_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY empresarios_select_own ON public.empresarios FOR SELECT USING ((id_usuario = ( SELECT auth.uid() AS uid)));


--
-- Name: empresarios empresarios_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY empresarios_update_own ON public.empresarios FOR UPDATE USING ((id_usuario = ( SELECT auth.uid() AS uid))) WITH CHECK ((id_usuario = ( SELECT auth.uid() AS uid)));


--
-- Name: entregables; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.entregables ENABLE ROW LEVEL SECURITY;

--
-- Name: entregables entregables_insert_estudiante; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY entregables_insert_estudiante ON public.entregables FOR INSERT WITH CHECK (((id_contratacion IN ( SELECT c.id_contratacion
   FROM (public.contrataciones c
     JOIN public.participaciones pa ON ((pa.id_participacion = c.id_participacion)))
  WHERE (pa.id_estudiante IN ( SELECT estudiantes.id_estudiante
           FROM public.estudiantes
          WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))))) AND public.current_user_is_verified()));


--
-- Name: entregables entregables_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY entregables_select ON public.entregables FOR SELECT USING ((id_contratacion IN ( SELECT c.id_contratacion
   FROM (public.contrataciones c
     JOIN public.participaciones pa ON ((pa.id_participacion = c.id_participacion)))
  WHERE ((pa.id_estudiante IN ( SELECT estudiantes.id_estudiante
           FROM public.estudiantes
          WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))) OR (pa.id_proyecto IN ( SELECT p.id_proyecto
           FROM (public.proyectos p
             JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
          WHERE (e.id_usuario = ( SELECT auth.uid() AS uid))))))));


--
-- Name: entregables entregables_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY entregables_update ON public.entregables FOR UPDATE TO authenticated USING (((((estado <> 'aprobado'::public.estado_entregable_enum) AND (id_contratacion IN ( SELECT c.id_contratacion
   FROM (public.contrataciones c
     JOIN public.participaciones pa ON ((pa.id_participacion = c.id_participacion)))
  WHERE (pa.id_estudiante IN ( SELECT estudiantes.id_estudiante
           FROM public.estudiantes
          WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid))))))) OR ((estado <> 'aprobado'::public.estado_entregable_enum) AND (id_contratacion IN ( SELECT c.id_contratacion
   FROM (((public.contrataciones c
     JOIN public.participaciones pa ON ((pa.id_participacion = c.id_participacion)))
     JOIN public.proyectos p ON ((p.id_proyecto = pa.id_proyecto)))
     JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid)))))) AND public.current_user_is_verified())) WITH CHECK (((((estado <> 'aprobado'::public.estado_entregable_enum) AND (id_contratacion IN ( SELECT c.id_contratacion
   FROM (public.contrataciones c
     JOIN public.participaciones pa ON ((pa.id_participacion = c.id_participacion)))
  WHERE (pa.id_estudiante IN ( SELECT estudiantes.id_estudiante
           FROM public.estudiantes
          WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid))))))) OR ((estado = ANY (ARRAY['en_revision'::public.estado_entregable_enum, 'aprobado'::public.estado_entregable_enum, 'con_cambios'::public.estado_entregable_enum])) AND (id_contratacion IN ( SELECT c.id_contratacion
   FROM (((public.contrataciones c
     JOIN public.participaciones pa ON ((pa.id_participacion = c.id_participacion)))
     JOIN public.proyectos p ON ((p.id_proyecto = pa.id_proyecto)))
     JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid)))))) AND public.current_user_is_verified()));


--
-- Name: habilidades_tecnicas est_hab_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY est_hab_delete_own ON public.habilidades_tecnicas FOR DELETE USING ((id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))));


--
-- Name: habilidades_tecnicas est_hab_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY est_hab_insert_own ON public.habilidades_tecnicas FOR INSERT WITH CHECK ((id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))));


--
-- Name: habilidades_tecnicas est_hab_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY est_hab_select ON public.habilidades_tecnicas FOR SELECT TO authenticated USING ((id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE ((estudiantes.id_usuario = ( SELECT auth.uid() AS uid)) OR (estudiantes.portafolio_visible_publicamente = true)))));


--
-- Name: habilidades_tecnicas est_hab_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY est_hab_update_own ON public.habilidades_tecnicas FOR UPDATE USING ((id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))));


--
-- Name: estudiantes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.estudiantes ENABLE ROW LEVEL SECURITY;

--
-- Name: estudiantes estudiantes_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY estudiantes_insert_own ON public.estudiantes FOR INSERT WITH CHECK (((id_usuario = ( SELECT auth.uid() AS uid)) AND (estado_verificacion = 'pendiente'::public.estado_verif_enum)));


--
-- Name: estudiantes estudiantes_select_own_or_public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY estudiantes_select_own_or_public ON public.estudiantes FOR SELECT TO authenticated USING (((id_usuario = ( SELECT auth.uid() AS uid)) OR (portafolio_visible_publicamente = true)));


--
-- Name: estudiantes estudiantes_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY estudiantes_update_own ON public.estudiantes FOR UPDATE USING ((id_usuario = ( SELECT auth.uid() AS uid))) WITH CHECK ((id_usuario = ( SELECT auth.uid() AS uid)));


--
-- Name: evaluaciones; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;

--
-- Name: evaluaciones_empresarios; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.evaluaciones_empresarios ENABLE ROW LEVEL SECURITY;

--
-- Name: evaluaciones_empresarios evaluaciones_empresarios_insert_estudiante; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY evaluaciones_empresarios_insert_estudiante ON public.evaluaciones_empresarios FOR INSERT TO authenticated WITH CHECK (((id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))) AND (EXISTS ( SELECT 1
   FROM (public.contrataciones c
     JOIN public.participaciones pa ON ((pa.id_participacion = c.id_participacion)))
  WHERE ((c.id_contratacion = evaluaciones_empresarios.id_contratacion) AND (pa.id_estudiante = evaluaciones_empresarios.id_estudiante) AND (c.estado_periodo = 'finalizado'::public.estado_periodo_enum)))) AND public.current_user_is_verified()));


--
-- Name: evaluaciones_empresarios evaluaciones_empresarios_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY evaluaciones_empresarios_select ON public.evaluaciones_empresarios FOR SELECT TO authenticated USING (true);


--
-- Name: evaluaciones evaluaciones_insert_empresario; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY evaluaciones_insert_empresario ON public.evaluaciones FOR INSERT WITH CHECK (((id_empresario IN ( SELECT empresarios.id_empresario
   FROM public.empresarios
  WHERE (empresarios.id_usuario = ( SELECT auth.uid() AS uid)))) AND (EXISTS ( SELECT 1
   FROM (((public.contrataciones c
     JOIN public.participaciones pa ON ((pa.id_participacion = c.id_participacion)))
     JOIN public.proyectos p ON ((p.id_proyecto = pa.id_proyecto)))
     JOIN public.empresarios emp ON ((emp.id_empresario = p.id_empresario)))
  WHERE ((c.id_contratacion = evaluaciones.id_contratacion) AND (pa.id_estudiante = evaluaciones.id_estudiante) AND (emp.id_usuario = ( SELECT auth.uid() AS uid)) AND (c.estado_periodo = 'finalizado'::public.estado_periodo_enum)))) AND public.current_user_is_verified()));


--
-- Name: evaluaciones evaluaciones_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY evaluaciones_select ON public.evaluaciones FOR SELECT USING (((id_empresario IN ( SELECT empresarios.id_empresario
   FROM public.empresarios
  WHERE (empresarios.id_usuario = ( SELECT auth.uid() AS uid)))) OR (id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid))))));


--
-- Name: evaluaciones evaluaciones_select_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY evaluaciones_select_admin ON public.evaluaciones FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.roles r ON ((u.id_rol = r.id_rol)))
  WHERE ((u.id_usuario = ( SELECT auth.uid() AS uid)) AND ((r.nombre_rol)::text = 'administrador'::text)))));


--
-- Name: evaluaciones evaluaciones_update_respuesta; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY evaluaciones_update_respuesta ON public.evaluaciones FOR UPDATE USING ((id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid))))) WITH CHECK ((id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))));


--
-- Name: habilidades_tecnicas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.habilidades_tecnicas ENABLE ROW LEVEL SECURITY;

--
-- Name: mensajes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;

--
-- Name: notificaciones; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

--
-- Name: notificaciones notificaciones_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notificaciones_select_own ON public.notificaciones FOR SELECT TO authenticated USING ((id_usuario = ( SELECT auth.uid() AS uid)));


--
-- Name: notificaciones notificaciones_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notificaciones_update_own ON public.notificaciones FOR UPDATE TO authenticated USING ((id_usuario = ( SELECT auth.uid() AS uid))) WITH CHECK ((id_usuario = ( SELECT auth.uid() AS uid)));


--
-- Name: participaciones; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.participaciones ENABLE ROW LEVEL SECURITY;

--
-- Name: participaciones participaciones_insert_egresado; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY participaciones_insert_egresado ON public.participaciones FOR INSERT TO authenticated WITH CHECK (((estado = 'enviada'::public.estado_participacion_enum) AND (id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE ((estudiantes.id_usuario = ( SELECT auth.uid() AS uid)) AND (estudiantes.estado_verificacion = 'verificado'::public.estado_verif_enum)))) AND (id_proyecto IN ( SELECT proyectos.id_proyecto
   FROM public.proyectos
  WHERE ((proyectos.estado = ANY (ARRAY['abierto'::public.estado_proyecto_enum, 'en_recepcion'::public.estado_proyecto_enum])) AND (proyectos.is_active = true) AND ((proyectos.fecha_cierre IS NULL) OR (proyectos.fecha_cierre > now())))))));


--
-- Name: participaciones participaciones_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY participaciones_select ON public.participaciones FOR SELECT TO authenticated USING (((id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))) OR (id_proyecto IN ( SELECT public.mis_proyectos_como_empresario() AS mis_proyectos_como_empresario))));


--
-- Name: participaciones participaciones_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY participaciones_update ON public.participaciones FOR UPDATE TO authenticated USING (((((id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))) AND (estado = ANY (ARRAY['enviada'::public.estado_participacion_enum, 'en_revision'::public.estado_participacion_enum]))) OR ((estado <> 'retirada'::public.estado_participacion_enum) AND (id_proyecto IN ( SELECT p.id_proyecto
   FROM (public.proyectos p
     JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid)))))) AND public.current_user_is_verified())) WITH CHECK (((((estado = 'retirada'::public.estado_participacion_enum) AND (id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid))))) OR ((estado <> 'retirada'::public.estado_participacion_enum) AND (id_proyecto IN ( SELECT p.id_proyecto
   FROM (public.proyectos p
     JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid)))))) AND public.current_user_is_verified()));


--
-- Name: proyectos_portafolio portafolio_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY portafolio_delete_own ON public.proyectos_portafolio FOR DELETE USING ((id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))));


--
-- Name: proyectos_portafolio portafolio_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY portafolio_insert_own ON public.proyectos_portafolio FOR INSERT WITH CHECK ((id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))));


--
-- Name: proyectos_portafolio portafolio_select_own_or_public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY portafolio_select_own_or_public ON public.proyectos_portafolio FOR SELECT TO authenticated USING (((id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))) OR ((is_active = true) AND ((origen <> 'plataforma_contratada'::public.origen_portafolio_enum) OR (estado_consentimiento = 'aprobado'::public.estado_consent_portafolio_enum)) AND (id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE (estudiantes.portafolio_visible_publicamente = true))))));


--
-- Name: portafolio_tecnologias portafolio_tec_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY portafolio_tec_delete_own ON public.portafolio_tecnologias FOR DELETE USING ((id_portafolio IN ( SELECT proyectos_portafolio.id_portafolio
   FROM public.proyectos_portafolio
  WHERE (proyectos_portafolio.id_estudiante IN ( SELECT estudiantes.id_estudiante
           FROM public.estudiantes
          WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))))));


--
-- Name: portafolio_tecnologias portafolio_tec_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY portafolio_tec_insert_own ON public.portafolio_tecnologias FOR INSERT WITH CHECK ((id_portafolio IN ( SELECT proyectos_portafolio.id_portafolio
   FROM public.proyectos_portafolio
  WHERE (proyectos_portafolio.id_estudiante IN ( SELECT estudiantes.id_estudiante
           FROM public.estudiantes
          WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))))));


--
-- Name: portafolio_tecnologias portafolio_tec_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY portafolio_tec_select ON public.portafolio_tecnologias FOR SELECT TO authenticated USING ((id_portafolio IN ( SELECT proyectos_portafolio.id_portafolio
   FROM public.proyectos_portafolio
  WHERE ((proyectos_portafolio.id_estudiante IN ( SELECT estudiantes.id_estudiante
           FROM public.estudiantes
          WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))) OR ((proyectos_portafolio.is_active = true) AND ((proyectos_portafolio.origen <> 'plataforma_contratada'::public.origen_portafolio_enum) OR (proyectos_portafolio.estado_consentimiento = 'aprobado'::public.estado_consent_portafolio_enum)) AND (proyectos_portafolio.id_estudiante IN ( SELECT estudiantes.id_estudiante
           FROM public.estudiantes
          WHERE (estudiantes.portafolio_visible_publicamente = true))))))));


--
-- Name: portafolio_tecnologias portafolio_tec_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY portafolio_tec_update_own ON public.portafolio_tecnologias FOR UPDATE USING ((id_portafolio IN ( SELECT proyectos_portafolio.id_portafolio
   FROM public.proyectos_portafolio
  WHERE (proyectos_portafolio.id_estudiante IN ( SELECT estudiantes.id_estudiante
           FROM public.estudiantes
          WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))))));


--
-- Name: portafolio_tecnologias; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.portafolio_tecnologias ENABLE ROW LEVEL SECURITY;

--
-- Name: proyectos_portafolio portafolio_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY portafolio_update_own ON public.proyectos_portafolio FOR UPDATE USING ((id_estudiante IN ( SELECT estudiantes.id_estudiante
   FROM public.estudiantes
  WHERE (estudiantes.id_usuario = ( SELECT auth.uid() AS uid)))));


--
-- Name: proyecto_categorias proy_cat_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY proy_cat_delete_own ON public.proyecto_categorias FOR DELETE USING ((id_proyecto IN ( SELECT p.id_proyecto
   FROM (public.proyectos p
     JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid)))));


--
-- Name: proyecto_categorias proy_cat_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY proy_cat_insert_own ON public.proyecto_categorias FOR INSERT WITH CHECK ((id_proyecto IN ( SELECT p.id_proyecto
   FROM (public.proyectos p
     JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid)))));


--
-- Name: proyecto_categorias proy_cat_select_auth; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY proy_cat_select_auth ON public.proyecto_categorias FOR SELECT TO authenticated USING (((id_proyecto IN ( SELECT proyectos.id_proyecto
   FROM public.proyectos
  WHERE ((proyectos.is_active = true) AND (proyectos.estado = ANY (ARRAY['abierto'::public.estado_proyecto_enum, 'en_recepcion'::public.estado_proyecto_enum]))))) OR (id_proyecto IN ( SELECT p.id_proyecto
   FROM (public.proyectos p
     JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid)))) OR (id_proyecto IN ( SELECT pa.id_proyecto
   FROM (public.participaciones pa
     JOIN public.estudiantes e ON ((e.id_estudiante = pa.id_estudiante)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid))))));


--
-- Name: proyecto_categorias proy_cat_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY proy_cat_update_own ON public.proyecto_categorias FOR UPDATE USING ((id_proyecto IN ( SELECT p.id_proyecto
   FROM (public.proyectos p
     JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid)))));


--
-- Name: proyecto_tecnologias proy_tec_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY proy_tec_delete_own ON public.proyecto_tecnologias FOR DELETE USING ((id_proyecto IN ( SELECT p.id_proyecto
   FROM (public.proyectos p
     JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid)))));


--
-- Name: proyecto_tecnologias proy_tec_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY proy_tec_insert_own ON public.proyecto_tecnologias FOR INSERT WITH CHECK ((id_proyecto IN ( SELECT p.id_proyecto
   FROM (public.proyectos p
     JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid)))));


--
-- Name: proyecto_tecnologias proy_tec_select_auth; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY proy_tec_select_auth ON public.proyecto_tecnologias FOR SELECT TO authenticated USING (((id_proyecto IN ( SELECT proyectos.id_proyecto
   FROM public.proyectos
  WHERE ((proyectos.is_active = true) AND (proyectos.estado = ANY (ARRAY['abierto'::public.estado_proyecto_enum, 'en_recepcion'::public.estado_proyecto_enum]))))) OR (id_proyecto IN ( SELECT p.id_proyecto
   FROM (public.proyectos p
     JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid)))) OR (id_proyecto IN ( SELECT pa.id_proyecto
   FROM (public.participaciones pa
     JOIN public.estudiantes e ON ((e.id_estudiante = pa.id_estudiante)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid))))));


--
-- Name: proyecto_categorias; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.proyecto_categorias ENABLE ROW LEVEL SECURITY;

--
-- Name: proyecto_tecnologias; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.proyecto_tecnologias ENABLE ROW LEVEL SECURITY;

--
-- Name: proyectos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;

--
-- Name: proyectos proyectos_insert_verified_empresario; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY proyectos_insert_verified_empresario ON public.proyectos FOR INSERT WITH CHECK ((id_empresario IN ( SELECT empresarios.id_empresario
   FROM public.empresarios
  WHERE ((empresarios.id_usuario = ( SELECT auth.uid() AS uid)) AND (empresarios.estado_verificacion = 'verificado'::public.estado_verif_enum)))));


--
-- Name: proyectos_portafolio; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.proyectos_portafolio ENABLE ROW LEVEL SECURITY;

--
-- Name: proyectos proyectos_select_auth; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY proyectos_select_auth ON public.proyectos FOR SELECT TO authenticated USING ((((is_active = true) AND (estado = ANY (ARRAY['abierto'::public.estado_proyecto_enum, 'en_recepcion'::public.estado_proyecto_enum]))) OR (id_empresario IN ( SELECT empresarios.id_empresario
   FROM public.empresarios
  WHERE (empresarios.id_usuario = ( SELECT auth.uid() AS uid)))) OR (id_proyecto IN ( SELECT public.mis_proyectos_como_estudiante() AS mis_proyectos_como_estudiante))));


--
-- Name: proyectos proyectos_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY proyectos_update_own ON public.proyectos FOR UPDATE USING (((id_empresario IN ( SELECT empresarios.id_empresario
   FROM public.empresarios
  WHERE (empresarios.id_usuario = ( SELECT auth.uid() AS uid)))) AND public.current_user_is_verified())) WITH CHECK (((id_empresario IN ( SELECT empresarios.id_empresario
   FROM public.empresarios
  WHERE (empresarios.id_usuario = ( SELECT auth.uid() AS uid)))) AND public.current_user_is_verified()));


--
-- Name: reportes_moderacion reportes_insert_auth; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY reportes_insert_auth ON public.reportes_moderacion FOR INSERT WITH CHECK ((id_reportante = ( SELECT auth.uid() AS uid)));


--
-- Name: reportes_moderacion; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.reportes_moderacion ENABLE ROW LEVEL SECURITY;

--
-- Name: reportes_moderacion reportes_select_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY reportes_select_admin ON public.reportes_moderacion FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.roles r ON ((u.id_rol = r.id_rol)))
  WHERE ((u.id_usuario = ( SELECT auth.uid() AS uid)) AND ((r.nombre_rol)::text = 'administrador'::text)))));


--
-- Name: reportes_moderacion reportes_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY reportes_select_own ON public.reportes_moderacion FOR SELECT USING ((id_reportante = ( SELECT auth.uid() AS uid)));


--
-- Name: reportes_moderacion reportes_update_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY reportes_update_admin ON public.reportes_moderacion FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.roles r ON ((u.id_rol = r.id_rol)))
  WHERE ((u.id_usuario = ( SELECT auth.uid() AS uid)) AND ((r.nombre_rol)::text = 'administrador'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.roles r ON ((u.id_rol = r.id_rol)))
  WHERE ((u.id_usuario = ( SELECT auth.uid() AS uid)) AND ((r.nombre_rol)::text = 'administrador'::text)))));


--
-- Name: roles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

--
-- Name: roles roles_select_public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY roles_select_public ON public.roles FOR SELECT USING (true);


--
-- Name: soporte_tickets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.soporte_tickets ENABLE ROW LEVEL SECURITY;

--
-- Name: soporte_tickets soporte_tickets_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY soporte_tickets_insert_own ON public.soporte_tickets FOR INSERT TO authenticated WITH CHECK ((id_usuario = ( SELECT auth.uid() AS uid)));


--
-- Name: soporte_tickets soporte_tickets_select_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY soporte_tickets_select_admin ON public.soporte_tickets FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.roles r ON ((u.id_rol = r.id_rol)))
  WHERE ((u.id_usuario = ( SELECT auth.uid() AS uid)) AND ((r.nombre_rol)::text = 'administrador'::text)))));


--
-- Name: soporte_tickets soporte_tickets_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY soporte_tickets_select_own ON public.soporte_tickets FOR SELECT TO authenticated USING ((id_usuario = ( SELECT auth.uid() AS uid)));


--
-- Name: strikes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.strikes ENABLE ROW LEVEL SECURITY;

--
-- Name: strikes strikes_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY strikes_select_own ON public.strikes FOR SELECT USING ((id_usuario = ( SELECT auth.uid() AS uid)));


--
-- Name: tecnologias; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tecnologias ENABLE ROW LEVEL SECURITY;

--
-- Name: tecnologias tecnologias_select_active; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tecnologias_select_active ON public.tecnologias FOR SELECT USING ((is_active = true));


--
-- Name: usuarios; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

--
-- Name: usuarios usuarios_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY usuarios_select_own ON public.usuarios FOR SELECT USING ((( SELECT auth.uid() AS uid) = id_usuario));


--
-- Name: usuarios usuarios_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY usuarios_update_own ON public.usuarios FOR UPDATE USING ((( SELECT auth.uid() AS uid) = id_usuario)) WITH CHECK ((( SELECT auth.uid() AS uid) = id_usuario));


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: objects documentacion_tecnica_delete_estudiante; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY documentacion_tecnica_delete_estudiante ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'documentacion_tecnica'::text) AND ((storage.foldername(name))[2] = (( SELECT auth.uid() AS uid))::text) AND (NOT (EXISTS ( SELECT 1
   FROM (public.participaciones pa
     JOIN public.estudiantes est ON ((est.id_estudiante = pa.id_estudiante)))
  WHERE (((pa.id_proyecto)::text = (storage.foldername(objects.name))[1]) AND ((est.id_usuario)::text = (storage.foldername(objects.name))[2])))))));


--
-- Name: objects documentacion_tecnica_insert_estudiante; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY documentacion_tecnica_insert_estudiante ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'documentacion_tecnica'::text) AND ((storage.foldername(name))[2] = (( SELECT auth.uid() AS uid))::text) AND (EXISTS ( SELECT 1
   FROM public.estudiantes e
  WHERE ((e.id_usuario = ( SELECT auth.uid() AS uid)) AND (e.estado_verificacion = 'verificado'::public.estado_verif_enum))))));


--
-- Name: objects documentacion_tecnica_select_empresario; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY documentacion_tecnica_select_empresario ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'documentacion_tecnica'::text) AND ((storage.foldername(name))[1] IN ( SELECT (p.id_proyecto)::text AS id_proyecto
   FROM (public.proyectos p
     JOIN public.empresarios emp ON ((emp.id_empresario = p.id_empresario)))
  WHERE (emp.id_usuario = ( SELECT auth.uid() AS uid)))) AND (EXISTS ( SELECT 1
   FROM (public.participaciones pa
     JOIN public.estudiantes est ON ((est.id_estudiante = pa.id_estudiante)))
  WHERE (((pa.id_proyecto)::text = (storage.foldername(objects.name))[1]) AND ((est.id_usuario)::text = (storage.foldername(objects.name))[2]))))));


--
-- Name: objects documentacion_tecnica_select_estudiante; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY documentacion_tecnica_select_estudiante ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'documentacion_tecnica'::text) AND ((storage.foldername(name))[2] = (( SELECT auth.uid() AS uid))::text)));


--
-- Name: objects documentacion_tecnica_update_estudiante; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY documentacion_tecnica_update_estudiante ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'documentacion_tecnica'::text) AND ((storage.foldername(name))[2] = (( SELECT auth.uid() AS uid))::text) AND (NOT (EXISTS ( SELECT 1
   FROM (public.participaciones pa
     JOIN public.estudiantes est ON ((est.id_estudiante = pa.id_estudiante)))
  WHERE (((pa.id_proyecto)::text = (storage.foldername(objects.name))[1]) AND ((est.id_usuario)::text = (storage.foldername(objects.name))[2]))))))) WITH CHECK (((bucket_id = 'documentacion_tecnica'::text) AND ((storage.foldername(name))[2] = (( SELECT auth.uid() AS uid))::text)));


--
-- Name: objects entregables_insert_estudiante; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY entregables_insert_estudiante ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'entregables'::text) AND ((storage.foldername(name))[1] IN ( SELECT (c.id_contratacion)::text AS id_contratacion
   FROM ((public.contrataciones c
     JOIN public.participaciones pa ON ((pa.id_participacion = c.id_participacion)))
     JOIN public.estudiantes e ON ((e.id_estudiante = pa.id_estudiante)))
  WHERE ((e.id_usuario = ( SELECT auth.uid() AS uid)) AND (e.estado_verificacion = 'verificado'::public.estado_verif_enum))))));


--
-- Name: objects entregables_select_partes; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY entregables_select_partes ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'entregables'::text) AND (((storage.foldername(name))[1] IN ( SELECT (c.id_contratacion)::text AS id_contratacion
   FROM ((public.contrataciones c
     JOIN public.participaciones pa ON ((pa.id_participacion = c.id_participacion)))
     JOIN public.estudiantes e ON ((e.id_estudiante = pa.id_estudiante)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid)))) OR ((storage.foldername(name))[1] IN ( SELECT (c.id_contratacion)::text AS id_contratacion
   FROM (((public.contrataciones c
     JOIN public.participaciones pa ON ((pa.id_participacion = c.id_participacion)))
     JOIN public.proyectos p ON ((p.id_proyecto = pa.id_proyecto)))
     JOIN public.empresarios e ON ((e.id_empresario = p.id_empresario)))
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid)))))));


--
-- Name: objects fotos_perfil_delete_own; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY fotos_perfil_delete_own ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'fotos-perfil'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));


--
-- Name: objects fotos_perfil_insert_own; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY fotos_perfil_insert_own ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'fotos-perfil'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));


--
-- Name: objects fotos_perfil_select_own; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY fotos_perfil_select_own ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'fotos-perfil'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));


--
-- Name: objects fotos_perfil_update_own; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY fotos_perfil_update_own ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'fotos-perfil'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text))) WITH CHECK (((bucket_id = 'fotos-perfil'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));


--
-- Name: objects logos_delete_own_empresario; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY logos_delete_own_empresario ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'logos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));


--
-- Name: objects logos_insert_own_empresario; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY logos_insert_own_empresario ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'logos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text) AND (EXISTS ( SELECT 1
   FROM public.empresarios e
  WHERE (e.id_usuario = ( SELECT auth.uid() AS uid))))));


--
-- Name: objects logos_select_own; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY logos_select_own ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'logos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));


--
-- Name: objects logos_update_own_empresario; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY logos_update_own_empresario ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'logos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text))) WITH CHECK (((bucket_id = 'logos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));


--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: objects prototipos_postulacion_delete_estudiante; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY prototipos_postulacion_delete_estudiante ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'prototipos_postulacion'::text) AND ((storage.foldername(name))[2] = (( SELECT auth.uid() AS uid))::text) AND (NOT (EXISTS ( SELECT 1
   FROM (public.participaciones pa
     JOIN public.estudiantes est ON ((est.id_estudiante = pa.id_estudiante)))
  WHERE (((pa.id_proyecto)::text = (storage.foldername(objects.name))[1]) AND ((est.id_usuario)::text = (storage.foldername(objects.name))[2])))))));


--
-- Name: objects prototipos_postulacion_insert_estudiante; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY prototipos_postulacion_insert_estudiante ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'prototipos_postulacion'::text) AND ((storage.foldername(name))[2] = (( SELECT auth.uid() AS uid))::text) AND (EXISTS ( SELECT 1
   FROM public.estudiantes e
  WHERE ((e.id_usuario = ( SELECT auth.uid() AS uid)) AND (e.estado_verificacion = 'verificado'::public.estado_verif_enum))))));


--
-- Name: objects prototipos_postulacion_select_empresario; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY prototipos_postulacion_select_empresario ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'prototipos_postulacion'::text) AND ((storage.foldername(name))[1] IN ( SELECT (p.id_proyecto)::text AS id_proyecto
   FROM (public.proyectos p
     JOIN public.empresarios emp ON ((emp.id_empresario = p.id_empresario)))
  WHERE (emp.id_usuario = ( SELECT auth.uid() AS uid)))) AND (EXISTS ( SELECT 1
   FROM (public.participaciones pa
     JOIN public.estudiantes est ON ((est.id_estudiante = pa.id_estudiante)))
  WHERE (((pa.id_proyecto)::text = (storage.foldername(objects.name))[1]) AND ((est.id_usuario)::text = (storage.foldername(objects.name))[2]))))));


--
-- Name: objects prototipos_postulacion_select_estudiante; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY prototipos_postulacion_select_estudiante ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'prototipos_postulacion'::text) AND ((storage.foldername(name))[2] = (( SELECT auth.uid() AS uid))::text)));


--
-- Name: objects prototipos_postulacion_update_estudiante; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY prototipos_postulacion_update_estudiante ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'prototipos_postulacion'::text) AND ((storage.foldername(name))[2] = (( SELECT auth.uid() AS uid))::text) AND (NOT (EXISTS ( SELECT 1
   FROM (public.participaciones pa
     JOIN public.estudiantes est ON ((est.id_estudiante = pa.id_estudiante)))
  WHERE (((pa.id_proyecto)::text = (storage.foldername(objects.name))[1]) AND ((est.id_usuario)::text = (storage.foldername(objects.name))[2]))))))) WITH CHECK (((bucket_id = 'prototipos_postulacion'::text) AND ((storage.foldername(name))[2] = (( SELECT auth.uid() AS uid))::text)));


--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA cron; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA cron TO postgres WITH GRANT OPTION;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION alter_job(job_id bigint, schedule text, command text, database text, username text, active boolean); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.alter_job(job_id bigint, schedule text, command text, database text, username text, active boolean) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION job_cache_invalidate(); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.job_cache_invalidate() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION schedule(schedule text, command text); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.schedule(schedule text, command text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION schedule(job_name text, schedule text, command text); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.schedule(job_name text, schedule text, command text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION schedule_in_database(job_name text, schedule text, command text, database text, username text, active boolean); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.schedule_in_database(job_name text, schedule text, command text, database text, username text, active boolean) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION unschedule(job_id bigint); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.unschedule(job_id bigint) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION unschedule(job_name text); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.unschedule(job_name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: FUNCTION activar_cuenta_al_confirmar_correo(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.activar_cuenta_al_confirmar_correo() TO anon;
GRANT ALL ON FUNCTION public.activar_cuenta_al_confirmar_correo() TO authenticated;
GRANT ALL ON FUNCTION public.activar_cuenta_al_confirmar_correo() TO service_role;


--
-- Name: FUNCTION actualizar_strikes(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.actualizar_strikes() FROM PUBLIC;
GRANT ALL ON FUNCTION public.actualizar_strikes() TO service_role;


--
-- Name: FUNCTION actualizar_url_participacion(p_id_participacion uuid, p_url text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.actualizar_url_participacion(p_id_participacion uuid, p_url text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.actualizar_url_participacion(p_id_participacion uuid, p_url text) TO anon;
GRANT ALL ON FUNCTION public.actualizar_url_participacion(p_id_participacion uuid, p_url text) TO authenticated;
GRANT ALL ON FUNCTION public.actualizar_url_participacion(p_id_participacion uuid, p_url text) TO service_role;


--
-- Name: FUNCTION adjudicar_participacion(p_id_participacion uuid, p_id_proyecto uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.adjudicar_participacion(p_id_participacion uuid, p_id_proyecto uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.adjudicar_participacion(p_id_participacion uuid, p_id_proyecto uuid) TO authenticated;
GRANT ALL ON FUNCTION public.adjudicar_participacion(p_id_participacion uuid, p_id_proyecto uuid) TO service_role;


--
-- Name: FUNCTION assign_my_role(p_role text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.assign_my_role(p_role text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.assign_my_role(p_role text) TO service_role;


--
-- Name: FUNCTION auto_set_estado_entregable_final(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.auto_set_estado_entregable_final() TO anon;
GRANT ALL ON FUNCTION public.auto_set_estado_entregable_final() TO authenticated;
GRANT ALL ON FUNCTION public.auto_set_estado_entregable_final() TO service_role;


--
-- Name: FUNCTION check_mensaje_rate_limit(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_mensaje_rate_limit() TO anon;
GRANT ALL ON FUNCTION public.check_mensaje_rate_limit() TO authenticated;
GRANT ALL ON FUNCTION public.check_mensaje_rate_limit() TO service_role;


--
-- Name: FUNCTION crear_contratacion_al_adjudicar(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.crear_contratacion_al_adjudicar() FROM PUBLIC;
GRANT ALL ON FUNCTION public.crear_contratacion_al_adjudicar() TO service_role;


--
-- Name: FUNCTION current_user_is_verified(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.current_user_is_verified() FROM PUBLIC;
GRANT ALL ON FUNCTION public.current_user_is_verified() TO anon;
GRANT ALL ON FUNCTION public.current_user_is_verified() TO authenticated;
GRANT ALL ON FUNCTION public.current_user_is_verified() TO service_role;


--
-- Name: FUNCTION emitir_avisos_plazo_vence(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.emitir_avisos_plazo_vence() FROM PUBLIC;
GRANT ALL ON FUNCTION public.emitir_avisos_plazo_vence() TO service_role;


--
-- Name: FUNCTION finalizar_proyecto_por_entregable(p_id_entregable uuid, p_comentario text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.finalizar_proyecto_por_entregable(p_id_entregable uuid, p_comentario text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.finalizar_proyecto_por_entregable(p_id_entregable uuid, p_comentario text) TO authenticated;
GRANT ALL ON FUNCTION public.finalizar_proyecto_por_entregable(p_id_entregable uuid, p_comentario text) TO service_role;


--
-- Name: FUNCTION get_my_account_status(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.get_my_account_status() FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_my_account_status() TO authenticated;
GRANT ALL ON FUNCTION public.get_my_account_status() TO service_role;


--
-- Name: FUNCTION get_my_role(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.get_my_role() FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_my_role() TO authenticated;
GRANT ALL ON FUNCTION public.get_my_role() TO service_role;


--
-- Name: FUNCTION get_participaciones_de_proyecto(p_id_proyecto uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.get_participaciones_de_proyecto(p_id_proyecto uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_participaciones_de_proyecto(p_id_proyecto uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_participaciones_de_proyecto(p_id_proyecto uuid) TO service_role;


--
-- Name: FUNCTION guard_empresarios_protected_cols(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.guard_empresarios_protected_cols() FROM PUBLIC;
GRANT ALL ON FUNCTION public.guard_empresarios_protected_cols() TO service_role;


--
-- Name: FUNCTION guard_estudiantes_protected_cols(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.guard_estudiantes_protected_cols() FROM PUBLIC;
GRANT ALL ON FUNCTION public.guard_estudiantes_protected_cols() TO service_role;


--
-- Name: FUNCTION guard_participaciones_estudiante_cols(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.guard_participaciones_estudiante_cols() FROM PUBLIC;
GRANT ALL ON FUNCTION public.guard_participaciones_estudiante_cols() TO service_role;


--
-- Name: FUNCTION guard_usuarios_protected_cols(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.guard_usuarios_protected_cols() FROM PUBLIC;
GRANT ALL ON FUNCTION public.guard_usuarios_protected_cols() TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION limpiar_huerfanos_oauth(p_dry_run boolean); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.limpiar_huerfanos_oauth(p_dry_run boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION public.limpiar_huerfanos_oauth(p_dry_run boolean) TO service_role;


--
-- Name: FUNCTION mis_proyectos_como_empresario(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.mis_proyectos_como_empresario() FROM PUBLIC;
GRANT ALL ON FUNCTION public.mis_proyectos_como_empresario() TO authenticated;
GRANT ALL ON FUNCTION public.mis_proyectos_como_empresario() TO service_role;


--
-- Name: FUNCTION mis_proyectos_como_estudiante(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.mis_proyectos_como_estudiante() FROM PUBLIC;
GRANT ALL ON FUNCTION public.mis_proyectos_como_estudiante() TO authenticated;
GRANT ALL ON FUNCTION public.mis_proyectos_como_estudiante() TO service_role;


--
-- Name: FUNCTION publicar_proyecto(p_conversacion uuid, p_titulo character varying, p_descripcion text, p_id_area uuid, p_modalidad public.modalidad_enum, p_pais_iso character varying, p_region character varying, p_moneda public.moneda_enum, p_presupuesto_min numeric, p_presupuesto_max numeric, p_plazo_dias integer, p_categorias uuid[], p_tecnologias uuid[], p_propuesta jsonb, p_involucra_ia boolean, p_generado_por_ia boolean); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.publicar_proyecto(p_conversacion uuid, p_titulo character varying, p_descripcion text, p_id_area uuid, p_modalidad public.modalidad_enum, p_pais_iso character varying, p_region character varying, p_moneda public.moneda_enum, p_presupuesto_min numeric, p_presupuesto_max numeric, p_plazo_dias integer, p_categorias uuid[], p_tecnologias uuid[], p_propuesta jsonb, p_involucra_ia boolean, p_generado_por_ia boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION public.publicar_proyecto(p_conversacion uuid, p_titulo character varying, p_descripcion text, p_id_area uuid, p_modalidad public.modalidad_enum, p_pais_iso character varying, p_region character varying, p_moneda public.moneda_enum, p_presupuesto_min numeric, p_presupuesto_max numeric, p_plazo_dias integer, p_categorias uuid[], p_tecnologias uuid[], p_propuesta jsonb, p_involucra_ia boolean, p_generado_por_ia boolean) TO authenticated;
GRANT ALL ON FUNCTION public.publicar_proyecto(p_conversacion uuid, p_titulo character varying, p_descripcion text, p_id_area uuid, p_modalidad public.modalidad_enum, p_pais_iso character varying, p_region character varying, p_moneda public.moneda_enum, p_presupuesto_min numeric, p_presupuesto_max numeric, p_plazo_dias integer, p_categorias uuid[], p_tecnologias uuid[], p_propuesta jsonb, p_involucra_ia boolean, p_generado_por_ia boolean) TO service_role;


--
-- Name: FUNCTION recalcular_reputacion(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.recalcular_reputacion() FROM PUBLIC;
GRANT ALL ON FUNCTION public.recalcular_reputacion() TO service_role;


--
-- Name: FUNCTION recalcular_reputacion_empresario(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.recalcular_reputacion_empresario() FROM PUBLIC;
GRANT ALL ON FUNCTION public.recalcular_reputacion_empresario() TO service_role;


--
-- Name: FUNCTION recalcular_reputacion_estudiante(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.recalcular_reputacion_estudiante() FROM PUBLIC;
GRANT ALL ON FUNCTION public.recalcular_reputacion_estudiante() TO service_role;


--
-- Name: FUNCTION register_failed_login(p_email text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.register_failed_login(p_email text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.register_failed_login(p_email text) TO service_role;


--
-- Name: FUNCTION rls_auto_enable(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO service_role;


--
-- Name: FUNCTION set_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
GRANT ALL ON FUNCTION public.set_updated_at() TO service_role;


--
-- Name: FUNCTION sync_contadores_estudiante(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.sync_contadores_estudiante() FROM PUBLIC;
GRANT ALL ON FUNCTION public.sync_contadores_estudiante() TO service_role;


--
-- Name: FUNCTION sync_postulaciones_pendientes(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.sync_postulaciones_pendientes() FROM PUBLIC;
GRANT ALL ON FUNCTION public.sync_postulaciones_pendientes() TO service_role;


--
-- Name: FUNCTION validar_cupo_participaciones(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.validar_cupo_participaciones() FROM PUBLIC;
GRANT ALL ON FUNCTION public.validar_cupo_participaciones() TO service_role;


--
-- Name: FUNCTION validar_estado_proyecto_para_entregable(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.validar_estado_proyecto_para_entregable() FROM PUBLIC;
GRANT ALL ON FUNCTION public.validar_estado_proyecto_para_entregable() TO service_role;


--
-- Name: FUNCTION validar_nivel_admin(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.validar_nivel_admin() FROM PUBLIC;
GRANT ALL ON FUNCTION public.validar_nivel_admin() TO service_role;


--
-- Name: FUNCTION validar_transicion_participacion(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.validar_transicion_participacion() FROM PUBLIC;
GRANT ALL ON FUNCTION public.validar_transicion_participacion() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO dashboard_user;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION send_binary(payload bytea, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION wal2json_escape_identifier(name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO postgres;
GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE custom_oauth_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.custom_oauth_providers TO postgres;
GRANT ALL ON TABLE auth.custom_oauth_providers TO dashboard_user;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE webauthn_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_challenges TO postgres;
GRANT ALL ON TABLE auth.webauthn_challenges TO dashboard_user;


--
-- Name: TABLE webauthn_credentials; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_credentials TO postgres;
GRANT ALL ON TABLE auth.webauthn_credentials TO dashboard_user;


--
-- Name: TABLE job; Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT SELECT ON TABLE cron.job TO postgres WITH GRANT OPTION;


--
-- Name: TABLE job_run_details; Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON TABLE cron.job_run_details TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE areas_negocio; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.areas_negocio TO anon;
GRANT ALL ON TABLE public.areas_negocio TO authenticated;
GRANT ALL ON TABLE public.areas_negocio TO service_role;


--
-- Name: TABLE auditoria; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.auditoria TO anon;
GRANT ALL ON TABLE public.auditoria TO authenticated;
GRANT ALL ON TABLE public.auditoria TO service_role;


--
-- Name: TABLE categorias; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.categorias TO anon;
GRANT ALL ON TABLE public.categorias TO authenticated;
GRANT ALL ON TABLE public.categorias TO service_role;


--
-- Name: TABLE comentarios_entregables; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.comentarios_entregables TO anon;
GRANT ALL ON TABLE public.comentarios_entregables TO authenticated;
GRANT ALL ON TABLE public.comentarios_entregables TO service_role;


--
-- Name: TABLE configuracion_sistema; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.configuracion_sistema TO anon;
GRANT ALL ON TABLE public.configuracion_sistema TO authenticated;
GRANT ALL ON TABLE public.configuracion_sistema TO service_role;


--
-- Name: TABLE consentimientos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.consentimientos TO anon;
GRANT ALL ON TABLE public.consentimientos TO authenticated;
GRANT ALL ON TABLE public.consentimientos TO service_role;


--
-- Name: TABLE contrataciones; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.contrataciones TO anon;
GRANT ALL ON TABLE public.contrataciones TO authenticated;
GRANT ALL ON TABLE public.contrataciones TO service_role;


--
-- Name: TABLE conversaciones_ia; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.conversaciones_ia TO anon;
GRANT ALL ON TABLE public.conversaciones_ia TO authenticated;
GRANT ALL ON TABLE public.conversaciones_ia TO service_role;


--
-- Name: TABLE egresados_fwd_oficial; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.egresados_fwd_oficial TO anon;
GRANT ALL ON TABLE public.egresados_fwd_oficial TO authenticated;
GRANT ALL ON TABLE public.egresados_fwd_oficial TO service_role;


--
-- Name: TABLE empresarios; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.empresarios TO anon;
GRANT ALL ON TABLE public.empresarios TO authenticated;
GRANT ALL ON TABLE public.empresarios TO service_role;


--
-- Name: TABLE proyectos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.proyectos TO anon;
GRANT ALL ON TABLE public.proyectos TO authenticated;
GRANT ALL ON TABLE public.proyectos TO service_role;


--
-- Name: TABLE empresarios_public; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.empresarios_public TO authenticated;
GRANT ALL ON TABLE public.empresarios_public TO service_role;


--
-- Name: TABLE entregables; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.entregables TO anon;
GRANT ALL ON TABLE public.entregables TO authenticated;
GRANT ALL ON TABLE public.entregables TO service_role;


--
-- Name: TABLE estudiantes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.estudiantes TO anon;
GRANT ALL ON TABLE public.estudiantes TO authenticated;
GRANT ALL ON TABLE public.estudiantes TO service_role;


--
-- Name: TABLE evaluaciones; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.evaluaciones TO anon;
GRANT ALL ON TABLE public.evaluaciones TO authenticated;
GRANT ALL ON TABLE public.evaluaciones TO service_role;


--
-- Name: TABLE evaluaciones_empresarios; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.evaluaciones_empresarios TO anon;
GRANT ALL ON TABLE public.evaluaciones_empresarios TO authenticated;
GRANT ALL ON TABLE public.evaluaciones_empresarios TO service_role;


--
-- Name: TABLE habilidades_tecnicas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.habilidades_tecnicas TO anon;
GRANT ALL ON TABLE public.habilidades_tecnicas TO authenticated;
GRANT ALL ON TABLE public.habilidades_tecnicas TO service_role;


--
-- Name: TABLE mensajes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.mensajes TO anon;
GRANT ALL ON TABLE public.mensajes TO authenticated;
GRANT ALL ON TABLE public.mensajes TO service_role;


--
-- Name: TABLE notificaciones; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notificaciones TO anon;
GRANT ALL ON TABLE public.notificaciones TO authenticated;
GRANT ALL ON TABLE public.notificaciones TO service_role;


--
-- Name: TABLE participaciones; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.participaciones TO anon;
GRANT ALL ON TABLE public.participaciones TO authenticated;
GRANT ALL ON TABLE public.participaciones TO service_role;


--
-- Name: TABLE portafolio_tecnologias; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.portafolio_tecnologias TO anon;
GRANT ALL ON TABLE public.portafolio_tecnologias TO authenticated;
GRANT ALL ON TABLE public.portafolio_tecnologias TO service_role;


--
-- Name: TABLE proyecto_categorias; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.proyecto_categorias TO anon;
GRANT ALL ON TABLE public.proyecto_categorias TO authenticated;
GRANT ALL ON TABLE public.proyecto_categorias TO service_role;


--
-- Name: TABLE proyecto_tecnologias; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.proyecto_tecnologias TO anon;
GRANT ALL ON TABLE public.proyecto_tecnologias TO authenticated;
GRANT ALL ON TABLE public.proyecto_tecnologias TO service_role;


--
-- Name: TABLE proyectos_portafolio; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.proyectos_portafolio TO anon;
GRANT ALL ON TABLE public.proyectos_portafolio TO authenticated;
GRANT ALL ON TABLE public.proyectos_portafolio TO service_role;


--
-- Name: TABLE reportes_moderacion; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.reportes_moderacion TO anon;
GRANT ALL ON TABLE public.reportes_moderacion TO authenticated;
GRANT ALL ON TABLE public.reportes_moderacion TO service_role;


--
-- Name: TABLE roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.roles TO anon;
GRANT ALL ON TABLE public.roles TO authenticated;
GRANT ALL ON TABLE public.roles TO service_role;


--
-- Name: SEQUENCE roles_id_rol_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.roles_id_rol_seq TO anon;
GRANT ALL ON SEQUENCE public.roles_id_rol_seq TO authenticated;
GRANT ALL ON SEQUENCE public.roles_id_rol_seq TO service_role;


--
-- Name: TABLE soporte_tickets; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.soporte_tickets TO anon;
GRANT ALL ON TABLE public.soporte_tickets TO authenticated;
GRANT ALL ON TABLE public.soporte_tickets TO service_role;


--
-- Name: TABLE strikes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.strikes TO anon;
GRANT ALL ON TABLE public.strikes TO authenticated;
GRANT ALL ON TABLE public.strikes TO service_role;


--
-- Name: TABLE tecnologias; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tecnologias TO anon;
GRANT ALL ON TABLE public.tecnologias TO authenticated;
GRANT ALL ON TABLE public.tecnologias TO service_role;


--
-- Name: TABLE usuarios; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.usuarios TO anon;
GRANT ALL ON TABLE public.usuarios TO authenticated;
GRANT ALL ON TABLE public.usuarios TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: cron; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA cron GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: cron; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA cron GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: cron; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA cron GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: ensure_rls; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER ensure_rls ON ddl_command_end
   EXECUTE FUNCTION public.rls_auto_enable();


ALTER EVENT TRIGGER ensure_rls OWNER TO postgres;

--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict nFwhn7e669o8iXluhC2lAyuecRhzIGdXPCF8PcL218gxm60wJzuhskcPyYULG1B

