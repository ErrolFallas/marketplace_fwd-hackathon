# Pendiente: correo de `plazo_vence` (RF-46)

> **Estado (2026-06-28):** diseño cerrado y acordado, **sin escribir el código todavía**.
> La migración de la columna ya está como archivo (sin aplicar). El deploy en Vercel
> **aún no está hecho** — es un pre-requisito de infraestructura para este pendiente.
> Este documento captura el porqué, las decisiones tomadas y los pasos que siguen,
> para retomar la tarea sin perder contexto.

---

## 0. Resumen en una frase

El aviso **in-app** de "tu plazo está por vencer" (RF-33) ya funciona en producción;
falta el **correo** del mismo evento (RF-46, Must), que se enviará con un emisor TS
separado, despertado cada hora por `pg_cron` vía `pg_net` pegándole a una ruta de la app.

---

## 1. Por qué esta tarea

- **RF-46 (Must):** el SRS lista "vencimiento de plazo" como evento que debe avisarse
  **por correo**. Hoy el evento solo tiene canal in-app.
- **RF-33 (Should) + RF-47 (Must):** el aviso in-app ya está **implementado y activo**
  (campana / centro de notificaciones). Ver §2.
- Conclusión: el correo es el **único pendiente** para cerrar el evento `plazo_vence`
  al 100 %.

---

## 2. Estado verificado de lo que YA existe (2026-06-28)

El aviso **in-app** `plazo_vence` está vivo en la BD del equipo. Verificado consultando
la base (no por los docs, que estaban desactualizados):

- Migración `20260621140000_plazo_vence_pg_cron` **aplicada**: existen la función
  `emitir_avisos_plazo_vence()`, la columna `participaciones.plazo_aviso_enviado_at`
  y la config `plazo_aviso_horas = 24`.
- `pg_cron` instalado y el job horario `'0 * * * *'` **corriendo** (`cron.job_run_details`
  mostró corridas `succeeded` cada hora).
- El render i18n de la campana está cableado (`format.ts` → `TIPOS_CON_PLANTILLA`,
  textos `content.plazo_vence` en `es.json`/`en.json`, tono `warning`).
- El umbral es **24 horas** (no días), configurable en `configuracion_sistema.plazo_aviso_horas`.

El **correo** del evento **no existe**: no hay template ni emisor.

> AVISO para quien retome: el MCP de Supabase de la sesión apuntaba a OTRO proyecto
> (`nozshenxibvjriocjdxf`), **no** a la BD del equipo (`mgowuyflhiavquztxpqh`). Para
> verificar el estado real hay que correr SQL en la BD del equipo, no confiar en el MCP.

---

## 3. Decisiones tomadas y por qué

### 3.1. Disparador: `pg_net`, NO Vercel Cron

El correo necesita correr en **Node** (nodemailer no corre en Postgres), disparado por
tiempo. Dos caminos:

- **Vercel Cron** — DESCARTADO. El deploy del proyecto es Vercel (brief §, `reglas.md`),
  pero está en plan **gratuito (Hobby)**, donde el cron corre como máximo **1 vez al día**.
  Para un aviso de "faltan 24 h", un correo diario llegaría cuando el plazo ya venció →
  pierde el sentido de anticipación.
- **`pg_net`** — ELEGIDO. La extensión permite a Postgres hacer llamadas HTTP. El
  `pg_cron` horario llama a una ruta de la app, que envía el correo. Mantiene la
  frecuencia **horaria**, igual que el in-app. `pg_net` ya está **activado** por Samir.

> El diseño con `pg_net` **no depende de Vercel**: la ruta es Next.js puro y corre en
> cualquier hosting con URL pública. Vercel solo importaba para la opción descartada.

### 3.2. No tocar el in-app: emisor de correo SEPARADO

Se descartó "unificar todo en una ruta TS" (que reemplazaría el productor SQL del in-app):
obligaría a desmantelar algo que **ya funciona y está probado en producción**, reintroduce
una superficie HTTP que proteger y revierte la decisión del equipo de que solo SQL escribe
notificaciones. El emisor de correo es una pieza **paralela** que lee las notificaciones
`plazo_vence` que el in-app ya creó. Aislado, reversible, modular.

### 3.3. Idempotencia de correo: columna nueva `notificaciones.correo_enviado_at`

