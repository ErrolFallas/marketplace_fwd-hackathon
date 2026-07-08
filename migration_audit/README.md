# Auditoría de Migración de Base de Datos — Supabase

> Comparación de esquemas entre la base de datos **vieja** (`mgowuyflhiavquztxpqh`) y la **nueva** (`vnamdoocvzaholoftqja`).
> Auditoría original: **3 de julio de 2026** · Última actualización de este README: **8 de julio de 2026**.

---

## Contexto del Proyecto

**FWD Marketplace** es la plataforma donde empresas publican proyectos cortos (1–12 semanas) y los egresados del programa FWD Costa Rica postulan para tomarlos. Es el proyecto final del Hackathon FWD 2026 (Demo Day: 8 de julio).

| Dato | Valor |
|------|-------|
| Stack | Next.js 15 (App Router, RSC) · React 19 · TypeScript strict · Supabase (Postgres + Auth + RLS + Storage) · Tailwind v4 · shadcn/ui · next-intl (es/en) · Zod · Vitest |
| Base de datos nueva | `vnamdoocvzaholoftqja` (Supabase) |
| Base de datos vieja | `mgowuyflhiavquztxpqh` (Supabase, retirada) |
| Migraciones SQL totales | **102** archivos en `supabase/migrations/` |
| Último commit | `6b98bf6` (2026-07-07) |
| PRs mergeados | **159+** |

---

## Contenido de esta Carpeta

| Archivo | Descripción |
|---------|-------------|
| [parity_report.md](./parity_report.md) | **Informe principal.** Resume las diferencias entre ambas BD y valida la equivalencia funcional. **Este es el archivo que debes presentar al equipo.** |
| [old_schema.sql](./old_schema.sql) | Respaldo del esquema SQL completo de la BD vieja (~399 KB). |
| [new_schema.sql](./new_schema.sql) | Respaldo del esquema SQL completo de la BD nueva (~400 KB). |
| [schema_diff.txt](./schema_diff.txt) | Diff completo entre ambos esquemas, incluyendo espacios en blanco (~106 KB). |
| [schema_diff_no_whitespace.txt](./schema_diff_no_whitespace.txt) | Diff filtrado solo con diferencias significativas (~18 KB). |
| `sql_dumps/` | Respaldos históricos generados durante los intentos de importación y restauración. |

### Contenido de `sql_dumps/`

| Archivo | Tamaño | Descripción |
|---------|--------|-------------|
| `datos.sql` | 516 KB | Dump completo de datos |
| `estructura.sql` | 131 KB | Dump de estructura (DDL) |
| `public_data.sql` | 505 KB | Datos solo del schema `public` |
| `public_schema.sql` | 130 KB | Estructura solo del schema `public` |

---

## Resultado de la Auditoría de Paridad

**Las bases de datos son funcionalmente equivalentes.** Las diferencias encontradas son menores y esperables:

| # | Diferencia | Impacto | Notas |
|---|-----------|---------|-------|
| 1 | Extensión `pg_net` falta en la nueva | Bajo | Solo si se usan llamadas HTTP asíncronas desde SQL. Habilitable desde el Dashboard. |
| 2 | 2 policies de notificaciones mejoradas | Positivo | Ahora incluyen `TO authenticated` explícitamente (mejora de seguridad). |
| 3 | Default privileges adicionales (`supabase_admin`) | Positivo | Configuración recomendada por Supabase para proyectos nuevos. |
| 4 | Encoding UTF-8 corregido en comentarios | Ninguno | Acentos se muestran correctamente en la nueva BD. |
| 5 | Columnas internas de `supabase_migrations` | Ninguno | Internas de Supabase, no afectan la app. |

> Ver [parity_report.md](./parity_report.md) para el detalle completo.

---

## Estado Actual del Proyecto (post-auditoría)

Desde que se realizó la auditoría de paridad (3 de julio), el proyecto ha evolucionado significativamente. A continuación el estado actualizado al 8 de julio de 2026.

### Migraciones SQL (102 archivos)

Las migraciones cubren desde el schema inicial (`20260608000000`) hasta la última (`20260708140000`). Se organizan cronológicamente:

#### Fundación (8–10 junio)
- RLS auto-enable, schema inicial, seed de roles, auth trigger, cleanup & RLS, indexes & triggers, seed data

#### Onboarding y seguridad (9–11 junio)
- Validación de onboarding, campo `comentario_empresario` en entregables, hardening RLS (3 migraciones), performance de policies, revoke anon, schema fixes, merge de policies

#### Storage y flujos (11 junio)
- Buckets y policies de Storage, soft delete y visibilidad, flujo B unique e insert check, listado de buckets públicos, máquina de estados flujo B

