// Script automatizado para crear tabla garantias
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

// Usar service role para operaciones administrativas
const supabase = createClient(
  envVars.VITE_SUPABASE_URL, 
  envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

async function crearTablaGarantias() {
  console.log('🚀 Ejecutando creación de tabla garantias...');
  
  try {
    // Leer el script SQL
    const sqlScript = readFileSync('create-garantias-table.sql', 'utf8');
    
    // Ejecutar cada comando SQL por separado
    const commands = sqlScript.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        console.log('📝 Ejecutando:', command.trim().substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: command.trim() });
        if (error) {
          console.log('⚠️  Error (puede ser normal):', error.message);
        }
      }
    }
    
    // Verificar que la tabla fue creada
    const { data, error } = await supabase
      .from('garantias')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Error verificando tabla:', error.message);
      return false;
    }
    
    console.log('✅ Tabla garantias creada exitosamente');
    return true;
    
  } catch (err) {
    console.log('❌ Error:', err.message);
    return false;
  }
}

crearTablaGarantias().then(success => {
  if (success) {
    console.log('✅ PARTE 1 COMPLETADA: Tabla garantias creada y verificada');
    process.exit(0);
  } else {
    console.log('❌ PARTE 1 FALLIDA: No se pudo crear la tabla');
    console.log('📋 ACCIÓN MANUAL REQUERIDA: Ejecutar create-garantias-table.sql en Supabase Dashboard');
    process.exit(1);
  }
});