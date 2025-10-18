import React, { useState, useEffect, useRef } from 'react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import {
  Business as BusinessIcon,
  Language as WebIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
} from '@mui/icons-material';

const FormularioEmpresa = ({ onStepComplete, sessionId, registerStepActions, hideLocalActions, onProgressUpdate }) => {
  const [formData, setFormData] = useState({
    nit: '',
    razonSocial: '',
    tipoEmpresa: '',
    sitioWeb: '',
    telefonoEmpresa: '',
    direccionEmpresa: '',
    ciudad: '',
    departamento: '',
    redesSociales: {
      facebook: '',
      instagram: '',
      linkedin: '',
      twitter: '',
    },
    autorizacionConsulta: false,
    habeasData: false,
  });

  const [errors, setErrors] = useState({});
  const [mostrarRedes, setMostrarRedes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);

  // Refs para navegación acelerada por teclado
  const nitRef = useRef(null);
  const razonSocialRef = useRef(null);
  const tipoEmpresaRef = useRef(null); // SelectTrigger
  const telefonoRef = useRef(null);
  const direccionRef = useRef(null);
  const ciudadRef = useRef(null);
  const departamentoRef = useRef(null);
  const sitioWebRef = useRef(null);
  const facebookRef = useRef(null);
  const instagramRef = useRef(null);
  const linkedinRef = useRef(null);
  const twitterRef = useRef(null);
  const autorizacionConsultaRef = useRef(null);
  const habeasDataRef = useRef(null);

  const inputRefs = [
    nitRef,
    razonSocialRef,
    tipoEmpresaRef,
    telefonoRef,
    direccionRef,
    ciudadRef,
    departamentoRef,
    sitioWebRef,
    facebookRef,
    instagramRef,
    linkedinRef,
    twitterRef,
    autorizacionConsultaRef,
    habeasDataRef,
  ];

  useEffect(() => {
    nitRef.current?.focus();
  }, []);

  // Utilidad: calcular DV del NIT (módulo 11 - DIAN)
  const calcularDVNIT = (nitBase) => {
    const pesos = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
    const limpio = String(nitBase || '').replace(/\D/g, '');
    let suma = 0;
    for (let i = 0; i < limpio.length && i < pesos.length; i++) {
      const dig = parseInt(limpio.charAt(limpio.length - 1 - i), 10) || 0;
      suma += dig * pesos[i];
    }
    const resto = suma % 11;
    return resto > 1 ? 11 - resto : resto; // 0 si resto 0, 1 si resto 1
  };

  const formatearNitConDVSiAplica = (valor) => {
    const limpio = String(valor || '').replace(/\D/g, '');
    if (/^\d{9,10}$/.test(limpio)) {
      const dv = calcularDVNIT(limpio);
      return `${limpio}-${dv}`;
    }
    return String(valor || '');
  };

  // Prefill desde extracción automática (si existe) y completar DV si falta
  useEffect(() => {
    try {
      const preNit = localStorage.getItem(`pre_nit_${sessionId}`) || '';
      const preRazon = localStorage.getItem(`pre_razon_social_${sessionId}`) || '';
      const nitPref = (prevNit) => {
        if (prevNit) return prevNit; // respetar si ya hay NIT
        if (!preNit) return '';
        // si viene sin guion, completar DV si la longitud es válida
        if (!preNit.includes('-')) return formatearNitConDVSiAplica(preNit);
        return preNit;
      };
      setFormData(prev => ({
        ...prev,
        nit: nitPref(prev.nit),
        razonSocial: prev.razonSocial || preRazon,
      }));
    } catch {}
  }, [sessionId]);

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

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación NIT: 9-10 dígitos + guion + dígito verificador (ej: 9016859886-0)
    if (!formData.nit.trim()) {
      newErrors.nit = 'El NIT es obligatorio';
    } else if (!/^\d{9,10}-\d$/.test(formData.nit.trim())) {
      newErrors.nit = 'Formato inválido. Use el guion y dígito verificador (ej: 9016859886-0)';
    }

    // Validación Razón Social
    if (!formData.razonSocial.trim()) {
      newErrors.razonSocial = 'La razón social es obligatoria';
    } else if (formData.razonSocial.trim().length < 3) {
      newErrors.razonSocial = 'La razón social debe tener al menos 3 caracteres';
    }

    // Validación Tipo de Empresa
    if (!formData.tipoEmpresa) {
      newErrors.tipoEmpresa = 'Debe seleccionar el tipo de empresa';
    }

    // Validación Sitio Web (opcional pero si se llena debe ser válida)
    if (formData.sitioWeb && !/^https?:\/\/.+/.test(formData.sitioWeb)) {
      newErrors.sitioWeb = 'Ingrese una URL válida (ej: https://www.ejemplo.com)';
    }

    // Teléfono: al menos 7 dígitos
    if (!formData.telefonoEmpresa.trim()) {
      newErrors.telefonoEmpresa = 'El teléfono de la empresa es obligatorio';
    } else if (!/^\d{7,}$/.test(formData.telefonoEmpresa.replace(/\D/g, ''))) {
      newErrors.telefonoEmpresa = 'El teléfono debe tener al menos 7 dígitos';
    }

    // Dirección, ciudad y departamento (requeridos)
    if (!formData.direccionEmpresa.trim()) {
      newErrors.direccionEmpresa = 'La dirección es obligatoria';
    }
    if (!formData.ciudad.trim()) {
      newErrors.ciudad = 'La ciudad es obligatoria';
    }
    if (!formData.departamento.trim()) {
      newErrors.departamento = 'El departamento es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validación específica por pregunta para el flujo tipo Typeform
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
          if (!/^\d{9,10}-\d$/.test(formData.nit.trim())) {
            newErrors.nit = 'Formato inválido. Use el guion y dígito verificador (ej: 9016859886-0)';
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
        if (formData.sitioWeb && !/^https?:\/\/.+/.test(formData.sitioWeb)) {
          newErrors.sitioWeb = 'Ingrese una URL válida (ej: https://www.ejemplo.com)';
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

  const handleNextQuestion = async () => {
    setSubmitError('');
    const ok = validateCurrentQuestion();
    if (!ok) return;

    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex((idx) => idx + 1);
    } else {
      // Última pregunta: validar globalmente y enviar
      await submitData();
    }
  };

  const handlePrevQuestion = () => {
    setSubmitError('');
    setErrors({});
    setQuestionIndex((idx) => Math.max(0, idx - 1));
  };

  // Navegación por Enter: avanza al siguiente foco o envía al final
  const handleKeyDown = (event, currentIndex) => {
    if (event.key === 'Enter') {
      // En SelectTrigger de tipo empresa, permitir Enter para abrir si está vacío
      if (currentIndex === 2 && !String(formData.tipoEmpresa || '').trim()) {
        return;
      }
      event.preventDefault();
      for (let i = currentIndex + 1; i < inputRefs.length; i++) {
        const next = inputRefs[i]?.current;
        if (next && next.isConnected) {
          next.focus();
          return;
        }
      }
      // Si no hay siguiente enfocable, enviar el formulario
      // Usamos submitData porque handleSubmit previene por defecto
      submitData();
    }
  };

  const submitData = async () => {
    // Limpiar errores previos
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }

    // Verificar que tenemos sessionId
    if (!sessionId) {
      setSubmitError('Error: No se encontró una sesión activa. Por favor, reinicie el proceso.');
      return;
    }

    setLoading(true);

    try {
      // Preparar los datos para enviar al orquestador
      const stepData = {
        nit: formData.nit.trim(),
        razon_social: formData.razonSocial.trim(),
        tipo_empresa: formData.tipoEmpresa,
        sitio_web: formData.sitioWeb.trim() || null,
        telefono_empresa: formData.telefonoEmpresa.trim(),
        direccion_empresa: formData.direccionEmpresa.trim(),
        ciudad: formData.ciudad.trim(),
        departamento: formData.departamento.trim(),
      };

      // Llamada a la API del orquestador
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit_form_step',
          sessionId: sessionId,
          payload: {
            currentStep: 1,
            stepData: stepData,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar los datos');
      }

      // Si todo salió bien, navegar al siguiente paso
      console.log('Datos enviados correctamente:', result);
      
      // Llamar a la función de callback para avanzar al siguiente paso
      if (onStepComplete) {
        onStepComplete(2); // Avanzar al paso 2 (Documentación Legal)
      }

    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setSubmitError(error.message || 'Error al enviar los datos. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitData();
  };

  useEffect(() => {
    if (registerStepActions) {
      registerStepActions({
        onSaveContinue: handleNextQuestion,
      });
    }
    // no cleanup needed for simple registration
  }, [registerStepActions, formData, sessionId, questionIndex]);

  return (
    <form onSubmit={handleSubmit}>
      <div>
        {/* Información Básica de la Empresa */}
        <div>
          <h3 className="text-xl font-semibold border-b pb-2 mb-6 flex items-center w-full">
            <BusinessIcon className="mr-1 text-primary" />
            Información Básica de la Empresa
          </h3>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-6">
              <div className="mb-6">
                <Label htmlFor="nit">NIT de la Empresa</Label>
                <div className="relative">
                  <BusinessIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="nit"
                  value={formData.nit}
                  onChange={(e) => handleInputChange('nit', e.target.value)}
                  onBlur={() => {
                    const val = String(formData.nit || '');
                    if (val && !val.includes('-')) {
                      const conDv = formatearNitConDVSiAplica(val);
                      if (conDv !== val) {
                        setFormData(prev => ({ ...prev, nit: conDv }));
                        if (errors.nit) setErrors(prev => ({ ...prev, nit: '' }));
                      }
                    }
                  }}
                  placeholder="123456789"
                  ref={nitRef}
                  onKeyDown={(e) => handleKeyDown(e, 0)}
                  className="pl-9"
                />
                </div>
                {errors.nit ? (
                  <p className="text-xs text-destructive mt-1">{errors.nit}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Formato: 9016859886-0. Si ingresa solo números, calculamos el dígito automáticamente.</p>
                )}
              </div>
            </div>
            <div className="col-span-12">
              <Button type="button" variant="outline" onClick={() => setMostrarRedes((v) => !v)}>
                {mostrarRedes ? 'Ocultar redes sociales opcionales' : 'Agregar redes sociales (opcional)'}
              </Button>
            </div>

            <div className="col-span-12 md:col-span-6">
              <div className="mb-6">
                <Label htmlFor="razonSocial">Razón Social</Label>
                <Input
                  id="razonSocial"
                  value={formData.razonSocial}
                  onChange={(e) => handleInputChange('razonSocial', e.target.value)}
                  placeholder="Empresa Ejemplo S.A.S."
                  ref={razonSocialRef}
                  onKeyDown={(e) => handleKeyDown(e, 1)}
                />
                {errors.razonSocial ? (
                  <p className="text-xs text-destructive mt-1">{errors.razonSocial}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Nombre completo de la empresa</p>
                )}
              </div>
            </div>

            <div className="col-span-12">
              <div className="mb-6">
                <Label htmlFor="tipoEmpresa">Tipo de Empresa</Label>
                <Select value={formData.tipoEmpresa} onValueChange={(value) => handleInputChange('tipoEmpresa', value)}>
                  <SelectTrigger id="tipoEmpresa" ref={tipoEmpresaRef} onKeyDown={(e) => handleKeyDown(e, 2)} className="w-full">
                    <SelectValue placeholder="Seleccione el tipo de empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEmpresa.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipoEmpresa && (
                  <p className="text-xs text-destructive mt-1">{errors.tipoEmpresa}</p>
                )}
              </div>
            </div>
            <div className="col-span-12 md:col-span-6">
              <div className="mb-6">
                <Label htmlFor="telefonoEmpresa">Teléfono de la Empresa</Label>
                <Input
                  id="telefonoEmpresa"
                  value={formData.telefonoEmpresa}
                  onChange={(e) => handleInputChange('telefonoEmpresa', e.target.value)}
                  placeholder="3001234567"
                  ref={telefonoRef}
                  onKeyDown={(e) => handleKeyDown(e, 3)}
                />
                {errors.telefonoEmpresa ? (
                  <p className="text-xs text-destructive mt-1">{errors.telefonoEmpresa}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Solo dígitos, mínimo 7</p>
                )}
              </div>
            </div>
            <div className="col-span-12 md:col-span-6">
              <div className="mb-6">
                <Label htmlFor="direccionEmpresa">Dirección</Label>
                <Input
                  id="direccionEmpresa"
                  value={formData.direccionEmpresa}
                  onChange={(e) => handleInputChange('direccionEmpresa', e.target.value)}
                  placeholder="Cra 7 # 123-45 Of. 301"
                  ref={direccionRef}
                  onKeyDown={(e) => handleKeyDown(e, 4)}
                />
                {errors.direccionEmpresa && (
                  <p className="text-xs text-destructive mt-1">{errors.direccionEmpresa}</p>
                )}
              </div>
            </div>
            <div className="col-span-12 md:col-span-6">
              <div className="mb-6">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                  placeholder="Bogotá"
                  ref={ciudadRef}
                  onKeyDown={(e) => handleKeyDown(e, 5)}
                />
                {errors.ciudad && (
                  <p className="text-xs text-destructive mt-1">{errors.ciudad}</p>
                )}
              </div>
            </div>
            <div className="col-span-12 md:col-span-6">
              <div className="mb-6">
                <Label htmlFor="departamento">Departamento</Label>
                <Input
                  id="departamento"
                  value={formData.departamento}
                  onChange={(e) => handleInputChange('departamento', e.target.value)}
                  placeholder="Cundinamarca"
                  ref={departamentoRef}
                  onKeyDown={(e) => handleKeyDown(e, 6)}
                />
                {errors.departamento && (
                  <p className="text-xs text-destructive mt-1">{errors.departamento}</p>
                )}
              </div>
            </div>
          </div>
        </div>

            <Separator className="my-8" />

        {/* Presencia Digital */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold border-b pb-2 mb-6 flex items-center w-full">
            <WebIcon className="mr-1 text-primary" />
            Presencia Digital
          </h3>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <div className="mb-6">
                <Label htmlFor="sitioWeb">Sitio Web</Label>
                <div className="relative">
                  <WebIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="sitioWeb"
                    value={formData.sitioWeb}
                    onChange={(e) => handleInputChange('sitioWeb', e.target.value)}
                    placeholder="https://www.miempresa.com"
                    ref={sitioWebRef}
                    onKeyDown={(e) => handleKeyDown(e, 7)}
                    className="pl-9"
                  />
                </div>
                {errors.sitioWeb ? (
                  <p className="text-xs text-destructive mt-1">{errors.sitioWeb}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">URL de la página web de la empresa (opcional)</p>
                )}
              </div>
            </div>

            {mostrarRedes && (
            <div className="col-span-12 md:col-span-6">
              <div className="mb-6">
                <Label htmlFor="facebook">Facebook</Label>
                <div className="relative">
                  <FacebookIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="facebook"
                    value={formData.redesSociales.facebook}
                    onChange={(e) => handleInputChange('redesSociales.facebook', e.target.value)}
                    placeholder="https://facebook.com/miempresa"
                    ref={facebookRef}
                    onKeyDown={(e) => handleKeyDown(e, 8)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <div className="mb-6">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <InstagramIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="instagram"
                    value={formData.redesSociales.instagram}
                    onChange={(e) => handleInputChange('redesSociales.instagram', e.target.value)}
                    placeholder="https://instagram.com/miempresa"
                    ref={instagramRef}
                    onKeyDown={(e) => handleKeyDown(e, 9)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <div className="mb-6">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <div className="relative">
                  <LinkedInIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="linkedin"
                    value={formData.redesSociales.linkedin}
                    onChange={(e) => handleInputChange('redesSociales.linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/miempresa"
                    ref={linkedinRef}
                    onKeyDown={(e) => handleKeyDown(e, 10)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <div className="mb-6">
                <Label htmlFor="twitter">Twitter</Label>
                <div className="relative">
                <TwitterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="twitter"
                    value={formData.redesSociales.twitter}
                    onChange={(e) => handleInputChange('redesSociales.twitter', e.target.value)}
                    placeholder="https://twitter.com/miempresa"
                    ref={twitterRef}
                    onKeyDown={(e) => handleKeyDown(e, 11)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

            <Separator className="my-8" />

        {/* Autorizaciones */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold border-b pb-2 mb-6">Autorizaciones y Consentimientos</h3>

          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autorizacion_consulta"
                checked={formData.autorizacionConsulta}
                onCheckedChange={(checked) => handleInputChange('autorizacionConsulta', Boolean(checked))}
                ref={autorizacionConsultaRef}
                onKeyDown={(e) => handleKeyDown(e, 12)}
              />
              <Label htmlFor="autorizacion_consulta" className="text-sm font-medium">
                Autorizo a Wy Crédito para consultar mi información en las centrales de riesgo (DataCrédito, CIFIN, etc.) para evaluar mi solicitud de crédito. 
                Consulte la
                {' '}
                <a
                  href="/politica-de-privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold underline hover:opacity-90"
                >
                  Política de Tratamiento de Datos Personales
                </a>
                .
              </Label>
            </div>
            {errors.autorizacionConsulta && (
              <Alert variant="destructive" className="mt-1">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errors.autorizacionConsulta}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="habeas_data"
                checked={formData.habeasData}
                onCheckedChange={(checked) => handleInputChange('habeasData', Boolean(checked))}
                ref={habeasDataRef}
                onKeyDown={(e) => handleKeyDown(e, 13)}
              />
              <Label htmlFor="habeas_data" className="text-sm font-medium">
                Acepto el tratamiento de mis datos personales de acuerdo con la{' '}
                <a
                  href="/politica-de-privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold underline hover:opacity-90"
                >
                  Política de Tratamiento de Datos Personales
                </a>
                {' '}de Wy Crédito y autorizo el uso de esta información para fines comerciales y de marketing.
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
        </div>

        {/* Error de envío */}
        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Botones de Acción locales (ocultos si hay barra flotante) */}
        {!hideLocalActions && (
          <div className="flex justify-between mt-12">
            <Button type="button" variant="outline" size="lg" className="min-w-[120px]" disabled={loading}>
              Cancelar
            </Button>

            <Button type="submit" size="lg" className="min-w-[120px]" disabled={loading}>
              {loading ? (
                <>
                  <Spinner className="mr-2 w-5 h-5" />
                  Guardando...
                </>
              ) : (
                'Guardar y Continuar'
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
};

export default FormularioEmpresa;
  // Reportar progreso del paso al montar
  useEffect(() => {
    if (typeof onProgressUpdate === 'function') {
      // Campos principales: NIT, Razón Social, Tipo, Teléfono, Dirección, Ciudad, Departamento, Sitio Web, Autorización, Habeas Data
      onProgressUpdate({ currentQuestion: 1, totalQuestions: 10 });
    }
  }, [onProgressUpdate]);