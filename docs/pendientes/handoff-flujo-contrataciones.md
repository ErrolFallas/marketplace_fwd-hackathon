# Handoff — Rediseño del flujo de contratación / entregables

> Documento de traspaso entre sesiones de Claude Code. Snapshot del estado de diseño
> ANTES de empezar a codificar. Si estás retomando: leé esto completo, luego seguí con
> "Decisiones abiertas". La fuente funcional es el SRS (RF-37, RF-40..44); las restricciones,
> `reglas.md`.

## Progreso (rama `errol`, 2026-07-04)

Commits (todos autor Errol, sin co-autor):
- **Tanda 0.1** negociación BD (acuerdo_aceptado_at + trigger candado/mínimo + RPC aceptar): `0337406` — APLICADA.
- **Tanda 0.2** entregables expand BD (tabla `entregable_tareas` + `id_tarea` + backfill): `49176fd` — APLICADA.
- **Tanda B.1** entregables-2niveles-ui BD aditiva (`entregables.descripcion` + UPDATE policy de tareas): dentro de `c24bf68` — APLICADA.
- **Etapa 1** adjudicación global (UI, botón global + selector + redirect): `a7d80a1`.
- **Etapa 2 Parte A** contrato + pantalla `contrataciones/[id]` (id = id_proyecto): `402ff6c` — ContratoCard (monto/condiciones/candado), query getContratacionParaGestion, action actualizarPropuestaContratacion, redirects repuntados, namespace i18n Contrataciones.
- **Etapa 2 Parte B (fundación)** query `getTareasByContratacion` + action `abrirTarea`: `c24bf68`.

- **Etapa 2 Parte A** contrato + pantalla `contrataciones/[id]` (id=proyecto): `402ff6c`.
- **Etapa combinada 2-niveles B.2/B.3** (backend del loop): `b68008e` — `registrarEntregable` acepta idTarea+descripcion; `subirPropuesta` (egresado sube dentro de tarea, una a la vez); `abrirTareaEgresado`; `responderEntregable` cierra la tarea al aprobar.

DECISIÓN (consejo, 3 de 4): el 2-niveles se construye para AMBOS roles a la vez, NO empresario-only (sería "loop de cero" + fabrica estado inválido). Plan aprobado en el archivo de plan de Claude.

B.4 parte 1 (empresario): HECHA — `17b9d30`. `TareaCard` + `EntregablesTareas` (compuesto, orphan-aware) + query `getEntregablesHuerfanos` + `empresario/contrataciones/[id]` usa EntregablesTareas + calificar + 48 claves i18n (namespace Contrataciones). Build OK, 715 tests. Los componentes son role-aware (`rol='empresario'|'egresado'`) y ya soportan al egresado — falta solo cablearlo.

B.4 parte 2 (egresado wiring): HECHA — `361616a`. `EntregablesClient` usa `EntregablesTareas` (rol egresado), dropzones planas fuera, la página carga tareas+huérfanos, limpieza de código muerto (−440 líneas). **El loop de entregables 2-niveles está COMPLETO en ambos roles** (build OK, 715 tests).

Follow-up chico (anti-basura): borrar `subirHito`/`subirEntregableFinal` de `deliverables/actions.ts` — ya nadie las llama desde UI; solo las referencian sus 11 tests en `actions.test.ts`. Al borrarlas, repuntear esos tests a `subirPropuesta` (cubren `registrarEntregable`: dedup/versión/verificación) para no perder cobertura. NO borrar sin repuntear.

Pendiente de verificación interactiva (la hace el usuario, muta prod): proyecto de prueba adjudicado → empresario abre tarea → egresado sube propuesta → empresario pide cambios → egresado re-sube → aprueba (parcial cierra; final finaliza). Confirmar persistencia con MCP read-only.

Etapa 4 (egresado ve/acepta el contrato): HECHA — `948615e` (E4.1/4.2) + `bc514f5` (E4.3). Ruta decidida por consejo (unánime): Opción A, extender `projects/[id]/entregables` (NO crear `contrataciones/[id]`: churn cosmético; la asimetría con el empresario tiene causa histórica). `getMiContratacion` ampliada (monto/condiciones/acuerdo_aceptado_at/presupuesto); action `aceptarAcuerdo` con candado optimista (compara lo visto vs actual → `contrato_cambio`) + mapeo errcodes RPC; `ContratoCardEgresado` (lectura + aceptar con confirmación + solicitar cambios vía `enviarMensaje` + chat); banner "has sido contratado" en el detalle de applications. "Reubicar calificar" se DISOLVIÓ: ya vive en la zona de trabajo del egresado. Sin migración. Build OK, 715 tests.

