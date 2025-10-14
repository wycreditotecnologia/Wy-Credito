import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const PreguntaAceptacionTerminos = ({ onComplete }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="flex flex-col items-start w-full">
      <Label className="text-2xl md:text-3xl font-semibold text-foreground mb-8">
        Por último, necesitamos tu consentimiento explícito.
      </Label>

      <div className="flex items-center space-x-3">
        <Checkbox
          id="terms"
          checked={accepted}
          onCheckedChange={setAccepted}
        />
        <Label htmlFor="terms" className="text-base font-normal">
          Declaro que he leído y acepto los{" "}
          <a href="/terminos-y-condiciones" target="_blank" className="text-primary underline hover:text-primary/80">
            Términos y Condiciones
          </a>
          {" "}y la{" "}
          <a href="/politica-de-privacidad" target="_blank" className="text-primary underline hover:text-primary/80">
            Política de Privacidad
          </a>.
        </Label>
      </div>

      <Button onClick={() => onComplete({ aceptacion_terminos: accepted })} className="mt-8" disabled={!accepted}>
        Acepto y Finalizo
      </Button>
    </div>
  );
};

export default PreguntaAceptacionTerminos;