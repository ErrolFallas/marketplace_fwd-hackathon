# Auditoría de Migración de Base de Datos - Supabase

Este directorio contiene los archivos resultantes del proceso de auditoría y comparación de esquemas entre la base de datos **vieja** (`mgowuyflhiavquztxpqh`) y la **nueva** (`vnamdoocvzaholoftqja`) de Supabase para este proyecto.

## Contenido de la Carpeta

- **[parity_report.md](file:///c:/Users/fwd/Desktop/Marketplace_hackaton/marketplace_fwd-hackathon/migration_audit/parity_report.md)**: El informe detallado que resume las diferencias y valida que ambas bases de datos son funcionalmente equivalentes. **(Este es el archivo principal que debes revisar y mostrar al equipo)**.
- **[old_schema.sql](file:///c:/Users/fwd/Desktop/Marketplace_hackaton/marketplace_fwd-hackathon/migration_audit/old_schema.sql)**: Respaldo del esquema SQL de la base de datos vieja.
- **[new_schema.sql](file:///c:/Users/fwd/Desktop/Marketplace_hackaton/marketplace_fwd-hackathon/migration_audit/new_schema.sql)**: Respaldo del esquema SQL de la base de datos nueva.
- **[schema_diff.txt](file:///c:/Users/fwd/Desktop/Marketplace_hackaton/marketplace_fwd-hackathon/migration_audit/schema_diff.txt)**: La comparación directa (diff) entre ambos esquemas incluyendo espacios en blanco.
- **[schema_diff_no_whitespace.txt](file:///c:/Users/fwd/Desktop/Marketplace_hackaton/marketplace_fwd-hackathon/migration_audit/schema_diff_no_whitespace.txt)**: La comparación directa ignorando cambios cosméticos (espacios en blanco, líneas vacías) para ver las diferencias de código reales.
- **sql_dumps/**: Carpeta con los respaldos de bases de datos/datos históricos generados previamente durante los intentos de importación y restauración (`datos.sql`, `estructura.sql`, `public_data.sql`, `public_schema.sql`).

## ¿Qué sigue?

1. **Revisar [parity_report.md](file:///c:/Users/fwd/Desktop/Marketplace_hackaton/marketplace_fwd-hackathon/migration_audit/parity_report.md)** para entender los pequeños cambios de políticas y privilegios que ocurrieron durante la migración.
2. Hacer **Git Commit** de estos archivos para que queden registrados en el historial como prueba de que se realizó la paridad del esquema antes de habilitar el nuevo entorno para todo el equipo.
3. Actualizar tu archivo `.env` local con las nuevas credenciales de la base de datos nueva.
