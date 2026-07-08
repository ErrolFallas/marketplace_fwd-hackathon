# Handoff — Rediseño del filtro de IA de postulaciones (`OPENROUTER_FILTRO_OFERTAS`)

Estado: **en curso**. Migración aplicada y `database.ts` sincronizado. Falta el
código (Fase A) y exponer el veredicto al empresario (Fase B). Fecha: 2026-07-07.

## Qué es y por qué

El filtro actual (`src/lib/ai-filtro-ofertas/openrouter-validation.ts`) es un gate
fail-open que solo decide `isRelated` sí/no, sin criterios ni feedback útil, y que
aprobaba ante cualquier error. Se rediseña a un **revisor advisory** con la voz de
un mentor ("comentario de nuestro supervisor") que:

- Juzga la **coherencia temática del TEXTO** (planteamiento + carta) contra el
  proyecto (título/descripción/área).
- Da **coaching por-campo** incluso cuando aprueba (mejorar carta, agregar enlace
  de GitHub, llenar un campo opcional para subir posibilidades).
- **Nunca bloquea Enviar.** Su veredicto se registra en la postulación.

Config: el revisor usa **sus propias** vars `OPENROUTER_FILTRO_OFERTAS_API_KEY` /
`OPENROUTER_FILTRO_OFERTAS_MODEL`. No comparte key/modelo/tabla con `moderador-ai`;
de ese módulo se copia **solo la estructura de código** (config/provider/schemas/
prompt/logic separados), no su configuración.

## Reparto de responsabilidades (clave del diseño)

```
Enviar habilitado  ⟺  campos obligatorios (SRS)
                      ∧ consentimiento IP marcado  ∧ consentimiento IA marcado
                      ∧ link pasa anti-SSRF (https, host público)
                      ∧ link respondió (vivo)          ← TODO esto es CÓDIGO determinista

Veredicto IA (temática)  →  se registra + muestra coaching, NO gatea Enviar
```

- **La IA no toca el link ni la seguridad.** Solo juzga texto. Una sola llamada al
  LLM por revisión.
- **El código** hace la seguridad del link: anti-SSRF + vivo + `noopener`. Sin
  dependencias nuevas (malware/phishing se OMITE a propósito: fuera del brief).

## Decisiones cerradas (con el usuario)

| Tema | Decisión |
|---|---|
| Modelo | Advisory + registro. La IA nunca bloquea Enviar |
| Qué juzga la IA | Coherencia temática del texto (planteamiento + carta) vs proyecto |
| Obligatorios | Alinear al SRS: planteamiento + prototipo (≥1 enlace en `prototipo_enlaces`). Doc técnica y carta **opcionales**. En BD ya eran opcionales; el cambio es en el **form** |
| Seguridad link | Código: anti-SSRF (rechaza esquema ≠ https, localhost, IP privada/metadata → bloquea) + vivo + `noopener` |
| Link muerto | **Bloquea** Enviar si NO hay respuesta alguna (DNS falla / conexión rechazada / timeout total). Cualquier código HTTP devuelto (incl. 403/401/429) cuenta como VIVO — evita falso bloqueo por anti-bot de Vercel/Netlify/Cloudflare |
| Fallo de IA | Fail-open (RNF-34): estado `no_disponible`, Enviar sigue disponible |
| Registro veredicto | Enum 4 estados + JSONB de detalle en `participaciones` |
| Visibilidad | Egresado (coaching) + admin (moderación) + empresario (RF-34), como "revisión orientativa del agente" (no como rechazo, para no castigar por falso negativo) |
| Consentimiento IP | Reusar tabla `consentimientos`, nuevo valor `propiedad_intelectual`, **por postulación** (con IP/user_agent/versión) |
| Consentimiento IA (RNF-38) | Reusar tabla `consentimientos`, tipo `ia` existente, **global una vez por usuario** (si ya lo dio, no re-preguntar). Cierra el gap de RNF-38 para las 3 features de IA |
| Casillas | **Dos casillas separadas** en el form (IP + IA), obligatorias para Enviar |
| Anti-injection | `system`/`user` separados, contenido del egresado como DATOS delimitados, salida por `json_schema`, Zod, `intento_manipulacion` flag |
| Anti-fuga | El cuadro renderiza claves i18n mapeadas por `campo`+`codigo_motivo` (enums cerrados), nunca texto crudo del modelo verbatim |

