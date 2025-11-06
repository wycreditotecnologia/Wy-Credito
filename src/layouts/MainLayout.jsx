import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { logger } from '../lib/logger.js';

// Asumimos que el componente del formulario se llama 'ApplicationView.jsx'
// y lo crearemos en la carpeta 'src/views/'.
import ApplicationView from '../components/ApplicationView/ApplicationView';

// --- Simulación de la API del Orquestador ---
const createNewSession = async () => {
  logger.log("Arquitecto: Solicitando nueva sesión al Orquestador...");
  const newSessionId = crypto.randomUUID();
  logger.log("Arquitecto: Orquestador respondió con nuevo sessionId:", newSessionId);
  return { sessionId: newSessionId };
};
// --- Fin de la simulación ---

const MainLayout = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [localSessionId, setLocalSessionId] = useState(() => {
    try {
      return sessionId || window.localStorage.getItem('wally_session_id') || null;
    } catch {
      return sessionId || null;
    }
  });

  useEffect(() => {
    const initializeSession = async () => {
      try {
        if (!sessionId) {
          // No hay ID en la URL: crear uno y guardarlo, además de intentar redirigir.
          const { sessionId: newSessionId } = await createNewSession();
          setLocalSessionId(newSessionId);
          try {
            window.localStorage.setItem('wally_session_id', newSessionId);
          } catch { void 0; }
          // Intentar navegar, pero no depender de ello para continuar
          try {
            navigate(`/solicitud/${newSessionId}`, { replace: true });
          } catch (navErr) {
            logger.warn('Navegación fallida, continuando con session local:', navErr);
          }
          setIsSessionReady(true);
        } else {
          // Ya tenemos un sessionId en la URL
          try {
            window.localStorage.setItem('wally_session_id', sessionId);
          } catch { void 0; }
          setLocalSessionId(sessionId);
          setIsSessionReady(true);
        }
      } catch (error) {
        logger.error('Error crítico al crear la sesión:', error);
        // Permitir continuar con una sesión temporal si algo falla
        const fallbackId = `tmp-${Date.now()}`;
        setLocalSessionId(fallbackId);
        setIsSessionReady(true);
      }
    };

    initializeSession();
  }, [sessionId, navigate]);

  if (!isSessionReady) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Iniciando solicitud segura...</h2>
      </div>
    );
  }

  // Cuando la sesión está lista, renderizamos el componente que contiene el formulario.
  return (
    <main>
      {localSessionId && String(localSessionId).startsWith('tmp-') && (
        <div style={{ padding: '12px 16px', background: '#fff3cd', color: '#664d03', margin: '8px 16px', borderRadius: 8 }}>
          No se pudo crear la sesión en el servidor. Usando sesión temporal.
        </div>
      )}
      <ApplicationView sessionId={localSessionId || sessionId} />
    </main>
  );
};

export default MainLayout;