import { Resend } from 'resend';
import SolicitudRecibidaEmail from '../../emails/SolicitudRecibidaEmail';
import { logger } from '../../lib/logger.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { emailTo, nombreSolicitante, montoSolicitado, plazo, solicitudId } = req.body;

    const { data, error } = await resend.emails.send({
      from: 'Wally @ Wy Credito <onboarding@resend.dev>', // Dominio de envío configurado en Resend
      to: [emailTo],
      subject: `Confirmación de tu solicitud de crédito Wy #${solicitudId}`,
      react: <SolicitudRecibidaEmail
                nombreSolicitante={nombreSolicitante}
                montoSolicitado={montoSolicitado}
                plazo={plazo}
                solicitudId={solicitudId}
              />,
    });

    if (error) {
      return res.status(400).json(error);
    }

    res.status(200).json(data);

  } catch (error) {
    logger.error("Error enviando el correo:", error);
    res.status(500).json({ error: "Hubo un error al enviar el correo de confirmación." });
  }
}