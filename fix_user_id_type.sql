-- CORRECCIÓN CRÍTICA DE TIPOS DE DATOS
-- Ejecuta esto en el Editor SQL de Supabase para arreglar el error de compatibilidad (UUID vs BIGINT)

-- Primero, limpiamos datos de prueba que causarian conflicto al convertir a UUID (como el user_id=1)
TRUNCATE TABLE user_profiles, credit_applications, application_steps, application_documents, application_references CASCADE;

-- 1. user_profiles
ALTER TABLE user_profiles 
    ALTER COLUMN user_id TYPE UUID USING gen_random_uuid(); -- Usamos gen_random_uuid() temporalmente si hubiera datos, pero con truncate no importa. Lo correcto es USING user_id::text::uuid si los datos fueran validos.
    -- Como hicimos truncate, simplemente cambiamos el tipo:
    -- ALTER COLUMN user_id TYPE UUID; (Postgres requiere USING para cambios de tipo incompatibles)

ALTER TABLE user_profiles ALTER COLUMN user_id TYPE UUID USING user_id::text::uuid;

-- 2. credit_applications
ALTER TABLE credit_applications ALTER COLUMN user_id TYPE UUID USING user_id::text::uuid;

-- 3. application_steps
ALTER TABLE application_steps ALTER COLUMN user_id TYPE UUID USING user_id::text::uuid;

-- 4. application_documents
ALTER TABLE application_documents ALTER COLUMN user_id TYPE UUID USING user_id::text::uuid;

-- 5. application_references
ALTER TABLE application_references ALTER COLUMN user_id TYPE UUID USING user_id::text::uuid;

-- Verificar que RLS siga funcionando (las políticas usan uid() que devuelve uuid, ahora coincidirá)
