import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const CreditSimulator = ({ onRequestCredit }) => {
  const [formData, setFormData] = useState({
    amount: 50000000,
    term: 5,
    termUnit: 'years',
    creditType: 'empresarial',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [results, setResults] = useState({
    monthlyPayment: 0,
    totalInterest: 0,
    totalCost: 0,
    interestRate: 0
  });

  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);

  const creditTypes = [
    { value: 'empresarial', label: 'Préstamo Empresarial', rate: 12 },
    { value: 'corto_plazo', label: 'Préstamo a Corto Plazo', rate: 15 },
    { value: 'largo_plazo', label: 'Préstamo a Largo Plazo', rate: 10 },
    { value: 'linea_credito', label: 'Línea de Crédito', rate: 18 },
    { value: 'con_garantia', label: 'Préstamo con Garantía', rate: 8 },
    { value: 'sin_garantia', label: 'Préstamo sin Garantía', rate: 20 }
  ];

  const amountPresets = [
    { value: 10000000, label: '10M' },
    { value: 20000000, label: '20M' },
    { value: 50000000, label: '50M' },
    { value: 100000000, label: '100M' },
    { value: 200000000, label: '200M' }
  ];

  // Validación de campos
  const validateForm = () => {
    const newErrors = {};
    
    if (formData.amount < 1000000) {
      newErrors.amount = 'El monto mínimo es CLP $1.000.000';
    }
    if (formData.amount > 500000000) {
      newErrors.amount = 'El monto máximo es CLP $500.000.000';
    }
    
    const termInMonths = formData.termUnit === 'years' ? formData.term * 12 : formData.term;
    if (termInMonths < 6) {
      newErrors.term = 'El plazo mínimo es 6 meses';
    }
    if (termInMonths > 360) {
      newErrors.term = 'El plazo máximo es 30 años';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestCredit = () => {
    if (validateForm() && onRequestCredit) {
      const creditData = {
        amount: formData.amount,
        term: formData.term,
        creditType: formData.creditType,
        monthlyPayment: results.monthlyPayment,
        totalCost: results.totalCost,
        interestRate: results.interestRate
      };
      onRequestCredit(creditData);
    }
  };

  // Cálculo de crédito en tiempo real
  const calculateCredit = () => {
    if (!validateForm()) return;

    setIsCalculating(true);
    
    setTimeout(() => {
      const selectedCreditType = creditTypes.find(type => type.value === formData.creditType);
      const annualRate = selectedCreditType.rate / 100;
      const monthlyRate = annualRate / 12;
      const termInMonths = formData.termUnit === 'years' ? formData.term * 12 : formData.term;
      
      // Fórmula de cuota fija (sistema francés)
      const monthlyPayment = formData.amount * (monthlyRate * Math.pow(1 + monthlyRate, termInMonths)) / 
                            (Math.pow(1 + monthlyRate, termInMonths) - 1);
      
      const totalCost = monthlyPayment * termInMonths;
      const totalInterest = totalCost - formData.amount;

      setResults({
        monthlyPayment: Math.round(monthlyPayment),
        totalInterest: Math.round(totalInterest),
        totalCost: Math.round(totalCost),
        interestRate: selectedCreditType.rate
      });
      
      setIsCalculating(false);
    }, 500);
  };

  // Efecto para recalcular automáticamente
  useEffect(() => {
    calculateCredit();
  }, [formData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleAmountChange = (value) => {
    setFormData(prev => ({ ...prev, amount: parseInt(value) }));
  };

  const handleTermChange = (value) => {
    setFormData(prev => ({ ...prev, term: parseInt(value) }));
  };

  const getEndDate = () => {
    const start = new Date(formData.startDate);
    const termInMonths = formData.termUnit === 'years' ? formData.term * 12 : formData.term;
    start.setMonth(start.getMonth() + termInMonths);
    return start.toLocaleDateString('es-CL', { year: 'numeric', month: 'short' });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-wy-secondary/5 to-wy-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-h2 font-heading font-bold text-wy-dark mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Simulador de Crédito
          </motion.h2>
          <motion.p 
            className="text-body font-body text-wy-dark-moderate-cyan max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Calcula tu crédito empresarial de forma rápida y precisa con Wally
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Formulario */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center mb-6">
              <Calculator className="w-6 h-6 text-wy-strong-blue mr-3" />
              <h3 className="text-h3 font-heading font-semibold text-wy-very-dark-blue">
                Simulador de Crédito simple
              </h3>
            </div>

            <div className="space-y-6">
              {/* Monto del crédito */}
              <div>
                <label className="block text-label font-body font-semibold text-wy-very-dark-blue mb-3">
                  Monto del crédito
                </label>
                <div className="mb-4">
                  <input
                    type="text"
                    value={formatCurrency(formData.amount)}
                    readOnly
                    className="w-full p-4 border-2 border-gray-200 rounded-lg bg-gray-50 text-h3 font-heading font-bold text-wy-very-dark-blue text-center"
                  />
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="500000000"
                  step="1000000"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between mt-2">
                  {amountPresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handleAmountChange(preset.value)}
                      className={`px-3 py-1 rounded-full text-sm font-body transition-colors ${
                        formData.amount === preset.value
                          ? 'bg-wy-strong-blue text-white'
                          : 'bg-gray-100 text-wy-dark-moderate-cyan hover:bg-wy-strong-blue/10'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {errors.amount && (
                  <div className="flex items-center mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">{errors.amount}</span>
                  </div>
                )}
              </div>

              {/* Plazo del crédito */}
              <div>
                <label className="block text-label font-body font-semibold text-wy-very-dark-blue mb-3">
                  Plazo del crédito ({formData.termUnit === 'years' ? 'años' : 'meses'})
                </label>
                <div className="flex items-center space-x-4 mb-4">
                  <input
                    type="range"
                    min={formData.termUnit === 'years' ? 1 : 6}
                    max={formData.termUnit === 'years' ? 30 : 360}
                    step="1"
                    value={formData.term}
                    onChange={(e) => handleTermChange(e.target.value)}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={formData.term}
                      onChange={(e) => handleTermChange(e.target.value)}
                      className="w-16 p-2 border border-gray-300 rounded text-center font-body"
                    />
                    <span className="ml-2 text-sm text-wy-dark-moderate-cyan">
                      {formData.termUnit === 'years' ? 'años' : 'meses'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="termUnit"
                      value="months"
                      checked={formData.termUnit === 'months'}
                      onChange={(e) => setFormData(prev => ({ ...prev, termUnit: e.target.value, term: 12 }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-body">Meses</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="termUnit"
                      value="years"
                      checked={formData.termUnit === 'years'}
                      onChange={(e) => setFormData(prev => ({ ...prev, termUnit: e.target.value, term: 5 }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-body">Años</span>
                  </label>
                </div>
                {errors.term && (
                  <div className="flex items-center mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">{errors.term}</span>
                  </div>
                )}
              </div>

              {/* Tipo de crédito */}
              <div>
                <label className="block text-label font-body font-semibold text-wy-very-dark-blue mb-3">
                  Tipo de crédito
                </label>
                <select
                  value={formData.creditType}
                  onChange={(e) => setFormData(prev => ({ ...prev, creditType: e.target.value }))}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg font-body focus:border-wy-strong-blue focus:ring-2 focus:ring-wy-strong-blue/20 transition-colors"
                >
                  {creditTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.rate}% anual
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha de inicio */}
              <div>
                <label className="block text-label font-body font-semibold text-wy-very-dark-blue mb-3">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg font-body focus:border-wy-strong-blue focus:ring-2 focus:ring-wy-strong-blue/20 transition-colors"
                />
              </div>
            </div>
          </motion.div>

          {/* Resultados */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="mb-6">
              <h3 className="text-h3 font-heading font-semibold text-wy-very-dark-blue mb-2">
                Pago Mensual
              </h3>
              <div className="text-4xl font-heading font-bold text-wy-strong-blue">
                {isCalculating ? (
                  <div className="animate-pulse">Calculando...</div>
                ) : (
                  formatCurrency(results.monthlyPayment)
                )}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="font-body text-wy-dark-moderate-cyan">Capital Total</span>
                <span className="font-body font-semibold text-wy-very-dark-blue">
                  {formatCurrency(formData.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="font-body text-wy-dark-moderate-cyan">Intereses Totales</span>
                <span className="font-body font-semibold text-wy-very-dark-blue">
                  {formatCurrency(results.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="font-body text-wy-dark-moderate-cyan">Tasa de Interés</span>
                <span className="font-body font-semibold text-wy-very-dark-blue">
                  {results.interestRate}% anual
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-body text-wy-dark-moderate-cyan">Último Pago</span>
                <span className="font-body font-semibold text-wy-very-dark-blue">
                  {getEndDate()}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleRequestCredit}
                className="w-full bg-wy-secondary text-white py-4 rounded-lg font-body font-semibold hover:bg-wy-moderate transition-colors flex items-center justify-center"
              >
                Solicitar Crédito
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            {/* Información adicional */}
            <div className="mt-8 p-4 bg-wy-secondary/10 rounded-lg">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-wy-primary mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-body text-wy-dark mb-2">
                    <strong>Actualmente Wy Crédito ofrece Financiamiento Directo</strong> como opción de crédito ante créditos bancarios.
                  </p>
                  <p className="text-sm font-body text-wy-moderate">
                    Los beneficios de FD incluyen: Aplica y obtén tu crédito de forma 100% digital y mucho más expedita.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Información adicional */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-body text-wy-moderate max-w-4xl mx-auto">
            Recuerda que esta calculadora únicamente informativa, no representa una oferta para algún producto en específico. 
            Sino que te ayuda a evaluar si el crédito es viable y si puedes asumir los pagos sin afectar negativamente tu flujo de efectivo.
          </p>
        </motion.div>
      </div>


    </section>
  );
};

export default CreditSimulator;