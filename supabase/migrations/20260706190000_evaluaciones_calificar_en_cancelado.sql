-- ============================================================
-- Calificar-en-cancelado: empresa -> egresado
-- ============================================================
-- La migracion 20260706180000 amplio a 'cancelado' la RLS de INSERT de
-- evaluaciones_empresarios (egresado -> empresa), pero la tabla evaluaciones
-- (empresa -> egresado) tiene su PROPIA policy de INSERT que seguia exigiendo
-- estado_periodo = 'finalizado'. Resultado: calificar al egresado en una
-- contratacion cancelada fallaba con "new row violates row-level security
-- policy for table evaluaciones".
--
-- Aqui se amplia esa policy a ('finalizado','cancelado'). Copia fiel de la
-- version vigente (20260622130000): se conservan el grant `to public` y el
-- check current_user_is_verified(); lo unico que cambia es el estado permitido.

drop policy if exists evaluaciones_insert_empresario on public.evaluaciones;
create policy evaluaciones_insert_empresario on public.evaluaciones
  for insert to public
  with check (
    (
      id_empresario in (
        select empresarios.id_empresario
        from public.empresarios
        where empresarios.id_usuario = (select auth.uid())
      )
      and exists (
        select 1
        from public.contrataciones c
        join public.participaciones pa on pa.id_participacion = c.id_participacion
        join public.proyectos p on p.id_proyecto = pa.id_proyecto
        join public.empresarios emp on emp.id_empresario = p.id_empresario
        where c.id_contratacion = evaluaciones.id_contratacion
          and pa.id_estudiante = evaluaciones.id_estudiante
          and emp.id_usuario = (select auth.uid())
          and c.estado_periodo in ('finalizado'::estado_periodo_enum, 'cancelado'::estado_periodo_enum)
      )
    )
    and public.current_user_is_verified()
  );
