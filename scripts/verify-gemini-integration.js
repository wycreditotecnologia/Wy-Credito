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
const model = envVars.VITE_GEMINI_MODEL || 'gemini-1.5-flash';

if (!apiKey) {
  console.error('❌ API Key de Gemini no encontrada');
  process.exit(1);
}

console.log('🤖 VERIFICANDO INTEGRACIÓN CON GEMINI AI');
console.log('='.repeat(50));

async function testBasicConnection() {
  console.log('\n🔗 Probando conexión básica...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = "Responde solo con 'OK' si puedes procesar este mensaje";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Conexión exitosa con Gemini');
    console.log(`   Respuesta: ${text.trim()}`);
    return true;
  } catch (error) {
    console.log('❌ Error en conexión:', error.message);
    return false;
  }
}

async function testDocumentProcessing() {
  console.log('\n📄 Probando procesamiento de documentos...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Simular procesamiento de documento de identidad
    const prompt = `
Eres un asistente especializado en extraer información de documentos de identidad.
Extrae la siguiente información del siguiente texto simulado de una cédula:

"REPÚBLICA DE COLOMBIA
CÉDULA DE CIUDADANÍA
Nombres: JUAN CARLOS
Apellidos: PÉREZ GONZÁLEZ  
Número: 12345678
Fecha de nacimiento: 15/03/1985
Lugar de nacimiento: BOGOTÁ D.C."

Responde SOLO en formato JSON con esta estructura:
{
  "nombres": "",
  "apellidos": "",
  "numero_documento": "",
  "fecha_nacimiento": "",
  "lugar_nacimiento": ""
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Intentar parsear JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        console.log('✅ Procesamiento de documento exitoso');
        console.log('   Datos extraídos:', parsedData);
        return true;
      } else {
        console.log('⚠️  Respuesta no en formato JSON esperado');
        console.log('   Respuesta:', text);
        return false;
      }
    } catch (parseError) {
      console.log('⚠️  Error parseando JSON:', parseError.message);
      console.log('   Respuesta raw:', text);
      return false;
    }
  } catch (error) {
    console.log('❌ Error en procesamiento:', error.message);
    return false;
  }
}

async function testConversationalAI() {
  console.log('\n💬 Probando IA conversacional (Wally)...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
Eres Wally, un asistente virtual especializado en créditos empresariales.
Responde de manera amigable y profesional a este saludo:
"Hola, necesito información sobre un crédito para mi empresa"

Mantén tu respuesta breve (máximo 2 líneas) y menciona que puedes ayudar con el proceso.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ IA conversacional funcionando');
    console.log(`   Respuesta de Wally: "${text.trim()}"`);
    return true;
  } catch (error) {
    console.log('❌ Error en IA conversacional:', error.message);
    return false;
  }
}

async function testErrorHandling() {
  console.log('\n⚠️  Probando manejo de errores...');
  
  try {
    const genAI = new GoogleGenerativeAI('invalid-key');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('test');
    console.log('❌ Error: debería haber fallado con API key inválida');
    return false;
  } catch (error) {
    console.log('✅ Manejo de errores funcionando correctamente');
    console.log(`   Error capturado: ${error.message.substring(0, 100)}...`);
    return true;
  }
}

async function main() {
  let passedTests = 0;
  let totalTests = 4;
  
  // Test 1: Conexión básica
  if (await testBasicConnection()) passedTests++;
  
  // Test 2: Procesamiento de documentos
  if (await testDocumentProcessing()) passedTests++;
  
  // Test 3: IA conversacional
  if (await testConversationalAI()) passedTests++;
  
  // Test 4: Manejo de errores
  if (await testErrorHandling()) passedTests++;
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE VERIFICACIÓN GEMINI AI');
  console.log('='.repeat(50));
  console.log(`✅ Tests pasados: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡INTEGRACIÓN GEMINI AI COMPLETAMENTE OPERATIVA!');
  } else if (passedTests >= 2) {
    console.log('⚠️  FUNCIONALIDAD BÁSICA DE IA DISPONIBLE');
  } else {
    console.log('❌ PROBLEMAS CRÍTICOS CON GEMINI AI');
  }
}

main().catch(console.error);