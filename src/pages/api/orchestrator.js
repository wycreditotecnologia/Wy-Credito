// src/pages/api/orchestrator.js
import OrquestadorWally from '../../services/orquestador';
import { logger } from '../../lib/logger.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const { action, sessionId, payload, initialAmount } = req.body;
    const orquestador = new OrquestadorWally();

    try {
        let result;
        switch (action) {
            case 'init':
                result = await orquestador.iniciarConversacion(initialAmount);
                break;
            case 'submit_message':
                result = await orquestador.procesarMensaje(sessionId, payload.message);
                break;
            case 'submit_form_step':
                result = await orquestador.procesarFormulario(sessionId, payload);
                break;
            case 'get_summary_data':
                result = await orquestador.getSummaryData(sessionId);
                break;
            case 'complete_submission':
                result = await orquestador.completeSubmission(sessionId);
                break;
            default:
                throw new Error('Acción no válida');
        }
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        logger.error(`[Orchestrator API Error] Action: ${action}`, error);
        res.status(500).json({ success: false, error: error.message });
    }
}