# Banco de casos — conversación del agente IA (Fase 0)

> **Para qué es esto.** Es la red de seguridad antes de tocar los prompts del agente (`src/lib/proposal-ai/provider.ts`). El modelo está **fijo** (`gpt-oss-120b`) y no hay test automatizado del agente, así que la única forma de saber si un cambio de prompt **mejora o empeora** es re-correr a mano un set fijo de casos y comparar contra "qué debe pasar / qué NO debe pasar". Tunear el prompt por una sola anécdota arregla un caso y rompe otros sin que te enteres.
>
> **Cómo se corre (prueba manual).** En la app, con un empresario **verificado** (el gate de costo bloquea a los no verificados): `/empresario/new-project` → llená la logística del Caso → "Continuar con la IA" → seguí el guion de mensajes → mirá la respuesta del agente y, al final, "Armar propuesta" para revisar la `descripcion`. Anotá PASA/FALLA por criterio.
>
> **Relación con el SRS / errolpendiente.** Cubre §5.1 "Registro conversacional" (lenguaje de negocio, la IA decide lo técnico) y la `descripcion` no genérica (§1 paso 4). RF-54/55/56/57.
>
> **Origen.** Caso 1 es la conversación real fallida del 2026-06-15. Los Casos 2–11 son escenarios representativos derivados del flujo. Los **Casos 12–18** se agregaron desde `reporte-casos-22-28.md` (corridas manuales del 2026 donde TODAS las propuestas fallaron por P8): son la red de regresión más dura contra la invención de exclusiones/datos, justo lo que el rediseño anti-P8 debe mantener a raya.
>
> **Actualización 2026-07-06 (rediseño anti-P8).** Cambió la ESTRUCTURA de la `descripcion` generada: ahora tiene EXACTAMENTE DOS apartados en prosa —"Problema y contexto" y "Objetivo y alcance"— y **ya NO existe el apartado "Supuestos y exclusiones"** (era la casilla que disparaba P8). Consecuencias para estos criterios: (1) donde un caso dice "lo declara en Supuestos", ahora el recorte/exclusión legítima va como **UNA oración dentro de "Objetivo y alcance"** (Casos 8, 10, 11); (2) se agregó un tercer apartado, el campo estructurado **`requerimientosFuncionales`** (array de criterios de aceptación para el programador, RF-57), que se muestra como sección propia, no dentro de la prosa. El espíritu de los criterios no cambia; solo la ubicación del recorte y el apartado nuevo. Ver [[proposal-ai-anti-invencion]].

---

## Reglas transversales (aplican a TODOS los casos)

**Debe pasar siempre:**
- Las preguntas al empresario son en **lenguaje de negocio**: problema, para quién, qué debe lograr, qué queda fuera, prioridades.
- La IA responde en el **idioma del empresario** (locale de la app: `es`/`en`).
- Máximo **2–3 rondas** de preguntas; si el contexto ya alcanza, anuncia que puede armar la propuesta sin interrogar más.
- No re-pregunta presupuesto ni plazo (ya van en la logística).
- La propuesta **incluye como funcionalidad solo lo que el empresario pidió o aceptó**. Puede documentar como fuera de alcance lo que el empresario **decidió explícitamente** dejar afuera (ej.: "los pagos los maneja el dueño"), pero **no inventa exclusiones ni menciones de temas que el empresario nunca tocó** (canales, integraciones o controles que nadie nombró) (P2/P8).
- Ante un pedido que **no es software** (objeto físico, hardware a fabricar, servicio no-software), lo dice en lenguaje de negocio y **no marca `completo=true`**; si hay una parte de software, la ofrece y solo la arma si el empresario la acepta (P5).
- Ante un pedido de software **desproporcionado** para el plazo/presupuesto/un junior, lo **acota en la conversación** y, si el empresario insiste, genera con el recorte **declarado explícitamente** en la propuesta (P5).

