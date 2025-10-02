// src/pages/landing/FeaturesSection.jsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Brain, Monitor, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: Brain,
    title: "Análisis Potenciado por IA",
    description: "Nuestra tecnología lee y entiende tus documentos en minutos, no en días. Menos esperas, más estrategia para tu negocio.",
    gradient: "from-brand-primary to-brand-secondary",
  },
  {
    icon: Monitor,
    title: "Experiencia 100% Digital",
    description: "Olvídate de las sucursales y el papeleo. Tu solicitud, tus documentos y tu firma, todo desde la comodidad de tu oficina.",
    gradient: "from-brand-primary to-brand-secondary",
  },
  {
    icon: Shield,
    title: "Transparencia Radical",
    description: "Simula, entiende y controla. Nuestras condiciones son claras desde el primer momento. Sin sorpresas ni letra pequeña.",
    gradient: "from-brand-primary to-brand-secondary",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative bg-white dark:bg-black py-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white"
          >
            No solo es crédito, es{" "}
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              inteligencia financiera.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mt-4"
          >
            Hemos rediseñado el proceso de solicitud de crédito empresarial desde cero, pensando en la velocidad y la precisión que tu negocio merece.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 + 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="relative group h-full card-glass card-hover border-gray-200 dark:border-gray-800 p-8 hover:border-blue-500/40 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative z-10 space-y-4">
                    <div className="w-14 h-14 rounded-xl icon-gradient-bg icon-gradient-ring flex items-center justify-center shadow-lg icon-hover">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white">{benefit.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>

                  <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${benefit.gradient} rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}