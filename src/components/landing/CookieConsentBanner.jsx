import React from 'react';

export const CookieConsentBanner = () => {
  return (
    <div>
      {/* El contenido y la lógica del banner se añadirán en el siguiente paso. */}
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  // Al montar el componente, verificamos si el consentimiento ya fue otorgado.
  useEffect(() => {
    const consent = localStorage.getItem('wy-cookie-consent');
    if (consent !== 'true') {
      setShowBanner(true);
    }
  }, []);

  // Función para manejar la aceptación del usuario.
  const handleAccept = () => {
    localStorage.setItem('wy-cookie-consent', 'true');
    setShowBanner(false);
  };

  // Si no debemos mostrar el banner, no renderizamos nada.
  if (!showBanner) {
    return null;
  }

  // Renderizamos el banner usando componentes de shadcn/ui para consistencia visual.
  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:w-auto md:max-w-md z-50 shadow-lg animate-in slide-in-from-bottom-5 duration-500">
      <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
        <p className="text-sm text-muted-foreground flex-grow">
          Utilizamos cookies para mejorar tu experiencia. Al continuar, aceptas nuestra{' '}
          <a href="/politica-de-cookies" className="underline hover:text-primary">
            Política de Cookies
          </a>.
        </p>
        <Button onClick={handleAccept} className="w-full md:w-auto flex-shrink-0">
          Aceptar
        </Button>
      </CardContent>
    </Card>
  );
};