## Estado Actual (Andamiaje)

### UI – 7 Pasos
- La interfaz de los 7 pasos está maquetada y navegable con un stepper y transiciones.
- Control de flujo y persistencia (placeholder) en `src/components/application/ApplicationForm.tsx:26-83,98-217`.
- Stepper visual con progreso en `src/components/application/ApplicationStepper.tsx:21-37`.
- Pasos existentes y estilizados con Tailwind/shadcn:
  - Step 1–7 en `src/components/application/steps/*` (por ejemplo, `Step3Financial.tsx:35-137`, `Step2LegalDocs.tsx:36-144`, `Step6Guarantee.tsx:37-113`).
- Observación: los componentes de subida de archivos están marcados como placeholders (“[Componente de Carga de Archivos en Cirugía]”).

### UI – Asistente Embebido
- No se encontró un widget de chat embebido en el layout principal. `src/app/layout.tsx:42-57` monta ThemeProvider/AuthProvider/Toaster, sin chat.
- No hay componentes con "chat" o "widget" (búsqueda global sin resultados).
- Branding: el tema oscuro está activo (`globals.css:67-91`) y hay variables de color, pero no se fuerza explícitamente el acento `#3A85F5`. `--primary` usa oklch (`globals.css:48-55`).

## Estado Actual (Trasplante)

### Autenticación
- Flujo actual: email/password + Google, con captcha.
  - Login: `src/components/auth/LoginForm.tsx:79-87` usa `signInWithPassword`.
  - Registro con verificación por link (no magic link de login): `RegisterForm.tsx:74-81` y callback: `src/app/auth/callback/route.ts:9-16`.
  - Reset password con OTP: `ResetPasswordForm.tsx:72-83,117-137,127-133`.
- Magic Link (signInWithOtp) no está implementado (sin coincidencias de `signInWithOtp`).
- Gateo de rutas protegido por Auth: `/solicitud` redirige a login si no hay usuario (`src/app/solicitud/page.tsx:13-17,27-31`).
- Nota de entorno: el Auth está deshabilitado si faltan variables de Supabase (mensajes en `src/lib/supabase/client.ts:7-12` y UI de login `src/app/login/page.tsx:16-23`).

### Cerebro del Chat (RAG)
- No existe widget visual ni conexión a API.
- No hay rutas de API de chat; solo un placeholder para extracción de financieros:
  - `src/app/next_api/ai/extract-financials/route.ts:5-9` retorna éxito y nota, sin lógica de IA.

### Extracción Jerárquica (PDF en Paso 3)
- Paso 3 muestra placeholders de subida (`Step3Financial.tsx:41-55`).
- La API para extracción es solo una plantilla (arriba) y no consume archivos.
- No hay integración con Storage (Supabase) para PDF.

## Bloqueador Principal
- La ausencia de configuración de entorno de Supabase y la falta de la cadena completa de "archivo → storage → API → extracción IA → persistencia". Sin esto, el "Híbrido Embebido (v9.4)" no puede funcionar end-to-end.
- Secundario: No existe el widget de chat/RAG ni su API.

## Plan de Acción Propuesto

### Fase 1: Autenticación (Magic Link)
- Implementar login por Magic Link (`signInWithOtp`) con Turnstile en `LoginForm` y flujo de callback en `/auth/callback`.
- Mantener email/password y Google como alternativas opcionales.
- Asegurar `AuthProvider` mapea `isAdmin` desde metadata/rol y que `SCHEMA_ADMIN_USER` esté en `.env.local`.
- Entregables: pantalla de login con Magic Link, callback funcional, documentación de variables.

### Fase 2: Widget de Chat Embebido
- Crear componente `ChatWidget` con estilo modo oscuro y acento `#3A85F5` (shadcn + Tailwind variables ajustadas).
- Ubicarlo en `src/app/layout.tsx` (zona fija con botón flotante).
- Diseñar API Route `/next_api/chat` que reciba mensajes y devuelva respuestas (stub primero), con soporte de contexto del usuario.
- Entregables: widget visible y funcional (placeholder), API route lista para integrar RAG.

### Fase 3: PDF Upload + Extracción Jerárquica
- Implementar uploader en `Step3Financial` y `Step2LegalDocs` usando Supabase Storage.
- Extender `extract-financials` para aceptar archivo/subida y ejecutar el Prompt de Extracción Jerárquica; retornar JSON jerárquico.
- Persistir resultados asociados a la aplicación en endpoints actuales (`/solicitud/save-step`) o nuevos.
- Entregables: subida de PDF, API procesa y devuelve estructura; UI muestra estado.

### Fase 4: Branding y UX
- Alinear el acento al `#3A85F5` en variables (`--primary`) y componentes clave (botones, progreso).
- Revisar tipografías y contrastes según BRAND BOOK WI CREDITO.
- Entregables: ajuste visual consistente.

### Fase 5: End-to-End y Hardening
- Configurar `.env.local` (Supabase URL/Key, JWT_SECRET, SCHEMA_ADMIN_USER, Turnstile).
- Pruebas de flujo completo: login -> solicitud -> carga PDF -> extracción -> revisión -> envío.
- Manejo de errores, logs y límites (tamaño de archivo, formatos PDF/imagen).

### Dependencias y Riesgos
- Requiere claves Supabase y buckets Storage.
- Selección de proveedor IA (OpenAI/Azure/local) para el prompt; coste y latencia.
- Compatibilidad de React 19 con librerías; ya compila, pero revisar peer warnings.

¿Confirmas este plan para proceder con la implementación? 