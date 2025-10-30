// Vercel Node Function: api/gemini-chat
// Endpoint backend para conversaciones con Gemini sin exponer API key en el frontend

const { rejectIfBot, setRobotsHeader } = require('./_bot');

module.exports = async function handler(req, res) {
  setRobotsHeader(res);
  if (rejectIfBot(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 20) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    const { prompt, context = {} } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'text/plain' },
    });

    // Construir un prompt enriquecido con contexto mínimo
    const systemPrompt = `Eres Wally, el asistente virtual de Wy Crédito Tecnología. Responde de forma concisa y profesional.
Contexto:
- Solicitud ID: ${context.solicitudId || 'Nueva'}
- Email: ${context.email || 'No proporcionado'}
- Progreso: ${context.progreso || 0}%

Mensaje del usuario: ${prompt}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ ok: true, reply: text });
  } catch (error) {
    console.error('Error in gemini-chat function:', error);
    return res.status(500).json({ error: 'Failed to generate response with Gemini.' });
  }
};