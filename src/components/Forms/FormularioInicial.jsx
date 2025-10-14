// src/components/Forms/FormularioInicial.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

const FormularioInicial = ({ onComplete, sessionId, onProgressUpdate }) => {
  const [form, setForm] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    aceptaGuardado: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Refs para navegación acelerada por teclado
  const nombreRef = useRef(null);
  const emailRef = useRef(null);
  const telefonoRef = useRef(null);
  const inputRefs = [nombreRef, emailRef, telefonoRef];

  // Enfocar el primer campo al montar
  useEffect(() => {
    nombreRef.current?.focus();
  }, []);

  // Reportar progreso inicial del paso al montar
  useEffect(() => {
    if (typeof onProgressUpdate === 'function') {
      onProgressUpdate({ currentQuestion: 1, totalQuestions: 3 });
    }
  }, [onProgressUpdate]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim());
    const phoneDigits = form.telefono.replace(/\D/g, '');
    if (!form.nombreCompleto.trim() || form.nombreCompleto.trim().length < 3) {
      e.nombreCompleto = 'Nombre completo mínimo 3 caracteres';
    }
    if (!emailOk) {
      e.email = 'Ingrese un correo electrónico válido';
    }
    if (!phoneDigits || phoneDigits.length < 7) {
      e.telefono = 'Teléfono celular mínimo 7 dígitos';
    }
    if (!form.aceptaGuardado) {
      e.aceptaGuardado = 'Debe aceptar el guardado progresivo de información';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    // Evitar comportamiento por defecto del formulario
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setSubmitError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        solicitante_nombre_completo: form.nombreCompleto.trim(),
        solicitante_email: form.email.trim(),
        solicitante_telefono: form.telefono.trim(),
        consentimiento_guardado_progresivo: true,
      };
      // Delegar a ApplicationView para persistencia y avance
      if (onComplete) onComplete(payload);
    } catch (err) {
      setSubmitError('Error inesperado al iniciar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Gestor de tecla Enter para avanzar y enviar
  const handleKeyDown = (event, currentIndex) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (currentIndex < inputRefs.length - 1) {
        inputRefs[currentIndex + 1].current?.focus();
      } else {
        // Último campo: enviar
        handleSubmit();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <h2 className="text-2xl font-semibold mb-2">Antes de comenzar</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Necesitamos tu consentimiento para guardar tu progreso y tus datos de contacto
        para comunicarnos contigo sobre tu solicitud.
      </p>

      <Separator className="my-6" />

      {/* Consentimiento inicial */}
      <div className="mb-8">
        <Label className="block mb-2">Consentimiento para guardado progresivo</Label>
        <div className="flex items-start gap-3">
          <Checkbox
            id="aceptaGuardado"
            checked={form.aceptaGuardado}
            onCheckedChange={(v) => handleChange('aceptaGuardado', Boolean(v))}
          />
          <label htmlFor="aceptaGuardado" className="text-sm leading-6">
            Acepto que el sistema guarde mi información progresivamente conforme avanzo.
            He leído y acepto los
            {' '}<a className="text-primary underline" href="/terminos-y-condiciones" target="_blank" rel="noreferrer">Términos y Condiciones</a>,
            {' '}<a className="text-primary underline" href="/politica-de-privacidad" target="_blank" rel="noreferrer">Política de Privacidad</a>
            {' '}y {' '}<a className="text-primary underline" href="/politica-de-cookies" target="_blank" rel="noreferrer">Política de Cookies</a>.
          </label>
        </div>
        {errors.aceptaGuardado && (
          <p className="text-xs text-destructive mt-2">{errors.aceptaGuardado}</p>
        )}
      </div>

      {/* Datos del solicitante */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6">
          <div className="mb-6">
            <Label htmlFor="nombreCompleto">Nombre Completo</Label>
            <Input
              id="nombreCompleto"
              value={form.nombreCompleto}
              onChange={(e) => handleChange('nombreCompleto', e.target.value)}
              ref={nombreRef}
              onKeyDown={(e) => handleKeyDown(e, 0)}
              placeholder="Ej: Juan Pérez"
            />
            {errors.nombreCompleto && (
              <p className="text-xs text-destructive mt-1">{errors.nombreCompleto}</p>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-6">
          <div className="mb-6">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              ref={emailRef}
              onKeyDown={(e) => handleKeyDown(e, 1)}
              placeholder="correo@empresa.com"
            />
            {errors.email ? (
              <p className="text-xs text-destructive mt-1">{errors.email}</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Usaremos este correo para enviarte actualizaciones.</p>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-6">
          <div className="mb-6">
            <Label htmlFor="telefono">Teléfono Celular</Label>
            <Input
              id="telefono"
              value={form.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              ref={telefonoRef}
              onKeyDown={(e) => handleKeyDown(e, 2)}
              placeholder="Ej: 3001234567"
            />
            {errors.telefono ? (
              <p className="text-xs text-destructive mt-1">{errors.telefono}</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Solo dígitos, mínimo 7.</p>
            )}
          </div>
        </div>
      </div>

      {submitError && (
        <Alert className="mt-4" variant="destructive">
          <AlertTriangle className="w-5 h-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end mt-8">
        <Button type="submit" disabled={loading} className="bg-black text-white hover:bg-black/80">
          {loading ? <Spinner className="w-5 h-5" /> : 'Guardar y Continuar'}
        </Button>
      </div>
    </form>
  );
};

export default FormularioInicial;