Follow-ups (ambos HECHOS):
1. HECHO `1332ece`: borradas `subirHito`/`subirEntregableFinal`; sus tests migraron a `subirPropuesta` (cubren su lógica de tarea + los paths de `registrarEntregable`). `SubirEntregableSchema` → tipo plano.
2. HECHO `b441393` (migración `20260704150000`, aplicada por Samir): candado ATÓMICO en la RPC `aceptar_acuerdo_contratacion` (3 params monto/condiciones esperados + `for update` de la fila + errcode P0008). Se eliminó el TOCTOU y se borró el pre-chequeo en JS; `database.ts` sincronizado a mano. La RPC es la única fuente de verdad del candado.

Verificación interactiva pendiente (la hace el usuario, muta prod): (a) loop de entregables 2-niveles (empresario abre tarea → egresado sube propuesta → pide cambios → re-sube → aprueba); (b) egresado entra a su zona → ve el contrato → acepta (se congela) o solicita cambios (llega mensaje+email a la empresa).

Etapa 3 (EN CURSO) — reencuadrada por feedback a "utilidad y navegación del entorno de trabajo" (no solo compactar). Término canónico: "Entorno de trabajo" (`Common.workspace`) + "Abrir chat" (`Common.openChat`), un solo icono cada uno (Briefcase / MessageSquare), en todas las superficies.
- 3a HECHO `3286e2e`: `ContratacionesList` (empresario) a grid de 2 columnas por utilidad (avatar/nombre → perfil, sin caja anidada; primario "Entorno de trabajo" accent; "Ver postulación" secundario quieto). `MisContratacionesList` (egresado) primario unificado. Limpieza `viewEntregables`/`viewDeliverables`; `verMotivacion`→`verPostulacion`.
- 3b HECHO `bdfaa37`: chat global a nivel de página en el entorno del egresado (fuera del `ContratoCardEgresado`); empresario alineado a `Common.openChat` (se borró `Contrataciones.chatButton`).
- 3c HECHO: puentes de navegación — en `MensajeriaWorkspace` (header del hilo, ambos roles) botón "Entorno de trabajo" (la lista de conversaciones ya está pre-filtrada a contratada/finalizada → cero consulta extra, usa `rol` + `selectedConv.idProyecto`); en el detalle de proyecto del egresado (`projects/[id]`), botón "Entorno de trabajo" gateado por `getMiContratacion(id) != null`.

Etapa 3 COMPLETA (3a `3286e2e` + 3b `bdfaa37` + 3c `de44db3`). Build OK, 716 tests. Vocabulario unificado "Entorno de trabajo"/"Abrir chat" en tarjetas, entornos, mensajería y detalle de proyecto.

Fixes de utilidad/modelo (post-Etapa 3, por feedback del usuario):
- `b261538`: sidebar consistente — `contrataciones/[id]` alineado al patrón dominante (sidebar a ras, main max-w-5xl); las 3 pantallas profundas del egresado (`projects/[id]`, `/entregables`, `/apply`) pasan de Navbar pelado a `EgresadoShell` (recuperan el sidebar).
- `50c764d` (migración `20260704160000`, aplicada por Samir): **finalizar la contratación es GLOBAL** (RPC `finalizar_contratacion(p_id_contratacion)`), desacoplado del entregable "final". Las tareas quedan planas (sin parcial/final; `abrirTarea` inserta siempre `parcial`); `responderEntregable` ya NO finaliza al aprobar (solo cierra la tarea); botón "Finalizar contratación" en `ContratoCard` (empresario, confirmación, solo si vigente). El enum `tipo_entregable` se dejó intacto (los `final` legacy quedan en proyectos ya finalizados).

Etapa 5 (EN CURSO) — propuesta multi-evidencia + drill-down por entregable + rutas:
- Fundación HECHA `e285e78` (migración `20260705120000` aplicada + `database.ts` a mano): `entregables.url_enlace`, enum `tipo_adjunto_enum`, tabla `entregable_adjuntos` (RLS espejo select ambas partes / insert egresado verificado; sin update/delete). Los archivos van al bucket `entregables` (sin MIME restringido). Caveat: el bucket no tiene policy DELETE → limpieza best-effort ante fallo deja huérfanos.
- Decisiones del usuario: propuesta = **descripción OBLIGATORIA** + **al menos una evidencia** (link | PDF | ≥1 imagen); **varias imágenes** (tabla hija); drill-down **POR ENTREGABLE** (la "tarea" del esquema = "entregable" en la UI). Base del egresado: **opción B** (mover a `egresado/contrataciones/[id]`, espejo del empresario). Diseño (skill design): "tira de evidencia" como firma; 3 colores — link=primary/`ExternalLink`, PDF=secondary/`FileText`, imagen=accent/miniatura; form = descripción + input de link + UN dropzone de archivos auto-clasificado (PDF/imagen); vista = descripción + tira de evidencia + veredicto.
- **Backend HECHO** `f7a1333`: `subirPropuesta` multi-evidencia (FormData: `idTarea`, `idProyecto`, `descripcion` [req], `urlEnlace` [opcional], `archivos` [getAll; PDF/PNG/JPG/WEBP; máx 10]; regla "al menos uno" → err `evidencia_requerida`; otros errores `tipo_no_permitido`/`adjuntos_fallidos`/`storage_error`/`version_conflict`/`database_error`). `PropuestaEntregable` ahora expone `url_enlace: string|null` + `adjuntos: {id_adjunto,tipo,archivo_url,orden}[]` (getTareasByContratacion + getEntregablesHuerfanos los traen). `getSignedUrlAdjunto(idAdjunto)` firma para AMBAS partes (vía RLS). `registrarEntregable` eliminado (inline). Build OK, 718 tests.
- **UI de propuesta (TareaCard) HECHA** `0a1fde4`: form multi-evidencia (descripción req + input link + dropzone multi-archivo con chips) → `subirPropuesta`; vista "tira de evidencia" (link=primary/`ExternalLink`, PDF=secondary/`FileText`, imagen=accent/`FileImage` vía `getSignedUrlAdjunto`; descarga legacy del `archivo_url` huérfano conservada). Esto además destapó la regresión del backend (el form mandaba `file` único). El flujo INLINE actual (EntregablesClient→EntregablesTareas→TareaCard) ya sube multi-evidencia. Build OK, 718 tests. La imagen se abre en pestaña (no miniatura real — mejora futura, evita firmar eager con URLs que expiran).
- **Drill-down + rutas HECHO** `168783c`: `EntregablesTareas` ahora renderiza tarjetas compactas (badge de estado vía `computeEstadoEntregable` + "Ver propuestas") que enlazan a `(rol)/contrataciones/[idProyecto]/entregables/[idEntregable]` (rutas nuevas para ambos roles, renderizan `TareaCard` de UN entregable). Query `getTareaDetalle`. Egresado movido a `egresado/contrataciones/[id]`; `projects/[id]/entregables` ahora redirige; 5 links + revalidatePaths + URLs de notificación/email actualizados. Lógica pura `entregable-estado-logic` + tests. 723 tests, build OK.
- **Repo del empresario HECHO** `ea4fb29`: el empresario ve el `url_repositorio_proyecto` (pill read-only) en `contrataciones/[id]`.
- **Barra slim del egresado HECHO** `8b83f36`: recortada a solo fecha inicio/fin (decisión del usuario); se quitó el badge de periodo (duplicaba `ContratoCardEgresado`) y el repo URL (duplicaba el editor). Se borró el `PERIODO_CONFIG` local (duplicaba `periodo.ts`) + import `ExternalLink`.
- **ETAPA 5 COMPLETA.** Multi-evidencia end-to-end: backend + form/tira de evidencia + drill-down por entregable + rutas `contrataciones/[id]` espejadas + repo del empresario. 723 tests, build OK. Falta solo verificación interactiva end-to-end (la hace el usuario en localhost tras rebuild) y, cuando toque, las etapas DESPUÉS de acá (Cancelar contratación + Etapa 6 notificaciones).
- **Fix de ruido de log HECHO** `38dd0a7` (surgió probando Etapa 5, no es parte del flujo): `getMarketplaceProjectById` (`lib/projects/marketplace.ts`) usaba `.single()` → un no-participante abriendo un proyecto no publicado recibía 0 filas del RLS y se logueaba `PGRST116` a nivel **error**. Ahora `.maybeSingle()`: fila nula → `logger.warn` + `err('not_found')`; error real de BD → sigue `error`+`database_error`. Comportamiento visible sin cambios (404 esperado). Tests migrados a `maybeSingle`.
- **Verificación interactiva PENDIENTE** (la hace el usuario tras `npm run build` + `npm run start`): egresado abre entrega → sube descripción + link + imágenes → empresario entra al detalle → ve la tira de evidencia → aprueba/pide cambios. Confirmar en la BD (MCP read-only) que el adjunto se insertó y que el RLS de `entregable_adjuntos` deja leer a ambas partes.
- **ETAPA 6 (parcial) HECHA** `30046a0`: notificación `evaluacion_recibida` cableada en `rateEgresado` y `rateCompany` (in-app + email, ambas direcciones) vía helper best-effort `notificarEvaluacionRecibida` + lógica pura `evaluacion-notificacion-logic` (con test) + plantilla de correo `evaluacion-recibida` + `content.evaluacion_recibida` en es/en + `evaluacion_recibida` sumado a `TIPOS_CON_PLANTILLA`. **Además** (paridad pedida por el usuario): el perfil del empresario ahora muestra la **lista de reseñas recibidas** (`getMisCalificacionesRecibidasEmpresa` con admin acotada al propio empresario + `CompanyReviewsReceived`), no solo el número de reputación. Cero migración. 727 tests, build OK. **Verificación interactiva PENDIENTE** (usuario): calificar en ambos sentidos → llega campana + correo; y ver la lista en `/empresario/perfil`.

