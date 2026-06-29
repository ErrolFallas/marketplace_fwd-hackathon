# Auditoría P0.2b — Eliminación de casts `as unknown` (segunda tanda)

**Proyecto:** Marketplace FWD — Plataforma de Conexión de Talento Tecnológico
**Responsable:** Errol Fallas (rama `errol`)
**Fecha de inicio:** 2026-06-28
**Fecha de cierre:** 2026-06-28
**Estado:** Completado
**Rama:** `errol`
**Commits:** `9ccd549` (refactor), `f03815b` (fix)

---

## 1. Contexto y justificación

La auditoría [P0.2](./auditoria-P0.2-limpieza-casts.md) (2026-06-18) eliminó 7 casts
`as unknown as T` de 3 archivos, pero dejó explícitamente **fuera de alcance** una lista
de casts de otra naturaleza (su §5.4) y otros aparecieron después en código nuevo. Esta
P0.2b cierra el remanente de **producción**.

Se mantiene el principio rector de P0.2:

> La BD es la fuente de verdad. Los tipos TypeScript deben reflejar lo que
> Supabase/PostgREST devuelve en runtime. Cuando hay discrepancia entre la inferencia
> del SDK y la realidad de la BD, se reestructura la query — no se dobla la interfaz ni
> se usan casts (`reglas.md §2`, `§8`).

