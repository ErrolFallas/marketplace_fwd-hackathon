# Reporte de resultados — Casos 22 a 28

> Reporte descriptivo de la corrida manual del agente (provider con prompt dual es/en, `temperature 0.2`, `gpt-oss-120b`). Para cada caso: contexto inicial, flujo de la conversación (turnos textuales), lo bueno, lo malo/fallas, y la propuesta generada **reproducida tal cual**. Cada corrida es N=1. Este documento solo registra lo observado; no incluye recomendaciones.

## Glosario de fallas referenciadas (descriptivo)

- **P2** — La IA ofrece por defecto el tema de cobro del dominio (pagos, facturación, cobro) en sus menús de sugerencias, sin que el empresario lo pida.
- **P3** — La excepción de cobro se dispara sin que exista un problema de dinero concreto (falso positivo).
- **P8** — Invención de exclusiones: la propuesta declara "fuera de alcance" temas que nadie (ni el empresario ni la IA) mencionó en la conversación.
- **P8b** — Invención de datos del negocio: la descripción afirma hechos del negocio que el empresario no aportó.
- **P9** — Micro-decisión técnica disfrazada de negocio: la IA pregunta al empresario por el canal de entrega (email, in-app, SMS, panel), que es una decisión de implementación.
- **P10** — Decisión de stack colada dentro del apartado "Supuestos y exclusiones" como si fuera un supuesto de negocio.

---

# Caso 22 — Red social para club deportivo

**Logística:** remoto · USD · 1500–4000 · 20 días.

**Contexto inicial:**
```text
Quiero una red social para mi club deportivo, donde los cerca de 200 socios puedan publicar novedades, subir fotos de los partidos y comentar entre ellos.
```

## Flujo de la conversación

**Turno 1 — IA:**
```text
Entiendo que buscas una red social interna para los 200 socios de tu club deportivo, donde puedan publicar novedades, subir fotos de los partidos y comentar. Para afinar la propuesta, me ayudaría saber: 1. ¿Cómo gestionan actualmente la comunicación y el intercambio de fotos entre los socios? ¿Qué dificultades encuentran con el método actual? 2. ¿Qué funcionalidades consideras imprescindibles para el lanzamiento (por ejemplo, publicación de noticias, galería de fotos, comentarios, moderación, notificaciones, etc.) y qué cosas podrían quedar fuera en la primera versión? Con esas respuestas podré definir con claridad el problema y el alcance del proyecto.
```

**Turno 2 — Empresario:**
```text
Hoy usan un grupo de WhatsApp que es un caos y las fotos se pierden. Para el lanzamiento quiero el muro de novedades, que suban fotos y que puedan comentar. Con eso arranco
```

**Turno 2 — IA (cierre):**
```text
Perfecto, ya tengo claro el problema: el grupo de WhatsApp genera caos y pérdida de fotos, y la necesidad de una plataforma propia para los 200 socios del club deportivo. También sé el objetivo y alcance: una versión inicial con muro de novedades, carga de fotos y comentarios, dejando fuera otras funcionalidades por ahora. Con esto puedo armar la propuesta. ¿La preparamos o querés ajustar algo más?
```

## Lo bueno
- No trató "red social" como pedido desproporcionado: reconoció la escala real (200 socios) y no soltó ningún discurso de escala inviable.
- Stack proporcional: sin infraestructura pesada (nada de Kubernetes, Redis, CDN, colas).
- El menú de sugerencias no incluyó pagos (P2 no apareció; el dominio no da pie a cobro).
- Datos del negocio correctos: 200 socios, WhatsApp, fotos de partidos — todos aportados por el empresario. Sin P8b.
- Descripción específica y fiel; WhatsApp legítimo (lo nombró el empresario).

## Lo malo / fallas
- **P8 (invención de exclusiones):** la propuesta declara fuera de alcance temas que el empresario nunca tocó: mensajería privada, notificaciones push, pagos, integración con redes externas, notificaciones en tiempo real, mensajería interna.

