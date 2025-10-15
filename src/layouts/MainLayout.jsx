import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// Asumimos que el componente del formulario se llama 'ApplicationView.jsx'
// y lo crearemos en la carpeta 'src/views/'.
import ApplicationView from '../views/ApplicationView';
import StepHeader from '@/components/StepHeader';
import ProgressBar from '@/components/ProgressBar';
// Eliminado StepNavigation: los controles flotantes ya no son necesarios

// --- Cliente del Orquestador en backend (Vercel function) ---
const createNewSession = async () => {
  console.log("Arquitecto: Solicitando nueva sesión al Orquestador...");
  const res = await fetch('/api/orchestrator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'start' })
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || 'Error creando sesión');
  }
  console.log("Arquitecto: Orquestador respondió con nuevo sessionId:", json.sessionId);
  return { sessionId: json.sessionId };
};
// --- Fin del cliente ---

const MainLayout = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [isSessionReady, setIsSessionReady] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      navigate('/login');
    }
  };

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

  // Estado principal de paso actual (compartido con ApplicationView)
  const [currentStep, setCurrentStep] = useState(1);
  const [stepProgress, setStepProgress] = useState({ currentQuestion: 1, totalQuestions: 1 });
  const steps = [
    { id: 1, label: 'Consentimiento y Contacto' },
    { id: 2, label: 'Información Empresarial' },
    { id: 3, label: 'Documentación Legal' },
    { id: 4, label: 'Información Financiera' },
    { id: 5, label: 'Referencias Comerciales' },
    { id: 6, label: 'Declaraciones y Aceptación' },
    { id: 7, label: 'Garantía' },
    { id: 8, label: 'Resumen Final' },
  ];

  // Cálculo del progreso total: debe estar antes de cualquier return condicional
  const totalSteps = steps.length;

  const totalProgress = useMemo(() => {
    if (!totalSteps) return 0;

    const completedStepsProgress = ((currentStep - 1) / totalSteps);

    // Evitar división por cero si totalQuestions no está definido o es 0
    const safeTotalQuestions = Math.max(1, stepProgress.totalQuestions || 1);
    const currentStepProgressContribution = (1 / totalSteps) * (stepProgress.currentQuestion / safeTotalQuestions);

    const progress = (completedStepsProgress + currentStepProgressContribution) * 100;

    return Math.min(progress, 100);
  }, [currentStep, totalSteps, stepProgress]);

  if (!isSessionReady) {
    return (
      <div className="min-h-screen w-full bg-gray-100 text-gray-900 flex items-center justify-center">
        <h2 className="text-lg font-semibold text-gray-800">Iniciando solicitud segura...</h2>
      </div>
    );
  }

  // Cuando la sesión está lista, renderizamos el layout con header blanco y contenido centrado.
  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col overflow-x-hidden">
      {/* Header superior con marca y stepper */}
      <header className="bg-white pt-3 sm:pt-4">
        <div className="w-full px-2 sm:px-4 md:px-6 h-[75px] flex items-center justify-center sm:justify-between">
          <div className="sm:hidden flex items-center text-gray-900 font-semibold" aria-live="polite">
            <span className="text-xs text-gray-800">{currentStep} de {steps.length}</span>
            <span className="ml-2 text-xs text-gray-600">{steps[currentStep - 1]?.label}</span>
          </div>
          <div className="hidden sm:block w-full max-w-full">
            <StepHeader
              stepNumber={currentStep}
              stepTitle={steps[currentStep - 1]?.label || ''}
              currentQuestion={stepProgress.currentQuestion}
              totalQuestions={stepProgress.totalQuestions}
            />
            <div className="pt-2">
              <ProgressBar progress={totalProgress} />
            </div>
          </div>
          <div className="hidden sm:flex items-center ml-4">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-gray-100"
              aria-label="Cerrar Sesión"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main: agrega padding externo para mostrar borde blanco alrededor del contenido */}
      <main className="flex-1 w-full h-full p-[25px]">
        <ApplicationView
          sessionId={sessionId}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onProgressUpdate={setStepProgress}
        />
      </main>
    </div>
  );
};

export default MainLayout;