El `as unknown as T` es una doble conversión que elude por completo al compilador: a
diferencia de `as T` (que exige compatibilidad parcial), acepta cualquier origen y
produce cualquier destino, ocultando divergencias entre la estructura real de la BD y
los tipos de la aplicación. Esta tanda confirmó una vez más que **el cast no solo es
ruido: puede esconder un bug real** (ver cast #11).

---

## 2. Métricas de línea base

Medición ejecutada el **2026-06-28**, en vivo (no copiada de documento previo), antes de
cualquier modificación.

```
Comando: npm run typecheck   (tsc --noEmit)
Resultado: 0 errores · 0 warnings   (exit 0)
```

Inventario inicial de `as unknown as` en `src/` (14 ocurrencias de producción + 1 de test):

| Ámbito | Ocurrencias |
|--------|-------------|
| Producción — a limpiar | 13 (en 6 archivos) |
| Producción — legítimo (`toJsonb`) | 1 (`supabase/json.ts`) |
| Tests — fuera de alcance | 1 (`notifications/create.test.ts`) |

---

## 3. Categorías de hallazgo

- **A — Cast redundante:** la inferencia del SDK (`PostgrestVersion: '14.5'`) ya produce
  el tipo correcto (FK forward N:1 → objeto; `isOneToOne: true` → objeto único; reverse
  1:N → array). Solución: eliminar el cast y, si queda, borrar la interfaz `Raw*` muerta.
- **B — Bug real encubierto:** la query está mal formada y el cast oculta el error de
  tipo que lo delataría. Solución: reescribir la query por la ruta FK correcta.
- **C — Narrowing legítimo:** el cast no convertía entre estructuras BD↔app, sino que
  acotaba un valor que la query ya restringe en runtime. Solución: conservar el narrowing
  como `as T` **acotado a un solo campo** (no doble cast), dejando el resto de la fila
  tipado por el SDK. Es el mismo criterio que P0.2 §4.1.4 aplicó al `as string[]`.

---

## 4. Inventario de casts y resolución

| # | Archivo:línea | Cast original | Relación / FK | Categoría | Resolución |
|---|---------------|---------------|---------------|-----------|------------|
| 1 | `company/ratings.ts:247` | `contratacion.participaciones as unknown as {…}` | `contrataciones_id_participacion_fkey` **1:1** + `participaciones→proyectos` fwd | A | Acceso directo `contratacion.participaciones` |
| 2 | `applications/actions.ts:306` | `data as unknown as { empresarios… }` | `proyectos_id_empresario_fkey` fwd N:1 | A | `data.empresarios` |
| 3 | `projects/dashboard.ts:108` | `(filasRaw ?? []) as unknown as RawProyecto[]` | select anidado (areas/categorías/tecnologías) | A | `filasRaw ?? []`; interfaz `RawProyecto` eliminada |
| 4 | `projects/edit-description.ts:107` | `proyectoRaw as unknown as ProyectoEditRaw` | igual que #3 | A | Directo; interfaz `ProyectoEditRaw` + imports `EstadoProyecto`/`EstadoParticipacion` muertos eliminados |
| 5 | `projects/edit-description.ts:288` | `(filas ?? []) as unknown as OferenteRaw[]` | `participaciones→estudiantes→usuarios!fk` | A | `filas ?? []`; interfaz `OferenteRaw` eliminada |
| 6 | `projects/project-detail.ts:516` | `(filas ?? []) as unknown as ParticipacionAfectadaRaw[]` | igual que #5 | **C** | Narrowing acotado de `estado` (`as AfectadoAdjudicacion['estado']`); interfaz `ParticipacionAfectadaRaw` eliminada |
| 7 | `projects/project-detail.ts:654` | `(fila as unknown as {…}).estudiantes?.id_usuario` | `participaciones→estudiantes` fwd | A | `fila.estudiantes?.id_usuario` |
| 8 | `projects/project-detail.ts:740` | igual que #7 | igual que #7 | A | `fila.estudiantes?.id_usuario` |
| 9 | `admin/report-actions.ts:167-168` | `(a.usuarios as unknown as UsuarioData)` | `auditoria_id_actor_fkey` (único) | A | `a.usuarios?.nombre` (`exportAuditoriaCSV`) |
| 10 | `admin/report-actions.ts:64` | `(u.roles as unknown as UsuarioData)` | `usuarios_id_rol_fkey` fwd N:1 | A | `u.roles?.nombre_rol`; rama muerta `Array.isArray(u.roles)` eliminada (`exportUsuariosCSV`) |
| 11 | `admin/report-actions.ts:115-116` | `(p.usuarios as unknown as UsuarioData)` | ⚠️ embed mal formado | **B** | Query reescrita; interfaz `UsuarioData` eliminada (`exportProyectosCSV`) |

Mantenido por diseño:

| Archivo:línea | Uso | Motivo |
|---------------|-----|--------|
| `supabase/json.ts:15` | `value as unknown as Json` (`toJsonb`) | Frontera objeto-tipado → `jsonb`, único, documentado y acotado. Aceptado por P0.2 §5.4 (`reglas.md §2`). |
| `notifications/create.test.ts:43` | Mock de `ReturnType<…>` | Test, fuera de alcance. |

---

## 5. Hallazgo crítico — cast #11 (`exportProyectosCSV`)

### 5.1 Diagnóstico

Al quitar el cast y ejecutar `npm run typecheck`, TypeScript reportó:

```
src/lib/admin/report-actions.ts(113,36): error TS2339: Property 'nombre' does not
  exist on type '{ nombre: string; apellido_1: string; }[]'.
src/lib/admin/report-actions.ts(114,23): error TS2339: …
src/lib/admin/report-actions.ts(114,44): error TS2339: …
```

El SDK infería `p.usuarios` como **array** `{ nombre; apellido_1 }[]`, no como el objeto
`{ nombre }` que el código asumía. El `as unknown as UsuarioData` forzaba esa forma y
ocultaba la causa: la query embebía

```
usuarios!proyectos_id_empresario_fkey(nombre, apellido_1)
```

pero el constraint `proyectos_id_empresario_fkey` referencia **`empresarios`**, no
`usuarios`, y `proyectos` no tiene FK directa a `usuarios` (ver `src/types/database.ts`).
El hint apuntaba a una relación inexistente.

**Impacto en producción:** la columna **"Empresario"** del CSV de proyectos salía siempre
`"Desconocido"`.

### 5.2 Corrección

ANTES (ruta inexistente):
```sql
usuarios!proyectos_id_empresario_fkey(nombre, apellido_1)
```

DESPUÉS (ruta real, sin ambigüedad):
```sql
empresarios!proyectos_id_empresario_fkey(
  usuarios!empresarios_id_usuario_fkey(nombre, apellido_1)
)
```

Acceso actualizado a `p.empresarios?.usuarios?.nombre`. Interfaz `UsuarioData` eliminada
(quedó muerta tras #9/#10/#11).

### 5.3 Verificación pendiente

El tipado quedó correcto y la ruta FK es la válida según `database.ts`, pero **no se pudo
verificar el runtime contra la BD del equipo** (el MCP de Supabase apunta a otra base). Se
recomienda confirmar exportando un CSV en un entorno real o añadir un test unitario de
`exportProyectosCSV`.

### 5.4 Decisión semántica abierta

La columna "Empresario" muestra el nombre de la **persona** empresaria (`nombre` +
`apellido_1`), preservando la intención original del código. Si el negocio prefiere el
**nombre de la empresa**, existe `empresarios.nombre_empresa` y es un cambio de una línea.

---

## 6. Incidente durante la limpieza (cast #6)

Al inlinear `filasRaw` en `notificarAdjudicacion` (`project-detail.ts`), `npm run
typecheck` falló:

```
src/lib/projects/project-detail.ts(539,21): error TS2304: Cannot find name 'filasRaw'.
src/lib/projects/project-detail.ts(539,36): error TS7006: Parameter 'fila' implicitly
  has an 'any' type.
```

`filasRaw` no solo alimentaba el `.map` de afectados, sino también un `.find` del ganador
~20 líneas más abajo. Se reintrodujo `const filasRaw = filas ?? []` **sin cast** y se
reusó en ambos puntos. **Lección:** el `typecheck` por paso atrapó una regresión que el
doble cast habría dejado pasar silenciosamente — exactamente el valor de esta auditoría.

---

## 7. Resumen de resultados

### 7.1 Métricas comparativas

| Métrica | Antes (P0.2b) | Después |
|---------|---------------|---------|
| Casts `as unknown as` de producción (sin `toJsonb`) | 13 | 0 |
| Casts legítimos conservados | 1 (`toJsonb`) | 1 (`toJsonb`) |
| Errores `npm run typecheck` | 0 | 0 |
| Interfaces muertas eliminadas | — | 5 (`RawProyecto`, `ProyectoEditRaw`, `OferenteRaw`, `ParticipacionAfectadaRaw`, `UsuarioData`) |
| Imports de tipo muertos eliminados | — | 2 (`EstadoProyecto`, `EstadoParticipacion` en `edit-description.ts`) |
| Ramas muertas eliminadas | — | 1 (`Array.isArray(roles)`) |
| Bugs reales descubiertos | — | 1 (`exportProyectosCSV`, FK inexistente) |
| Líneas netas | — | −61 (refactor) / −5 (fix) |

### 7.2 Criterios de cierre

- [x] Los 11 casts de producción han sido eliminados o reescritos.
- [x] `npm run typecheck` retorna 0 errores tras cada paso y al cierre.
- [x] Ninguna interfaz local se modificó para acomodar la inferencia del SDK (DB-first).
- [x] El único `as unknown as` de producción restante es el helper `toJsonb`, justificado.
- [x] Se detectó y corrigió un bug real (cast #11, `exportProyectosCSV`).
- [x] Cada cambio es *type erasure* puro salvo #11, que corrige comportamiento de runtime.

### 7.3 Pendientes derivados

| # | Pendiente | Origen |
|---|-----------|--------|
| 1 | Verificar runtime de `exportProyectosCSV` (CSV real o test unitario) | §5.3 |
| 2 | Confirmar semántica de la columna "Empresario" (persona vs. `nombre_empresa`) | §5.4 |
| 3 | Casts `as unknown as` en archivos de test (p. ej. `notifications/create.test.ts`) | Fuera de alcance, candidatos a P0.2c |

---

## 8. Referencias

- [`auditoria-P0.2-limpieza-casts.md`](./auditoria-P0.2-limpieza-casts.md) — primera tanda (7 casts, 2026-06-18)
- `reglas.md §2` — TypeScript strict, prohibición de `any`, política de casts
- `reglas.md §8` — sin código muerto ni duplicación
- `src/types/database.ts` — tipos generados por Supabase CLI, fuente de verdad de las relaciones FK
- `supabase/migrations/` — estructura real de la BD
- Commits: `9ccd549` (refactor #1-#10), `f03815b` (fix #11)
