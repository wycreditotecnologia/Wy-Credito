/**
 * Servicio de integración con Google Gemini API
 * Wy Crédito Tecnología - Wally
 * 
 * Maneja todas las interacciones con la API de Gemini de forma segura
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiConfig, appConfig } from '../config/index.js';

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.isInitialized = false;
    this.isDevMode = appConfig.devMode;
    
    this.initialize();
  }
  
  /**
   * Inicializa el servicio de Gemini
   */
  initialize() {
    try {
      if (geminiConfig.isValid()) {
        this.genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
        this.model = this.genAI.getGenerativeModel({
          model: geminiConfig.model,
          generationConfig: geminiConfig.generationConfig,
          safetySettings: geminiConfig.safetySettings,
        });
        this.isInitialized = true;
        console.log('✅ Gemini API inicializada correctamente');
      } else if (appConfig.useBackendGemini) {
        console.warn('⚠️ Gemini API (frontend) no configurada - utilizando backend seguro');
        this.isInitialized = true; // habilitar flujo vía backend
      } else {
        console.warn('⚠️ Gemini API no configurada - usando modo simulado');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('❌ Error al inicializar Gemini API:', error);
      this.isInitialized = false;
    }
  }
  
  /**
   * Genera una respuesta usando Gemini API
   * @param {string} prompt - El prompt para enviar a Gemini
   * @param {Object} context - Contexto adicional para la conversación
   * @returns {Promise<string>} - La respuesta generada
   */
  async generateResponse(prompt, context = {}) {
    if (this.isDevMode) {
      return this.generateMockResponse(prompt, context);
    }
    
    try {
      if (appConfig.useBackendGemini) {
        // Usar endpoint backend seguro
        const resp = await fetch('/api/gemini-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, context })
        });
        if (!resp.ok) {
          const errText = await resp.text().catch(() => '');
          throw new Error(`Backend Gemini error (${resp.status}): ${errText}`);
        }
        const payload = await resp.json();
        return this.validateAndCleanResponse(payload?.reply || '');
      } else {
        // Construir el prompt completo con contexto
        const fullPrompt = this.buildPrompt(prompt, context);
        
        // Generar respuesta directa
        const result = await this.model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        
        // Validar y limpiar la respuesta
        return this.validateAndCleanResponse(text);
      }
      
    } catch (error) {
      console.error('❌ Error al generar respuesta con Gemini:', error);
      
      // Fallback a respuesta simulada en caso de error
      return this.generateMockResponse(prompt, context);
    }
  }
  
  /**
   * Construye el prompt completo con contexto
   * @param {string} userMessage - Mensaje del usuario
   * @param {Object} context - Contexto de la conversación
   * @returns {string} - Prompt completo
   */
  buildPrompt(userMessage, context) {
    const systemPrompt = `
Eres Wally, el asistente virtual de Wy Crédito Tecnología. Tu objetivo es ayudar a los usuarios a solicitar créditos empresariales de manera conversacional y eficiente.

CONTEXTO DE LA CONVERSACIÓN:
- Solicitud ID: ${context.solicitudId || 'Nueva solicitud'}
- Email del usuario: ${context.email || 'No proporcionado'}
- Campos completados: ${context.camposCompletados || 0}
- Progreso: ${context.progreso || 0}%

INSTRUCCIONES:
1. Sé amigable, profesional y eficiente
2. Haz una pregunta a la vez
3. Valida la información proporcionada
4. Proporciona feedback positivo cuando sea apropiado
5. Mantén el foco en completar la solicitud de crédito

INFORMACIÓN REQUERIDA:
- Información de la empresa (NIT, razón social, etc.)
- Datos del representante legal
- Información financiera (monto, plazo, ingresos)
- Tipo de garantía

MENSAJE DEL USUARIO: ${userMessage}

Responde de manera natural y conversacional:`;

    return systemPrompt;
  }
  
  /**
   * Valida y limpia la respuesta de Gemini
   * @param {string} response - Respuesta cruda de Gemini
   * @returns {string} - Respuesta validada y limpia
   */
  validateAndCleanResponse(response) {
    if (!response || typeof response !== 'string') {
      throw new Error('Respuesta inválida de Gemini');
    }
    
    // Limpiar la respuesta
    let cleanResponse = response.trim();
    
    // Remover posibles prefijos no deseados
    cleanResponse = cleanResponse.replace(/^(Wally:|Asistente:|Bot:)\s*/i, '');
    
    // Validar longitud
    if (cleanResponse.length < 10) {
      throw new Error('Respuesta demasiado corta');
    }
    
    if (cleanResponse.length > 2000) {
      cleanResponse = cleanResponse.substring(0, 1997) + '...';
    }
    
    return cleanResponse;
  }
  
  /**
   * Genera una respuesta simulada para desarrollo
   * @param {string} prompt - El prompt original
   * @param {Object} context - Contexto de la conversación
   * @returns {string} - Respuesta simulada
   */
  generateMockResponse(prompt, context) {
    const mockResponses = [
      "¡Hola! Soy Wally, tu asistente para solicitudes de crédito. ¿Podrías proporcionarme tu email para comenzar?",
      "Perfecto, ahora necesito conocer el NIT de tu empresa para continuar con la solicitud.",
      "Excelente. ¿Cuál es la razón social de tu empresa?",
      "Muy bien. ¿Qué monto de crédito necesitas para tu empresa?",
      "Entiendo. ¿En cuántos meses te gustaría pagar este crédito?",
      "Perfecto. Para finalizar, ¿qué tipo de garantía puedes ofrecer para este crédito?"
    ];
    
    // Simular delay de API
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        resolve(`[MODO DESARROLLO] ${randomResponse}`);
      }, 500 + Math.random() * 1000);
    });
  }
  
  /**
   * Verifica el estado del servicio
   * @returns {Object} - Estado del servicio
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      devMode: this.isDevMode,
      model: geminiConfig.model,
      configured: geminiConfig.isValid()
    };
  }
  
  /**
   * Reinicia el servicio (útil para recargar configuración)
   */
  restart() {
    this.isInitialized = false;
    this.genAI = null;
    this.model = null;
    this.initialize();
  }
}

// Crear instancia singleton
const geminiService = new GeminiService();

export default geminiService;