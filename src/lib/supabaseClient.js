import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/config';

// Variables de entorno (cliente) - usar solo anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;

// Cliente simulado básico para evitar caídas cuando faltan variables
const createMockClient = (context = 'DEV') => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: { message: `SUPABASE_${context}_MOCK` } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: { message: `SUPABASE_${context}_MOCK` } }),
    signUp: async () => ({ data: null, error: { message: `SUPABASE_${context}_MOCK` } }),
    signInWithOAuth: async () => ({ data: null, error: { message: `SUPABASE_${context}_MOCK` } }),
    signOut: async () => ({ error: { message: `SUPABASE_${context}_MOCK` } })
  },
  from: (table) => ({
    select: async () => { console.log(`[MOCK:${context}] SELECT en ${table}`); return { data: [], error: { message: `SUPABASE_${context}_MOCK` } }; },
    insert: async (data) => { console.log(`[MOCK:${context}] INSERT en ${table}`, data); return { data: [{ id: 'mock-id' }], error: { message: `SUPABASE_${context}_MOCK` } }; },
    update: async (data) => { console.log(`[MOCK:${context}] UPDATE en ${table}`, data); return { data: [{ id: 'mock-id' }], error: { message: `SUPABASE_${context}_MOCK` } }; },
    delete: async () => { console.log(`[MOCK:${context}] DELETE en ${table}`); return { data: [], error: { message: `SUPABASE_${context}_MOCK` } }; },
    rpc: async (fn) => { console.log(`[MOCK:${context}] RPC call ${fn}`); return { data: {}, error: { message: `SUPABASE_${context}_MOCK` } }; },
  })
});

// Verificar si estamos en modo desarrollo y las variables están vacías
if ((!supabaseUrl || !supabaseAnonKey) && import.meta.env.DEV) {
  console.warn('ADVERTENCIA: Variables de Supabase no encontradas. Usando cliente simulado en desarrollo. Revisa tu archivo .env o .env.local');
  supabase = createMockClient('DEV');
} else if (!supabaseUrl || !supabaseAnonKey) {
  // En producción, no arrojamos excepción para no romper la app
  // Dejamos un mock mínimo para que la UI cargue y se redirija a /login cuando corresponda
  console.error('[PROD] Faltan variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Autenticación deshabilitada hasta configurar variables.');
  supabase = createMockClient('PROD');
} else {
  // Crear cliente real con las credenciales disponibles y opciones centralizadas
  supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig.options);
}

export { supabase };