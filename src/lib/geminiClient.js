import { GoogleGenerativeAI } from '@google/generative-ai';
import { llmClient } from './llmClient';

const useBackend = import.meta.env.VITE_USE_BACKEND_LLM === 'true' || import.meta.env.VITE_USE_BACKEND_GEMINI === 'true';
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let geminiModel;

if (useBackend) {
  // Proxy model to backend endpoints, preserving generateContent API used by callers
  geminiModel = {
    generateContent: async (input) => {
      // If input is array with inlineData => extraction
      if (Array.isArray(input)) {
        const [prompt, generativePart] = input;
        const mimeType = generativePart?.inlineData?.mimeType || 'application/pdf';
        const dataBase64 = generativePart?.inlineData?.data;
        const data = await llmClient.extract({ prompt, mimeType, dataBase64 });
        return { response: { text: () => data.text } };
      }
      // Otherwise treat as chat
      const data = await llmClient.chat(input);
      return { response: { text: () => data.text } };
    }
  };
} else if (!apiKey) {
  console.warn('Gemini API Key is missing from .env - using mock mode');
  geminiModel = {
    generateContent: async () => ({
      response: {
        text: () => '{"nit": "123456789", "razon_social": "Empresa de Prueba S.A.S."}'
      }
    })
  };
} else {
  const genAI = new GoogleGenerativeAI(apiKey);
  geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
}

export { geminiModel };