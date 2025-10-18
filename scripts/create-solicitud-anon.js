// Crea una solicitud mínima usando la anon key y devuelve el id
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
  const email = process.argv[2] || `test.${Date.now()}@example.com`
  const { data, error } = await supabase
    .from('solicitudes')
    .insert({ 
      email_solicitante: email,
      monto_solicitado: 100000,
      plazo_seleccionado: 12
    })
    .select('id, email_solicitante, estado')
    .single()
  if (error) throw new Error(error.message)
  console.log('✅ Solicitud creada')
  console.log('id:', data.id)
  console.log('email_solicitante:', data.email_solicitante)
  console.log('estado:', data.estado)
  // Algunos esquemas no incluyen codigo_seguimiento
})().catch((e) => {
  console.error('💥 Error:', e.message)
  process.exit(1)
})