#### Soporte y publicación (12–14 junio)
- Tickets de soporte, RPC `publicar_proyecto` (3 versiones con IA flags y plazo en días), fix recursión RLS de participaciones, rename `cedula_juridica` a `cedula`, conversación IA con logística

#### Evaluaciones y participaciones (15–19 junio)
- Login atómico (failed login), RPC `get_participaciones_de_proyecto`, evaluaciones de empresarios, contrato opcional (y su revert), participaciones sobre cerrado, obligatorios y topes, RPC `adjudicar_participacion`, RPC `finalizar_proyecto`, unique version entregables, notificación proyecto modificado, notificaciones, fix evaluaciones, recreate soporte, reputación estudiante, restrict rating a finalizado, notif params i18n

#### Adjudicación y geolocalización (21–22 junio)
- Adjudicar barre sobres cerrados, geo ISO país/región, residencia de estudiantes, plazo vence `pg_cron`, fix autoverificación, endurecer verificación, trigger activación correo, buckets documentación técnica y prototipos, limpieza huérfanos OAuth, tabla egresados FWD, trigger entregable final, activar borrado huérfanos, hash dedup entregables, drop policies legacy, storage requiere verificación, fix search_path

#### Notificaciones y hardening (23 junio)
- Notif entregable enviado, harden role onboarding, RPC `actualizar_url_participacion`, unique evaluaciones, reportes moderación admin

#### Mensajería y motivos (28 junio)
- Motivo de rechazo en estudiantes/empresarios, notif `correo_enviado_at`, rate limit y RLS mensajes, notif cuenta rechazada enum, evaluaciones select admin, vista pública de empresarios

#### Portafolio y contrataciones (29 junio – 4 julio)
- Portafolio visibilidad RLS, acuerdo aceptado candado (contrataciones), entregables 2 niveles (expand + UI), aceptar acuerdo candado perfecto, finalizar contratación global

#### Entregables y republicación (5–6 julio) — **POST-AUDITORÍA**
- Adjuntos multi-evidencia, requerimientos funcionales de proyectos, republicar proyecto, `id_tarea` NOT NULL, drop columnas legacy, notif contratación finalizada, cancelar contratación, evaluaciones en cancelado, republicar una vez con plazo, notif proyecto cancelado sin postulantes, auto-cancelar vencidos sin postulaciones, unificar suspensión/strikes, evaluaciones empresarios respuesta, notif invitación proyecto

#### IA y moderación (7–8 julio) — **POST-AUDITORÍA**
- Transparencia y endurecimiento RLS de evaluaciones
- **Moderador IA de convivencia**: `moderador_ia_reportes` y `moderador_ia_ledger` (tablas, RPCs, policies)
- Notif advertencia moderación enum
- **Filtro de ofertas IA**: tabla `revision_oferta_ia`, policies, RPCs
- Consentimiento propiedad intelectual enum
- Moderador IA entidades y alcance

---

### Arquitectura del Proyecto

