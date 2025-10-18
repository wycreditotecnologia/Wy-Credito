// Inserta datos de empresa usando anon key para una solicitud existente
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const sid = process.argv[2]
if (!sid) {
  console.error('Uso: node scripts/insert-empresa-anon.js <solicitud_id>')
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
  console.error('❌ Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

;(async () => {
  const empresaData = {
    solicitud_id: sid,
    nit: '901685988-0',
    razon_social: 'Empresa de Prueba S.A.S.',
    tipo_empresa: 'SAS',
    // Campo requerido en la BD actual
    tipo_denominacion: 'SAS',
    lugar_constitucion: 'Bogotá D.C.',
    es_startup: false,
    sitio_web: 'https://www.ejemplo.com'
  }
  const { error } = await supabase.from('empresas').insert(empresaData)
  if (error) throw new Error(error.message)
  console.log('✅ Empresa insertada con tipo_empresa=SAS para solicitud', sid)
  process.exit(0)
})().catch((e) => {
  console.error('💥 Error:', e.message)
  process.exit(1)
})