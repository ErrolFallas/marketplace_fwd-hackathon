-- Filtro de Ofertas IA (Fase B) — Consentimiento de propiedad intelectual.
--
-- Agrega el valor 'propiedad_intelectual' al enum `tipo_consentimiento_enum`
-- para registrar, en la tabla `consentimientos` ya existente (con ip_origen,
-- user_agent, version_documento), la declaración que el egresado marca al
-- postular: "declaro que la información que proporciono es de mi propiedad
-- intelectual". Así la responsabilidad por plagio recae en el usuario.
--
-- El consentimiento de procesamiento por IA (RNF-38) NO necesita un valor nuevo:
-- reusa el tipo 'ia' ya presente en el enum, que hoy no se captura y pasará a
-- registrarse una sola vez por usuario. Ambos se insertan desde el código
-- (auth/applications) con service role.
--
-- Nota: `ALTER TYPE ... ADD VALUE` no permite USAR el valor nuevo en la misma
-- transacción que lo agrega. Esta migración solo lo AGREGA (no lo usa), así que
-- es segura; el código que lo emite corre después. Idempotente (Postgres 17).

alter type public.tipo_consentimiento_enum
  add value if not exists 'propiedad_intelectual';
