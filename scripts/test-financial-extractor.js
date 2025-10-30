// Script de prueba del extractor financiero (FASE 1-3)
// Uso:
//   node scripts/test-financial-extractor.js "URL_DEL_PDF_EN_SUPABASE" "ID_DE_LA_SOLICITUD" [--endpoint=URL]
// Por defecto usa: http://localhost:3000/api/extract-financials

const DEFAULT_ENDPOINT = process.env.EXTRACT_ENDPOINT || 'http://localhost:3000/api/extract-financials';

function printUsage() {
  console.log('\nUso:');
  console.log('  node scripts/test-financial-extractor.js "URL_DEL_PDF_EN_SUPABASE" "ID_DE_LA_SOLICITUD" [--endpoint=URL]');
  console.log('\nEjemplo:');
  console.log('  node scripts/test-financial-extractor.js "https://YOUR_SUPABASE_BUCKET/public/estados.pdf" "a1b2c3d4-..."');
}

async function postJson(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, ok: res.ok, json };
}

(async () => {
  const [, , fileUrl, solicitudId, ...extra] = process.argv;
  const endpointArg = extra.find(arg => arg && arg.startsWith('--endpoint='));
  const endpoint = endpointArg ? endpointArg.split('=')[1] : DEFAULT_ENDPOINT;

  if (!fileUrl || !solicitudId) {
    console.error('❌ Faltan argumentos: fileUrl y solicitudId son obligatorios.');
    printUsage();
    process.exit(1);
  }

  console.log(`\n🚀 Ejecutando prueba contra: ${endpoint}`);
  console.log('📎 Parámetros:');
  console.log(`   - fileUrl: ${fileUrl}`);
  console.log(`   - solicitud_id: ${solicitudId}`);

  try {
    const result = await postJson(endpoint, { fileUrl, solicitud_id: solicitudId });
    if (result.ok) {
      console.log('\n✅ ÉXITO: Motor de IA ejecutado.');
      console.log(JSON.stringify(result.json, null, 2));
      process.exit(0);
    } else {
      console.error('\n❌ ERROR: El motor de IA falló.');
      console.error(JSON.stringify(result.json, null, 2));
      process.exit(2);
    }
  } catch (e) {
    console.error('\n💥 Error al invocar el endpoint:', e?.message || e);
    process.exit(1);
  }
})();