El emisor corre en repetición; sin marca de "ya enviado" reenviaría el mismo correo cada
corrida (spam). Se agrega `notificaciones.correo_enviado_at timestamptz`. No se reusa
`participaciones.plazo_aviso_enviado_at` porque esa marca el **in-app**; son dos canales
distintos. Migración ya creada: `supabase/migrations/20260628000000_notif_correo_enviado_at.sql`
(sin aplicar).

### 3.4. Filtro de frescura, NO backfill

Al encender, todas las notificaciones `plazo_vence` viejas tendrían `correo_enviado_at = NULL`
y recibirían correo retroactivo. En lugar de un backfill manual (frágil, depende de
coordinación), el emisor solo procesa notificaciones con `generada_at` en las **últimas
~26 h**. Auto-protege y, como el cron es horario con ventana de 24 h, nunca pierde una fresca.

### 3.5. "Reclamar" antes de enviar (best-effort, nunca spam)

El emisor marca `correo_enviado_at = now()` **antes** de enviar (claim atómico por fila).
Consecuencia: si Gmail falla para un correo puntual, ese aviso se pierde (se loguea, no se
reintenta) — pero **nunca hay doble correo**. Mismo criterio best-effort del resto del repo;
el in-app ya avisó por la campana.

### 3.6. URL absoluta vía `NEXT_PUBLIC_APP_URL`

El correo necesita un link absoluto. La notificación guarda un path relativo
(`/es/egresado/projects/<id>`); el dominio sale de `NEXT_PUBLIC_APP_URL` (ya declarada en
`src/lib/env.server.ts`, pero **falta** en `.env.local.example` — se documentará).

---

## 4. Arquitectura

```
pg_cron horario (job NUEVO, separado del in-app)
      │  net.http_post  (pg_net, CRON_SECRET en el header Authorization)
      ▼
POST /api/cron/plazo-vence-correo        <- Node: aquí sí corre nodemailer
      │  service_role (createSupabaseAdminClient)
      ├─ lee notificaciones plazo_vence frescas con correo_enviado_at IS NULL
      ├─ reclama cada fila (UPDATE correo_enviado_at = now())
      ├─ resuelve correo + nombre del usuario
      └─ envía con el template plazo-vence.ts
```

El productor SQL del in-app queda **intacto**.

---

## 5. Archivos a crear/editar (código, AÚN no escrito)

| Archivo | Acción | Rol |
|---|---|---|
| `src/lib/email/templates/plazo-vence.ts` | crear | HTML + subject (es-only, layout de marca, `escapeHtml`) |
| `src/lib/notifications/plazo-vence-correo-logic.ts` | crear | Lógica **pura** testeable: validar secret del cron, construir URL absoluta, calcular corte de frescura |
| `tests/unit/plazo-vence-correo-logic.test.ts` | crear | Tests de lo anterior (reglas.md §11.3) |
| `src/lib/notifications/plazo-vence-correo.ts` | crear | Emisor: lee, reclama, resuelve destinatario y envía (service_role, best-effort) |
| `src/app/api/cron/plazo-vence-correo/route.ts` | crear | Route Handler POST: valida `CRON_SECRET` → llama al emisor → JSON |
| `src/lib/env.server.ts` | editar | Agregar `CRON_SECRET` al schema Zod |
| `.env.local.example` | editar | Documentar `CRON_SECRET` y `NEXT_PUBLIC_APP_URL` |

Patrón de referencia para el envío: `src/lib/projects/edit-description.ts`
(`enviarEmailsOferentes`, resolución de destinatario, best-effort) y el template
`src/lib/email/templates/proyecto-modificado.ts`.

---

## 6. Pasos que siguen, en orden y con responsable

1. **(Yo / IA)** Escribir los 7 archivos del §5. No requiere infra.
2. **(Tú / deploy)** Hacer el deploy en Vercel — **PENDIENTE, aún no está**. Es
   pre-requisito: sin URL pública, `pg_net` no tiene a dónde pegar.
3. **(Tú / deploy)** Definir en las env vars del hosting:
   - `CRON_SECRET` (string aleatorio largo).
   - `NEXT_PUBLIC_APP_URL` (la URL pública de la app).
4. **(Samir)** Aplicar la migración de la columna (puede hacerse ya; ver §7).
5. **(Samir)** Guardar el secreto en Vault y agendar el job de `pg_cron` (ver §7) —
   **último interruptor**: hasta aquí no sale ningún correo.
6. Verificar en staging: una notificación `plazo_vence` fresca debe generar un correo
   y sellar `correo_enviado_at`; una segunda corrida no reenvía.

---