## Resultado (propuesta generada, textual)
```text
Título
Red Social Interna para Club Deportivo
Descripción
Problema y contexto: El club deportivo cuenta con cerca de 200 socios que actualmente se comunican a través de un grupo de WhatsApp. Ese canal genera caos, los mensajes se pierden y las fotos de los partidos se dispersan sin un lugar centralizado. Es necesario disponer de una plataforma propia donde la información quede organizada y accesible para todos los miembros. Objetivo y alcance: Desarrollar una aplicación web que permita a los socios crear una cuenta, publicar novedades en un muro, subir fotos de los partidos y comentar en las publicaciones de otros usuarios. El sistema debe almacenar las imágenes de forma segura, mostrar un feed cronológico y permitir la interacción mediante comentarios. El alcance incluye gestión de usuarios, publicación de contenido, carga de imágenes y sección de comentarios; quedarán fuera funcionalidades como mensajería privada, notificaciones push, pagos o integración con redes externas. Supuestos y exclusiones: Se asume que el número de usuarios será alrededor de 200 y que el almacenamiento de fotos se realizará en el servidor de la aplicación. No se implementarán notificaciones en tiempo real ni funcionalidades de mensajería interna; esas características podrán considerarse en futuras versiones.
Área de negocio
Tecnologías de la Información
Presupuesto
USD 1500 – 4000
Categorías
Aplicación web
Tecnologías
Next.js PostgreSQL Tailwind CSS Git
Stack sugerido
* Next.js — framework fullstack para construir la interfaz y la API
* PostgreSQL — base de datos relacional ligera para usuarios y publicaciones
* Tailwind CSS — estilos rápidos y responsivos sin configuración pesada
* Git — control de versiones y colaboración
```

## Veredicto
Guard PASA (no sobre-gating, stack proporcional). Propuesta FALLA por P8.

---

# Caso 23 — Sistema de inventario para tienda

**Logística:** remoto · USD · 500–1500 · 8 días.

**Contexto inicial:**
```text
Quiero un sistema de inventario para mi tienda: registrar productos, sus entradas y salidas, y que me avise cuando un producto está por agotarse en el stock.
```

## Flujo de la conversación

**Turno 1 — IA:**
```text
Entiendo que necesitás un sistema de inventario que registre productos, sus entradas y salidas, y que avise cuando el stock está bajo. Para definir bien la propuesta, ¿quiénes van a usar el sistema (propietario, empleados, ambos) y cómo preferís recibir las alertas de bajo stock (email, notificación dentro de la app, SMS, etc.)?
```

**Turno 2 — Empresario:**
```text
Lo usamos yo y dos empleados. La alerta mostrámela como sea más práctico, no tengo preferencia. El aviso es cuando el stock baja de un mínimo que yo defino por producto.
```

**Turno 2 — IA (cierre):**
```text
Perfecto, ahora tengo claro el problema: necesitás digitalizar el control de inventario de tu tienda porque el método actual no permite registrar de forma ágil entradas y salidas ni detectar rápidamente los niveles críticos. Y el objetivo del proyecto: crear una herramienta que permita a los tres usuarios registrar productos, registrar cada movimiento de stock, definir un nivel mínimo por artículo y generar una alerta práctica cuando el stock caiga por debajo de ese nivel. Con esa información puedo armar la propuesta, ¿la preparamos o querés ajustar algo más?
```

## Lo bueno
- La alerta se resolvió como comparación contra un umbral, no como IA (descripción coherente con `involucra_ia = false`).
- Proporcionalidad: stack mínimo, sin ML ni pipeline para una alerta de umbral.
- P9 no se propagó a la propuesta: aunque en el turno 1 preguntó por el canal, en la generación decidió el canal ella misma ("alerta visual dentro de la aplicación").
- Datos del negocio correctos (tres usuarios: propietario y dos empleados). Sin P8b.

## Lo malo / fallas
- **P9 (turno 1):** preguntó por el canal de la alerta ("email, notificación dentro de la app, SMS, etc."), que es una decisión técnica de implementación.
- **P8 (invención de exclusiones):** la propuesta excluye temas que nadie tocó: gestión de proveedores, compras, ventas en línea. Además recicló como exclusión las opciones de canal que la propia IA había ofrecido en el turno 1 (integración con email y SMS).

