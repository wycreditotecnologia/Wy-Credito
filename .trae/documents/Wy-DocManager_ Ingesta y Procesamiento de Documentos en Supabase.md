## Arquitectura
- Módulo nativo en Next.js App Router con integración directa a Supabase (Storage + Postgres).
- Buckets privados en Supabase Storage; acceso mediante el servidor y RLS en Postgres para registros e inserciones.
- Pipeline: Upload → Registro → Extracción 2D → Validación → Inserción → Índices/Busqueda → Reporte.

## Almacenamiento (Supabase)
- Bucket: `credit-applications` (privado).
- Estructura de rutas: `/{user_id}/{request_id}/{doc_type}/{filename}`.
  - Ejemplos: `/user_123/req_555/estados_financieros/balance_2024.pdf`.
- Creación/verificación de bucket mediante endpoint server y Service Role.

## Tablas Postgres
- `document_registry`:
  - Campos: `id uuid pk`, `user_id text`, `request_id text`, `doc_type text`, `storage_path text unique`, `uploaded_at timestamptz default now()`, `mime_type text`, `size_bytes int`, `extraction_status text check('pending'|'done'|'failed')`, `validation_score numeric`, `requires_human_review boolean default false`, `error_message text`.
  - Índices: btree en `(user_id, request_id)`, unique en `storage_path`.
- `financial_statements`:
  - Campos: `id uuid pk`, `user_id text`, `request_id text`, `statement_type text`, `period_year int`, `label text`, `amount numeric(18,2)`, `level int`, `path text[]`, `created_at timestamptz default now()`.
  - Índices: GIN en `path`, btree en `(request_id, period_year)`, btree en `amount`.
- Full-Text Search:
  - Columna generada `search_vec tsvector` = `to_tsvector('spanish', coalesce(label,'') || ' ' || array_to_string(path,' '))`.
  - Índice GIN sobre `search_vec`.

## Endpoints (Next.js)
- `POST /next_api/docmanager/upload`:
  - FormData con `file`, `user_id`, `request_id`, `doc_type`.
  - Acepta solo PDF, tamaño ≤ 10MB.
  - Guarda en Storage y crea fila en `document_registry` con `extraction_status='pending'`.
- `POST /next_api/docmanager/extract`:
  - Input: `registry_id` o `storage_path`.
  - Extrae texto/estructura con motor 2D y produce JSON estricto para `financial_statements`.
  - Inserta filas normalizadas; actualiza `document_registry.extraction_status` y `validation_score`.
- `POST /next_api/docmanager/validate`:
  - Ejecuta validación cruzada (sumas de subcuentas vs. totales). Marca `requires_human_review` si no cuadra.
- `GET /next_api/docmanager/registry`:
  - Lista por `user_id`/`request_id` y estado.
- `GET /next_api/docmanager/report`:
  - Genera JSON de riesgo basado en datos validados (ej.: liquidez, endeudamiento, umbrales configurables).

## Motor de Extracción (El Cerebro)
- Ingesta PDF: `pdfjs-dist` (import dinámico) para obtener palabras con coordenadas y página.
- Algoritmo jerárquico:
  - Agrupación por `y` con tolerancia para filas.
  - Orden por `x` para detectar `label → value` (alineación derecha/izquierda, signos).
  - Identación por `x` para `level`; construcción del árbol `Activo → Corriente → Efectivo`.
- Normalización:
  - Generar `path text[]` con la jerarquía completa.
  - Campos `label`, `amount`, `level`, `period_year`, `statement_type`.
- IA con Prompt de Extracción Jerárquica:
  - Se usa como guía para resolver ambigüedades (mapeo de etiquetas, clasificaciones y normalización de valores).

## Validación y Calidad
- Reglas: `total_activos == sum(subcuentas)`, `total_pasivos + patrimonio == activos`.
- `validation_score`: 0–100 según número de reglas cumplidas.
- `requires_human_review`: true si alguna regla crítica falla.

## Búsqueda y Analítica
- Consultas de texto: `WHERE search_vec @@ plainto_tsquery('spanish','Efectivo')`.
- Consultas numéricas: `WHERE label='Efectivo' AND amount < 10000000`.
- Reporte de riesgo: JSON agregando ratios (liquidez, solvencia, endeudamiento, margen), flags y recomendaciones.

## Seguridad y Cumplimiento
- Storage privado; acceso mediante el servidor.
- Endpoints con autenticación y autorización (token del usuario y roles de analistas).
- Límite de tamaño y tipo estricto (PDF ≤ 10MB).
- Auditoría: registros con `uploaded_at`, `user_id`, `request_id`, `doc_type` y resultado de extracción/validación.

## Configuración
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Bucket: `credit-applications`.
- Umbrales de reporte: variables para límites (ej.: efectivo mínimo, ratios críticos).

## Pruebas
- Unitarias: parseo y agrupación 2D; validación de reglas; inserciones en Postgres.
- Integración: upload → registry → extract → validate → report.
- Rendimiento: PDFs grandes (hasta 10MB), múltiples periodos.
- QA: casos con encabezados repetidos, columnas múltiples, valores negativos y totales desalineados.

## Entregables
- Tablas y migraciones SQL listas.
- Endpoints implementados y documentados.
- Motor de extracción 2D + integración con Prompt.
- Reporte de riesgo JSON y consultas FTS ejemplos.

¿Confirmas este plan para comenzar la implementación del módulo Wy-DocManager?