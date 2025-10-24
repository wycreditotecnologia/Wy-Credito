# Checklist de Deploy: Wy Crédito

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