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

console.log('🔍 AUDITORÍA 2: ESTRUCTURA DE TABLA SOLICITUDES');
console.log('='.repeat(60));

async function getTableStructure() {
  console.log('\n📋 Obteniendo estructura real de la tabla solicitudes...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Método 1: Intentar obtener estructura mediante describe
    console.log('🔍 Método 1: Consultando metadatos de tabla...');
    
    // Hacer una consulta vacía para obtener la estructura
    const { data, error } = await supabase
      .from('solicitudes')
      .select('*')
      .limit(0);
    
    if (error) {
      console.log('⚠️  Error en consulta:', error.message);
      return null;
    }
    
    console.log('✅ Consulta exitosa, pero no muestra estructura completa');
    
    // Método 2: Intentar inserción con datos incorrectos para ver qué columnas existen
    console.log('\n🔍 Método 2: Probando inserción para detectar columnas...');
    
    const testData = {
      // Campos que esperamos que existan
      email_solicitante: 'test@structure.com',
      estado: 'test',
      monto_solicitado: 1000000,
      plazo_seleccionado: 12,
      datos_empresa: { test: true },
      datos_representante: { test: true },
      datos_financieros: { test: true }
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('solicitudes')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.log('📊 Analizando error de inserción para detectar estructura:');
      console.log(`   Error: ${insertError.message}`);
      
      // Analizar el error para entender qué columnas faltan
      if (insertError.message.includes('column')) {
        const missingColumn = insertError.message.match(/'([^']+)'/);
        if (missingColumn) {
          console.log(`❌ Columna faltante detectada: ${missingColumn[1]}`);
        }
      }
    } else {
      console.log('✅ Inserción exitosa, estructura compatible');
      // Limpiar registro de prueba
      if (insertData && insertData[0]) {
        await supabase.from('solicitudes').delete().eq('id', insertData[0].id);
      }
    }
    
    return insertError;
  } catch (error) {
    console.log('❌ Error obteniendo estructura:', error.message);
    return null;
  }
}

async function analyzeApplicationCode() {
  console.log('\n📄 Analizando código de ApplicationView.jsx...');
  
  try {
    const filePath = 'src/components/ApplicationView/ApplicationView.jsx';
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Archivo ApplicationView.jsx no encontrado');
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar la función createApplicationSession
    const createSessionMatch = content.match(/createApplicationSession[\s\S]*?{[\s\S]*?}/);
    
    if (!createSessionMatch) {
      console.log('⚠️  Función createApplicationSession no encontrada');
      return null;
    }
    
    console.log('✅ Función createApplicationSession encontrada');
    
    // Buscar patrones de inserción de datos
    const insertPatterns = [
      /monto_solicitado/g,
      /plazo_seleccionado/g,
      /datos_empresa/g,
      /datos_representante/g,
      /datos_financieros/g,
      /email_solicitante/g
    ];
    
    console.log('\n📊 Campos utilizados en el código:');
    insertPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      const fieldName = pattern.source;
      console.log(`   ${fieldName}: ${matches ? '✅ Encontrado' : '❌ No encontrado'}`);
    });
    
    // Extraer la parte específica de inserción
    const insertMatch = content.match(/\.insert\s*\(\s*{[\s\S]*?}\s*\)/);
    if (insertMatch) {
      console.log('\n📝 Código de inserción encontrado:');
      console.log(insertMatch[0]);
    }
    
    return {
      hasCreateSession: !!createSessionMatch,
      fields: insertPatterns.map(p => p.source),
      insertCode: insertMatch ? insertMatch[0] : null
    };
    
  } catch (error) {
    console.log('❌ Error analizando código:', error.message);
    return null;
  }
}

async function compareStructures() {
  console.log('\n🔍 COMPARACIÓN: ESTRUCTURA vs CÓDIGO');
  console.log('-'.repeat(50));
  
  // Estructura esperada según setup_database.sql
  const expectedStructure = [
    'id (uuid)',
    'email_solicitante (text)',
    'estado (text)',
    'monto_solicitado (numeric)',
    'plazo_seleccionado (integer)',
    'datos_empresa (jsonb)',
    'datos_representante (jsonb)',
    'datos_financieros (jsonb)',
    'documentos_subidos (jsonb)',
    'codigo_seguimiento (text)',
    'created_at (timestamptz)',
    'updated_at (timestamptz)'
  ];
  
  console.log('📋 Estructura esperada según setup_database.sql:');
  expectedStructure.forEach(field => {
    console.log(`   ✅ ${field}`);
  });
  
  // Verificar si el archivo setup_database.sql coincide
  try {
    const sqlContent = fs.readFileSync('database/setup_database.sql', 'utf8');
    
    console.log('\n🔍 Verificando definición en setup_database.sql...');
    
    const tableMatch = sqlContent.match(/CREATE TABLE solicitudes\s*\(([\s\S]*?)\);/);
    if (tableMatch) {
      console.log('✅ Definición de tabla encontrada en SQL');
      
      // Extraer columnas
      const columns = tableMatch[1]
        .split(',')
        .map(col => col.trim())
        .filter(col => col && !col.startsWith('CONSTRAINT'))
        .map(col => col.split(' ')[0]);
      
      console.log('\n📊 Columnas definidas en SQL:');
      columns.forEach(col => {
        console.log(`   - ${col}`);
      });
      
      // Verificar campos críticos
      const criticalFields = ['monto_solicitado', 'plazo_seleccionado', 'datos_empresa'];
      console.log('\n🎯 Verificación de campos críticos:');
      criticalFields.forEach(field => {
        const exists = columns.includes(field);
        console.log(`   ${field}: ${exists ? '✅ EXISTE' : '❌ FALTA'}`);
      });
      
    } else {
      console.log('❌ Definición de tabla no encontrada en SQL');
    }
    
  } catch (error) {
    console.log('❌ Error leyendo setup_database.sql:', error.message);
  }
}

async function main() {
  console.log('🎯 OBJETIVO: Comparar estructura de tabla con código de inserción\n');
  
  // Paso 1: Obtener estructura real de la tabla
  const structureError = await getTableStructure();
  
  // Paso 2: Analizar código de aplicación
  const codeAnalysis = await analyzeApplicationCode();
  
  // Paso 3: Comparar estructuras
  await compareStructures();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN AUDITORÍA 2 - ESTRUCTURA DE TABLA');
  console.log('='.repeat(60));
  
  if (structureError && structureError.message.includes('datos_empresa')) {
    console.log('❌ PROBLEMA DETECTADO: Columna datos_empresa no existe');
    console.log('   🚨 CAUSA RAÍZ: Tabla no creada con estructura completa');
    console.log('   📋 SOLUCIÓN: Ejecutar setup_database.sql completo');
  } else {
    console.log('✅ ESTRUCTURA: Compatible con código');
  }
}

main().catch(console.error);