```
marketplace_fwd-hackathon/
├── src/
│   ├── app/
│   │   ├── [locale]/          # Routing i18n (es/en)
│   │   │   ├── (public)/      # Landing, login, register, onboarding
│   │   │   ├── (app)/         # Área del egresado (/egresado, /marketplace)
│   │   │   ├── (company)/     # Área del empresario (/empresario)
│   │   │   ├── (admin)/       # Panel administrador (/admin)
│   │   │   └── showcase/      # Design system (dev-only)
│   │   ├── api/               # API routes internas
│   │   └── auth/              # OAuth callback y confirm (sin locale)
│   ├── components/
│   │   ├── features/          # Componentes por dominio (18 subdirectorios)
│   │   ├── layout/            # Componentes de layout
│   │   └── ui/                # Primitivas shadcn/ui
│   ├── hooks/                 # Custom hooks (5 archivos)
│   ├── i18n/                  # Config next-intl
│   ├── lib/                   # Lógica de negocio por dominio (23 módulos)
│   │   ├── admin/             # Acciones admin
│   │   ├── ai-filtro-ofertas/ # Revisor IA de postulaciones (12 archivos)
│   │   ├── applications/      # Postulaciones
│   │   ├── auth/              # Guards, roles, route-classification
│   │   ├── company/           # Lógica empresa
│   │   ├── deliverables/      # Entregables 2-niveles
│   │   ├── email/             # Correo (nodemailer/Gmail)
│   │   ├── evaluaciones/      # Evaluaciones bidireccionales
│   │   ├── geo/               # Geolocalización
│   │   ├── invitaciones/      # Invitaciones a proyectos
│   │   ├── landing/           # Stats de landing
│   │   ├── mensajes/          # Mensajería/chat
│   │   ├── moderador-ai/      # Agente moderador de convivencia (11 archivos)
│   │   ├── moderation/        # Moderación y strikes
│   │   ├── notifications/     # Notificaciones in-app
│   │   ├── portfolio/         # Portafolio del egresado
│   │   ├── projects/          # Proyectos
│   │   ├── proposal-ai/       # Generador IA de propuestas
│   │   ├── ranking/           # Rankings y reputación
│   │   ├── supabase/          # Clientes Supabase (server, client, admin)
│   │   ├── ui/                # Helpers de UI
│   │   └── utils/             # Utilidades compartidas
│   ├── types/                 # Tipos (database.ts generado, index.ts de app)
│   └── middleware.ts          # Gate de sesión, correo, estado, rol
├── supabase/
│   ├── migrations/            # 102 migraciones SQL
│   ├── seeds/                 # Seeds (vacío, se usa migración 20260608000006)
│   └── .temp/                 # Metadata del proyecto enlazado
├── migration_audit/           # <<< Esta carpeta
├── docs/
│   ├── auditorias/            # Auditorías de revisión
│   ├── importantes/           # Brief, SRS, design, reportes de IA
│   ├── informativos/          # Guías de deploy, seguridad, tracking
│   └── pendientes/            # Handoffs, planes, deuda técnica
├── tests/
│   ├── unit/                  # Tests unitarios
│   ├── e2e/                   # Tests E2E (Playwright)
│   └── ...                    # Tests por feature
├── messages/                  # Strings i18n (es.json, en.json)
├── scripts/                   # Scripts de utilidad (geo dataset)
├── public/                    # Assets estáticos
├── BD_CONTEXT.MD              # Contexto completo de la BD (JSON)
├── CLAUDE.md                  # Instrucciones para agentes IA
├── reglas.md                  # Restricciones del brief FWD
├── instalacion.md             # Guía de instalación
└── agent.md                   # Config del agente
```

---

### Funcionalidades Implementadas

#### Roles y Áreas
- **Egresado**: marketplace, postulaciones (sobre cerrado), entorno de trabajo, entregables 2-niveles con multi-evidencia, chat, perfil con portafolio, foto de perfil (Cloudinary), rankings
- **Empresario**: publicar/republicar proyectos, adjudicar, contrataciones con acuerdo de aceptación atómico, entregables, evaluaciones bidireccionales con réplica (RF-53), invitar egresados recomendados
- **Admin**: panel con pestañas (usuarios, moderación, calificaciones, soporte), moderador IA de convivencia, revisor IA de ofertas, strikes/suspensión unificados

#### Flujos Críticos (RPCs en Postgres)
- `publicar_proyecto` (v3: con IA flags y plazo)
- `adjudicar_participacion` (barre sobres cerrados)
- `finalizar_proyecto` / `finalizar_contratacion`
- `get_participaciones_de_proyecto` (sobre cerrado)
- `cancelar_contratacion` (con motivo)
- `republicar_proyecto` (una vez por cancelación, con plazo)
- `actualizar_url_participacion`
- `aceptar_acuerdo` (candado atómico, elimina TOCTOU)
- Auto-cancelar proyectos vencidos sin postulaciones (`pg_cron`)

#### Integraciones de IA (3 agentes)
1. **Proposal AI** (`src/lib/proposal-ai/`): genera propuestas para el formulario new-project con anti-invención (P8), requerimientos funcionales, y backstop de validación
2. **Filtro de Ofertas IA** (`src/lib/ai-filtro-ofertas/`): revisa postulaciones (advisory, anti-SSRF, anti-inyección) con consentimiento de propiedad intelectual — tabla `revision_oferta_ia`
3. **Moderador IA de Convivencia** (`src/lib/moderador-ai/`): moderación automatizada con reportes, ledger y panel admin

#### Seguridad
- RLS en **todas** las tablas con policies per-rol
- Guards en server actions (`requireRole`, `requireVerifiedEgresado`, etc.)
- Middleware con gates: sesión, correo confirmado, estado de cuenta, rol
- Rate limit en mensajería
- Verificación de egresados y empresarios con flujo de rechazo/re-verificación
- Hardening: revoke anon, fix recursión RLS, overlap policies, search_path

#### Correo y Notificaciones
- Correo vía Gmail/nodemailer con plantillas por evento
- Notificaciones in-app con `correo_enviado_at` para idempotencia
- Tipos: entregable enviado, contratación finalizada, cuenta rechazada, proyecto cancelado, invitación, advertencia moderación, participación en revisión

