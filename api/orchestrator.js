const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

// Env vars (server-side only)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client using service role (server-side only)
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let payload;
  try {
    payload = req.body ?? {};
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { action, data } = payload;

  if (!action) {
    return res.status(400).json({ error: 'Missing `action` in request body' });
  }

  // Basic action router
  switch (action) {
    case 'start': {
      const sessionId = randomUUID();
      return res.status(200).json({ ok: true, sessionId });
    }

    case 'log': {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin client not configured' });
      }

      const { solicitud_id = null, accion = 'orquestador_evento', estado_anterior = null, estado_nuevo = null, datos_validados = null, errores = null } = data || {};

      const insertPayload = {
        solicitud_id,
        accion,
        estado_anterior,
        estado_nuevo,
        datos_validados,
        errores
      };

      const { data: inserted, error } = await supabaseAdmin
        .from('orquestador_logs')
        .insert([insertPayload])
        .select('*')
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ ok: true, log: inserted });
    }

    case 'save': {
      // Stub for future persistence to solicitudes/empresas/etc.
      // Intentionally minimal to avoid schema coupling.
      return res.status(200).json({ ok: true, message: 'Save stub executed', data });
    }

    default:
      return res.status(400).json({ error: `Unknown action: ${action}` });
  }
}