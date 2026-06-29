# Auditoría de cumplimiento SRS vs. código real

- **Fecha:** 2026-06-29
- **Rama analizada:** `origin/dev` (HEAD `70e1036`), no la rama `samir` (que estaba 99 commits detrás).
- **Método:** auditoría automatizada (28 agentes leyendo código real: `src/lib`, `src/app`, `supabase/migrations`, `messages`, `middleware`). Cada RF/RNF clasificado en completo / parcial / ausente con evidencia `archivo:línea`, más una pasada adversarial que intentó refutar todo lo marcado "completo", y reconciliación contra el tracker del equipo (`docs/pendientes`, `docs/auditorias`).
- **Caveat de confianza:** el audit leyó código pero NO pudo verificar contra la BD remota real (el MCP de Supabase apunta a otra cuenta). Todo lo que dependa de "¿la migración está aplicada?" es **muy probable**, no confirmado. Requiere validación de Samir contra la BD remota.

---

## Actualización 2026-06-29 — verificado contra la BD remota real

Después de esta auditoría se sincronizó `samir` con `dev` y se verificó contra el proyecto remoto real (`mgowuyflhiavquztxpqh`, vía el MCP `supabase` del `.mcp.json`). Correcciones a lo de abajo:

- **RF-64 / RF-17 bajan de "bloqueante" a "higiene de datos".** La migración geo `20260621120000` **SÍ está aplicada** en el remoto (`empresarios` tiene `pais_iso_sede`/`region_sede`), así que la cola de empresas NO se rompe por column drift. Las colas de verificación tienen **0 pendientes** (15 egresados + 8 empresas, todos verificados): están vacías porque no hay nadie pendiente, no por un bug. La causa "orphan rol-sin-perfil" ya está cerrada en código (`auth/profile.ts:61-134`: perfil primero, luego rol, con rollback). Quedan **7 cuentas huérfanas de prueba** (1 egresado + 6 empresarios, mismo timestamp de seed) — arrastre de datos de test, no usuarios reales atascados.
- **F1 aplicado** (commit en `samir`): `admin/validations` ahora muestra un error visible si la query de la cola falla, en vez de una lista vacía silenciosa.
- Los RF siguen en **parcial** por sus gaps de criterio reales (RF-64: cotejo por correo, no por título, y verificación manual, no agente; RF-17: validación no adaptada por tipo). Eso no cambió; lo que se corrige es la severidad del "bug".
- Pendiente de confirmar aún: si `20260621000000` (adjudicar) y `20260622200000` (entregable final) están aplicadas (afecta RF-37/39/41).

## La verdad incómoda

El porcentaje de "completo" está inflado por dos motivos:

1. **Algunos RF marcados "completo" dependen de migraciones cuya aplicación al remoto hay que confirmar** (`20260621000000` adjudicar-barre-sobres, `20260622200000` trigger entregable final → afectan RF-37/RF-39/RF-41). La geo `20260621120000` ya se verificó **aplicada** (ver "Actualización" arriba), así que la cola de empresas NO sale vacía por column drift.
2. **Varias pantallas que "se ven hechas" corren con datos quemados/mock** — penalización directa por `reglas.md §13`.

**El dato que más importa: 25 requerimientos Must sin cerrar** = 16 RF Must (todos parciales, 0 ausentes) + 9 RNF Must.

---

## 1. Resumen ejecutivo

Sobre los 108 ítems del SRS (69 RF + 39 RNF). Conteo recalculado de forma independiente desde los hallazgos crudos; cuadra con la síntesis.

| Status | Total | Must (M) | Should (S) | Could (C) |
|---|---|---|---|---|
| Completo | 58 | 47 | 10 | 1 |
| Parcial | 39 | 23 | 14 | 2 |
| Ausente | 11 | 2 | 3 | 6 |

Desglose RF (69) vs RNF (39):

| | RF compl. | RF parc. | RF aus. | RNF compl. | RNF parc. | RNF aus. |
|---|---|---|---|---|---|---|
| M | 34 | 16 | 0 | 13 | 7 | 2 |
| S | 8 | 6 | 0 | 2 | 8 | 3 |
| C | 1 | 1 | 2 | 0 | 1 | 3 |

