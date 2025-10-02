import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SimulatorSection = () => {
  const [monto, setMonto] = useState(50000000);
  const [plazo, setPlazo] = useState(12);
  const [cuotaMensual, setCuotaMensual] = useState(0);
  const tasaInteresAnual = 0.28; // Tasa de ejemplo: 28% anual

  useEffect(() => {
    const tasaMensual = tasaInteresAnual / 12;
    if (tasaMensual > 0) {
      const cuota = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazo));
      setCuotaMensual(cuota);
    } else {
      setCuotaMensual(monto / plazo);
    }
  }, [monto, plazo, tasaInteresAnual]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <section id="simulador" className="py-16 md:py-24 bg-gray-950">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Proyecta tu Crecimiento. <span className="text-cyan-400">Sin Compromisos.</span>
        </h2>
        
        <div className="max-w-4xl mx-auto p-8 border border-white/10 rounded-2xl bg-gray-900/50 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Columna de Controles */}
            <div className="space-y-6">
              <div>
                <label htmlFor="monto" className="block text-sm font-medium text-gray-300">Monto del crédito</label>
                <input
                  id="monto"
                  type="range"
                  min="5000000"
                  max="200000000"
                  step="1000000"
                  value={monto}
                  onChange={(e) => setMonto(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-2xl font-semibold mt-2">{formatCurrency(monto)}</div>
              </div>
              <div>
                <label htmlFor="plazo" className="block text-sm font-medium text-gray-300">Plazo del crédito (mensual)</label>
                <input
                  id="plazo"
                  type="range"
                  min="6"
                  max="36"
                  step="1"
                  value={plazo}
                  onChange={(e) => setPlazo(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-2xl font-semibold mt-2">{plazo} meses</div>
              </div>
            </div>

            {/* Columna de Resultados y CTA */}
            <div className="flex flex-col justify-between p-6 bg-gray-900 rounded-lg">
              <div>
                <p className="text-gray-400">Pago Mensual Estimado</p>
                <p className="text-4xl font-bold text-cyan-400 mb-4">{formatCurrency(cuotaMensual)}</p>
                <p className="text-xs text-gray-500">
                  *Cálculo aproximado. La tasa final puede variar según el estudio de crédito.
                </p>
              </div>
              <Link
                to="/solicitud"
                className="mt-6 w-full inline-flex items-center justify-center rounded-md bg-cyan-500 px-6 py-3 text-lg font-medium text-white shadow transition-colors hover:bg-cyan-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-700"
              >
                Iniciar Solicitud
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimulatorSection;