// Vercel Serverless Function: Document extraction via LLM
// Note: PDF inline extraction supported via Gemini; DeepSeek fallback is text-only prompt without file parsing.

import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getEnv() {
  return {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    LLM_PRIMARY_PROVIDER: process.env.LLM_PRIMARY_PROVIDER || 'gemini',
    LLM_FAILOVER_ENABLED: process.env.LLM_FAILOVER_ENABLED !== 'false',
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  };
}

async function logEvent(event) {
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY } = getEnv();
    if (!SUPABASE_URL) return;
    const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
    if (!key) return;
    await axios.post(`${SUPABASE_URL}/rest/v1/orquestador_logs`, event, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      timeout: 10000,
    });
  } catch (e) {
    // Silencioso para no romper flujo
  }
}

async function extractWithGemini({ prompt, mimeType, dataBase64 }, env) {
  if (!env.GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY');
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
  const generativePart = { inlineData: { mimeType, data: dataBase64 } };
  const result = await model.generateContent([prompt, generativePart]);
  const text = await result.response.text();
  return { ok: true, text: (text || '').trim(), providerUsed: 'gemini' };
}

async function extractWithDeepSeek({ prompt }, env) {
  // DeepSeek does not support PDF inline attachments in OpenAI-compatible API.
  // We attempt a prompt-only extraction warning the limitation.
  if (!env.DEEPSEEK_API_KEY) throw new Error('Missing DEEPSEEK_API_KEY');
  const res = await axios.post(
    'https://api.deepseek.com/v1/chat/completions',
    {
      model: env.DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: 'You parse structured information. If the document content is not accessible, explain limitation.' },
        { role: 'user', content: `${prompt}\n\nNota: El contenido del archivo no está disponible para DeepSeek en esta ruta. Responde solo si el prompt es suficiente.` },
      ],
    },
    { headers: { Authorization: `Bearer ${env.DEEPSEEK_API_KEY}` }, timeout: 30000 }
  );
  const text = res?.data?.choices?.[0]?.message?.content || '';
  return { ok: true, text: (text || '').trim(), providerUsed: 'deepseek' };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }
  const env = getEnv();
  const { prompt, mimeType = 'application/pdf', dataBase64, simulateFailOn } = req.body || {};
  if (!prompt || !dataBase64) {
    return res.status(400).json({ ok: false, error: 'Invalid payload: prompt and dataBase64 required' });
  }

  const primary = (env.LLM_PRIMARY_PROVIDER || 'gemini').toLowerCase();
  const alt = primary === 'gemini' ? 'deepseek' : 'gemini';

  const runBy = async (name) => {
    if (name === 'gemini') return extractWithGemini({ prompt, mimeType, dataBase64 }, env);
    if (name === 'deepseek') return extractWithDeepSeek({ prompt }, env);
    throw new Error(`Unknown provider: ${name}`);
  };

  try {
    if (simulateFailOn && simulateFailOn.toLowerCase() === primary) {
      throw new Error(`Simulated failure on ${primary}`);
    }
    const r = await runBy(primary);
    logEvent({ accion: 'llm_extract_provider_selection', estado_anterior: null, estado_nuevo: primary, datos_validados: { providerUsed: r.providerUsed }, errores: null });
    return res.status(200).json({ ...r, failover: false });
  } catch (e1) {
    if (!env.LLM_FAILOVER_ENABLED) {
      return res.status(500).json({ ok: false, error: `Primary provider failed: ${primary}` });
    }
    try {
      if (simulateFailOn && simulateFailOn.toLowerCase() === alt) {
        throw new Error(`Simulated failure on ${alt}`);
      }
      const r2 = await runBy(alt);
      logEvent({ accion: 'llm_extract_failover', estado_anterior: primary, estado_nuevo: alt, datos_validados: { providerUsed: r2.providerUsed, failover: true }, errores: { primaryError: e1?.message } });
      return res.status(200).json({ ...r2, failover: true, failoverFrom: primary, failoverTo: alt });
    } catch (e2) {
      logEvent({ accion: 'llm_extract_failover_failed', estado_anterior: primary, estado_nuevo: null, datos_validados: { attempted: alt }, errores: { primaryError: e1?.message, alternateError: e2?.message } });
      return res.status(502).json({ ok: false, error: 'Both extraction providers failed' });
    }
  }
}