# Checklist de Deploy: Wy Crédito

**Objetivo**
- Asegurar un despliegue confiable del frontend (Vite) y funciones backend (Vercel) con integración segura de Gemini, Supabase y correo (Resend).

**Prerequisitos**
- Node `20.x` o `22.x` y npm `>=10`.
- Acceso a Vercel (CLI y proyecto enlazado) y a Google Cloud (habilitar Generative Language API).
- Credenciales de Supabase y Resend disponibles para el entorno backend.

**Variables de Entorno**
- Frontend (`.env`):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_USE_BACKEND_GEMINI=true`
  - `VITE_GEMINI_MODEL=gemini-1.5-flash-latest` (opcional; por defecto se usa `-latest`)
- Backend (proyecto Vercel):
  - `GEMINI_API_KEY` (secreto, solo backend)
  - `GEMINI_MODEL=gemini-1.5-flash-latest`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (solo backend, nunca en `VITE_*`)
  - `RESEND_API_KEY`

**Verificación previa al deploy (local)**
- Validar configuración base:
  - `npm run validate-config`
- Comprobar modelo de Gemini disponible:
  - `npm run check:gemini-models`
- Probar extractor financiero:
  - `npm run test:extract`
- Ejecutar frontend:
  - `npm run dev` y abrir `http://localhost:3000/`
- Ejecutar APIs localmente:
  - `npm run dev:vercel` (requiere Vercel CLI) para probar `/api/*`

**Build y Deploy**
- Build local:
  - `npm run build`
- Deploy a Vercel (producción):
  - `vercel pull` (sincronizar entorno)
  - `vercel env ls` (verificar variables)
  - `vercel --prod` (o pipeline CI)
- Config en `vercel.json`:
  - `buildCommand`: `npm ci && npm run build`
  - `outputDirectory`: `dist`
  - `rewrites`: `/api/(.*) -> /api/$1` y fallback al `index.html`

**Pruebas post‑deploy**
- Frontend:
  - Abrir la URL de producción y validar carga y navegación básica.
- Gemini Chat (`/api/gemini-chat`):
  - `curl -X POST https://<tu-url>/api/gemini-chat -H "Content-Type: application/json" -d '{"prompt":"Hola, prueba"}'`
- Orchestrator (`/api/orchestrator`):
  - `curl -X POST https://<tu-url>/api/orchestrator -H "Content-Type: application/json" -d '{"action":"start_session"}'`
  - `curl -X POST https://<tu-url>/api/orchestrator -H "Content-Type: application/json" -d '{"action":"save_step","sessionId":"<ID>","payload":{"solicitudUpdates":{"estado":"borrador"}},"nextStep":"documentos"}'`
  - `curl -X POST https://<tu-url>/api/orchestrator -H "Content-Type: application/json" -d '{"action":"complete_submission","sessionId":"<ID>"}'`
- Scripts de verificación:
  - `npm run verify:gemini`
  - `node scripts/verify-database-integrity.js`
  - `node scripts/verify-email-system.js`

**Seguridad**
- Mantener `GEMINI_API_KEY` y `SUPABASE_SERVICE_ROLE_KEY` exclusivamente en entorno backend (Vercel Project Env).
- No exponer secretos con prefijo `VITE_*`.
- Revisar roles/policies de Supabase (RLS activado) y auditorías con los scripts `scripts/audit-*`.

**Monitoreo y Observabilidad**
- Agregar logs estructurados en funciones `api/*` con correlación por `requestId`.
- Medir latencia y tasa de errores en Gemini y Supabase; definir alarmas mínimas.

**Rollback**
- Vercel permite restaurar despliegues previos desde la UI.
- Mantener tags o aliases para versiones estables.

**Referencias y Diagramas**
- Arquitectura general: `docs/diagrams/application-structure.svg`
- Secuencia Gemini Chat: `docs/diagrams/gemini-chat-sequence.md`
- Secuencia Orchestrator: `docs/diagrams/orchestrator-sequence.md`

**Comandos útiles**
- `npm run dev` → frontend local.
- `npm run dev:vercel` → funciones `/api/*` local.
- `npm run verify:gemini` y `npm run check:gemini-models` → verificación IA.
- `npm run clean` → limpieza cross‑platform.


Este checklist asegura que el flujo de autenticación funcione correctamente con `https://wycredito.com`, usando login automático tras confirmar y sin correo personalizado de auth.

## Supabase
- Site URL: `https://wycredito.com/`
- Redirect URLs (Auth → URL Configuration):
  - `https://wycredito.com/login`
  - `https://wycredito.com/solicitud`
- Google OAuth (si aplica):
  - Verifica que el proveedor Google esté activo.
  - En Google Cloud Console, asegura que el `Authorized redirect URI` que te indica Supabase esté configurado. (Normalmente el callback lo gestiona Supabase; sigue las instrucciones del panel del proveedor en Supabase.)

## Variables en Vercel (Producción)
- `VITE_BASE_URL=https://wycredito.com`
- `VITE_SUPABASE_URL=<tu_url_supabase>`
- `VITE_SUPABASE_ANON_KEY=<tu_anon_key>`
- `VITE_USE_RESEND_AUTH=false`  # desactiva el correo personalizado para confirmación
- (Opcional para otros emails transaccionales) `RESEND_API_KEY=<tu_api_key>`

## Código ya configurado
- `detectSessionInUrl` activado para login automático:
  - `src/config/index.js` → `supabaseConfig.options.auth.detectSessionInUrl: true`.
- Redirecciones centralizadas:
  - `src/pages/LoginPage.jsx` usa `appConfig.baseUrl` (`VITE_BASE_URL`) y define:
    - `emailRedirectTo: ${BASE_URL}/login` en `signUp`.
    - `redirectTo: ${BASE_URL}/solicitud` para Google OAuth.
- Correo de confirmación propio desactivado por defecto:
  - `appConfig.useResendAuth` se basa en `VITE_USE_RESEND_AUTH` (false por defecto).

## Pruebas de verificación
1) Registro email+password:
   - Completar registro → Confirmar email → navegador vuelve a `/login` → sesión detectada automáticamente → redirige a `/solicitud`.
2) Login con Google:
   - Iniciar con Google → termina en `/solicitud`.
3) No llegan correos duplicados:
   - Verificar que solo se reciba el correo de Supabase.
4) Reintento de confirmación (usuario ya existente):
   - Supabase debe manejar el enlace y permitir login normal.

## Notas
- Si quieres forzar paso por login después de confirmar, cambia `detectSessionInUrl` a `false`.
- Mantén `https://wycredito.com/login` y `https://wycredito.com/solicitud` en Supabase para cubrir ambos flujos.
- Asegúrate de redeploy en Vercel después de actualizar variables.