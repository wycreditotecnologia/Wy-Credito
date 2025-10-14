import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

const FormularioAceptacion = ({ sessionId, onStepComplete, onProgressUpdate }) => {
  // Estado para los checkboxes
  const [acceptances, setAcceptances] = useState({
    consentimiento_datos: false,
    declaracion_veracidad: false,
    declaracion_origen_fondos: false
  });

  // Estados para manejo de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Reportar progreso del paso al montar
  useEffect(() => {
    if (typeof onProgressUpdate === 'function') {
      // 3 declaraciones principales
      onProgressUpdate({ currentQuestion: 1, totalQuestions: 3 });
    }
  }, [onProgressUpdate]);

  // Función para manejar cambios en los checkboxes
  const handleCheckboxChange = (field) => (event) => {
    setAcceptances(prev => ({
      ...prev,
      [field]: event.target.checked
    }));

    // Limpiar errores cuando el usuario interactúe
    if (validationError) {
      setValidationError('');
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  // Función de validación
  const validateForm = () => {
    const { consentimiento_datos, declaracion_veracidad, declaracion_origen_fondos } = acceptances;
    if (!consentimiento_datos || !declaracion_veracidad || !declaracion_origen_fondos) {
      setValidationError('Debe aceptar las 3 declaraciones para continuar.');
      return false;
    }
    setValidationError('');
    return true;
  };

  // Función para enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Preparar payload para el orquestador con currentStep/stepData
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit_form_step',
          sessionId: sessionId,
          payload: {
            currentStep: 5,
            stepData: {
              consentimiento_datos: acceptances.consentimiento_datos,
              declaracion_veracidad: acceptances.declaracion_veracidad,
              declaracion_origen_fondos: acceptances.declaracion_origen_fondos
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      console.log('Respuesta del orquestador:', result);

      // Notificar al componente padre que el paso se completó
      if (onStepComplete) {
        onStepComplete(5);
      }

    } catch (error) {
      console.error('Error al enviar declaraciones:', error);
      setSubmitError('Error al enviar la información. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-4">
      <div className="mt-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-center">
          Paso 5: Declaraciones y Aceptación
        </h1>

        <p className="text-muted-foreground text-center mt-6">
          Para completar su solicitud, debe leer y aceptar las siguientes declaraciones
          y términos de servicio.
        </p>

        <Separator className="my-8" />

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Consentimiento: Tratamiento de datos personales */}
          <div className="flex items-start gap-3">
            <input
              id="consentimiento_datos"
              type="checkbox"
              checked={acceptances.consentimiento_datos}
              onChange={handleCheckboxChange('consentimiento_datos')}
              className="mt-0.5 h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div>
              <Label htmlFor="consentimiento_datos" className="text-sm font-medium">
                Consentimiento de tratamiento de datos personales.
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Autorizo el tratamiento de mis datos según la política de privacidad.
              </p>
            </div>
          </div>

          {/* Declaración: Veracidad de la información */}
          <div className="flex items-start gap-3">
            <input
              id="declaracion_veracidad"
              type="checkbox"
              checked={acceptances.declaracion_veracidad}
              onChange={handleCheckboxChange('declaracion_veracidad')}
              className="mt-0.5 h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div>
              <Label htmlFor="declaracion_veracidad" className="text-sm font-medium">
                Declaración de veracidad de la información.
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Confirmo que la información suministrada es veraz y completa.
              </p>
            </div>
          </div>

          {/* Declaración: Origen de los fondos */}
          <div className="flex items-start gap-3">
            <input
              id="declaracion_origen_fondos"
              type="checkbox"
              checked={acceptances.declaracion_origen_fondos}
              onChange={handleCheckboxChange('declaracion_origen_fondos')}
              className="mt-0.5 h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div>
              <Label htmlFor="declaracion_origen_fondos" className="text-sm font-medium">
                Declaración sobre el origen de los fondos.
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Afirmo que los fondos provienen de actividades lícitas y verificables.
              </p>
            </div>
          </div>

          {/* Error de validación */}
          {validationError && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Aviso</AlertTitle>
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Error de envío */}
          {submitError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

        <Separator className="my-8" />

          {/* Botón de envío */}
          <div className="text-center mt-12">
            {/* Deshabilitar hasta que los 3 consentimientos estén marcados */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !(acceptances.consentimiento_datos && acceptances.declaracion_veracidad && acceptances.declaracion_origen_fondos)}
              className="min-w-[250px]"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 w-5 h-5" />
                  Finalizando Solicitud...
                </>
              ) : (
                'Finalizar Solicitud de Crédito'
              )}
            </Button>

            <p className="text-sm text-muted-foreground mt-6">
              Al hacer clic en "Finalizar", su solicitud será enviada para evaluación.
            </p>
          </div>
          </form>
        </div>
      </div>
  );
};

export default FormularioAceptacion;