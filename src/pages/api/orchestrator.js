// src/pages/api/orchestrator.js
import OrquestadorWally from '../../services/orquestador';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const { action, sessionId, payload } = req.body;
    const orquestador = new OrquestadorWally();

    try {
        let result;
        switch (action) {
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
        console.error(`[Orchestrator API Error] Action: ${action}`, error);
        res.status(500).json({ success: false, error: error.message });
    }
}