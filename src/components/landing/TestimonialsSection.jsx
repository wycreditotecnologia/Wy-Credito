import React from 'react';

const TestimonialCard = ({ quote, author, company }) => {
  return (
    <figure className="p-6 border border-white/10 rounded-xl bg-gray-900/50">
      <blockquote className="text-gray-300">
        <p>"{quote}"</p>
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        {/* En el futuro aquí podría ir un avatar/logo */}
        <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex-shrink-0"></div>
        <div>
          <div className="font-bold text-white">{author}</div>
          <div className="text-sm text-gray-400">{company}</div>
        </div>
      </figcaption>
    </figure>
  );
};

const TestimonialsSection = () => {
  return (
    <section id="testimonios" className="py-16 md:py-24 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Empresas que <span className="text-cyan-400">aceleran con nosotros.</span>
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

export default TestimonialsSection;