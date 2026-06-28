---
title: FWD Talent — Marketplace de Proyectos Freelance para Juniors
tipo: brief oficial (fuente de verdad de restricciones, stack e identidad)
version: 1.0
fecha: 2026-05-27
fuente: Marketplace_FWD_Brief.pdf (Fundación Forward Costa Rica)
---

> **Nota de conversión (no parte del brief original).**
> Este archivo es la transcripción a Markdown del PDF oficial `Marketplace_FWD_Brief.pdf`.
> El extractor de texto perdió los acentos del español (se restauraron como corrección
> ortográfica, sin alterar el contenido) y descuadró las tablas multicolumna. Las secciones
> **5.2, 5.4, 5.6.E (status pills), 6.1 y 9.1** se reconstruyeron por orden lógico a partir del
> texto extraído; donde haya cualquier duda, **manda el PDF original**. Los valores de tokens son
> autoritativos en el bloque **§5.5** (que se extrajo completo y sin ambigüedad).

---

Brief técnico y de producto para el proyecto final de graduación + Hackathon de Fundación Forward Costa Rica.

Audiencia: equipos de estudiantes que arrancan este proyecto desde cero. Trátenlo como si los hubieran contratado para sumarse a una plataforma en producción.

Estado: activo desde 2026-05-27. Cualquier cambio se anuncia en el canal del Hackathon antes de tocar este documento.

---

## 0. TL;DR — léelo primero.

- Vamos a construir un **Marketplace** donde empresas publican proyectos cortos (1–12 semanas) y los egresados FWD postulan para tomarlos. Lado "demanda": las empresas publican, los juniors postulan.
- El proyecto se desarrolla durante junio (5 semanas) como proyecto final de graduación, y se pule durante la jornada presencial del Hackathon (29-jun a 8-jul) hasta llegar a un **2.0** presentable a empleadores el Demo Day (8-jul).
- El **stack** es el mismo de FWD Talent: Next.js 15 + TypeScript estricto + Supabase + Tailwind v4 + shadcn/ui + next-intl. **No es negociable** — el proyecto ganador puede ser integrado al producto real (`jobs.fwdcostarica.com`) y para que eso sea posible, el código tiene que poder convivir desde el día 1.
- La **identidad visual** también es no negociable: paleta FWD, tipografías Archivo Narrow + Figtree, tokens FWD, voz "Adelante.". Lo que sí está abierto a creatividad está marcado explícitamente como `[LIBRE]` en cada sección.

---

## 1. Contexto.

### 1.1 Sobre FWD Talent

FWD Talent es la plataforma de empleabilidad de Fundación Forward Costa Rica. Ya está en producción en `jobs.fwdcostarica.com`. Reconocida con el Premio AMCHAM 2025 — Negocios Sostenibles.

- **Usuarios primarios:** egresados del programa FWD (full-stack con IA).
- **Stack actual:** Next.js 15 App Router · TypeScript estricto · Supabase (Postgres + Auth + RLS + Storage) · Tailwind CSS v4 · shadcn/ui · next-intl (es/en) · Anthropic Claude · Google Gemini · Resend (correo) · Playwright (scrapers en Supabase Edge Functions).
- **Filosofía:** mobile primero, lenguaje cálido sin tecnicismos, gamificación mesurada, datos personales con respeto absoluto (Ley 8968 Costa Rica).

Antes de empezar a programar, abrí `jobs.fwdcostarica.com`, navegá toda la app autenticándote con tu cuenta de egresado, y andá tomando notas de qué te gusta y qué te llama la atención. Eso es tu referencia obligada de identidad.

### 1.2 Por qué este proyecto

Cuando se presentó FWD Talent al Director de la Fundación, en el slide de "Fuera del MVP / Fase 2+" estaba escrito:

> 08. Marketplace de proyectos freelance para juniors.

El Director se entusiasmó con esa idea y ahora la convierte en el proyecto final del programa + demo en el Hackathon ante empleadores. La oportunidad real para los equipos:

1. Mostrar a empleadores asistentes al Demo Day algo que se vea de calidad producción.
2. Que el ganador se integre al producto que ya está vivo — su nombre queda asociado al commit del PR.
3. Aprender a integrarse a un proyecto en marcha, no a empezar de cero en un boilerplate. Es la habilidad más valiosa para conseguir el primer trabajo.

### 1.3 Visión del producto en una frase

> Un lugar donde un junior FWD pueda encontrar su primer proyecto pagado real (no Upwork hostil, no LinkedIn frío), curado y de empresas que entienden que está empezando.

---

## 2. Timeline y entregables.

### 2.1 Cronograma

| Tramo | Días | Hito |
|---|---|---|
| Setup | hoy → 8-jun | Repo creado, stack montado, primera pantalla navegable, identidad del equipo decidida |
| Core funcional | 9-jun → 22-jun | Listado, detalle, auth, postulación — un junior puede de punta a punta postular a un proyecto |
| Polish y profesionalización | 23-jun → 28-jun | Tests, README, deploy estable, accesibilidad básica, copy revisado |
| Jornada Hackathon (2.0) | 29-jun → 7-jul | Motion, micro-interacciones, features extra, refinamiento "wow" |
| Demo Day | 8-jul | Pitch de 5 min ante empleadores y jurado |

### 2.2 Entregables por hito

**Al 8-jun (semana 1):**

- Repo público en GitHub con README en español.
- Vercel deploy funcionando (URL pública).
- Stack instalado, tokens FWD configurados, una pantalla "hola mundo" en el lenguaje visual FWD.

