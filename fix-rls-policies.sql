
-- SOLUCIÓN: Política RLS para permitir inserción anónima en solicitudes
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar políticas existentes que puedan estar bloqueando
DROP POLICY IF EXISTS "solicitudes_insert_policy" ON solicitudes;
DROP POLICY IF EXISTS "solicitudes_select_policy" ON solicitudes;
DROP POLICY IF EXISTS "solicitudes_update_policy" ON solicitudes;
DROP POLICY IF EXISTS "solicitudes_delete_policy" ON solicitudes;

-- 2. Crear nueva política permisiva para INSERT
CREATE POLICY "allow_anonymous_insert" ON solicitudes
  FOR INSERT
  WITH CHECK (true);

-- 3. Crear política permisiva para SELECT (para verificar inserción)
CREATE POLICY "allow_anonymous_select" ON solicitudes
  FOR SELECT
  USING (true);

-- 4. Verificar que RLS esté habilitado
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;

-- 5. Verificar políticas creadas
SELECT * FROM pg_policies WHERE tablename = 'solicitudes';