- **RF Must incompletos: 16** (todos parciales, ninguno ausente).
- **RNF Must incompletos: 9** (7 parciales + 2 ausentes: RNF-09, RNF-37). De esos, ~4 (RNF-02/09/13/15) son infra delegada a Vercel/Supabase, no trabajo de código.
- **reglas.md (9 ítems, todos M): 7 completo, 2 parcial** (REGLA-03, REGLA-05).

---

## 2. Lo que BLOQUEA — Must incompletos

### Tier A — flujo core roto o con bug confirmado

| RF/RNF | Pri. | Gap concreto | Evidencia | Tracker / agravante |
|---|---|---|---|---|
| RF-64 Validación egresados | M (parc.) | Coteja por correo, no por título; verificación manual del admin, no agente validador | `admin/actions.ts:312` `.eq('correo',...)`; `20260622164248_create_egresados_fwd.sql:2` | **CORREGIDO 2026-06-29:** la cola lee bien; 0 pendientes reales y el orphan-sin-perfil ya está cerrado en código. El "bloqueo" era arrastre de 7 cuentas de prueba, no usuarios reales. Severidad: higiene de datos, no bloqueante |
| RF-17 Tipo empresario / validación adaptada | M (parc.) | Única diferencia por tipo es el label de cédula; mismo flujo de verificación para ambos | `CompanyProfileForm.tsx:410-426`; `company/schemas.ts:9-15` | **CORREGIDO 2026-06-29:** migración geo aplicada en remoto → la cola de empresas no se rompe por drift. Resta el gap de criterio (validación no adaptada por tipo) + limpiar el mock de `admin/companies`. Severidad: higiene/criterio, no bloqueante |
| RF-46 Correos en eventos clave | M (parc.) | Solo 1 de 4 eventos manda correo (adjudicación). Mensaje, entregable y plazo solo in-app | `project-detail.ts:580` único `sendMail`; `mensajes/actions.ts:270`, `deliverables/actions.ts:123` | `plazo_vence` solo tiene columna de idempotencia, sin emisor TS; ~7 archivos a crear. Depende del deploy |
| RF-02 Verificación enlace / 24h | M (parc.) | Vencimiento 24h no se fija en código: depende del ajuste OTP del dashboard Supabase (default 1h) | `middleware.ts:84`, `auth/confirm/route.ts:62` | `verify-email/page.tsx` es client con `getUser()` en `useEffect` (riesgo de cuelgue); `verifyOtp(type:'email')` vs OTP generado `type:'signup'` |
| RF-65 Suspender + motivo | M (parc.) | No hay acción directa "suspender con motivo": la única vía a `suspendida` es acumular >=3 strikes; `deactivateUser` no registra motivo | `AccountStatusActions.tsx:64-70`; `admin/actions.ts:367` | `signInWithPassword` crea sesión antes del gate -> un suspendido obtiene sesión válida unos instantes |

### Tier B — funcionalidad parcial vs. criterio

