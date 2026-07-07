-- ============================================================
-- Unificar la suspensión por strikes: el trigger como fuente de verdad ÚNICA
-- ------------------------------------------------------------
-- Antes había DOS escritores del estado de suspensión que podían desincronizarse:
--   (1) este trigger `actualizar_strikes`, y
--   (2) la server action `addStrike`, con OTRA clave de config ('max_strikes_limit',
--       inexistente -> default 3) y su propio UPDATE de estado/contador.
-- Resultado: un usuario con 6 strikes quedó 'activa' (sin suspender), y al bajarle
-- los strikes quedó 'suspendida' con 1 strike (suspensión zombie), porque el trigger
-- viejo suspendía "hacia arriba" pero nunca levantaba la suspensión al bajar.
--
-- Esta versión hace del trigger la ÚNICA autoridad. Escribe cantidad_strikes,
-- estado_cuenta e is_active atómicamente, y modela la máquina de estados completa:
--   * conteo >= 5           -> 'suspendida_severa' + is_active=false (EXPULSIÓN, terminal)
--   * conteo >= umbral (3)  -> 'suspendida'
--   * conteo <  umbral      -> 'activa' (levanta la suspensión REGULAR: simétrica)
--
-- Reglas:
--   - La EXPULSIÓN es TERMINAL: una vez 'suspendida_severa', el trigger no la baja
--     aunque se revoquen strikes; solo se sale con restoreAccess (acción explícita).
--   - is_active solo se pone false al expulsar; en las demás ramas NO se toca, para
--     no pisar una desactivación manual del admin (concepto ajeno a los strikes).
--   - La suspensión REGULAR sí es simétrica: si el conteo baja del umbral, vuelve a
--     'activa'. No toca 'pendiente'.
-- Umbral configurable en 'strikes_para_suspension' (default 3); expulsión = 5 fijo.
-- addStrike deja de escribir estado/contador y deja de usar 'max_strikes_limit'.

create or replace function public.actualizar_strikes()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_activos   integer;
  v_umbral    integer;
  v_expulsion constant integer := 5;
  v_estado    estado_cuenta_enum;
begin
  -- Conteo autoritativo de strikes vigentes (no revocados).
  select count(*) into v_activos
  from strikes
  where id_usuario = new.id_usuario and revocado = false;

  -- Umbral de suspensión configurable (default 3).
  select valor::integer into v_umbral
  from configuracion_sistema
  where clave = 'strikes_para_suspension';
  if v_umbral is null then v_umbral := 3; end if;

  select estado_cuenta into v_estado
  from usuarios
  where id_usuario = new.id_usuario;

  if v_estado = 'suspendida_severa' then
    -- EXPULSIÓN terminal: solo refresca el conteo, nunca la levanta el trigger.
    update usuarios
    set cantidad_strikes = v_activos
    where id_usuario = new.id_usuario;

  elsif v_activos >= v_expulsion then
    -- Escalada a expulsión (terminal).
    update usuarios
    set cantidad_strikes = v_activos,
        estado_cuenta    = 'suspendida_severa',
        is_active        = false,
        suspendido_at    = now()
    where id_usuario = new.id_usuario;

  elsif v_activos >= v_umbral then
    -- Suspensión regular.
    update usuarios
    set cantidad_strikes = v_activos,
        estado_cuenta    = 'suspendida',
        suspendido_at    = coalesce(suspendido_at, now())
    where id_usuario = new.id_usuario;

  else
    -- Debajo del umbral: la suspensión REGULAR se levanta sola (simétrica).
    -- No toca 'pendiente', 'suspendida_severa' ni is_active.
    update usuarios
    set cantidad_strikes = v_activos,
        estado_cuenta    = case when estado_cuenta = 'suspendida' then 'activa'::estado_cuenta_enum else estado_cuenta end,
        suspendido_at    = case when estado_cuenta = 'suspendida' then null else suspendido_at end
    where id_usuario = new.id_usuario;
  end if;

  return new;
end;
$$;
