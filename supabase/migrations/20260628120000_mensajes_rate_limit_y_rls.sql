-- ============================================================
-- MIGRACIÓN — Rate limit de mensajes + RLS en la tabla mensajes
-- Fecha: 2026-06-28
-- Estado: PENDIENTE de aprobación de Samir (dueño de la BD) antes de
--         aplicar en local y remoto. No ejecutar sin su visto bueno.
--
-- [B] ANTI-FLOOD (escritura). La server action enviarMensaje no tenía
--     límite de tasa: un participante legítimo (o una cuenta comprometida /
--     bot con sesión válida) podía insertar miles de mensajes por segundo.
--     Se agrega un trigger BEFORE INSERT que rechaza si el remitente supera
--     el máximo de mensajes en una ventana móvil. Umbral: 10 / 10 segundos.
--
-- [C1] RLS DENY-BY-DEFAULT en mensajes. La tabla no tenía RLS: toda la
--      autorización vive en código (resolveAccesoMensajes) con admin client
--      (service role). Se habilita RLS sin políticas para 'authenticated':
--      el acceso queda exclusivamente por service role (las server actions).
--      Cierra el hueco de acceso directo vía PostgREST con cliente de sesión.
--      service_role (bypassrls) y postgres no se ven afectados, así que el
--      flujo actual (admin client) sigue intacto.
--
--      PLAN FUTURO (C2, NO incluido): si algún día mensajes se consume con el
--      cliente de sesión (anon key) o vía Realtime, habrá que agregar
--      políticas explícitas que repliquen resolveAccesoMensajes (participante
--      de la conversación) y verificar la RLS de empresarios/proyectos/
--      participaciones/estudiantes que esas lecturas requieren.
-- ============================================================

-- [B] Índice de soporte para el conteo del rate limit por remitente.
create index if not exists idx_mensajes_remitente_fecha
  on mensajes (id_remitente, fecha_envio desc);

-- [B] Función de rate limit. SECURITY DEFINER para que el conteo vea todas
-- las filas aunque RLS esté activo; search_path acotado por seguridad.
create or replace function check_mensaje_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
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

drop trigger if exists trg_mensajes_rate_limit on mensajes;
create trigger trg_mensajes_rate_limit
  before insert on mensajes
  for each row execute function check_mensaje_rate_limit();

-- [C1] RLS deny-by-default: sin políticas para 'authenticated', el acceso
-- queda exclusivamente por service role (server actions con admin client).
alter table mensajes enable row level security;
