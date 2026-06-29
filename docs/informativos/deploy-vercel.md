# Deploy a Vercel — guía

Estado: el proyecto NO está aún en Vercel. El build de producción pasa local. Esta guía cubre crear el proyecto, las env vars y los pasos post-deploy.

## 0. Pre-requisitos
- Mergear el PR `samir`→`dev` (#43). **La rama de producción en Vercel debe ser `dev`** (es donde vive el código integrado). No pushear directo a `dev`.
- Framework: Next.js 15 (App Router). Vercel lo autodetecta; build `next build`, sin `vercel.json` necesario.

## 1. Crear el proyecto en Vercel (dashboard, lo hace el dueño de la cuenta)
1. Vercel → Add New → Project → importar el repo `ErrolFallas/marketplace_fwd-hackathon`.
2. Framework Preset: **Next.js** (auto). Root Directory: `/` (raíz).
3. **Production Branch:** `dev` (Settings → Git → Production Branch).
4. Cargar las env vars (sección 2) ANTES del primer deploy.

## 2. Variables de entorno (fuente de verdad: `src/lib/env.ts`, `env.server.ts`, `proposal-ai/config.ts`)

**REQUERIDAS** — si faltan, el build/runtime lanza `ENV_INVALID` y no levanta:
| Var | Notas |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (`https://mgowuyflhiavquztxpqh.supabase.co`). Pública. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key. Pública (sometida a RLS). |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role. **Solo servidor**, nunca pública. |

**OPCIONALES** — el build levanta sin ellas, pero la feature degrada:
| Var | Si falta |
|---|---|
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | No se envían correos (RF-46); las notificaciones in-app siguen. App Password de 16 chars (no la contraseña). |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | No funciona la subida de foto de perfil (RF-06). |
| `OPENROUTER_FILTRO_OFERTAS_API_KEY`, `OPENROUTER_FILTRO_OFERTAS_MODEL` | El filtro IA de postulaciones se omite (best-effort). |
| `NEXT_PUBLIC_APP_URL` | URL pública del deploy (p.ej. `https://<app>.vercel.app`). Setearla a la URL de producción. |

**Generador de propuestas (new-project)** — validación lazy; si faltan, esa feature lanza `AI_NOT_CONFIGURED` en runtime (el resto de la app anda):
| Var | Notas |
|---|---|
| `PROPOSAL_AI_API_KEY` | Key de OpenRouter (openrouter.ai). |
| `PROPOSAL_AI_MODEL` | p.ej. `openai/gpt-oss-120b`. |
| `PROPOSAL_AI_BASE_URL` | `https://openrouter.ai/api/v1`. |

(`ANTHROPIC_*` están reservadas/sin uso — omitir.)

## 3. Post-deploy (CRÍTICO para que login/OAuth funcionen en la URL de prod)
- **Supabase → Authentication → URL Configuration → Redirect URLs:** agregar `https://<app>.vercel.app/auth/callback` (y `/auth/confirm` si aplica). Sin esto, OAuth y los enlaces de confirmación de correo rompen en producción.
- Si se usa Google/GitHub OAuth: las callback URLs de esas OAuth Apps apuntan al callback de Supabase (`https://<proyecto>.supabase.co/auth/v1/callback`) — eso no cambia con Vercel; solo hay que sumar la URL de Vercel a las Redirect URLs de Supabase (arriba).

## 4. Caveats conocidos
- **Límite de body de Vercel:** `next.config.ts` tiene `serverActions.bodySizeLimit: '55mb'` para los entregables, pero las serverless functions de Vercel limitan el body del request (~4.5MB, verificar según plan). La subida de entregables grandes (hasta 50MB) por server action **fallaría en prod**. Para soportar archivos grandes habría que subir directo del cliente a Supabase Storage (signed URL) en vez de pasar por la server action. Para la demo, archivos < ~4.5MB andan.
- **Correo de `plazo_vence` (RF-46) — pendiente, depende de esta URL:** una vez con URL pública, falta (a) crear la ruta `POST /api/cron/plazo-vence-correo` (valida `CRON_SECRET`), (b) aplicar la migración `20260628000001_notif_correo_enviado_at` al remoto, (c) agendar el `pg_cron` + `pg_net` que pega a esa ruta. Ver `docs/pendientes/correo-plazo-vence-rf46.md`.

## 5. Verificación post-deploy
- La landing (`/es`) carga (login-only: el anónimo va a `/login`, que debe renderizar).
- Login con email/Google funciona (depende de las Redirect URLs de Supabase del paso 3).
- Build sin `ENV_INVALID` (las 3 Supabase requeridas presentes).