| RF/RNF | Pri. | Gap concreto | Evidencia |
|---|---|---|---|
| RF-10 Portafolio público/empresas | M (parc.) | Privacidad = promesa falsa: la RLS gatea por `is_active`/consentimiento, nunca por `portafolio_visible_publicamente` | `portfolio/actions.ts:523,560-580` |
| RF-26 Búsqueda/filtrado | M (parc.) | Faltan filtros área y categoría; "fecha" se aproxima con buckets de duración; filtrado 100% en cliente; `setTimeout(400)` de loading falso | `ProjectFilters.tsx:50-147`; `marketplace.ts:91-114` |
| RF-25 Estados del proyecto | M (parc.) | `en_recepcion` inalcanzable; fase modelada con estado derivado no persistido `en_evaluacion`; BD no valida transiciones | `initial_schema.sql:89`; `project-detail-logic.ts:14-21` |
| RF-35 Cierre automático recepción | M (parc.) | No hay flip de estado persistido al vencer plazo; `proyectos.estado` se queda en `abierto`; cierre solo reactivo (cosmético) | RLS `fecha_cierre>now()`; tarea #37 del repo |
| RF-24 Editar proyecto | M (parc.) | Solo se edita descripción (no título/plazo/área/tecnologías); notificación a oferentes sí funciona | `edit-description.ts:47,150` |
| RF-51 Reputación ponderada | M (parc.) | Trigger calcula promedio simple (AVG), no ponderado. BUG: trigger sin DELETE -> borrar evaluación nunca recalcula | `20260619140000_reputacion_estudiante.sql:18-39` |
| RF-61 Recomendar talento | M (parc.) | No filtra por `estado_verificacion`; score en puntos, no %; sin componente de experiencia | `match-actions.ts:62-71`; `match-logic.ts:27-31` |
| RF-55 Entrevista IA | M (parc.) | Por diseño no pregunta tecnologías ni plazo (2 de los 5 tópicos del criterio) | `proposal-ai/provider.ts:86-99` |
| RF-58 Revisar/editar/aprobar propuesta | M (parc.) | "Revisar/aprobar" OK, pero sin edición directa de campos: para cambiar algo hay que re-promptear la IA | `ProjectProposal.tsx:39-43,131-151` |
| RF-28 Prototipo archivo y/o enlace | M (parc.) | Solo rama enlace (1-4 URLs); el prototipo nunca se sube como archivo | `applications/actions.ts:29-32`; `ApplyProjectClient.tsx:337-352` |
| RF-14 Historial con calificación | M (parc.) | No hay historial unificado con su nota; no auto-puebla portafolio al finalizar (`origen` siempre `independiente`) | `deliverables/queries.ts:483`; `portfolio/actions.ts:358` |
| RNF-37 Eliminación de datos personales | M (aus.) | No existe borrado/exportación self-service. BUG latente: FK `mensajes.id_remitente` con `ON DELETE RESTRICT` bloqueará el primer borrado real | grep `delete.account/gdpr` vacío |
| RNF-30 Cotejo base egresados FWD | M (parc.) | Gate usa allowlist hardcoded (`egresado-allowlist.ts`), no la tabla oficial; tabla sembrada con correos de prueba | `auth/actions.ts:417,138` |
| RNF-32 Registro de solicitudes IA | M (parc.) | El filtro de ofertas solo va al logger, sin tabla auditable (el generador de propuestas sí persiste en `conversaciones_ia`) | `openrouter-validation.ts:49,92` |
| RNF-11 Búsquedas <1s | M (parc.) | Índices btree de listado pero sin índice de texto (GIN/tsvector) ni benchmark | `20260608000005_indexes_and_triggers.sql:21-22` |
| RNF-26 API REST documentada | M (parc.) | Única route propia (`api/geo`); el resto son server actions + PostgREST. Sin OpenAPI propio | `api/geo/subdivisions/route.ts` |

### Infra delegada (no verificable en código — documentar evidencia, no programar)

| RNF | Pri. | Nota |
|---|---|---|
| RNF-09 <=2s | M (aus.) | Sin instrumentación; depende de Vercel/Supabase |
| RNF-02 HTTPS/TLS | M (parc.) | Lo provee la plataforma; sin redirección forzada en repo |
| RNF-13 Respaldos diarios | M (parc.) | Automáticos de Supabase; sin config en repo |
| RNF-15 Escalamiento horizontal | M (parc.) | Diseño stateless lo habilita; nada configurado explícito |

---

## 3. Should pendientes (17)

| RF/RNF | Gap |
|---|---|
| RF-06 Foto perfil <=5MB | Validación tipo/tamaño solo en cliente; `uploadAndSaveProfilePhoto` no valida ni usa Zod (bypass por POST directo); cliente acepta `webp` (fuera de JPG/PNG) |
| RF-12 Enlace repo Git | Solo `z.string().url()` y solo en cliente; no verifica que sea repo Git accesible |
| RF-23 Flag "involucra IA" | Se guarda y se ve en detalle del empresario, no en el detalle público del marketplace |
| RF-33 Aviso proximidad vencimiento | El productor existe; el agendado de `pg_cron` es manual fuera de migraciones y no versionado |
| RF-67 Reportes exportables | Solo CSV; no hay exportación PDF |
| RF-68 Gestión de catálogos | Falta catálogo habilidades y acción de editar/renombrar (solo agregar y activar/desactivar) |
| RNF-05 Auditoría acciones sensibles | Solo audita admin/moderación/edición; no publicación/adjudicación/finalización/login |
| RNF-07 Rate limiting | Solo login y mensajes; signup/reset/IA dependen del límite nativo de Supabase |
| RNF-19 Registro <5min | Sin métrica; depende del cotejo manual del admin |
| RNF-25 Cobertura >=70% | Umbral configurado 50% sobre subconjunto curado, no 70% global |
| RNF-28 Integración GitHub | Solo login OAuth + URL manual; sin API GitHub |
| RNF-31 Recomendaciones IA <10s | Timeouts 20s/60s con hasta 5 reintentos: exceden 10s |
| RNF-34 Fallback IA | Hay fail-open y reintentos, sin failover a proveedor/modelo secundario |
| RNF-38 Consentimiento explícito IA | Cotejo egresados OK; el tipo `'ia'` existe en el enum pero nunca se inserta |
| RNF-10 / RNF-12 / RNF-16 (aus.) | 5000 concurrentes / 99.5% disponibilidad / 100k usuarios — infra, sin pruebas de carga ni SLA |

