// src/pages/landing/HowItWorksSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Simula y Solicita",
    description: "Usa nuestro simulador para encontrar el monto y plazo que te convienen. Luego, inicia tu solicitud en menos de un minuto.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Completa tu Información",
    description: "Sigue los 7 pasos guiados de nuestro formulario seguro, adjuntando los documentos requeridos de forma 100% digital.",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Recibe tu Oferta",
    description: "Nuestro equipo, potenciado por IA, analizará tu solicitud en tiempo récord y se contactará contigo con una oferta personalizada.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative bg-white dark:bg-black py-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white"
          >
            Acceder a tu crédito es{" "}
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              muy sencillo.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mt-4"
          >
            Hemos optimizado cada etapa para que puedas concentrarte en tu negocio, no en el papeleo.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 + 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card className="relative h-full card-glass card-hover border-gray-200 dark:border-gray-800 p-8 hover:border-blue-500/40">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <span className="text-5xl font-bold bg-gradient-to-br from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                        {step.number}
                      </span>
                      <div className="w-12 h-12 rounded-lg icon-gradient-bg icon-gradient-ring flex items-center justify-center icon-hover">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button size="lg" asChild className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 shadow-lg shadow-blue-500/30">
            <Link to="/solicitud">
              Comenzar Ahora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}