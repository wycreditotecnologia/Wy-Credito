import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PantallaResumen_Typeform from './PantallaResumen_Typeform';

const StepResumen_Typeform = ({ formData, onComplete, sessionId, onProgressUpdate }) => {
  const direction = 1;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete_submission', sessionId }),
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'No se pudo completar el envío.');
      }
      onComplete && onComplete();
    } catch (err) {
      console.error('Error al completar el envío:', err);
      setError(err.message || 'Error desconocido.');
    } finally {
      setIsLoading(false);
    }
  };

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 }),
  };

  // Reportar progreso al montar (pantalla resumen única)
  useEffect(() => {
    if (typeof onProgressUpdate === 'function') {
      onProgressUpdate({ currentQuestion: 1, totalQuestions: 1 });
    }
  }, [onProgressUpdate]);

  return (
    <div className="relative w-full h-auto min-h-[350px] flex items-center justify-center overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key="resumen"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
          className="w-full"
        >
          <PantallaResumen_Typeform formData={formData} onSubmit={handleSubmit} isLoading={isLoading} error={error} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StepResumen_Typeform;