## Resultado (propuesta generada, textual)
```text
Título
Sistema de Inventario Web para Tienda Minorista
Descripción
Problema y contexto: La tienda lleva el control de inventario de forma manual, lo que dificulta registrar rápidamente las entradas y salidas de productos y detectar cuándo un artículo está próximo a agotarse. Esta falta de visibilidad genera riesgos de ruptura de stock y retrasa la toma de decisiones. El negocio cuenta con tres usuarios (propietario y dos empleados) que necesitan una herramienta centralizada para gestionar el inventario. Objetivo y alcance: Desarrollar una aplicación web que permita a los tres usuarios crear y editar productos, definir un nivel mínimo de stock por producto, registrar cada movimiento de entrada y salida, actualizar automáticamente la cantidad disponible y mostrar una alerta visual dentro de la aplicación cuando el stock de un artículo caiga por debajo del umbral definido. El sistema incluirá una vista de listado de productos, formularios para registrar movimientos, y un panel que destaque los productos con stock bajo. No se contemplan integraciones externas de notificación ni funcionalidades de compra o gestión de proveedores. Supuestos y exclusiones: Se asume que los usuarios acceden mediante un navegador web y que la definición del nivel mínimo se ingresa al crear o editar cada producto. Se excluye la integración con email, SMS u otros canales de notificación, y no se incluyen módulos de gestión de proveedores, compras o ventas en línea.
Área de negocio
Retail
Presupuesto
USD 500 – 1500
Categorías
Aplicación web API / Backend
Tecnologías
Next.js PostgreSQL TypeScript Tailwind CSS
Stack sugerido
* Next.js — framework fullstack para interfaz y API
* PostgreSQL — base de datos relacional para productos y movimientos
* TypeScript — tipado estático para mayor robustez
* Tailwind CSS — estilos rápidos y responsivos
```

## Veredicto
Guard PASA (`involucra_ia` probable false, proporcionalidad). Propuesta FALLA por P8. P9 presente en el turno 1 pero no propagado.

---

# Caso 24 — Restaurante / toma de pedidos

**Logística:** presencial · CRC · 500.000–2.000.000 · 12 días · Costa Rica / San José.

**Contexto inicial:**
```text
Tengo un restaurante y quiero un sistema para que los meseros tomen los pedidos desde una tablet y lleguen directo a la cocina, así no se pierden las comandas en papel.
```

## Flujo de la conversación

**Turno 1 — IA:**
```text
Entiendo que deseas digitalizar la toma de pedidos en tu restaurante para que los meseros usen una tablet y la información llegue directamente a la cocina, evitando errores con el papel. Para definir bien la propuesta, necesito saber: 1️⃣ ¿Qué funcionalidades específicas debe incluir el sistema (por ejemplo, gestión de mesas, edición de pedidos, envío de notificaciones a la cocina, generación de tickets impresos, control de inventario, reportes de ventas, etc.)? 2️⃣ ¿El sistema también debe encargarse del cobro y generación de facturas, o ese proceso lo mantendrás separado?
```

**Turno 2 — Empresario:**
```text
Solo la toma de pedidos: el mesero arma la comanda en la tablet y le llega a la cocina. Gestión de mesas sí. El cobro y las facturas los manejo aparte, no los metas. Nada de inventario por ahora.
```

**Turno 2 — IA (cierre):**
```text
Perfecto, entonces el proyecto consiste en una aplicación para tablet que permita a los meseros tomar los pedidos, gestionar las mesas y enviarlos en tiempo real a la cocina, sin incluir cobro, facturación ni inventario. Con esa información ya puedo armar la propuesta. ¿La preparamos o querés ajustar algo más?
```

## Lo bueno
- Descripción específica y fiel: comanda en tablet → cocina, gestión de mesas, pantalla de cocina en tiempo real, historial.
- Exclusiones legítimas: cobro, facturación e inventario fueron rechazados explícitamente por el empresario, así que documentarlos como fuera de alcance es correcto.
- Cierre en 2 rondas, stack proporcional.

