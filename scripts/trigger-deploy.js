// Dispara el webhook de redeploy si está configurado
const https = require('https')
const http = require('http')
const fs = require('fs')

const url = process.env.DEPLOY_WEBHOOK_URL

if (!url) {
  console.log('DEPLOY_WEBHOOK_URL no está definido. Saltando trigger de despliegue.')
  process.exit(0)
}

const client = url.startsWith('https') ? https : http

console.log('Invocando webhook de despliegue automático...')
const req = client.request(url, { method: 'POST' }, (res) => {
  let data = ''
  res.on('data', (chunk) => (data += chunk))
  res.on('end', () => {
    console.log('Webhook respondió con estado:', res.statusCode)
    console.log('Respuesta:', data || '<sin cuerpo>')
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Intentar extraer jobId
      try {
        const json = JSON.parse(data)
        const jobId = json?.job?.id
        if (jobId) {
          console.log('Job ID:', jobId)
          // Guardar artefacto para el job de verificación
          const artifact = { jobId, url }
          fs.writeFileSync('deploy_job.json', JSON.stringify(artifact, null, 2))
          // Si es un step de GitHub Actions, publicar output
          if (process.env.GITHUB_OUTPUT) {
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `job_id=${jobId}\n`)
          }
        }
      } catch (e) {
        console.warn('No se pudo parsear respuesta JSON:', e.message)
      }
      console.log('Despliegue automático disparado correctamente.')
      process.exit(0)
    } else {
      console.error('Fallo al disparar el webhook.')
      process.exit(1)
    }
  })
})

req.on('error', (err) => {
  console.error('Error al invocar el webhook:', err.message)
  process.exit(1)
})

req.end()