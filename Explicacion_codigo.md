# Explicación del código — FWD Marketplace

> Guía para entender qué es esta plataforma y cómo está construida, escrita como un
> profesor le explica a un estudiante que recién empieza. Está en **dos niveles**:
>
> - **Parte 1** te explica de qué va todo, en palabras sencillas y sin tecnicismos.
>   Si nunca programaste, con esta parte te alcanza para entender el producto.
> - **Parte 2** es el apéndice técnico: entra al "cómo está hecho por dentro". Léela
>   cuando quieras profundizar. Cada sección se puede leer suelta.
>
> Al final hay un **glosario** con cada palabra rara explicada en una línea.

---

## Índice

**Parte 1 — Para entender de qué va (sin jerga)**
1. [Qué problema resuelve](#1-qué-problema-resuelve)
2. [Los tres actores](#2-los-tres-actores)
3. [El viaje completo de un proyecto](#3-el-viaje-completo-de-un-proyecto)
4. [La inteligencia artificial, en simple](#4-la-inteligencia-artificial-en-simple)
5. [Por qué es un buen producto](#5-por-qué-es-un-buen-producto)

**Parte 2 — Cómo está hecho por dentro (apéndice técnico)**
6. [El stack: qué es cada pieza y por qué](#6-el-stack-qué-es-cada-pieza-y-por-qué)
7. [Mapa del código: dónde vive cada cosa](#7-mapa-del-código-dónde-vive-cada-cosa)
8. [El portero: sesión, correo, cuenta y rol](#8-el-portero-sesión-correo-cuenta-y-rol)
9. [Los patrones que se repiten](#9-los-patrones-que-se-repiten)
10. [Las tres IAs, a detalle](#10-las-tres-ias-a-detalle)
11. [Las automatizaciones invisibles](#11-las-automatizaciones-invisibles)
12. [Seguridad: por qué la verdad vive en la base de datos](#12-seguridad-por-qué-la-verdad-vive-en-la-base-de-datos)
13. [Identidad visual e idiomas](#13-identidad-visual-e-idiomas)
14. [Estado real y pendientes](#14-estado-real-y-pendientes)
15. [Glosario](#15-glosario)

---

# Parte 1 — Para entender de qué va

## 1. Qué problema resuelve

FWD Costa Rica es un programa que forma programadores. Cuando esos estudiantes se
gradúan (los llamamos **egresados**), necesitan algo difícil de conseguir el primer
día: **experiencia real**. Y muchas empresas pequeñas necesitan lo contrario:
alguien que les haga un **proyecto corto de software** sin contratar a nadie de planta.

**FWD Marketplace es el puente entre esas dos necesidades.** Es una plataforma web
(una página que se usa desde el navegador) donde:

- Las **empresas publican proyectos cortos** de 1 a 12 semanas ("necesito una app de
  reservas para mi soda", "quiero un sitio para mi tienda").
- Los **egresados se postulan** para tomar esos proyectos, muestran lo que saben, y
  si los eligen, los realizan.
- Un **administrador de FWD** vigila que todo funcione con reglas justas.

Piénsalo como un "mercado de trabajos por proyecto", pero hecho a la medida del
programa FWD: cuidado, en español e inglés, con reglas claras y con ayuda de
inteligencia artificial en los momentos clave. Fue el proyecto final del programa y
la entrega del Demo Day del Hackathon FWD 2026.

> **En una frase:** empresas publican trabajos cortos, egresados los toman, y la
> plataforma se encarga de que el proceso sea ordenado, justo y seguro.

## 2. Los tres actores

Toda la plataforma gira alrededor de **tres tipos de usuario**, y cada uno ve una
"puerta" distinta al entrar:

| Actor | Quién es | Qué hace |
|---|---|---|
| **Egresado** | El graduado de FWD que busca proyectos | Explora el marketplace, se postula, entrega el trabajo, califica a la empresa |
| **Empresario** | La empresa que necesita el trabajo | Publica proyectos, revisa postulaciones, elige a quién contratar, califica al egresado |
| **Administrador** | El personal de FWD que supervisa | Aprueba cuentas, revisa denuncias, aplica sanciones, gestiona catálogos y reportes |

Un detalle importante: **un usuario tiene un solo rol**, y la plataforma lo lleva
automáticamente a "su" área. El egresado nunca ve el panel de la empresa, y viceversa.
Esa separación no es solo visual: está protegida por varias capas de seguridad que
veremos en la Parte 2.

> **Analogía:** es como un edificio con tres pisos. Tu credencial abre solo tu piso.
> Aunque te equivoques de botón en el ascensor, el sistema te devuelve al tuyo.

## 3. El viaje completo de un proyecto

Esta es la historia central de la plataforma, contada de principio a fin. Sigue el
recorrido y entenderás el 80% del producto.

**Paso 1 — La empresa tiene una idea.**
El empresario entra a "publicar proyecto". Pero en vez de pedirle que llene un
formulario técnico complicado (que quizá no sepa llenar), la plataforma le pone a
**conversar con una IA**. Él escribe en lenguaje normal ("quiero un sistema para
controlar el inventario de mi pulpería"), y la IA le hace preguntas, decide lo
técnico por él y arma una **propuesta ordenada**: título, descripción, qué debe hacer
el sistema, qué tecnologías usar. La empresa la revisa y, si le gusta, la publica.

**Paso 2 — El proyecto aparece en el marketplace.**
Ahora el proyecto es visible para los egresados en una especie de "vitrina". Cada uno
puede abrirlo, ver de qué se trata, y decidir si se postula.

**Paso 3 — El egresado se postula (con "sobre cerrado").**
Aquí está una de las ideas más elegantes del producto. El egresado prepara su
postulación: cómo resolvería el problema, una carta, y enlaces a su prototipo o
repositorio. Antes de enviar puede pedir que un **revisor de IA** le dé consejos para
mejorarla (opcional, es solo un consejero). También hay un chequeo automático de que
el enlace que pega sea seguro y esté vivo.

Cuando envía, su postulación llega a la empresa **dentro de un sobre cerrado**: la
empresa ve quién postuló, su reputación y su título, y ve si adjuntó prototipo o no
(un simple "sí/no"), **pero no puede leer todavía** la propuesta ni la carta.

> **Analogía:** imagina un concurso donde los sobres llegan sellados. El jurado ve el
> nombre y sabe que hay algo adentro, pero no lo abre hasta que decide sentarse a
> evaluarlo. Eso evita que se descarte a alguien "de un vistazo" sin leerlo en serio.

**Paso 4 — La empresa abre los sobres y elige.**
Cuando la empresa decide revisar una postulación, "abre el sobre": recién ahí se le
revela el contenido completo. Puede abrir varios, compararlos, y finalmente
**adjudicar** (elegir al ganador). Ese momento es un solo paso "todo o nada": el
ganador queda contratado, los demás quedan como no seleccionados, y el proyecto pasa
a estar en desarrollo. Todo se hace junto para que nunca quede a medias.

**Paso 5 — Se hace el trabajo (entregables).**
El egresado contratado empieza a trabajar y va subiendo **entregables** (las partes
del trabajo terminado). La empresa los revisa y aprueba. Cuando el proyecto está
completo, se marca como **finalizado**.

**Paso 6 — Se califican mutuamente (evaluación bidireccional).**
Con el proyecto ya finalizado —y solo entonces— la empresa califica al egresado y el
egresado califica a la empresa. Cada calificación alimenta la **reputación** de la
otra parte, que quedará visible para futuros proyectos. Es de doble vía: los dos lados
se evalúan, no solo uno.

**Durante todo el viaje, en segundo plano:**
- Cada hito importante dispara **notificaciones** dentro de la plataforma y a veces un
  **correo** (por ejemplo, "fuiste seleccionado").
- Un **moderador de IA** lee automáticamente los textos que la gente escribe (cartas,
  mensajes, comentarios) buscando lenguaje ofensivo, y si detecta algo le **avisa a un
  administrador humano** para que decida. La IA nunca castiga sola.
- Si alguien se comporta mal, un administrador puede darle un **strike** (una
  amonestación). Al acumular strikes, la cuenta se suspende o se expulsa.

## 4. La inteligencia artificial, en simple

Mucha gente asume que "IA en una app" significa un chatbot que hace todo. Aquí es más
inteligente que eso: hay **tres IAs distintas**, cada una con un trabajo específico y
límites claros. (El README oficial menciona solo dos; en realidad son tres.)

**IA #1 — La que ayuda a crear el proyecto (asistente de propuestas).**
Es la que conversa con el empresario para convertir una idea vaga en una propuesta
estructurada. Piensa en ella como un **consultor** que sabe traducir "quiero algo para
mi negocio" en un plan técnico. Lo que **no** hace: no inventa tecnologías que no
existan en el catálogo de la plataforma, y no publica el proyecto sola (la empresa
tiene la última palabra).

**IA #2 — La que aconseja al egresado (revisor de postulaciones).**
Cuando el egresado prepara su postulación, esta IA lee su texto y le dice si está bien
enfocado y cómo mejorarlo. Es un **mentor**, no un portero: **nunca bloquea el envío**
ni decide a quién se contrata. Si la IA se cae o está apagada, la postulación se envía
igual. Aparte de la IA, hay un chequeo **automático y sin IA** que sí bloquea: verifica
que el enlace del prototipo sea seguro (que no apunte a sitios peligrosos) y que esté
vivo.

**IA #3 — La que cuida la convivencia (moderador).**
Lee en segundo plano los textos que la gente publica y detecta ataques personales,
spam o fraude. Su regla de oro es fina: **criticar el trabajo de alguien es válido**
(aunque sea duro); **atacar a la persona no lo es**. Cuando detecta algo, no sanciona:
**le sugiere una acción a un administrador humano**, que decide. Y es cautelosa a
propósito: ante la duda, prefiere no acusar.

> **La idea de fondo:** la IA en esta plataforma **asiste y sugiere**, pero las
> decisiones importantes (a quién contratar, a quién sancionar) las toma siempre una
> **persona**. Eso es una decisión de diseño deliberada y correcta.

Las tres funcionan con un servicio externo de IA (OpenRouter) y cada una tiene su
propia "llave" y su propio modelo, para que se puedan cambiar por separado. Todas
validan lo que la IA responde antes de confiar en ello (por si la IA "alucina" o
responde raro), y todas tienen un **interruptor de apagado** por si hay que desactivarlas
sin tocar el código.

## 5. Por qué es un buen producto

Estos son los puntos donde el proyecto está especialmente bien pensado, explicados sin
tecnicismos:

- **El "sobre cerrado" es de verdad, no un truco visual.** El contenido de una
  postulación sin abrir **ni siquiera sale del servidor** hacia la empresa. No es que
  se "esconda" en la pantalla: es que no se entrega. Eso es privacidad real.

- **Las decisiones críticas son atómicas.** Cuando la empresa elige un ganador, todo
  ocurre junto y sin pasos a medias: si algo fallara, nada queda inconsistente.

- **La IA nunca tiene la última palabra sobre las personas.** Sugiere, pero un humano
  decide a quién contratar y a quién sancionar. Esto es responsable legal y éticamente.

- **La reputación distingue "nuevo" de "malo".** Un usuario sin calificaciones no
  aparece con nota cero (que parecería malo): aparece como "sin calificaciones todavía".
  Un detalle pequeño que evita ser injusto con los nuevos.

- **Bilingüe de verdad (español e inglés).** No hay textos "pegados" en el código: todo
  vive en archivos de traducción, y ambos idiomas suenan naturales.

- **Pensado para equivocarse sin romperse.** Si la IA se cae, si un correo no sale, si
  el proveedor externo falla: la plataforma degrada con gracia y sigue funcionando en
  lugar de reventar.

- **Seguridad en capas.** Como veremos en la Parte 2, cada regla importante está
  protegida en varios niveles a la vez, de modo que si una capa falla, otra la respalda.

---

# Parte 2 — Cómo está hecho por dentro

> A partir de aquí entramos al terreno técnico, pero seguiré explicando cada término la
> primera vez que aparezca. Si algo se pone denso, salta al [glosario](#15-glosario).

## 6. El stack: qué es cada pieza y por qué

"Stack" es simplemente el conjunto de herramientas con las que está construida la app.
Estas herramientas **no son opcionales**: vienen fijadas por el brief oficial de FWD
(está en `reglas.md`) porque el código tiene que poder convivir algún día con el
producto real de FWD Talent. Las principales:

- **Next.js 15 + React 19** — El framework con el que se construye la interfaz y las
  páginas. React es la librería para armar pantallas por piezas ("componentes");
  Next.js las organiza en rutas y decide qué se calcula en el servidor y qué en el
  navegador. Por defecto, casi todo se calcula en el **servidor** (más rápido y
  seguro), y solo las partes que necesitan interactividad corren en el navegador.

- **TypeScript** — Es JavaScript (el lenguaje de la web) pero con **tipos**: le dices
  al código qué forma tienen los datos, y la computadora te avisa de errores antes de
  ejecutar. Aquí está configurado en modo estricto, o sea, muy exigente. Está
  **prohibido** usar el "comodín" `any` que apaga esas comprobaciones.

- **Supabase** — La base de datos y el sistema de cuentas. Por dentro es **PostgreSQL**
  (una base de datos muy robusta). Supabase le agrega: manejo de usuarios/login,
  **RLS** (reglas de seguridad por fila, clave en este proyecto — ver sección 12), y
  almacenamiento de archivos.

- **Tailwind CSS v4 + shadcn/ui** — Las herramientas para el diseño visual. Tailwind
  da los estilos; shadcn/ui da componentes base (botones, ventanas, menús) listos para
  personalizar.

- **next-intl** — El sistema de idiomas (español e inglés).

- **Zod** — Un "validador": revisa que los datos que entran (formularios, respuestas de
  IA, variables de configuración) tengan la forma correcta antes de usarlos. Es la
  primera línea de defensa contra datos malos.

- **Vitest** — La herramienta de **pruebas automáticas** (tests): pequeños programas que
  verifican que la lógica del código haga lo que debe.

- **Vercel** — Donde se publica la app para que esté en internet.

Y algunas piezas fuera del brief, justificadas: **`openai`** (el cliente para hablar
con las IAs, apuntado a OpenRouter), **`nodemailer`** (para enviar correos por Gmail) y
**`cloudinary`** (para alojar la foto de perfil).

**Tamaño real del proyecto** (para que dimensiones): unos **424 archivos** de código,
**72 archivos de pruebas**, **102 migraciones** de base de datos, y dos archivos de
traducción de ~120 KB cada uno con unas 33 secciones. (Ojo: el README dice "~70
migraciones"; el número real hoy es 102. La documentación quedó un poco atrás del código.)

## 7. Mapa del código: dónde vive cada cosa

El código está organizado con una lógica clara. Estas son las carpetas que importan:

```
src/
  app/              Las páginas y rutas (lo que el usuario ve en cada URL)
    [locale]/       Todo cuelga del idioma: /es/... o /en/...
      (public)/     Páginas abiertas: login, registro, recuperar contraseña
      (app)/        Área del EGRESADO   (ojo: el nombre "(app)" engaña)
      (company)/    Área del EMPRESARIO  (el nombre "(company)")
      (admin)/      Área del ADMINISTRADOR
  components/       Las piezas visuales reutilizables (botones, tarjetas, etc.)
  lib/              El cerebro: la lógica de negocio, organizada por tema
  middleware.ts     El "portero" que revisa cada visita (ver sección 8)
  i18n/, types/     Configuración de idiomas y definiciones de datos
messages/           Los textos en español (es.json) e inglés (en.json)
supabase/migrations/  Las 102 "migraciones": la historia de la base de datos
tests/              Pruebas automáticas
```

**Una trampa de nombres que hay que memorizar:** las carpetas entre paréntesis como
`(app)` o `(company)` **no aparecen en la dirección web** y **no coinciden con el rol
por su nombre**. `(app)` es el área del **egresado**, `(company)` la del **empresario**,
`(admin)` la del **admin**. Es la confusión número uno para quien llega nuevo.

**La carpeta `lib/` está organizada por tema, no por tipo de archivo.** Cada tema
(llamado "dominio") tiene su propia carpeta: `auth` (cuentas), `projects` (proyectos),
`applications` (postulaciones), `deliverables` (entregables), `evaluaciones`,
`moderation` (denuncias), `notifications`, `email`, `mensajes`, `ranking`, `geo`
(países/regiones), `portfolio`, `invitaciones`, y las tres IAs (`proposal-ai`,
`ai-filtro-ofertas`, `moderador-ai`). Dentro de cada dominio se repite el mismo patrón:

- `actions.ts` — las acciones que **cambian** datos (crear, editar, borrar).
- `queries.ts` — las **lecturas** de datos (consultar, listar).
- `*-logic.ts` — la lógica **pura**: cálculos que no tocan la base de datos ni internet,
  fáciles de probar. Si algo se puede probar con un test, vive aquí.
- `*.test.ts` — las pruebas de esa lógica.

## 8. El portero: sesión, correo, cuenta y rol

Hay un archivo, `src/middleware.ts`, que actúa como **portero de todo el edificio**.
Se ejecuta en **cada visita** a una página, antes de mostrar nada, y hace una serie de
revisiones **en orden**. Si algo no cumple, te redirige al lugar correcto:

1. **¿Tenés sesión iniciada?** Si no, te manda al login.
2. **¿Confirmaste tu correo?** Si no, te manda a confirmarlo.
3. **¿Tu cuenta está en regla?** Si está suspendida o expulsada, te cierra la sesión y
   te saca al login con un motivo.
4. **¿Tu rol tiene permiso para esta página?** Si un egresado intenta entrar al panel
   de empresa, lo devuelve a su propia área. Si todavía no elegiste rol, te manda a
   "onboarding" (la pantalla de elegir rol).

El portero es cuidadoso con el rendimiento: hace varias de estas consultas **en
paralelo** (todas a la vez) en lugar de una tras otra, y no revisa cosas innecesarias
en los envíos de formularios (porque esos ya se protegen por otro lado).

**Y lo hace dos veces (defensa en profundidad).** Después de que el portero te deja
pasar, la propia página de cada área (su "layout") **vuelve a revisar** tu rol. Es a
propósito: si por algún hueco el portero fallara, la segunda revisión te frena igual.

Los roles en la base de datos se llaman `egresado`, `empresario` y `administrador`, y
hay funciones que traducen y verifican eso de forma centralizada
(`normalizeRole`, `ROLE_HOME`, y "guards" como `requireRole` que se usan en el servidor).

## 9. Los patrones que se repiten

En todo el código verás repetirse las mismas cuatro ideas. Entenderlas es entender el
"estilo" del proyecto.

**Patrón 1 — Tres clientes de Supabase, nunca mezclados.**
Hay tres formas de hablar con la base de datos, y usar la equivocada es un riesgo de
seguridad:
- **Cliente de servidor** (`server.ts`): el normal, **respeta las reglas de seguridad**
  (RLS). Es el que se usa casi siempre.
- **Cliente de navegador** (`client.ts`): para el poco código que corre en el navegador.
- **Cliente admin** (`admin.ts`): el "llavero maestro" que **se salta las reglas** de
  seguridad. Solo se usa en el servidor y solo para operaciones de administrador. Es
  poderoso y peligroso, por eso está aislado.

**Patrón 2 — Las acciones nunca "explotan": devuelven un `Result`.**
Cuando algo puede salir mal (guardar datos, llamar a una IA), el código no lanza un
error que rompa la pantalla. En su lugar devuelve un objeto `Result` que dice o bien
"salió bien, aquí está el dato" (`ok`) o bien "salió mal, aquí está el motivo" (`err`).
Así los errores se manejan con calma y al usuario se le muestra un mensaje amable, nunca
un error técnico feo.

**Patrón 3 — Zod valida todas las fronteras.**
Cada vez que entran datos de afuera (un formulario, una respuesta de la IA, las
variables de configuración), se validan con Zod antes de confiar en ellos. Si no
cumplen, se rechazan con un mensaje claro.

**Patrón 4 — La lógica crítica vive en la base de datos (RPC + RLS).**
Este es el más importante y tiene su propia sección abajo (sección 12). En resumen:
las operaciones delicadas (publicar, adjudicar, finalizar, contar strikes) no viven
solo en el código de la app, sino como **funciones dentro de PostgreSQL** (llamadas
"RPC"). Así la regla se cumple aunque alguien intente saltarse la app.

## 10. Las tres IAs, a detalle

Las tres usan el mismo enfoque de fondo: hablan con un modelo de lenguaje a través de
**OpenRouter** (un servicio que da acceso a varios modelos de IA con una sola cuenta),
usando el paquete `openai`. Cada una tiene **su propia llave y su propio modelo**
(configurables por variables de entorno), un **tiempo límite** por si la IA tarda
demasiado, **reintentos** si responde mal, y **validación con Zod** de todo lo que
responde. Ninguna confía ciegamente en la IA.

### IA #1 — Asistente de propuestas (`src/lib/proposal-ai/`)

**Qué hace:** ayuda a un empresario sin conocimientos técnicos a convertir una idea en
una propuesta de proyecto lista para publicar. Ocurre en tres pasos en la pantalla de
"publicar proyecto": (1) el empresario da la logística y el contexto, (2) chatea con la
IA, (3) la IA genera la propuesta y él la acepta o pide cambios.

**Cómo funciona por dentro:** el módulo usa la IA en **tres roles distintos**, cada uno
con sus propias instrucciones:
- **Conversar:** guía el chat, haciendo preguntas de negocio.
- **Generar:** produce la propuesta estructurada (título, descripción, requerimientos,
  área, categorías, tecnologías, stack sugerido) en formato de datos ordenado (JSON).
- **Validar:** una **tercera llamada a la IA** que actúa como revisor crítico de la
  propuesta antes de mostrarla, y detecta si la IA "inventó" cosas.

**El truco anti-invención:** la IA solo puede elegir áreas, categorías y tecnologías
que **existan en el catálogo real** de la plataforma. Una función (`resolveCatalog`)
compara lo que dijo la IA contra el catálogo y **descarta lo que no existe**. Así no
puede prometer tecnologías inventadas.

**Cuánta cautela hay:** hasta 5 reintentos si la IA responde con datos inválidos, hasta
3 intentos completos de generar-validar-corregir, y una pasada de "limpieza" si detecta
invención. Además, solo funciona para empresas ya verificadas (para no gastar dinero de
IA con cuentas falsas). Si falta la configuración, da el error `AI_NOT_CONFIGURED`.

### IA #2 — Revisor de postulaciones / "RevisorIa" (`src/lib/ai-filtro-ofertas/`)

**Qué hace:** cuando el egresado prepara su postulación, esta IA lee **solo su texto**
(el planteamiento de la solución y la carta) y opina si tiene que ver con el proyecto,
dándole consejos concretos para mejorar. En la interfaz aparece como "Comentario de
nuestro supervisor".

**Lo más importante: es un consejero, no un portero.** Nunca decide contrataciones y
**nunca bloquea el envío**. Tiene un triple mecanismo de "fallar sin estorbar": si falta
la llave, si el interruptor global está apagado, o si el modelo se cae, simplemente
marca el veredicto como "no disponible" y la postulación sigue su curso.

**Detalle fino:** el consejo que ve el egresado al pulsar "Revisar" es solo una vista
previa. Cuando **envía de verdad**, la plataforma **vuelve a generar** el veredicto
sobre el texto final (por si lo editó después de revisar) y lo guarda. Ese es el que
cuenta.

**El chequeo de enlaces (esto NO es IA, es código puro y SÍ bloquea).**
Junto a la IA hay un guardián determinista que revisa el enlace del prototipo que pega
el egresado:
- Que sea **https** y apunte a un sitio **público de internet**, no a la red interna del
  servidor (una protección contra un ataque llamado **SSRF**, donde alguien usa el
  servidor para atacar direcciones internas).
- Que el enlace **responda** (no esté muerto).

Este chequeo sí puede impedir el envío, porque protege a la empresa que después abrirá
ese enlace. Es astuto en un detalle: si el sitio responde con un "acceso denegado"
(típico de defensas anti-robots de Vercel o Cloudflare), lo cuenta como "vivo" y no
bloquea; solo bloquea si no hay **ninguna** respuesta.

### IA #3 — Moderador de convivencia (`src/lib/moderador-ai/`)

**Qué hace:** vigila en segundo plano los textos que la gente escribe en **13 lugares
distintos** de la plataforma (mensajes de chat, cartas de postulación, comentarios de
calificaciones, biografías, descripciones de empresa, etc.). Busca lenguaje ofensivo,
spam o fraude.

**Cómo se dispara sin estorbar:** se lanza "en diferido" desde 8 puntos del código,
**después** de responderle al usuario. Nunca bloquea ni retrasa la acción, y nunca
rompe nada: si algo falla, se ignora en silencio.

**La regla de oro:** distingue **criticar el trabajo** (legítimo, aunque sea duro) de
**atacar a la persona** (falta). Ante la duda, decide que **no** es falta. Además está
protegida contra "inyección de instrucciones" (cuando alguien escribe un texto que
intenta darle órdenes a la IA): el texto se le entrega como **dato entre delimitadores**,
y la IA solo puede responder con códigos de una lista cerrada.

**Nunca sanciona sola:** cuando detecta algo, **inserta un reporte con una acción
sugerida** en la cola de moderación, y un **administrador humano** decide entre
advertir, dar strike o ignorar. Y es doblemente cautelosa: no genera reporte si su
confianza es menor a 0.5, y **nunca sugiere un strike** con confianza menor a 0.85
(en ese caso baja la sugerencia a "advertir"). Esto reduce el riesgo de acusar de más.

**Resiliencia:** lleva un registro ("ledger") de qué ha analizado; no vuelve a analizar
un texto idéntico, pero sí lo re-analiza si se editó. Y hay un botón de "escanear
pendientes" por si el servicio de IA estuvo caído y quedaron textos sin revisar.

## 11. Las automatizaciones invisibles

Buena parte de lo que hace especial a esta plataforma ocurre **sin que nadie apriete un
botón**: son automatizaciones. Aquí las principales.

**Máquina de estados de las postulaciones.**
Una postulación pasa por estados (`enviada` → `en_revision` → `contratada` / `no
seleccionada` / `retirada`...) y **solo se permiten ciertos saltos**. Por ejemplo,
está **prohibido** el salto directo de "enviada" a "no seleccionada": la empresa
**siempre** tiene que abrir el sobre (pasar por "en revisión") antes de rechazar. Esa
regla está grabada en la base de datos con un "trigger" (un guardián que se activa
solo ante cada cambio) y no se puede saltar desde la app.

**Estado "efectivo" derivado.**
Esa prohibición deja un hueco: si un proyecto se adjudica a otra persona, las
postulaciones que nunca se abrieron quedarían para siempre en "enviada", y el egresado
seguiría viendo "enviada" sobre un proceso ya cerrado. La solución es elegante: **no se
miente cambiando el dato** (eso implicaría un salto ilegal), sino que **se calcula al
momento de leer** lo que el egresado ve. Si el proyecto ya se decidió, su pantalla
muestra "no seleccionada", aunque en la base el dato siga diciendo "enviada". Se llama
"estado efectivo" y es solo para la vista del egresado.

**Adjudicación atómica.**
Cuando la empresa elige un ganador, una sola función de base de datos hace todo junto:
marca al ganador como contratado (lo que a su vez **crea automáticamente la
contratación**), marca a los demás como no seleccionados, y pone el proyecto en
desarrollo. Si algo fallara, no queda nada a medias.

**Reputación automática.**
Cada vez que se registra una calificación, un "trigger" **recalcula solo** el promedio
de reputación de la persona calificada. Nadie lo hace a mano. Y hay un detalle fino:
mientras alguien no tenga ninguna calificación, su reputación vale **"nada" (NULL)**, no
cero, para distinguir al nuevo del mal calificado.

**Strikes y suspensión automática.**
Cuando un administrador da un strike, el código **solo** anota el strike; es un
**trigger** el que cuenta los strikes activos y decide el estado de la cuenta: 3 strikes
la suspenden, 5 la expulsan de forma permanente. Se hizo así a propósito, para que haya
**una sola fuente de la verdad** y no dos partes del sistema que se contradigan (un bug
real que hubo antes y se corrigió).

**Notificaciones y correos en cada hito.**
Postularse, abrir un sobre, ser adjudicado, recibir un strike: cada evento dispara
notificaciones dentro de la app y, en algunos casos, un correo (por ejemplo, al ganador
de un proyecto se le manda un email de "fuiste seleccionado"). Todos estos envíos son
"best-effort": si el correo falla, la operación principal no se cae.

## 12. Seguridad: por qué la verdad vive en la base de datos

Esta es la decisión de arquitectura más importante del proyecto, así que vale la pena
entenderla bien.

En muchas apps, las reglas ("solo la empresa dueña puede ver esta postulación") viven
**solo en el código de la aplicación**. El problema: si alguien encuentra una forma de
hablar con la base de datos saltándose la app, las reglas desaparecen.

Aquí se hace distinto, con **dos mecanismos de PostgreSQL**:

**RLS (Row Level Security = seguridad a nivel de fila).**
Es una regla pegada **a la tabla misma**, no a la app. Dice cosas como "un usuario solo
puede ver **sus propias** filas". Aunque alguien llegue a la base por otro camino, la
regla se sigue aplicando. Todas las tablas la tienen activada.

> **Analogía:** en vez de poner un guardia en la puerta del archivo (que se puede
> esquivar), cada gaveta reconoce tu credencial y solo se abre para ti. No importa por
> qué pasillo llegaste.

**RPC (funciones dentro de la base de datos).**
Las operaciones delicadas se escriben como **funciones dentro de PostgreSQL** y la app
las "llama" (`publicar_proyecto`, `adjudicar_participacion`, `finalizar_proyecto`,
`get_participaciones_de_proyecto`, `get_my_role`...). Ventajas: se ejecutan de forma
atómica (todo o nada) y aplican la lógica en el lugar más cercano a los datos.

**El "sobre cerrado" es el mejor ejemplo de las dos cosas juntas.** La función
`get_participaciones_de_proyecto` es la que le entrega las postulaciones a la empresa. Si
una postulación está "enviada" (sin abrir), esa función **devuelve vacío** en los campos
de contenido (carta, planteamiento, enlaces). El contenido **nunca sale del servidor**.
La pantalla que "esconde" el sobre es solo cosmética; el sello real está aquí. Además,
esa función reimpone la autorización por dentro: verifica que quien pregunta sea de
verdad la empresa dueña del proyecto, y si no, devuelve cero resultados.

**El resultado es "defensa en profundidad":** una misma regla suele estar protegida en
tres capas a la vez —validación en la app, RLS en la tabla, y trigger/RPC en la base—
de modo que si una falla, las otras aguantan. Es redundante a propósito.

## 13. Identidad visual e idiomas

**La identidad visual está fijada por el brief y no se negocia.** Colores, tipografías
y animaciones vienen definidos al detalle:
- **Colores** de marca FWD (azul, púrpura, teal, amarillo, naranja, magenta), guardados
  como "tokens" (nombres, no códigos sueltos). Está **prohibido** usar negro o blanco
  puros o pegar un color a mano; siempre se usa un token.
- **Tipografías:** Archivo Narrow para títulos, Figtree para el cuerpo, JetBrains Mono
  para código.
- **Tres "registros" visuales** según la pantalla: uno expresivo de marca (landing,
  login), uno sobrio de producto (el área del egresado), y uno de administración
  (panel oscuro).
- Un patrón de firma: los títulos de pantalla llevan un **punto azul** al final
  (el componente `PageTitle`).

**Los idiomas (español e inglés).** No hay ni un solo texto "pegado" en el código: todos
viven en `messages/es.json` y `messages/en.json`, y el código los busca por un nombre.
Eso permite tener la app completa en dos idiomas y agregar más en el futuro sin tocar
las pantallas. Es una regla dura del proyecto: cero textos escritos directamente en el
código.

## 14. Estado real y pendientes

Para que tengas la foto honesta (y no solo lo que dice el README, que quedó algo atrás):

- **Lo que está construido y funcionando:** los tres roles con sus áreas, el marketplace,
  las postulaciones de sobre cerrado, la adjudicación, los entregables, la mensajería,
  rankings y reputación, las evaluaciones de doble vía, la moderación con strikes, las
  notificaciones, los correos, y **las tres IAs**.
- **La documentación está algo desactualizada:** el README dice "~70 migraciones" (son
  **102**) y menciona "dos IAs" (son **tres**: se sumó el moderador). El documento que
  estás leyendo refleja el **código real**.
- **Pendientes conocidos** (del propio README): el **deploy público** en Vercel y las
  **capturas de pantalla** del entregable.
- **Un posible detalle a verificar** (hallazgo técnico, confianza media): las columnas de
  fecha por transición de una postulación (`revision_iniciada_at`, `adjudicada_at`,
  `retirada_at`) **se leen pero al parecer nunca se escriben** en ningún camino de
  código, por lo que el "stepper" (la línea de progreso del egresado) podría mostrar
  fechas vacías. Conviene comprobarlo con datos reales antes de darlo por seguro.

## 15. Glosario

- **App / Aplicación web:** un programa que se usa desde el navegador, sin instalar nada.
- **Frontend:** la parte visible (las pantallas). **Backend:** la parte invisible
  (servidor, base de datos, lógica).
- **Servidor:** la computadora remota donde corre la lógica y viven los datos.
- **Framework:** un conjunto de herramientas que da estructura para construir la app
  (aquí, Next.js).
- **Componente:** una pieza reutilizable de interfaz (un botón, una tarjeta).
- **Base de datos:** donde se guardan los datos de forma organizada (aquí, PostgreSQL).
- **PostgreSQL / Postgres:** el motor de base de datos que usa la plataforma.
- **Supabase:** el servicio que envuelve a PostgreSQL y le suma cuentas, seguridad y
  almacenamiento.
- **RLS (Row Level Security):** reglas de seguridad pegadas a cada tabla que limitan qué
  filas puede ver o tocar cada usuario.
- **RPC:** una función que vive dentro de la base de datos y que la app "llama" para
  hacer operaciones importantes de forma segura y atómica.
- **Trigger:** un guardián automático en la base de datos que se activa solo ante ciertos
  cambios (por ejemplo, recalcular la reputación cuando entra una calificación).
- **Migración:** un archivo que describe un cambio a la estructura de la base de datos.
  El conjunto de migraciones es la "historia" de cómo evolucionó la base.
- **Server action:** una función que corre en el servidor y cambia datos (guardar,
  editar). Aquí siempre devuelven un `Result`.
- **Result (`ok`/`err`):** una forma ordenada de devolver "salió bien + dato" o "salió
  mal + motivo", sin romper la pantalla con un error.
- **Zod:** la herramienta que valida que los datos tengan la forma correcta.
- **Middleware:** el "portero" que revisa cada visita antes de mostrar la página.
- **Rol:** el tipo de usuario (egresado, empresario, administrador).
- **Atómico:** una operación que ocurre "todo o nada": o se completa entera, o no pasa
  nada, nunca a medias.
- **Sobre cerrado:** la postulación que llega sellada a la empresa; su contenido no se
  revela hasta que la empresa la "abre".
- **Adjudicar:** elegir al ganador de un proyecto entre los postulantes.
- **Entregable:** cada parte del trabajo terminado que el egresado sube.
- **Reputación:** la nota promedio de un usuario según las calificaciones que recibió.
- **Strike:** una amonestación; al acumular varias, la cuenta se suspende o se expulsa.
- **Máquina de estados:** el conjunto de "situaciones" por las que pasa algo (una
  postulación, una cuenta) y las reglas de qué saltos entre ellas están permitidos.
- **Token (de diseño):** un nombre para un color o medida (en vez de escribir el código
  del color a mano en cada lugar).
- **i18n:** abreviatura de "internacionalización"; el sistema para tener la app en varios
  idiomas.
- **IA / Modelo de lenguaje:** el programa de inteligencia artificial que entiende y
  genera texto. Aquí se accede a través de OpenRouter.
- **OpenRouter:** el servicio externo que da acceso a modelos de IA con una sola cuenta.
- **JSON:** un formato de texto para representar datos de forma ordenada; es como
  responden las IAs de este proyecto.
- **SSRF:** un tipo de ataque donde se engaña al servidor para que acceda a direcciones
  internas; el chequeo de enlaces protege contra esto.
- **Fail-open / best-effort:** que si una parte secundaria falla (la IA, un correo), la
  operación principal sigue adelante en lugar de romperse.
- **Deploy:** publicar la app en internet para que la gente la use.

---

> **Cómo seguir leyendo el código de verdad:** empieza por `README.md` (la vista
> general), luego `reglas.md` (las reglas que no se negocian) y `CLAUDE.md` (el mapa
> mental de la arquitectura). Después abre `src/middleware.ts` (el portero) y sigue el
> hilo hacia `src/lib/` según el tema que te interese. La regla general del proyecto:
> lo que se puede probar vive en un archivo `*-logic.ts`, y la verdad de negocio vive en
> las funciones de la base de datos, no solo en el código de la app.
