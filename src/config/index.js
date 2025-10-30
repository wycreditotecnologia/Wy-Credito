/**
 * Configuración centralizada de la aplicación Wally
 * Wy Crédito Tecnología
 * 
 * Este archivo maneja todas las configuraciones de APIs y servicios externos
 * con validaciones de seguridad y manejo de errores.
 */

// Validador de URLs
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validador de API Keys
const isValidApiKey = (key, minLength = 20) => {
  return typeof key === 'string' && key.length >= minLength && key.trim() !== '';
};

// Configuración de Supabase
const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  
  // Validación de configuración
  isValid() {
    const urlValid = isValidUrl(this.url) && this.url.includes('supabase.co');
    const keyValid = isValidApiKey(this.anonKey, 100);
    
    if (!urlValid) {
      console.error('❌ Supabase URL inválida o no configurada');
      return false;
    }
    
    if (!keyValid) {
      console.error('❌ Supabase API Key inválida o no configurada');
      return false;
    }
    
    return true;
  },
  
  // Obtener errores de configuración
  getErrors() {
    const errors = [];
    if (!isValidUrl(this.url) || !this.url.includes('supabase.co')) {
      errors.push('VITE_SUPABASE_URL no es una URL válida de Supabase');
    }
    if (!isValidApiKey(this.anonKey, 100)) {
      errors.push('VITE_SUPABASE_ANON_KEY no parece válida (muy corta)');
    }
    return errors;
  },
  
  // Obtener advertencias de configuración
  getWarnings() {
    const warnings = [];
    return warnings;
  },
  
  // Configuración adicional
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
};

// Configuración de Google Gemini
const geminiConfig = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash-latest',
  
  // Validación de configuración
  isValid() {
    const keyValid = isValidApiKey(this.apiKey, 30);
    
    if (!keyValid) {
      console.error('❌ Gemini API Key inválida o no configurada');
      return false;
    }
    
    return true;
  },
  
  // Configuración del modelo
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
    responseMimeType: "text/plain",
  },
  
  // Configuraciones de seguridad
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ]
};

// Configuración de la aplicación
const appConfig = {
  name: import.meta.env.VITE_APP_NAME || 'Wally - Wy Crédito',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.MODE || 'development',
  devMode: import.meta.env.VITE_DEV_MODE === 'true',
  useBackendGemini: import.meta.env.VITE_USE_BACKEND_GEMINI === 'true',
  
  // URLs y endpoints
  baseUrl: import.meta.env.VITE_BASE_URL || 'http://localhost:3000',
  useResendAuth: import.meta.env.VITE_USE_RESEND_AUTH === 'true',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  
  // Configuración de logging
  logging: {
    level: import.meta.env.VITE_LOG_LEVEL || 'info',
    enableConsole: import.meta.env.MODE === 'development'
  }
};

// Configuración de características
const featuresConfig = {
  enableRealTimeUpdates: import.meta.env.VITE_ENABLE_REALTIME === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableFileUpload: import.meta.env.VITE_ENABLE_FILE_UPLOAD !== 'false',
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB
  allowedFileTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,doc,docx').split(',')
};

// Función de validación general
const validateConfiguration = () => {
  const errors = [];
  const warnings = [];
  
  // Validar Supabase
  if (!supabaseConfig.isValid()) {
    if (appConfig.devMode) {
      warnings.push('Supabase no configurado - usando modo de desarrollo');
    } else {
      errors.push('Supabase debe estar configurado en producción');
    }
  }
  
  // Validar Gemini
  if (!geminiConfig.isValid()) {
    if (appConfig.useBackendGemini) {
      warnings.push('Gemini API (frontend) no configurada - usando backend seguro');
    } else if (appConfig.devMode) {
      warnings.push('Gemini API no configurada - usando respuestas simuladas');
    } else {
      errors.push('Gemini API debe estar configurada en producción');
    }
  }
  
  // Mostrar resultados
  if (errors.length > 0) {
    console.error('❌ Errores de configuración:', errors);
    throw new Error(`Configuración inválida: ${errors.join(', ')}`);
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ Advertencias de configuración:', warnings);
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Configuración validada correctamente');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Función para obtener configuración segura (sin exponer claves)
const getSafeConfig = () => ({
  app: {
    name: appConfig.name,
    version: appConfig.version,
    environment: appConfig.environment,
    devMode: appConfig.devMode
  },
  supabase: {
    configured: supabaseConfig.isValid(),
    url: supabaseConfig.url ? `${supabaseConfig.url.substring(0, 20)}...` : 'No configurada'
  },
  gemini: {
    configured: geminiConfig.isValid(),
    model: geminiConfig.model
  },
  features: featuresConfig
});

// Exportar configuraciones
export {
  supabaseConfig,
  geminiConfig,
  appConfig,
  featuresConfig,
  validateConfiguration,
  getSafeConfig
};

// Validar configuración al cargar el módulo
try {
  validateConfiguration();
} catch (error) {
  console.error('Error al validar configuración:', error.message);
}