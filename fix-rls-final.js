/**
 * Script para aplicar las correcciones finales de RLS
 * Ejecuta el SQL necesario para permitir inserción anónima
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
const serviceRoleKey = envVars.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Variables de entorno faltantes');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅' : '❌');
  process.exit(1);
}

async function applyRLSFix() {
  console.log('🔧 APLICANDO CORRECCIONES RLS FINALES');
  console.log('=' .repeat(50));

  try {
    console.log('\n📋 Conectando con service role key...');
    
    // Crear cliente con service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    const sqlCommands = [
      // Eliminar políticas existentes
      `DROP POLICY IF EXISTS "solicitudes_insert_policy" ON solicitudes;`,
      `DROP POLICY IF EXISTS "solicitudes_select_policy" ON solicitudes;`,
      `DROP POLICY IF EXISTS "solicitudes_update_policy" ON solicitudes;`,
      `DROP POLICY IF EXISTS "solicitudes_delete_policy" ON solicitudes;`,
      `DROP POLICY IF EXISTS "Acceso público a solicitudes" ON solicitudes;`,
      
      // Crear políticas permisivas
      `CREATE POLICY "allow_anonymous_insert" ON solicitudes
        FOR INSERT
        WITH CHECK (true);`,
      
      `CREATE POLICY "allow_anonymous_select" ON solicitudes
        FOR SELECT
        USING (true);`,
      
      `CREATE POLICY "allow_anonymous_update" ON solicitudes
        FOR UPDATE
        USING (true)
        WITH CHECK (true);`,
      
      // Habilitar RLS
      `ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;`
    ];

    console.log('\n📋 Ejecutando comandos SQL...');
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i];
      console.log(`   ${i + 1}/${sqlCommands.length}: ${sql.split('\n')[0]}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
        // Continuar con los siguientes comandos
      } else {
        console.log(`   ✅ Ejecutado correctamente`);
      }
    }

    console.log('\n🧪 PROBANDO INSERCIÓN ANÓNIMA...');
    
    // Probar inserción con clave anónima
    const anonClient = createClient(supabaseUrl, envVars.VITE_SUPABASE_ANON_KEY);
    
    const testData = {
      monto_solicitado: 1000000,
      plazo_solicitado: 12,
      estado: 'incompleta'
    };

    const { data, error } = await anonClient
      .from('solicitudes')
      .insert(testData)
      .select('id')
      .single();

    if (error) {
      console.log('\n❌ INSERCIÓN ANÓNIMA FALLÓ');
      console.log('   Error:', error.message);
      console.log('   Código:', error.code);
      
      if (error.code === 'PGRST204') {
        console.log('\n⚠️  PROBLEMA: La tabla no tiene la estructura completa');
        console.log('📋 SOLUCIÓN: Ejecutar setup_database.sql completo en Supabase SQL Editor');
      }
      
      return false;
    } else {
      console.log('\n✅ INSERCIÓN ANÓNIMA EXITOSA');
      console.log('   ID creado:', data.id);
      
      // Limpiar el registro de prueba
      await supabase
        .from('solicitudes')
        .delete()
        .eq('id', data.id);
      
      console.log('✅ Registro de prueba eliminado');
      return true;
    }

  } catch (error) {
    console.error('❌ Error en la aplicación de RLS:', error.message);
    return false;
  }
}

// Ejecutar corrección
applyRLSFix().then(success => {
  if (success) {
    console.log('\n🎉 CORRECCIÓN RLS COMPLETADA');
    console.log('✅ Wally puede crear nuevas solicitudes correctamente');
    console.log('✅ Plan de acción ejecutado exitosamente');
  } else {
    console.log('\n⚠️  CORRECCIÓN PARCIAL');
    console.log('📋 Revisar mensajes de error arriba');
    console.log('📋 Puede ser necesario ejecutar setup_database.sql manualmente');
  }
  process.exit(success ? 0 : 1);
});