import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PreguntaDescripcionGarantia from './PreguntaDescripcionGarantia';
import PreguntaValorGarantia from './PreguntaValorGarantia';

const StepGarantia_Typeform = ({ onComplete, onProgressUpdate }) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [stepData, setStepData] = useState({});

  const direction = 1;

  const handleQuestionComplete = (questionData) => {
    const newData = { ...stepData, ...questionData };
    setStepData(newData);

    if (currentQuestion === 1) {
      setCurrentQuestion(2);
    } else if (currentQuestion === 2) {
      onComplete && onComplete(newData);
    }
  };

  // Reportar progreso al montar y cuando cambie la pregunta
  useEffect(() => {
    if (typeof onProgressUpdate === 'function') {
      onProgressUpdate({ currentQuestion, totalQuestions: 2 });
    }
  }, [onProgressUpdate, currentQuestion]);

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
            <PreguntaDescripcionGarantia onComplete={handleQuestionComplete} />
          )}
          {currentQuestion === 2 && (
            <PreguntaValorGarantia onComplete={handleQuestionComplete} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StepGarantia_Typeform;