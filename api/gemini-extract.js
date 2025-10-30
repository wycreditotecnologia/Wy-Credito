// Vercel Node Function: api/gemini-extract
// Maneja llamadas seguras a Gemini (backend) para extracción de datos
// Estilo CommonJS para consistencia con el resto de funciones en /api

const { rejectIfBot, setRobotsHeader } = require('./_bot');

// Utilidad: convertir ArrayBuffer -> base64
function bufferToBase64(arrayBuffer) {
  return Buffer.from(arrayBuffer).toString('base64');
}

// Utilidad: timeout con AbortController
async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(id);
  }
}

// MIME types permitidos (consistentes con FileUpload)
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
]);

// Selección de prompt por tipo de documento
function getPromptForTipoDocumento(tipo) {
  const base = `Eres un asistente experto en extraer información estructurada de documentos legales y financieros colombianos.
Responde EXCLUSIVAMENTE en formato JSON válido. No uses texto adicional ni bloques markdown.
Si un campo no se encuentra, devuelve "" (string vacío). No inventes datos.`;

  switch ((tipo || '').toString()) {
    case 'certificado_existencia':
      return (
        base +
        `\nExtrae los siguientes campos del Certificado de Existencia y Representación Legal (Cámara de Comercio):\n{
  "nit": "string", // NIT de la empresa, permite con o sin guion/dígito verificador
  "razon_social": "string" // Razón social exacta
}`
      );
    default:
      return (
        base +
        `\nDevuelve un objeto con los campos relevantes si los identificas, por ejemplo: {"nit":"","razon_social":""}`
      );
  }
}

module.exports = async function handler(req, res) {
  setRobotsHeader(res);
  if (rejectIfBot(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Validación de env var del servidor
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 20) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    const { fileUrl, fileType, tipo_documento, prompt } = req.body || {};
    if (!fileUrl || !fileType) {
      return res.status(400).json({ error: 'fileUrl and fileType are required' });
    }

    if (!ALLOWED_MIME.has(fileType)) {
      return res.status(415).json({ error: `Unsupported fileType: ${fileType}` });
    }

    // Descargar el archivo desde el backend con timeout y un retry básico
    let response = await fetchWithTimeout(fileUrl, {}, 20000);
    if (!response.ok) {
      // retry una vez breve
      response = await fetchWithTimeout(fileUrl, {}, 12000);
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    // Validación de tamaño (si el header está disponible)
    const contentLength = Number(response.headers.get('content-length') || '0');
    if (contentLength > 0 && contentLength > 10 * 1024 * 1024) {
      return res.status(413).json({ error: 'File too large (>10MB)' });
    }

    // En Node 18+ usamos arrayBuffer() directamente
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
      return res.status(413).json({ error: 'File too large after download (>10MB)' });
    }
    const imageBase64 = bufferToBase64(arrayBuffer);

    // Import dinámico para compatibilidad con módulos ESM
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const effectivePrompt = prompt || getPromptForTipoDocumento(tipo_documento);

    const generativePart = {
      inlineData: {
        mimeType: fileType,
        data: imageBase64,
      },
    };

    const result = await model.generateContent([
      { text: effectivePrompt },
      generativePart,
    ]);
    const extractedText = result.response.text();

    // Intentar parseo directo (el modelo debería responder JSON puro)
    let jsonData;
    try {
      jsonData = JSON.parse(extractedText);
    } catch (_) {
      const cleaned = (extractedText || '').replace(/```json|```/g, '').trim();
      jsonData = JSON.parse(cleaned);
    }

    return res.status(200).json({ ok: true, data: jsonData });
  } catch (error) {
    console.error('Error in gemini-extract function:', error);
    return res.status(500).json({ error: 'Failed to process document with Gemini.' });
  }
};