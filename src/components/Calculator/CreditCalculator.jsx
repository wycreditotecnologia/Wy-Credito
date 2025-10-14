import React, { useState, useMemo } from 'react';
import { Slider, Button } from '@mui/material';
import { Separator } from '@/components/ui/separator';
import { TrendingUp } from '@mui/icons-material';

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);

const CreditCalculator = ({ onStartApplication }) => {
  const [monto, setMonto] = useState(50000000);
  const [plazo, setPlazo] = useState(36);

  const { cuotaMensual } = useMemo(() => {
    const TASA_INTERES_MENSUAL = 0.019;
    const i = TASA_INTERES_MENSUAL;
    const n = plazo;
    const P = monto;
    const cuota = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    return { cuotaMensual: cuota };
  }, [monto, plazo]);

  const handleStart = () => {
    onStartApplication({ amount: monto, term: plazo });
  };

  return (
    <div className="grid place-items-center min-h-[70vh]">
      <div className="col-span-12 sm:col-span-10 md:col-span-8 lg:col-span-6 w-full">
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Simula tu crédito empresarial</h1>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Proyecta el crecimiento de tu negocio. Ajusta el monto y el plazo para ver una cuota estimada.
            </p>
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Monto a solicitar</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(monto)}</p>
              <Slider value={monto} min={5000000} max={500000000} step={1000000} onChange={(_, newValue) => setMonto(newValue)} />
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Plazo</p>
              <p className="text-2xl font-bold text-primary">{plazo} meses</p>
              <Slider value={plazo} min={12} max={60} step={1} onChange={(_, newValue) => setPlazo(newValue)} />
            </div>
            <Separator className="my-3" />
            <div className="text-center">
                <h6 className="text-base font-semibold text-muted-foreground">Cuota mensual estimada</h6>
                <p className="text-3xl font-bold text-primary mb-3">
                    {formatCurrency(cuotaMensual)}
                </p>
                <Button 
                    variant="contained" 
                    size="large" 
                    startIcon={<TrendingUp />} 
                    onClick={handleStart} 
                >
                    Iniciar mi Solicitud
                </Button>
                 <p className="text-xs text-muted-foreground mt-2">
                    Este cálculo no constituye una oferta formal y está sujeto a estudio de crédito.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCalculator;