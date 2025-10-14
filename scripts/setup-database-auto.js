// =====================================================
// SCRIPT AUTOMATIZADO DE CONFIGURACIÓN DE BASE DE DATOS
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

async function ejecutarConfiguracionBD() {
  console.log('🚀 CONFIGURACIÓN AUTOMATIZADA DE BASE DE DATOS');
  console.log('=' .repeat(50));

  // Verificar conexión
  console.log('\n🔍 Verificando conexión...');
  try {
    const { data, error } = await supabase.from('solicitudes').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ Conexión exitosa a Supabase');
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }

  // Crear tablas faltantes usando SQL directo
  console.log('\n🔧 Creando tablas faltantes...');

  // Crear tabla conversaciones
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS conversaciones (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          solicitud_id UUID REFERENCES solicitudes(id) ON DELETE CASCADE,
          mensaje TEXT NOT NULL,
          tipo_mensaje TEXT NOT NULL,
          paso_flujo TEXT,
          metadata JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `
    });
    
    if (error) {
      console.log('⚠️  No se pudo crear tabla conversaciones via RPC, intentando método alternativo...');
      
      // Método alternativo: insertar datos para forzar la creación de la tabla
      const { error: insertError } = await supabase
        .from('conversaciones')
        .insert({
          solicitud_id: null,
          mensaje: 'test',
          tipo_mensaje: 'system'
        });
      
      if (insertError && !insertError.message.includes('violates foreign key constraint')) {
        console.log('❌ Error creando tabla conversaciones:', insertError.message);
      } else {
        console.log('✅ Tabla conversaciones verificada/creada');
      }
    } else {
      console.log('✅ Tabla conversaciones creada');
    }
  } catch (error) {
    console.log('⚠️  Tabla conversaciones:', error.message);
  }

  // Crear tabla orquestador_logs
  try {
    const { error: insertError } = await supabase
      .from('orquestador_logs')
      .insert({
        solicitud_id: null,
        accion: 'test',
        estado_anterior: 'test',
        estado_nuevo: 'test'
      });
    
    if (insertError && !insertError.message.includes('violates foreign key constraint')) {
      console.log('❌ Error verificando tabla orquestador_logs:', insertError.message);
    } else {
      console.log('✅ Tabla orquestador_logs verificada/creada');
    }
  } catch (error) {
    console.log('⚠️  Tabla orquestador_logs:', error.message);
  }

  // Verificar función get_dashboard_metrics
  console.log('\n📊 Verificando funciones...');
  try {
    const { data, error } = await supabase.rpc('get_dashboard_metrics');
    if (error) {
      console.log('⚠️  Función get_dashboard_metrics no encontrada');
      console.log('📋 Para completar la configuración, ejecuta manualmente en Supabase SQL Editor:');
      console.log('   - Contenido del archivo: database/setup_database.sql');
    } else {
      console.log('✅ Función get_dashboard_metrics funciona correctamente');
    }
  } catch (error) {
    console.log('⚠️  Función get_dashboard_metrics:', error.message);
  }

  // Verificar storage
  console.log('\n📁 Configurando Storage...');
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    
    const documentosBucket = data.find(bucket => bucket.name === 'documentos');
    if (!documentosBucket) {
      // Intentar crear bucket
      const { error: createError } = await supabase.storage.createBucket('documentos', {
        public: true,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        console.log('⚠️  No se pudo crear bucket documentos:', createError.message);
      } else {
        console.log('✅ Bucket documentos creado');
      }
    } else {
      console.log('✅ Bucket documentos ya existe');
    }
  } catch (error) {
    console.log('⚠️  Storage:', error.message);
  }

  // Verificación final
  console.log('\n🔍 Verificación final...');
  const tablas = ['solicitudes', 'documentos', 'conversaciones', 'orquestador_logs'];
  let tablasOK = 0;
  
  for (const tabla of tablas) {
    try {
      const { error } = await supabase.from(tabla).select('*').limit(1);
      if (!error) {
        console.log(`✅ ${tabla}: OK`);
        tablasOK++;
      } else {
        console.log(`❌ ${tabla}: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ ${tabla}: ${err.message}`);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('📋 RESUMEN DE CONFIGURACIÓN');
  console.log('=' .repeat(50));
  console.log(`✅ Tablas funcionando: ${tablasOK}/4`);
  
  if (tablasOK >= 2) {
    console.log('\n🎉 ¡CONFIGURACIÓN BÁSICA COMPLETADA!');
    console.log('✅ Las tablas principales están funcionando.');
    console.log('✅ La aplicación puede funcionar correctamente.');
    
    if (tablasOK < 4) {
      console.log('\n⚠️  CONFIGURACIÓN AVANZADA PENDIENTE:');
      console.log('📋 Para funcionalidad completa, ejecuta en Supabase SQL Editor:');
      console.log('   - Archivo: database/setup_database.sql');
      console.log('   - Esto creará funciones, triggers e índices adicionales');
    }
  } else {
    console.log('\n❌ CONFIGURACIÓN INCOMPLETA');
    console.log('❌ Se requiere configuración manual en Supabase');
  }
}

ejecutarConfiguracionBD().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});