---

## 4. Could pendientes (8)

| RF/RNF | Gap |
|---|---|
| RF-08 2FA opcional (aus.) | Sin TOTP ni OTP como 2o factor; Supabase lo soporta nativo |
| RF-15 Exportar CV PDF (aus.) | Sin librería PDF, sin vista print-only, sin botón ni action |
| RF-48 Preferencias de notificación (aus.) | Solo existe columna muerta `tipos_notificacion_silenciados`; sin UI ni enforcement |
| RF-53 Réplica a calificación (parc.) | Unicidad solo en server action; sin guarda a nivel BD -> vía PostgREST se puede sobrescribir la réplica y tocar `puntuacion`/`comentario` del empresario |
| RNF-08 Antivirus de archivos (aus.) | Solo dedup por hash, sin escaneo AV |
| RNF-14 DRP (RPO/RTO) (aus.) | Sin plan documentado |
| RNF-20 WCAG 2.1 AA (parc.) | Bases con Radix/labels; sin auditoría AA (contraste/ARIA/lectores) |
| RNF-39 Política de retención (aus.) | Sin jobs de purga por antigüedad |

---

## 5. Discrepancias auditoría vs. equipo (falsos "completos")

Lo más accionable: cosas que el audit dio por hechas pero el tracker contradice, o UI que parece real con datos quemados.

| Ítem | Auditoría dice | Tracker dice | Veredicto |
|---|---|---|---|
| RF-37 / RF-39 Adjudicar / descartar | Completo, RPC atómico `adjudicar_barre_sobres` | Migración `20260621000000` PENDIENTE de aplicar; sin ella los sobres cerrados inflan el cupo | Completo solo si la migración está en remoto. Confirmar paridad antes de afirmarlo |
| RF-41 Entregable final | Completo, trigger pone `final`->`en_revision` | Migración `20260622200000` PENDIENTE de aplicar | Depende de migración no confirmada |
| RF-49 / RF-50 Empresario califica egresado | Completo, insert en `evaluaciones` (`actions.ts:100-106`) | "cero `.from('evaluaciones')`, el flujo empresario->estudiante no existe" | Contradicción dura. Probable tracker desactualizado, pero verificar en runtime que `rateEgresado` escribe |
| RF-47 Notificación in-app de mensaje | Completo, `mensaje_nuevo` cableado (`mensajes/actions.ts:270`) | "`enviarMensaje` no dispara ninguna notificación" | Confirmar; riesgo de falso completo |
| RF-45 Mensajería | Completo | Workaround `service_role`: tabla `mensajes` con RLS sin policies (deny-all), autorización solo en TS, sin Realtime | Funcional pero frágil; deuda real |
| RNF-04 RBAC | Completo | Advisor: `assign_my_role` (SECURITY DEFINER) podría auto-escalar a `administrador`; `leaked_password_protection` OFF | Completo con riesgo de escalada de privilegios — auditar ya |
| RF-36 Calificar prototipo 1-5 | Completo (Zod 1-5) | `participaciones.calificacion_prototipo` sin CHECK 1-5 en BD | Completo en app; falta defensa en BD (menor) |
| REGLA-07 Sin console.log | Completo | `console.log` en `PortfolioManager.tsx:159-160` | Contradicción; confirmar |
| UI con datos falsos (no atado a RF) | El audit mira lógica, no lo detectó | `empresario/postulaciones`: MOCK_MOCKUP_CANDIDATES + stats `1248/452/84/12` + match score inventado; Landing `+500/+1200/+150`; `/showcase` alcanzable con Acme/Maria Soto; `EmpresaPerfil` fallback "Global Corp"; BD real contaminada con `techflow.io`/`3-101-234567` | Falsos completos de cara al revisor. Penalización directa reglas.md §13. Prioridad de limpieza |

---

## 6. Cumplimiento de reglas.md (stack / identidad / calidad)

