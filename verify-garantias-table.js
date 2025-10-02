// Script para verificar tabla garantias
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Leer variables de entorno
const envContent = readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function verificarTablaGarantias() {
  console.log('🔍 Verificando tabla garantias...');
  
  try {
    // Intentar consultar la tabla
    const { data, error } = await supabase
      .from('garantias')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Tabla garantias NO existe');
        console.log('📋 Ejecutar: create-garantias-table.sql en Supabase');
        return false;
      } else {
        console.log('❌ Error:', error.message);
        return false;
      }
    }
    
    console.log('✅ Tabla garantias existe y es accesible');
    return true;
  } catch (err) {
    console.log('❌ Error de conexión:', err.message);
    return false;
  }
}

verificarTablaGarantias().then(success => {
  if (success) {
    console.log('✅ PARTE 1 COMPLETADA: Tabla garantias verificada');
    process.exit(0);
  } else {
    console.log('❌ PARTE 1 FALLIDA: Tabla garantias no disponible');
    process.exit(1);
  }
});