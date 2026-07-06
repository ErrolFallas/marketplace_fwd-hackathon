-- ============================================================
-- Auto-cancelar proyectos vencidos SIN postulaciones
-- ------------------------------------------------------------
-- NO aplicar sin Samir: crea función SECURITY DEFINER y requiere pg_cron.
--
-- QUÉ HACE
--   Un proyecto que quedó 'abierto', venció (fecha_cierre < now()) y NO tiene
--   ninguna postulación viva ('enviada'/'en_revision') es un callejón sin salida:
--   no hay a quién adjudicar y no avanza. La función lo pasa a 'cancelado' (con
--   motivo) y le avisa al empresario, que así lo puede republicar (flujo de
--   20260706200000). Espeja emitir_avisos_plazo_vence (20260621140000).
--
--   Solo toca proyectos SIN postulaciones vivas: si hay aunque sea una 'enviada'
--   o 'en_revision', el empresario todavía puede adjudicar, así que no se toca.
--
-- IDEMPOTENCIA
--   El cambio de estado ('abierto' -> 'cancelado') es la propia guarda: tras
--   cancelar, el proyecto ya no matchea el filtro, así que no se re-procesa ni se
--   re-notifica. CREATE OR REPLACE: seguro de re-ejecutar.
--
-- PASO EXTRA (Samir, fuera de esta migración)
--   Habilitar pg_cron (Dashboard → Database → Extensions) y agendar (una vez):
--     select cron.schedule(
--       'cancelar-vencidos-sin-postulaciones-diario',
--       '0 5 * * *',
--       $$ select public.cancelar_proyectos_vencidos_sin_postulaciones(); $$
--     );
--   Verificar: select * from cron.job;
-- ============================================================

create or replace function public.cancelar_proyectos_vencidos_sin_postulaciones()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_canceladas integer;
begin
  with objetivo as (
    select p.id_proyecto, p.titulo, p.id_empresario
    from public.proyectos p
    where p.estado in ('abierto', 'en_recepcion')
      and p.is_active = true
      and p.fecha_cierre is not null
      and p.fecha_cierre < now()
      and not exists (
        select 1
        from public.participaciones pa
        where pa.id_proyecto = p.id_proyecto
          and pa.estado in ('enviada', 'en_revision')
      )
  ),
  canceladas as (
    update public.proyectos p
    set estado = 'cancelado',
        motivo_cancelacion = coalesce(
          p.motivo_cancelacion, 'Vencido sin postulaciones.'
        )
    from objetivo o
    where p.id_proyecto = o.id_proyecto
    returning o.id_proyecto, o.titulo, o.id_empresario
  )
  insert into public.notificaciones (
    id_usuario, tipo_evento, mensaje, url_destino, params, leida
  )
  select
    em.id_usuario,
    'proyecto_cancelado_sin_postulantes',
    left(
      'Tu proyecto "' || c.titulo ||
        '" vencio sin postulaciones y se cancelo. Podes republicarlo.',
      255
    ),
    '/es/empresario/perfil',
    jsonb_build_object('titulo', c.titulo),
    false
  from canceladas c
  join public.empresarios em on em.id_empresario = c.id_empresario;

  get diagnostics v_canceladas = row_count;
  return v_canceladas;
end;
$$;

-- Solo el job (owner) la ejecuta; nunca los clientes.
revoke execute on function public.cancelar_proyectos_vencidos_sin_postulaciones()
  from public, anon, authenticated;
