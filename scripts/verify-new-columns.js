// =====================================================
// SCRIPT: Verificación de columnas y tablas nuevas
// Tablas: empresas, garantias, referencias_comerciales
// Wy Crédito Tecnología - Wally v1.0
// =====================================================

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Utilidades de log
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

// Leer variables de entorno desde .env
function readEnv() {
  const envPath = path.join(process.cwd(), '.env');
  const envVars = {};
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        envVars[key] = value;
      }
    });
  } catch (err) {
    log(`❌ No se pudo leer .env: ${err.message}`, 'red');
  }
  return envVars;
}

const env = readEnv();
let supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
let supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Fallback: intentar leer credenciales desde verify-final-structure.js si .env no existe
if (!supabaseUrl || !supabaseAnonKey) {
  try {
    const vfsPath = path.join(process.cwd(), 'verify-final-structure.js');
    const vfsContent = fs.readFileSync(vfsPath, 'utf8');
    const urlMatch = vfsContent.match(/const\s+supabaseUrl\s*=\s*['\"]([^'\"]+)['\"]/);
    const keyMatch = vfsContent.match(/const\s+supabaseAnonKey\s*=\s*['\"]([^'\"]+)['\"]/);
    if (urlMatch && keyMatch) {
      supabaseUrl = supabaseUrl || urlMatch[1];
      supabaseAnonKey = supabaseAnonKey || keyMatch[1];
      log('⚠️  Usando credenciales de fallback desde verify-final-structure.js', 'yellow');
    }
  } catch (err) {
    // Ignorar si no existe
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  log('❌ Variables de entorno de Supabase no configuradas (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) y no se encontró fallback', 'red');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verificar existencia de tabla (select mínimo)
async function verifyTable(table) {
  try {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      log(`❌ Tabla '${table}': ${error.message}`, 'red');
      return false;
    }
    log(`✅ Tabla '${table}': accesible`, 'green');
    return true;
  } catch (err) {
    log(`❌ Tabla '${table}': error de conexión - ${err.message}`, 'red');
    return false;
  }
}

// Verificar existencia de columna mediante select dirigido
async function verifyColumn(table, column) {
  try {
    const { data, error } = await supabase.from(table).select(column).limit(1);
    if (error) {
      // PostgREST devuelve error si la columna no existe
      log(`   ❌ Columna '${column}': ${error.message}`, 'red');
      return false;
    }
    log(`   ✅ Columna '${column}': OK`, 'green');
    return true;
  } catch (err) {
    log(`   ❌ Columna '${column}': error de conexión - ${err.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n🔍 Verificación de columnas nuevas y tablas relacionadas', 'cyan');
  log('='.repeat(60));

  const checks = [
    {
      table: 'empresas',
      columns: [
        // Base
        'id', 'solicitud_id', 'created_at', 'updated_at',
        'nit', 'razon_social', 'tipo_empresa', 'sitio_web', 'telefono_empresa', 'direccion_empresa', 'ciudad', 'departamento',
        // Nuevas
        'redes_sociales', 'proposito_recursos', 'adquisicion_activos_fijos', 'detalle_activos_fijos',
      ],
    },
    {
      table: 'garantias',
      columns: ['id', 'empresa_id', 'descripcion', 'valor_estimado', 'url_foto', 'created_at'],
    },
    {
      table: 'referencias_comerciales',
      columns: ['id', 'empresa_id', 'nombre', 'contacto', 'created_at'],
    },
  ];

  let missing = 0;
  for (const check of checks) {
    log(`\n📋 Tabla: ${check.table}`, 'cyan');
    const exists = await verifyTable(check.table);
    if (!exists) {
      missing++;
      continue;
    }
    for (const col of check.columns) {
      const ok = await verifyColumn(check.table, col);
      if (!ok) missing++;
    }
  }

  // Verificación ligera de documentos.tipo_documento (lectura/control)
  log('\n📁 Comprobación ligera: documentos.tipo_documento', 'cyan');
  try {
    const { data, error } = await supabase.from('documentos').select('tipo_documento').limit(1);
    if (error) {
      log(`❌ documentos.tipo_documento: ${error.message}`, 'red');
      missing++;
    } else {
      log('✅ documentos.tipo_documento: accesible', 'green');
    }
  } catch (err) {
    log(`❌ documentos.tipo_documento: ${err.message}`, 'red');
    missing++;
  }

  log('\n' + '='.repeat(60));
  if (missing === 0) {
    log('🎉 Verificación completa: todas las tablas/columnas están accesibles', 'green');
    process.exit(0);
  } else {
    log(`⚠️  Verificación con hallazgos: faltan ${missing} elementos. Revisa el log arriba.`, 'yellow');
    process.exit(2);
  }
}

main().catch(err => {
  log(`💥 Error fatal: ${err.message}`, 'red');
  process.exit(1);
});