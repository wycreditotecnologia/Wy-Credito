// src/components/Forms/PantallaExito.jsx
import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { CheckCircle, Copy, Check, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

const PantallaExito = ({ sessionId }) => {
  const [trackingCode, setTrackingCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`tracking_code_${sessionId}`) || '';
      setTrackingCode(stored);
    } catch {
      setTrackingCode('');
    }
  }, [sessionId]);

  const handleCopy = async () => {
    if (!trackingCode) return;
    try {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Silencioso: el portapapeles puede no estar disponible en algunos navegadores
    }
  };

  return (
    <div className="max-w-[800px] mx-auto p-3">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary text-center mb-6">
        ¡Gracias!
      </h1>
      <p className="mb-6 text-center text-muted-foreground">
        Hemos recibido tu solicitud y está en revisión.
      </p>

      <Alert className="mb-6">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Solicitud enviada</AlertTitle>
        <AlertDescription>
          {trackingCode ? (
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono font-semibold">{trackingCode}</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                className="inline-flex items-center"
                aria-label="Copiar código de seguimiento"
              >
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          ) : (
            'Tu solicitud fue enviada correctamente.'
          )}
          {trackingCode ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Con este código podrás consultar el estado de tu solicitud. También lo enviamos a tu correo.
            </p>
          ) : (
            null
          )}
        </AlertDescription>
      </Alert>

      <Separator className="my-8" />

      <div className="text-center text-sm text-muted-foreground mb-6">
        Conserva tu código para consultar el estado de tu solicitud.
      </div>

      <div className="flex justify-center gap-3">
        <Button
          type="button"
          onClick={() => (window.location.href = '/seguimiento')}
          className="inline-flex items-center"
        >
          Consultar estado
        </Button>
        <Button
          type="button"
          onClick={() => (window.location.href = '/')}
          className="inline-flex items-center"
          variant="secondary"
        >
          <Home className="mr-2 h-4 w-4" />
          Ir al inicio
        </Button>
      </div>
    </div>
  );
};

export default PantallaExito;