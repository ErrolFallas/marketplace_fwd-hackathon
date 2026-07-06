# Propuesta: sacar los correos propios de spam (migrar de Gmail SMTP a Resend)

Estado: **propuesta / pendiente de aval (Samir + dueño del DNS)**. No implementado.
Fecha: 2026-07-06.

Relacionado: el fix de enlaces `localhost` → URL canónica (`NEXT_PUBLIC_APP_URL`) ya
se hizo; es un problema **distinto** a este. Esto es sobre **entregabilidad** (spam),
no sobre a dónde apunta el link.

---

## 1. El problema, con evidencia

Los correos propios de la app (cuenta verificada, mensaje nuevo, entregables,
evaluaciones, adjudicación, invitación admin, strikes) salen por **Gmail SMTP de
consumidor** (`gmail.ts`, `service: 'gmail'`, `From: FWD Talent
<notificacionesfwdtalent@gmail.com>`). Varios caen a **spam**. Los de Supabase
(reset de contraseña) caen a **principal**.

Comparación de los headers reales (Gmail → "Mostrar original"):

| | Principal (reset, Supabase) | Spam (cuenta verificada, propio) |
|---|---|---|
| `From` | `noreply@mail.app.supabase.io` | `notificacionesfwdtalent@gmail.com` |
| Infra de envío | **Postmark** (ESP transaccional) | **Gmail SMTP de consumidor** |
| DMARC del dominio | `p=REJECT` | `p=NONE` |
| SPF / DKIM / DMARC | pass / pass / pass | pass / pass / pass |
| Higiene ESP (Feedback-ID, loop de quejas) | sí | no |

**Clave:** los dos correos **pasan SPF, DKIM y DMARC**. La autenticación NO es el
diferenciador. Lo que cambia es la **confianza del remitente**:

- `gmail.com` no tiene reputación de envío usable (lo usan miles de millones; DMARC
  `p=NONE`), y Gmail aplica escrutinio extra al correo que dice venir "de gmail.com"
  pero en realidad lo manda una app con plantilla HTML tipo boletín.
- El de Supabase gana porque sale de un **dominio propio con DMARC `p=REJECT` vía una
  infraestructura transaccional calentada (Postmark)**.

**Conclusión:** no se arregla ajustando plantilla, asunto ni links. Hay que **dejar de
enviar desde `@gmail.com` por SMTP de consumidor** y pasar a un dominio propio vía un
ESP transaccional. Es exactamente lo que hace Supabase con sus correos.

---

## 2. Lo que ya está a favor

- **`RESEND_API_KEY` ya existe en `.env.local`** (línea 21). O sea, ya hay cuenta de
  Resend (el ESP transaccional). Solo **no está cableado**: el código sigue mandando
  por Gmail.
- `nodemailer` ya está instalado y puede apuntar a **cualquier** SMTP, incluido el de
  Resend. Eso permite migrar **sin agregar dependencia npm** (importa para `reglas.md`
  §1: nada de deps fuera del brief sin justificar).

---

## 3. El bloqueador real: dominio verificado + DNS

Resend (como cualquier ESP serio) **solo entrega a destinatarios arbitrarios desde un
dominio verificado**. Sin dominio verificado, o mandás desde `onboarding@resend.dev`
(pierde marca y confianza) o no entregás. Por eso el paso que gatilla todo es:

- **¿Qué dominio usamos como remitente?** En el código ya aparece `fwdtalent.com`
  (fallback viejo de strikes) y `reglas.md` menciona el producto vivo
  `jobs.fwdcostarica.com`. Hay que decidir uno y, sobre todo, **tener acceso al DNS
  para poner los registros**. Eso es de Samir / de quien administre ese dominio.
  [Adivinando] no sé si tenemos ese acceso — hay que confirmarlo antes de cualquier
  cosa.

Sin acceso al DNS, este cambio **no avanza**; tuning de plantillas no sustituye esto.

---

## 4. Plan técnico (Path A recomendado: Resend por SMTP, sin dependencia nueva)