## Lo malo / fallas
- **P2 / P3 (turno 1):** la pregunta 2 fue una pregunta dedicada al cobro ("¿el sistema también debe encargarse del cobro y generación de facturas?") sin que el empresario mencionara ningún problema de dinero.
- **P8b (invención de datos de negocio):** la descripción afirma "con varios meseros", dato que el empresario no aportó.
- **P8 (invención de exclusiones):** la propuesta excluye "generación de reportes avanzados", tema que nadie mencionó.

## Resultado (propuesta generada, textual)
```text
Título
Sistema de toma de pedidos para tablet en restaurante
Descripción
Problema y contexto: El restaurante necesita digitalizar la toma de pedidos para evitar la pérdida y errores de las comandas en papel. Actualmente los meseros anotan los pedidos en papel y los entregan a la cocina, lo que genera retrasos y equivocaciones. El negocio es un restaurante en San José, Costa Rica, con varios meseros y una cocina que requiere recibir las órdenes de forma inmediata. Objetivo y alcance: El sistema debe permitir a los meseros iniciar sesión en una tablet, seleccionar una mesa, armar la orden eligiendo platos de un menú predefinido, ajustar cantidades y enviar la orden a la cocina con un solo botón. En la cocina, una pantalla mostrará en tiempo real las órdenes recibidas y su estado de preparación. El sistema gestionará la creación, edición y cierre de mesas, y mantendrá un historial de órdenes. No se incluyen funcionalidades de cobro, facturación, gestión de inventario ni generación de reportes avanzados. Supuestos y exclusiones: Se asume que el menú y los platos estarán predefinidos por el cliente y se cargarán inicialmente en la base de datos. No se incluye integración con sistemas de cobro ni generación de facturas, y el control de inventario quedará fuera del alcance.
Área de negocio
Operaciones
Presupuesto
CRC 500000 – 2000000
Categorías
Aplicación web API / Backend
Tecnologías
React Node.js PostgreSQL TypeScript
Stack sugerido
* React — interfaz de tablet para meseros
* Node.js — API REST para gestión de pedidos y mesas
* PostgreSQL — almacenamiento de datos de mesas y pedidos
* TypeScript — tipado estático para mayor robustez
```

## Veredicto
FALLA (P8 + P8b). P2/P3 presente en el turno 1.

---

# Caso 25 — Consultorio médico / citas y expediente

**Logística:** presencial · CRC · 800.000–3.000.000 · 15 días · Costa Rica / Heredia.

**Contexto inicial:**
```text
Soy médico general y quiero un sistema para gestionar las citas de mis pacientes y llevar un expediente digital con el historial de cada consulta que hago.
```

## Flujo de la conversación

**Turno 1 — IA:**
```text
Entiendo que necesita una herramienta para organizar sus citas y mantener un expediente digital de cada consulta. Para definir el objetivo y el alcance del proyecto, ¿podría indicarme qué funcionalidades específicas quiere que incluya el sistema (por ejemplo, agenda de citas, recordatorios automáticos, historial clínico, recetas, facturación, acceso para pacientes, etc.) y qué aspectos quedarían fuera del alcance?
```

**Turno 2 — Empresario:**
```text
Solo lo básico: la agenda de citas y el expediente con el historial de cada consulta. Recetas, facturación y acceso para pacientes no, al menos por ahora.
```

**Turno 2 — IA:**
```text
Perfecto, la agenda de citas y el expediente digital son el núcleo. Para entender mejor el problema que quiere resolver, ¿cómo gestiona actualmente las citas y el historial de sus pacientes y qué dificultades le genera ese método? Además, ¿quiénes usarán el sistema (solo usted, personal de recepción, etc.)?
```

**Turno 3 — Empresario:**
```text
Hoy anoto las citas en una agenda de papel y el historial en carpetas, y a veces no encuentro la ficha del paciente. Lo usamos yo y una asistente de recepción.
```

