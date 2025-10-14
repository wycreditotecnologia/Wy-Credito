import React from 'react';

const StepNavigation = ({ onPrev, onNext }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      <button
        type="button"
        onClick={onPrev}
        className="w-10 h-10 rounded-md bg-slate-900 text-white shadow flex items-center justify-center hover:bg-slate-800"
        aria-label="Anterior"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={onNext}
        className="w-10 h-10 rounded-md bg-slate-900 text-white shadow flex items-center justify-center hover:bg-slate-800"
        aria-label="Guardar y Continuar"
      >
        ▼
      </button>
    </div>
  );
};

export default StepNavigation;