"use client";

import React from "react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  company: string;
}

const TestimonialCard = ({ quote, author, company }: TestimonialCardProps) => {
  return (
    <figure className="p-8 border border-slate-50 dark:border-white/5 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
      <blockquote className="text-slate-600 dark:text-gray-300 font-body text-lg leading-relaxed mb-6">
        "{quote}"
      </blockquote>
      <figcaption className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-brand-primary flex flex-shrink-0 items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-primary/20">
          {author.charAt(0)}{author.split(" ")[1]?.charAt(0)}
        </div>
        <div>
          <div className="font-bold text-wy-dark dark:text-white font-heading text-base">{author}</div>
          <div className="text-sm text-slate-500 dark:text-gray-400 font-medium">{company}</div>
        </div>
      </figcaption>
    </figure>
  );
};

export const TestimonialsSection = () => {
  return (
    <section id="testimonios" className="py-24 md:py-32 bg-slate-50 dark:bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-wy-dark dark:text-white font-heading">
            Empresas que <span className="text-brand-primary">confían en nosotros.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard
            quote="Intentamos con la banca tradicional, pero el proceso era increíblemente lento. Con Wy Credito, tuvimos una respuesta y desembolso en tiempo récord. Fue un cambio total para nuestro flujo de caja."
            author="Ana María Rojas"
            company="CEO, Innovatech Soluciones SAS"
          />
          <TestimonialCard
            quote="La plataforma es intuitiva y el proceso 100% digital nos ahorró semanas de trabajo. El poder simular el crédito primero nos dio la confianza para aplicar. Totalmente recomendados."
            author="Carlos Gutierrez"
            company="Gerente Financiero, Logística Andina"
          />
          <TestimonialCard
            quote="Lo que más valoramos fue la transparencia. Cero letra pequeña y condiciones claras desde el principio. La tecnología de IA realmente agiliza el análisis de documentos. Impresionante."
            author="Sofia Vergara"
            company="Fundadora, Café de Origen La Sierra"
          />
        </div>
      </div>
    </section>
  );
};
