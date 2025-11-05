// Vercel Serverless Function: Unified LLM Chat with Failover (Gemini + DeepSeek)
// - Keeps API keys on backend
// - Automatically fails over when primary provider errors
// - Returns unified shape: { ok, text, providerUsed, usage, failover }

import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const deepseekEndpoint = 'https://api.deepseek.com/v1/chat/completions';

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

async function callGemini(prompt, context = {}, env) {
  if (!env.GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return {
    ok: true,
    text: text?.trim() || '',
    providerUsed: 'gemini',
    usage: { model: env.GEMINI_MODEL },
  };
}

async function callDeepSeek(prompt, context = {}, env) {
  if (!env.DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured');
  }
  const res = await axios.post(
    deepseekEndpoint,
    {
      model: env.DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: 'You are Wally, an enterprise credit assistant. Be concise and helpful.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    },
    {
      headers: {
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );
  const text = res?.data?.choices?.[0]?.message?.content || '';
  return {
    ok: true,
    text: (text || '').trim(),
    providerUsed: 'deepseek',
    usage: { model: env.DEEPSEEK_MODEL },
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const env = getEnv();
  const { prompt, context = {}, providerPreference, simulateFailOn } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ ok: false, error: 'Invalid prompt' });
  }

  const primary = (providerPreference || env.LLM_PRIMARY_PROVIDER || 'gemini').toLowerCase();
  const alternate = primary === 'gemini' ? 'deepseek' : 'gemini';

  const callByName = async (name) => {
    if (name === 'gemini') return callGemini(prompt, context, env);
    if (name === 'deepseek') return callDeepSeek(prompt, context, env);
    throw new Error(`Unknown provider: ${name}`);
  };

  try {
    if (simulateFailOn && simulateFailOn.toLowerCase() === primary) {
      throw new Error(`Simulated failure on ${primary}`);
    }
    const primaryRes = await callByName(primary);
    // Log selección de proveedor
    logEvent({ accion: 'llm_provider_selection', estado_anterior: null, estado_nuevo: primary, datos_validados: { providerUsed: primaryRes.providerUsed }, errores: null });
    return res.status(200).json({ ...primaryRes, failover: false });
  } catch (errPrimary) {
    const canFailover = env.LLM_FAILOVER_ENABLED;
    console.error('Primary LLM error:', {
      provider: primary,
      message: errPrimary?.message,
    });

    if (!canFailover) {
      return res.status(500).json({ ok: false, error: `Primary provider failed: ${primary}` });
    }

    try {
      if (simulateFailOn && simulateFailOn.toLowerCase() === alternate) {
        throw new Error(`Simulated failure on ${alternate}`);
      }
      const altRes = await callByName(alternate);
      console.warn('LLM failover executed', { from: primary, to: alternate });
      // Log evento de failover
      logEvent({ accion: 'llm_failover', estado_anterior: primary, estado_nuevo: alternate, datos_validados: { providerUsed: altRes.providerUsed, failover: true }, errores: { primaryError: errPrimary?.message } });
      return res.status(200).json({ ...altRes, failover: true, failoverFrom: primary, failoverTo: alternate });
    } catch (errAlt) {
      console.error('Alternate LLM also failed:', {
        provider: alternate,
        message: errAlt?.message,
      });
      logEvent({ accion: 'llm_failover_failed', estado_anterior: primary, estado_nuevo: null, datos_validados: { attempted: alternate }, errores: { primaryError: errPrimary?.message, alternateError: errAlt?.message } });
      return res.status(502).json({ ok: false, error: 'Both LLM providers failed' });
    }
  }
}