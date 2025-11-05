// Polling de estado de despliegue de Vercel vía webhook URL
const https = require('https')
const http = require('http')
const fs = require('fs')

const url = process.env.DEPLOY_WEBHOOK_URL
if (!url) {
  console.error('DEPLOY_WEBHOOK_URL no está definido.')
  process.exit(1)
}

// Cargar jobId si existe artefacto
let jobId = process.env.JOB_ID || null
try {
  if (fs.existsSync('deploy_job.json')) {
    const artifact = JSON.parse(fs.readFileSync('deploy_job.json', 'utf8'))
    jobId = artifact.jobId || jobId
  }
} catch {}

const client = url.startsWith('https') ? https : http
const maxMinutes = parseInt(process.env.MAX_MINUTES || '10', 10)
const intervalSeconds = parseInt(process.env.INTERVAL_SECONDS || '10', 10)
const maxAttempts = Math.ceil((maxMinutes * 60) / intervalSeconds)

console.log('Comprobando estado de despliegue en Vercel...')
console.log('Webhook URL:', url)
if (jobId) console.log('Job ID:', jobId)
console.log(`Tiempo máximo: ${maxMinutes} min, intervalo: ${intervalSeconds}s`)

function getStatusOnce() {
  return new Promise((resolve, reject) => {
    const req = client.request(url, { method: 'GET' }, (res) => {
      let body = ''
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => {
        try {
          const json = JSON.parse(body || '{}')
          const state = json?.job?.state || json?.state
          const id = json?.job?.id || json?.id
          resolve({ state, id, raw: json, statusCode: res.statusCode })
        } catch (e) {
          reject(new Error('Respuesta no es JSON: ' + e.message))
        }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

;(async () => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { state, id, statusCode } = await getStatusOnce()
      console.log(`[${attempt}/${maxAttempts}] Estado: ${state} (HTTP ${statusCode})`)
      if (!jobId && id) jobId = id
      if (state === 'READY' || state === 'COMPLETED' || state === 'SUCCEEDED') {
        console.log('Despliegue listo (estado OK).')
        process.exit(0)
      }
      if (state === 'FAILED' || state === 'ERROR' || state === 'CANCELLED') {
        console.error('Despliegue falló (estado NOK).')
        process.exit(1)
      }
    } catch (err) {
      console.warn('Error consultando estado:', err.message)
    }
    await new Promise((r) => setTimeout(r, intervalSeconds * 1000))
  }
  console.error('Tiempo de espera agotado sin estado READY.')
  process.exit(1)
})()