## 7. Lo que hace Samir (SQL, verificado contra la doc de Supabase)

### 7.1. Aplicar la migración de la columna (puede ya)

Correr `supabase/migrations/20260628000000_notif_correo_enviado_at.sql` por SQL Editor /
Management API, **de a una** (no `db push` global: hay migraciones pre-staged que un push
activaría sin querer — ver `docs/migraciones-estado-y-tracking.md`). Es inofensiva: solo
agrega la columna, no dispara correos (todavía no hay ruta ni job).

### 7.2. Agendar el job (AL FINAL, tras desplegar la ruta y definir las env vars)

```sql
-- a) Guardar el secreto una sola vez (mismo valor que CRON_SECRET en el hosting)
select vault.create_secret('<CRON_SECRET real>', 'cron_secret_plazo_vence');

-- b) Job horario que despierta al emisor de correo
select cron.schedule(
  'plazo-vence-correo-horario',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://<dominio-publico>/api/cron/plazo-vence-correo',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' ||
        (select decrypted_secret from vault.decrypted_secrets
         where name = 'cron_secret_plazo_vence')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

Notas:
- El `Authorization: Bearer <secret>` es **nuestro** secreto (no la key de Supabase): el
  `http_post` apunta a la app, no a Supabase. La ruta del §5 valida ese header.
- Verificar: `select * from cron.job;` y `cron.job_run_details`.
- Si el job se agenda antes de que la ruta exista, cada corrida da 404 (inofensivo pero ruidoso).

---

## 8. Pre-requisito pendiente: deploy en Vercel

El deploy en Vercel **aún no está hecho** (el `README.md` lo lista como pendiente y no
existe `vercel.json`). Sin una URL pública desplegada, los pasos 3–5 del §6 no se pueden
completar. Cuando se haga el deploy, retomar este pendiente desde el §6.

El diseño no exige Vercel en particular; cualquier hosting con URL pública y env vars sirve.
Vercel es lo que fija el brief / `reglas.md`.

---

## 9. Cumplimiento de `reglas.md`

- **§1 Stack:** `pg_net`/`pg_cron` son extensiones de Postgres (Supabase), no dependencias
  npm nuevas. La ruta es Next.js (App Router). nodemailer ya está en uso.
- **§4 i18n:** los correos del repo son **es-only** (no se guarda el idioma del usuario;
  mismo criterio que `proyecto-modificado.ts`/`admin-invite.ts`). El texto in-app sí es
  bilingüe y ya está cableado.
- **§5 Identidad:** el template reusa el layout de marca de los correos existentes. Los
  correos HTML usan hex de la paleta FWD (los clientes de correo no soportan tokens/CSS
  vars); es la desviación ya establecida en el repo, no una nueva.
- **§6 BD/RLS:** el emisor usa `service_role` (la tabla `notificaciones` no expone INSERT;
  `correo_enviado_at` solo lo escribe el emisor). `SUPABASE_SERVICE_ROLE_KEY` solo en server.
- **§7 Errores:** la ruta y el emisor devuelven resultado tipado / loguean; best-effort
  con log explícito (no silencia).
- **§8 Anti-basura:** sin magic strings (umbral en config; secret en env/Vault); nombres
  verbo+sustantivo.
- **§11 DoD:** compila, lint, **test de la lógica pura nueva**, commit Conventional.

---

## 10. Nota de seguridad (no bloqueante)

La policy `notificaciones_update_own` deja que un usuario actualice sus propias
notificaciones sin restringir columnas, así que técnicamente un egresado podría marcarse
su propio `correo_enviado_at` y auto-saltarse el correo. Es auto-perjudicial e inofensivo
para el sistema. Se deja anotado por si más adelante se quiere endurecer la RLS por columna.

---

## 11. Referencias del repo

- In-app y diseño base de `plazo_vence`: `docs/plazo-vence-pg-cron.md`.
- Arquitectura de notificaciones: `docs/pendientesnotificaciones.md`.
- Migración de la columna (creada, sin aplicar): `supabase/migrations/20260628000000_notif_correo_enviado_at.sql`.
- Patrón de envío de correo: `src/lib/projects/edit-description.ts`,
  `src/lib/email/templates/proyecto-modificado.ts`, `src/lib/email/gmail.ts`.
- Patrón de Route Handler: `src/app/api/geo/subdivisions/route.ts`.
- Env del servidor: `src/lib/env.server.ts`.
- Estado y tracking de migraciones: `docs/migraciones-estado-y-tracking.md`.
