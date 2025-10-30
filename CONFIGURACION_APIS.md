# 🔧 Configuración de APIs - Wally

Esta guía te ayudará a configurar todas las APIs necesarias para que Wally funcione completamente.

## 📋 Resumen de APIs Requeridas

- **Supabase**: Base de datos y backend
- **Google Gemini**: Inteligencia artificial para conversaciones

## 🚀 Configuración Paso a Paso

### 1. Configurar Supabase

#### Opción A: Configuración Automática
```bash
npm run setup-supabase
```

#### Opción B: Configuración Manual

1. **Crear cuenta en Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Crea una cuenta gratuita
   - Crea un nuevo proyecto

2. **Obtener credenciales**
   - En tu proyecto, ve a Settings > API
   - Copia la `URL` del proyecto
   - Copia la `anon public` key
   - **anon key**: Clave pública para operaciones del lado del cliente
   - **service_role key**: Clave privada con permisos completos (opcional pero recomendada)
   - Las claves anon y URL son necesarias para el funcionamiento básico

3. **Configurar base de datos**
   - Ve a SQL Editor en Supabase
   - Ejecuta el script `database/setup_database.sql`

### 2. Configurar Google Gemini API

1. **Crear proyecto en Google Cloud**
   - Ve a [console.cloud.google.com](https://console.cloud.google.com)
   - Crea un nuevo proyecto o selecciona uno existente

2. **Habilitar Gemini API**
   - Ve a APIs & Services > Library
   - Busca "Generative Language API"
   - Habilita la API

3. **Crear API Key**
   - Ve a APIs & Services > Credentials
   - Clic en "Create Credentials" > "API Key"
   - Copia la API Key generada

### 3. Configurar Variables de Entorno

1. **Copia el archivo de ejemplo**
   ```bash
   cp .env.example .env
   ```

2. **Edita el archivo .env** con tus credenciales:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui  # Opcional pero recomendado

   # Google Gemini Configuration
   VITE_GEMINI_API_KEY=tu-gemini-api-key-aqui
   VITE_GEMINI_MODEL=gemini-1.5-flash-latest

   # Application Configuration
   VITE_APP_NAME=Wally - Wy Crédito
   VITE_APP_VERSION=1.0.0
   VITE_DEV_MODE=false
   ```

## ✅ Validar Configuración

Después de configurar las APIs, ejecuta:

```bash
npm run validate-config
```

Este comando verificará:
- ✅ URLs válidas
- ✅ API Keys configuradas
- ✅ Archivos necesarios
- ✅ Dependencias instaladas

## 🔒 Seguridad

### Variables de Entorno
- **NUNCA** subas el archivo `.env` al repositorio
- Usa `.env.example` como plantilla
- Las variables `VITE_*` son públicas en el frontend

### API Keys
- Mantén tus API Keys seguras
- Usa restricciones de dominio cuando sea posible
- Rota las keys periódicamente

### ⚠️ Service Role Key - Manejo Especial

La `service_role` key tiene **permisos completos** sobre tu base de datos:
- Puede leer, escribir y eliminar cualquier dato
- Bypasa todas las políticas de seguridad (RLS)
- **NUNCA** la expongas en el frontend
- Solo úsala para operaciones administrativas del backend
- Manténla segura y rotar periódicamente

## 🚨 Solución de Problemas

### Error: "Supabase URL inválida"
- Verifica que la URL tenga el formato: `https://proyecto.supabase.co`
- Asegúrate de no incluir rutas adicionales

### Error: "Gemini API Key inválida"
- Verifica que la API Key esté correctamente copiada
- Asegúrate de que la Generative Language API esté habilitada

### Error: "No se puede conectar a Supabase"
- Verifica que el proyecto de Supabase esté activo
- Revisa que la anon key sea correcta
- Ejecuta el script de base de datos

## 📞 Soporte

Si tienes problemas con la configuración:

1. Ejecuta `npm run validate-config` para diagnóstico
2. Revisa los logs en la consola del navegador
3. Verifica que todas las APIs estén habilitadas
4. Consulta la documentación oficial de cada servicio

## 🎯 Modo de Desarrollo

Para desarrollo local sin APIs configuradas:
```env
VITE_DEV_MODE=true
```

Esto habilitará:
- Mock de Supabase (datos simulados)
- Mock de Gemini (respuestas predeterminadas)
- Logs detallados para debugging