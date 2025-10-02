import React from 'react';
// Importamos los íconos que representan cada beneficio
import { BrainCircuit, Fingerprint, TrendingUp } from 'lucide-react';

const FeatureCard = ({ icon, title, children }) => {
  return (
    <div className="flex flex-col items-start p-6 border border-white/10 rounded-xl bg-gray-900/50">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-cyan-900/50 text-cyan-400">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{children}</p>
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <section id="beneficios" className="py-16 md:py-24 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            No solo es crédito, es <span className="text-cyan-400">inteligencia financiera.</span>
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-gray-400">
            Hemos rediseñado el proceso de solicitud de crédito empresarial desde cero, pensando en la velocidad y la precisión que tu negocio merece.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BrainCircuit size={24} />}
            title="Análisis Potenciado por IA"
          >
            Nuestra tecnología lee y entiende tus documentos en minutos, no en días. Menos esperas, más estrategia para tu negocio.
          </FeatureCard>
          <FeatureCard
            icon={<Fingerprint size={24} />}
            title="Experiencia 100% Digital"
          >
            Olvídate de las sucursales y el papeleo. Tu solicitud, tus documentos y tu firma, todo desde la comodidad de tu oficina.
          </FeatureCard>
          <FeatureCard
            icon={<TrendingUp size={24} />}
            title="Transparencia Radical"
          >
            Simula, entiende y controla. Nuestras condiciones son claras desde el primer momento. Sin sorpresas ni letra pequeña.
          </FeatureCard>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;