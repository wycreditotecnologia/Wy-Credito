# Configuración de Variables de Entorno en Vercel

## 🔑 Variables REQUERIDAS para Producción

Para que el despliegue funcione correctamente en Vercel, necesitas configurar las siguientes variables de entorno:

### 1. Variables de Supabase (OBLIGATORIAS)

| Variable | Descripción | Dónde encontrarla |
|----------|-------------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio de Supabase | Supabase Dashboard → Project Settings → API |

### 2. Variables de Cloudflare Turnstile (OBLIGATORIAS para Login/Registro)

| Variable | Descripción | Dónde encontrarla |
|----------|-------------|-------------------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Clave pública del sitio Turnstile | Cloudflare Dashboard → Turnstile → Tu sitio |
| `TURNSTILE_SECRET_KEY` | Clave secreta de Turnstile | Cloudflare Dashboard → Turnstile → Tu sitio |

⚠️ **IMPORTANTE**: Ambas claves de Turnstile son necesarias:
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` se usa en el frontend (navegador)
- `TURNSTILE_SECRET_KEY` se usa en el backend (API) para verificar el CAPTCHA

---

## 📝 Cómo Obtener las Claves de Cloudflare Turnstile

1. **Ve a Cloudflare Dashboard**: https://dash.cloudflare.com/?to=/:account/turnstile
2. **Crea un nuevo sitio** (si no lo has hecho):
   - Click en "Add Site"
   - Nombre: `Wy Crédito`
   - Dominio: `wycredito.com`
   - Widget Mode: `Managed`
3. **Copia las claves**:
   - **Site Key** → Esta es tu `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - **Secret Key** → Esta es tu `TURNSTILE_SECRET_KEY`

---

## 📝 Cómo Configurar en Vercel

### Paso 1: Ir a Variables de Entorno

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**

### Paso 2: Agregar las 5 Variables

Para cada variable, haz lo siguiente:

| Nombre de Variable | Valor | Entornos |
|-------------------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | [tu URL de Supabase] | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | [tu anon key de Supabase] | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | [tu service role key] | Production, Preview, Development |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | [tu site key de Cloudflare] | Production, Preview, Development |
| `TURNSTILE_SECRET_KEY` | [tu secret key de Cloudflare] | Production, Preview, Development |

### Paso 3: Redeploy

Después de agregar todas las variables:
1. Ve a **Deployments**
2. Click en el último deployment
3. Click en "..." → **Redeploy**

---

## 🐛 Troubleshooting

### Error: "Captcha inválido. Inténtalo nuevamente."

**Causa**: Falta la variable `TURNSTILE_SECRET_KEY` en Vercel

**Solución**: 
1. Verifica que agregaste **ambas** variables de Turnstile en Vercel
2. Asegúrate de seleccionar Production, Preview y Development
3. Haz redeploy después de agregar las variables

### Error: "Turnstile secret key no configurada"

**Causa**: La variable `TURNSTILE_SECRET_KEY` no está configurada

**Solución**: Agrega la variable en Vercel Dashboard → Settings → Environment Variables

### El CAPTCHA no aparece

**Causa**: Falta la variable `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

**Solución**: Agrega la variable en Vercel Dashboard

---

## ℹ️ Variables Opcionales (No necesarias)

Las siguientes variables de Google Cloud **NO son necesarias** en Vercel porque el análisis de documentos se hace por n8n:

- ~~`GOOGLE_PROJECT_ID`~~ (No necesaria)
- ~~`GOOGLE_CLIENT_EMAIL`~~ (No necesaria)
- ~~`GOOGLE_PRIVATE_KEY`~~ (No necesaria)
- ~~`GCS_BUCKET`~~ (No necesaria)

---

## 📞 Soporte

Si tienes problemas:
- Revisa los logs: Vercel Dashboard → Deployments → Click en deployment → View Function Logs
- Documentación de Cloudflare Turnstile: https://developers.cloudflare.com/turnstile/
- Documentación de Vercel: https://vercel.com/docs/environment-variables
