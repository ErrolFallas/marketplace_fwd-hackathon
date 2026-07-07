# Plan: registro en wizard de 3 pasos + tabla `egresados_fwd_oficial` informativa

Estado: **implementado** (typecheck / lint / 663 tests en verde) · pendiente de
prueba manual en el navegador y de commit · Fecha: 2026-07-02

Reestructurar `/register` en un wizard visual de 3 pasos reusando la lógica de
auth existente, unificar los campos de perfil entre el camino correo y el camino
Google, y desacoplar la tabla de egresados de los gates que hoy bloquean.
**Ningún cambio de esquema: cero migraciones de Supabase.**

---

## 1. Objetivo

1. `/register` como **3 pasos visuales** en una **sola página** con estado `step`:
   - **Paso 1** — elegir rol (egresado / empresario).
   - **Paso 2** — método de auth (Google **o** correo+contraseña). Solo credenciales.
   - **Paso 3** — datos de perfil obligatorios. Recién aquí el botón **Registrar**.
2. Que la tabla `egresados_fwd_oficial` sea **solo informativa** (no bloquea
   registro ni verificación del admin).
3. Unificar los campos de persona/empresa entre correo y Google.
4. No romper RF-02 (verificación por correo), que ya funciona.

---

## 2. Estado actual verificado (archivo:línea)

- **RF-02 ya está implementado y operativo** (no hay que tocar `estado_cuenta`):
  trigger `activar_cuenta_al_confirmar_correo()`
  (`supabase/migrations/20260622140000_...:17-40`), gate en `middleware.ts:84`,
  correo propio por Gmail (`actions.ts:519-541`).
- **El registro hoy es una sola página sin pasos**: un `<form>` con todo mezclado
  (`register/page.tsx:261-527`). Usa un único campo `fullName`.
- **Camino correo ya es atómico**: `signUpWithPassword` crea auth + perfil +
  correo al pulsar el botón (`actions.ts:407-551`). Hoy NO pasa `opcionales` a
  `crearPerfilUsuario` (`actions.ts:466`).