## Pendientes DESPUÉS de Etapa 5 (detallados para retomar)

### A. Cancelar contratación + calificar-en-cancelado
**DISEÑO CERRADO (consejo unánime + usuario):** cancelar solo cancela (contrato + proyecto → `cancelado`, terminal). NO auto-republica. Para rehacer, un **botón "Republicar" manual** que clona el proyecto a un **id nuevo con COPIA EXACTA** (no pasar por el form/IA: la IA reformula y el producto puede no gustar). Se puede calificar también en `cancelado` (reseñas atribuidas/visibles — memoria `moderacion-resenas-politica`).
- **Migración PROPUESTA para Samir ESCRITA:** `docs/pendientes/cancelar-contratacion-migracion-samir.md` (RPC `cancelar_contratacion(p_id_contratacion, p_motivo)` espejo de `finalizar_contratacion` + ampliar RLS de `evaluaciones_empresarios` a `in ('finalizado','cancelado')`). NO está en `supabase/migrations/` a propósito (no aplicar sin Samir). **PENDIENTE: que el usuario se la pase a Samir y él la apruebe/aplique.**
- **Republicar (clon copia exacta) DIFERIDO a propósito:** copia columnas de `proyectos`, y `proyectos` está mutando (la migración ajena `20260706120000` le agrega `requerimientos_funcionales`). Escribir el clon contra un esquema en movimiento dejaría columnas afuera. Definir el mecanismo (RPC `SECURITY DEFINER` vs server action) cuando el esquema de `proyectos` se estabilice.
- **Follow-ups de APP (después de que Samir apruebe la migración; sin migración):**
  - `rateEgresado`/`rateCompany`: hoy chequean `estado_periodo === 'finalizado'`; deben aceptar también `'cancelado'`. (La RLS de `evaluaciones` empresario→egresado NO restringe estado, solo la server action.)
  - **UI:** botón "Cancelar contratación" en `ContratoCard` (empresario, junto a "Finalizar", textarea de motivo + confirmación, solo si `vigente`). Las cards de calificar (hoy gateadas a `finalizado` en `EmpresarioRatingCard` + branch finalizado de `EntregablesClient`/`ContratoCardEgresado`) → mostrar en `finalizado` OR `cancelado`. Aviso in-page (dialog/banner) de que el proyecto quedó cancelado y aparece "Republicar" en su lista.

### B. Etapa 6 — Notificaciones faltantes
- **`evaluacion_recibida`: HECHO** `30046a0` (ver progreso arriba). Cableado en `rateEgresado` + `rateCompany` (in-app + email, ambas direcciones) + lista de reseñas en el perfil del empresario. Falta solo la verificación interactiva del usuario.
- **Contratación finalizada:** `finalizarContratacion` hoy no notifica. Emitir aviso al egresado ("el proyecto se finalizó, ya podés calificar"). Preferir reusar un tipo existente; un tipo nuevo sería migración de enum (Samir) — evaluar si amerita. (Único pendiente de Etapa 6.)
- **Ya cubiertos (NO tocar):** propuesta subida (`entregable_enviado`), veredicto (`entregable_aprobado`/`rechazado`), solicitar cambios del contrato (vía `enviarMensaje` → `mensaje_nuevo` + email).
- Tests de la lógica pura nueva + verificar paridad i18n es/en + rebuild (localhost = build de prod).

---

> **Lo que sigue (§0–§7) es el SNAPSHOT ORIGINAL "antes de codificar" (2026-07-04).** Quedó SUPERADO por el
> progreso de arriba: casi todo se implementó y varias decisiones cambiaron. Útil aún como REFERENCIA:
> **§1 (hechos de esquema), §2 (rutas/archivos) y §3 (MCP) siguen siendo válidos**. En cambio **§5 (decisiones
> abiertas) y §7 (plan por etapas) ya están resueltos/renumerados** — no los tomes como pendientes. Ante
> conflicto, MANDA el progreso de arriba.

## 0. Objetivo (reframe importante)

El pedido original sonaba a "construir el flujo de contrataciones desde cero". **No es así: ~70%
ya existe y funciona.** El trabajo real es **reestructurar y consolidar**, más una única pieza de
backend genuinamente nueva (la capa de negociación del contrato).