**Al 22-jun (semana 3):**

- Auth funcionando con Supabase (Google + GitHub OAuth si querés copiar el patrón de FWD Talent, o solo email magic link como mínimo).
- Listado de proyectos con al menos 10 ejemplos seed.
- Detalle de un proyecto con info completa.
- Flujo de postulación end-to-end (junior hace click "postular" → guarda en DB → empresa lo ve).

**Al 28-jun (semana 4 — MVP final del proyecto académico):**

- Todo lo anterior con tests unitarios mínimos.
- README profesional: cómo arrancar, qué hace cada parte, screenshots, cómo desplegar.
- Cero errores en `npm run typecheck` y `npm run lint`.
- Verificado en mobile (375 px).

**Al 7-jul (jornada Hackathon 2.0):**

- Lo que cada equipo decida como su "X factor" — esto es lo que se evalúa creativamente.
- Sugerencias: animación de carga del feed, drag-to-dismiss de postulaciones, dark mode, búsqueda con autocomplete, badge de "primera contratación", confirmación de match con haptic-feel.

**Al 8-jul (Demo Day):**

- 5 min de presentación: 1 min vision + 3 min walkthrough en vivo + 1 min preguntas.
- Link al deploy. Link al repo. Pitch escrito (1 página) para los empleadores que prefieran leer.

---

## 3. El producto.

### 3.1 Usuarios y roles

Tres roles, igual que en FWD Talent:

1. **Junior egresado FWD** (usuario primario). El que postula a proyectos.
2. **Empresa contratante** (usuario secundario). El que publica proyectos.
3. **Admin FWD** (interno). Modera el contenido y aprueba empresas.

Cada uno tiene sus pantallas. El junior es la estrella — toda decisión de UX prioriza al junior.

### 3.2 Features obligatorias (MVP — al 28-jun)

**Junior egresado**

- Login con OAuth (Google obligatorio; GitHub opcional). Si copiás el patrón de FWD Talent, mejor.
- Listado de proyectos filtrable por: stack, duración, modalidad (remoto/híbrido/presencial), salario.
- Detalle del proyecto con descripción, requisitos, empresa, duración estimada, presupuesto, fechas.
- Postular a un proyecto con: carta corta + link a portfolio o CV. Validación con Zod.
- Mis postulaciones — lista con estado (borrador / enviada / vista / aceptada / rechazada).

**Empresa contratante**

- Onboarding empresa: nombre comercial, descripción, sitio web, logo opcional, cédula jurídica CR.
- Publicar proyecto: título, descripción, stack requerido, duración, presupuesto (USD/CRC), modalidad, fecha de inicio estimada.
- Ver postulaciones recibidas por proyecto, con perfil del junior visible y acciones (aceptar/rechazar/contactar).

**Admin FWD**

- Dashboard mínimo: cantidad de proyectos activos, cantidad de juniors postulando, top empresas por proyectos publicados.
- Aprobar empresas nuevas antes de que puedan publicar (similar a `verification_status` en FWD Talent).
- Moderar proyectos (ocultar uno que no cumple las reglas).

### 3.3 Features deseables (2.0 — pulido en jornada Hackathon)

Esto NO se exige para el MVP, pero se valora fuertemente para el bonus 20%:

- **Match algorítmico:** sugerencias de proyectos según el stack del junior. Pueden usar Gemini API si quieren, o un algoritmo determinístico simple (overlap de tags).
- **Notificaciones:** avisar al junior cuando una empresa ve su postulación, o cuando hay un proyecto nuevo de su stack favorito.
- **Comentarios o chat** entre junior y empresa una vez postuló (cuidado con scope creep — esto es grande).
- **Rating bidireccional** después del proyecto completado.
- **Badges:** "Primera postulación", "Primer proyecto aceptado", "Top contributor del mes".
- **Modo oscuro completo** (la plataforma madre no tiene aún, sería un diferenciador real).
- **Empty states y motion memorables.**

### 3.4 Fuera de alcance (NO hacer)

- **Procesamiento de pagos.** Asumimos pago directo entre empresa y junior por fuera. No hay Stripe, no hay PayPal. Esto evita scope monumental y problemas legales.
- **Contratos firmados digitalmente.** Lo mismo: out of scope.
- **Mensajería en tiempo real (WebSockets).** Salvo que el equipo lo quiera como X factor del 2.0, y aún así se evalúa si tiene sentido.
- **Móvil nativo.** Solo web responsive.

### 3.5 User stories en formato corto

> Como **junior egresado FWD**, quiero ver una lista de proyectos cortos que coincidan con mi stack, para conseguir mi primera experiencia laboral pagada sin tener que pelearme con plataformas frías como Upwork.

> Como **empresa**, quiero publicar un proyecto y recibir solo postulaciones de talento curado y verificado, para evitar el ruido de las plataformas masivas y contratar más rápido.

> Como **admin FWD**, quiero moderar qué empresas pueden publicar, para que la calidad del marketplace no se diluya y los juniors no se topen con scams.

---

## 4. Stack técnico no negociable.

Todo lo que sigue es igual al stack de FWD Talent. Esto es obligatorio para hacer posible una integración futura.

### 4.1 Frontend

- **Next.js 15** con App Router. Server Components por defecto; `'use client'` solo donde haga falta interactividad.
- **TypeScript** en modo `strict: true` con `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes` habilitados.
- **Prohibido `any`.** Si es inevitable, usá `unknown` con type guard explícito.
- **Prohibido `@ts-ignore`/`@ts-expect-error`** sin comentario justificando.

