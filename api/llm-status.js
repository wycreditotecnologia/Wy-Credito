// Vercel Serverless Function: Report current health and routing decision
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getEnv() {
  return {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    LLM_PRIMARY_PROVIDER: process.env.LLM_PRIMARY_PROVIDER || 'gemini',
  };
}

async function checkGemini(env) {
  try {
    if (!env.GEMINI_API_KEY) return { healthy: false, reason: 'missing_key' };
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
    const result = await model.generateContent('ping');
    const text = await result.response.text();
    return { healthy: !!text, model: env.GEMINI_MODEL };
  } catch (e) {
    return { healthy: false, reason: e?.message?.slice(0, 120) };
  }
}

async function checkDeepSeek(env) {
  try {
    if (!env.DEEPSEEK_API_KEY) return { healthy: false, reason: 'missing_key' };
    const res = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      { model: env.DEEPSEEK_MODEL, messages: [{ role: 'user', content: 'ping' }] },
      { headers: { Authorization: `Bearer ${env.DEEPSEEK_API_KEY}` }, timeout: 15000 }
    );
    const text = res?.data?.choices?.[0]?.message?.content;
    return { healthy: !!text, model: env.DEEPSEEK_MODEL };
  } catch (e) {
    return { healthy: false, reason: e?.message?.slice(0, 120) };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }
  const env = getEnv();
  const primary = (env.LLM_PRIMARY_PROVIDER || 'gemini').toLowerCase();
  const alt = primary === 'gemini' ? 'deepseek' : 'gemini';

  const gemini = await checkGemini(env);
  const deepseek = await checkDeepSeek(env);

  let active = primary;
  if ((primary === 'gemini' && !gemini.healthy) || (primary === 'deepseek' && !deepseek.healthy)) {
    active = alt;
  }

  return res.status(200).json({
    ok: true,
    primary,
    active,
    providers: { gemini, deepseek },
  });
}