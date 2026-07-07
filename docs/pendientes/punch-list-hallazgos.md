# Punch-list de hallazgos abiertos (2ª pasada de verificación, 2026-06-28)

> Lista de ítems de **código** que destapó la reverificación adversarial de los docs
> archivados como "completado". No son documentos: son tareas concretas pendientes,
> con evidencia archivo:línea verificada contra el código actual. Cada ítem indica de
> qué doc salió, para trazabilidad. Confianza: **[Seguro]** = verificado en código ·
> **[Probable]** = falta una última confirmación.

---

## 1. `catch`-swallow sin `unstable_rethrow` en 6 archivos de `lib/` [Seguro]

El endurecimiento que pedía `auditoria-build-dynamic-server-usage.md §7.2` quedó **a
medias**: solo `src/lib/projects/marketplace.ts` y `src/lib/projects/publish.ts`
re-lanzan las señales de framework. Siguen tragándose `redirect()`/`notFound()`/
`DYNAMIC_SERVER_USAGE`:

- `src/lib/company/actions.ts` (catch en 103, 177, 281, 316, 360, 407)
- `src/lib/projects/actions.ts` (87, 176, 229, 309)
- `src/lib/projects/dashboard.ts` (134, 199)
- `src/lib/proposal-ai/chat.ts` (141 — mapea `AI_NOT_CONFIGURED` pero no re-lanza antes del logger)

**Fix:** `unstable_rethrow(e)` como primera línea de cada `catch`, antes del mapeo de error real.
**Origen:** `auditoria-build-dynamic-server-usage.md`.

## 2. Tres warnings ESLint `no-unused-vars` [Seguro]

- `src/components/features/admin/AdminCancelProjectButton.tsx` — `projectTitle` (prop sin usar)
- `src/components/features/admin/AdminProjectCharts.tsx` — `inactiveOffset` (calculado, nunca usado)
- `src/components/features/admin/CreateStrikeButton.tsx` — `t` (asignado, nunca usado; se usa `tCommon`)

**Fix:** borrar los símbolos muertos (revisar si `projectTitle` es parte de una interfaz de props).
**Origen:** `auditoria-build-dynamic-server-usage.md §7.3`.

## 3. Datos inventados en superficie pública [Seguro]

- **Landing** (`src/app/[locale]/page.tsx` + `messages/es.json`/`en.json`, claves `Landing.stats*Number`):
  las cifras `+500` / `+1,200` / `+150` están hardcodeadas como números fijos. Es la portada
  pública; con la BD en volumen bajo son cifras falsas (roza `reglas.md §13`).
- **`/showcase`** (`src/app/[locale]/showcase/page.tsx`): alcanzable por URL en producción, con
  datos sample, sin gate a `NODE_ENV !== 'production'`.

**Fix:** stats por conteo real desde Supabase o copy honesto sin números; gatear `/showcase`.
**Origen:** `auditoria-datos-quemados.md §10` + `plan-remediacion-datos-quemados.md` Fase 0.

## 4. `verify-email` repite el anti-patrón de auth bloqueante en cliente [Seguro]

`src/app/[locale]/(public)/verify-email/page.tsx` es `'use client'` y llama
`supabase.auth.getUser()` dentro de un `useEffect` de montaje (bloqueante). Es la **misma
enfermedad** que `auditoria-auth-cliente-cuelgue.md` documentó para los casos A y B (ya
cerrados): autenticación en el navegador como paso bloqueante. Esta instancia **no estaba
documentada** en el audit original.

**Fix:** patrón por eventos (`onAuthStateChange`) o resolver la sesión en el servidor, como ya
se hizo en `egresado/applications` y `reset-password`.
**Origen:** 2ª pasada de `auditoria-auth-cliente-cuelgue.md`.

## 5. Cuatro server actions sin gate `estado_verificacion` (defensa en profundidad) [Seguro]

El refactor de auth (`pendiente-refactor-auth.md §8`) exige que cada POST revalide la
verificación, porque los POST **no** pasan por el gate del middleware/layout. Ya lo hacen
`postularse`, `publishProject`, `deliverables`, `mensajes`, `evaluaciones`. **Faltan**:

- `setProjectEstado` (`src/lib/projects/project-detail.ts`)
- `setParticipacionEstado` (`src/lib/projects/project-detail.ts`)
- `adjudicarParticipacion` (`src/lib/projects/project-detail.ts`)
- `editProjectDescription` (`src/lib/projects/edit-description.ts`)

Hoy quedan protegidas por el gate del layout `(company)`, así que el riesgo es de **defensa
en profundidad**, no un hueco activo. Aun así el doc lo pide explícito.
**Fix:** `err('cuenta_no_verificada')` antes de actuar si el usuario no está verificado.
**Origen:** `pendiente-refactor-auth.md §8`.

## 6. `calificacion_prototipo` sin CHECK 1–5 [Probable]

`participaciones.calificacion_prototipo` aceptaría cualquier entero. La migración
`20260618000000` agregó 4 CHECKs a la tabla pero ninguno sobre esta columna; existe
`20260623160000_rf69_..._y_check_estricto.sql` cuyo nombre sugiere checks nuevos — **confirmar
si ya cubre esta columna** antes de escribir la migración.
**Fix (si falta):** `ADD CONSTRAINT ... CHECK (calificacion_prototipo IS NULL OR calificacion_prototipo BETWEEN 1 AND 5)`.
**Origen:** `auditoria-backend.md §13` / `Barry-Tareas-Independientes.md T3.3`.

---

## Deuda lateral anotada (no bloqueante)

- **Casts `as unknown as` nuevos**, fuera del alcance ya cerrado de `auditoria-P0.2-limpieza-casts.md`:
  `src/lib/admin/report-actions.ts` (varios), `src/lib/projects/dashboard.ts:108`,
  `src/lib/company/ratings.ts:246`. Son de módulos nuevos (RF-69), no deuda vieja.
- **`src/lib/marketplace/` quedó vacía** (solo `.gitkeep`); la lógica de marketplace/match vive en
  `src/lib/projects/marketplace.ts` y `src/lib/projects/match-logic.ts`. Borrar la carpeta vacía o
  documentar el desvío.
