import React from 'react';
import { Link } from 'react-router-dom';

const Step = ({ number, title, description }) => {
  return (
    <div className="relative pl-12 pb-8 border-l border-cyan-700/50">
      <div className="absolute left-0 top-0 -ml-6 flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 border-2 border-cyan-500 text-xl font-bold text-cyan-400">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-16 md:py-24 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Acceder a tu crédito es <span className="text-cyan-400">muy sencillo.</span>
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-gray-400">
            Hemos optimizado cada etapa para que puedas concentrarte en tu negocio, no en el papeleo.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Step
            number="01"
            title="Simula y Solicita"
            description="Usa nuestro simulador para encontrar el monto y plazo que te convienen. Luego, inicia tu solicitud en menos de un minuto."
          />
          <Step
            number="02"
            title="Completa tu Información"
            description="Sigue los 7 pasos guiados de nuestro formulario seguro, adjuntando los documentos requeridos de forma 100% digital."
          />
          <Step
            number="03"
            title="Recibe tu Oferta"
            description="Nuestro equipo, potenciado por IA, analizará tu solicitud en tiempo récord y se contactará contigo con una oferta personalizada."
          />
        </div>

        <div className="text-center mt-12">
          <Link
            to="/solicitud"
            className="inline-flex h-12 items-center justify-center rounded-md bg-cyan-500 px-8 text-lg font-medium text-white shadow transition-colors hover:bg-cyan-600"
          >
            Comenzar Ahora
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;