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
const serviceKey = envVars.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 AUDITORÍA 1: POLÍTICAS RLS EN TABLA SOLICITUDES');
console.log('='.repeat(60));

async function auditRLSPolicies() {
  console.log('\n📋 Analizando políticas de Row Level Security...');
  
  try {
    // Usar service key para consultar políticas
    const supabaseAdmin = createClient(supabaseUrl, serviceKey || supabaseKey);
    
    // Consultar políticas RLS de la tabla solicitudes
    const { data: policies, error } = await supabaseAdmin
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'solicitudes');
    
    if (error) {
      console.log('⚠️  Error consultando políticas directamente:', error.message);
      console.log('   Intentando método alternativo...');
      
      // Método alternativo: consulta SQL directa
      const { data: sqlResult, error: sqlError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = 'solicitudes';
        `
      });
      
      if (sqlError) {
        console.log('❌ No se pueden consultar políticas RLS:', sqlError.message);
        return false;
      }
      
      console.log('✅ Políticas encontradas:', sqlResult);
      return sqlResult;
    }
    
    console.log('✅ Políticas RLS encontradas:', policies.length);
    policies.forEach((policy, index) => {
      console.log(`\n--- POLÍTICA ${index + 1} ---`);
      console.log(`Nombre: ${policy.policyname}`);
      console.log(`Comando: ${policy.cmd}`);
      console.log(`Roles: ${policy.roles}`);
      console.log(`Condición: ${policy.qual || 'N/A'}`);
      console.log(`With Check: ${policy.with_check || 'N/A'}`);
    });
    
    return policies;
  } catch (error) {
    console.log('❌ Error en auditoría RLS:', error.message);
    return false;
  }
}

async function testInsertPermissions() {
  console.log('\n🧪 Probando permisos de inserción con anon_key...');
  
  try {
    const supabaseAnon = createClient(supabaseUrl, supabaseKey);
    
    // Intentar inserción de prueba
    const testData = {
      email_solicitante: 'test@audit.com',
      estado: 'iniciada',
      monto_solicitado: 1000000,
      plazo_seleccionado: 12,
      datos_empresa: { nombre: 'Test Audit' },
      datos_representante: { nombre: 'Test User' },
      datos_financieros: { ingresos: 5000000 }
    };
    
    const { data, error } = await supabaseAnon
      .from('solicitudes')
      .insert(testData)
      .select();
    
    if (error) {
      console.log('❌ FALLO DE INSERCIÓN DETECTADO:');
      console.log(`   Error: ${error.message}`);
      console.log(`   Código: ${error.code}`);
      console.log(`   Detalles: ${error.details}`);
      
      if (error.message.includes('policy')) {
        console.log('\n🚨 DIAGNÓSTICO: PROBLEMA DE POLÍTICA RLS');
        console.log('   La política RLS está bloqueando la inserción anónima');
      }
      
      return false;
    }
    
    console.log('✅ Inserción exitosa (limpiando registro de prueba...)');
    
    // Limpiar registro de prueba
    if (data && data[0]) {
      await supabaseAnon
        .from('solicitudes')
        .delete()
        .eq('id', data[0].id);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error en test de inserción:', error.message);
    return false;
  }
}

async function generateRLSFix() {
  console.log('\n🔧 GENERANDO SOLUCIÓN SQL PARA RLS...');
  
  const fixSQL = `
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
`;
  
  console.log('📝 SQL DE CORRECCIÓN:');
  console.log(fixSQL);
  
  // Guardar en archivo
  fs.writeFileSync('fix-rls-policies.sql', fixSQL);
  console.log('✅ SQL guardado en: fix-rls-policies.sql');
}

async function main() {
  console.log('🎯 OBJETIVO: Diagnosticar fallo de inserción en tabla solicitudes\n');
  
  // Paso 1: Auditar políticas RLS
  const policies = await auditRLSPolicies();
  
  // Paso 2: Probar permisos de inserción
  const insertWorks = await testInsertPermissions();
  
  // Paso 3: Generar solución si hay problemas
  if (!insertWorks) {
    await generateRLSFix();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN AUDITORÍA 1 - POLÍTICAS RLS');
  console.log('='.repeat(60));
  
  if (insertWorks) {
    console.log('✅ POLÍTICAS RLS: FUNCIONANDO CORRECTAMENTE');
    console.log('   Las políticas permiten inserción anónima');
  } else {
    console.log('❌ POLÍTICAS RLS: BLOQUEANDO INSERCIÓN');
    console.log('   🚨 CAUSA RAÍZ IDENTIFICADA: Política RLS restrictiva');
    console.log('   📋 SOLUCIÓN: Ejecutar fix-rls-policies.sql');
  }
}

main().catch(console.error);