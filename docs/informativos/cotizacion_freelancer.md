# Calculadora de cotización freelance — Costa Rica

Documentación completa del sistema de cotización para desarrolladores freelance en Costa Rica. Este documento describe la lógica, fórmulas, datos de mercado y estructura de la calculadora para que pueda ser replicada o integrada en cualquier sistema.

---

## 1. Contexto del mercado costarricense (2025)

### 1.1 Salarios de referencia (empleado en empresa)

| Nivel | Experiencia | Salario mensual (₡) | Equivalente USD/mes | Tarifa hora implícita (₡) |
|---|---|---|---|---|
| Junior | 0–2 años | ₡1.200.000 – ₡1.800.000 | $230 – $350 | ₡7.500 – ₡9.000 |
| Mid-level | 2–5 años | ₡1.800.000 – ₡2.500.000 | $350 – $480 | ₡11.000 – ₡14.000 |
| Senior | 5–10 años | ₡2.500.000 – ₡3.500.000 | $480 – $670 | ₡16.000 – ₡22.000 |
| Senior especializado | +10 años / nicho | ₡3.500.000 – ₡4.500.000+ | $670 – $865+ | ₡22.000 – ₡30.000 |

> Fuentes: Talently (2024), TuSalario.org CR (2025), Glassdoor CR (2025), ConsultaRica (2024).

### 1.2 Cargas sociales patronales en Costa Rica

En Costa Rica un empleador debe pagar aproximadamente un **26.5% adicional** sobre el salario bruto:

| Carga | Porcentaje |
|---|---|
| CCSS (Seguro de Salud) | 9.25% |
| CCSS (Pensión IVM) | 5.42% |
| Banco Popular | 0.25% |
| IMAS | 0.50% |
| INA | 1.50% |
| Asignaciones Familiares | 5.00% |
| FODESAF | 0.50% |
| INS (Riesgos del Trabajo) | ~2.00% |
| Aguinaldo proporcional | ~8.33% |
| **Total estimado** | **~26.5% – 32%** |

Esto significa que un empleado con salario bruto de ₡1.500.000 le cuesta a la empresa aproximadamente ₡1.897.500/mes.

### 1.3 Horas facturables reales al mes

Un freelance no factura todas las horas del mes. El tiempo real cobrable oscila entre:

| Escenario | Horas facturables/mes |
|---|---|
| Conservador (reuniones, admin, errores) | 100 – 120 h |
| Promedio realista | 130 – 150 h |
| Óptimo (proyecto bien definido) | 150 – 170 h |

**Referencia estándar usada en la calculadora: 140 h/mes.**

### 1.4 Tarifas freelance recomendadas (₡/h) — 2025

La tarifa freelance debe cubrir: costo de vida + cargas sociales propias (CCSS trabajador independiente ~13.5%) + gastos operativos + utilidad. No se cobra por experiencia sino por el proyecto entregado.

| Referencia | Tarifa hora sugerida (₡) | Equivalente USD/h (₡520/$) |
|---|---|---|
| Mínimo viable freelance local | ₡7.000 – ₡9.000 | $13 – $17 |
| Mercado local promedio | ₡10.000 – ₡16.000 | $19 – $31 |
| Freelance con portfolio sólido | ₡15.000 – ₡22.000 | $29 – $42 |
| Cliente extranjero / remoto | $25 – $55 USD/h | $25 – $55 |
| Senior remoto especializado | $50 – $80 USD/h | $50 – $80 |

---

## 2. Principios de la cotización freelance

### 2.1 Se cobra por el proyecto, no por el nivel

El cliente paga por el entregable — la página web, el sistema, la aplicación. No le interesa si quien lo desarrolla tiene 2 o 10 años de experiencia. La tarifa es única por proyecto y refleja el valor del trabajo, no el perfil interno del desarrollador.

### 2.2 Una sola tarifa hora aplica a todos los módulos

