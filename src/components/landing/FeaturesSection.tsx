"use client";

import React from "react";
import { BrainCircuit, Fingerprint, TrendingUp } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const FeatureCard = ({ icon, title, children }: FeatureCardProps) => {
  return (
    <div className="flex flex-col items-start p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 group">
      <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-wy-dark dark:text-white font-heading">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm font-body leading-relaxed">{children}</p>
    </div>
  );
};

export const FeaturesSection = () => {
  return (
    <section id="beneficios" className="py-24 bg-wy-light dark:bg-black relative">
      {/* Background subtle decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[5%] w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-wy-dark dark:text-white font-heading mb-4">
            No solo es crédito, es <span className="text-brand-primary">inteligencia financiera.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 font-body">
            Hemos rediseñado el proceso de solicitud de crédito empresarial desde cero, pensando en la velocidad y la precisión que tu negocio merece.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BrainCircuit className="w-7 h-7 text-white" />}
            title="Análisis Potenciado por IA"
          >
            Nuestra tecnología lee y entiende tus documentos en minutos, no en días. Menos esperas, más estrategia para tu negocio.
          </FeatureCard>
          <FeatureCard
            icon={<Fingerprint className="w-7 h-7 text-white" />}
            title="Experiencia 100% Digital"
          >
            Olvídate de las sucursales y el papeleo. Tu solicitud, tus documentos y tu firma, todo desde la comodidad de tu oficina.
          </FeatureCard>
          <FeatureCard
            icon={<TrendingUp className="w-7 h-7 text-white" />}
            title="Transparencia Radical"
          >
            Simula, entiende y controla. Nuestras condiciones son claras desde el primer momento. Sin sorpresas ni letra pequeña.
          </FeatureCard>
        </div>
      </div>
    </section>
  );
};
