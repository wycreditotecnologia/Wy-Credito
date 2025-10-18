// src/pages/landing/SimulatorSection.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

export default function SimulatorSection() {
  const [amount, setAmount] = useState(50000000);
  const [months, setMonths] = useState(12);

  const monthlyRate = 0.10 / 12;
  const monthlyPayment = Math.round(
    (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
  <section id="simulador" className="relative bg-white dark:bg-gray-950/50 py-20 overflow-hidden scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white">
            Proyecta tu Crecimiento.{" "}
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              Sin Compromisos.
            </span>
          </h2>
        </div>

        <Card className="relative overflow-hidden bg-transparent card-glass card-hover border-gray-200 dark:border-gray-800 p-8 shadow-2xl shadow-blue-500/10">
          <div className="space-y-8">
            {/* Amount Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400">Monto del crédito</label>
                <span className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                  {formatCurrency(amount)}
                </span>
              </div>
              <Slider
                value={[amount]}
                onValueChange={(value) => setAmount(value[0])}
                min={5000000}
                max={200000000}
                step={1000000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>$5M</span>
                <span>$200M</span>
              </div>
            </div>

            {/* Term Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400">Plazo del crédito (mensual)</label>
                <span className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                  {months} meses
                </span>
              </div>
              <Slider
                value={[months]}
                onValueChange={(value) => setMonths(value[0])}
                min={6}
                max={48}
                step={6}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>6 meses</span>
                <span>48 meses</span>
              </div>
            </div>

            {/* Result */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pago Mensual Estimado</p>
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                    {formatCurrency(monthlyPayment)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    *Cálculo aproximado. La tasa final puede variar según el estudio de crédito.
                  </p>
                </div>
                <Button size="lg" asChild className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 shadow-lg shadow-blue-500/30 icon-hover">
                  <Link to="/solicitud">
                    <span className="inline-flex w-6 h-6 mr-2 items-center justify-center rounded-md icon-gradient-bg"><Calculator className="w-4 h-4 text-white" /></span>
                    Iniciar Solicitud
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}