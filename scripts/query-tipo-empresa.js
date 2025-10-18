// Consulta valores de tipo_empresa para una solicitud dada
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const sid = process.argv[2]
if (!sid) {
  console.error('Uso: node scripts/query-tipo-empresa.js <sessionId>')
  process.exit(1)
}

const env = (() => {
  try {
    const txt = readFileSync('.env', 'utf8')
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
})()

const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

;(async () => {
  const { data, error } = await supabase
    .from('empresas')
    .select('nit, razon_social, tipo_empresa, sitio_web')
    .eq('solicitud_id', sid)
    .single()
  if (error) throw new Error(error.message)
  console.log('\n🔎 Solicitud', sid, '=>', data)
  console.log(data?.tipo_empresa ? '✅ tipo_empresa está persistido' : '❌ tipo_empresa vacío')
})().catch((e) => {
  console.error('💥 Error:', e.message)
  process.exit(1)
})