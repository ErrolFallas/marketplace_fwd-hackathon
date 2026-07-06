# Propuesta de migración para Samir — Cancelar contratación

> **Estado:** PROPUESTA. Requiere aprobación de Samir antes de aplicar (regla del
> equipo: las migraciones no se aplican directo). No está en `supabase/migrations/`
> a propósito, para que nadie la corra con `db push` sin su visto bueno. Cuando
> apruebe, se mueve a `supabase/migrations/` con timestamp definitivo.

## Qué resuelve

El empresario puede **cancelar** una contratación vigente. Al cancelar:
- la contratación pasa a `estado_periodo = 'cancelado'` (con motivo),
- el proyecto pasa a `estado = 'cancelado'` (terminal),
- la participación contratada pasa a `estado = 'cancelada'` (el trigger ya lo permite).

Y se habilita **calificar también en `cancelado`** (no solo `finalizado`): reseñas
atribuidas y visibles a ambas partes (decisión de producto ya tomada).

Espeja `finalizar_contratacion` (`20260704160000`): `security invoker`, resuelve el
empresario de la sesión, valida propiedad, serializa con `for update of c` y exige
que la contratación esté `vigente`.

## Fuera de alcance en esta migración (a propósito)

- **Republicar el proyecto (clon con id nuevo, copia exacta).** Se difiere: copia
  columnas de `proyectos`, y `proyectos` está cambiando ahora (`20260706120000`
  agrega `requerimientos_funcionales`). Escribir el clon contra un esquema en
  movimiento dejaría columnas afuera. Se define cuando el esquema se estabilice.
- **Cambios de app (no migración):** las server actions `rateEgresado`
  (`evaluaciones/actions.ts`) y `rateCompany` (`company/ratings.ts`) hoy chequean
  `estado_periodo === 'finalizado'`; deben aceptar también `'cancelado'`. Y la RLS
  de `evaluaciones` (empresario→egresado) NO restringe estado (solo la server
  action), así que ahí no hay migración: solo el cambio de app.

## SQL propuesto

```sql
-- ============================================================
-- Cancelar contratación + calificar en 'cancelado'
-- Espejo de finalizar_contratacion (20260704160000).
-- ============================================================

-- 1. RPC de cancelación.
create or replace function public.cancelar_contratacion(
  p_id_contratacion uuid,
  p_motivo text
) returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id_empresario    uuid;
  v_id_proyecto      uuid;
  v_id_participacion uuid;
  v_estado_periodo   estado_periodo_enum;
begin
  if p_motivo is null or length(btrim(p_motivo)) = 0 then
    raise exception 'Motivo de cancelacion requerido'
      using errcode = 'P0006';
  end if;

  -- Empresario dueño resuelto desde la sesión.
  select em.id_empresario into v_id_empresario
  from public.empresarios em
  where em.id_usuario = auth.uid();

  if v_id_empresario is null then
    raise exception 'Empresario no encontrado'
      using errcode = 'P0003';
  end if;

  -- Contratación → participación → proyecto, validando propiedad.
  select c.id_participacion, c.estado_periodo, pr.id_proyecto
  into v_id_participacion, v_estado_periodo, v_id_proyecto
  from public.contrataciones c
  join public.participaciones p on p.id_participacion = c.id_participacion
  join public.proyectos pr on pr.id_proyecto = p.id_proyecto
  where c.id_contratacion = p_id_contratacion
    and pr.id_empresario  = v_id_empresario
  for update of c;

  if not found then
    raise exception 'Contratacion no encontrada o no autorizada'
      using errcode = 'P0004';
  end if;

  if v_estado_periodo <> 'vigente' then
    raise exception 'La contratacion no esta vigente'
      using errcode = 'P0005';
  end if;

  -- Cierre por cancelación. Habilita calificaciones (RLS de reseñas, punto 2).
  update public.proyectos
  set estado = 'cancelado'
  where id_proyecto = v_id_proyecto;

  update public.contrataciones
  set estado_periodo     = 'cancelado',
      motivo_cancelacion = p_motivo,
      updated_at         = now()
  where id_contratacion = p_id_contratacion;

  update public.participaciones
  set estado = 'cancelada'
  where id_participacion = v_id_participacion;
end;
$$;

revoke all on function public.cancelar_contratacion(uuid, text) from public, anon;
grant execute on function public.cancelar_contratacion(uuid, text) to authenticated;

-- 2. Ampliar la RLS de INSERT de evaluaciones_empresarios a 'cancelado'.
--    Antes solo 'finalizado' (ver 20260619140500).
drop policy if exists "evaluaciones_empresarios_insert_estudiante" on public.evaluaciones_empresarios;
create policy "evaluaciones_empresarios_insert_estudiante"
  on public.evaluaciones_empresarios for insert
  to authenticated
  with check (
    id_estudiante in (
      select id_estudiante from public.estudiantes where id_usuario = (select auth.uid())
    )
    and exists (
      select 1
      from public.contrataciones c
      join public.participaciones pa on pa.id_participacion = c.id_participacion
      where c.id_contratacion = evaluaciones_empresarios.id_contratacion
        and pa.id_estudiante = evaluaciones_empresarios.id_estudiante
        and c.estado_periodo in ('finalizado', 'cancelado')
    )
  );
```

## Verificación sugerida tras aplicar (MCP read-only o SQL)

1. Cancelar una contratación de prueba vigente → `contrataciones.estado_periodo='cancelado'`
   + `motivo_cancelacion` seteado; `proyectos.estado='cancelado'`; `participaciones.estado='cancelada'`.
2. Intentar cancelar una ya `finalizado`/`cancelado` → error `P0005`.
3. Un egresado ajeno intenta cancelar → error `P0004` (no autorizado).
4. Calificar (egresado→empresa) sobre una contratación `cancelado` → INSERT permitido por la RLS.