## Lo bueno
- Descripción específica y fiel: agenda (crear/editar/cancelar/calendario), expediente con historial, búsqueda por nombre/ID, dos roles (doctor y asistente).
- Sin P8b: los datos del negocio son correctos (doctor y asistente, únicos usuarios) — no inventó especialidades ni consultorios múltiples.
- Exclusiones legítimas: recetas, facturación y acceso para pacientes fueron rechazados explícitamente por el empresario.
- No apareció P9 (ninguna pregunta técnica de canal). Cierre en 2 rondas.

## Lo malo / fallas
- **P2 (latente, turno 1):** ofreció "facturación" en el menú de sugerencias, tema no pedido por el empresario.
- **P8 (invención de exclusiones):** la propuesta declara "no habrá integración con sistemas externos", tema que nadie tocó (una sola coletilla).

## Resultado (propuesta generada, textual)
```text
Título
Sistema de agenda y expediente digital para consulta médica
Descripción
Problema y contexto: El consultorio médico lleva la agenda de citas en papel y el historial de cada paciente en carpetas físicas. Esta forma genera pérdida de tiempo al buscar fichas y riesgo de extravío, lo que afecta la eficiencia del doctor y de la asistente de recepción, quienes son los únicos usuarios del proceso. Objetivo y alcance: El sistema debe permitir a los usuarios (doctor y asistente) gestionar una agenda de citas con funcionalidades de crear, editar, cancelar y visualizar citas en un calendario, y mantener un expediente digital de cada paciente donde se registre el historial de consultas, con posibilidad de agregar notas y buscar por nombre o identificación. Incluye autenticación básica para dos roles (doctor y asistente) y una interfaz web sencilla. No se incluyen módulos de recetas, facturación ni portal de acceso para pacientes. Supuestos y exclusiones: Se asume que el uso del sistema será exclusivo del doctor y la asistente, que los datos se ingresarán manualmente y que no habrá integración con sistemas externos ni gestión de pagos o recetas, los cuales quedan fuera del alcance.
Área de negocio
Salud
Presupuesto
CRC 800000 – 3000000
Categorías
Aplicación web
Tecnologías
React Node.js PostgreSQL HTML CSS TypeScript
Stack sugerido
* React — interfaz de agenda y expediente
* Node.js — API REST para gestión de citas y pacientes
* PostgreSQL — almacenamiento estructurado de datos clínicos
* HTML & CSS — estructura y estilo básico
* TypeScript — tipado para mayor robustez
```

## Veredicto
FALLA por P8 (una sola coletilla: "integración con sistemas externos"). El resto de las exclusiones fueron legítimas.

---

# Caso 26 — Academia de inglés / gestión de alumnos

**Logística:** híbrido · CRC · 600.000–2.500.000 · 14 días · Costa Rica / San José.

**Contexto inicial:**
```text
Tengo una academia de inglés y quiero una plataforma para inscribir alumnos, asignarlos a grupos por nivel y llevar el registro de asistencia y de las notas de cada uno.
```

## Flujo de la conversación

**Turno 1 — IA (cerró de una):**
```text
Entiendo que su academia de inglés necesita una plataforma para inscribir alumnos, asignarlos a grupos por nivel y registrar la asistencia y las notas de cada estudiante. Con esa información ya puedo armar la propuesta. ¿La armamos o quiere ajustar algo?
```

## Lo bueno
- Reconoció que el brief ya alcanzaba y cerró en un solo turno, sin inventar preguntas para "profundizar".
- No coló nada técnico (sin P9) ni ofreció pagos (sin P2). Área deducida (educación) sin preguntarla.
- Descripción específica e integrada en prosa, sin tablas.

## Lo malo / fallas
- **P8 (invención de exclusiones):** la propuesta excluye pagos en línea, integración con plataformas de videoconferencia, integración con pasarelas de pago y generación de certificados automáticos — ninguno mencionado por el empresario.
- **P8b (invención de datos de negocio):** la descripción afirma que la academia "ofrece cursos presenciales y en línea", dato que el empresario no aportó.