### 4.2 Database y backend

- **Supabase** (cuenta gratis por equipo es suficiente).
- **Postgres con RLS** (Row Level Security) en todas las tablas.
- **Supabase Auth** para login OAuth.
- **Supabase Storage** para logos de empresas, CVs adjuntos, etc.

### 4.3 Estilos

- **Tailwind CSS v4** (sí, v4 — la que usa `@theme inline` en CSS, no v3).
- **shadcn/ui** como base de componentes.
- `@theme inline` con tokens FWD (ver sección 5).

### 4.4 Internacionalización

- **next-intl** para `es` + `en`. Mínimo bilingüe.
- **Cero strings hardcodeados** en componentes — todo va a `messages/es.json` y `messages/en.json`.

### 4.5 Validación

- **Zod en todas las fronteras:** forms, server actions, env vars, respuestas de IA.

### 4.6 Testing

- **Vitest** para unit tests de lógica pura en `lib/`.
- **Playwright** opcional para E2E (recomendado si tienen tiempo).
- Coverage mínimo deseado en `lib/`: 50% (no exigido).

### 4.7 Tooling

- **ESLint + Prettier** configurados desde el día 1.
- **Conventional Commits + commitlint.**
- **Husky** para pre-commit hooks.

### 4.8 Versiones recomendadas

- Node.js 20 LTS o superior.
- Package manager: **npm** (igual que el repo madre).
- Next.js 15.x.
- React 19 (viene con Next 15).

### 4.9 Deploy

- **Vercel** (gratis). Cada equipo configura su deploy.
- URL pública obligatoria.

---

## 5. Identidad visual — CRÍTICO para la integración.

Esta sección es la más larga y la más importante. Cada decisión visual aquí está fijada. Lo que no está fijado se marca `[LIBRE]`.

### 5.1 Paleta oficial (Brand Book FWD — anclaje en hex)

| Token | Hex | Rol |
|---|---|---|
| `--primary` | `#0A6CB9` | Azul FWD · botones, links, acento general |
| `--secondary` | `#662D91` | Púrpura · profundidad, segundo plano, headings dark |
| `--accent` | `#20BEC6` | Teal · success, complemento |
| `--highlight` | `#FFCB05` | Amarillo · destacar palabras, badges, trophy |
| `--warning` | `#F7901E` | Naranja · atención, entrevistas |
| `--magenta` | `#EC008C` | Magenta · momento, error, destructive |

La paleta es multicolor por diseño. Refleja la diversidad del programa FWD. No la reduzcas a "un color + neutro". Reglas tipo "AI purple ban" no aplican: el morado es decisión institucional.

### 5.2 Neutrales (oklch tintados a 245° azul FWD)

> _Tabla reconstruida por orden lógico desde el PDF (la columna "Uso" salió descuadrada). Valores autoritativos en §5.5._

| Token | Light value | Uso |
|---|---|---|
| `--canvas` | `oklch(0.985 0.003 245)` | Fondo página |
| `--surface` | `oklch(1 0 0)` | Cards, contenedores |
| `--surface-sunken` | `oklch(0.97 0.003 245)` | Inputs, tabla headers |
| `--ink-strong` | `oklch(0.18 0.01 245)` | Títulos |
| `--ink` | `oklch(0.30 0.01 245)` | Cuerpo principal |
| `--ink-muted` | `oklch(0.52 0.01 245)` | Texto secundario |
| `--ink-subtle` | `oklch(0.65 0.008 245)` | Captions, placeholders |
| `--border` | `oklch(0.92 0.005 245)` | Bordes default |
| `--border-strong` | `oklch(0.85 0.005 245)` | Bordes destacados |

No usar `#000` ni `#fff` puros. Siempre los tokens tintados.

### 5.3 Tipografía

- **Display / titulares:** Archivo Narrow (Google Fonts — sustituto de Mundial Narrow del Brand Book físico).
- **Cuerpo / UI:** Figtree (Google Fonts).
- **Mono / código:** JetBrains Mono.

Importación: usar `next/font` (no `<link>` ni `@import` en CSS).

Escala canónica:

| Tamaño | Px aprox | Uso |
|---|---|---|
| `text-xs` | 12 | chips, metadata |
| `text-sm` | 14 | UI body |
| `text-base` | 16 | párrafos |
| `text-lg` | 18 | section titles |
| `text-2xl` | 24 | section headers |
| `text-3xl` | 30 | page titles |
| `text-5xl` / `text-6xl` / `text-7xl` | 48–72 | heros brand expresivo |

Pesos disponibles: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold).
Tipografía display: solo Bold y ExtraBold con `tracking-tight` o `tracking-[-0.02em]`.

### 5.4 Motion tokens (no negociables)

> _Tabla reconstruida por orden lógico desde el PDF._

| Token | Valor | Uso |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Apertura general, ease default |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Transiciones bidireccionales |
| `--duration-fast` | `160ms` | Hover, focus, tooltips |
| `--duration-base` | `220ms` | Apertura de overlays, sheets |
| `--duration-slow` | `320ms` | Transiciones deliberadas |

Usar siempre `duration-[var(--duration-fast)] ease-[var(--ease-out)]` en transiciones, no las defaults del browser.

### 5.5 Tokens completos para pegar

Acá está el bloque de tokens FWD listo para pegar en `src/app/globals.css`. Pegalo tal cual al principio del proyecto.

