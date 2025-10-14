import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PreguntaValorGarantia = ({ onComplete }) => {
  const [valor, setValor] = useState('');
  const [error, setError] = useState('');

  const handleFinish = () => {
    const num = parseFloat(valor);
    if (isNaN(num) || num <= 0) {
      setError('Ingresa un valor numérico mayor que 0.');
      return;
    }
    setError('');
    onComplete && onComplete({ valor_estimado: num });
  };

  return (
    <div className="flex flex-col w-full">
      <Label className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
        ¿Cuál es el valor estimado de esta garantía?
      </Label>

      <div className="relative w-full max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
        <Input
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          min={0}
          step={0.01}
          className="pl-7 max-w-sm"
          placeholder="Ej: 15000000"
        />
      </div>
      {error && <span className="text-sm text-red-600 mt-2">{error}</span>}

      <div className="mt-6">
        <Button onClick={handleFinish}>
          Finalizar garantía
        </Button>
      </div>
    </div>
  );
};

export default PreguntaValorGarantia;