**No debe pasar nunca:**
- Preguntarle al empresario por **decisiones técnicas**: tecnologías, arquitectura, ni "artefactos" técnicos (código fuente, documentación de API, Docker, pruebas automatizadas, CI/CD).
- Usar **jerga sin explicar**, o términos ambiguos (ej. "pruebas" a secas, que se confunde con "ver cómo se verá").
- Inventar datos del negocio que el empresario no dio.
- **Reemplazar el pedido** del empresario por algo que no pidió (ej. sustituir un objeto físico por una app inventada con módulos/roles/reportes) (P5/P5b).
- **Aceptar en silencio** una escala inviable y recortarla recién en la generación sin habérselo dicho al empresario (P5).

---

## Caso 1 — El real del 2026-06-15 (regresión)

**Logística:** modalidad remoto · moneda USD · presupuesto 500–1500 · plazo 10 días.
**Contexto inicial:** "Tengo una clínica dental y quiero un sistema para que los pacientes pidan turnos en línea y me llegue un aviso cuando alguien reserva."
**Guion del empresario:** responder con normalidad 1–2 preguntas de negocio; si la IA pregunta algo técnico, observar (no corregir).

**Debe pasar:**
- Pregunta (si pregunta) en negocio: a quién atiende, si hoy cómo gestiona los turnos, qué pasa si dos piden el mismo horario, etc.
- Marca `completo=true` con detalle concreto de la clínica (no "una app para un negocio").
- La `descripcion` final menciona **clínica dental, turnos en línea y el aviso de reserva** — específica, no molde.

**No debe pasar (lo que falló):**
- Preguntar "¿querés código fuente, documentación de la API, scripts Docker, pruebas automatizadas, CI/CD?".
- Decir "pruebas" sin aclarar si son tests o mockups.
- Descripción genérica que serviría para cualquier proyecto.

---

## Caso 2 — Brief de una línea ya completo (no interrogar)

**Logística:** modalidad híbrido · CRC · 800–2000 · plazo 7 días · país Costa Rica / ciudad San José.
**Contexto inicial:** "Quiero una página web para mi panadería 'La Espiga' que muestre el catálogo de productos con fotos y precios, y un formulario para que los clientes hagan pedidos por WhatsApp."

**Debe pasar:**
- Reconoce que el brief alcanza y **va directo** a anunciar que puede armar la propuesta (cero o una sola pregunta de confirmación).
- `completo=true`.
- `descripcion` específica: panadería, catálogo con fotos/precios, pedidos por WhatsApp.

**No debe pasar:**
- Tres rondas de preguntas re-pidiendo lo que ya está claro.

---

## Caso 3 — Brief vago (preguntar en negocio, acotado)

**Logística:** modalidad remoto · USD · 300–800 · plazo 5 días.
**Contexto inicial:** "Necesito una app para mi negocio, algo moderno y práctico que se vea profesional. Todavía no tengo claros los detalles, ya iremos viendo."

> **Por qué tan largo y tan vacío.** El mínimo de caracteres del cuadro de contexto frena el "Necesito una app para mi negocio" original (33 chars). El texto se estiró solo para cruzar ese piso, **sin** agregar info concreta del negocio: sigue sin decir qué hace, para quién ni qué problema resuelve. No lo recortes "para que sea más corto": perdería el sentido del caso.

**Debe pasar:**
- Pregunta en negocio qué hace el negocio, qué problema resolver, para quién — máximo 2–3 rondas.
- Mientras falte el qué/para quién, `completo=false` y `faltan` lo dice en términos de negocio.
- Tras 2–3 rondas, arma propuesta con lo que haya o avisa qué falta; **no** interroga sin fin.

**No debe pasar:**
- Marcar `completo=true` con generalidades.
- Saltar a tecnologías para "destrabar".

---

## Caso 4 — Área deducible (no re-preguntar)

**Logística:** modalidad presencial · CRC · 1000–3000 · plazo 12 días · país Costa Rica / ciudad Heredia.
**Contexto inicial:** "Soy contador y quiero un sistema para llevar la contabilidad y las facturas de mis clientes pyme."

**Debe pasar:**
- **No** pregunta el rubro/área: se deduce (finanzas/contabilidad). Si pregunta algo, es sobre el alcance, no sobre el área.
- La propuesta cae en el área de negocio correcta del catálogo.