1. **Verificar el dominio en Resend** (dashboard de Resend → Domains → Add). Resend
   entrega los registros DNS a poner (ver §5).
2. **Cambiar el transport en `src/lib/email/gmail.ts`** de Gmail a Resend SMTP.
   Datos de Resend SMTP (verificar en la doc actual de Resend, cambian):
   - host: `smtp.resend.com`
   - port: `465` (SSL) o `587` (STARTTLS)
   - user: `resend`
   - pass: `RESEND_API_KEY` (ya en env)
3. **Cambiar el `From`** de `getGmailFrom()` a `FWD Talent <notificaciones@DOMINIO>`,
   donde `DOMINIO` es el verificado. Meter el dominio/from en `env.server.ts` como var
   validada (Zod), no hardcodeado (`reglas.md` §8).
4. **Renombrar el módulo** (opcional, higiene): `gmail.ts` → `email-transport.ts` o
   similar, porque ya no es Gmail. Ajustar imports.
5. **Validar env**: agregar `RESEND_API_KEY` y `EMAIL_FROM`/`EMAIL_DOMAIN` al schema de
   `env.server.ts` (`z.string().min(1)`), para que falle temprano si faltan.

### Alternativa Path B (SDK oficial de Resend)
Instalar el paquete `resend` y usar su API en vez de nodemailer. API más limpia, pero
**agrega dependencia** → requiere justificar/documentar por `reglas.md` §1. Dado que
nodemailer ya cubre SMTP, **Path A es preferible** salvo que se quiera el SDK por otras
features (batching, attachments API, etc.).

---

## 5. Registros DNS necesarios (los da Resend al verificar)

Aproximado — los valores exactos los genera Resend por dominio. Típicamente:

- **SPF** (TXT en el subdominio de envío): incluir el include de Resend.
- **DKIM** (CNAME/TXT): la clave pública que firma. Es lo que da el `dkim=pass`
  alineado al dominio propio.
- **DMARC** (TXT en `_dmarc.DOMINIO`): arrancar en `p=none`, medir con los reportes, y
  subir a `p=quarantine` y luego `p=reject` cuando esté estable. El objetivo es llegar
  a la misma zona de confianza que el `p=REJECT` de Supabase.

Propagación DNS: de minutos a horas. **Verificar en Resend que quede "Verified" antes de
mandar tráfico real.**

---

## 6. Qué NO resuelve

- **Los correos de Supabase Auth** (confirmación, reset, magic link) ya salen por
  Postmark de Supabase y llegan bien; no se tocan acá. Si en algún momento se quiere
  unificar todo bajo el dominio propio, se configura **Custom SMTP en Supabase** (Auth →
  Emails → SMTP) apuntando a Resend — pero eso es un paso aparte y opcional.
- **Reputación fría inicial:** aun con dominio verificado, un dominio nuevo arranca sin
  historial. La entrega mejora a medida que hay volumen legítimo y sin quejas. No es
  instantáneo pero es la base correcta.

---

## 7. Decisiones abiertas (para Samir / equipo)

1. **¿Qué dominio remitente?** (`fwdtalent.com`, `fwdcostarica.com`, otro) y **¿tenemos
   acceso al DNS?** ← gatilla todo.
2. **¿Path A (SMTP, sin dep) o Path B (SDK `resend`, con dep)?** Recomendado A.
3. **¿Migramos también los correos de Supabase a Custom SMTP/Resend**, o los dejamos en
   Postmark? (Los de Supabase ya llegan bien; se puede dejar para después.)

---

## 8. Esfuerzo estimado (aprox, verificar)

- Código (Path A): **chico** — cambiar transport + From + validación env + rename. ~1-2 h.
- DNS + verificación de dominio: **depende de acceso** — 15 min de config, pero puede
  trabarse si el DNS lo administra un tercero.
- Riesgo de código: bajo (mismo `nodemailer`, misma interfaz `sendMail`). Riesgo real
  está en la config externa, no en el código.
