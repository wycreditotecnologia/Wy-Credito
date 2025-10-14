// src/components/forms/typeform/PreguntaNombreReferencia1.jsx
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PreguntaNombreReferencia1 = ({ onComplete }) => {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  const validate = () => {
    if (!nombre.trim()) {
      setError('Por favor ingresa un nombre válido.');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;
    onComplete({ referencia1_nombre: nombre.trim() });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div className="flex flex-col items-start w-full">
      <Label className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
        Empecemos con tu primera referencia comercial. ¿Cuál es el nombre de la empresa o persona?
      </Label>
      <div className="w-full max-w-xl">
        <Input
          placeholder="Nombre de la referencia"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-sm"
        />
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        <Button className="mt-4 bg-black text-white hover:bg-black/80" onClick={handleNext}>Guardar y Continuar</Button>
      </div>
    </div>
  );
};

export default PreguntaNombreReferencia1;