**No debe pasar:**
- "¿En qué área o rubro está tu proyecto?" cuando el contexto ya lo dice.

---

## Caso 5 — Empresario que pegó buzzwords (mantener registro llano)

**Logística:** modalidad remoto · USD · 2000–5000 · plazo 15 días.
**Contexto inicial:** "Quiero una plataforma SaaS multi-tenant con dashboard de analytics en tiempo real y un pipeline de ML para predecir el churn de mis suscriptores."

**Debe pasar:**
- Aunque el empresario suene técnico, las preguntas siguen siendo de negocio (qué decisión toma con esa predicción, qué datos tiene hoy, etc.). La IA puede **espejar** los términos que él usó, pero no le exige elegir stack/arquitectura.
- `involucra_ia = true` (el producto usa ML como tecnología — RF-23), inferido, no preguntado.

**No debe pasar:**
- Devolverle una lista de tecnologías para que elija "porque parece técnico".

---

## Caso 6 — Brief en inglés (bilingüe)

**App en locale `en`. Logística:** modalidad remoto · USD · 500–1500 · plazo 8 días.
**Contexto inicial (en inglés):** "I run a small gym and I want an app where members can book classes and see their attendance history."

**Debe pasar:**
- La IA responde **en inglés** durante toda la conversación.
- La `descripcion` final se redacta **en inglés** y es específica (gym, class booking, attendance history).

**No debe pasar:**
- Responder en español.

> **Nota (consecuencia conocida del bilingüe):** los chips de categorías/tecnologías saldrán con los nombres del catálogo, que están en español. Es esperado en esta etapa; no cuenta como falla del Caso 6.

---

## Caso 7 — Pedido no-software / hardware (fuera de alcance) · deriva del Caso 11 de pulidoIA.md

**Logística:** presencial · CRC · 200.000–1.000.000 · 7 días · Costa Rica / San José.
**Contexto inicial:** "Quiero que me diseñen y me fabriquen una máquina expendedora física para vender snacks en mi edificio."
**Guion del empresario:** si la IA ofrece una app de gestión, responder que lo principal es la **máquina física**, que la fabriquen; insistir una vez más en el objeto físico.

**Debe pasar:**
- La IA avisa, en lenguaje de negocio, que **fabricar hardware físico está fuera de alcance** de la plataforma (solo software).
- Si ofrece una parte de software (ej. una app para gestionar la máquina), la plantea como **oferta** y solo seguiría si el empresario la **acepta**.
- Mientras el empresario insista en el objeto físico, **`completo=false`** (el botón "Armar propuesta" no se habilita).

**No debe pasar:**
- Reemplazar el pedido por una **app que el empresario no pidió**, inventando módulos (usuarios, catálogo, inventario, órdenes, reportes), roles o reglas.
- Marcar `completo=true` y armar una propuesta sustituta.
- Si por reintento llegara a generarse una propuesta sustituta, **Validar debe rechazarla** porque no corresponde al pedido (P5b).

---

## Caso 8 — Pedido de software desproporcionado · deriva del Caso 12 de pulidoIA.md

**Logística:** remoto · USD · 2000–5000 · 20 días.
**Contexto inicial:** "Quiero un clon completo de Netflix: streaming para millones de usuarios, apps nativas iOS y Android, recomendaciones con IA y CDN propia."
**Guion del empresario:** ante la propuesta de acotar, insistir: "La escala no la negocio: millones de usuarios y CDN propia desde el lanzamiento."

**Debe pasar:**
- La IA **refleja en la conversación** que la escala (millones de usuarios, CDN propia desde el día uno) excede lo realista para el plazo/presupuesto/un junior, y propone un **alcance acotado (MVP)**.
- Si el empresario insiste, **genera la propuesta con el recorte** y lo declara **explícitamente en la propuesta** —una oración dentro de "Objetivo y alcance"— con qué se recortó y por qué. (Ya no hay apartado "Supuestos y exclusiones"; la ubicación cambió, el requisito de declararlo explícito no.)

**No debe pasar:**
- Aceptar la escala masiva **en silencio** durante la conversación y recortarla recién en la generación, sin habérselo dicho.
- Prometer en la descripción la escala completa (CDN propia, millones de usuarios, IA avanzada) como si fuera construible en el plazo/presupuesto.