```css
@import 'tailwindcss';

:root {
  /* ---- FWD brand palette (Brand Book -- hex anchored) ---- */
  --primary: #0a6cb9;
  --primary-foreground: #ffffff;
  --secondary: #662d91;
  --secondary-foreground: #ffffff;
  --accent: #20bec6;
  --accent-foreground: #1a1a1a;
  --highlight: #ffcb05;
  --highlight-foreground: #1a1a1a;
  --warning: #f7901e;
  --warning-foreground: #ffffff;
  --magenta: #ec008c;
  --magenta-foreground: #ffffff;
  --success: #20bec6;
  --destructive: oklch(0.577 0.245 27.325);

  /* ---- FWD neutrals (oklch tinted toward 245° azul, chroma ≤ 0.01) ---- */
  --canvas: oklch(0.985 0.003 245);
  --surface: oklch(1 0 0);
  --surface-sunken: oklch(0.97 0.003 245);
  --ink-strong: oklch(0.18 0.01 245);
  --ink: oklch(0.3 0.01 245);
  --ink-muted: oklch(0.52 0.01 245);
  --ink-subtle: oklch(0.65 0.008 245);
  --border: oklch(0.92 0.005 245);
  --border-strong: oklch(0.85 0.005 245);

  /* ---- Motion ---- */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --duration-fast: 160ms;
  --duration-base: 220ms;
  --duration-slow: 320ms;

  /* ---- Shadows (tinted toward 245°) ---- */
  --shadow-soft: 0 1px 2px oklch(0.55 0.16 245 / 0.04), 0 4px 12px oklch(0.55 0.16 245 / 0.06);
  --shadow-elevated: 0 4px 8px oklch(0.55 0.16 245 / 0.06), 0 16px 32px oklch(0.55 0.16 245 / 0.1);

  --radius: 1.25rem;
}

@theme inline {
  --color-background: var(--canvas);
  --color-foreground: var(--ink-strong);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-highlight: var(--highlight);
  --color-highlight-foreground: var(--highlight-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-magenta: var(--magenta);
  --color-magenta-foreground: var(--magenta-foreground);
  --color-success: var(--success);
  --color-destructive: var(--destructive);
  --color-canvas: var(--canvas);
  --color-surface: var(--surface);
  --color-surface-sunken: var(--surface-sunken);
  --color-ink-strong: var(--ink-strong);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-ink-subtle: var(--ink-subtle);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);

  --font-sans: var(--font-figtree), sans-serif;
  --font-body: var(--font-figtree), sans-serif;
  --font-heading: var(--font-archivo-narrow), sans-serif;
}
```

Después se pueden agregar más tokens (variantes propias del marketplace), pero estos no se modifican.

### 5.6 Patrones visuales canónicos

Los siguientes patrones se usan en FWD Talent y deben usarse aquí también para que cualquier pantalla del marketplace se sienta del mismo producto:

**A. `PageTitle` con `tone="brand"`**

Todo top-de-pantalla principal usa el patrón:

- Eyebrow uppercase (`text-xs font-bold tracking-[0.18em] uppercase text-ink-muted`)
- Título display con punto azul firma al final (`<span class="text-primary">.</span>`)
- Descripción opcional debajo

Ejemplo:

```tsx
<header className="space-y-1.5">
  <p className="font-heading text-ink-muted text-xs font-bold tracking-[0.18em] uppercase">
    Proyectos disponibles
  </p>
  <h1 className="font-heading text-foreground text-3xl font-bold tracking-tight md:text-4xl">
    Encontrá tu próximo proyecto<span className="text-primary">.</span>
  </h1>
  <p className="font-body text-foreground/80 max-w-prose">
    Ofertas curadas para juniors recién egresados.
  </p>
</header>
```

El punto azul al final del título es la firma de marca, equivalente al "Adelante." del logo. Úsenlo en cada pantalla principal.

**B. `InsightSection` (wrapper de secciones)**

Patrón usado para agrupar contenido con eyebrow + título + descripción opcional + acción opcional:

```tsx
<section className="border-border bg-surface shadow-soft rounded-2xl border p-5 md:p-6">
  <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
    <div className="min-w-0">
      <p className="font-heading text-ink-muted text-[10px] font-bold tracking-[0.14em] uppercase">
        EYEBROW
      </p>
      <h3 className="font-heading mt-1 text-lg font-extrabold tracking-tight">
        Título de la sección
      </h3>
      <p className="font-body text-ink-muted mt-1 text-sm">Descripción opcional.</p>
    </div>
  </header>
  {/* Contenido de la sección */}
</section>
```

**C. Variants del `Button`**

shadcn/ui Button con variants FWD ya extendidos:

- `default` (azul primary) — CTAs principales
- `secondary` (morado) — acentos
- `accent` (cian) — flujos positivos
- `magenta` — celebración
- `warning` — atención
- `highlight` — acciones de marca expresiva (ej. `bg-highlight text-ink-strong`)
- `outline` — secundarias
- `ghost` — terciarias
- `link` — texto inline

Botones redondeados completos (`rounded-full`) son la firma actual para CTAs principales y pills.

**D. Geometría FWD (paralelogramos fast-forward)**

En pantallas brand expresivas (landing, login, pantallas de celebración, error/verificación), usá esta geometría como decoración de fondo:

```tsx
function FwdGeoBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <polygon points="1200,-100 1350,-100 1500,400 1350,900 1200,900 1350,400" fill="rgba(255,255,255,0.04)" />
      <polygon points="1320,-100 1470,-100 1620,400 1470,900 1320,900 1470,400" fill="rgba(255,255,255,0.07)" />
      <polygon points="1440,-100 1590,-100 1740,400 1590,900 1440,900 1590,400" fill="rgba(255,255,255,0.10)" />
    </svg>
  )
}
```

