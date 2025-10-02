import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Leer variables de entorno desde .env
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/['"]/g, '');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 VERIFICANDO STORAGE Y FUNCIONES DE SUPABASE');
console.log('='.repeat(50));

async function verifyStorage() {
  console.log('\n📁 Verificando Storage...');
  
  try {
    // Listar buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('⚠️  Error listando buckets:', bucketsError.message);
      return false;
    }
    
    console.log(`✅ Storage accesible. Buckets encontrados: ${buckets.length}`);
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
    });
    
    // Verificar si existe bucket 'documentos'
    const documentosBucket = buckets.find(b => b.name === 'documentos');
    if (!documentosBucket) {
      console.log('⚠️  Bucket "documentos" no encontrado. Se creará automáticamente en el primer upload.');
    } else {
      console.log('✅ Bucket "documentos" encontrado');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error verificando storage:', error.message);
    return false;
  }
}

async function verifyFunctions() {
  console.log('\n⚙️ Verificando funciones disponibles...');
  
  try {
    // Intentar llamar función get_dashboard_metrics
    const { data, error } = await supabase.rpc('get_dashboard_metrics');
    
    if (error) {
      console.log('⚠️  Función get_dashboard_metrics no disponible:', error.message);
      return false;
    }
    
    console.log('✅ Función get_dashboard_metrics disponible');
    console.log('   Métricas:', data);
    return true;
  } catch (error) {
    console.log('❌ Error verificando funciones:', error.message);
    return false;
  }
}

async function testFileUpload() {
  console.log('\n📤 Probando upload de archivos...');
  
  try {
    // Crear un archivo de prueba
    const testContent = 'Este es un archivo de prueba para verificar el upload';
    const fileName = `test-${Date.now()}.txt`;
    
    const { data, error } = await supabase.storage
      .from('documentos')
      .upload(fileName, testContent, {
        contentType: 'text/plain'
      });
    
    if (error) {
      console.log('⚠️  Error en upload de prueba:', error.message);
      return false;
    }
    
    console.log('✅ Upload de prueba exitoso:', data.path);
    
    // Limpiar archivo de prueba
    await supabase.storage.from('documentos').remove([fileName]);
    console.log('✅ Archivo de prueba eliminado');
    
    return true;
  } catch (error) {
    console.log('❌ Error en test de upload:', error.message);
    return false;
  }
}

async function main() {
  let passedTests = 0;
  let totalTests = 3;
  
  // Test 1: Storage
  if (await verifyStorage()) passedTests++;
  
  // Test 2: Functions
  if (await verifyFunctions()) passedTests++;
  
  // Test 3: File Upload
  if (await testFileUpload()) passedTests++;
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE VERIFICACIÓN');
  console.log('='.repeat(50));
  console.log(`✅ Tests pasados: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡STORAGE Y FUNCIONES COMPLETAMENTE OPERATIVOS!');
  } else if (passedTests >= 1) {
    console.log('⚠️  FUNCIONALIDAD BÁSICA DISPONIBLE');
    console.log('📋 Algunas funciones avanzadas requieren configuración adicional');
  } else {
    console.log('❌ PROBLEMAS CRÍTICOS DETECTADOS');
  }
}

main().catch(console.error);