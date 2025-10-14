import React, { useState, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepEmpresa_Typeform from '@/components/forms/typeform/StepEmpresa_Typeform';
import StepDocumentacion_Typeform from '@/components/forms/typeform/StepDocumentacion_Typeform';
import StepFinanciero_Typeform from '@/components/forms/typeform/StepFinanciero_Typeform';
import StepReferencias_Typeform from '@/components/forms/typeform/StepReferencias_Typeform';
import StepAceptacion_Typeform from '@/components/forms/typeform/StepAceptacion_Typeform';
import StepGarantia_Typeform from '@/components/forms/typeform/StepGarantia_Typeform';
import StepResumen_Typeform from '@/components/forms/typeform/StepResumen_Typeform';
import { Label } from '@/components/ui/label';
import PantallaExito from '../components/forms/PantallaExito';
import FormularioInicial from '../components/Forms/FormularioInicial';

// Importar los componentes de formulario (lazy)
const FormularioEmpresaTypeform = React.lazy(() => import('../components/forms/FormularioEmpresaTypeform'));
const FormularioFinanciero = React.lazy(() => import('../components/forms/FormularioFinanciero'));
const FormularioDocumentacion = React.lazy(() => import('../components/forms/FormularioDocumentacion'));
const FormularioReferencias = React.lazy(() => import('../components/forms/FormularioReferencias'));
const FormularioAceptacion = React.lazy(() => import('../components/forms/FormularioAceptacion'));
const FormularioGarantia = React.lazy(() => import('../components/forms/FormularioGarantia'));
const PantallaResumen = React.lazy(() => import('../components/forms/PantallaResumen'));

// Definición de los pasos del flujo (incluye paso inicial)
const steps = [
  { id: 1, label: 'Consentimiento y Contacto', component: 'inicial' },
  { id: 2, label: 'Información Empresarial', component: 'empresa' },
  { id: 3, label: 'Documentación Legal', component: 'documentacion' },
  { id: 4, label: 'Información Financiera', component: 'financiero' },
  { id: 5, label: 'Referencias Comerciales', component: 'referencias' },
  { id: 6, label: 'Declaraciones y Aceptación', component: 'aceptacion' },
  { id: 7, label: 'Garantía', component: 'garantia' },
  { id: 8, label: 'Resumen Final', component: 'resumen' },
  { id: 9, label: 'Completado', component: 'exito' },
];

const ApplicationView = ({ sessionId, onProgressUpdate, currentStep, setCurrentStep }) => {
  const [formData, setFormData] = useState({});

  // Normaliza las claves del UI hacia las columnas esperadas por Supabase
  const normalizeStepData = (data) => {
    const keyMap = {
      razonSocial: 'razon_social',
      valor_estimado: 'valor_estimado_garantia',
      referencia1_nombre: 'nombre_referencia_1',
      referencia1_contacto: 'telefono_referencia_1',
      tipoDocumentoRepresentante: 'tipo_documento_rl',
      url_documento_financiero: 'url_estados_financieros',
      aceptacion_terminos: 'consentimiento_datos',
      // Mapeos del paso inicial
      nombreCompleto: 'solicitante_nombre_completo',
      email: 'solicitante_email',
      telefono: 'solicitante_telefono',
      aceptaGuardado: 'consentimiento_guardado_progresivo',
    };
    const normalized = {};
    for (const k in data) {
      const mapped = keyMap[k] || k;
      normalized[mapped] = data[k];
    }
    return normalized;
  };

  const handleStepComplete = async (stepData) => {
    try {
      // Actualiza estado local con los datos originales del UI
      if (stepData && typeof stepData === 'object') {
        setFormData((prev) => ({ ...prev, ...stepData }));
      }

      // Normaliza y envía a la API del orquestador para persistir en Supabase
      const normalized = normalizeStepData(stepData || {});
      if (sessionId && Object.keys(normalized).length > 0) {
        const response = await fetch('/api/orchestrator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'submit_form_step',
            sessionId,
            payload: { currentStep, stepData: normalized },
          }),
        });
        const result = await response.json();
        if (!response.ok || result.success === false) {
          // Si hay error, continúa el flujo pero registra en consola
          console.error('Error al guardar datos del paso:', result.error);
        }
        // Usa el siguiente paso sugerido si existe
        const next = (result && result.nextStep) ? result.nextStep : currentStep + 1;
        setCurrentStep(Math.min(next, steps.length));
      } else {
        // Si no hay sessionId o no hay datos, avanza normalmente
        setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      }
    } catch (err) {
      console.error('Error en handleStepComplete:', err);
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  // Pantalla de éxito se externaliza y muestra el código de seguimiento

  const renderCurrentStep = () => {
    const key = `step-${currentStep}`;
    const MotionWrapper = ({ children }) => (
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {children}
      </motion.div>
    );

    switch (currentStep) {
      case 1:
        // Nuevo paso inicial: consentimiento y datos de contacto
        return (
          <FormularioInicial
            onComplete={handleStepComplete}
            sessionId={sessionId}
            onProgressUpdate={onProgressUpdate}
          />
        );
      case 2:
        // Renderiza el 'Jefe de Paso' para Información Empresarial
        return <StepEmpresa_Typeform onComplete={handleStepComplete} onProgressUpdate={onProgressUpdate} />;
      case 3:
        // Renderiza el 'Jefe de Paso' para Documentación Legal
        return <StepDocumentacion_Typeform onComplete={handleStepComplete} onProgressUpdate={onProgressUpdate} />;
      case 4:
        // Renderiza el 'Jefe de Paso' para Información Financiera
        return <StepFinanciero_Typeform onComplete={handleStepComplete} sessionId={sessionId} onProgressUpdate={onProgressUpdate} />;
      case 5:
        // Renderiza el 'Jefe de Paso' para Referencias Comerciales
        return <StepReferencias_Typeform onComplete={handleStepComplete} onProgressUpdate={onProgressUpdate} />;
      case 6:
        // Renderiza el 'Jefe de Paso' para Declaraciones y Aceptación
        return <StepAceptacion_Typeform onComplete={handleStepComplete} onProgressUpdate={onProgressUpdate} />;
      case 7:
        // Renderiza el 'Jefe de Paso' para Garantía
        return <StepGarantia_Typeform onComplete={handleStepComplete} onProgressUpdate={onProgressUpdate} />;
      case 8:
        // Renderiza el 'Jefe de Paso' para Resumen Final
        return <StepResumen_Typeform formData={formData} onComplete={handleStepComplete} sessionId={sessionId} onProgressUpdate={onProgressUpdate} />;
      case 9:
        // Pantalla de éxito final con código de seguimiento
        return <PantallaExito sessionId={sessionId} />;
      default: {
        const current = steps.find((s) => s.id === currentStep);
        if (!current) return <div>Paso no encontrado</div>;
        const commonProps = {
          onStepComplete: () => setCurrentStep((prev) => Math.min(prev + 1, steps.length)),
          formData,
          sessionId,
          hideLocalActions: true,
          onProgressUpdate,
        };
        let componentEl = null;
        switch (current.component) {
          case 'empresa':
            componentEl = <FormularioEmpresaTypeform {...commonProps} />;
            break;
          case 'documentacion':
            componentEl = <FormularioDocumentacion {...commonProps} />;
            break;
          case 'financiero':
            componentEl = <FormularioFinanciero {...commonProps} />;
            break;
          case 'referencias':
            componentEl = <FormularioReferencias {...commonProps} />;
            break;
          case 'aceptacion':
            componentEl = <FormularioAceptacion {...commonProps} />;
            break;
          case 'garantia':
            componentEl = <FormularioGarantia {...commonProps} />;
            break;
          case 'resumen':
            componentEl = <PantallaResumen {...commonProps} />;
            break;
          default:
            componentEl = <div>Paso no encontrado</div>;
        }
        return <MotionWrapper>{componentEl}</MotionWrapper>;
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-75px-75px)] bg-gray-100 text-slate-900 dark:bg-slate-950 dark:text-white p-6 sm:p-8 md:px-[200px] md:py-[75px] - rounded-[15px] overflow-hidden">

      {/* ===== CONTENEDOR CENTRAL ===== */}
      <div className="w-full h-full">
        {/* Contenido del formulario */}
        <main>
          {renderCurrentStep()}
        </main>
      </div>
    </div>
  );
};

export default ApplicationView;