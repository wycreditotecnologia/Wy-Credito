import { supabase } from '../lib/supabaseClient';

// Aquí irían las funciones como obtenerEstadisticasAdmin, crearSolicitud, etc.
// Por ahora, lo dejamos listo para futuras implementaciones sin romper la app.

export const getDashboardMetrics = async () => {
  if (import.meta.env.DEV && !supabase.realtime) { // Chequea si es el cliente mock
    return { total_applications: 0, pending_applications: 0, approved_applications: 0, rejected_applications: 0, average_amount: 0, total_amount: 0, applications_today: 0, applications_this_week: 0, applications_this_month: 0 };
  }
  const { data, error } = await supabase.rpc('get_dashboard_metrics');
  if (error) throw error;
  return data;
};