## Resultado (propuesta generada, textual)
```text
Título
Plataforma de gestión académica para academia de inglés
Descripción
Problema y contexto: La academia de inglés ofrece cursos presenciales y en línea, actualmente gestiona la inscripción y la asignación de alumnos a grupos de forma manual, lo que genera errores, pérdida de tiempo y dificultad para llevar un registro preciso de asistencia y calificaciones. Este proceso afecta la experiencia de los estudiantes y la capacidad de la academia para monitorear el progreso y la ocupación de los grupos. Objetivo y alcance: El sistema debe permitir la creación de perfiles de alumnos, la inscripción en la academia, la asignación automática o manual a grupos según el nivel de inglés, y el registro diario de asistencia y de notas por alumno. El alcance incluye módulos de gestión de usuarios (administrador y docente), gestión de grupos, registro de asistencia, registro de notas y generación de reportes básicos de asistencia y desempeño. No se incluyen funcionalidades de pagos en línea ni integración con plataformas de videoconferencia. Supuestos y exclusiones: Se asume que la academia gestionará los pagos fuera del sistema y que los docentes ingresarán manualmente la asistencia y las notas. Queda fuera de alcance la integración con pasarelas de pago y la generación de certificados automáticos.
Área de negocio
Educación
Presupuesto
USD 600000 – 2500000
Categorías
Aplicación web API / Backend
Tecnologías
Next.js PostgreSQL Tailwind CSS TypeScript
Stack sugerido
* Next.js — interfaz de inscripción, gestión de grupos y reportes
* PostgreSQL — almacenamiento de datos de alumnos, grupos, asistencia y notas
* Tailwind CSS — estilos rápidos y responsivos
* TypeScript — tipado para mayor robustez
```

## Veredicto
FALLA (P8 + P8b). El comportamiento conversacional (cierre sin interrogar) fue correcto.

---

# Caso 27 — Entrenador personal / rutinas

**Logística:** remoto · USD · 500–1500 · 10 días.

**Contexto inicial:**
```text
Soy entrenador personal y quiero una app para armarles rutinas de ejercicio a mis clientes, que ellos vean su plan de la semana y registren los avances que van logrando.
```

## Flujo de la conversación

**Turno 1 — IA:**
```text
¡Hola! Entiendo que querés una app para que tus clientes vean su plan semanal y registren sus avances. Para afinar la propuesta, necesito un poco más de detalle: 1. ¿Cómo gestionás actualmente las rutinas y el seguimiento de tus clientes? ¿Qué te resulta más complicado o qué falla del método actual? 2. ¿Qué funcionalidades considerás imprescindibles en la app (por ejemplo, creación y asignación de rutinas, registro de ejercicios, historial de progreso, notificaciones, etc.) y qué cosas quedarían fuera del alcance inicial?
```

**Turno 2 — Empresario:**
```text
Hoy les paso las rutinas por WhatsApp en notas y se pierden, no sé si las hacen. Necesito armar la rutina, que la vean por día y que marquen qué ejercicio completaron. Con eso me alcanza.
```

**Turno 2 — IA (cierre):**
```text
Perfecto, ya tengo claro el problema: hoy envías rutinas por WhatsApp y se pierden, sin saber si tus clientes las siguen. El objetivo es una app donde puedas armar la rutina, tus clientes la vean día a día y marquen los ejercicios que completaron, sin incluir funcionalidades extra por ahora. Con esa información puedo armar la propuesta del proyecto. ¿La preparamos?
```

## Lo bueno
- Descripción específica y fiel: armar rutina semanal, cliente ve por día y marca completado, historial.
- WhatsApp legítimo (lo nombró el empresario). El menú de sugerencias no incluyó pagos (sin P2).
- Registro de negocio, no técnico (sin P9).

## Lo malo / fallas
- **P8 (invención de exclusiones):** la propuesta excluye notificaciones push, pagos, análisis avanzados, integración con otras plataformas y reportes analíticos complejos — ninguno mencionado por el empresario.
- **P10 (decisión de stack disfrazada de supuesto):** el apartado "Supuestos y exclusiones" afirma "que la autenticación se realizará mediante Firebase", una decisión técnica presentada como supuesto de negocio.

