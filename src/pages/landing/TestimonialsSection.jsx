// src/pages/landing/TestimonialsSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    quote: "La plataforma es intuitiva y el proceso 100% digital nos ahorró semanas de trabajo. El poder simular el crédito primero nos dio la confianza para aplicar.",
    author: "Ana María Rojas",
    role: "CEO, Innovatech Soluciones SAS",
    initials: "AR",
  },
  {
    quote: "Intentamos con la banca tradicional, pero el papeleo era interminable. Con Wy Credito, tuvimos una pre-aprobación en horas y el desembolso en 3 días. Insuperable.",
    author: "Carlos Gutierrez",
    role: "Gerente Financiero, Logística Andina",
    initials: "CG",
  },
  {
    quote: "Lo que más valoramos fue la transparencia. Cero letra pequeña y condiciones claras desde el principio. La tecnología de IA realmente agiliza todo.",
    author: "Sofia Estrada",
    role: "Fundadora, Café de la Sierra",
    initials: "SE",
  },
  {
    quote: "Como empresa de tecnología, valoramos la eficiencia. El análisis crediticio basado en IA nos permitió obtener mejores condiciones que cualquier banco. Proceso rápido y confiable.",
    author: "Juan David Vélez",
    role: "CTO, DataTech Analytics",
    initials: "JV",
  },
  {
    quote: "Necesitábamos capital para una importación urgente. El proceso fue tan ágil que pudimos cerrar el negocio sin contratiempos. Wy Credito entiende la velocidad del comercio.",
    author: "Laura Martínez",
    role: "Gerente de Compras, Retail Plus",
    initials: "LM",
  },
  {
    quote: "La experiencia de usuario es de otro nivel. Poder firmar electrónicamente y subir todo desde la oficina nos liberó para enfocarnos en la operación. 100% recomendado.",
    author: "Andrés Botero",
    role: "Director de Operaciones, Manufacturas BGA",
    initials: "AB",
  },
  {
    quote: "Más que un crédito, fue una asesoría. El equipo entendió nuestro modelo de negocio y nos ofreció una solución a la medida. Son verdaderos socios estratégicos.",
    author: "Isabella Londoño",
    role: "Fundadora, Creativos Digitales",
    initials: "IL",
  },
];

const duplicatedTestimonials = [...testimonials, ...testimonials];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative bg-white dark:bg-black py-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white"
        >
          Empresas que{" "}
          <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            confían en nosotros
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-lg text-gray-700 dark:text-gray-300"
        >
          Cientos de empresas ya están acelerando su crecimiento con Wy Credito.
        </motion.p>
      </div>

      <div className="relative group">
        <div className="flex gap-8 animate-infinite-scroll group-hover:[animation-play-state:paused]">
          {duplicatedTestimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.author}-${index}`}
              className="flex-shrink-0 w-[320px] sm:w-[400px] md:w-[500px]"
            >
              <div className="flex items-start gap-4 p-6">
                <Avatar className="w-12 h-12 flex-shrink-0 border-2 border-blue-500/30">
                  <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white font-bold">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {testimonial.quote}
                  </p>
                  <div>
                    <p className="font-semibold text-black dark:text-white">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-black to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-black to-transparent pointer-events-none" />
      </div>

      <style>{`
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 60s linear infinite;
          display: flex;
          width: max-content;
        }
      `}</style>
    </section>
  );
}