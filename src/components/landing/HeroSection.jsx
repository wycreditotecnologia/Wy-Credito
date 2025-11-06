import React from 'react';
// IMPORTACIONES ACTUALIZADAS
import { TextGenerateEffect } from '../ui/text-generate-effect';
import { ShimmerButton } from '../ui/shimmer-button';

const HeroSection = () => {
  const words = `Tu Futuro Empresarial. Financiado Hoy.`;

  return (
    <section className="relative w-full h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
      {/* NOTA: La integración de un fondo de partículas (react-tsparticles) puede ser compleja.
          Por ahora, nos enfocaremos en el contenido. Podemos añadir el fondo en un paso de pulido. */}
      
      <div className="z-10 flex flex-col items-center">
        {/* Usamos el efecto de escritura de Aceternity UI */}
        <TextGenerateEffect words={words} className="text-4xl md:text-6xl font-bold" />

        <p className="mt-4 max-w-2xl text-lg text-gray-300">
          Wy Credito transforma tus documentos en capital de trabajo. Accede a la financiación que necesitas con la velocidad que la tecnología IA permite.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <a href="#simulador">
            <ShimmerButton
              shimmerColor="#31C4E2" // Nuestro color cyan secundario para el brillo
              shimmerSize="0.1em"
              borderRadius="0.375rem" // Equivalente a rounded-md
              background="transparent"
              className="border border-cyan-500/50 text-white"
            >
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight lg:text-lg">
                Simula tu Crédito
              </span>
            </ShimmerButton>
          </a>
          
          <a href="#como-funciona" className="inline-flex h-12 items-center justify-center rounded-md border border-gray-700 bg-transparent px-6 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white">
            Conoce el Proceso
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;