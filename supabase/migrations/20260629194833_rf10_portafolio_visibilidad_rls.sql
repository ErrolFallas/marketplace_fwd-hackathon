-- ============================================================
-- RF-10: la RLS del portafolio respeta portafolio_visible_publicamente
--        y se cierra el acceso anonimo a las 4 tablas del perfil.
-- Fecha: 2026-06-29
--
-- Hueco: portafolio_select_own_or_public (proyectos_portafolio) y
-- portafolio_tec_select (portafolio_tecnologias) gateaban la rama
-- "publica" SOLO por is_active + origen/estado_consentimiento, NUNCA por
-- el flag portafolio_visible_publicamente del egresado dueno. Un portafolio
-- marcado "Solo Empresas" quedaba legible por acceso directo a PostgREST
-- (incluido anon). Ademas las 4 policies SELECT del perfil no tenian
-- clausula `to`, asi que aplicaban tambien a anon (holdout: proyectos y
-- empresarios_public ya cerraron anon antes).
--
-- Fix: las 4 policies pasan a `to authenticated` (sin anon) y las 2 de
-- portafolio exigen ademas que el egresado dueno tenga
-- portafolio_visible_publicamente = true en la rama publica. Se conserva:
-- (a) el dueno SIEMPRE ve lo suyo; (b) is_active + origen/consentimiento;
-- (c) patron InitPlan (select auth.uid()). Solo se tocan las policies
-- SELECT; INSERT/UPDATE/DELETE quedan intactas.
-- ============================================================

-- ---------- estudiantes (ya respetaba el flag; solo se cierra anon) ----------
drop policy if exists "estudiantes_select_own_or_public" on public.estudiantes;
create policy "estudiantes_select_own_or_public"
  on public.estudiantes for select
  to authenticated
  using (
    id_usuario = (select auth.uid())
    or portafolio_visible_publicamente = true
  );

-- ---------- habilidades_tecnicas (ya respetaba el flag; solo se cierra anon) ----------
drop policy if exists "est_hab_select" on public.habilidades_tecnicas;
create policy "est_hab_select"
  on public.habilidades_tecnicas for select
  to authenticated
  using (
    id_estudiante in (
      select id_estudiante from public.estudiantes
      where id_usuario = (select auth.uid())
         or portafolio_visible_publicamente = true
    )
  );

-- ---------- proyectos_portafolio (cierra anon + agrega el flag a la rama publica) ----------
drop policy if exists "portafolio_select_own_or_public" on public.proyectos_portafolio;
create policy "portafolio_select_own_or_public"
  on public.proyectos_portafolio for select
  to authenticated
  using (
    id_estudiante in (
      select id_estudiante from public.estudiantes
      where id_usuario = (select auth.uid())
    )
    or (
      is_active = true
      and (origen <> 'plataforma_contratada' or estado_consentimiento = 'aprobado')
      and id_estudiante in (
        select id_estudiante from public.estudiantes
        where portafolio_visible_publicamente = true
      )
    )
  );

-- ---------- portafolio_tecnologias (espejo de la anterior) ----------
drop policy if exists "portafolio_tec_select" on public.portafolio_tecnologias;
create policy "portafolio_tec_select"
  on public.portafolio_tecnologias for select
  to authenticated
  using (
    id_portafolio in (
      select id_portafolio from public.proyectos_portafolio
      where id_estudiante in (
              select id_estudiante from public.estudiantes
              where id_usuario = (select auth.uid())
            )
         or (
              is_active = true
              and (origen <> 'plataforma_contratada' or estado_consentimiento = 'aprobado')
              and id_estudiante in (
                select id_estudiante from public.estudiantes
                where portafolio_visible_publicamente = true
              )
            )
    )
  );
