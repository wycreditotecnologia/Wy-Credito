# INSTRUCCIONES PARA CREAR EL BUCKET DE STORAGE EN SUPABASE

## Paso 1: Ir a Storage en Supabase
1. Abre tu proyecto en Supabase Dashboard
2. Ve a la sección **Storage** en el menú lateral izquierdo

## Paso 2: Crear el Bucket
1. Haz clic en **"New bucket"** o **"Create a new bucket"**
2. Configura el bucket con estos valores:
   - **Name**: `documentos`
   - **Public bucket**: ❌ NO (desmarcado) - Los documentos deben ser privados
   - **File size limit**: 50 MB (o el que prefieras)
   - **Allowed MIME types**: `application/pdf` (opcional, para mayor seguridad)

3. Haz clic en **"Create bucket"** o **"Save"**

## Paso 3: Configurar Políticas de Acceso (RLS)

Después de crear el bucket, necesitas configurar las políticas para que los usuarios puedan subir y leer sus propios archivos:

### Política 1: Permitir UPLOAD (Subida)
```sql
-- En Storage > Policies > New Policy para el bucket "documentos"
-- Nombre: "Users can upload own documents"
-- Operation: INSERT
-- Policy definition:
(bucket_id = 'documentos'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
```

### Política 2: Permitir SELECT (Lectura)
```sql
-- Nombre: "Users can read own documents"
-- Operation: SELECT
-- Policy definition:
(bucket_id = 'documentos'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
```

### Política 3: Permitir UPDATE (Actualización)
```sql
-- Nombre: "Users can update own documents"
-- Operation: UPDATE
-- Policy definition:
(bucket_id = 'documentos'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
```

## Alternativa Rápida (Políticas Simples)

Si prefieres políticas más simples para desarrollo/testing:

```sql
-- Permitir todo para usuarios autenticados (SOLO PARA DESARROLLO)
CREATE POLICY "Allow authenticated users full access"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'documentos')
WITH CHECK (bucket_id = 'documentos');
```

## Verificación
Después de crear el bucket y las políticas, recarga la página `/solicitud` e intenta subir un documento nuevamente.
