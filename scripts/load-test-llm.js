#!/usr/bin/env node

// Prueba de carga simple para el backend unificado de LLM
// Envía N solicitudes intercalando proveedor preferido y mide tiempos/errores.

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const TOTAL = parseInt(process.env.TOTAL || '30', 10);

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
  console.log(`🚀 Iniciando prueba de carga: ${TOTAL} solicitudes`);
  const start = Date.now();
  let ok = 0, fail = 0;
  const latencies = [];

  for (let i = 0; i < TOTAL; i++) {
    const providerPreference = i % 2 === 0 ? 'gemini' : 'deepseek';
    const t0 = Date.now();
    try {
      const r = await post('/api/llm-chat', { prompt: `Ping ${i}`, providerPreference });
      const t1 = Date.now();
      latencies.push(t1 - t0);
      if (r.ok) ok++; else fail++;
      process.stdout.write('.');
    } catch (e) {
      fail++;
      process.stdout.write('x');
    }
  }
  const end = Date.now();

  const avg = latencies.reduce((a,b)=>a+b,0) / (latencies.length || 1);
  const p95 = latencies.sort((a,b)=>a-b)[Math.floor(latencies.length*0.95)] || 0;

  console.log(`\n\n✅ OK: ${ok} | ❌ Fails: ${fail}`);
  console.log(`⏱️  Duración total: ${(end-start)} ms`);
  console.log(`⏲️  Latencia promedio: ${avg.toFixed(1)} ms | p95: ${p95} ms`);

  if (fail === 0) process.exit(0);
  process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });