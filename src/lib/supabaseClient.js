import { createClient } from '@supabase/supabase-js';

// Variables de entorno (cliente) - usar solo anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;

// Verificar si estamos en modo desarrollo y las variables están vacías
if ((!supabaseUrl || !supabaseAnonKey) && import.meta.env.DEV) {
  console.warn('ADVERTENCIA: Variables de Supabase no encontradas. Usando cliente simulado. Revisa tu archivo .env o .env.local');
  
  const createMockClient = () => ({
    from: (table) => ({
      select: () => { console.log(`[MOCK] SELECT en ${table}`); return { data: [], error: { message: 'Cliente simulado' } }; },
      insert: (data) => { console.log(`[MOCK] INSERT en ${table}`, data); return { data: [{ id: 'mock-id' }], error: { message: 'Cliente simulado' } }; },
      update: (data) => { console.log(`[MOCK] UPDATE en ${table}`, data); return { data: [{ id: 'mock-id' }], error: { message: 'Cliente simulado' } }; },
      delete: () => { console.log(`[MOCK] DELETE en ${table}`); return { data: [], error: { message: 'Cliente simulado' } }; },
      rpc: (fn) => { console.log(`[MOCK] RPC call ${fn}`); return { data: {}, error: { message: 'Cliente simulado' } }; },
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