### Ya existe hoy (NO reconstruir)
- Tabla `contrataciones` (creada por trigger al adjudicar) con columnas `monto_acordado`,
  `condiciones_especiales`, `moneda`, `estado_periodo`, `motivo_cancelacion`, fechas.
- RPC atómico `adjudicar_participacion(p_id_participacion, p_id_proyecto)`: ganador→`contratada`,
  resto→`no_seleccionada`, proyecto→`adjudicado`; el trigger crea la contratación.
- Ciclo completo de entregables: subir hito/final, versionado, aprobar/pedir cambios con
  comentario, hilo `comentarios_entregables`, RPC `finalizar_proyecto_por_entregable`.
- Campo `participaciones.url_repositorio_proyecto` + RPC `actualizar_url_participacion`.
- Rutas `contrataciones` (listado) para ambos roles.
- Calificar en ambas direcciones (`evaluaciones`, `evaluaciones_empresarios`), gateado a `finalizado`.
- Mensajería (por proyecto) y notificaciones (in-app + email).

### La delta real a construir
1. Adjudicación: mover el botón "Contratar" de por-participación a **global**, gateado por
   "≥1 en revisión", con **selector de candidatos** (excluye `enviada`), y **redirigir a
   `contrataciones/[id]`** al confirmar.
2. Crear las pantallas **`contrataciones/[id]`** (empresario y egresado) como zona de trabajo
   consolidada. Hoy NO existen: el detalle está partido en la sub-ruta `entregables` + calificar suelto.
3. **Capa de negociación del contrato** (lo único nuevo en backend): `monto`/`condiciones`
   editables por el empresario, egresado acepta/solicita-modificaciones, **candado** al aceptar.
4. Rediseñar tarjetas de los listados (más compactas).
5. Botón "Felicitaciones, has sido contratado → zona de trabajo" en `egresado/applications` (+ detalle).
6. Botón "ir al chat" dentro de `contrataciones/[id]`.
7. Reubicar "calificar" dentro de `contrataciones/[id]`.
8. Reestructurar entregables a modelo de 2 niveles (tarea → propuestas). Ver §4.

## 1. Hechos de esquema (verificados leyendo migraciones — usar nombres EXACTOS)

**`participaciones.estado`** enum: `enviada | en_revision | contratada | no_seleccionada | retirada | finalizada | cancelada`.
Máquina de estados (trigger, solo rol `authenticated`):
- `enviada → en_revision | retirada`
- `en_revision → contratada | no_seleccionada | retirada`
- `contratada → finalizada | cancelada`
- `no_seleccionada`, `retirada`, `finalizada`, `cancelada` = terminales.
Campo URL repo: `url_repositorio_proyecto varchar(150)`. "adjudicado" es estado del PROYECTO, no de la participación.

**`contrataciones`**: `id_contratacion`, `id_participacion` (UNIQUE, 1:1), `fecha_inicio/fin_estimada/fin_real`,
`monto_acordado decimal(12,2)` (nullable), `moneda` (default USD), `condiciones_especiales text` (nullable),
`estado_periodo` enum `vigente|pausado|finalizado|cancelado` (default vigente), `motivo_cancelacion`, `updated_at`.
RLS: SELECT ambas partes; INSERT/UPDATE **solo empresario dueño**; **el egresado NO tiene escritura**.

**`entregables`** (hoy PLANO, una fila = una versión): `id_entregable`, `id_contratacion`,
`tipo_entregable` (`parcial|final`), `version int` (UNIQUE `(id_contratacion, version)`), `archivo_url varchar(150)`,
`estado` (`enviado|en_revision|aprobado|con_cambios`), `cargado_at`, `updated_at`, `comentario_empresario text`,
`archivo_hash` (SHA-256, dedup parcial). Autor se deriva por contratación→participación→estudiante.
Triggers: proyecto debe estar en `adjudicado/en_desarrollo`; `final` fuerza `estado='en_revision'` al insertar.
RLS: SELECT ambas partes; INSERT solo estudiante; UPDATE ambos con `estado <> 'aprobado'` (aprobación irreversible).

**`comentarios_entregables`**: `id_comentario_entregable`, `id_entregable`, `id_autor`, `contenido`,
`tipo_comentario` (`revision_solicitada|aclaracion|aprobacion|rechazo`), `comentado_at`.

**`evaluaciones`** (empresario→egresado): `id_contratacion`, `id_empresario`, `id_estudiante`, `puntuacion 1..5`,
`comentario`, `respuesta_evaluado`. UNIQUE `(id_contratacion, id_empresario)`. INSERT exige `estado_periodo='finalizado'`
(solo en server action `rateEgresado`; el RLS de esta tabla NO lo restringe explícitamente).
**`evaluaciones_empresarios`** (egresado→empresario): análogo; UNIQUE `(id_contratacion, id_estudiante)`.
INSERT restringido a `estado_periodo='finalizado'` **en RLS**.