## Resultado (propuesta generada, textual)
```text
Aplicación móvil de gestión de rutinas de ejercicio
Descripción
Problema y contexto: Actualmente envías las rutinas a tus clientes mediante notas de WhatsApp, lo que genera pérdida de información y desconocimiento sobre si las realizan. Necesitas una herramienta donde puedas armar la rutina semanal, que cada cliente pueda consultar por día y marcar los ejercicios completados, facilitando el seguimiento. Objetivo y alcance: El sistema permitirá al entrenador crear y organizar rutinas semanales asignadas a cada cliente, con ejercicios distribuidos por día. Los clientes podrán iniciar sesión, visualizar su plan diario y marcar cada ejercicio como completado, guardándose el historial de avances. Se incluirá gestión básica de usuarios (entrenador y cliente), creación y edición de rutinas, vista diaria de la rutina y registro de completado. No se contemplan notificaciones push, pagos, análisis avanzados ni integración con WhatsApp. Supuestos y exclusiones: Se asume que el entrenador ingresará manualmente las rutinas y que la autenticación se realizará mediante Firebase. Quedan fuera del alcance funcionalidades de pago, notificaciones, integración con otras plataformas y reportes analíticos complejos.
Área de negocio
Salud
Presupuesto
USD 500 – 1500
Categorías
Aplicación móvil
Tecnologías
Flutter Firebase Git
Stack sugerido
* Flutter — desarrollo de app móvil para iOS y Android
* Firebase — base de datos en tiempo real y autenticación
* Git — control de versiones
```

## Veredicto
FALLA por P8. P10 presente (Firebase como supuesto).

---

# Caso 28 — Inmobiliaria / publicación de propiedades

**Logística:** híbrido · CRC · 700.000–3.000.000 · 15 días · Costa Rica / San José.

**Contexto inicial:**
```text
Tengo una inmobiliaria pequeña y quiero una web para publicar las propiedades en venta y alquiler con fotos y descripción, y recibir las consultas de los interesados.
```

## Flujo de la conversación

**Turno 1 — IA:**
```text
Entiendo que desea una web para publicar sus inmuebles con fotos y descripción, y recibir consultas. Para afinar la propuesta, necesito saber: (1) ¿A quién está dirigida la web (compradores, arrendatarios o ambos) y qué información esencial deben poder ver los usuarios? (2) ¿Cómo prefiere que le lleguen las consultas (correo electrónico, panel interno, ambos) y quién gestionará los inmuebles en la plataforma?
```

**Turno 2 — Empresario:**
```text
Es para compradores y arrendatarios. Que vean fotos, precio, ubicación y una descripción. Las consultas manejalas como sea mejor; quien administra las propiedades soy yo.
```

**Turno 2 — IA (cierre):**
```text
Perfecto, ya tengo claro el problema y el objetivo: una web donde compradores y arrendatarios puedan ver fotos, precio, ubicación y descripción de sus inmuebles, y donde usted reciba las consultas de forma cómoda. Con esa información puedo armar la propuesta del proyecto. ¿Le parece bien que la preparemos?
```

## Lo bueno
- Descripción específica y fiel: propiedades con fotos/precio/ubicación/descripción, panel de administración, página de detalle, formulario de contacto.
- Decidió el canal de las consultas por su cuenta en la generación ("formulario de contacto que envíe la consulta al correo del propietario"): P9 no se propagó a la propuesta.
- Prosa sin Markdown, stack proporcional.

## Lo malo / fallas
- **P9 (turno 1):** preguntó por el canal de entrega de las consultas ("correo electrónico, panel interno, ambos"), una decisión técnica de implementación.
- **P8 (invención de exclusiones):** la propuesta excluye integración con sistemas externos, búsqueda avanzada / filtros más allá de venta-alquiler, y gestión de contratos — ninguno mencionado por nadie. La frase cierra con "tal como indicó el empresario", pero el empresario solo indicó lo relativo a inmuebles y consultas.