Todos los módulos del proyecto (análisis, frontend, backend, base de datos, despliegue) se cobran a la misma tarifa hora definida por el freelance. El desglose por módulo le permite al cliente entender en qué se invierte el tiempo, no discriminar por tipo de tarea.

### 2.3 El idioma sí afecta la tarifa

Si el proyecto es en inglés, se aplica un recargo porque implica:
- Mayor precisión técnica en nomenclatura de código
- Comentarios y documentación en inglés
- Comunicación con stakeholders internacionales
- Potencial de revisión por equipos extranjeros

| Idioma | Multiplicador |
|---|---|
| Español | ×1.00 (base) |
| Bilingüe | ×1.10 (+10%) |
| Inglés | ×1.20 (+20%) |

---

## 3. Fórmulas de la calculadora

### 3.1 Variables de entrada globales

```
tarifa_hora       = tarifa por hora definida por el freelance (₡)
tc                = tipo de cambio ₡/$ (referencia: 520)
idioma_mult       = multiplicador por idioma (1.0 / 1.1 / 1.2)
margen_pct        = margen de utilidad en decimal (ej: 0.30 = 30%)
buffer_pct        = buffer de contingencia en decimal (ej: 0.20 = 20%)
```

### 3.2 Tarifa hora efectiva

```
tarifa_efectiva = tarifa_hora × idioma_mult
```

### 3.3 Costo por módulo

```
costo_modulo = horas_modulo × tarifa_efectiva
```

### 3.4 Total de horas con buffer

```
horas_base   = hA + hF + hB + hD + hDp
horas_total  = horas_base × (1 + buffer_pct)
```

El buffer cubre imprevistos técnicos, dependencias externas, cambios de alcance no previstos y tiempo de comunicación.

### 3.5 Costo de despliegue

**Si despliegue es gratuito (Vercel, Netlify, Railway…):**
```
recargo_gestion = costo_horas_deploy × 0.15
costo_deploy    = costo_horas_deploy + recargo_gestion
```
El cliente recibe infraestructura sin costo mensual; el recargo compensa la gestión técnica de haberla provisionado y configurado.

**Si despliegue es pago (VPS, AWS, GCP…):**
```
costo_servidor  = costo_server_mes_usd × meses × tc
costo_deploy    = costo_horas_deploy + costo_servidor
```

**Si servidor propio del cliente:**
```
costo_deploy = costo_horas_deploy
```

### 3.6 Suscripciones y licencias

```
total_subs = Σ (sub_activa_usd × tc)   para cada suscripción activada
```

Las suscripciones se suman al módulo de despliegue porque son costos operativos recurrentes que el proyecto genera.

### 3.7 Subtotal y total

```
subtotal      = cA + cF + cB + cD + cDp_total + total_subs
margen_crc    = subtotal × margen_pct
total_proyecto = subtotal + margen_crc
total_usd     = total_proyecto / tc
```

---

## 4. Módulos de la cotización

### 4.1 Análisis y diseño

Cubre todo el trabajo previo al código. Muchos freelances no cobran esto y terminan regalando horas de trabajo intelectual.

| Sub-tarea | Horas sugeridas (proyecto medio) | Descripción |
|---|---|---|
| Levantamiento de requerimientos | 6 – 12 h | Reuniones, formularios, definición de alcance |
| Diseño de arquitectura | 4 – 10 h | Stack tecnológico, estructura de carpetas, flujos de datos |
| Diseño UI/UX (Figma u otro) | 8 – 20 h | Wireframes, mockups, sistema de diseño |
| Documentación técnica | 2 – 6 h | README, especificaciones, contratos de API |
| Reuniones con cliente | 4 – 10 h | Demos, validaciones, revisiones |
| Prototipado | 4 – 16 h | Prototipo interactivo o estático para validación |

**Peso típico sobre el total del proyecto: 10–20%**

### 4.2 Frontend — interfaces de usuario

Se cobra por número de vistas y horas por vista, más trabajo transversal.

