// Vercel Serverless Function: Email OTP Verification
// Actions: send_code, verify_code, status

import crypto from 'crypto';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

function getEnv() {
  return {
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
    EMAIL_API_URL: process.env.EMAIL_API_URL || '/api/send-email',
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

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

async function ensureTable(supabase) {
  // Try a simple select; if fails with relation not found, we can't auto-create here
  try {
    await supabase.from('email_verifications').select('id').limit(1);
  } catch (e) {
    // Ignore; table creation should be handled via SQL script
  }
}

async function sendCode({ supabase, sessionId, email, nombre }) {
  if (!sessionId || !email) throw new Error('missing_params');
  const code = (Math.floor(100000 + Math.random() * 900000)).toString(); // 6 dígitos
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  await ensureTable(supabase);

  // Upsert verification row
  const { error: upError } = await supabase
    .from('email_verifications')
    .upsert({
      session_id: sessionId,
      email,
      code_hash: codeHash,
      expires_at: expiresAt,
      attempts: 0,
      verified_at: null,
      created_at: new Date().toISOString(),
    }, { onConflict: 'session_id' });
  if (upError) throw upError;

  // Send email via internal API
  const env = getEnv();
  try {
    await axios.post(env.EMAIL_API_URL, {
      to: email,
      subject: 'Código de verificación - Wy Crédito',
      type: 'otp',
      data: { nombre, codigo: code, expiracionMin: 10 },
    });
  } catch (e) {
    // Continue even if email fails, user can request reenvío
  }

  return { ok: true, expiresAt };
}

async function verifyCode({ supabase, sessionId, email, code }) {
  if (!sessionId || !email || !code) throw new Error('missing_params');
  const { data, error } = await supabase
    .from('email_verifications')
    .select('*')
    .eq('session_id', sessionId)
    .eq('email', email)
    .single();
  if (error) throw error;
  if (!data) return { ok: false, error: 'not_found' };

  const now = Date.now();
  const exp = new Date(data.expires_at).getTime();
  if (now > exp) return { ok: false, error: 'expired' };

  const providedHash = hashCode(String(code).trim());
  if (providedHash !== data.code_hash) {
    const { error: attErr } = await supabase
      .from('email_verifications')
      .update({ attempts: (data.attempts || 0) + 1 })
      .eq('id', data.id);
    if (attErr) {/* ignore */}
    return { ok: false, error: 'invalid_code' };
  }

  const { error: updErr } = await supabase
    .from('email_verifications')
    .update({ verified_at: new Date().toISOString() })
    .eq('id', data.id);
  if (updErr) throw updErr;

  // Optional: mark solicitud as email_verified
  try {
    await supabase
      .from('solicitudes')
      .update({ email_verified: true })
      .eq('id', sessionId);
  } catch (_) {}

  return { ok: true };
}

async function status({ supabase, sessionId, email }) {
  const { data, error } = await supabase
    .from('email_verifications')
    .select('verified_at, expires_at')
    .eq('session_id', sessionId)
    .eq('email', email)
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, verified: !!data?.verified_at, expiresAt: data?.expires_at || null };
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
  const { action, sessionId, email, nombre, code } = body || {};
  try {
    const supabase = getSupabase();
    if (action === 'send_code') {
      const result = await sendCode({ supabase, sessionId, email, nombre });
      return safeJson(res, 200, result);
    }
    if (action === 'verify_code') {
      const result = await verifyCode({ supabase, sessionId, email, code });
      return safeJson(res, 200, result);
    }
    if (action === 'status') {
      const result = await status({ supabase, sessionId, email });
      return safeJson(res, 200, result);
    }
    return safeJson(res, 400, { ok: false, error: 'unsupported_action' });
  } catch (e) {
    return safeJson(res, 500, { ok: false, error: e?.message?.slice(0, 200) || 'server_error' });
  }
}