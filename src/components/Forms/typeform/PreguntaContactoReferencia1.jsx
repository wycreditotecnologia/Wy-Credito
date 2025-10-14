// src/components/forms/typeform/PreguntaContactoReferencia1.jsx
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PreguntaContactoReferencia1 = ({ onComplete }) => {
  const [contacto, setContacto] = useState('');
  const [error, setError] = useState('');

  const isValidContact = (value) => {
    const v = value.trim();
    if (!v) return false;
    const looksLikeEmail = v.includes('@') && v.indexOf('@') > 0;
    const digits = v.replace(/\D/g, '');
    const looksLikePhone = digits.length >= 7; // validación mínima
    return looksLikeEmail || looksLikePhone;
  };

  const validate = () => {
    if (!isValidContact(contacto)) {
      setError('Ingresa un teléfono (mín. 7 dígitos) o un email válido.');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;
    onComplete({ referencia1_contacto: contacto.trim() });
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
        Entendido. ¿Y cuál es su número de teléfono o email de contacto?
      </Label>
      <div className="w-full max-w-xl">
        <Input
          placeholder="Teléfono o email de la referencia"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-sm"
        />
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        <Button className="mt-4" onClick={handleNext}>Finalizar referencia</Button>
      </div>
    </div>
  );
};

export default PreguntaContactoReferencia1;