| Sub-tarea | Horas sugeridas | Descripción |
|---|---|---|
| Vistas / pantallas | n_vistas × h_vista | Cada pantalla única del sistema |
| Componentes reutilizables | 8 – 16 h | Botones, cards, modales, tablas, formularios |
| Responsive / móvil | 6 – 12 h | Adaptación para distintos breakpoints |
| Animaciones e interacciones | 2 – 8 h | Transiciones, micro-interacciones, loaders |
| Integración con APIs | 6 – 14 h | Consumo de endpoints, manejo de estados, errores |

**Horas por vista según complejidad:**

| Complejidad | Horas |
|---|---|
| Simple (listado, landing section) | 2 – 4 h |
| Media (formulario, tabla con filtros) | 5 – 8 h |
| Alta (dashboard, mapa, editor) | 10 – 20 h |

**Peso típico sobre el total del proyecto: 25–35%**

### 4.3 Backend — lógica de negocio y APIs

| Sub-tarea | Horas sugeridas | Descripción |
|---|---|---|
| Configuración inicial / boilerplate | 4 – 8 h | Setup del proyecto, variables de entorno, estructura |
| Lógica de negocio | 15 – 40 h | Reglas, cálculos, flujos, validaciones |
| Endpoints / APIs | n_ep × h_ep | Cada endpoint tiene su ciclo de vida completo |
| Autenticación / autorización | 8 – 16 h | Login, roles, permisos, JWT, OAuth |
| Testing y QA | 6 – 14 h | Pruebas unitarias, de integración, de carga |
| Integraciones de terceros | 4 – 12 h | APIs externas: pagos, correo, SMS, etc. |

**Horas por endpoint según complejidad:**

| Tipo de endpoint | Horas |
|---|---|
| CRUD simple (GET, POST, PUT, DELETE) | 1 – 2 h |
| Endpoint con lógica de negocio | 3 – 5 h |
| Endpoint con integraciones externas | 4 – 8 h |
| Endpoint con procesamiento asíncrono | 6 – 12 h |

**Peso típico sobre el total del proyecto: 30–40%**

### 4.4 Base de datos

| Sub-tarea | Horas sugeridas | Descripción |
|---|---|---|
| Modelado / ERD | 4 – 8 h | Diseño de entidades, relaciones, cardinalidades |
| Implementación de tablas / colecciones | 4 – 10 h | Creación real en el motor de BD |
| Migraciones / seeds | 2 – 6 h | Scripts de migración, datos iniciales |
| Optimización / índices / queries | 2 – 8 h | Índices, consultas complejas, procedimientos |

**Peso típico sobre el total del proyecto: 8–15%**

### 4.5 Despliegue y hosting

| Sub-tarea | Horas sugeridas | Descripción |
|---|---|---|
| Configuración de servidor / CI-CD | 4 – 16 h | Variables de entorno, pipelines, certificados SSL |

**Tipos de despliegue y lógica de costo:**

| Tipo | Costo infraestructura | Recargo al cliente |
|---|---|---|
| Gratuito (Vercel, Netlify, Railway free) | $0/mes | +15% sobre horas de configuración |
| Pago (VPS, AWS, GCP, DigitalOcean) | $5 – $200+/mes | Costo_servidor × meses de cobertura |
| Servidor propio del cliente | El cliente lo cubre | Solo se cobran las horas de configuración |

**Razonamiento del recargo en despliegue gratuito:** el cliente recibe un beneficio tangible (infraestructura sin costo mensual). El freelance dedicó horas a investigar, seleccionar y configurar esa infraestructura. El 15% reconoce ese valor sin cobrar hosting que no tiene costo real.

---

## 5. Suscripciones y licencias

Las suscripciones se incluyen en la cotización porque son costos que el proyecto genera y que el cliente debe asumir. Se expresan en USD/mes y se convierten a colones al tipo de cambio vigente.

