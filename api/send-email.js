// Vercel Serverless Function: Send Email via Resend
// - Supports generic templates and OTP verification code
// - Expects JSON: { to, subject, type, data }

import { Resend } from 'resend';
import { render } from '@react-email/render';

import VerificationCodeEmail from '../src/emails/VerificationCodeEmail.jsx';
import SolicitudRecibidaEmail from '../src/emails/SolicitudRecibidaEmail.jsx';

function getEnv() {
  return {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@wycredito.com',
  };
}

function safeJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return safeJson(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  let body = null;
  try {
    body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  } catch (e) {
    return safeJson(res, 400, { ok: false, error: 'invalid_json' });
  }

  const env = getEnv();
  if (!env.RESEND_API_KEY) {
    return safeJson(res, 500, { ok: false, error: 'RESEND_API_KEY not configured' });
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const to = body?.to;
  const subject = body?.subject || 'Wy Crédito';
  const type = (body?.type || '').toLowerCase();
  const data = body?.data || {};

  if (!to || typeof to !== 'string') {
    return safeJson(res, 400, { ok: false, error: 'invalid_to' });
  }

  try {
    let html = '';
    if (type === 'otp' || type === 'verification') {
      html = render(VerificationCodeEmail({ nombre: data?.nombre || 'Cliente', codigo: data?.codigo || '------', expiracionMin: data?.expiracionMin || 10 }));
    } else if (type === 'solicitud_recibida') {
      html = render(SolicitudRecibidaEmail({
        nombreSolicitante: data?.nombreSolicitante,
        montoSolicitado: data?.montoSolicitado,
        plazo: data?.plazo,
        solicitudId: data?.solicitudId,
      }));
    } else {
      // Fallback simple
      html = `<p>${data?.mensaje || 'Wy Crédito'}</p>`;
    }

    const sendResult = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    return safeJson(res, 200, { ok: true, id: sendResult?.id || null });
  } catch (e) {
    return safeJson(res, 500, { ok: false, error: e?.message?.slice(0, 200) || 'send_failed' });
  }
}