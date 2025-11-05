#!/usr/bin/env node

// Verifica failover automático entre Gemini y DeepSeek usando el backend unificado
// Requiere que el servidor esté corriendo y las claves backend configuradas.

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log('🔍 Verificando estado de LLMs...');
  const status = await get('/api/llm-status');
  console.log('Estado:', JSON.stringify(status.data, null, 2));

  console.log('\n🧪 Simulando fallo en GEMINI → esperar failover a DeepSeek');
  const simGeminiFail = await post('/api/llm-chat', {
    prompt: 'Di "ok"',
    providerPreference: 'gemini',
    simulateFailOn: 'gemini',
  });
  console.log('Resultado:', simGeminiFail.status, simGeminiFail.data);

  console.log('\n🧪 Simulando fallo en DEEPSEEK → esperar failover a Gemini');
  const simDeepFail = await post('/api/llm-chat', {
    prompt: 'Di "ok"',
    providerPreference: 'deepseek',
    simulateFailOn: 'deepseek',
  });
  console.log('Resultado:', simDeepFail.status, simDeepFail.data);

  if (simGeminiFail.data.failover && simGeminiFail.data.providerUsed === 'deepseek' &&
      simDeepFail.data.failover && simDeepFail.data.providerUsed === 'gemini') {
    console.log('\n✅ Pruebas de failover exitosas');
    process.exit(0);
  } else {
    console.error('\n❌ Falló la verificación de failover');
    process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });