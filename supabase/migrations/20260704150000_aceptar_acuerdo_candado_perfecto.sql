-- Candado perfecto para la aceptacion del acuerdo por el egresado.
--
-- Antes, el chequeo "el egresado firma lo que vio" vivia en la server action
-- (comparaba el monto/condiciones vistos contra los actuales ANTES de llamar a la
-- RPC): eso deja un TOCTOU minimo entre la lectura de la action y el UPDATE de la
-- RPC. Esta migracion mueve el chequeo DENTRO de la RPC, en la misma transaccion y
-- con la fila bloqueada (for update), eliminando la ventana de carrera.
--
-- Cambia la firma de la RPC (de 1 a 3 parametros): recibe el monto y las
-- condiciones esperados. Se borra la version vieja y se crea la nueva. El unico
-- llamador es la server action aceptarAcuerdo, que se actualiza en el mismo cambio
-- de codigo (pasa p_monto_esperado / p_condiciones_esperadas y deja de hacer el
-- pre-chequeo en JS).

drop function if exists public.aceptar_acuerdo_contratacion(uuid);

create or replace function public.aceptar_acuerdo_contratacion(
  p_id_contratacion       uuid,
  p_monto_esperado        numeric,
  p_condiciones_esperadas text
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
  v_condiciones   text;
begin
  select e.id_estudiante into v_id_estudiante
  from public.estudiantes e
  where e.id_usuario = auth.uid();

  if v_id_estudiante is null then
    raise exception 'No autorizado'
      using errcode = 'P0003';
  end if;

  -- for update of c: bloquea la fila de la contratacion. Una edicion concurrente
  -- de la empresa (actualizarPropuestaContratacion) espera hasta que esta
  -- transaccion termine, cerrando la ventana de carrera por completo.
  select c.estado_periodo, c.acuerdo_aceptado_at, c.monto_acordado,
         c.condiciones_especiales
  into v_estado, v_aceptado_at, v_monto, v_condiciones
  from public.contrataciones c
  join public.participaciones p on p.id_participacion = c.id_participacion
  where c.id_contratacion = p_id_contratacion
    and p.id_estudiante   = v_id_estudiante
  for update of c;

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

  -- Candado optimista atomico: si el monto o las condiciones actuales difieren de
  -- lo que el egresado vio, la empresa las cambio despues de que cargo la pantalla
  -- -> se rechaza para no fijar un acuerdo distinto al mostrado. IS DISTINCT FROM
  -- compara con seguridad ante nulls (condiciones puede ser null).
  if v_monto is distinct from p_monto_esperado
     or v_condiciones is distinct from p_condiciones_esperadas then
    raise exception 'El acuerdo cambio desde que se mostro'
      using errcode = 'P0008';
  end if;

  update public.contrataciones
  set acuerdo_aceptado_at = now(),
      updated_at          = now()
  where id_contratacion = p_id_contratacion;
end;
$$;

revoke all on function public.aceptar_acuerdo_contratacion(uuid, numeric, text)
  from public;
grant execute on function public.aceptar_acuerdo_contratacion(uuid, numeric, text)
  to authenticated;
