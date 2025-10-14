import React, { useState } from 'react';

const opciones = [
  { id: 'cc', label: 'Cédula de Ciudadanía' },
  { id: 'ce', label: 'Cédula de Extranjería' },
];

const PreguntaTipoDocumento = ({ onComplete }) => {
  const [seleccion, setSeleccion] = useState(null);

  const handleNext = () => {
    if (!seleccion) return;
    onComplete && onComplete({ tipoDocumentoRepresentante: seleccion });
  };

  return (
    <div className="flex flex-col items-start w-full">
      <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
        ¿Qué tipo de documento del representante legal vas a subir?
      </h2>

      <div className="space-y-3 w-full">
        {opciones.map((opt) => {
          const selected = seleccion === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSeleccion(opt.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150
                ${selected ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-muted hover:bg-muted/30'}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!seleccion}
        className={`mt-6 px-5 py-2 rounded-lg bg-black text-white transition-opacity
          ${!seleccion ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/80'}`}
      >
        Guardar y Continuar
      </button>
    </div>
  );
};

export default PreguntaTipoDocumento;