## Migraciones (APLICADAS por Samir el 2026-07-07)

- `20260707140000_filtro_ofertas_revision_ia.sql` — enum `revision_ia_estado_enum`
  (`aprobada|rechazada|no_disponible|no_solicitada`) + columnas en `participaciones`
  (`revision_ia_estado` default `no_solicitada`, `revision_ia_detalle` jsonb,
  `revision_ia_modelo` text, `revision_ia_at` timestamptz) + interruptor
  `filtro_ofertas_ia_activo` en `configuracion_sistema`.
- `20260707140001_consentimiento_propiedad_intelectual_enum.sql` — agrega
  `propiedad_intelectual` a `tipo_consentimiento_enum`.
- `src/types/database.ts` actualizado a mano (columnas + enums + Constants).

## Fase A — backend HECHO y verificado (typecheck limpio, 35 tests verdes)

Módulos nuevos en `src/lib/ai-filtro-ofertas/` (self-contained, sin tocar
`moderador-ai`, con key propia `OPENROUTER_FILTRO_OFERTAS_*`):
- `config.ts` — lee la key/model del filtro; devuelve null (fail-open) si falta.
- `types.ts` — estados, campos revisables, tipos del resultado.
- `schemas.ts` — catálogos `CODIGOS_MOTIVO`/`CODIGOS_SUGERENCIA`, parser tolerante
  del modelo (`revisionModeloSchema`) y del veredicto reenviado.
- `prompt.ts` — system + mensaje con el texto del egresado delimitado (anti-injection).
- `provider.ts` — SDK `openai` vía OpenRouter, JSON mode, reintentos, Zod. Una
  sola llamada `revisar`.
- `review-logic.ts` (puro) — mapeo código→campo, estado, `hashContenidoRevisado`,
  `parsearRevisionReenviada` (cotejo de hash: no re-llama al modelo).
- `link-safety-logic.ts` (puro) — anti-SSRF (https + host público).
- `link-check.ts` (I/O) — fetch con DNS check + redirects; `vivo` = cualquier HTTP,
  `sin_respuesta` = sin respuesta de red.
- `review.ts` — orquestador con fail-open (`no_disponible`).
- Tests: `link-safety-logic.test.ts`, `review-logic.test.ts`, `schemas.test.ts`.
- Se ELIMINÓ `openrouter-validation.ts` (y su test); nada lo importa ya.

`applications/actions.ts`:
- `revisarPostulacionConIA(input)` — respeta `filtro_ofertas_ia_activo`, arma el
  contexto (título/descr/área) y llama a `revisarPostulacion`. Una sola llamada.
- `postularse` reescrita: consentimientos obligatorios + anti-SSRF de todos los
  enlaces + link principal vivo (gate duro); doc técnica y carta opcionales;
  persiste `revision_ia_*` desde el veredicto reenviado (cotejo de hash) o
  `no_solicitada`; registra `consentimientos` (`propiedad_intelectual` por oferta,
  `ia` global si falta). `tests/testFuncionalidadFiltroOfertasIa/postularse-action.test.ts`
  reescrita al nuevo flujo.
- Códigos de error nuevos para i18n: `consentimiento_requerido`, `link_invalido`,
  `link_sin_respuesta` (ya no existe `AI_REJECTED`).

## Fase A — UI + i18n HECHO (Fase A COMPLETA, 812 tests verdes)

- **`ApplyProjectClient.tsx`** reescrito: carta y doc técnica opcionales; botón
  "Revisar con IA" (llama `revisarPostulacionConIA`, guarda resultado); editar
  planteamiento/carta invalida la revisión (`useEffect`); dos checkboxes de
  consentimiento que bloquean Enviar; al enviar reenvía el veredicto como campo
  `revision_ia` (JSON) + `consentimiento_pi`/`consentimiento_ia`; maneja los
  errores nuevos.
- **`SupervisorFeedbackCard.tsx`** (nuevo): cuadro "comentario de nuestro
  supervisor" con status pill tokenizada (accent/warning/muted), bloqueantes
  (magenta) y sugerencias (highlight), aviso de intento de manipulación. Solo
  renderiza códigos de catálogo vía i18n (nunca texto libre del modelo).
- **i18n** es/en: `messages/es.json` + `en.json` con los textos del cuadro,
  estados, catálogo `revisorMotivo_*`/`revisorSugerencia_*`/`revisorCampo_*`,
  consentimientos y errores. Doc técnica pasó de "requerido" a "opcional".
