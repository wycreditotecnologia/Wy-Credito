// Verifica persistencia de tipo_empresa en la tabla solicitudes vía API dev
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

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
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Falta VITE_SUPABASE_URL o clave (SERVICE/ANON) en .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const API_BASE = process.env.API_BASE || 'http://127.0.0.1:3000'

async function startSession() {
  const res = await fetch(`${API_BASE}/api/orchestrator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-email': 'dev@test.local' },
    body: JSON.stringify({ action: 'start' }),
  })
  const json = await res.json()
  if (!res.ok || !json.sessionId) throw new Error(json.error || 'No se pudo crear sesión')
  return json.sessionId
}

async function submitEmpresa(sessionId) {
  const stepData = {
    nit: '901685988-0',
    razon_social: 'Empresa de Prueba S.A.S.',
    tipo_empresa: 'SAS',
    sitio_web: 'https://www.ejemplo.com',
  }
  const res = await fetch(`${API_BASE}/api/orchestrator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'submit_form_step', sessionId, payload: { currentStep: 1, stepData } }),
  })
  const json = await res.json()
  if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo guardar paso empresa')
}

async function verify(sessionId) {
  const { data, error } = await supabase
    .from('solicitudes')
    .select('nit, razon_social, tipo_empresa, sitio_web')
    .eq('id', sessionId)
    .single()
  if (error) throw new Error(error.message)
  console.log('\n🔎 Datos guardados en solicitudes:', data)
  if (data?.tipo_empresa) {
    console.log('✅ tipo_empresa persistido:', data.tipo_empresa)
  } else {
    console.log('❌ tipo_empresa no se guardó')
    process.exit(2)
  }
}

;(async () => {
  console.log('🚀 Iniciando verificación de tipo_empresa...')
  const sid = await startSession()
  console.log('📌 sessionId:', sid)
  await submitEmpresa(sid)
  await verify(sid)
  console.log('\n🎉 Verificación completada')
  process.exit(0)
})().catch((e) => {
  console.error('💥 Error:', e.message)
  process.exit(1)
})