**`proyectos.estado`** enum: `borrador|abierto|en_recepcion|adjudicado|en_desarrollo|finalizado|cancelado`.
Sin máquina de estados en BD (las transiciones las hacen RPC/app). `presupuesto_min/max decimal(12,2)` **nullable**;
solo CHECK `min <= max` (NOT VALID). NO hay cotas absolutas.

**RPCs clave**: `adjudicar_participacion`, `finalizar_proyecto_por_entregable(p_id_entregable, p_comentario)`
(aprueba final → proyecto/contratación/participación a `finalizado`, habilita calificar),
`actualizar_url_participacion(p_id_participacion, p_url)` (SECURITY DEFINER).

**Notificaciones**: enum `tipo_notificacion_enum` incluye `participacion_contratada`, `participacion_no_seleccionada`,
`entregable_enviado`, `entregable_aprobado`, `entregable_rechazado`, `participacion_en_revision`,
`evaluacion_recibida` (¡existe pero NINGÚN productor lo emite hoy!). Se crean desde server actions con admin client
(la tabla no tiene policy de INSERT); única excepción SQL: `plazo_vence` vía pg_cron.

## 2. Rutas y archivos (App Router; el segmento de rol NO va en la URL, son route groups)

- Empresario detalle proyecto: `src/app/[locale]/(company)/empresario/proyecto/[id]/` (page + `ProjectDetailClient.tsx`).
  Participaciones: `src/components/features/projects/ParticipationsPanel.tsx`; lógica `src/lib/projects/project-detail-logic.ts`;
  actions `src/lib/projects/project-detail.ts` (`adjudicarParticipacion:422`, `setParticipacionEstado:212`).
  El botón "Contratar" HOY es por-participación dentro de la card cuando `estado==='en_revision'`.
- Egresado postulaciones: `src/app/[locale]/(app)/egresado/applications/` (+ `[id]/`). Queries `src/lib/applications/queries.ts`.
- Contrataciones listado: `(company)/empresario/contrataciones/page.tsx` → `ContratacionesList.tsx`;
  `(app)/egresado/contrataciones/page.tsx` → `MisContratacionesList.tsx`.
- Entregables (hoy = "detalle"): empresario `proyecto/[id]/entregables`, egresado `egresado/projects/[id]/entregables`
  (`EntregablesClient.tsx` — ahí vive el editor de URL repo y el botón de calificar empresa).
  Actions: `src/lib/deliverables/actions.ts` (`subirHito`, `subirEntregableFinal`, `responderEntregable`,
  `comentarEntregable`, `actualizarUrlProyecto`).
- Evaluaciones: empresario→egresado `src/lib/evaluaciones/actions.ts` (`rateEgresado`), UI `EmpresarioRatingCard.tsx`
  en `empresario/portafolio-egresado/[id_participacion]`. Egresado→empresa `src/lib/company/ratings.ts` (`rateCompany`),
  UI `EmpresaRatingCard.tsx` en `egresado/empresa/[id]`.
- Mensajería: por `id_proyecto`. Link directo: `/{locale}/{empresario|egresado}/mensajes?proyecto=<idProyecto>`.
  Enviar solo si participación `contratada`; `finalizada` = solo lectura.
- Supabase clients: `src/lib/supabase/{server,admin,client}.ts`. Guards: `src/lib/auth/guards.ts`
  (`requireRole`, `requireVerifiedEgresado`, `requireVerifiedEmpresario`).
- Sistema de diseño: `PageTitle`, `InsightSection` (en `src/components/features/brand/`), `Button` variants
  (`src/components/ui/button.tsx`: default/secondary/accent/magenta/warning/highlight/outline/ghost/link),
  `SectionLabel`, `ImageCropModal` (en `src/components/features/shared/`).
- i18n: `src/messages/{es,en}.json`. Namespaces existentes relevantes: `Mensajes`, `Notifications`,
  `CompanyPostulations`, `ProjectDetail`, `Egresado`, `Empresa`, `Status`. **Falta** namespace `Contrataciones`.

## 3. MCP de base de datos `fwd-db-env`

- Tool `mcp__fwd-db-env__query`: conecta como `postgres` a `db.vnamdoocvzaholoftqja.supabase.co:5432` pero es
  **READ-ONLY** (solo SELECT; NO aplica DDL ni migraciones). Sirve para **verificar el esquema real contra el mapeo**.