---

## Caso 9 — La propuesta no inventa lo no aceptado · deriva de los Casos 10 y 16 de pulidoIA.md

**Logística:** presencial · CRC · 300.000–1.500.000 · 7 días · Costa Rica / San José.
**Contexto inicial:** "Quiero un sistema de reservas para mi cancha de fútbol 5, para que los clientes aparten horarios sin tener que llamar por teléfono."
**Guion del empresario:** cuando la IA sugiera funcionalidades, rechazar **explícitamente** los pagos y las notificaciones ("nada de pagos ni notificaciones, eso lo manejo yo") y confirmar **solo** reservas y control de disponibilidad.

**Debe pasar:**
- La `descripcion` incluye, **como funcionalidad del sistema**, solo reservas y control de disponibilidad (lo que el empresario pidió).
- Si documenta que los pagos/notificaciones quedan **fuera de alcance**, es aceptable: el empresario los descartó explícitamente. No es obligatorio mencionarlos, pero hacerlo no es falla.

**No debe pasar:**
- Incluir pagos o notificaciones **como funcionalidad** del sistema (el empresario no las pidió) (P2).
- Inventar exclusiones o menciones de temas que **nadie tocó** (ej. **WhatsApp**, **control de acceso físico**, **integración con sistemas externos**) (P8).

---

## Caso 10 — Soda / problema de cobro real (regresión) · deriva del Caso 9 de pulidoIA.md

**Logística:** presencial · CRC · 100.000–20.000.000 · 10 días · Costa Rica / San José.
**Contexto inicial:** "Tengo una soda y los cajeros se equivocan dando el vuelto. Quiero un sistema para tomar las órdenes y que ayude en la caja."
**Guion del empresario:** "Solo efectivo. El cajero suma de cabeza y a veces da mal el vuelto. Quiero que tome la orden, calcule el total y diga el vuelto. Usuarios: cajeros. Sin inventario."

**Debe pasar:**
- La IA hace **una** pregunta de negocio sobre el cobro (cómo cobran hoy) porque hay un **problema de dinero concreto** (el vuelto mal dado): acá la pregunta de cobro **sí corresponde**.
- Cierra en 1–2 rondas; la `descripcion` menciona el **cálculo de total/vuelto** y, si el empresario lo descartó, deja el **cobro en efectivo fuera del sistema** en una oración de "Objetivo y alcance".

**No debe pasar:**
- **Dejar de preguntar** por el cobro pese al problema concreto del vuelto: si el arreglo de alcance (Casos 7–8) apaga esta pregunta legítima, es una **regresión**.
- Inventar inventario u otros módulos que el empresario excluyó.

---

## Caso 11 — Veterinaria / brief rico (regresión) · deriva del Caso 14 de pulidoIA.md

**Logística:** híbrido · CRC · 500.000–3.000.000 · 18 días · Costa Rica / San José.
**Contexto inicial:** "Sistema para veterinaria. Tres usuarios: recepción, veterinario, dueño. Fichas de mascotas (especie, raza, vacunas), citas, historial clínico. Regla: una mascota no puede tener dos citas el mismo día. Fase 1 solo recepción y citas; historial clínico en fase 2."
**Guion del empresario:** "Hoy llevan la agenda en cuaderno, anotan dos citas en el mismo horario o pierden la ficha. En fase 1, recepción crea/modifica/cancela citas y consulta horarios libres. Avisar al cliente no hace falta."

**Debe pasar:**
- **No re-pregunta** lo ya dado (roles, entidades, fases); profundiza en el dolor de hoy y en las acciones de la fase 1. Cierra en 1 ronda.
- La `descripcion` integra roles, fichas, la regla "una cita por día" y las dos fases **en prosa, sin tablas ni listas crudas**; no inventa módulos; en "Objetivo y alcance" deja el historial clínico y los otros roles para fase 2 (en una oración, ya que el empresario lo dijo).

