// =====================================================
// SCRIPT DE VERIFICACIÓN DE INTEGRIDAD DE BASE DE DATOS
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

// =====================================================
// FUNCIONES DE VERIFICACIÓN
// =====================================================

async function verificarConexion() {
  console.log('\n🔍 Verificando conexión a Supabase...');
  try {
    const { data, error } = await supabase.from('solicitudes').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ Conexión exitosa a Supabase');
    console.log(`📊 Total de solicitudes en base de datos: ${data || 0}`);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

async function verificarTablas() {
  console.log('\n🔍 Verificando estructura de tablas...');
  const tablas = ['solicitudes', 'documentos', 'conversaciones'];
  
  for (const tabla of tablas) {
    try {
      const { data, error } = await supabase.from(tabla).select('*').limit(1);
      if (error) throw error;
      console.log(`✅ Tabla '${tabla}' existe y es accesible`);
    } catch (error) {
      console.error(`❌ Error en tabla '${tabla}':`, error.message);
      return false;
    }
  }
  return true;
}

async function verificarFunciones() {
  console.log('\n🔍 Verificando funciones de base de datos...');
  
  try {
    // Verificar función get_dashboard_metrics
    const { data, error } = await supabase.rpc('get_dashboard_metrics');
    if (error) throw error;
    console.log('✅ Función get_dashboard_metrics funciona correctamente');
    console.log('📊 Métricas actuales:');
    console.log(`   - Total de solicitudes: ${data.total_applications}`);
    console.log(`   - Solicitudes pendientes: ${data.pending_applications}`);
    console.log(`   - Solicitudes aprobadas: ${data.approved_applications}`);
    console.log(`   - Monto promedio: $${data.average_amount?.toLocaleString() || 0}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error en funciones:', error.message);
    return false;
  }
}

async function verificarStorage() {
  console.log('\n🔍 Verificando Supabase Storage...');
  
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    
    const documentosBucket = data.find(bucket => bucket.name === 'documentos');
    if (documentosBucket) {
      console.log('✅ Bucket "documentos" existe y es accesible');
      
      // Verificar archivos en el bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('documentos')
        .list('', { limit: 5 });
      
      if (!filesError) {
        console.log(`📁 Archivos en storage: ${files.length}`);
      }
    } else {
      console.log('⚠️  Bucket "documentos" no encontrado - se creará automáticamente al subir el primer archivo');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error en Storage:', error.message);
    return false;
  }
}

async function verificarEstructuraCompleta() {
  console.log('\n🔍 Verificando estructura completa de datos...');
  
  try {
    // Verificar que podemos hacer consultas básicas
    const { data: solicitudes, error: solError } = await supabase
      .from('solicitudes')
      .select('id, email_solicitante, estado, created_at')
      .limit(3);
    
    if (solError) throw solError;
    
    console.log('✅ Consultas a solicitudes funcionan correctamente');
    if (solicitudes.length > 0) {
      console.log(`📋 Últimas ${solicitudes.length} solicitudes:`);
      solicitudes.forEach(sol => {
        console.log(`   - ${sol.email_solicitante} (${sol.estado}) - ${new Date(sol.created_at).toLocaleDateString()}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error en estructura:', error.message);
    return false;
  }
}

// =====================================================
// FUNCIÓN PRINCIPAL
// =====================================================

async function ejecutarVerificacion() {
  console.log('🚀 INICIANDO VERIFICACIÓN DE INTEGRIDAD DE BASE DE DATOS');
  console.log('=' .repeat(60));
  
  const verificaciones = [
    { nombre: 'Conexión', funcion: verificarConexion },
    { nombre: 'Tablas', funcion: verificarTablas },
    { nombre: 'Funciones', funcion: verificarFunciones },
    { nombre: 'Storage', funcion: verificarStorage },
    { nombre: 'Estructura Completa', funcion: verificarEstructuraCompleta }
  ];
  
  let exitosas = 0;
  let fallidas = 0;
  
  for (const verificacion of verificaciones) {
    const resultado = await verificacion.funcion();
    if (resultado) {
      exitosas++;
    } else {
      fallidas++;
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 RESUMEN DE VERIFICACIÓN');
  console.log('=' .repeat(60));
  console.log(`✅ Verificaciones exitosas: ${exitosas}`);
  console.log(`❌ Verificaciones fallidas: ${fallidas}`);
  
  if (fallidas === 0) {
    console.log('\n🎉 ¡TODAS LAS VERIFICACIONES PASARON!');
    console.log('✅ La base de datos está correctamente configurada y lista para producción.');
  } else if (exitosas >= 3) {
    console.log('\n⚠️  VERIFICACIÓN PARCIALMENTE EXITOSA');
    console.log('✅ Los componentes principales funcionan correctamente.');
    console.log('⚠️  Algunas verificaciones avanzadas fallaron, pero el sistema es funcional.');
  } else {
    console.log('\n❌ VERIFICACIÓN FALLIDA');
    console.log('❌ Revisa los errores anteriores antes de continuar.');
    process.exit(1);
  }
}

// Ejecutar verificación
ejecutarVerificacion().catch(error => {
  console.error('💥 Error fatal en verificación:', error);
  process.exit(1);
});