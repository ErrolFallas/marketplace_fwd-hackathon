# 📊 Informe de Paridad — Bases de Datos Supabase

> Comparación entre la base de datos **vieja** (`mgowuyflhiavquztxpqh`) y la **nueva** (`vnamdoocvzaholoftqja`).

## ✅ Resultado General

**Las bases de datos son funcionalmente equivalentes.** Las diferencias encontradas son menores y en su mayoría esperables tras una migración a un nuevo proyecto Supabase.

---

## 📋 Resumen de Diferencias

| Categoría | Tipo | Impacto | Detalle |
|-----------|------|---------|---------|
| 🟡 Extensión | `pg_net` falta en la nueva | **Bajo** | La extensión `pg_net` (Async HTTP) existe en la vieja pero no en la nueva. Solo importa si usas `net.http_*` para webhooks desde SQL. |
| 🟢 Comentarios | Encodificación UTF-8 corregida | **Ninguno** | Textos como `contrataciÃ³n` → `contratación`. La nueva DB tiene los acentos bien. |
| 🟢 Comentarios | Nuevos comentarios en código | **Ninguno** | Se añadieron comentarios aclaratorios en funciones (`handle_new_user`, `limpiar_cuentas_sin_rol`, `emitir_avisos_plazo`). |
| 🟡 Policies | 2 policies mejoradas | **Bajo/Positivo** | `notificaciones_select_own` y `notificaciones_update_own` ahora incluyen `TO authenticated` explícitamente. Es una **mejora** de seguridad. |
| 🟢 Esquema interno | `supabase_migrations.schema_migrations` | **Ninguno** | La vieja tiene columnas extra (`created_by`, `idempotency_key`, `rollback[]`). Son internas de Supabase y no afectan la app. |
| 🟡 Esquema interno | Constraint `idempotency_key_key` | **Ninguno** | Constraint UNIQUE en `idempotency_key` solo existe en la vieja. Es interno de Supabase. |
| 🟢 ACL | `pg_net` schema grants | **Ninguno** | Grants para el schema `net` solo existen en la vieja (porque `pg_net` no está instalada en la nueva). |
| 🟡 ACL | Default privileges `supabase_admin` | **Bajo/Positivo** | La nueva DB tiene `DEFAULT PRIVILEGES` para `supabase_admin` en tablas, funciones y secuencias del schema `public`. Esto **mejora** los permisos por defecto. |
| 🟢 Comentario schema | `COMMENT ON SCHEMA public` | **Ninguno** | La vieja tiene un comentario vacío (`''`) que la nueva no incluye. Sin impacto. |
| 🟢 Tokens | `\restrict` / `\unrestrict` | **Ninguno** | Tokens de seguridad del dump, diferentes por proyecto. Esperado. |

---

## 🔍 Detalle de Cada Diferencia

### 1. Extensión `pg_net` (falta en la nueva)

```diff
- CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
- COMMENT ON EXTENSION pg_net IS 'Async HTTP';
```

> [!NOTE]
> `pg_net` permite hacer llamadas HTTP asíncronas desde SQL (p.ej. webhooks). Si tu aplicación no utiliza funciones como `net.http_post()` dentro de triggers o funciones SQL, **no necesitas esta extensión**. Si la necesitas, puedes habilitarla desde el Dashboard de Supabase → Extensions → `pg_net`.

### 2. Policies de notificaciones mejoradas

```diff
- CREATE POLICY notificaciones_select_own ON public.notificaciones FOR SELECT
-   USING ((id_usuario = ( SELECT auth.uid() AS uid)));
+ CREATE POLICY notificaciones_select_own ON public.notificaciones FOR SELECT
+   TO authenticated
+   USING ((id_usuario = ( SELECT auth.uid() AS uid)));
```

> [!TIP]
> La nueva versión es **más segura**: restringe explícitamente estas policies al rol `authenticated`. La vieja aplicaba la policy a todos los roles (incluyendo `anon`), aunque `auth.uid()` ya devolvería `null` para usuarios no autenticados.

### 3. Default Privileges adicionales en la nueva

```diff
+ ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
+ ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
+ ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
+ ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
```

> [!NOTE]
> Estos grants se aplican también para `FUNCTIONS` y `TABLES`. Garantizan que los objetos creados por `supabase_admin` sean accesibles por los roles estándar de Supabase. Es la configuración recomendada por Supabase para proyectos nuevos.

### 4. Corrección de encoding UTF-8

```diff
- -- 2. Resolver la cadena entregable -> contrataciÃ³n -> participaciÃ³n -> proyecto
+ -- 2. Resolver la cadena entregable -> contratación -> participación -> proyecto
```

> [!TIP]
> Los caracteres especiales (acentos, ñ) se muestran correctamente en la nueva DB. Esto indica que la migración resolvió un problema de encoding que existía en la vieja.

---

## ✅ Elementos Idénticos (sin diferencias)

| Elemento | Estado |
|----------|--------|
| **Tablas** (schema `public`) | ✅ Idénticas — todas las tablas de la app (`usuarios`, `proyectos`, `participaciones`, `entregables`, `contrataciones`, `strikes`, `notificaciones`, `calificaciones`, `configuracion_sistema`, `empresarios`, `estudiantes`, `auditoria`, etc.) |
| **Columnas y tipos** | ✅ Idénticos |
| **Enums** (`alcance_enum`, `estado_participacion_enum`, etc.) | ✅ Idénticos |
| **Funciones** (`handle_new_user`, `adjudicar_participacion`, `finalizar_proyecto_por_entregable`, etc.) | ✅ Idénticas (solo difieren en whitespace y comentarios) |
| **Triggers** | ✅ Idénticos |
| **Indexes** | ✅ Idénticos |
| **RLS habilitado** | ✅ Idéntico en todas las tablas |
| **Policies RLS** | ✅ Idénticas (2 mejoradas con `TO authenticated`) |
| **Foreign Keys** | ✅ Idénticas |
| **Grants/ACL** (schema `public`) | ✅ Idénticos (con mejoras en default privileges) |

---

## 🎯 Acciones Recomendadas

1. **`pg_net`**: Si la app usa llamadas HTTP asíncronas desde SQL, habilitar `pg_net` en el dashboard de la nueva base. Si no se usa, ignorar.
2. **No se requiere ninguna otra acción.** Las diferencias son todas menores, esperables, o mejoras.

---

## 📁 Archivos de Auditoría Relacionados

Estos archivos se encuentran localizados en la carpeta `migration_audit/`:
- [old_schema.sql](file:///c:/Users/fwd/Desktop/Marketplace_hackaton/marketplace_fwd-hackathon/migration_audit/old_schema.sql) — Esquema completo de la base vieja
- [new_schema.sql](file:///c:/Users/fwd/Desktop/Marketplace_hackaton/marketplace_fwd-hackathon/migration_audit/new_schema.sql) — Esquema completo de la base nueva
- [schema_diff.txt](file:///c:/Users/fwd/Desktop/Marketplace_hackaton/marketplace_fwd-hackathon/migration_audit/schema_diff.txt) — Diff completo (incluye whitespace)
- [schema_diff_no_whitespace.txt](file:///c:/Users/fwd/Desktop/Marketplace_hackaton/marketplace_fwd-hackathon/migration_audit/schema_diff_no_whitespace.txt) — Diff filtrado (solo diferencias significativas)