Posicionalo dentro de un `<main className="bg-secondary relative ...">` y queda flotando a la derecha como en el logo FWD.

**E. Status pills**

> _Tabla reconstruida por orden lógico desde el PDF._

Para mostrar estados (postulación, proyecto, etc.) usá pills tokenizadas:

| Estado | Token | Uso |
|---|---|---|
| success | `bg-success/15 text-success` | Aceptado, completado |
| warning | `bg-warning/15 text-warning` | En revisión, pendiente |
| magenta | `bg-magenta/15 text-magenta` | Rechazado |
| secondary | `bg-secondary/15 text-secondary` | En curso |

### 5.7 Tres registros visuales

FWD Talent usa tres "modos" visuales según el contexto. Tu marketplace tiene que respetar la misma distinción:

| Registro | Cuándo | Estética |
|---|---|---|
| **Brand expresivo** | Landing pública, login, celebración, pantallas vacías "wow" | Fondo morado `bg-secondary` + geometría FWD + display `text-6xl+` + CTAs `highlight` amarillo |
| **Product (candidato/junior)** | App autenticada — listado, detalle, postulaciones | Fondo `bg-canvas` + cards `bg-surface` + tipografía sobria + acentos por sección |
| **Admin** | Panel admin | Sidebar oscuro `oklch(0.18 0.020 270)` + contenido como candidato |

El producto del marketplace (la app autenticada del junior) vive en el registro **product**. Las pantallas de landing pública y Demo Day showcase viven en **brand expresivo**.

### 5.8 Voz y tono

- Cálida, cercana, amigable. Como un amigo con buenos consejos, no como LinkedIn.
- Sin tecnicismos secos. "Tu primer proyecto", no "tu primer engagement freelance".
- Confiada sin gritar. "Postulación enviada", no "¡Felicidades! ¡Postulación enviada!".
- Específica y concreta. "Recibiste 3 postulaciones nuevas", no "explorá tu actividad".
- Bilingüe nativo es/en. Ambos idiomas tienen que sonar igual de naturales, no traducción literal.

**Lo que la voz NO es**

- No es corporate ("equipo de talento human capital").
- No es startup gritada ("Unlock your potential!").
- No es coach motivacional ("Si lo crees, lo creas").
- No es robótica ("Su solicitud ha sido procesada exitosamente").
- No usa emojis en código ni en copy. Las celebraciones se hacen con iconos lucide o SVG geométrico.

### 5.9 Anti-referencias (qué NO queremos parecer)

- **Workana / SoyFreelancer / Freelancer.com:** densos, feos, con copy gritado y plagados de banners. Lo opuesto.
- **Upwork:** ofertas como filas de Excel, ranking competitivo, sensación de carrera de hambre.
- **Toptal:** pretencioso, vibes de "élite". No somos eso, somos para juniors.
- **LinkedIn:** frío, transaccional. Lo opuesto en sensación.
- **Genérico SaaS tech:** pizarras con código verde, gente sonriendo frente a laptops, hero con capa.

### 5.10 Referencias positivas (qué SÍ inspira)

Calibrado con la auditoría del rediseño del producto:

- **Linear** — densidad de información manejada con calma.
- **Stripe Docs** — claridad utilitaria con personalidad.
- **Vercel** — geometría confiada, motion sutil, tipografía protagonista.
- **Apple — Health/Fitness** — registros expresivos brand bien separados de pantallas product.

No copien. Inspírense. La identidad final tiene que ser FWD.

---

## 6. Arquitectura y convenciones de código.

Igual al CLAUDE.md del proyecto madre. Resumen:

### 6.1 Estructura de carpetas

> _Sección reconstruida: en el PDF original los comentarios de cada carpeta salieron desalineados
> al extraer el texto. La jerarquía de carpetas se preserva; ante duda sobre qué comentario
> corresponde a cada carpeta, cotejá con el PDF. Los comentarios sueltos del original eran:
> `# landing, login`, `# app autenticada del junior`, `# listado y detalle`, `# mis postulaciones`,
> `# panel admin (si lo hacen)`, `# primitivos shadcn (Button, Card, Input, etc.)`,
> `# componentes de dominio`, `# ProjectCard, ProjectFilters, etc.`, `# ApplicationRow, StatusPill, etc.`,
> `# LoginButton, etc.`, `# AppHeader, AppFooter, etc.`, `# clientes server + browser, actions`,
> `# lógica pura: fetchProjects, etc.`, `# helpers de formato`, `# JOB_TYPE, WORK_MODE, etc.`,
> `# cn, etc.`, `# un archivo por entidad: project.ts, application.ts`._

```
src/
  app/
    [locale]/
      (public)/             # landing, login
      (app)/                # app autenticada del junior
        marketplace/        # listado y detalle
        applications/       # mis postulaciones
      (admin)/              # panel admin (si lo hacen)
      layout.tsx
  components/
    ui/                     # primitivos shadcn (Button, Card, Input, etc.)
    features/               # componentes de dominio
      marketplace/          # ProjectCard, ProjectFilters, etc.
      applications/         # ApplicationRow, StatusPill, etc.
      auth/                 # LoginButton, etc.
      layout/               # AppHeader, AppFooter, etc.
  lib/
    supabase/               # clientes server + browser, actions
    marketplace/            # lógica pura: fetchProjects, etc.
    i18n/                   # helpers de formato
    constants/              # JOB_TYPE, WORK_MODE, etc.
    utils/                  # cn, etc.
  types/                    # un archivo por entidad: project.ts, application.ts

messages/
  es.json
  en.json
```

