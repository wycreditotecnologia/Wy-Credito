-- =====================================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA SOLICITUDES
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Eliminar políticas restrictivas existentes
DROP POLICY IF EXISTS "solicitudes_insert_policy" ON solicitudes;
DROP POLICY IF EXISTS "solicitudes_select_policy" ON solicitudes;
DROP POLICY IF EXISTS "solicitudes_update_policy" ON solicitudes;
DROP POLICY IF EXISTS "solicitudes_delete_policy" ON solicitudes;

-- Eliminar política existente de acceso público si existe
DROP POLICY IF EXISTS "Acceso público a solicitudes" ON solicitudes;

-- Crear políticas permisivas para inserción anónima
CREATE POLICY "allow_anonymous_insert" ON solicitudes
  FOR INSERT
  WITH CHECK (true);

-- Crear política permisiva para SELECT (para verificar inserción)
CREATE POLICY "allow_anonymous_select" ON solicitudes
  FOR SELECT
  USING (true);

-- Crear política permisiva para UPDATE (para actualizaciones posteriores)
CREATE POLICY "allow_anonymous_update" ON solicitudes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Verificar que RLS esté habilitado
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;

-- Verificar políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'solicitudes';