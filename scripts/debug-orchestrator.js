// Debug local orchestrator API on port 3003 and print error body
const API = 'http://localhost:3003/api/orchestrator'

async function postJson(body, headers = {}) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { json = { raw: text } }
  return { status: res.status, ok: res.ok, json }
}

;(async () => {
  const start = await postJson({ action: 'start' }, { 'x-user-email': 'dev@test.local' })
  console.log('start:', start.status, start.json)
  const sid = start.json.sessionId
  if (!sid) throw new Error('no sessionId')
  const payload = {
    currentStep: 2,
    stepData: {
      nit: '9016859886-0',
      razon_social: 'Mi Empresa S.A.S.',
      tipo_empresa: 'SAS',
      sitio_web: 'https://www.ejemplo.com',
      redes_sociales: {
        linkedin: 'https://www.linkedin.com/company/miempresa',
        instagram: 'https://www.instagram.com/miempresa',
        facebook: 'https://www.facebook.com/miempresa',
      },
    },
  }
  const submit = await postJson({ action: 'submit_form_step', sessionId: sid, payload })
  console.log('submit:', submit.status, submit.json)
  process.exit(0)
})().catch((e) => {
  console.error('error:', e)
  process.exit(1)
})