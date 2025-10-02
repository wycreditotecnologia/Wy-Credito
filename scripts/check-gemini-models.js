import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Leer variables de entorno desde .env
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/['"]/g, '');
  }
});

const apiKey = envVars.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ API Key de Gemini no encontrada');
  process.exit(1);
}

console.log('🔍 VERIFICANDO MODELOS DISPONIBLES EN GEMINI');
console.log('='.repeat(50));

async function listAvailableModels() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('📋 Listando modelos disponibles...');
    
    // Intentar con diferentes modelos comunes
    const commonModels = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.0-pro',
      'gemini-pro-vision'
    ];
    
    for (const modelName of commonModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Test');
        const response = await result.response;
        console.log(`✅ ${modelName}: DISPONIBLE`);
        
        // Probar con este modelo
        await testWithModel(genAI, modelName);
        return modelName;
      } catch (error) {
        console.log(`❌ ${modelName}: ${error.message.includes('404') ? 'NO DISPONIBLE' : 'ERROR'}`);
      }
    }
    
    return null;
  } catch (error) {
    console.log('❌ Error listando modelos:', error.message);
    return null;
  }
}

async function testWithModel(genAI, modelName) {
  console.log(`\n🧪 Probando funcionalidad con ${modelName}...`);
  
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Test básico
    const prompt = "Responde solo con 'FUNCIONANDO' si puedes procesar este mensaje";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ Test básico: ${text.trim()}`);
    
    // Test de extracción de datos
    const extractPrompt = `
Extrae el nombre de esta frase: "Mi nombre es Juan Pérez"
Responde solo con el nombre extraído.`;
    
    const extractResult = await model.generateContent(extractPrompt);
    const extractResponse = await extractResult.response;
    const extractText = extractResponse.text();
    
    console.log(`✅ Test extracción: ${extractText.trim()}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Error probando ${modelName}:`, error.message);
    return false;
  }
}

async function updateEnvFile(workingModel) {
  if (!workingModel) {
    console.log('⚠️  No se encontró un modelo funcional');
    return;
  }
  
  console.log(`\n📝 Actualizando .env con modelo funcional: ${workingModel}`);
  
  try {
    let envContent = fs.readFileSync('.env', 'utf8');
    
    // Actualizar o agregar la línea del modelo
    if (envContent.includes('VITE_GEMINI_MODEL=')) {
      envContent = envContent.replace(
        /VITE_GEMINI_MODEL=.*/,
        `VITE_GEMINI_MODEL=${workingModel}`
      );
    } else {
      envContent += `\nVITE_GEMINI_MODEL=${workingModel}`;
    }
    
    fs.writeFileSync('.env', envContent);
    console.log('✅ Archivo .env actualizado');
  } catch (error) {
    console.log('❌ Error actualizando .env:', error.message);
  }
}

async function main() {
  const workingModel = await listAvailableModels();
  
  if (workingModel) {
    await updateEnvFile(workingModel);
    console.log('\n🎉 ¡GEMINI AI CONFIGURADO CORRECTAMENTE!');
    console.log(`   Modelo funcional: ${workingModel}`);
  } else {
    console.log('\n❌ NO SE PUDO CONFIGURAR GEMINI AI');
    console.log('   Verifica tu API key y conexión a internet');
  }
}

main().catch(console.error);