// Validación del flujo en vivo: uploads y persistencia de pasos 5 y 6
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Cargar .env
const env = readFileSync('.env', 'utf8');
const envVars = {};
env.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) envVars[k.trim()] = v.trim().replace(/['"]/g, '');
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function getLatestSolicitud() {
  // Usa created_at para identificar la última solicitud
  const { data, error } = await supabase
    .from('solicitudes')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0];
}

async function verifyPaso5(solicitudId) {
  const { data, error } = await supabase
    .from('solicitudes')
    .select('consentimiento_datos, declaracion_veracidad, declaracion_origen_fondos')
    .eq('id', solicitudId)
    .single();
  if (error) throw error;
  const ok = !!(data?.consentimiento_datos && data?.declaracion_veracidad && data?.declaracion_origen_fondos);
  console.log('\n🧩 Paso 5 (Aceptación):', data);
  console.log(ok ? '✅ Las tres declaraciones están guardadas como TRUE.' : '❌ Faltan declaraciones en TRUE.');
  return ok;
}

async function verifyPaso6(solicitudId) {
  // Encontrar empresa asociada
  const { data: empresa, error: empErr } = await supabase
    .from('empresas')
    .select('id')
    .eq('solicitud_id', solicitudId)
    .single();
  if (empErr) throw empErr;

  // Verificar garantía
  const { data: garantia, error: garErr } = await supabase
    .from('garantias')
    .select('descripcion, valor_estimado, url_foto')
    .eq('empresa_id', empresa.id)
    .single();
  if (garErr) throw garErr;
  const ok = !!(garantia?.descripcion && Number(garantia?.valor_estimado) > 0);
  console.log('\n🔒 Garantía registrada:', garantia);
  console.log(ok ? '✅ Garantía válida registrada.' : '❌ Garantía incompleta.');
  return ok;
}

async function verifyUploads(solicitudId) {
  const { data: docs, error } = await supabase
    .from('documentos')
    .select('tipo_documento, url_storage')
    .eq('solicitud_id', solicitudId);
  if (error) throw error;
  console.log('\n📄 Documentos vinculados a la solicitud:', docs?.length || 0);
  const hasPdf = docs?.some(d => ['declaracion_renta', 'estados_financieros', 'certificado_existencia', 'composicion_accionaria'].includes(d.tipo_documento));
  console.log(hasPdf ? '✅ Se detectan PDFs subidos.' : '❌ No se detectan PDFs vinculados.');
  return hasPdf;
}

async function main() {
  console.log('🚀 Validando el flujo en vivo...');
  const latest = await getLatestSolicitud();
  if (!latest) {
    console.log('❌ No hay solicitudes en la base de datos. Realiza la prueba en la UI primero.');
    process.exit(1);
  }
  console.log(`📌 Última solicitud: ${latest.id} (${new Date(latest.created_at).toLocaleString()})`);

  const paso5Ok = await verifyPaso5(latest.id);
  const paso6Ok = await verifyPaso6(latest.id);
  const uploadsOk = await verifyUploads(latest.id);

  console.log('\n📊 Resultado final:');
  console.log(` - Uploads OK: ${uploadsOk ? 'Sí' : 'No'}`);
  console.log(` - Paso 5 OK: ${paso5Ok ? 'Sí' : 'No'}`);
  console.log(` - Paso 6 OK: ${paso6Ok ? 'Sí' : 'No'}`);

  if (uploadsOk && paso5Ok && paso6Ok) {
    console.log('\n🎉 Validación completa: todo el flujo funciona correctamente.');
    process.exit(0);
  } else {
    console.log('\n⚠️ Validación incompleta: revisa los puntos marcados como No.');
    process.exit(2);
  }
}

main().catch(err => {
  console.error('💥 Error durante la validación:', err);
  process.exit(1);
});