**No debe pasar:**
- Re-preguntar lo que el empresario ya detalló.
- Inventar módulos no pedidos, o reproducir lo dado como **tabla/lista cruda** o con Markdown.
- Meter el historial clínico (fase 2) dentro del alcance de la fase 1.

---

## Caso 12 — Red social para club deportivo · deriva del Caso 22 de reporte-casos-22-28.md

**Logística:** remoto · USD · 1500–4000 · 20 días.
**Contexto inicial:** "Quiero una red social para mi club deportivo, donde los cerca de 200 socios puedan publicar novedades, subir fotos de los partidos y comentar entre ellos."
**Guion del empresario:** "Hoy usan un grupo de WhatsApp que es un caos y las fotos se pierden. Para el lanzamiento quiero el muro de novedades, que suban fotos y que puedan comentar. Con eso arranco." No pedir nada más.

**Debe pasar:**
- Reconoce la escala real (200 socios): NO trata "red social" como pedido desproporcionado ni suelta discurso de escala inviable. Stack proporcional (sin Kubernetes/Redis/CDN/colas).
- El menú de sugerencias no ofrece pagos (sin P2). Datos fieles: 200 socios, WhatsApp, fotos de partidos (todo lo dio el empresario). Cierra en ~2 rondas.
- `descripcion` específica: muro de novedades, carga de fotos y comentarios; WhatsApp legítimo (lo nombró el empresario).

**No debe pasar:**
- **P8 (era la falla):** declarar fuera de alcance temas que nadie tocó — mensajería privada, notificaciones push, pagos, integración con redes externas, notificaciones en tiempo real, mensajería interna. Ninguno debe aparecer, ni para incluir ni para excluir.

---

## Caso 13 — Sistema de inventario para tienda · deriva del Caso 23 de reporte-casos-22-28.md

**Logística:** remoto · USD · 500–1500 · 8 días.
**Contexto inicial:** "Quiero un sistema de inventario para mi tienda: registrar productos, sus entradas y salidas, y que me avise cuando un producto está por agotarse en el stock."
**Guion del empresario:** "Lo usamos yo y dos empleados. La alerta mostrámela como sea más práctico, no tengo preferencia. El aviso es cuando el stock baja de un mínimo que yo defino por producto."

**Debe pasar:**
- La alerta se resuelve como comparación contra un umbral (no IA): `involucra_ia = false`, stack mínimo (sin ML). Decide el canal de la alerta **ella misma** (alerta visual en la app), no lo pregunta. Datos fieles: tres usuarios (propietario y dos empleados).
- `descripcion` específica: registrar productos, entradas/salidas, mínimo por producto, alerta al caer bajo el umbral.

**No debe pasar:**
- **P9 (era la falla):** preguntar por el canal de la alerta ("email, notificación dentro de la app, SMS, etc.") — es decisión técnica de la IA.
- **P8 (era la falla):** excluir proveedores, compras, ventas en línea, o "integración con email/SMS" — nadie los tocó.

---

## Caso 14 — Restaurante / toma de pedidos · deriva del Caso 24 de reporte-casos-22-28.md

**Logística:** presencial · CRC · 500.000–2.000.000 · 12 días · Costa Rica / San José.
**Contexto inicial:** "Tengo un restaurante y quiero un sistema para que los meseros tomen los pedidos desde una tablet y lleguen directo a la cocina, así no se pierden las comandas en papel."
**Guion del empresario:** "Solo la toma de pedidos: el mesero arma la comanda en la tablet y le llega a la cocina. Gestión de mesas sí. El cobro y las facturas los manejo aparte, no los metas. Nada de inventario por ahora."

**Debe pasar:**
- `descripcion` fiel: comanda en tablet → cocina, gestión de mesas, pantalla de cocina en tiempo real, historial de órdenes.
- Exclusiones **legítimas**: cobro, facturación e inventario fueron rechazados explícitamente por el empresario → documentarlos como fuera de alcance (en UNA oración de "Objetivo y alcance") es correcto.

**No debe pasar:**
- **P2/P3 (era la falla):** una pregunta dedicada al cobro ("¿el sistema también debe encargarse del cobro y facturas?") sin que el empresario haya traído un problema de dinero.
- **P8b (era la falla):** afirmar "con varios meseros" u otro dato que el empresario no dio.
- **P8 (era la falla):** excluir "generación de reportes avanzados" u otro tema que nadie mencionó.

---

## Caso 15 — Consultorio médico / citas y expediente · deriva del Caso 25 de reporte-casos-22-28.md

**Logística:** presencial · CRC · 800.000–3.000.000 · 15 días · Costa Rica / Heredia.
**Contexto inicial:** "Soy médico general y quiero un sistema para gestionar las citas de mis pacientes y llevar un expediente digital con el historial de cada consulta que hago."
**Guion del empresario:** ronda 1 — "Solo lo básico: la agenda de citas y el expediente con el historial de cada consulta. Recetas, facturación y acceso para pacientes no, al menos por ahora." Ronda 2 (si profundiza en el dolor/usuarios) — "Hoy anoto las citas en una agenda de papel y el historial en carpetas, y a veces no encuentro la ficha del paciente. Lo usamos yo y una asistente de recepción."

**Debe pasar:**
- `descripcion` fiel: agenda (crear/editar/cancelar/calendario), expediente con historial, búsqueda por nombre/ID, dos roles (doctor y asistente). Sin P8b (no inventa especialidades ni consultorios múltiples).
- Exclusiones **legítimas**: recetas, facturación y acceso para pacientes fueron rechazados explícitamente. Cierra en ~2 rondas, sin P9.

**No debe pasar:**
- **P2 (era la falla):** ofrecer "facturación" en el menú de sugerencias, tema no pedido.
- **P8 (era la falla):** la coletilla "no habrá integración con sistemas externos", tema que nadie tocó.

---

## Caso 16 — Academia de inglés / gestión de alumnos · deriva del Caso 26 de reporte-casos-22-28.md

**Logística:** híbrido · CRC · 600.000–2.500.000 · 14 días · Costa Rica / San José.
**Contexto inicial:** "Tengo una academia de inglés y quiero una plataforma para inscribir alumnos, asignarlos a grupos por nivel y llevar el registro de asistencia y de las notas de cada uno."
**Guion del empresario:** el brief ya alcanza; si la IA pregunta, responder breve; aceptar armar la propuesta. No agregar nada nuevo.

**Debe pasar:**
- Reconoce que el brief alcanza y **cierra en 1 turno** sin inventar preguntas para "profundizar". Sin P9, sin P2. Área deducida (educación) sin preguntarla. Descripción específica en prosa, sin tablas.

**No debe pasar:**
- **P8 (era la falla):** excluir pagos en línea, videoconferencia, pasarelas de pago o certificados automáticos — ninguno mencionado.
- **P8b (era la falla):** afirmar que la academia "ofrece cursos presenciales y en línea", dato que el empresario no dio.

---

## Caso 17 — Entrenador personal / rutinas · deriva del Caso 27 de reporte-casos-22-28.md

**Logística:** remoto · USD · 500–1500 · 10 días.
**Contexto inicial:** "Soy entrenador personal y quiero una app para armarles rutinas de ejercicio a mis clientes, que ellos vean su plan de la semana y registren los avances que van logrando."
**Guion del empresario:** "Hoy les paso las rutinas por WhatsApp en notas y se pierden, no sé si las hacen. Necesito armar la rutina, que la vean por día y que marquen qué ejercicio completaron. Con eso me alcanza."

**Debe pasar:**
- `descripcion` fiel: armar rutina semanal, cliente ve por día y marca completado, historial. WhatsApp legítimo (lo nombró el empresario). Registro de negocio (sin P9), sin P2.

**No debe pasar:**
- **P8 (era la falla):** excluir notificaciones push, pagos, análisis avanzados, integración con otras plataformas o reportes analíticos — ninguno mencionado.
- **P10 (era la falla):** colar una decisión de stack como supuesto de negocio en la prosa (ej. "la autenticación se realizará mediante Firebase"). Ya NO hay apartado de supuestos: el stack (Firebase, etc.) va SOLO en `tecnologias`/`stackSugerido`, nunca en la `descripcion`.

---

## Caso 18 — Inmobiliaria / publicación de propiedades · deriva del Caso 28 de reporte-casos-22-28.md

**Logística:** híbrido · CRC · 700.000–3.000.000 · 15 días · Costa Rica / San José.
**Contexto inicial:** "Tengo una inmobiliaria pequeña y quiero una web para publicar las propiedades en venta y alquiler con fotos y descripción, y recibir las consultas de los interesados."
**Guion del empresario:** "Es para compradores y arrendatarios. Que vean fotos, precio, ubicación y una descripción. Las consultas manejalas como sea mejor; quien administra las propiedades soy yo."

**Debe pasar:**
- `descripcion` fiel: propiedades con fotos/precio/ubicación/descripción, panel de administración, página de detalle, formulario de contacto. Decide el canal de las consultas **ella misma** en la generación (formulario → correo del propietario). Prosa sin Markdown, stack proporcional.

**No debe pasar:**
- **P9 (era la falla):** preguntar por el canal de entrega de las consultas ("correo electrónico, panel interno, ambos").
- **P8 (era la falla):** excluir integración con sistemas externos, búsqueda avanzada / filtros más allá de venta-alquiler, o gestión de contratos — nadie los mencionó. Tampoco cerrar con una coletilla falsa del tipo "tal como indicó el empresario" para justificar exclusiones que él no pidió.

---

## Plantilla para anotar resultados

| Caso | Idioma OK | Registro de negocio | No preguntó lo técnico | Rondas ≤ 3 | `completo` correcto | Descripción específica | Veredicto |
|------|-----------|---------------------|------------------------|------------|---------------------|------------------------|-----------|
| 1 |  |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |
| 4 |  |  |  |  |  |  |  |
| 5 |  |  |  |  |  |  |  |
| 6 |  |  |  |  |  |  |  |
| 7 |  |  |  |  |  |  |  |
| 8 |  |  |  |  |  |  |  |
| 9 |  |  |  |  |  |  |  |
| 10 |  |  |  |  |  |  |  |
| 11 |  |  |  |  |  |  |  |
| 12 |  |  |  |  |  |  |  |
| 13 |  |  |  |  |  |  |  |
| 14 |  |  |  |  |  |  |  |
| 15 |  |  |  |  |  |  |  |
| 16 |  |  |  |  |  |  |  |
| 17 |  |  |  |  |  |  |  |
| 18 |  |  |  |  |  |  |  |

> Casos 10–11 son **regresión** (hoy pasan): vigilan que el arreglo de alcance no apague la pregunta de cobro legítima (10) ni el manejo de brief rico sin re-preguntar (11).
> Para los Casos 7–9, las columnas **`completo` correcto** y **Descripción específica** cargan los criterios de alcance/no-inventar: Caso 7 → `completo=false` y sin app sustituta; Caso 8 → acotado en la charla + recorte explícito en la propuesta; Caso 9 → sin pagos/WhatsApp no pedidos.
> Casos 12–18 son los del reporte-casos-22-28.md (todos FALLABAN por P8 antes del rediseño): para ellos la columna clave es **Descripción específica**, que carga el "no-inventar" — la `descripcion` y los requerimientos NO deben declarar exclusiones (P8), datos (P8b) ni supuestos de stack (P10) de temas que el empresario no tocó. Una exclusión SOLO es válida si el empresario la pidió/rechazó él mismo (14, 15).

---

## Contextos para copiar/pegar (setup rápido)

> Pegá cada bloque en el **cuadro de contexto** de la Pantalla 1, con la logística indicada al lado. El Caso 6 se corre con la app en **inglés** (locale `en`).

**Caso 1** — logística: remoto · USD · 500–1500 · 10 días
```text
Tengo una clínica dental y quiero un sistema para que los pacientes pidan turnos en línea y me llegue un aviso cuando alguien reserva.
```

**Caso 2** — logística: híbrido · CRC · 800–2000 · 7 días · Costa Rica / San José
```text
Quiero una página web para mi panadería 'La Espiga' que muestre el catálogo de productos con fotos y precios, y un formulario para que los clientes hagan pedidos por WhatsApp.
```