- **Tests actualizados**: `src/lib/applications/actions.test.ts` (suite principal)
  y `tests/testFuncionalidadFiltroOfertasIa/postularse-action.test.ts` al nuevo
  flujo (consentimientos + mock de link-check + headers).
- Verificado: `tsc` limpio, ESLint sin errores, **812 tests pasan**.
- RECORDATORIO runtime: setear `OPENROUTER_FILTRO_OFERTAS_API_KEY` en `.env.local`
  (local) y en Vercel (deploy). Sin ella el revisor devuelve `no_disponible`
  (fail-open). `localhost:3000` sirve el build de prod: rebuild para ver cambios.

## Diferido (fase posterior)

- **Rate-limit** del botón "Revisar con IA" (RNF-07): hoy solo el disabled del
  botón en el cliente evita el doble click. Un límite real necesita BD/Redis.
- **Integridad del veredicto reenviado**: el cliente podría fabricar 'aprobada'
  (bajo impacto: advisory, el empresario igual lee el contenido). Endurecer con
  HMAC firmado por el servidor.

## Fase B (empresario) + Vista admin — HECHO (sin migración; 812 tests verdes)

Migraciones: TODAS aplicadas (140000/140001, verificado por MCP). Nada por migrar.

**Empresario ve el veredicto** (sin migración):
- `getProjectParticipations`/`getEmpresarioParticipations` en `project-detail.ts`
  cargan el veredicto con admin-client (`cargarVeredictosIa`) sobre los ids que ya
  devolvió la RPC (que reimpone propiedad), y lo fusionan en `ParticipacionEmpresario.revisionIaEstado`.
- Badge `VeredictoIaBadge.tsx` (nuevo) en `ParticipationsPanel` (tarjeta de detalle
  y de directorio), siempre visible (incl. sobre cerrado). Solo pinta aprobada
  (accent) / rechazada (warning); no_disponible/no_solicitada no muestran nada.
  i18n namespace `RevisorIa` (es/en).

**Vista admin** (solo problemáticas): pestaña "Revisor de ofertas" en
`/admin/moderation`. Query `listPostulacionesRevisadasIa` en `admin/queries.ts`
(requireRole + admin client) filtra `revision_ia_estado='rechazada'` o
`intentoManipulacion=true`. Componente `RevisorOfertasReports.tsx` reusa
`SupervisorFeedbackCard` para el detalle. i18n en namespace `Admin`.
`revisionDetalleSchema` extraído en `ai-filtro-ofertas/schemas.ts` y reutilizado.

**Pendiente de verificar en vivo:** badge del empresario (dato aprobado ya existe:
oferta `d54183d4` en el proyecto de yokai) y la pestaña admin (necesita una
postulación rechazada/con-manipulación para poblarse).

## Diseño — "Comentario de nuestro supervisor"

Marca fijada por `reglas.md` (paleta FWD, Archivo Narrow/Figtree/JetBrains Mono,
tokens, voz "Adelante.", sin emojis). Metáfora: un **mentor de FWD** revisando la
oferta, no un validador.
- `Card` con: (1) veredicto global como *status pill* tokenizada — `accent` "Listo
  para enviar" / `warning` "Necesita ajustes" / `muted` "No pudimos revisar";
  (2) lista por-campo que ancla al campo (scroll+focus), separando **bloqueante**
  (magenta) de **sugerencia** (highlight, aparece incluso al aprobar); (3) botón
  "Volver a revisar".
- Iconos `lucide`, motion `--duration-fast`/`--ease-out`, focus visible,
  `prefers-reduced-motion`, responsive 375px.

## Riesgos aceptados

- El empresario ve el veredicto → un falso negativo de la IA puede perjudicar a un
  egresado bueno. Mitigación: mostrarlo como "revisión orientativa del agente".
- Sin detección de malware/phishing (fuera del brief): el empresario abre links de
  terceros con `noopener` + aviso neutro.

## Fuentes de verdad

- Restricciones/identidad: `reglas.md` (gana el brief). Funcionalidad: SRS
  (`docs/importantes/SRS_Plataforma_Talento_FWD (1).md`) — RF-27..RF-33 (ofertas),
  RNF-06/07/32/33/34/38.
- Molde de agente IA advisory: `src/lib/moderador-ai/`.
