import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Asumimos que el componente del formulario se llama 'ApplicationView.jsx'
// y lo crearemos en la carpeta 'src/views/'.
import ApplicationView from '../views/ApplicationView';

// --- Simulación de la API del Orquestador ---
const createNewSession = async () => {
  console.log("Arquitecto: Solicitando nueva sesión al Orquestador...");
  const newSessionId = crypto.randomUUID();
  console.log("Arquitecto: Orquestador respondió con nuevo sessionId:", newSessionId);
  return { sessionId: newSessionId };
};
// --- Fin de la simulación ---

const MainLayout = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    const initializeSession = async () => {
      if (!sessionId) {
        // Si no hay sessionId en la URL, creamos una y redirigimos.
        try {
          const { sessionId: newSessionId } = await createNewSession();
          navigate(`/solicitud/${newSessionId}`, { replace: true });
        } catch (error) {
          console.error("Error crítico al crear la sesión:", error);
        }
      } else {
        // Si ya tenemos un sessionId en la URL, estamos listos.
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
      <ApplicationView sessionId={sessionId} />
    </main>
  );
};

export default MainLayout;