| Servicio | Costo referencia (USD/mes) | Descripción |
|---|---|---|
| Pasarela de pagos (Stripe, PayPal) | $0 – $25 + % por transacción | Procesamiento de pagos en línea |
| Correo / SMTP (SendGrid, Resend) | $0 – $20 | Envío de correos transaccionales |
| Mapas / geolocalización (Google Maps) | $0 – $50+ | APIs de mapas, geocodificación |
| API de IA (OpenAI, Anthropic) | $5 – $100+ | Modelos de lenguaje, embeddings |
| BD gestionada (Supabase, PlanetScale) | $0 – $50 | Base de datos como servicio |
| Autenticación (Auth0, Clerk) | $0 – $35 | Gestión de identidad y acceso |
| Monitoreo (Sentry, Datadog) | $0 – $30 | Rastreo de errores y rendimiento |
| CDN / almacenamiento (Cloudflare, S3) | $0 – $25 | Entrega de activos estáticos |

**Importante:** las suscripciones que tienen plan gratuito también se deben mencionar porque representan un límite (usuarios, peticiones, almacenamiento). Si el proyecto crece, habrá un costo. El cliente debe saberlo.

---

## 6. Estructura de datos de la calculadora

### 6.1 Objeto de entrada (JSON)

```json
{
  "config": {
    "tarifa_hora_crc": 15000,
    "tipo_cambio": 520,
    "idioma": "en",
    "idioma_multiplicador": 1.2,
    "margen_pct": 30,
    "buffer_pct": 20
  },
  "analisis": {
    "h_requerimientos": 8,
    "h_arquitectura": 6,
    "h_ux": 12,
    "h_documentacion": 4,
    "h_reuniones": 6,
    "h_prototipado": 8
  },
  "frontend": {
    "n_vistas": 8,
    "h_por_vista": 6,
    "h_componentes": 10,
    "h_responsive": 8,
    "h_animaciones": 4,
    "h_integracion_api": 8
  },
  "backend": {
    "h_setup": 6,
    "h_logica_negocio": 20,
    "n_endpoints": 12,
    "h_por_endpoint": 2,
    "h_autenticacion": 10,
    "h_testing": 8,
    "h_integraciones": 6
  },
  "base_de_datos": {
    "h_modelado": 6,
    "h_implementacion": 8,
    "h_migraciones": 4,
    "h_optimizacion": 4
  },
  "despliegue": {
    "h_configuracion": 8,
    "tipo": "pago",
    "costo_server_usd_mes": 20,
    "meses_cobertura": 3
  },
  "suscripciones": [
    { "nombre": "Stripe", "costo_usd_mes": 20, "activa": true },
    { "nombre": "SendGrid", "costo_usd_mes": 15, "activa": false },
    { "nombre": "Google Maps", "costo_usd_mes": 10, "activa": false },
    { "nombre": "OpenAI", "costo_usd_mes": 30, "activa": false },
    { "nombre": "Supabase", "costo_usd_mes": 25, "activa": false },
    { "nombre": "Otra", "costo_usd_mes": 10, "activa": false }
  ]
}
```

### 6.2 Objeto de salida (JSON)

```json
{
  "tarifa_efectiva_crc": 18000,
  "tarifa_efectiva_usd": 34.62,
  "modulos": {
    "analisis":    { "horas": 44,  "crc": 792000,   "usd": 1523 },
    "frontend":    { "horas": 90,  "crc": 1620000,  "usd": 3115 },
    "backend":     { "horas": 74,  "crc": 1332000,  "usd": 2561 },
    "base_datos":  { "horas": 22,  "crc": 396000,   "usd": 761  },
    "despliegue":  { "horas": 8,   "crc": 144000,   "usd": 276  }
  },
  "hosting": {
    "tipo": "pago",
    "crc": 31200,
    "usd": 60
  },
  "suscripciones_total_crc": 10400,
  "horas_base": 238,
  "horas_con_buffer": 286,
  "subtotal_crc": 4325600,
  "margen_crc": 1297680,
  "total_crc": 5623280,
  "total_usd": 10814
}
```

---

## 7. Pseudocódigo de la lógica de cálculo

