import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47];
const calcDV = (nitNumber) => {
  // nitNumber: cadena numérica sin guion, sólo la parte antes del DV
  const digits = nitNumber.replace(/\D/g, '').split('').reverse();
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = parseInt(digits[i], 10);
    const w = weights[i] || 3; // fallback por seguridad
    sum += d * w;
  }
  const remainder = sum % 11;
  if (remainder === 0) return 0;
  if (remainder === 1) return 1;
  return 11 - remainder;
};

const PreguntaNIT = ({ onComplete }) => {
  const [nit, setNit] = useState('');
  // Formato esperado: 9-10 dígitos + guion + dígito verificador (ej: 9016859886-0)
  const nitPattern = /^\d{9,10}-\d$/;

  const isValidFormat = nitPattern.test(nit);
  let isValidDV = false;
  if (isValidFormat) {
    const [numero, dvIngresado] = nit.split('-');
    const dvCalculado = calcDV(numero).toString();
    isValidDV = dvIngresado === dvCalculado;
  }
  const isValid = isValidFormat && isValidDV;

  const handleNext = () => {
    if (isValid) {
      onComplete({ nit });
    }
  };

  return (
    <div className="flex flex-col items-start w-full">
      <Label className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Comencemos, ¿Cuál es el NIT de tu empresa?
      </Label>
      <Input
        type="text"
        placeholder="Ej: 9016859886-0"
        className="h-14 text-xl bg-background/50 max-w-sm"
        value={nit}
        onChange={(e) => setNit(e.target.value)}
      />
      <p className="text-sm text-muted-foreground mt-2">
        Formato: 9-10 dígitos, guion y dígito verificador (ej: 9016859886-0).
      </p>
      {!isValidFormat && nit.length > 0 && (
        <p className="text-xs text-red-600 mt-1">Formato inválido. Usa el guion y dígito de verificación.</p>
      )}
      {isValidFormat && !isValidDV && (
        <p className="text-xs text-red-600 mt-1">El dígito de verificación no coincide con el NIT.</p>
      )}
      <Button onClick={handleNext} className="mt-8 bg-black text-white hover:bg-black/80" disabled={!isValid}>
        Guardar y Continuar
      </Button>
    </div>
  );
};

export default PreguntaNIT;