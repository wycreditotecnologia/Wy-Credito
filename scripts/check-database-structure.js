// =====================================================
// SCRIPT PARA VERIFICAR ESTRUCTURA ACTUAL DE LA BASE DE DATOS
// Wy Crédito Tecnología - Wally v1.0
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Leer variables de entorno desde .env
const envContent = readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarEstructuraActual() {
  console.log('🔍 VERIFICANDO ESTRUCTURA ACTUAL DE LA BASE DE DATOS');
  console.log('=' .repeat(60));

  // Lista de tablas que esperamos encontrar
  const tablasEsperadas = ['solicitudes', 'documentos', 'conversaciones', 'orquestador_logs'];
  
  console.log('\n📋 Verificando tablas existentes...');
  
  for (const tabla of tablasEsperadas) {
    try {
      const { data, error } = await supabase.from(tabla).select('*').limit(1);
      
      if (error) {
        console.log(`❌ Tabla '${tabla}': ${error.message}`);
      } else {
        console.log(`✅ Tabla '${tabla}': Existe y es accesible`);
        
        // Si hay datos, mostrar la estructura
        if (data && data.length > 0) {
          console.log(`   📊 Columnas encontradas: ${Object.keys(data[0]).join(', ')}`);
        } else {
          console.log(`   📊 Tabla vacía pero estructura válida`);
        }
      }
    } catch (err) {
      console.log(`❌ Tabla '${tabla}': Error de conexión - ${err.message}`);
    }
  }

  // Verificar funciones
  console.log('\n🔧 Verificando funciones...');
  try {
    const { data, error } = await supabase.rpc('get_dashboard_metrics');
    if (error) {
      console.log(`❌ Función 'get_dashboard_metrics': ${error.message}`);
    } else {
      console.log(`✅ Función 'get_dashboard_metrics': Funciona correctamente`);
    }
  } catch (err) {
    console.log(`❌ Función 'get_dashboard_metrics': ${err.message}`);
  }

  // Verificar storage
  console.log('\n📁 Verificando Storage...');
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log(`❌ Storage: ${error.message}`);
    } else {
      console.log(`✅ Storage: Accesible`);
      console.log(`   📦 Buckets encontrados: ${data.map(b => b.name).join(', ') || 'Ninguno'}`);
    }
  } catch (err) {
    console.log(`❌ Storage: ${err.message}`);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('✅ VERIFICACIÓN COMPLETADA');
}

verificarEstructuraActual().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});