- **Camino Google**: usuario creado en el callback, luego `/onboarding`.
  `EgresadoConsentScreen` ya pide título FWD; `EmpresarioOnboardingForm` pide
  nombre/apellidos/fecha-nac/empresa/cédula/tipo/sitio/**país/región/alcance/foto**.
- **`crearPerfilUsuario` ya soporta** escribir país/región (empresarios) y
  nombre/apellidos/fecha-nac/foto (usuarios) vía `opcionales` (`profile.ts:82-109`).
- **Tabla `empresarios`**: solo `tipo_empresario` y `nombre_empresa` son NOT NULL;
  cédula, sitio_web, país, región, alcance son nullable (`initial_schema.sql:214-222`).
- **Gate de allowlist de egresado**: TS puro, lista `['fwd@gmail.com']`
  (`egresado-allowlist.ts:15`). En 3 lugares: `register/page.tsx` (135-145,
  304-342, 521), `signUpWithPassword` (417-419), `completarOnboarding`.
- **Hard-block del admin**: `verificarEgresado` devuelve `egresado_no_encontrado`
  si el correo no está en `egresados_fwd_oficial` (`admin/actions.ts:313-332`).
- **No existe auto-rechazo** por no estar en la tabla (verificado).

---

## 3. Decisiones tomadas

| # | Tema | Elección |
|---|------|----------|
| D1 | Alcance | Cáscara visual: stepper sobre la lógica existente. Sin reescribir auth. |
| D2 | Gates de la tabla | Quitar ambos (registro abierto + admin verifica a cualquiera). Tabla = referencia. |
| D3 | Google en el wizard | Mantener Google; `/onboarding` es su "paso 3". |
| D4 | Estructura | Una sola página con estado `step`. |
| D5 | Reparto | Paso 2 solo credenciales; nombre, campos por rol y consentimientos al paso 3. |
| D6 | Nombre de persona | Desglosar `fullName` en **nombre + primer apellido + segundo apellido (opcional)** para **ambos roles** en el registro por correo. |
| D7 | Empresario — sede | Conservar **país y región** en ambos caminos; **quitar alcance operativo y foto** del alta (se editan luego). |
| D8 | Empresario — fecha nac | Pedir **fecha de nacimiento (18+)** en ambos caminos. |
| D9 | Huérfano OAuth | Fuera de alcance; lo barre el cron existente. |

---

## 4. Correcciones honestas (para que no sorprendan)

- **"Ya no se crean usuarios sin rol" es solo a medias.** Correo: cierto (atómico).
  Google: el usuario nace en `auth.users` en el callback con `id_rol` NULL hasta
  completar `/onboarding`; si abandona, queda huérfano. El "rol primero" (cookie)
  no lo evita; lo mitiga el cron. Eliminarlo de verdad = trabajo aparte (D9).
- **El correo RF-02 se envía al pulsar Registrar** (correo), no antes: el usuario
  no existe hasta ese momento. Ya es así.
- **"Nada a Supabase hasta Registrar" es imposible para Google** (nace en el
  callback). Se acepta la asimetría y se oculta (Google ve "Completar registro"
  en `/onboarding` como paso 3).

---

## 4b. Ciclo de vida de `estado_cuenta` (NO cambia con este plan)

Los cambios del registro **no tocan `estado_cuenta`**. RF-02 ya está cubierto y
sigue igual. Se documenta aquí para dejarlo registrado.

`estado_cuenta` (`usuarios`) es enum `pendiente | activa | suspendida |
suspendida_severa`, default `pendiente` (`initial_schema.sql:82,155`). **No existe
valor "aprobado"**: el equivalente es `activa`.

Transiciones (ninguna la maneja el registro):

```
[nace] --> pendiente --(confirma correo)--> activa
                                              |
                              (strikes admin) v
                                       suspendida / suspendida_severa
                                              |
                                (reactivación) v
                                            activa
```

- `pendiente → activa`: trigger `activar_cuenta_al_confirmar_correo()` cuando
  Supabase marca `email_confirmed_at` (`migrations/20260622140000_...:26-29`).
  Automático, sin botón.
- `activa → suspendida(_severa)`: `addStrike()` (`strike-actions.ts:104-111`).
- `suspendida → activa`: `reactivarUsuario()`, solo admin (`actions.ts:290-293`).

Por camino, tras los cambios:
- **Correo**: al pulsar Registrar la cuenta nace `pendiente`; el middleware la
  retiene en `/verify-email` hasta confirmar; al confirmar pasa a `activa`.
- **Google**: nace ya con `email_confirmed_at` (el proveedor confirma), el trigger
  la pasa a `activa` casi de inmediato (salta `pendiente` en la práctica).

### Dos ejes independientes (no confundir)

| Campo | Tabla | Significa | Requerimiento |
|---|---|---|---|
| `estado_cuenta` | `usuarios` | ¿Confirmó correo? ¿Puede entrar? | RF-02 (+ RF-65 suspensión) |
| `estado_verificacion` | `estudiantes`/`empresarios` | ¿El admin lo validó? | RF-64 / RF-17 |

Un usuario puede estar `estado_cuenta='activa'` y a la vez
`estado_verificacion='pendiente'` → el middleware lo manda a `/pending-approval`.
Confirmar el correo **no** es ser verificado por el admin. Este plan **no toca**
`estado_cuenta`; **sí** ajusta la lógica de `estado_verificacion` (quita el
auto-bloqueo para que la validación sea 100% manual del admin).

---

## 5. Campos por rol y camino (estado final)

### Paso 1 — Rol (ambos caminos)
`RoleSelector`.

### Paso 2 — Autenticación (solo credenciales)
- OAuth (Google/GitHub) → va a `/onboarding` = paso 3.
- Correo: `email`, `password`, `confirmPassword`. Botón "Continuar".

### Paso 3 — Perfil

**Persona (ambos roles, ambos caminos):**
`nombre` (req) · `primer apellido` (req) · `segundo apellido` (opcional).

**Egresado (adicional):**
`título FWD` (req) · acepta términos (req) · acepta cotejo (req).

**Empresario (adicional):**
`fecha de nacimiento` (req, 18+) · `nombre_empresa` (req) · `cédula` (req) ·
`tipo_empresario` (req) · `sitio_web` (opcional) · `país` (req) · `región` (req) ·
acepta términos (req).

> **Ya NO se piden en el alta:** `alcance_operativo` y `foto de perfil` (quedan
> null; el empresario los edita luego en su perfil).

### Correspondencia con el camino Google
- Egresado (`EgresadoConsentScreen`): sin cambios (título FWD + consentimientos;
  el nombre viene del proveedor — ver P5).
- Empresario (`EmpresarioOnboardingForm`): **quitar** alcance y foto; mantener el
  resto (ya pide nombre/apellidos/fecha-nac/empresa/cédula/tipo/sitio/país/región).

> **Guardarraíl:** el submit del camino correo sigue siendo **una sola llamada
> atómica** a `signUpWithPassword` al final del paso 3 (no partir auth/perfil,
> para no reintroducir el bug de "correo ya existe", hoy cubierto en
> `actions.ts:431-439`).

---

## 6. Cambios concretos (todo TypeScript/UI, sin migración)

1. `src/app/[locale]/(public)/register/page.tsx`
   - Estado `step` (1|2|3) + navegación (Continuar / Atrás / indicador "Paso X de 3").
   - Repartir campos por paso (sección 5). Reemplazar `fullName` por
     nombre/primer/segundo apellido. Empresario: agregar fecha-nac, país, región.
   - Quitar el gate de allowlist: bloque `isEgresadoEmailInvalid` (135-145,
     304-342) y el `disabled` (521).
   - Validación por paso: 2→3 valida solo credenciales; submit final valida el
     schema completo del rol.
   - **Punto técnico:** los selectores de país/región (`CountryRegionFields`)
     necesitan el catálogo de países. Hoy lo inyecta el server component del
     onboarding. Resolver una de: (a) envolver `/register` en un server component
     que pase `countries` a un client `RegisterWizard`; (b) importar el catálogo
     si `@/lib/geo/catalog` es client-safe. → decidir al implementar (P6).
2. `src/lib/auth/schemas.ts`
   - `signUpBaseShape`: quitar `fullName`; agregar `nombre`, `primerApellido`,
     `segundoApellido?`.
   - `SignUpSchema` empresario: agregar `fechaNacimiento` (regex + `tieneAlMenos18`),
     `pais`, `region`.
   - `OnboardingSchema` empresario: quitar `alcanceOperativo` y `fotoPerfilUrl`.
3. `src/lib/auth/actions.ts`
   - `signUpWithPassword`: quitar el gate (417-419); pasar `opcionales`
     (nombre/apellidos + empresario: fecha-nac/país/región) a `crearPerfilUsuario`;
     ajustar el `full_name` del metadata y el saludo del correo (usar nombre +
     apellidos en vez de `fullName`).
   - `completarOnboarding`: quitar el gate; ajustar al `OnboardingSchema` nuevo.
4. `src/lib/auth/profile.ts` — revisar; probablemente **sin cambios** (ya escribe
   país/región y nombre/apellidos/fecha-nac vía `opcionales`).
5. `src/components/features/auth/EmpresarioOnboardingForm.tsx` — quitar campos de
   alcance operativo y foto de perfil (y su subida a storage).
6. `src/lib/admin/actions.ts` — `verificarEgresado`: dejar de devolver
   `egresado_no_encontrado` como bloqueo; la consulta a la tabla se conserva solo
   como dato.
7. `admin/validations` / `GraduateVerificationActions.tsx` — señal de solo lectura
   "aparece / no aparece en el padrón FWD" (P4: mostrar siempre, como dato neutro).
8. `src/lib/auth/egresado-allowlist.ts` — si queda sin usos, eliminar (código
   muerto). Verificar antes de borrar (P3).
9. `messages/es.json` + `messages/en.json` — textos del stepper y de los campos
   nuevos. Cero hardcode.

---

## 7. Lo que NO se toca
`middleware.ts`, triggers (`handle_new_user`, activación de correo), la creación
de auth en `signUpWithPassword` (solo se le quita el gate y se le pasan
opcionales), RLS y esquema. **Sin migración.**

---

## 8. Riesgos

- `[Seguro]` Quitar el gate de registro de egresado abre el alta a cualquier
  correo; el admin filtra más volumen (es la intención: validación 100% manual).
- `[Seguro]` Traer país/región al wizard de correo agrega complejidad real (P6):
  hay que resolver de dónde sale el catálogo de países en cliente.
- `[Probable]` Quitar `alcance_operativo` del alta: verificar que `admin/queries`,
  `company/actions` y las vistas manejen `null` (es nullable, deberían).
- `[Seguro]` El wizard con estado local pierde datos si se recarga en el paso 2/3
  del camino correo. Aceptable; si molesta, persistir en `sessionStorage` (no por
  defecto).
- `[Probable]` Egresado por Google: el nombre sigue saliendo del parsing del
  trigger sobre el `full_name` de Google (frágil). Ver P5.
- `[Probable]` Si FWD entrega el padrón real, habrá que re-introducir cotejo. La
  consulta a la tabla se conserva lista para reusar.

---

## 9. Cumplimiento `reglas.md` / DoD
Strings a `es.json`+`en.json` (cero hardcode) · tokens FWD, punto azul, sin
emojis · server actions `Result<T,E>` · `npm run typecheck` + `npm run lint` en
verde · verificado en 375 px.

---

## 10. Orden de implementación
1. `schemas.ts` (fuente de verdad de los campos).
2. `register/page.tsx` en 3 pasos + campos nuevos + resolver catálogo de países (P6).
3. Quitar gates de allowlist (register + 2 actions) y limpiar muertos.
4. `EmpresarioOnboardingForm` (quitar alcance/foto) + `completarOnboarding`.
5. `verificarEgresado` (sin bloqueo) + señal informativa en admin.
6. Textos i18n (es/en).
7. `typecheck` + `lint` + prueba manual (correo y Google, egresado y empresario) en 375 px.

---

## 11. Preguntas abiertas / decisiones con default

- **P3** — ¿Borrar `egresado-allowlist.ts` por completo, o conservar
  `normalizeEmailForAllowlist`? *Default: borrar si queda sin usos.*
- **P4** — Señal del padrón en admin: *Default: mostrar siempre (aparece / no
  aparece) como dato neutro, sin sugerir automatización.*
- **P5** — Egresado por Google: ¿capturar nombre/apellidos en `EgresadoConsentScreen`
  para no depender del parsing del trigger? *Default: no tocarlo (nombre del
  proveedor); mejora opcional futura.*
- **P6** — Catálogo de países en el wizard de correo: *Default a decidir al
  implementar: preferir envolver `/register` en server component que pase
  `countries`, salvo que el catálogo sea client-safe.*
