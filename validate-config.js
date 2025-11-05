#!/usr/bin/env node

/**
 * Script de validación de configuración para Wally
 * Wy Crédito Tecnología
 * 
 * Verifica que todas las APIs y servicios estén correctamente configurados
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Cargar variables de entorno
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    logError('Archivo .env no encontrado');
    logInfo('Copia .env.example como .env y configura las variables');
    return null;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return envVars;
}

// Validar URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validar API Key
function isValidApiKey(key, minLength = 20) {
  return typeof key === 'string' && key.length >= minLength && key.trim() !== '';
}

// Validar configuración de Supabase
function validateSupabase(env) {
  log('\n📊 Validando configuración de Supabase...', 'cyan');
  
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  let isValid = true;
  
  if (!url || url === 'https://tu-proyecto.supabase.co') {
    logError('VITE_SUPABASE_URL no configurada o usando valor de ejemplo');
    isValid = false;
  } else if (!isValidUrl(url) || !url.includes('supabase.co')) {
    logError('VITE_SUPABASE_URL no es una URL válida de Supabase');
    isValid = false;
  } else {
    logSuccess(`URL de Supabase configurada: ${url.substring(0, 30)}...`);
  }
  
  if (!key || key === 'tu_anon_key_aqui') {
    logError('VITE_SUPABASE_ANON_KEY no configurada o usando valor de ejemplo');
    isValid = false;
  } else if (!isValidApiKey(key, 100)) {
    logError('VITE_SUPABASE_ANON_KEY no parece válida (muy corta)');
    isValid = false;
  } else {
    logSuccess(`API Key de Supabase configurada (${key.length} caracteres)`);
  }
  
  if (serviceRoleKey && serviceRoleKey !== 'your-service-role-key-here') {
    if (!isValidApiKey(serviceRoleKey, 100)) {
      logError('VITE_SUPABASE_SERVICE_ROLE_KEY no parece válida (muy corta)');
      isValid = false;
    } else {
      logSuccess(`Service Role Key de Supabase configurada (${serviceRoleKey.length} caracteres)`);
      logWarning('Service Role Key tiene permisos completos - úsala con cuidado');
    }
  } else {
    logInfo('Service Role Key no configurada (opcional)');
  }
  
  return isValid;
}

// Validar configuración de Gemini
function validateGemini(env) {
  log('\n🤖 Validando configuración de Gemini API...', 'cyan');
  
  const apiKey = env.VITE_GEMINI_API_KEY;
  const model = env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
  
  let isValid = true;
  
  if (!apiKey || apiKey === 'tu_gemini_api_key_aqui') {
    logError('VITE_GEMINI_API_KEY no configurada o usando valor de ejemplo');
    isValid = false;
  } else if (!isValidApiKey(apiKey, 30)) {
    logError('VITE_GEMINI_API_KEY no parece válida (muy corta)');
    isValid = false;
  } else {
    logSuccess(`API Key de Gemini configurada (${apiKey.length} caracteres)`);
  }
  
  logSuccess(`Modelo de Gemini: ${model}`);
  
  return isValid;
}

// Validar configuración de DeepSeek
function validateDeepSeek(env) {
  log('\n🧠 Validando configuración de DeepSeek API...', 'cyan');
  const apiKey = env.DEEPSEEK_API_KEY;
  const viteKey = env.VITE_DEEPSEEK_API_KEY;
  const baseUrl = env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

  let isValid = true;

  if (!apiKey || apiKey === 'tu_deepseek_api_key_aqui') {
    logError('DEEPSEEK_API_KEY no configurada');
    isValid = false;
  } else if (!isValidApiKey(apiKey, 30)) {
    logError('DEEPSEEK_API_KEY no parece válida (muy corta)');
    isValid = false;
  } else {
    logSuccess(`API Key de DeepSeek configurada (${apiKey.length} caracteres)`);
  }

  if (viteKey) {
    logWarning('VITE_DEEPSEEK_API_KEY detectada. No expongas claves en el frontend.');
  }

  if (!isValidUrl(baseUrl)) {
    logWarning(`DEEPSEEK_BASE_URL no es una URL válida: ${baseUrl}`);
  } else {
    logSuccess(`Endpoint de DeepSeek: ${baseUrl}`);
  }

  return isValid;
}

// Validar configuración de la aplicación
function validateApp(env) {
  log('\n⚙️  Validando configuración de la aplicación...', 'cyan');
  
  const appName = env.VITE_APP_NAME || 'Wally - Wy Crédito';
  const appVersion = env.VITE_APP_VERSION || '1.0.0';
  const devMode = env.VITE_DEV_MODE === 'true';
  
  logSuccess(`Nombre de la aplicación: ${appName}`);
  logSuccess(`Versión: ${appVersion}`);
  
  if (devMode) {
    logWarning('Modo de desarrollo activado');
  } else {
    logSuccess('Modo de producción activado');
  }
  
  return true;
}

// Validar archivos requeridos
function validateFiles() {
  log('\n📁 Validando archivos requeridos...', 'cyan');
  
  const requiredFiles = [
    'src/config/index.js',
    'src/services/gemini.js',
    'src/services/orquestador.js',
    'src/lib/supabase.js',
    'src/lib/llmClient.js',
    'api/llm-chat.js',
    'api/llm-status.js',
    'api/llm-extract.js',
    'database/setup_database.sql',
    'package.json'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      logSuccess(`${file} existe`);
    } else {
      logError(`${file} no encontrado`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// Validar dependencias
function validateDependencies() {
  log('\n📦 Validando dependencias...', 'cyan');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json no encontrado');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@supabase/supabase-js',
    '@google/generative-ai',
    'react',
    'vite'
  ];
  
  let allDepsInstalled = true;
  
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      logSuccess(`${dep} v${dependencies[dep]}`);
    } else {
      logError(`${dep} no instalada`);
      allDepsInstalled = false;
    }
  });
  
  return allDepsInstalled;
}

// Función principal
async function main() {
  log('🚀 VALIDADOR DE CONFIGURACIÓN - WALLY', 'magenta');
  log('=====================================\n', 'magenta');
  
  // Cargar variables de entorno
  const env = loadEnvFile();
  if (!env) {
    process.exit(1);
  }
  
  // Ejecutar validaciones
  const results = {
    supabase: validateSupabase(env),
    gemini: validateGemini(env),
    deepseek: validateDeepSeek(env),
    app: validateApp(env),
    files: validateFiles(),
    dependencies: validateDependencies()
  };
  
  // Resumen final
  log('\n📋 RESUMEN DE VALIDACIÓN', 'magenta');
  log('========================\n', 'magenta');
  
  const allValid = Object.values(results).every(result => result);
  
  Object.entries(results).forEach(([category, isValid]) => {
    const categoryNames = {
      supabase: 'Supabase',
      gemini: 'Gemini API',
      deepseek: 'DeepSeek API',
      app: 'Aplicación',
      files: 'Archivos',
      dependencies: 'Dependencias'
    };
    
    if (isValid) {
      logSuccess(`${categoryNames[category]}: Configurado correctamente`);
    } else {
      logError(`${categoryNames[category]}: Requiere atención`);
    }
  });
  
  log('', 'white');
  
  if (allValid) {
    logSuccess('🎉 ¡Todas las configuraciones son válidas!');
    logInfo('Tu aplicación Wally está lista para funcionar.');
  } else {
    logError('❌ Algunas configuraciones requieren atención.');
    logInfo('Revisa los errores anteriores y corrige la configuración.');
    process.exit(1);
  }
  
  // Instrucciones adicionales
  if (env.VITE_DEV_MODE === 'true') {
    log('\n💡 PRÓXIMOS PASOS:', 'yellow');
    log('- Ejecuta: npm run dev', 'white');
    log('- Abre: http://localhost:3000', 'white');
    log('- Para producción, cambia VITE_DEV_MODE=false', 'white');
  }
}

main().catch(console.error);