## Resultado (propuesta generada, textual)
```text
Título
Portal web de inmuebles para venta y alquiler
Descripción
Problema y contexto: La inmobiliaria pequeña necesita una presencia online para mostrar sus propiedades a compradores y arrendatarios. Actualmente solo utiliza métodos tradicionales, lo que limita el alcance y la rapidez con la que los interesados pueden obtener información. Es importante que los usuarios vean fotos, precio, ubicación y una descripción clara de cada inmueble para decidir si contactan. Objetivo y alcance: Desarrollar un sitio web que permita publicar propiedades con fotos, precio, ubicación y descripción, y que incluya un panel de administración donde el propietario pueda crear, editar y eliminar inmuebles. Cada propiedad tendrá una página de detalle y un formulario de contacto que envíe la consulta al correo del propietario. El sitio será responsive y accesible desde dispositivos móviles y de escritorio. No se incluyen pagos en línea ni gestión de contratos. Supuestos y exclusiones: Se asume que el propietario gestionará los inmuebles a través del panel y recibirá las consultas por correo electrónico; no se implementarán pagos en línea ni integración con sistemas externos; no se incluyen funcionalidades de búsqueda avanzada ni filtros más allá de la categoría venta/alquiler.
Área de negocio
Ventas
Presupuesto
CRC 700000 – 3000000
Categorías
Aplicación web API / Backend
Tecnologías
React Node.js PostgreSQL HTML CSS JavaScript Git
Stack sugerido
* React — interfaz de usuario interactiva y responsive
* Node.js — API REST para gestión de inmuebles
* PostgreSQL — base de datos relacional para almacenar propiedades y consultas
* HTML/CSS — estructura y estilos básicos del sitio
* Git — control de versiones del código
```

## Veredicto
FALLA por P8. P9 presente en el turno 1 pero no propagado.

---

# Resumen de resultados (Casos 22–28)

| Caso | Negocio | P8 (exclusiones inventadas) | P8b (datos inventados) | Otras fallas | Veredicto |
|------|---------|-----------------------------|------------------------|--------------|-----------|
| 22 | Red social club | mensajería privada, push, pagos, redes externas, notif. tiempo real, mensajería interna | — | — | Guard PASA / Propuesta FALLA (P8) |
| 23 | Inventario tienda | proveedores, compras, ventas en línea, email/SMS | — | P9 (t1) | Guard PASA / Propuesta FALLA (P8) |
| 24 | Restaurante | reportes avanzados | "varios meseros" | P2/P3 (t1) | FALLA (P8 + P8b) |
| 25 | Consultorio médico | integración con sistemas externos | — | P2 latente (t1) | FALLA (P8, una coletilla) |
| 26 | Academia inglés | pagos, videoconferencia, pasarelas, certificados | "cursos presenciales y en línea" | — | FALLA (P8 + P8b) |
| 27 | Entrenador personal | push, pagos, análisis, integraciones, reportes | — | P10 (Firebase supuesto) | FALLA (P8) |
| 28 | Inmobiliaria | integraciones, búsqueda/filtros, contratos | — | P9 (t1) | FALLA (P8) |

**Observaciones de conjunto (solo descriptivas):**
- Las 7 propuestas generadas presentaron P8. Ninguna salió sin invención de exclusiones.
- P8b (invención de datos de negocio en la prosa) apareció en 2 de 7 (24, 26).
- P9 (pregunta técnica de canal en el turno 1) apareció en 2 de 7 (23, 28); en ambos, la generación decidió el canal por su cuenta y no se propagó a la propuesta.
- P10 (stack como supuesto) apareció en 1 de 7 (27).
- P2/P3 (cobro ofrecido/preguntado sin pedido) apareció en 24 (pregunta dedicada) y 25 (latente en el menú).
- Las exclusiones legítimas —temas que el empresario mencionó o rechazó explícitamente— se documentaron correctamente en todos los casos donde aparecieron (24, 25).
- Los guards de comportamiento se cumplieron: no sobre-gating y stack proporcional en 22; `involucra_ia` coherente y proporcionalidad en 23.
