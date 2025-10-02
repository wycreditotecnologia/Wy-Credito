/**
 * Script para aplicar automáticamente las correcciones de políticas RLS
 * Ejecuta las políticas permisivas para permitir inserción anónima
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Leer variables de entorno del archivo .env
function loadEnvVars() {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim().replace(/['"]/g, '');
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Error leyendo archivo .env:', error.message);
    return {};
  }
}

const envVars = loadEnvVars();
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno faltantes');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  console.error('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSFix() {
  console.log('🔧 APLICANDO CORRECCIÓN DE POLÍTICAS RLS');
  console.log('=' .repeat(50));

  try {
    console.log('\n📋 Paso 1: Probando inserción anónima directamente...');
    
    // Probar inserción con anon key
    const anonSupabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const testData = {
      monto_solicitado: 1000000,
      plazo_solicitado: 12,
      estado: 'incompleta'
    };

    const { data, error } = await anonSupabase
      .from('solicitudes')
      .insert(testData)
      .select('id')
      .single();

    if (error) {
      console.log('❌ Inserción anónima falló:', error.message);
      console.log('\n📋 Paso 2: Aplicando corrección manual...');
      
      // Mostrar el SQL que debe ejecutarse manualmente
      console.log('\n📝 EJECUTAR ESTE SQL EN SUPABASE SQL EDITOR:');
      console.log('=' .repeat(50));
      console.log(`
-- Eliminar políticas restrictivas existentes
DROP POLICY IF EXISTS "solicitudes_insert_policy" ON solicitudes;
DROP POLICY IF EXISTS "solicitudes_select_policy" ON solicitudes;
DROP POLICY IF EXISTS "solicitudes_update_policy" ON solicitudes;
DROP POLICY IF EXISTS "solicitudes_delete_policy" ON solicitudes;
DROP POLICY IF EXISTS "Acceso público a solicitudes" ON solicitudes;

-- Crear políticas permisivas para inserción anónima
CREATE POLICY "allow_anonymous_insert" ON solicitudes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "allow_anonymous_select" ON solicitudes
  FOR SELECT
  USING (true);

CREATE POLICY "allow_anonymous_update" ON solicitudes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Verificar que RLS esté habilitado
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
      `);
      console.log('=' .repeat(50));
      
      return false;
    } else {
      console.log('✅ Inserción anónima exitosa, ID:', data.id);
      
      // Limpiar el registro de prueba
      await supabase
        .from('solicitudes')
        .delete()
        .eq('id', data.id);
      
      console.log('✅ Registro de prueba eliminado');
      console.log('✅ Las políticas RLS ya permiten inserción anónima');
      return true;
    }

  } catch (error) {
    console.error('❌ Error aplicando corrección:', error.message);
    return false;
  }
}

// Ejecutar corrección
applyRLSFix().then(success => {
  if (success) {
    console.log('\n🎉 CORRECCIÓN APLICADA EXITOSAMENTE');
    console.log('✅ Las políticas RLS permiten inserción anónima');
    console.log('✅ Wally puede crear nuevas solicitudes');
  } else {
    console.log('\n⚠️  CORRECCIÓN MANUAL REQUERIDA');
    console.log('📋 Ejecutar el SQL mostrado arriba en Supabase SQL Editor');
  }
  process.exit(success ? 0 : 1);
});