### 6.2 Naming

- Archivos: `kebab-case.ts` para utilidades, `PascalCase.tsx` para componentes.
- Carpetas: siempre `kebab-case`.
- Componentes: `PascalCase`. Hooks: `useCamelCase`. Tipos: `PascalCase`. Constantes: `SCREAMING_SNAKE_CASE`.
- Nombres descriptivos completos — prohibido `data`, `info`, `item`, `temp`, `aux`, `stuff` como nombres finales.
- Variables booleanas: prefijo `is`, `has`, `should`, `can`.
- Funciones: verbo + sustantivo (`computeMatchScore`, no `matchScore`).

### 6.3 Anti-basura (qué NO hacer nunca)

- Nada de código muerto. Sin funciones sin usar, sin imports sin usar.
- Nada de `console.log` en producción — usen un logger estructurado (pueden copiar el de FWD Talent: `lib/logger.ts`).
- Nada de TODOs sin ticket — formato `// TODO(issue-N): descripción` o no se aceptan.
- Nada de archivos comentados — git guarda el historial, borren.
- Nada de magic numbers / magic strings. Extraer a constantes con nombre.
- Nada de `.then()` anidados — siempre `async/await`.
- **Nada de `useEffect` como manager de estado — usen server components, react-query, o estado derivado.**
- Nada de estilos inline salvo valores dinámicos calculados.
- Nada de `@ts-ignore` para "hacer que compile" — arreglen el tipo.
- Nada de `try/catch` que silencia errores. Siempre log + decisión.

### 6.4 Error handling

- Toda server action devuelve `Result<T, E>` tipado:

```ts
type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E }

// Ejemplo:
export async function applyToProject(
  projectId: string,
  data: ApplicationInput,
): Promise<Result<{ applicationId: string }>> {
  // ...
  return { ok: true, data: { applicationId: '...' } }
}
```

- Toda llamada externa con timeout explícito.
- Error boundaries en cada layout principal.
- Errores de usuario con copy amigable, nunca stack técnico.

### 6.5 Definition of Done por feature

Una feature está terminada sólo si:

1. TypeScript compila sin errores ni warnings.
2. ESLint pasa sin errores.
3. Tests unitarios para la lógica nueva.
4. Textos en `es.json` y `en.json` — nada hardcoded.
5. Accesibilidad básica: navegable por teclado, contraste correcto, labels en inputs.
6. Mobile verificado en 375 px.
7. Commit limpio con Conventional Commit (`feat:`, `fix:`, `chore:`, etc.).

---

## 7. Schema sugerido (DB).

Esto es sugerencia, no obligación. Sirve como punto de partida. Si querés diseñarlo distinto, hacelo, pero explicalo en el README.

### 7.1 Tablas mínimas

```sql
-- Empresas que publican proyectos
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_id text,                       -- cédula jurídica CR
  website text,
  logo_url text,
  description text,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'approved', 'rejected')),
  created_by uuid references auth.users(id), -- quién la creó
  created_at timestamptz not null default now()
);

-- Proyectos publicados
create table projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  title text not null,
  description text not null,
  stack text[] not null default '{}',  -- ['React', 'TypeScript', 'Supabase']
  duration_weeks integer,              -- 1-52
  work_mode text not null
    check (work_mode in ('remote', 'hybrid', 'onsite')),
  budget_min integer,                  -- en USD/mes o USD total, decidan ustedes
  budget_max integer,
  budget_currency text default 'USD',
  starts_at date,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'closed', 'filled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Postulaciones de juniors
create table applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  cover_letter text not null,
  portfolio_url text,
  status text not null default 'sent'
    check (status in ('draft', 'sent', 'viewed', 'accepted', 'rejected')),
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, user_id)         -- un junior no postula 2 veces al mismo proyecto
);
```

### 7.2 RLS pattern

Toda tabla en `public` necesita RLS habilitado y políticas explícitas. Ejemplos:

- `projects`: lectura pública si `status = 'published'`. Escritura solo si `created_by = auth.uid()` (la empresa) o si es admin.
- `applications`: el junior solo ve las suyas. La empresa ve solo las de sus proyectos. Admin ve todo.

```sql
alter table projects enable row level security;

create policy "anyone can read published projects"
  on projects for select
  using (status = 'published');

create policy "companies can update their own projects"
  on projects for update
  using (created_by = auth.uid());
```

Patrón completo de RLS en el repo madre (`supabase/migrations/`).

### 7.3 Auth flow

- Login con Google (recomendado, igual que FWD Talent).
- Si el equipo decide solo magic link, está bien — pero el flujo de invitar empresas se complica un poco.
- Después del login, decidir rol: ¿es junior? ¿es empresa? ¿es admin? Lo más simple: una tabla `user_roles` o un campo `role` en `auth.users` metadata.

---

## 8. Cómo arrancar — setup técnico.

### 8.1 Prerequisitos

- Node.js 20 LTS o superior.
- Cuenta en GitHub (cada equipo crea su repo).
- Cuenta en Supabase (gratis, 1 por equipo).
- Cuenta en Vercel (gratis, 1 por equipo).

### 8.2 Comandos para arrancar de cero

