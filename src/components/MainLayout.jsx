import React, { useState, useEffect } from 'react';
import { Stepper, Step, StepLabel } from '@mui/material';

// Importar todos los componentes de formulario
import FormularioEmpresa from './forms/FormularioEmpresa';
import FormularioFinanciero from './forms/FormularioFinanciero';
import FormularioDocumentacion from './forms/FormularioDocumentacion';
import FormularioReferencias from './forms/FormularioReferencias';
import FormularioAceptacion from './forms/FormularioAceptacion';
import FormularioGarantia from './forms/FormularioGarantia';
import PantallaResumen from './forms/PantallaResumen';

// Importar el orquestador
import OrquestadorWally from '../services/orquestador';

// Contenedores con Tailwind (se sustituyen Container/Paper/Box por divs)

const StyledStepper = styled(Stepper)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiStepLabel-root': {
    '& .MuiStepLabel-label': {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
  },
  '& .MuiStepIcon-root': {
    fontSize: '1.5rem',
    '&.Mui-active': {
      color: '#667eea',
    },
    '&.Mui-completed': {
      color: '#4caf50',
    },
  },
}));

// Definición de los 7 pasos del flujo completo
const steps = [
  { id: 1, label: 'Información Empresarial', component: 'empresa' },
  { id: 2, label: 'Documentación Legal', component: 'documentacion' },
  { id: 3, label: 'Información Financiera', component: 'financiero' },
  { id: 4, label: 'Referencias Comerciales', component: 'referencias' },
  { id: 5, label: 'Declaraciones y Aceptación', component: 'aceptacion' },
  { id: 6, label: 'Garantía', component: 'garantia' },
  { id: 7, label: 'Resumen Final', component: 'resumen' }
];

const MainLayout = () => {
  // Estados principales
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [orquestador] = useState(new OrquestadorWally());

  // Inicializar sesión al montar el componente
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      setLoading(true);
      // Generar un ID de sesión único
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      
      // Crear registro inicial en la base de datos
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'init',
          sessionId: newSessionId
        })
      });

      if (!response.ok) {
        throw new Error('Error inicializando sesión');
      }

      console.log('✅ Sesión inicializada:', newSessionId);
    } catch (error) {
      console.error('❌ Error inicializando sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para avanzar al siguiente paso
  const handleNext = async (stepData = {}) => {
    try {
      setLoading(true);
      
      // Actualizar datos del formulario
      const updatedFormData = { ...formData, ...stepData };
      setFormData(updatedFormData);

      // Guardar datos del paso actual
      if (Object.keys(stepData).length > 0) {
        const response = await fetch('/api/orchestrator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'submit_form_step',
            sessionId: sessionId,
            stepData: stepData,
            currentStep: currentStep
          })
        });

        if (!response.ok) {
          throw new Error('Error guardando datos del paso');
        }
      }

      // Avanzar al siguiente paso si no estamos en el último
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }

    } catch (error) {
      console.error('❌ Error en handleNext:', error);
      alert('Error guardando los datos. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para retroceder al paso anterior
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Función para obtener datos del resumen
  const getSummaryData = async () => {
    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_summary_data',
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Error obteniendo datos del resumen');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('❌ Error obteniendo datos del resumen:', error);
      return null;
    }
  };

  // Función para completar el envío
  const completeSubmission = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_submission',
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Error completando el envío');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Error completando el envío:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Renderizar el componente del paso actual
  const renderStepComponent = () => {
    const currentStepData = steps.find(step => step.id === currentStep);
    
    if (!currentStepData) {
      return <p className="text-sm">Paso no encontrado</p>;
    }

    const commonProps = {
      onNext: handleNext,
      onBack: handleBack,
      formData: formData,
      loading: loading,
      sessionId: sessionId,
      isFirstStep: currentStep === 1,
      isLastStep: currentStep === steps.length
    };

    switch (currentStepData.component) {
      case 'empresa':
        return <FormularioEmpresa {...commonProps} />;
      
      case 'documentacion':
        return <FormularioDocumentacion {...commonProps} />;
      
      case 'financiero':
        return <FormularioFinanciero {...commonProps} />;
      
      case 'referencias':
        return <FormularioReferencias {...commonProps} />;
      
      case 'aceptacion':
        return <FormularioAceptacion {...commonProps} />;
      
      case 'garantia':
        return <FormularioGarantia {...commonProps} />;
      
      case 'resumen':
        return (
          <PantallaResumen 
            {...commonProps}
            getSummaryData={getSummaryData}
            completeSubmission={completeSubmission}
          />
        );
      
      default:
        return <p className="text-sm">Componente no encontrado</p>;
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen pt-4 pb-4 bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="max-w-5xl mx-auto rounded-2xl shadow-2xl bg-white/95 backdrop-blur p-6">
          <div className="flex justify-center items-center min-h-[200px]">
            <h6 className="text-base font-semibold">Inicializando aplicación...</h6>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-4 pb-4 bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="max-w-5xl mx-auto rounded-2xl shadow-2xl bg-white/95 backdrop-blur p-6">
        {/* Header con título */}
        <div className="text-center mb-4">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2"
          >
            Solicitud de Crédito Empresarial
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete todos los pasos para enviar su solicitud
          </p>
        </div>

        {/* Stepper de progreso */}
        <StyledStepper activeStep={currentStep - 1} alternativeLabel>
          {steps.map((step) => (
            <Step key={step.id}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </StyledStepper>

        {/* Indicador de paso actual */}
        <div className="text-center mb-3">
          <h6 className="text-base font-semibold text-primary">
            Paso {currentStep} de {steps.length}: {steps.find(s => s.id === currentStep)?.label}
          </h6>
        </div>

        {/* Contenido del paso actual */}
        <div>
          {renderStepComponent()}
        </div>

        {/* Footer con información de sesión (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 rounded">
            <p className="text-xs text-muted-foreground">
              Sesión: {sessionId} | Paso: {currentStep}/{steps.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;