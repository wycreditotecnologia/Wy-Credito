import React from 'react';

const StyledStepper = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 
                  ${isActive ? 'bg-primary text-white scale-110' : ''} 
                  ${isCompleted ? 'bg-primary/80 text-white' : ''} 
                  ${!isActive && !isCompleted ? 'bg-gray-200 dark:bg-gray-700 text-gray-500' : ''} 
                `}
              >
                {stepNumber}
              </div>
              <p className={`mt-2 text-xs sm:text-sm font-medium transition-colors duration-300 ${isActive || isCompleted ? 'text-primary' : 'text-gray-500'}`}>
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${isCompleted ? 'bg-primary/50' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StyledStepper;