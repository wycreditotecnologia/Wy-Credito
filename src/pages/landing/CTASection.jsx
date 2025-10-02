// src/pages/landing/CTASection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative bg-white dark:bg-black py-32 overflow-hidden">
      {/* Background SVG Grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/50 to-white dark:from-black dark:via-blue-950/20 dark:to-black" />
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern-cta" width="72" height="72" patternUnits="userSpaceOnUse">
              <path d="M 72 0 L 0 0 0 72" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-800" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern-cta)" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-6xl mx-auto">
          {/* Glow effect */}
          <div className="absolute -inset-8 bg-gradient-to-r from-brand-primary/20 via-brand-secondary/20 to-brand-primary/20 rounded-3xl blur-3xl opacity-50 dark:opacity-70" />
          
          {/* Main card */}
          <div className="relative bg-white/70 dark:bg-black/70 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-12 md:p-16 text-center shadow-2xl">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-brand-primary/50 rounded-tl-2xl opacity-50" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-brand-secondary/50 rounded-tr-2xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-brand-secondary/50 rounded-bl-2xl opacity-50" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-brand-primary/50 rounded-br-2xl opacity-50" />

            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black dark:text-white">
                ¿Listo para{" "}
                <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                  impulsar tu empresa?
                </span>
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto text-lg">
                Únete a cientos de empresas que ya han descubierto el poder de la financiación inteligente con IA.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" asChild className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white shadow-lg shadow-blue-500/50 text-lg px-8 py-6 group w-full sm:w-auto">
                  <Link to="/solicitud">
                    Solicitar Crédito Ahora
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 w-full sm:w-auto text-black dark:text-white border-2 border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/10">
                  <a href="#">
                    Hablar con un Asesor
                  </a>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 pt-8 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Respuesta en 24h</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>100% Digital</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Sin comisiones ocultas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}