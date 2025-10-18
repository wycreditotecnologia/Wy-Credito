import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

// https://vitejs.dev/config/
// Pequeño middleware de desarrollo para manejar /api/orchestrator
// Permite probar el flujo end-to-end en local sin Vercel Functions
const devOrchestratorApi = {
  name: 'dev-orchestrator-api',
  configureServer(server) {
    const isDev = process.env.NODE_ENV !== 'production'
    if (!isDev) return

    // Encabezado global de atribución
    server.middlewares.use((req, res, next) => {
      try {
        res.setHeader('X-Powered-By', 'Krezco.Digital')
      } catch {}
      next()
    })

    server.middlewares.use('/api/orchestrator', async (req, res) => {
      try {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }))
          return
        }

        const chunks = []
        req.on('data', (c) => chunks.push(c))
        req.on('end', async () => {
          const raw = Buffer.concat(chunks).toString('utf-8')
          let body = {}
          try {
            body = JSON.parse(raw || '{}')
          } catch (e) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: 'Invalid JSON body' }))
            return
          }

          const { action, sessionId, payload } = body || {}
          const stepData = (payload && (payload.normalized || payload.stepData)) || body.data || {}

          // Cargar variables desde process.env con fallback a archivos .env
          const readEnvFile = (file) => {
            try {
              const p = path.resolve(process.cwd(), file)
              if (!fs.existsSync(p)) return {}
              const txt = fs.readFileSync(p, 'utf8')
              return txt.split('\n').reduce((acc, line) => {
                const trimmed = line.trim()
                if (!trimmed || trimmed.startsWith('#')) return acc
                const idx = trimmed.indexOf('=')
                if (idx > 0) {
                  const k = trimmed.slice(0, idx).trim()
                  const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
                  acc[k] = v
                }
                return acc
              }, {})
            } catch {
              return {}
            }
          }

          const fileEnv = { ...readEnvFile('.env.local'), ...readEnvFile('.env') }
          const env = { ...fileEnv, ...process.env }

          const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL
          // En local preferimos usar la anon key para respetar RLS y evitar claves inválidas
          const serviceKey =
            env.SUPABASE_SERVICE_ROLE_KEY ||
            env.SUPABASE_SERVICE_KEY ||
            env.SUPABASE_SECRET ||
            env.VITE_SUPABASE_ANON_KEY ||
            env.VITE_SUPABASE_SERVICE_ROLE_KEY

          if (!url || !serviceKey) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({ ok: false, error: 'Supabase URL/Key no configuradas en entorno local' })
            )
            return
          }

          const supabase = createClient(url, serviceKey)
          const respond = (obj) => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(obj))
          }

          if (action === 'start') {
            const newId = randomUUID()
            const email = String(req.headers['x-user-email'] || 'dev@wycredito.local')
            const baseSolicitud = {
              id: newId,
              email_solicitante: email,
              // Usar un estado permitido por posibles CHECK constraints del entorno
              estado: 'pendiente',
              // Valores seguros por defecto para esquemas con NOT NULL
              monto_solicitado: 100000,
              // Cubrir variantes de esquema: algunas BD usan plazo_solicitado y otras plazo_seleccionado
              plazo_solicitado: 12,
              plazo_seleccionado: 12,
            }
            const { error } = await supabase
              .from('solicitudes')
              .insert(baseSolicitud)
            if (error) {
              res.statusCode = 500
              res.end(JSON.stringify({ ok: false, error: error.message }))
              return
            }
            respond({ ok: true, sessionId: newId })
            return
          }

          if (action === 'submit_form_step') {
            if (!sessionId) {
              res.statusCode = 400
              res.end(JSON.stringify({ ok: false, error: 'Falta sessionId' }))
              return
            }
            const allowed = new Set([
              'nit',
              'razon_social',
              'tipo_empresa',
              'sitio_web',
              'telefono_empresa',
              'direccion_empresa',
              'ciudad',
              'departamento',
              'nombre_representante',
              'apellido_representante',
              'tipo_documento_rl',
              'numero_documento_rl',
              'telefono_rl',
              'email_rl',
              'monto_solicitado',
              'plazo_solicitado',
              'destino_credito',
              'ingresos_mensuales',
              'egresos_mensuales',
              'patrimonio',
              'tipo_garantia',
              'descripcion_garantia',
              'valor_garantia',
              'consentimiento_datos',
              'declaracion_veracidad',
              'declaracion_origen_fondos',
              'referencias',
            ])
            const updates = {}
            if (stepData && typeof stepData === 'object') {
              for (const [k, v] of Object.entries(stepData)) {
                if (allowed.has(k)) updates[k] = v
              }
            }
            if (Object.keys(updates).length === 0) {
              respond({ ok: true, message: 'Sin cambios aplicables', nextStep: payload?.nextStep ?? null })
              return
            }
            const { error } = await supabase.from('solicitudes').update(updates).eq('id', sessionId)
            if (error) {
              res.statusCode = 500
              res.end(JSON.stringify({ ok: false, error: error.message }))
              return
            }
            respond({ ok: true, nextStep: payload?.nextStep ?? null })
            return
          }

          if (action === 'complete_submission') {
            if (!sessionId) {
              res.statusCode = 400
              res.end(JSON.stringify({ ok: false, error: 'Falta sessionId' }))
              return
            }
            const { error } = await supabase
              .from('solicitudes')
              .update({ estado: 'pendiente' })
              .eq('id', sessionId)
            if (error) {
              res.statusCode = 500
              res.end(JSON.stringify({ ok: false, error: error.message }))
              return
            }
            respond({ ok: true, status: 'pendiente' })
            return
          }

          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false, error: `Unknown action: ${action}` }))
        })
      } catch (e) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: false, error: e.message }))
      }
    })
  },
}

export default defineConfig({
  plugins: [react(), devOrchestratorApi],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: false
    }
  }
})