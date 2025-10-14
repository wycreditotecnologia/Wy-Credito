// src/components/forms/typeform/StepFinanciero_Typeform.jsx
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PreguntaCargaFinancieros from './PreguntaCargaFinancieros';

const StepFinanciero_Typeform = ({ onComplete, sessionId, onProgressUpdate }) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [stepData, setStepData] = useState({});

  const direction = 1;

  const handleQuestionComplete = (questionData) => {
    const newData = { ...stepData, ...questionData };
    setStepData(newData);
    // Solo una pregunta por ahora: completar el paso
    onComplete && onComplete(newData);
  };

  // Reportar progreso al montar
  useEffect(() => {
    if (typeof onProgressUpdate === 'function') {
      onProgressUpdate({ currentQuestion: 1, totalQuestions: 1 });
    }
  }, [onProgressUpdate]);

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 }),
  };

  return (
    <div className="relative w-full h-auto min-h-[350px] flex items-center justify-center overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentQuestion}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
          className="w-full"
        >
          {currentQuestion === 1 && (
            <PreguntaCargaFinancieros onComplete={handleQuestionComplete} sessionId={sessionId} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StepFinanciero_Typeform;