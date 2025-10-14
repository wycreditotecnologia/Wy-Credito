import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import TypeformQuestion from '@/components/ui/TypeformQuestion';
import {
  Business as BusinessIcon,
  Language as WebIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
} from '@mui/icons-material';

const FormularioEmpresaTypeform = ({ onStepComplete, sessionId, registerStepActions, hideLocalActions }) => {
  const [formData, setFormData] = useState({
    nit: '',
    razonSocial: '',
    tipoEmpresa: '',
    paginaWeb: '',
    redesSociales: { facebook: '', instagram: '', linkedin: '', twitter: '' },
    autorizacionConsulta: false,
    habeasData: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);

  // Opciones para tipo de empresa
  const tiposEmpresa = [
    { value: 'sas', label: 'Sociedad por Acciones Simplificada (SAS)' },
    { value: 'sa', label: 'Sociedad Anónima (SA)' },
    { value: 'ltda', label: 'Sociedad de Responsabilidad Limitada (LTDA)' },
    { value: 'colectiva', label: 'Sociedad Colectiva' },
    { value: 'comandita_simple', label: 'Sociedad en Comandita Simple' },
    { value: 'comandita_acciones', label: 'Sociedad en Comandita por Acciones' },
    { value: 'empresa_unipersonal', label: 'Empresa Unipersonal' },
    { value: 'persona_natural', label: 'Persona Natural' },
  ];

  // Determinar columnas segun cantidad de opciones
  const columnasTipoEmpresa = tiposEmpresa.length >= 8 ? 'md:grid-cols-3' : 'md:grid-cols-2';

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nit.trim()) {
      newErrors.nit = 'El NIT es obligatorio';
    } else if (!/^\d{9,11}$/.test(formData.nit.replace(/[.-]/g, ''))) {
      newErrors.nit = 'El NIT debe tener entre 9 y 11 dígitos';
    }
    if (!formData.razonSocial.trim()) {
      newErrors.razonSocial = 'La razón social es obligatoria';
    } else if (formData.razonSocial.trim().length < 3) {
      newErrors.razonSocial = 'La razón social debe tener al menos 3 caracteres';
    }
    if (!formData.tipoEmpresa) {
      newErrors.tipoEmpresa = 'Debe seleccionar el tipo de empresa';
    }
    if (formData.paginaWeb && !/^https?:\/\/.+\..+/.test(formData.paginaWeb)) {
      newErrors.paginaWeb = 'Ingrese una URL válida (ej: https://www.ejemplo.com)';
    }
    if (!formData.autorizacionConsulta) {
      newErrors.autorizacionConsulta = 'Debe autorizar la consulta en centrales de riesgo';
    }
    if (!formData.habeasData) {
      newErrors.habeasData = 'Debe aceptar el tratamiento de datos personales';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCurrentQuestion = () => {
    const newErrors = {};
    switch (questionIndex) {
      case 0: {
        if (!formData.razonSocial.trim()) {
          newErrors.razonSocial = 'La razón social es obligatoria';
        } else if (formData.razonSocial.trim().length < 3) {
          newErrors.razonSocial = 'La razón social debe tener al menos 3 caracteres';
        }
        break;
      }
      case 1: {
        if (!formData.nit.trim()) {
          newErrors.nit = 'El NIT es obligatorio';
        } else {
          const nitClean = formData.nit.replace(/[.-]/g, '');
          if (!/^\d{9,11}$/.test(nitClean)) {
            newErrors.nit = 'El NIT debe tener entre 9 y 11 dígitos';
          }
        }
        break;
      }
      case 2: {
        if (!formData.tipoEmpresa) {
          newErrors.tipoEmpresa = 'Debe seleccionar el tipo de empresa';
        }
        break;
      }
      case 3: {
        if (formData.paginaWeb && !/^https?:\/\/.+\..+/.test(formData.paginaWeb)) {
          newErrors.paginaWeb = 'Ingrese una URL válida (ej: https://www.ejemplo.com)';
        }
        break;
      }
      case 4: {
        if (!formData.autorizacionConsulta) {
          newErrors.autorizacionConsulta = 'Debe autorizar la consulta en centrales de riesgo';
        }
        if (!formData.habeasData) {
          newErrors.habeasData = 'Debe aceptar el tratamiento de datos personales';
        }
        break;
      }
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const totalQuestions = 5;

  const submitData = async () => {
    setSubmitError('');
    if (!validateForm()) return;
    if (!sessionId) {
      setSubmitError('Error: No se encontró una sesión activa. Por favor, reinicie el proceso.');
      return;
    }

    setLoading(true);
    try {
      const stepData = {
        nit: formData.nit.trim(),
        razon_social: formData.razonSocial.trim(),
        tipo_empresa: formData.tipoEmpresa,
        sitio_web: (formData.paginaWeb || '').trim() || null,
        autorizacion_consulta: formData.autorizacionConsulta,
        habeas_data: formData.habeasData,
      };

      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_form_step',
          sessionId,
          payload: { currentStep: 1, stepData }
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al enviar los datos');

      if (onStepComplete) onStepComplete(2);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setSubmitError(error.message || 'Error al enviar los datos. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    setSubmitError('');
    const ok = validateCurrentQuestion();
    if (!ok) return;
    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      await submitData();
    }
  };

  const handlePrevQuestion = () => {
    setSubmitError('');
    setErrors({});
    setQuestionIndex((i) => Math.max(0, i - 1));
  };

  // Avance con tecla Enter en campos de entrada
  const handleEnterKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNextQuestion();
    }
  };

  // Selección única con auto-avance
  const handleSelectChangeAndAdvance = (field, value) => {
    handleInputChange(field, value);
    // Esperar al siguiente tick para validar con estado actualizado
    setTimeout(() => {
      handleNextQuestion();
    }, 0);
  };

  useEffect(() => {
    if (registerStepActions) {
      registerStepActions({ onSaveContinue: handleNextQuestion });
    }
  }, [registerStepActions]);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {submitError && (
        <div className="w-full max-w-[720px] mx-auto px-4 sm:px-6">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        </div>
      )}

      {questionIndex === 0 && (
        <TypeformQuestion
          title="¿Cuál es la razón social de la empresa?"
          description="Escribe el nombre legal completo tal como aparece en el RUT."
          stepIndex={questionIndex}
          totalSteps={totalQuestions}
          showProgress={false}
          layout="single"
          onSaveContinue={handleNextQuestion}
          sessionId={sessionId}
          autoFit={false}
        >
          <div className="space-y-2 mb-6">
            <Label htmlFor="razonSocial" className="text-base">Razón Social</Label>
            <Input
              id="razonSocial"
              value={formData.razonSocial}
              onChange={(e) => handleInputChange('razonSocial', e.target.value)}
              onKeyDown={handleEnterKey}
              placeholder="Empresa Ejemplo S.A.S."
            />
            {errors.razonSocial && (
              <p className="text-sm text-destructive mt-2">{errors.razonSocial}</p>
            )}
          </div>
        </TypeformQuestion>
      )}

      {questionIndex === 1 && (
        <TypeformQuestion
          title="Ingrese el NIT de la empresa"
          description="Solo números, sin puntos ni guiones."
          stepIndex={questionIndex}
          totalSteps={totalQuestions}
          onPrev={handlePrevQuestion}
          showProgress={false}
          layout="single"
          onSaveContinue={handleNextQuestion}
          sessionId={sessionId}
          autoFit={false}
        >
          <div className="space-y-2 mb-6">
            <Label htmlFor="nit" className="text-base">NIT</Label>
            <div className="relative">
              <BusinessIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="nit"
                value={formData.nit}
                onChange={(e) => handleInputChange('nit', e.target.value)}
                onKeyDown={handleEnterKey}
                placeholder="123456789"
                className="pl-9"
              />
            </div>
            {errors.nit && (
              <p className="text-sm text-destructive mt-2">{errors.nit}</p>
            )}
          </div>
        </TypeformQuestion>
      )}

      {questionIndex === 2 && (
        <TypeformQuestion
          title="Seleccione el tipo de empresa"
          description="Elija la figura jurídica que corresponde."
          stepIndex={questionIndex}
          totalSteps={totalQuestions}
          onPrev={handlePrevQuestion}
          showProgress={false}
          layout="single"
          onSaveContinue={handleNextQuestion}
          sessionId={sessionId}
          autoFit={false}
        >
          <div className="mb-2">
            <Label className="text-base">Tipo de Empresa</Label>
          </div>
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${columnasTipoEmpresa} gap-3`}> 
            {tiposEmpresa.map((tipo) => {
              const selected = formData.tipoEmpresa === tipo.value;
              return (
                <Button
                  key={tipo.value}
                  type="button"
                  onClick={() => handleSelectChangeAndAdvance('tipoEmpresa', tipo.value)}
                  className={`justify-start h-auto py-3 px-4 text-left rounded-xl transition-all duration-150
                    ${selected ? 'border border-primary/60 ring-2 ring-primary/30 bg-primary/5' : 'border border-transparent hover:bg-muted/30'}
                    hover:-translate-y-[1px]`}
                  variant={selected ? 'default' : 'ghost'}
                >
                  {tipo.label}
                </Button>
              );
            })}
          </div>
          {errors.tipoEmpresa && (
            <p className="text-sm text-destructive mt-2">{errors.tipoEmpresa}</p>
          )}
        </TypeformQuestion>
      )}

      {questionIndex === 3 && (
        <TypeformQuestion
          title="Presencia digital (opcional)"
          description="Comparta su página web y redes sociales si las tiene."
          stepIndex={questionIndex}
          totalSteps={totalQuestions}
          onPrev={handlePrevQuestion}
          showProgress={false}
          layout="single"
          onSaveContinue={handleNextQuestion}
          sessionId={sessionId}
          autoFit={false}
        >
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <Label htmlFor="paginaWeb" className="text-base">Página Web</Label>
              <div className="relative mb-2">
                <WebIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="paginaWeb"
                  value={formData.paginaWeb}
                  onChange={(e) => handleInputChange('paginaWeb', e.target.value)}
                  onKeyDown={handleEnterKey}
                  placeholder="https://www.miempresa.com"
                  className="pl-9"
                />
              </div>
              {errors.paginaWeb && (
                <p className="text-sm text-destructive mt-2">{errors.paginaWeb}</p>
              )}
            </div>
            {/* Redes sociales eliminadas por optimización: no se persisten en Supabase */}
          </div>
        </TypeformQuestion>
      )}

      {questionIndex === 4 && (
        <TypeformQuestion
          title="Autorizaciones y consentimientos"
          description="Necesitamos tu autorización para continuar con el proceso."
          stepIndex={questionIndex}
          totalSteps={totalQuestions}
          onPrev={handlePrevQuestion}
          showProgress={false}
          layout="single"
          onSaveContinue={handleNextQuestion}
          sessionId={sessionId}
          autoFit={false}
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="autorizacion_consulta"
                checked={formData.autorizacionConsulta}
                onCheckedChange={(checked) => handleInputChange('autorizacionConsulta', Boolean(checked))}
              />
              <Label htmlFor="autorizacion_consulta" className="text-sm">
                Autorizo a Wy Crédito para consultar mi información en las centrales de riesgo (DataCrédito, CIFIN, etc.) para evaluar mi solicitud de crédito.
                Consulte la{' '}
                <a href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline hover:opacity-90">Política de Tratamiento de Datos Personales</a>.
              </Label>
            </div>
            {errors.autorizacionConsulta && (
              <Alert variant="destructive" className="mt-1">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errors.autorizacionConsulta}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-start space-x-2">
              <Checkbox
                id="habeas_data"
                checked={formData.habeasData}
                onCheckedChange={(checked) => handleInputChange('habeasData', Boolean(checked))}
              />
              <Label htmlFor="habeas_data" className="text-sm">
                Acepto el tratamiento de mis datos personales de acuerdo con la{' '}
                <a href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline hover:opacity-90">Política de Tratamiento de Datos Personales</a> de Wy Crédito y autorizo el uso de esta información para fines comerciales y de marketing.
              </Label>
            </div>
            {errors.habeasData && (
              <Alert variant="destructive" className="mt-1">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errors.habeasData}</AlertDescription>
              </Alert>
            )}
          </div>
        </TypeformQuestion>
      )}
    </form>
  );
};

export default FormularioEmpresaTypeform;