import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const PreguntaRazonSocial = ({ onComplete }) => {
  const [razonSocial, setRazonSocial] = useState('');
  return (
    <div className="flex flex-col items-start w-full">
      <Label className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Perfecto. Ahora, ¿cuál es la Razón Social?
      </Label>
      <Input
        type="text"
        placeholder="Escribe el nombre completo de la empresa..."
        className="h-14 text-xl bg-background/50 max-w-sm"
        value={razonSocial}
        onChange={(e) => setRazonSocial(e.target.value)}
      />
      <Button onClick={() => onComplete({ razonSocial })} className="mt-8 bg-black text-white hover:bg-black/80" disabled={!razonSocial.trim()}>
        Guardar y Continuar
      </Button>
    </div>
  );
};
export default PreguntaRazonSocial;