-- =====================================================
-- SCRIPT FINAL PARA CORREGIR WALLY EN SUPABASE
-- =====================================================
-- INSTRUCCIONES:
-- 1. Abrir Supabase Dashboard > SQL Editor
-- 2. Copiar y pegar este script completo
-- 3. Ejecutar todo el script
-- =====================================================

-- PASO 1: Eliminar políticas RLS restrictivas existentes
DROP POLICY IF EXISTS "solicitudes_insert_policy" ON solicitudes;
DROP POLICY IF EXISTS "solicitudes_select_policy" ON solicitudes;
DROP POLICY IF EXISTS "solicitudes_update_policy" ON solicitudes;
DROP POLICY IF EXISTS "solicitudes_delete_policy" ON solicitudes;
DROP POLICY IF EXISTS "Acceso público a solicitudes" ON solicitudes;

-- PASO 2: Crear políticas RLS permisivas para inserción anónima
-- (Usar DROP IF EXISTS para evitar errores si ya existen)
DROP POLICY IF EXISTS allow_anonymous_insert ON public.solicitudes;
CREATE POLICY allow_anonymous_insert ON public.solicitudes
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

DROP POLICY IF EXISTS allow_anonymous_select ON public.solicitudes;
CREATE POLICY allow_anonymous_select ON public.solicitudes
  FOR SELECT
  TO PUBLIC
  USING (true);

DROP POLICY IF EXISTS allow_anonymous_update ON public.solicitudes;
CREATE POLICY allow_anonymous_update ON public.solicitudes
  FOR UPDATE
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- PASO 3: Habilitar RLS en la tabla
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;

-- PASO 4: Verificar que la columna plazo_solicitado existe
-- Si este comando falla, ejecutar también el setup_database.sql completo
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'solicitudes' 
AND column_name = 'plazo_solicitado';

-- PASO 5: Si la columna no existe, agregar las columnas faltantes
-- (Solo ejecutar si el SELECT anterior no devuelve resultados)
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS plazo_solicitado INTEGER;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS datos_empresa JSONB;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS email_solicitante TEXT;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
-- Este query debe mostrar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'solicitudes';

-- Este query debe mostrar las columnas de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'solicitudes'
ORDER BY ordinal_position;