#!/usr/bin/env node

/**
 * Script de configuración interactiva para Supabase
 * Wy Crédito - Wally
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n🚀 CONFIGURACIÓN DE SUPABASE PARA WALLY');
  console.log('=====================================\n');
  
  console.log('Este script te ayudará a configurar Supabase para tu aplicación Wally.');
  console.log('Necesitarás tener un proyecto de Supabase creado.\n');
  
  const hasProject = await question('¿Ya tienes un proyecto de Supabase creado? (s/n): ');
  
  if (hasProject.toLowerCase() !== 's') {
    console.log('\n📋 PASOS PARA CREAR UN PROYECTO DE SUPABASE:');
    console.log('1. Ve a https://supabase.com');
    console.log('2. Inicia sesión o crea una cuenta');
    console.log('3. Haz clic en "New Project"');
    console.log('4. Completa los datos del proyecto:');
    console.log('   - Name: Wally-WyCredito');
    console.log('   - Database Password: (elige una contraseña segura)');
    console.log('   - Region: South America (São Paulo) - más cercana a Colombia');
    console.log('5. Haz clic en "Create new project"');
    console.log('6. Espera a que se complete la configuración (2-3 minutos)');
    console.log('\nUna vez creado, vuelve a ejecutar este script.\n');
    
    rl.close();
    return;
  }
  
  console.log('\n🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO');
  console.log('=========================================\n');
  
  console.log('Ahora necesito la información de tu proyecto de Supabase.');
  console.log('Puedes encontrar esta información en:');
  console.log('Settings > API > Project URL y Project API keys\n');
  
  const projectUrl = await question('Ingresa tu Project URL de Supabase: ');
  const anonKey = await question('Ingresa tu anon/public API key: ');
  
  // Validar URLs
  if (!projectUrl.startsWith('https://') || !projectUrl.includes('supabase.co')) {
    console.log('❌ Error: La URL del proyecto no parece válida.');
    console.log('Debe ser algo como: https://tu-proyecto.supabase.co');
    rl.close();
    return;
  }
  
  if (!anonKey || anonKey.length < 100) {
    console.log('❌ Error: La API key no parece válida.');
    console.log('Debe ser una cadena larga de caracteres.');
    rl.close();
    return;
  }
  
  // Crear archivo .env
  const envContent = `# Configuración de Supabase
VITE_SUPABASE_URL=${projectUrl}
VITE_SUPABASE_ANON_KEY=${anonKey}

# Configuración de la aplicación
VITE_APP_NAME=Wally - Wy Crédito
VITE_APP_VERSION=1.0.0

# Configuración de desarrollo
VITE_DEV_MODE=false
`;

  try {
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    console.log('\n✅ Archivo .env actualizado correctamente!');
  } catch (error) {
    console.log('❌ Error al escribir el archivo .env:', error.message);
    rl.close();
    return;
  }
  
  console.log('\n📊 CONFIGURACIÓN DE BASE DE DATOS');
  console.log('=================================\n');
  
  console.log('Ahora necesitas ejecutar el script SQL en tu base de datos de Supabase:');
  console.log('1. Ve a tu proyecto de Supabase');
  console.log('2. Ve a SQL Editor');
  console.log('3. Crea una nueva query');
  console.log('4. Copia y pega el contenido del archivo: database/setup_database.sql');
  console.log('5. Ejecuta la query');
  
  const sqlExecuted = await question('\n¿Has ejecutado el script SQL? (s/n): ');
  
  if (sqlExecuted.toLowerCase() === 's') {
    console.log('\n🎉 ¡CONFIGURACIÓN COMPLETADA!');
    console.log('============================\n');
    console.log('Tu aplicación Wally ahora está conectada a Supabase.');
    console.log('Puedes reiniciar el servidor de desarrollo para aplicar los cambios.');
    console.log('\nComandos útiles:');
    console.log('- npm run dev (reiniciar servidor)');
    console.log('- Verificar en el navegador que no hay errores de conexión');
  } else {
    console.log('\n⚠️  Recuerda ejecutar el script SQL para completar la configuración.');
    console.log('Sin las tablas de la base de datos, la aplicación no funcionará correctamente.');
  }
  
  rl.close();
}

main().catch(console.error);