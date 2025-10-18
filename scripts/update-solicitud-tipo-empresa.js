// Actualiza tipo_empresa en la tabla solicitudes para una solicitud dada
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const sid = process.argv[2]
const tipo = process.argv[3] || 'SAS'
if (!sid) {
  console.error('Uso: node scripts/update-solicitud-tipo-empresa.js <solicitud_id> [tipo]')
  process.exit(1)
}

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
  const { error } = await supabase.from('solicitudes').update({ tipo_empresa: tipo }).eq('id', sid)
  if (error) throw new Error(error.message)
  console.log('✅ solicitudes.tipo_empresa actualizado a', tipo, 'para', sid)
  process.exit(0)
})().catch((e) => {
  console.error('💥 Error:', e.message)
  process.exit(1)
})