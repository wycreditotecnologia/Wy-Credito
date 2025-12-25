# Configuración de Variables de Entorno en Vercel

## 🔑 Variables REQUERIDAS

Para que el despliegue funcione correctamente en Vercel, necesitas configurar **SOLO** las siguientes variables de entorno de Supabase:

### Variables de Supabase (OBLIGATORIAS)

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Descripción: URL de tu proyecto de Supabase
   - Ejemplo: `https://xxxxxxxxxxxxx.supabase.co`
   - Dónde encontrarla: Supabase Dashboard → Project Settings → API

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Descripción: Clave pública (anon key) de Supabase
   - Ejemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Dónde encontrarla: Supabase Dashboard → Project Settings → API

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Descripción: Clave de servicio (service role key) de Supabase
   - Ejemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Dónde encontrarla: Supabase Dashboard → Project Settings → API
   - ⚠️ **IMPORTANTE**: Esta clave es sensible, nunca la expongas en el cliente

---

## ℹ️ Variables de Google Cloud (NO REQUERIDAS)

**NOTA**: El análisis de documentos ahora se realiza completamente a través de n8n, por lo que las siguientes variables de Google Cloud **NO son necesarias** para Vercel:

- ~~GOOGLE_PROJECT_ID~~ (No necesaria)
- ~~GOOGLE_CLIENT_EMAIL~~ (No necesaria)
- ~~GOOGLE_PRIVATE_KEY~~ (No necesaria)
- ~~GCS_BUCKET~~ (No necesaria)

Estas variables pueden estar en tu `.env.local` para desarrollo local o para otros propósitos, pero **NO necesitas configurarlas en Vercel**.

---

## 📝 Cómo Configurar en Vercel

### Opción 1: Desde el Dashboard de Vercel (Recomendado)

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Para cada una de las **3 variables de Supabase**:
   - Click en **Add New**
   - Nombre: `NEXT_PUBLIC_SUPABASE_URL` (por ejemplo)
   - Value: Pega el valor correspondiente de tu `.env.local`
   - Environment: Selecciona **Production**, **Preview** y **Development**
   - Click en **Save**

### Opción 2: Desde la CLI de Vercel

```bash
# Instalar Vercel CLI (si no la tienes)
npm i -g vercel

# Login
vercel login

# Agregar SOLO las 3 variables de Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

---

## 🔄 Después de Configurar

1. **Redeploy**: Después de agregar las 3 variables de Supabase:
   - Opción A: Push un nuevo commit a GitHub (ya lo hicimos)
   - Opción B: Desde Vercel Dashboard → Deployments → Click en "..." → Redeploy

2. **Verificar**: Una vez desplegado, verifica que:
   - El build se complete sin errores
   - La aplicación cargue correctamente
   - Puedas hacer login
   - Las funcionalidades de Supabase funcionen

---

## ⚠️ Notas Importantes

- **NUNCA** subas el archivo `.env.local` a Git
- Las variables con prefijo `NEXT_PUBLIC_` son accesibles desde el cliente
- Las variables sin prefijo solo están disponibles en el servidor
- Si cambias una variable, necesitas hacer redeploy

---

## 🐛 Troubleshooting

### Error: "Your project's URL and API key are required"
- **Causa**: Las variables de Supabase no están configuradas
- **Solución**: Verifica que las **3 variables de Supabase** estén configuradas en Vercel

### Build falla en Vercel pero funciona localmente
- **Causa**: Variables de entorno faltantes en Vercel
- **Solución**: Asegúrate de tener configuradas las 3 variables de Supabase

### ¿Qué pasa con las variables de Google Cloud?
- **Respuesta**: No son necesarias en Vercel. El análisis de documentos se hace por n8n.

---

## 📞 Soporte

Si tienes problemas, revisa:
- Logs de Vercel: Dashboard → Deployments → Click en el deployment → View Function Logs
- Documentación de Vercel: https://vercel.com/docs/environment-variables
