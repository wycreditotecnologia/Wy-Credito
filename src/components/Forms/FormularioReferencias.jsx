import React, { useState, useRef, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const FormularioReferencias = ({ sessionId, onStepComplete, onProgressUpdate }) => {
  // Estado: referencias como array de objetos (JSONB-ready)
  const [referencias, setReferencias] = useState([
    { nombre: '', contacto: '' },
    { nombre: '', contacto: '' }
  ]);
  const [showSecondRef, setShowSecondRef] = useState(false);

  // Estados para manejo de UI
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Refs para navegación por teclado
  const ref1NombreRef = useRef(null);
  const ref1ContactoRef = useRef(null);
  const ref2NombreRef = useRef(null);
  const ref2ContactoRef = useRef(null);
  const inputRefs = [ref1NombreRef, ref1ContactoRef, ref2NombreRef, ref2ContactoRef];

  useEffect(() => {
    // Enfocar primer campo al montar
    ref1NombreRef.current?.focus();
  }, []);

  // Reportar progreso del paso al montar
  useEffect(() => {
    if (typeof onProgressUpdate === 'function') {
      // 2 referencias (nombre + contacto) => 4 interacciones
      onProgressUpdate({ currentQuestion: 1, totalQuestions: 4 });
    }
  }, [onProgressUpdate]);

  // Manejo de cambios por referencia e input
  const handleRefChange = (index, field, value) => {
    setReferencias(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });

    // Limpiar error del campo específico
    const key = `ref_${index}_${field}`;
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  // Validación de contacto: email válido o teléfono con ≥7 dígitos
  const isValidContact = (value) => {
    const v = String(value || '').trim();
    if (!v) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const digits = v.replace(/\D/g, '');
    const looksLikeEmail = emailRegex.test(v);
    const looksLikePhone = digits.length >= 7;
    return looksLikeEmail || looksLikePhone;
  };

  // Función de validación
  const validateForm = () => {
    const newErrors = {};

    // Ref 1: obligatorio nombre y contacto válido
    const r1 = referencias[0];
    if (!String(r1.nombre || '').trim()) {
      newErrors.ref_0_nombre = 'El nombre de la referencia 1 es obligatorio';
    }
    if (!String(r1.contacto || '').trim()) {
      newErrors.ref_0_contacto = 'El contacto de la referencia 1 es obligatorio';
    } else if (!isValidContact(r1.contacto)) {
      newErrors.ref_0_contacto = 'Ingrese un email válido o un teléfono (≥7 dígitos)';
    }

    // Ref 2: opcional, valida solo si el usuario llenó alguno
    const r2 = referencias[1];
    const r2HasAny = Boolean(String(r2.nombre || '').trim() || String(r2.contacto || '').trim());
    if (showSecondRef && r2HasAny) {
      if (!String(r2.nombre || '').trim()) {
        newErrors.ref_1_nombre = 'El nombre de la referencia 2 es obligatorio si la añade';
      }
      if (!String(r2.contacto || '').trim()) {
        newErrors.ref_1_contacto = 'El contacto de la referencia 2 es obligatorio si la añade';
      } else if (!isValidContact(r2.contacto)) {
        newErrors.ref_1_contacto = 'Ingrese un email válido o un teléfono (≥7 dígitos)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para enviar el formulario
  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Construir array de referencias completas para JSONB
      const referenciasPayload = referencias
        .filter(r => String(r.nombre || '').trim() && String(r.contacto || '').trim() && isValidContact(r.contacto))
        .map(r => ({ nombre: r.nombre.trim(), contacto: r.contacto.trim() }));

      // Normalizar a campos mapeados por el orquestador (nombre/telefono referencia 1 y 2)
      const stepData = {};
      if (referenciasPayload[0]) {
        stepData.nombre_referencia_1 = referenciasPayload[0].nombre;
        stepData.telefono_referencia_1 = referenciasPayload[0].contacto;
      }
      if (referenciasPayload[1]) {
        stepData.nombre_referencia_2 = referenciasPayload[1].nombre;
        stepData.telefono_referencia_2 = referenciasPayload[1].contacto;
      }

      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_form_step',
          sessionId,
          payload: { currentStep: 4, stepData },
        })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      console.log('Respuesta del orquestador:', result);

      // Notificar al componente padre que el paso se completó
      if (onStepComplete) {
        onStepComplete(4);
      }

    } catch (error) {
      console.error('Error al enviar referencias:', error);
      setSubmitError('Error al enviar la información. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestor Enter con salto dinámico a próximo campo visible
  const handleKeyDown = (event, currentIndex) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      // Buscar el siguiente ref montado
      for (let i = currentIndex + 1; i < inputRefs.length; i++) {
        const next = inputRefs[i]?.current;
        if (next) {
          next.focus();
          return;
        }
      }
      // Si no hay siguiente visible, enviar
      handleSubmit();
    }
  };

  return (
    <div className="max-w-[800px] mx-auto p-3">
      <div className="mt-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-6">Paso 4: Referencias Comerciales</h1>
        <p className="text-muted-foreground text-center mb-6">
          Proporcione información de dos referencias comerciales que puedan dar testimonio 
          de la actividad y reputación de su empresa.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          {/* Referencia 1 */}
        <h3 className="text-xl font-semibold border-b pb-2 mt-12 mb-6">Referencia Comercial #1</h3>
          
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-6">
              <div className="mb-6">
                <Label htmlFor="ref1_nombre">Nombre Completo - Referencia 1</Label>
                <Input
                  id="ref1_nombre"
                  value={referencias[0].nombre}
                  onChange={(e) => handleRefChange(0, 'nombre', e.target.value)}
                  placeholder="Ej: Juan Carlos Pérez"
                  ref={ref1NombreRef}
                  onKeyDown={(e) => handleKeyDown(e, 0)}
                />
                {errors.ref_0_nombre && (
                  <p className="text-sm text-destructive mt-1">{errors.ref_0_nombre}</p>
                )}
              </div>
            </div>
            
            <div className="col-span-12 md:col-span-6">
              <div className="mb-6">
                <Label htmlFor="ref1_contacto">Teléfono o Email - Referencia 1</Label>
                <Input
                  id="ref1_contacto"
                  value={referencias[0].contacto}
                  onChange={(e) => handleRefChange(0, 'contacto', e.target.value)}
                  placeholder="Ej: 300 123 4567 o correo@ejemplo.com"
                  ref={ref1ContactoRef}
                  onKeyDown={(e) => handleKeyDown(e, 1)}
                />
                {errors.ref_0_contacto && (
                  <p className="text-sm text-destructive mt-1">{errors.ref_0_contacto}</p>
                )}
              </div>
            </div>
          </div>

          {/* Botón para añadir otra referencia (opcional) */}
          {!showSecondRef && (
            <div className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowSecondRef(true)}>
                Añadir otra referencia
              </Button>
            </div>
          )}

          {/* Referencia 2 opcional */}
          {showSecondRef && (
            <>
              <div className="flex items-center justify-between mt-12">
                <h3 className="text-xl font-semibold border-b pb-2 mb-6">Referencia Comercial #2 (opcional)</h3>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setReferencias(prev => [{ ...prev[0] }, { nombre: '', contacto: '' }]);
                    setErrors(prev => ({ ...prev, ref_1_nombre: '', ref_1_contacto: '' }));
                    setShowSecondRef(false);
                  }}
                >
                  Quitar
                </Button>
              </div>
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-6">
                  <div className="mb-6">
                    <Label htmlFor="ref2_nombre">Nombre Completo - Referencia 2</Label>
                    <Input
                      id="ref2_nombre"
                      value={referencias[1].nombre}
                      onChange={(e) => handleRefChange(1, 'nombre', e.target.value)}
                      placeholder="Ej: María Elena Rodríguez"
                      ref={ref2NombreRef}
                      onKeyDown={(e) => handleKeyDown(e, 2)}
                    />
                    {errors.ref_1_nombre && (
                      <p className="text-sm text-destructive mt-1">{errors.ref_1_nombre}</p>
                    )}
                  </div>
                </div>
                
                <div className="col-span-12 md:col-span-6">
                  <div className="mb-6">
                    <Label htmlFor="ref2_contacto">Teléfono o Email - Referencia 2</Label>
                    <Input
                      id="ref2_contacto"
                      value={referencias[1].contacto}
                      onChange={(e) => handleRefChange(1, 'contacto', e.target.value)}
                      placeholder="Ej: 301 987 6543 o correo@ejemplo.com"
                      ref={ref2ContactoRef}
                      onKeyDown={(e) => handleKeyDown(e, 3)}
                    />
                    {errors.ref_1_contacto && (
                      <p className="text-sm text-destructive mt-1">{errors.ref_1_contacto}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Error de envío */}
          {submitError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Botón de envío */}
          <div className="mt-12 text-center">
            <Button type="submit" disabled={isSubmitting} className="bg-black text-white hover:bg-black/80">
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 w-5 h-5" />
                  Enviando...
                </>
              ) : (
                'Guardar y Continuar'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioReferencias;