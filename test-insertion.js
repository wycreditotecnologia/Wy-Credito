/**
 * Script para probar inserción anónima en solicitudes
 * Verifica si las políticas RLS permiten la inserción
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
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno faltantes');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
  process.exit(1);
}

async function testInsertion() {
  console.log('🧪 PROBANDO INSERCIÓN ANÓNIMA EN SOLICITUDES');
  console.log('=' .repeat(50));

  try {
    console.log('\n📋 Conectando con clave anónima...');
    
    // Crear cliente con clave anónima
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const testData = {
      monto_solicitado: 1000000,
      plazo_seleccionado: 12,
      estado: 'pendiente'
    };

    console.log('📋 Intentando insertar datos de prueba...');
    console.log('   Datos:', JSON.stringify(testData, null, 2));

    const { data, error } = await supabase
      .from('solicitudes')
      .insert(testData)
      .select('id')
      .single();

    if (error) {
      console.log('\n❌ INSERCIÓN FALLÓ');
      console.log('   Error:', error.message);
      console.log('   Código:', error.code);
      console.log('   Detalles:', error.details);
      
      console.log('\n📝 SOLUCIÓN: EJECUTAR ESTE SQL EN SUPABASE SQL EDITOR:');
      console.log('=' .repeat(60));
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
      console.log('=' .repeat(60));
      
      return false;
    } else {
      console.log('\n✅ INSERCIÓN EXITOSA');
      console.log('   ID creado:', data.id);
      console.log('✅ Las políticas RLS ya permiten inserción anónima');
      console.log('✅ Wally puede crear nuevas solicitudes correctamente');
      return true;
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    return false;
  }
}

// Ejecutar prueba
testInsertion().then(success => {
  if (success) {
    console.log('\n🎉 PRUEBA EXITOSA');
    console.log('✅ El sistema está listo para recibir solicitudes');
  } else {
    console.log('\n⚠️  CORRECCIÓN REQUERIDA');
    console.log('📋 Ejecutar el SQL mostrado arriba en Supabase SQL Editor');
    console.log('📋 Luego volver a probar la aplicación');
  }
  process.exit(success ? 0 : 1);
});