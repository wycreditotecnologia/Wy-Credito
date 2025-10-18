// Inserta una solicitud y su empresa asociada con tipo_empresa para validación
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
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
const SUPABASE_KEY = env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Falta VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

;(async () => {
  const sessionId = randomUUID()
  console.log('🧪 Creando solicitud y empresa de prueba...')
  const { error: errSol } = await supabase
    .from('solicitudes')
    .insert({ id: sessionId, email_solicitante: 'dev@test.local', estado: 'incompleta' })
  if (errSol) throw new Error('Error insertando solicitud: ' + errSol.message)

  const empresaData = {
    solicitud_id: sessionId,
    nit: '901685988-0',
    razon_social: 'Empresa de Prueba S.A.S.',
    tipo_empresa: 'SAS',
    sitio_web: 'https://www.ejemplo.com'
  }
  const { error: errEmp } = await supabase
    .from('empresas')
    .insert(empresaData)
  if (errEmp) throw new Error('Error insertando empresa: ' + errEmp.message)

  console.log('✅ Seed completado. sessionId:', sessionId)
  console.log('👉 Ejecuta: node scripts/query-tipo-empresa.js', sessionId)
  process.exit(0)
})().catch((e) => {
  console.error('💥 Error:', e.message)
  process.exit(1)
})