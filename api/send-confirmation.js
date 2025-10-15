// Vercel Node Function: api/send-confirmation
// Sends confirmation emails using Resend without relying on Next.js pages/api.
// CommonJS module for compatibility with Vercel Node runtime.

const { Resend } = require('resend');

// Create Resend client with server-side API key
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  // Basic validation of environment configuration
  if (!process.env.RESEND_API_KEY) {
    res.status(500).json({ ok: false, error: 'RESEND_API_KEY is not configured' });
    return;
  }

  try {
    const {
      emailTo,
      nombreSolicitante,
      montoSolicitado,
      plazo,
      solicitudId,
      from,
      subject,
    } = req.body || {};

    if (!emailTo || !solicitudId) {
      res.status(400).json({ ok: false, error: 'Missing required fields: emailTo, solicitudId' });
      return;
    }

    // Fallbacks for sender and subject
    const fromAddress = from || 'Wally @ Wy Credito <onboarding@resend.dev>';
    const emailSubject = subject || `Confirmación de tu solicitud Wy #${solicitudId}`;

    // Minimal HTML template (avoid JSX/Next dependency)
    const html = `
      <!doctype html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Confirmación de Solicitud</title>
        <style>
          body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #111; }
          .container { max-width: 600px; margin: 0 auto; padding: 16px; }
          .card { border: 1px solid #eee; border-radius: 8px; padding: 16px; }
          .title { font-size: 18px; font-weight: 600; margin: 0 0 12px; }
          .muted { color: #666; font-size: 14px; }
          .footer { font-size: 12px; color: #888; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h1 class="title">¡Gracias por tu solicitud, ${escapeHtml(nombreSolicitante || 'Solicitante')}!</h1>
            <p>Hemos recibido tu solicitud de crédito con el identificador <strong>#${escapeHtml(String(solicitudId))}</strong>.</p>
            <p class="muted">Resumen:</p>
            <ul>
              <li>Monto solicitado: <strong>${escapeHtml(formatCurrency(montoSolicitado))}</strong></li>
              <li>Plazo: <strong>${escapeHtml(String(plazo || 'N/A'))}</strong> meses</li>
            </ul>
            <p>Pronto nos pondremos en contacto contigo para continuar el proceso.</p>
            <p class="footer">Wy Crédito Tecnología · Este es un mensaje automático, por favor no responder.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [emailTo],
      subject: emailSubject,
      html,
    });

    if (error) {
      res.status(400).json({ ok: false, error: error?.message || 'Email send error' });
      return;
    }

    res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error('[send-confirmation] Error:', err);
    res.status(500).json({ ok: false, error: err?.message || 'Internal Server Error' });
  }
};

// Helpers
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatCurrency(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 'N/A';
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);
  } catch (_) {
    return `${num}`;
  }
}