Stack e identidad: OK. Lo que sangra es calidad.

| Área | Estado | Detalle |
|---|---|---|
| Stack fijo (Next 15 / React 19 / TS strict / Tailwind v4 / shadcn / next-intl / Zod / Vitest) | OK (REGLA-01/02) | `package.json` confirma versiones; sin Prisma/MUI/Chakra/Mantine |
| Tipografía `next/font` | OK (REGLA-06) | Archivo Narrow + Figtree + JetBrains Mono, sin `<link>`/`@import` |
| `Result<T,E>` + Zod en fronteras | OK (REGLA-08) | 67 `Promise<Result<` en 18 actions |
| Tests Vitest sobre `*-logic.ts` | OK (REGLA-09) | 38 archivos test; umbral 50% (no exigido) |
| `any` / `@ts-ignore` | PARCIAL (REGLA-03) | Un `@ts-expect-error` en `PortfolioManager.tsx:783` que oculta un bug (`result.value` no existe en `Result`); `z.any()` en `ApplyProjectClient` filtra `any` al form |
| Colores solo tokens FWD | PARCIAL (REGLA-05) | UI limpia, pero plantillas de email hardcodean `#ffffff` (= `#fff` puro, prohibido §5.2) y hex sueltos |
| Sin console.log / sin emojis | OK por audit, pero tracker reporta `console.log` en `PortfolioManager:159-160` | Ver §5 |
| Otras violaciones del tracker | PARCIAL | 3 warnings ESLint `no-unused-vars`; código comentado ANTES/DESPUÉS dejado en `PortfolioManager`/`apply/page`/`SidebarEmpresaNuevo`; `matches/page.tsx` con strings hardcodeados en español (se ve en español en locale `en`); casts `as unknown as` en `report-actions`/`dashboard`/`ratings`; deps `openai`/`nodemailer`/`resend` no registradas en README (brief §8.2) |
| Mensajería sin RLS efectiva | PARCIAL | Tabla `mensajes` con RLS habilitado sin policies -> autorización solo en TS vía `service_role` (reglas §6) |

---

## 7. Recomendación de arranque (en orden)

1. **Confirmar si `20260621000000` (adjudicar) y `20260622200000` (entregable final) están aplicadas al remoto** (la geo `20260621120000` ya se verificó aplicada el 2026-06-29). Afecta RF-37/39/41. Decisión de BD de Samir.
2. ~~Bug de la cola de verificación admin (RF-64)~~ **HECHO / descartado 2026-06-29.** F1 (no tragar el error) ya commiteado en `samir`; el "bloqueo" era arrastre de 7 cuentas de prueba (ver "Actualización"). Resta solo limpiarlas (DELETE con FK-check, lo aprueba Samir).
3. **RF-17: limpiar el mock de `admin/companies` y cerrar el gap de criterio** (validación adaptada por tipo). Ya no es bloqueante (geo aplicada), pero el criterio sigue parcial.
4. **Deploy a Vercel (URL pública).** Obligatorio del brief, prerequisito de la demo, y desbloquea el cron de correo (RF-46) que necesita una URL.
5. **RF-46: correos de mensaje, entregable y plazo_vence.** Único Must de notificaciones que resta (1 de 4 eventos); faltan ~7 archivos.
6. **Limpiar los datos quemados visibles al revisor** (`empresario/postulaciones` mock, Landing `+500/+1200/+150`, gate de `/showcase` a `NODE_ENV!=='production'`, contaminación `techflow.io` en BD). Penalización directa de reglas.md §13.
7. **RF-10: hacer que la RLS del portafolio respete `portafolio_visible_publicamente`.** Hoy la privacidad es una promesa falsa.
8. **Higiene reglas.md (rápido):** quitar el `@ts-expect-error`+bug `result.value`, el `console.log`, el código comentado, los 3 warnings ESLint y el hardcode de `matches/page.tsx`.

> Nota de confianza: parte de estos hallazgos venían del tracker del equipo y eran "muy probable" hasta validarlos. El 2026-06-29 se verificó contra la BD remota real (`mgowuyflhiavquztxpqh`, MCP `supabase` del `.mcp.json`): ver la sección "Actualización" arriba para lo confirmado (geo aplicada, colas sin pendientes, 7 huérfanos de prueba). Lo aún no verificado: aplicación de `20260621000000` y `20260622200000`.
