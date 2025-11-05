// Vercel Serverless Function: Orchestrator (sessions, steps, summary)
// - Accepts actions from frontend forms and persists to Supabase
// - Returns consistent JSON to avoid invalid/malformed responses

import { createClient } from '@supabase/supabase-js';

function getEnv() {
  return {
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  };
}

function getSupabase() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY } = getEnv();
  if (!SUPABASE_URL) throw new Error('SUPABASE_URL missing');
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  if (!key) throw new Error('No Supabase key configured');
  return createClient(SUPABASE_URL, key);
}

function safeJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function startSession(supabase) {
  // Create a row in solicitudes and return its id
  const { data, error } = await supabase
    .from('solicitudes')
    .insert({ estado: 'iniciada', created_at: new Date().toISOString() })
    .select('id')
    .single();
  if (error) throw error;
  return { ok: true, sessionId: data.id };
}

async function submitFormStep(supabase, body) {
  const sessionId = body.sessionId;
  const payload = body.payload || body.stepData || body.data || {};
  if (!sessionId) throw new Error('sessionId missing');

  // Minimal persistence: update solicitudes with fields that exist; ignore unknowns
  const allowedSolicitudesFields = [
    'email_solicitante', 'nombre_solicitante', 'apellidos_solicitante',
    'monto_solicitado', 'plazo_solicitado', 'destino_credito',
    'aceptacion_productiva', 'aceptacion_no_personal', 'aceptacion_habeas_data',
  ];
  const solicitudesUpdate = {};
  for (const k of allowedSolicitudesFields) {
    if (k in payload) solicitudesUpdate[k] = payload[k];
  }

  if (Object.keys(solicitudesUpdate).length > 0) {
    const { error } = await supabase
      .from('solicitudes')
      .update({ ...solicitudesUpdate, fecha_actualizacion: new Date().toISOString() })
      .eq('id', sessionId);
    if (error) throw error;
  }

  // Empresa fields → empresas table
  const empresaFields = ['nit', 'razon_social', 'tipo_empresa', 'sitio_web', 'pagina_web'];
  const empresaUpdate = {};
  for (const k of empresaFields) {
    if (k in payload) empresaUpdate[k === 'pagina_web' ? 'sitio_web' : k] = payload[k];
  }
  if (Object.keys(empresaUpdate).length > 0) {
    // Find existing empresa by solicitud_id
    const { data: empresa, error: findError } = await supabase
      .from('empresas')
      .select('id')
      .eq('solicitud_id', sessionId)
      .single();
    if (findError && findError.code !== 'PGRST116') throw findError;
    if (empresa) {
      const { error } = await supabase
        .from('empresas')
        .update(empresaUpdate)
        .eq('id', empresa.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('empresas')
        .insert({ ...empresaUpdate, solicitud_id: sessionId });
      if (error) throw error;
    }
  }

  return { ok: true, nextStep: body.nextStep || null };
}

async function getSummaryData(supabase, sessionId) {
  if (!sessionId) throw new Error('sessionId missing');
  const { data: solicitud, error: sErr } = await supabase
    .from('solicitudes')
    .select('*')
    .eq('id', sessionId)
    .single();
  if (sErr) throw sErr;
  const { data: empresa, error: eErr } = await supabase
    .from('empresas')
    .select('*')
    .eq('solicitud_id', sessionId)
    .single();
  if (eErr && eErr.code !== 'PGRST116') throw eErr;
  const { data: documentos, error: dErr } = await supabase
    .from('documentos')
    .select('*')
    .eq('solicitud_id', sessionId);
  if (dErr) throw dErr;
  let garantia = null;
  if (empresa) {
    const { data: gData } = await supabase
      .from('garantias')
      .select('*')
      .eq('empresa_id', empresa.id)
      .single();
    garantia = gData || null;
  }
  return { ok: true, data: { solicitud, empresa, documentos: documentos || [], garantia } };
}

async function completeSubmission(supabase, sessionId) {
  if (!sessionId) throw new Error('sessionId missing');
  const trackingCode = `WY-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
  const { error } = await supabase
    .from('solicitudes')
    .update({ status: 'pendiente_revision', codigo_seguimiento: trackingCode, fecha_envio: new Date().toISOString() })
    .eq('id', sessionId);
  if (error) throw error;
  return { ok: true, trackingCode };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return safeJson(res, 405, { ok: false, error: 'method_not_allowed' });
  }
  let body = null;
  try {
    body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  } catch (e) {
    return safeJson(res, 400, { ok: false, error: 'invalid_json' });
  }
  const action = body?.action || '';
  const sessionId = body?.sessionId;

  try {
    const supabase = getSupabase();
    switch (action) {
      case 'start_session': {
        const result = await startSession(supabase);
        return safeJson(res, 200, result);
      }
      case 'submit_form_step': {
        const result = await submitFormStep(supabase, body);
        return safeJson(res, 200, result);
      }
      case 'get_summary_data': {
        const result = await getSummaryData(supabase, sessionId);
        return safeJson(res, 200, result);
      }
      case 'complete_submission': {
        const result = await completeSubmission(supabase, sessionId);
        return safeJson(res, 200, result);
      }
      default:
        return safeJson(res, 400, { ok: false, error: 'unsupported_action' });
    }
  } catch (e) {
    return safeJson(res, 500, { ok: false, error: e?.message?.slice(0, 200) || 'server_error' });
  }
}