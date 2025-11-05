# Arquitectura de Failover LLM (Gemini + DeepSeek)

Este documento describe cómo funciona el backend unificado de LLM con conmutación por error automática entre Gemini y DeepSeek, manteniendo las claves en backend y devolviendo una respuesta unificada al frontend.

## Objetivos
- Centralizar llamadas de IA en backend para seguridad.
- Permitir failover automático si el proveedor primario falla.
- Exponer un contrato de respuesta unificado (`ok`, `text`, `providerUsed`, `usage`, `failover`).
- Registrar eventos clave (proveedor elegido, errores, failover) en Supabase.

## Endpoints
- `GET /api/llm-status`: Health check y decisión de ruteo actual.
- `POST /api/llm-chat`: Chat unificado con failover.
- `POST /api/llm-extract`: Extracción documental; Gemini soporta `inlineData`, DeepSeek se usa como fallback de texto.

## Selección de Proveedor
- Variable `LLM_PRIMARY_PROVIDER` controla preferencia (`gemini` por defecto).
- Si el primario falla y `LLM_FAILOVER_ENABLED` no es `false`, se intenta el secundario.
- El status reporta: `{ activeProvider, providers: { gemini: { healthy }, deepseek: { healthy } } }`.

## Contrato de Respuesta
Todas las funciones de backend responden con:
```json
{
  "ok": true,
  "text": "...",
  "providerUsed": "gemini|deepseek",
  "usage": { "model": "<model-name>" },
  "failover": false
}
```
Si hay error: `{ ok: false, error, providerUsed?, failover? }`.

## Seguridad y Configuración
- Claves sólo en backend: `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`.
- Frontend usa `src/lib/llmClient.js` para llamar a `/api/llm-*` si `VITE_USE_BACKEND_LLM=true`.
- Validación en `validate-config.js`: Supabase, Gemini y DeepSeek.

## Logging en Supabase
- Tabla sugerida: `orquestador_logs`.
- Campos usados: `accion` (e.g., `llm.provider_selection`, `llm.failover_triggered`), `estado_anterior`, `estado_nuevo`, `errores`.
- Backend escribe logs de selección y de fallos.

## Pruebas y Herramientas
- `npm run verify:llm-failover`: Simula fallos controlados y verifica conmutación.
- `npm run load:test:llm`: Prueba de carga simple, alterna preferencia y mide latencias.

## Frontend
- `src/lib/geminiClient.js`: Mantiene API `generateContent` y, si `VITE_USE_BACKEND_LLM=true`, redirige a backend.
- `components/ChatInterface.jsx`: Muestra badge compacto del proveedor activo consultando `/api/llm-status`.

## Despliegue Local
- Recomendado `vercel dev` para servir `/api/*` en `http://localhost:3000/`.
- Para sólo frontend: `vite dev` en puerto por defecto (sin funciones).

## Variables de Entorno (Backend)
```env
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-1.5-flash
DEEPSEEK_API_KEY=...
DEEPSEEK_MODEL=deepseek-chat
LLM_PRIMARY_PROVIDER=gemini
LLM_FAILOVER_ENABLED=true
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...
```