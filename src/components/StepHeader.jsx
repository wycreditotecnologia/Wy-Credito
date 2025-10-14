import React from 'react';

// Este es el nuevo StepHeader. Recibirá props dinámicas en la Fase 2.
const StepHeader = ({ 
  stepNumber = 1, 
  stepTitle = "Consentimiento y Contacto", 
  currentQuestion = 1, 
  totalQuestions = 3, 
}) => { 
  return ( 
    <div className="flex items-center justify-center space-x-4 w-full"> 
      {/* Círculo Azul con Número de Paso */} 
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-[#3A85F5] text-white rounded-full font-bold text-sm"> 
        {stepNumber} 
      </div> 

      {/* Título del Paso */} 
      <h2 className="text-lg font-semibold text-gray-800">{stepTitle}</h2> 

      {/* Separador Visual */} 
      <span className="text-gray-300">|</span> 

      {/* Contador de Preguntas */} 
      <p className="text-md text-gray-500"> 
        Pregunta {currentQuestion} de {totalQuestions} 
      </p> 
    </div> 
  ); 
}; 

export default StepHeader;