#### Geolocalización
- Tablas `paises` y `regiones` con ISO estándar
- Residencia de estudiantes con matching por afinidad normalizada

---

### Documentación Relacionada

| Ubicación | Contenido |
|-----------|-----------|
| `docs/importantes/Marketplace_FWD_Brief.md` | Brief oficial del proyecto |
| `docs/importantes/SRS_Plataforma_Talento_FWD.md` | SRS (fuente de verdad funcional) |
| `docs/importantes/design.md` | Sistema de diseño |
| `docs/informativos/deploy-vercel.md` | Guía de deploy a Vercel |
| `docs/informativos/migraciones-estado-y-tracking.md` | Estado y tracking de migraciones |
| `docs/pendientes/handoff-flujo-contrataciones.md` | Handoff del flujo de contrataciones |
| `docs/pendientes/handoff-filtro-ofertas-ia-rediseno.md` | Handoff del rediseño del filtro IA |
| `CLAUDE.md` | Instrucciones para agentes IA |
| `reglas.md` | Restricciones del brief (identidad, stack, naming) |
| `BD_CONTEXT.MD` | Contexto completo de la BD en JSON |

---

### Cambios Post-Auditoría (4–8 julio 2026)

Desde que se generó el informe de paridad, se han aplicado **~20 migraciones nuevas** y **~60 commits**. Los cambios más relevantes que impactan el schema:

| Migración | Área | Descripción |
|-----------|------|-------------|
| `20260704120000` | Contrataciones | Acuerdo aceptado con candado atómico |
| `20260704130000` | Entregables | Modelo de 2 niveles (expand) |
| `20260704140000` | Entregables | UI de 2 niveles |
| `20260704150000` | Contrataciones | Aceptar acuerdo candado perfecto (anti-TOCTOU) |
| `20260704160000` | Contrataciones | Finalizar contratación global |
| `20260705120000` | Entregables | Adjuntos multi-evidencia |
| `20260706120000` | Proyectos | Requerimientos funcionales |
| `20260706140000` | Proyectos | Republicar proyecto (RPC) |
| `20260706150000` | Entregables | `id_tarea` NOT NULL |
| `20260706160000` | Entregables | Drop columnas legacy |
| `20260706170000` | Notificaciones | Contratación finalizada |
| `20260706180000` | Contrataciones | Cancelar contratación (RPC + motivo) |
| `20260706190000` | Evaluaciones | Calificar en estado cancelado |
| `20260706200000` | Proyectos | Republicar una vez con plazo |
| `20260706210000` | Notificaciones | Proyecto cancelado sin postulantes |
| `20260706220000` | Automatización | Auto-cancelar vencidos sin postulaciones |
| `20260706230000` | Moderación | Unificar suspensión y strikes |
| `20260706240000` | Evaluaciones | Respuesta del empresario |
| `20260706250000` | Notificaciones | Invitación a proyecto |
| `20260707120000` | Evaluaciones | Transparencia y endurecimiento RLS |
| `20260707130000` | Moderación IA | Reportes y ledger del moderador IA |
| `20260707130001` | Notificaciones | Enum advertencia moderación |
| `20260707140000` | Filtro IA | Revisión de ofertas por IA |
| `20260707140001` | Consentimiento | Propiedad intelectual enum |
| `20260708140000` | Moderación IA | Entidades y alcance |

> **Nota**: el `parity_report.md` y los `schema_diff*.txt` reflejan el estado al 3 de julio. Los schemas exportados (`old_schema.sql`, `new_schema.sql`) son de esa fecha y **no incluyen** las ~25 migraciones post-auditoría listadas arriba.

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Servidor dev (Turbopack), http://localhost:3000

# Verificación
npm run typecheck              # tsc --noEmit
npm run lint                   # ESLint
npm run test                   # Vitest (una pasada)
npm run test:coverage          # Con cobertura v8

# Migraciones (requiere aprobación de Samir)
npx supabase db push           # Aplicar migraciones pendientes a la BD remota
```

---

## Pasos Siguientes

1. **Revisar [parity_report.md](./parity_report.md)** para entender las diferencias de la migración original.
2. **`pg_net`**: si la app necesita llamadas HTTP asíncronas desde SQL, habilitar la extensión en el Dashboard de la nueva BD. Si no, ignorar.
3. **Considerar re-generar los schemas** (`old_schema.sql` / `new_schema.sql`) si se necesita una comparación actualizada que incluya las 25 migraciones post-auditoría.
4. **Git commit** de cambios pendientes para que queden registrados en el historial.
5. **Demo Day** (8 de julio): preparar la presentación del estado de la plataforma y la paridad de bases de datos.
