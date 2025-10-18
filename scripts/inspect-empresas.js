// Inspecciona columnas presentes en la tabla empresas vía anon key
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

function readEnv() {
  try {
    const txt = fs.readFileSync('.env', 'utf8')
    const out = {}
    txt.split('\n').forEach((line) => {
      const idx = line.indexOf('=')
      if (idx > 0) {
        const k = line.slice(0, idx).trim()
        const v = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
        out[k] = v
      }
    })
    return out
  } catch {
    return {}
  }
}

const env = readEnv()
const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

;(async () => {
  const { data, error } = await supabase.from('empresas').select('*').limit(1)
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    console.log('ℹ️ Tabla empresas vacía o sin acceso a datos. No se pueden inferir columnas desde filas.')
    process.exit(0)
  }
  const cols = Object.keys(data[0])
  console.log('📊 Columnas detectadas en empresas:', cols.join(', '))
  process.exit(0)
})().catch((e) => {
  console.error('💥 Error:', e.message)
  process.exit(1)
})