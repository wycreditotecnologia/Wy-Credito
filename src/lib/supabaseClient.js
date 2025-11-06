import { createClient } from '@supabase/supabase-js';
import { logger } from './logger.js';

// TEMPORAL: Puente Directo para Debugging
const supabaseUrl = 'https://frdjajuabujxkyfulvmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGphanVhYnVqeGt5ZnVsdm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjY5NDEsImV4cCI6MjA3NDI0Mjk0MX0.TD0rZCgrod7uAiklqJCd62Smf9MaojDbYkv5JIix1LU';

let supabase;

// Verificar si estamos en modo desarrollo y las variables están vacías
if ((!supabaseUrl || !supabaseAnonKey) && import.meta.env.DEV) {
  logger.warn('ADVERTENCIA: Variables de Supabase no encontradas. Usando cliente simulado. Revisa tu archivo .env o .env.local');
  
  const createMockClient = () => ({
    from: (table) => ({
      select: () => { logger.log(`[MOCK] SELECT en ${table}`); return { data: [], error: { message: 'Cliente simulado' } }; },
      insert: (data) => { logger.log(`[MOCK] INSERT en ${table}`, data); return { data: [{ id: 'mock-id' }], error: { message: 'Cliente simulado' } }; },
      update: (data) => { logger.log(`[MOCK] UPDATE en ${table}`, data); return { data: [{ id: 'mock-id' }], error: { message: 'Cliente simulado' } }; },
      delete: () => { logger.log(`[MOCK] DELETE en ${table}`); return { data: [], error: { message: 'Cliente simulado' } }; },
      rpc: (fn) => { logger.log(`[MOCK] RPC call ${fn}`); return { data: {}, error: { message: 'Cliente simulado' } }; },
    })
  });
  
  supabase = createMockClient();
} else if (!supabaseUrl || !supabaseAnonKey) {
  // En producción, las variables son requeridas
  throw new Error('Las variables de entorno de Supabase (URL y Anon Key) son requeridas en producción.');
} else {
  // Crear cliente real con las credenciales disponibles
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };