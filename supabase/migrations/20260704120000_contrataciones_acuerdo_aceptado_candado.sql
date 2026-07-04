-- ============================================================
-- Tanda 0.1 — Capa de negociacion del contrato (aditiva, retrocompatible)
-- Fecha: 2026-07-04
--
-- Contexto: hoy `contrataciones` ya tiene `monto_acordado` y
-- `condiciones_especiales` (el empresario puede escribirlos via la policy
-- `contrataciones_update_empresario`), pero NO existe forma de que el
-- egresado "acepte" el acuerdo ni de congelarlo una vez aceptado.
--
-- Esta migracion agrega esa capa SIN tocar nada existente:
--   1. Columna `acuerdo_aceptado_at` (nullable). null = en negociacion;
--      con timestamp = acuerdo sellado.
--   2. Trigger de integridad `trg_integridad_acuerdo_contratacion`:
--      - CANDADO: una vez aceptado, `monto_acordado` y `condiciones_especiales`
--        son inmutables, y la aceptacion es irreversible. Sirve de evidencia
--        de los terminos acordados por ambas partes.
--      - MONTO MINIMO: el monto propuesto no puede ser menor al
--        `presupuesto_min` del proyecto (si el proyecto tiene minimo).
--   3. RPC `aceptar_acuerdo_contratacion` (SECURITY DEFINER): el egresado
--      no tiene policy de UPDATE sobre `contrataciones`, asi que la
--      aceptacion pasa por esta funcion, que valida propiedad y estado.
--
-- Todo es aditivo: el codigo viejo y los 3 RPCs de entregables siguen
-- funcionando sin cambios. Nada se dropea ni se renombra.
--
-- Igual que los guards existentes (validar_transicion_participacion,
-- actualizar_url_participacion): el trigger solo aplica a `authenticated`;
-- `service_role`/`postgres` pasan (correcciones administrativas y RPCs
-- SECURITY DEFINER). El errcode es `check_violation` (23514), consistente
-- con las server actions que ya capturan ese codigo.
-- ============================================================

-- 1. Columna de sello del acuerdo -----------------------------------------

alter table public.contrataciones
  add column if not exists acuerdo_aceptado_at timestamptz;

comment on column public.contrataciones.acuerdo_aceptado_at is
  'Momento en que el egresado acepto monto y condiciones. null = en negociacion. '
  'Una vez seteado, monto_acordado y condiciones_especiales quedan inmutables (candado).';

-- 2. Trigger de integridad del acuerdo ------------------------------------

create or replace function public.validar_integridad_acuerdo_contratacion()
returns trigger
language plpgsql
set search_path to ''
as $$
declare
  v_presupuesto_min numeric;
begin
  -- Solo aplica a authenticated; service_role, postgres y las RPC
  -- SECURITY DEFINER (como aceptar_acuerdo_contratacion) pasan.
  if current_user is distinct from 'authenticated' then
    return new;
  end if;

  -- Candado post-aceptacion: monto y condiciones inmutables, y la
  -- aceptacion misma es irreversible.
  if old.acuerdo_aceptado_at is not null then
    if new.monto_acordado is distinct from old.monto_acordado
    or new.condiciones_especiales is distinct from old.condiciones_especiales
    or new.acuerdo_aceptado_at is distinct from old.acuerdo_aceptado_at then
      raise exception 'Acuerdo ya aceptado: monto y condiciones son inmutables'
        using errcode = 'check_violation';
    end if;
  end if;

  -- El monto propuesto no puede ser menor al presupuesto minimo del
  -- proyecto (si el proyecto define minimo). Sin tope superior.
  if new.monto_acordado is not null
     and new.monto_acordado is distinct from old.monto_acordado then
    select pr.presupuesto_min into v_presupuesto_min
    from public.participaciones pa
    join public.proyectos pr on pr.id_proyecto = pa.id_proyecto
    where pa.id_participacion = new.id_participacion;

    if v_presupuesto_min is not null and new.monto_acordado < v_presupuesto_min then
      raise exception 'Monto acordado (%) menor al presupuesto minimo del proyecto (%)',
        new.monto_acordado, v_presupuesto_min
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

-- Las funciones-trigger no se exponen como RPC.
revoke execute on function public.validar_integridad_acuerdo_contratacion() from public, anon, authenticated;

drop trigger if exists trg_integridad_acuerdo_contratacion on public.contrataciones;

-- Solo dispara cuando se tocan estas tres columnas: los flujos de
-- finalizar/cancelar (estado_periodo, fecha_fin_real, motivo_cancelacion)
-- no lo activan.
create trigger trg_integridad_acuerdo_contratacion
  before update of monto_acordado, condiciones_especiales, acuerdo_aceptado_at
  on public.contrataciones
  for each row execute function public.validar_integridad_acuerdo_contratacion();

-- 3. RPC de aceptacion para el egresado -----------------------------------

create or replace function public.aceptar_acuerdo_contratacion(
  p_id_contratacion uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id_estudiante uuid;
  v_estado        estado_periodo_enum;
  v_aceptado_at   timestamptz;
  v_monto         numeric;
begin
  select e.id_estudiante into v_id_estudiante
  from public.estudiantes e
  where e.id_usuario = auth.uid();

  if v_id_estudiante is null then
    raise exception 'No autorizado'
      using errcode = 'P0003';
  end if;

  select c.estado_periodo, c.acuerdo_aceptado_at, c.monto_acordado
  into v_estado, v_aceptado_at, v_monto
  from public.contrataciones c
  join public.participaciones p on p.id_participacion = c.id_participacion
  where c.id_contratacion = p_id_contratacion
    and p.id_estudiante   = v_id_estudiante;

  if not found then
    raise exception 'Contratacion no encontrada o no autorizada'
      using errcode = 'P0004';
  end if;

  if v_estado <> 'vigente' then
    raise exception 'La contratacion no esta vigente'
      using errcode = 'P0005';
  end if;

  if v_aceptado_at is not null then
    raise exception 'El acuerdo ya fue aceptado'
      using errcode = 'P0006';
  end if;

  if v_monto is null then
    raise exception 'No hay una propuesta de monto para aceptar'
      using errcode = 'P0007';
  end if;

  update public.contrataciones
  set acuerdo_aceptado_at = now(),
      updated_at          = now()
  where id_contratacion = p_id_contratacion;
end;
$$;

revoke all on function public.aceptar_acuerdo_contratacion(uuid) from public;
grant execute on function public.aceptar_acuerdo_contratacion(uuid) to authenticated;