```bash
# 1. Crear proyecto Next.js 15 con TypeScript + Tailwind v4
npx create-next-app@latest fwd-marketplace --typescript --tailwind --app --src-dir --import-alias "@/*"
cd fwd-marketplace

# 2. Instalar dependencias core
npm install @supabase/supabase-js @supabase/ssr
npm install next-intl
npm install zod
npm install react-hook-form @hookform/resolvers
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge

# 3. Inicializar shadcn/ui
npx shadcn@latest init

# 4. Tooling
npm install -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D vitest @vitejs/plugin-react
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional

# 5. Configurar tsconfig.json con strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes
```

### 8.3 Configurar tokens FWD

1. Reemplazar el `src/app/globals.css` por el bloque de tokens del 5.5 de este brief.
2. Configurar `next/font` con Archivo Narrow + Figtree en `src/app/layout.tsx`:

```tsx
import { Archivo_Narrow, Figtree } from 'next/font/google'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree' })
const archivoNarrow = Archivo_Narrow({ subsets: ['latin'], variable: '--font-archivo-narrow' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${figtree.variable} ${archivoNarrow.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  )
}
```

### 8.4 Primer Hello World

Una pantalla landing con título display + punto azul + un párrafo. Sirve como prueba de que los tokens y fonts están cargando bien:

```tsx
export default function HomePage() {
  return (
    <main className="bg-canvas min-h-[100dvh] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="font-heading text-ink-muted text-xs font-bold tracking-[0.18em] uppercase">
          Marketplace FWD
        </p>
        <h1 className="font-heading text-foreground mt-3 text-5xl font-extrabold tracking-tight">
          Tu primer proyecto<span className="text-primary">.</span>
        </h1>
        <p className="font-body text-ink-muted mt-4 max-w-prose text-lg">
          Encontrá un proyecto corto, pagado, real, y empezá a construir tu carrera de verdad.
        </p>
      </div>
    </main>
  )
}
```

Si el punto azul aparece azul, las fuentes se ven en Archivo Narrow (titular) + Figtree (cuerpo), y el fondo es un blanco cálido tintado, están listos para construir.

---

## 9. Criterios de evaluación.

### 9.1 Rubric MVP (al 28-jun) — 80% del puntaje total

> _Tabla reconstruida por orden lógico desde el PDF (las columnas salieron entrelazadas). Los pesos suman 100%._

| Dimensión | Peso | Qué se evalúa |
|---|---|---|
| **Diseño y consistencia con FWD Talent** | 40% | Paleta correcta, tipografías Archivo Narrow + Figtree, patrones (PageTitle, InsightSection), geometría FWD bien usada, voz "Adelante.", cero emojis. Esto es lo más importante porque define si se puede integrar al producto madre. |
| **UX del flujo principal** | 25% | Un junior puede postular a un proyecto en máximo 4 clicks. Empty states pensados. Mobile a 375 px funciona. Accesibilidad básica. |
| **Calidad técnica** | 20% | `typecheck` y `lint` sin errores. Tests mínimos. Tipado estricto sin `any`. Patrón `Result<T,E>` en server actions. Cero hardcoded strings. |
| **Creatividad / features extra** | 15% | Algo que no esté en el brief y que mejore la experiencia. Bien ejecutado vale más que mucho mal hecho. |

### 9.2 Bonus 2.0 (jornada Hackathon 29-jun a 7-jul) — 20% del puntaje total

Lo que se evalúa en la jornada presencial:

- Motion y micro-interacciones que se sientan intencionales.
- Pulido del lenguaje visual — los detalles compounding.
- Features de "wow" sumadas en esos 10 días.
- Calidad del Demo Day pitch (5 min, claridad, energía, screenshots).

### 9.3 Descalificaciones / penalizaciones obvias

- Plagio de otro equipo o de plataformas existentes (Workana, etc.).
- Hardcoded de strings (cero internacionalización).
- Hardcoded de colores en lugar de tokens.
- Cero tests.
- Cero deploy público.
- Cero responsive.
- Emojis en código o copy (ya saben por qué).
- `any` esparcido por el código sin justificación.

---

## 10. Entregables finales.

Al 8-jul (Demo Day) cada equipo entrega:

1. Repo público en GitHub con README profesional en español:
   - Descripción del producto en 1 párrafo.
   - Stack utilizado.
   - Cómo arrancar en local (`npm install`, `npm run dev`).
   - Variables de entorno necesarias.
   - Screenshots de las pantallas principales.
   - Equipo y roles.
   - Decisiones técnicas no obvias (¿por qué eligieron X?).
2. Deploy en Vercel con URL pública. Tiene que cargar instantáneo.
3. Pitch deck (1 página) — PDF o Notion link. Para los empleadores que prefieren leer.
4. Demo en vivo de 5 min:
   - 1 min: contexto del problema y vision.
   - 3 min: walkthrough del producto en vivo (no video grabado).
   - 1 min: preguntas del jurado.

---

## 11. Recursos.

- Plataforma madre (producción): https://jobs.fwdcostarica.com
- `PRODUCT.md` (vision y voz): pueden pedirle al instructor el archivo para referenciarlo localmente.
- `DESIGN.md` (sistema de diseño completo): mismo canal.
- Brand Book físico FWD: PDF en el canal del Hackathon (paleta oficial con códigos Pantone).
- shadcn/ui docs: https://ui.shadcn.com
- Supabase docs: https://supabase.com/docs
- next-intl docs: https://next-intl.dev
- Tailwind v4 docs: https://tailwindcss.com/docs

---

## 12. Reglas del juego.

### 12.1 Trabajo en equipo