- **VERIFICADO (2026-07-04): es la BD del equipo, sincronizada** — 7/7 tablas clave, 77 migraciones, última
  `20260629194833` (coincide con el último archivo de `supabase/migrations/`). Datos reales: 21 proyectos,
  19 participaciones, **9 contrataciones, 5 entregables** → migración de reestructura DEBE contemplar backfill.
- Config: `.mcp.json` en el subdirectorio + COPIA en la raíz de arriba (Claude Code arranca ahí). IPv6-only.
  Distinto del MCP `claude.ai Supabase` (ese apunta a BD equivocada).
- Las migraciones NO se aplican vía MCP: siguen el proceso con **Samir** + `npx supabase` (ver CLAUDE.md).

## 4. Modelo de entregables acordado (2 niveles) — reemplaza el plano actual

Acordado con el usuario: flujo de revisión de 2 niveles (más fiel a RF-42/44 que el modelo plano).

- **Entregable (tarea)** — tabla NUEVA (p.ej. `entregable_tareas`). La abre empresario ("quiero esto") o
  egresado ("hice esto"). Tipo `parcial|final`. Estado propio `abierta|aprobada`. Más recientes arriba.
- **Propuesta (versión)** — la tabla `entregables` EXISTENTE (conserva storage/hash/RLS ya probados), + `id_tarea` FK.
  `version` pasa a ser por-tarea. Estado por propuesta = el enum actual (`enviado/en_revision`=abierta,
  `aprobado`=me gustó, `con_cambios`=quiero cambios). Razones del empresario = `comentario_empresario` / hilo `comentarios_entregables`.
- Aprobar la propuesta de una tarea `final` dispara el `finalizar_proyecto_por_entregable` existente (contrato intacto).

**Riesgo:** toca la zona más delicada (RLS entregables + 3 RPCs). Hacerlo como etapa aislada y temprana,
con migración chica revisable, aplicada/verificada vía MCP, antes de que haya datos reales de contratación.

## 5. Decisiones ABIERTAS (bloquean el arranque — resolver al retomar)

**Entregables (5 puntos — TODOS DECIDIDOS 2026-07-04):**
1. Roles al abrir: ambos abren (empresario con requerimiento, egresado con "hice esto"+propuesta); veredicto SIEMPRE del empresario. DECIDIDO.
2. "Final": el empresario elige `parcial|final` al abrir; aprobar `final` finaliza todo (RPC existente). DECIDIDO.
3. Rechazar = queda `requiere cambios`, NUNCA se borra (historial/evidencia, RF-42). DECIDIDO.
4. Una sola propuesta "abierta" (esperando veredicto) a la vez POR entregable. DECIDIDO.
5. Propuesta = descripción + archivo/link OPCIONAL por ronda; + URL general del repo bien visible. DECIDIDO.

Consecuencias derivadas (asumidas, a confirmar si el usuario objeta):
- Si el egresado abre un entregable, es `parcial` por defecto; solo el empresario abre un `final`.
- Pueden coexistir varios entregables abiertos a la vez; "una propuesta a la vez" es DENTRO de cada entregable.

Implicación técnica Etapa 0: `tipo_entregable` (parcial/final) pasa al PADRE (tarea). El RPC
`finalizar_proyecto_por_entregable` chequea `tipo='final'` sobre la fila `entregables`; al mover tipo al padre
hay que denormalizar tipo al hijo o ajustar el RPC para join. El hijo conserva `id_contratacion`, así que la
cadena entregable→contratación→proyecto del RPC no se rompe.

**Forks (esperando respuesta):**
- A. `contrataciones/[id]`: ¿`[id]` = `id_contratacion` (recomendado) o `id_proyecto`?
- B. Consolidación: ¿reemplazar y redirigir rutas viejas (recomendado) o mantener ambas?
- C. Calificar: ¿solo `finalizado` (recomendado, RF-49) o también `cancelado` (pedido del usuario)?
- D. Entregables 2 niveles: **YA decidido a favor de 2 niveles** (§4).

**Modelo de contrato (esperando confirmación):**
- Contratación nace con `monto=null`; empresario propone `monto`+`condiciones` en `contrataciones/[id]`.
- `monto >= presupuesto_min` SI el proyecto lo tiene (nullable); sin tope superior.
- Egresado: "Aceptar" (RPC nuevo, setea candado) o "Solicitar modificaciones" (¿estado formal o solo abre chat?
  recomendado: solo notifica + abre chat).
- Tras aceptar: empresario no edita monto/condiciones (trigger/RLS), egresado no re-solicita.
- ¿La aceptación gatea subir entregables? recomendado: NO (independientes).
- Estado contratación manual: `finalizado`=automático; `cancelado`=nuevo botón empresario (¿qué pasa con
  proyecto/participación al cancelar?); `pausado`=¿se usa o se ignora?