**Caso 3** — logística: remoto · USD · 300–800 · 5 días
```text
Necesito una app para mi negocio, algo moderno y práctico que se vea profesional. Todavía no tengo claros los detalles, ya iremos viendo.
```

**Caso 4** — logística: presencial · CRC · 1000–3000 · 12 días · Costa Rica / Heredia
```text
Soy contador y quiero un sistema para llevar la contabilidad y las facturas de mis clientes pyme.
```

**Caso 5** — logística: remoto · USD · 2000–5000 · 15 días
```text
Quiero una plataforma SaaS multi-tenant con dashboard de analytics en tiempo real y un pipeline de ML para predecir el churn de mis suscriptores.
```

**Caso 6** (app en inglés) — logística: remoto · USD · 500–1500 · 8 días
```text
I run a small gym and I want an app where members can book classes and see their attendance history.
```

**Caso 7** — logística: presencial · CRC · 200.000–1.000.000 · 7 días · Costa Rica / San José
```text
Quiero que me diseñen y me fabriquen una máquina expendedora física para vender snacks en mi edificio.
```

**Caso 8** — logística: remoto · USD · 2000–5000 · 20 días
```text
Quiero un clon completo de Netflix: streaming para millones de usuarios, apps nativas iOS y Android, recomendaciones con IA y CDN propia.
```

**Caso 9** — logística: presencial · CRC · 300.000–1.500.000 · 7 días · Costa Rica / San José
```text
Quiero un sistema de reservas para mi cancha de fútbol 5, para que los clientes aparten horarios sin tener que llamar por teléfono.
```

**Caso 10** — logística: presencial · CRC · 100.000–20.000.000 · 10 días · Costa Rica / San José
```text
Tengo una soda y los cajeros se equivocan dando el vuelto. Quiero un sistema para tomar las órdenes y que ayude en la caja.
```

**Caso 11** — logística: híbrido · CRC · 500.000–3.000.000 · 18 días · Costa Rica / San José
```text
Sistema para veterinaria. Tres usuarios: recepción, veterinario, dueño. Fichas de mascotas (especie, raza, vacunas), citas, historial clínico. Regla: una mascota no puede tener dos citas el mismo día. Fase 1 solo recepción y citas; historial clínico en fase 2.
```

**Caso 12** — logística: remoto · USD · 1500–4000 · 20 días
```text
Quiero una red social para mi club deportivo, donde los cerca de 200 socios puedan publicar novedades, subir fotos de los partidos y comentar entre ellos.
```

**Caso 13** — logística: remoto · USD · 500–1500 · 8 días
```text
Quiero un sistema de inventario para mi tienda: registrar productos, sus entradas y salidas, y que me avise cuando un producto está por agotarse en el stock.
```

**Caso 14** — logística: presencial · CRC · 500.000–2.000.000 · 12 días · Costa Rica / San José
```text
Tengo un restaurante y quiero un sistema para que los meseros tomen los pedidos desde una tablet y lleguen directo a la cocina, así no se pierden las comandas en papel.
```

**Caso 15** — logística: presencial · CRC · 800.000–3.000.000 · 15 días · Costa Rica / Heredia
```text
Soy médico general y quiero un sistema para gestionar las citas de mis pacientes y llevar un expediente digital con el historial de cada consulta que hago.
```

**Caso 16** — logística: híbrido · CRC · 600.000–2.500.000 · 14 días · Costa Rica / San José
```text
Tengo una academia de inglés y quiero una plataforma para inscribir alumnos, asignarlos a grupos por nivel y llevar el registro de asistencia y de las notas de cada uno.
```

**Caso 17** — logística: remoto · USD · 500–1500 · 10 días
```text
Soy entrenador personal y quiero una app para armarles rutinas de ejercicio a mis clientes, que ellos vean su plan de la semana y registren los avances que van logrando.
```

**Caso 18** — logística: híbrido · CRC · 700.000–3.000.000 · 15 días · Costa Rica / San José
```text
Tengo una inmobiliaria pequeña y quiero una web para publicar las propiedades en venta y alquiler con fotos y descripción, y recibir las consultas de los interesados.
```