```
function calcular(input):

  // 1. Tarifa efectiva
  tarifa = input.config.tarifa_hora_crc × input.config.idioma_multiplicador

  // 2. Horas por módulo
  hA  = sum(input.analisis.*)
  hF  = (input.frontend.n_vistas × input.frontend.h_por_vista)
        + input.frontend.h_componentes
        + input.frontend.h_responsive
        + input.frontend.h_animaciones
        + input.frontend.h_integracion_api
  hB  = input.backend.h_setup
        + input.backend.h_logica_negocio
        + (input.backend.n_endpoints × input.backend.h_por_endpoint)
        + input.backend.h_autenticacion
        + input.backend.h_testing
        + input.backend.h_integraciones
  hD  = sum(input.base_de_datos.*)
  hDp = input.despliegue.h_configuracion

  // 3. Costos por módulo
  cA  = hA  × tarifa
  cF  = hF  × tarifa
  cB  = hB  × tarifa
  cD  = hD  × tarifa
  cDp = hDp × tarifa

  // 4. Costo de infraestructura
  if input.despliegue.tipo == "gratuito":
    infra = cDp × 0.15
  elif input.despliegue.tipo == "pago":
    infra = input.despliegue.costo_server_usd_mes
            × input.despliegue.meses_cobertura
            × input.config.tipo_cambio
  else:
    infra = 0

  // 5. Suscripciones
  subs = Σ (sub.costo_usd_mes × tc) para sub activa en input.suscripciones

  // 6. Totales
  deploy_total = cDp + infra + subs
  subtotal     = cA + cF + cB + cD + deploy_total
  margen       = subtotal × (input.config.margen_pct / 100)
  total_crc    = subtotal + margen
  total_usd    = total_crc / input.config.tipo_cambio

  horas_base   = hA + hF + hB + hD + hDp
  horas_buffer = horas_base × (1 + input.config.buffer_pct / 100)

  return {
    tarifa_efectiva: tarifa,
    modulos: { analisis: cA, frontend: cF, backend: cB, db: cD, deploy: deploy_total },
    horas_base, horas_buffer,
    subtotal, margen,
    total_crc, total_usd
  }
```

---

## 8. Reglas de negocio importantes

### 8.1 Buffer de contingencia (20% recomendado)

Siempre agregar un buffer al total de horas estimadas. Cubre:
- Imprevistos técnicos (bug en librería de terceros, deprecación de API)
- Cambios de alcance del cliente dentro del mismo proyecto
- Tiempo de comunicación y coordinación no facturado explícitamente
- Aprendizaje de tecnologías específicas del proyecto

### 8.2 Margen de utilidad (30% recomendado para freelance CR)

El margen no es "ganancia extra" — cubre:
- CCSS como trabajador independiente (~13.5% sobre ingresos)
- Impuesto sobre la renta (si aplica tramo)
- Períodos sin proyectos (vacaciones, entre contratos)
- Gastos operativos: internet, electricidad, equipo, licencias

### 8.3 El despliegue gratuito tiene valor

Si el freelance despliega en Vercel/Netlify/Railway (tier gratuito), el cliente recibe infraestructura sin costo mensual. Esto tiene valor económico real — el equivalente en AWS o DigitalOcean podría costar $10–$50/mes. El recargo del 15% sobre las horas de configuración reconoce ese valor gestionado.

### 8.4 Las suscripciones van en la cotización

Toda suscripción que el proyecto activa debe estar en el documento de cotización, aunque sea gratuita en el tier inicial. Razones:
- Transparencia: el cliente sabe qué servicios usa su sistema
- Responsabilidad: define quién paga qué después de entregado el proyecto
- Escalabilidad: el cliente entiende que al crecer habrá costos

### 8.5 Idioma en inglés justifica recargo

Un proyecto en inglés no es simplemente traducir textos. Implica:
- Nomenclatura técnica precisa en inglés (variables, funciones, clases)
- Documentación en inglés (README, comentarios, commits)
- Comunicación técnica con equipos o clientes anglófonos
- Mayor mercado potencial para el entregable — el cliente obtiene un producto con mayor alcance

