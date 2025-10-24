// Vercel Node Function: api/send-auth-confirmation
// Generates a Supabase confirmation/magic link and sends it via Resend.
// Uses Service Role key server-side (never exposed to the client).

const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const { rejectIfBot, setRobotsHeader } = require('./_bot');

function getDefaultRedirect() {
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const publicUrl = process.env.PUBLIC_BASE_URL || process.env.VITE_BASE_URL || null;
  return `${vercelUrl || publicUrl || 'http://localhost:3000'}/login`;
}

module.exports = async (req, res) => {
  setRobotsHeader(res);
  if (rejectIfBot(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const {
    RESEND_API_KEY,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
  } = process.env;

  if (!RESEND_API_KEY) {
    res.status(500).json({ ok: false, error: 'RESEND_API_KEY is not configured' });
    return;
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({ ok: false, error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing' });
    return;
  }

  const resend = new Resend(RESEND_API_KEY);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { email, fullName, redirectTo } = req.body || {};
    if (!email) {
      res.status(400).json({ ok: false, error: 'Missing required field: email' });
      return;
    }

    const targetRedirect = redirectTo || getDefaultRedirect();

    // Try to generate a confirmation (signup) link first
    let actionLink = null;
    let linkError = null;
    try {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email,
        options: { redirectTo: targetRedirect },
      });
      if (error) throw error;
      actionLink = data?.action_link || null;
    } catch (e) {
      linkError = e;
    }

    // Fallback to magiclink if signup link failed (e.g., user already exists)
    if (!actionLink) {
      const { data: magicData, error: magicErr } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: targetRedirect },
      });
      if (magicErr) {
        res.status(500).json({ ok: false, error: `Error generating link: ${magicErr.message}; signup error: ${linkError?.message || ''}` });
        return;
      }
      actionLink = magicData?.action_link || null;
    }

    if (!actionLink) {
      res.status(500).json({ ok: false, error: 'No action_link generated' });
      return;
    }

    const safeName = String(fullName || '').trim() || 'Usuario';
    const html = `
      <!doctype html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Activa tu cuenta</title>
        <style>
          body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #111; }
          .container { max-width: 600px; margin: 0 auto; padding: 16px; }
          .card { border: 1px solid #eee; border-radius: 8px; padding: 16px; }
          .title { font-size: 18px; font-weight: 600; margin: 0 0 12px; }
          .muted { color: #666; font-size: 14px; }
          .btn { display: inline-block; background: #3097CD; color: white; padding: 10px 16px; border-radius: 6px; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h1 class="title">Hola ${safeName},</h1>
            <p>Para activar tu cuenta en Wy Crédito, haz clic en el siguiente botón:</p>
            <p><a href="${actionLink}" class="btn">Activar mi cuenta</a></p>
            <p class="muted">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p class="muted">${actionLink}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { data: sendData, error: sendError } = await resend.emails.send({
      from: 'Wy Crédito <onboarding@resend.dev>',
      to: [email],
      subject: 'Activa tu cuenta en Wy Crédito',
      html,
    });

    if (sendError) {
      res.status(400).json({ ok: false, error: sendError?.message || 'Email send error' });
      return;
    }

    res.status(200).json({ ok: true, data: sendData });
  } catch (err) {
    console.error('[send-auth-confirmation] Error:', err);
    res.status(500).json({ ok: false, error: err?.message || 'Internal Server Error' });
  }
};