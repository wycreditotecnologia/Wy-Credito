/**
 * Script para verificar la estructura real de la tabla solicitudes
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
  process.exit(1);
}

async function checkTableStructure() {
  console.log('🔍 VERIFICANDO ESTRUCTURA DE TABLA SOLICITUDES');
  console.log('=' .repeat(60));

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('\n📋 Consultando estructura de columnas...');
    
    // Consultar estructura de la tabla
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'solicitudes')
      .order('ordinal_position');

    if (error) {
      console.log('❌ Error consultando estructura:', error.message);
      
      // Intentar con una consulta más simple
      console.log('\n📋 Intentando consulta alternativa...');
      const { data: testData, error: testError } = await supabase
        .from('solicitudes')
        .select('*')
        .limit(0);
        
      if (testError) {
        console.log('❌ Error en consulta alternativa:', testError.message);
      } else {
        console.log('✅ Tabla existe pero no se puede consultar su estructura');
      }
      
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ No se encontraron columnas para la tabla solicitudes');
      return;
    }

    console.log('\n📊 ESTRUCTURA ACTUAL DE LA TABLA:');
    console.log('=' .repeat(60));
    
    data.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
      const defaultVal = col.column_default ? ` DEFAULT: ${col.column_default}` : '';
      console.log(`   ${col.column_name.padEnd(25)} ${col.data_type.padEnd(15)} ${nullable}${defaultVal}`);
    });

    // Verificar columnas específicas
    console.log('\n🔍 VERIFICACIÓN DE COLUMNAS CRÍTICAS:');
    console.log('=' .repeat(60));
    
    const criticalColumns = ['plazo_seleccionado', 'plazo_solicitado', 'monto_solicitado'];
    
    criticalColumns.forEach(colName => {
      const found = data.find(col => col.column_name === colName);
      if (found) {
        const nullable = found.is_nullable === 'YES' ? '✅ nullable' : '❌ NOT NULL';
        console.log(`   ${colName.padEnd(20)} ✅ EXISTE (${found.data_type}) ${nullable}`);
      } else {
        console.log(`   ${colName.padEnd(20)} ❌ NO EXISTE`);
      }
    });

    // Generar recomendación
    console.log('\n💡 RECOMENDACIÓN:');
    console.log('=' .repeat(60));
    
    const hasPlazoleccionado = data.find(col => col.column_name === 'plazo_seleccionado');
    const hasPlazoSolicitado = data.find(col => col.column_name === 'plazo_solicitado');
    
    if (hasPlazoleccionado && !hasPlazoSolicitado) {
      console.log('📋 La tabla usa "plazo_seleccionado", no "plazo_solicitado"');
      console.log('📋 ACCIÓN: Revertir el cambio en ApplicationView.jsx');
      console.log('📋 Cambiar de vuelta a "plazo_seleccionado" en el código');
    } else if (hasPlazoSolicitado && !hasPlazoleccionado) {
      console.log('📋 La tabla usa "plazo_solicitado" correctamente');
      console.log('📋 El problema puede ser otro');
    } else if (hasPlazoleccionado && hasPlazoSolicitado) {
      console.log('📋 La tabla tiene ambas columnas');
      console.log('📋 Verificar cuál se debe usar');
    } else {
      console.log('📋 Ninguna columna de plazo encontrada');
      console.log('📋 La tabla necesita ser recreada');
    }

  } catch (error) {
    console.error('❌ Error verificando estructura:', error.message);
  }
}

// Ejecutar verificación
checkTableStructure();