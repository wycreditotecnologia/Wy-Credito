import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash-latest';

let geminiModel;

if (!apiKey) {
  console.warn("Gemini API Key is missing from .env - using mock mode");
  // Crear un mock del modelo para desarrollo
  geminiModel = {
    generateContent: async () => ({
      response: {
        text: () => '{"nit": "123456789", "razon_social": "Empresa de Prueba S.A.S."}'
      }
    })
  };
} else {
  const genAI = new GoogleGenerativeAI(apiKey);
  geminiModel = genAI.getGenerativeModel({ model: modelName });
}

export { geminiModel };