## 6. Restricciones del proyecto (de reglas.md — no negociable)

Next.js 15 App Router (RSC por defecto). Supabase + **RLS en toda tabla nueva** + políticas explícitas + migración
versionada. next-intl es/en, **cero strings hardcodeados** (todo a `messages/{es,en}.json`). Zod en toda frontera.
Server actions devuelven `Result<T,E>`. Tokens FWD, **nunca hex suelto ni `#000`/`#fff`**. Sin emojis en código ni copy.
TypeScript strict, prohibido `any`. Naming: `PascalCase.tsx` componentes, `kebab-case.ts` utilidades. Mobile a 375px.

## 7. Plan por etapas (propuesto)

- **Etapa 0** — Esquema (veredicto del consejo 2026-07-04: expand-and-contract, tabla padre NO columna, escalonado):
  - **Tanda 0.1 — Negociación (aditiva):** `contrataciones += acuerdo_aceptado_at` + trigger que congela
    monto/condiciones al aceptar + RPC SECURITY DEFINER `aceptar_acuerdo_contratacion` (el egresado no tiene UPDATE).
    Ortogonal, cero impacto runtime. Va primera para calibrar aprobación con Samir.
  - **Tanda 0.2 — Entregables expand (aditiva):** crear `entregable_tareas` (padre; RLS espejando al hijo por
    `id_contratacion`; INSERT que permita a AMBAS partes crear el padre) + `entregables += id_tarea uuid NULL` +
    espejar `tipo` en el padre + backfill. `id_tarea` NULLABLE en esta fase.
  - **Tanda 0.3 — Entregables contract: NO aplicar hasta el final, con el código nuevo desplegado.**
    Hace `id_tarea NOT NULL` + `UNIQUE(id_contratacion,version) → UNIQUE(id_tarea,version)` + reescribir
    `finalizar_proyecto_por_entregable` para leer `tipo` del padre + `NOTIFY pgrst,'reload schema'`, TODO en
    una transacción. RAZÓN CRÍTICA para no aplicarla antes: el código actual `subirHito`/`subirEntregableFinal`
    inserta en `entregables` SIN `id_tarea`; si se hace NOT NULL antes de cablear el código que setea `id_tarea`,
    la próxima subida de hito de las contrataciones vigentes falla. Se aplica junto al deploy del código de
    entregables 2-niveles.

  ESTADO (2026-07-04): Tanda 0.1 APLICADA (commit 0337406, rama errol) y Tanda 0.2 APLICADA en remoto por el
  usuario. `database.ts` sincronizado a mano en ambas (typecheck limpio). Tanda 0.3 PENDIENTE hasta el final.
  Próximo paso: código de aplicación (Etapa 1 adjudicación global), NO más esquema.
  - **MINA VERIFICADA (read-only):** las 5 filas de `entregables` viven en 2 contrataciones cuyos proyectos están
    AMBOS `finalizado`. El trigger `validar_estado_proyecto_para_entregable` (exige adjudicado/en_desarrollo)
    RECHAZA cualquier UPDATE a esas filas → un backfill normal hace rollback total. Backfill debe correr con
    `session_replication_role='replica'` (superusuario) para bypassear el trigger. Agrupación legacy: UNA tarea
    por fila (5 tareas), porque una contratación mezcla parcial+final (no cabe bajo un padre con tipo único) y
    evita colisión del nuevo UNIQUE. Contrataciones `vigente` (7) no tienen entregables aún.
  - Aplicar SOLO por el proceso con Samir + `npx supabase`; verificar vía MCP read-only antes de cada aprobación.
- **Etapa 1** — Adjudicación global (proyecto/[id]): botón global + selector de candidatos + redirect.
  HECHA (commit a7d80a1, rama errol). El "Contratar" por-tarjeta pasó a CTA global gateado por >=1
  en_revision + diálogo selector (foto/nombre/prototipo); redirect al listado de contrataciones.
  Build de prod OK, 715 tests. Pendiente: verificación interactiva por el usuario (requiere abrir un
  sobre en prod). Cuando exista contrataciones/[id] (Etapa 2), repuntar el redirect al detalle.
- **Etapa 2** — `empresario/contrataciones/[id]`: contrato (monto/condiciones/estado), URL repo, entregables, calificar, chat.
- **Etapa 3** — `empresario/contrataciones` tarjetas compactas.
- **Etapa 4** — `egresado/contrataciones/[id]`: aceptar/solicitar-mod, URL repo, propuestas, calificar, chat (sin redirect auto).
- **Etapa 5** — `egresado/contrataciones` compactas + botón "contratado" en applications.
- **Etapa 6** — Notificaciones faltantes (`evaluacion_recibida`), i18n, tests, rebuild (localhost = build de prod).
