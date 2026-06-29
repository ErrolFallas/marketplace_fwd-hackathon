# Limpieza de datos de prueba — 2026-06-29

Registro de una limpieza one-off ejecutada **directamente contra la BD remota** (`mgowuyflhiavquztxpqh`) vía MCP. NO es una migración (no va en `supabase/migrations/`): borra UUIDs específicos que solo existen en ese remoto. Se hizo con aprobación de Samir.

## Qué se hizo

**Borrado (9 cuentas, vía `auth.users` → cascada a `usuarios` + perfiles):**
- 7 cuentas huérfanas (rol sin perfil, 0 referencias): `facturaswpg2026`, `rasf020815`, `rasf245`, `rasf542`, `rasf68870`, `rsalasfwdcostarica`, `tradeosito`.
- 2 empresarios de prueba vacíos (0 proyectos, 0 referencias): **Empresa Test** (`test.empresario@fwd.edu`) y **Test Corp** (`testemp@gmail.com`).

**Excluidos del borrado (tenían historial que lo bloqueaba — quedan en la BD):**
- **Mario darío** (`mariodolorescentenario`): strikes=3, auditoría=9, modificó `configuracion_sistema`=1.
- **Extreme Tech** (`racheltamaralunavargas`): 1 conversación con la IA.

**Sanitizado (UPDATE, no borrado):** `empresarios.sitio_web = null` donde era `https://techflow.io` (3 filas: Mario darío, rofersaTech, TECH-CPX). Sus proyectos quedaron intactos.

## Por qué así (FK-safe)
Las FK hacia `usuarios`/`empresarios`/`proyectos` son mayormente RESTRICT (no cascadean). Solo se borró lo que tenía 0 referencias en TODAS las tablas RESTRICT (mensajes, strikes, auditoría, comentarios, reportes, conversaciones_ia, evaluaciones, etc.). Los empresarios poblados (TECH-CPX 11 proyectos, rofersaTech 4) NO se tocaron, para no vaciar la demo.

## Antes / Después (verificado)
| Métrica | Antes | Después |
|---|---|---|
| usuarios | 36 | 27 |
| empresarios | 8 | 6 |
| estudiantes | 15 | 15 |
| proyectos | 20 | 20 |
| empresas con `techflow.io` | 3 | 0 |

`get_advisors` (security): sin avisos nuevos por esta operación.

## Pendiente relacionado
Existe el cron `limpiar_huerfanos_oauth()` (en DRY-RUN) que borra usuarios con `id_rol IS NULL` de más de 30 días; NO cubre huérfanos con **rol pero sin perfil** (los de esta limpieza). Si se quiere automatizar a futuro, hay que generalizar ese criterio.