---

## 9. Tabla de referencia rápida — cotización típica CR (2025)

### Proyecto tipo: landing page + formulario de contacto

| Módulo | Horas | Costo (₡15.000/h) |
|---|---|---|
| Análisis y diseño | 10 h | ₡150.000 |
| Frontend (5 secciones) | 20 h | ₡300.000 |
| Backend (3 endpoints) | 10 h | ₡150.000 |
| Base de datos | 4 h | ₡60.000 |
| Despliegue (Vercel) | 3 h | ₡45.000 + recargo ₡6.750 |
| **Subtotal** | **47 h** | **₡711.750** |
| Buffer 20% | +9 h | — |
| Margen 30% | — | ₡213.525 |
| **Total** | **56 h** | **₡925.275 ≈ $1.780 USD** |

### Proyecto tipo: aplicación web full-stack con autenticación

| Módulo | Horas | Costo (₡15.000/h) |
|---|---|---|
| Análisis y diseño | 44 h | ₡660.000 |
| Frontend (8 vistas) | 90 h | ₡1.350.000 |
| Backend (12 endpoints) | 74 h | ₡1.110.000 |
| Base de datos | 22 h | ₡330.000 |
| Despliegue (VPS $20/mes × 3) | 8 h + hosting | ₡120.000 + ₡31.200 |
| Suscripción Stripe | — | ₡10.400/mes |
| **Subtotal** | **238 h** | **₡3.611.600** |
| Buffer 20% | +48 h | — |
| Margen 30% | — | ₡1.083.480 |
| **Total** | **286 h** | **₡4.695.080 ≈ $9.029 USD** |

---

## 10. Prompt sugerido para integrar en otra IA

Si se quiere replicar esta calculadora en otro sistema de IA, el siguiente prompt resume la lógica completa:

```
Eres una calculadora de cotización para proyectos web freelance en Costa Rica.

VARIABLES GLOBALES:
- tarifa_hora_crc: tarifa única del freelance en colones
- tipo_cambio: ₡/$ (usar 520 como referencia 2025)
- idioma_mult: español=1.0, bilingüe=1.1, inglés=1.2
- margen_pct: porcentaje de utilidad (recomendado 30%)
- buffer_pct: contingencia sobre horas (recomendado 20%)

TARIFA EFECTIVA:
tarifa_efectiva = tarifa_hora_crc × idioma_mult

MÓDULOS (calcular costo = horas × tarifa_efectiva):
1. Análisis y diseño: requerimientos + arquitectura + UX + documentación + reuniones + prototipado
2. Frontend: (n_vistas × h_vista) + componentes + responsive + animaciones + integración_api
3. Backend: setup + lógica_negocio + (n_endpoints × h_endpoint) + autenticación + testing + integraciones
4. Base de datos: modelado + implementación + migraciones + optimización
5. Despliegue: h_config × tarifa_efectiva
   - Si gratuito: + 15% de recargo sobre costo horas deploy
   - Si pago: + (usd_mes × meses × tipo_cambio)
   - Suscripciones: Σ(usd_mes × tipo_cambio) por cada suscripción activa

TOTALES:
subtotal = Σ todos los módulos
margen   = subtotal × margen_pct
total    = subtotal + margen
usd      = total / tipo_cambio
horas_con_buffer = horas_base × (1 + buffer_pct)

REGLAS:
- El cliente paga por el proyecto, no por el nivel del desarrollador
- El despliegue gratuito tiene valor: siempre cobrar recargo de gestión
- Las suscripciones SIEMPRE van en la cotización aunque sean gratuitas
- Inglés = mayor esfuerzo técnico = recargo justificado
- El margen cubre CCSS independiente (~13.5%), impuestos y períodos sin proyecto
```

---

*Documento generado para contexto de integración — Costa Rica, 2025.*
*Tipo de cambio de referencia: ₡520 por USD.*
*Fuentes: Talently, TuSalario.org CR, Glassdoor CR, ConsultaRica, CCSS Costa Rica.*
