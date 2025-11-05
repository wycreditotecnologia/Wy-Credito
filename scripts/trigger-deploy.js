// Dispara el webhook de redeploy si está configurado
const fs = require('fs')

const url = process.env.DEPLOY_WEBHOOK_URL

if (!url) {
  console.log('DEPLOY_WEBHOOK_URL no está definido. Saltando trigger de despliegue.')
  process.exit(0)
}

;(async () => {
  try {
    const fetch = (await import('node-fetch')).default
    console.log('Invocando webhook de despliegue automático...')
    const res = await fetch(url, { method: 'POST' })
    const bodyText = await res.text()
    console.log('Webhook respondió con estado:', res.status)
    console.log('Respuesta:', bodyText || '<sin cuerpo>')
    if (res.ok) {
      try {
        const json = JSON.parse(bodyText)
        const jobId = json?.job?.id
        if (jobId) {
          console.log('Job ID:', jobId)
          const artifact = { jobId, url }
          fs.writeFileSync('deploy_job.json', JSON.stringify(artifact, null, 2))
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
  } catch (err) {
    console.error('Error al invocar el webhook:', err.message)
    process.exit(1)
  }
})()