import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
// Nota: No tenemos componente Textarea en ui; usamos nativo estilizado
import { Button } from '@/components/ui/button';

const PreguntaDescripcionGarantia = ({ onComplete }) => {
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    const value = descripcion.trim();
    if (!value || value.length < 10) {
      setError('Por favor describe la garantía con al menos 10 caracteres.');
      return;
    }
    setError('');
    onComplete && onComplete({ descripcion_garantia: value });
  };

  return (
    <div className="flex flex-col w-full">
      <Label className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
        ¿Qué bien o activo ofreces como garantía para este crédito?
      </Label>

      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        rows={4}
        placeholder="Ejemplo: Vehículo marca X, modelo Y, año Z en buen estado..."
        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {error && <span className="text-sm text-red-600 mt-2">{error}</span>}

      <div className="mt-6">
        <Button onClick={handleNext} className="bg-black text-white hover:bg-black/80">
          Guardar y Continuar
        </Button>
      </div>
    </div>
  );
};

export default PreguntaDescripcionGarantia;