- 3-5 personas por equipo.
- Roles sugeridos: 1 frontend lead, 1 backend/Supabase lead, 1 diseño/UX, 1-2 fullstack.
- Commits firmados por cada miembro. Si solo un miembro commitea, se penaliza al equipo.

### 12.2 IA permitida

- Pueden usar Claude, Cursor, GitHub Copilot, Gemini, lo que prefieran.
- Pero el código tiene que poder explicarlo cualquier miembro del equipo. En la demo el jurado puede preguntar "¿por qué hicieron X?" y la respuesta tiene que ser propia.

### 12.3 Mentores

- El instructor designado del Hackathon disponible en el canal `#marketplace` para preguntas técnicas y de diseño.
- No pidan código completo — pidan dirección, decisiones, criterio. Esa es la habilidad que se evalúa.

### 12.4 Honestidad

- Plagiar UI de otro equipo o de un competidor (Workana, Upwork) descalifica.
- Inspirarse y citar fuente está bien.

---

## 13. FAQ pre-arranque.

**¿Tengo que usar Supabase obligatoriamente?** Sí. Está en el stack no negociable y es lo que usa la plataforma madre.

**¿Puedo usar Prisma en lugar del cliente Supabase nativo?** No. Es un overhead innecesario y rompe la integración futura.

**¿Puedo usar Material UI o Chakra?** No. shadcn/ui está fijado.

**¿Puedo usar Mantine?** No.

**¿Puedo usar otro framework de animación que no sea CSS / tw-animate-css?** Sí. Framer Motion está permitido si lo necesitan para el bonus 2.0. Pero no lo usen "porque sí" — animar con CSS variables y `transition` ya cubre el 90%.

**¿Cómo manejo el deploy de Supabase?** Cada equipo crea su propio Supabase project (gratis). Las migrations las versionan en `supabase/migrations/` en su repo. Para producción Vercel, usar las env vars `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` (esta última solo en server).

**¿Puedo agregar features fuera del brief?** Sí, eso es exactamente el 15% de creatividad. Pero el MVP del brief tiene prioridad — no entregues un proyecto con dark mode hermoso y sin postulaciones funcionando.

**Mi equipo tiene una idea de pivot — ¿podemos cambiar el concepto del marketplace?** Sí, pero solo en lo no-fijado. El producto sigue siendo "marketplace de proyectos para juniors", el stack sigue siendo el mismo, la identidad visual sigue siendo FWD. La idea es que tu pivot mejore la experiencia, no que cambie el problema.

**¿Y si quiero integrar IA (Claude / Gemini)?** Permitido y bienvenido para matching algorítmico, suggestion de pricing al publicar, autocompletar copy de descripción. Pero NUNCA generar postulaciones de juniors automáticamente — eso rompe la confianza con las empresas. El junior siempre escribe su propia carta.

**¿Y si quiero hacer modo oscuro?** Bienvenido en el 2.0. Asegurate que use los mismos tokens FWD invertidos (oklch flipping de lightness, no hardcoded). La plataforma madre todavía no lo tiene — sería un diferenciador real.

---

## Apéndice A — Componente `PageTitle` listo para copiar.

```tsx
import type { ReactNode } from 'react'

interface PageTitleProps {
  title: string
  eyebrow?: string
  description?: string
  action?: ReactNode
  tone?: 'default' | 'brand'
}

export function PageTitle({ title, eyebrow, description, action, tone = 'default' }: PageTitleProps) {
  return (
    <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 space-y-1.5">
        {eyebrow && (
          <p className="font-body text-ink-subtle text-xs font-semibold tracking-[0.16em] uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-heading text-foreground text-3xl font-bold tracking-tight md:text-4xl">
          {title}
          {tone === 'brand' && <span className="text-primary" aria-hidden>.</span>}
        </h1>
        {description && (
          <p className="font-body text-foreground/80 max-w-prose">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}
```

Usalo en cada pantalla principal del marketplace.

---

## Apéndice B — Patrón `Result<T, E>` para server actions.

```ts
// src/lib/result.ts
export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E }

export function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

export function err<E = string>(error: E): Result<never, E> {
  return { ok: false, error }
}

// Uso:
'use server'
import { ok, err, type Result } from '@/lib/result'

export async function applyToProject(
  projectId: string,
  payload: { coverLetter: string; portfolioUrl?: string },
): Promise<Result<{ applicationId: string }>> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('unauthenticated')

  const { data, error } = await supabase
    .from('applications')
    .insert({ project_id: projectId, user_id: user.id, ...payload })
    .select('id')
    .single()

  if (error) return err(error.message)
  return ok({ applicationId: data.id })
}
```

---

## Apéndice C — Inspiración rápida (NO copiar literal).

> _Tabla reconstruida por orden lógico desde el PDF (las celdas salieron entrelazadas); cotejá con el original ante duda._

| Sitio | Qué tomar | Qué NO tomar |
|---|---|---|
| linear.app | Densidad calmada, motion sutil, tipografía protagonista | El neutralismo extremo gris — FWD es multicolor |
| vercel.com | Geometría confiada, hero brand expresivo, color blocking | El AI-purple (no aplica a FWD) |
| stripe.com/docs | Claridad utilitaria, code blocks bien tipografiados | La frialdad enterprise |
| superhuman.com | Onboarding teatral con personalidad | El elitismo — somos accesibles |

---

## Versionado del documento.

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-05-27 | Brief inicial publicado para la cohorte 2026-2 |

Última actualización: 2026-05-27 · Fundación Forward Costa Rica · FWD Talent
