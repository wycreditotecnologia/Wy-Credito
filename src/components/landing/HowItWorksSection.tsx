import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, CheckCircle2 } from "lucide-react";

interface StepProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Step = ({ number, title, description, icon }: StepProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-800 relative group hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <span className="text-5xl font-bold text-brand-primary/20 font-heading">{number}</span>
        <div className="w-12 h-12 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-primary">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3 text-wy-dark dark:text-white font-heading">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 font-body leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
};

export const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-20 md:py-32 bg-white dark:bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-wy-dark dark:text-white font-heading mb-4">
            Acceder a tu crédito es <span className="text-brand-primary">muy sencillo.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 font-body">
            Hemos optimizado cada etapa para que puedas concentrarte en tu negocio, no en el papeleo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Step
            number="01"
            title="Simula y Solicita"
            description="Usa nuestro simulador para encontrar el monto y plazo que te convienen. Luego, inicia tu solicitud en menos de un minuto."
            icon={<FileText className="w-6 h-6" />}
          />
          <Step
            number="02"
            title="Completa tu Información"
            description="Sigue los 7 pasos guiados de nuestro formulario seguro, adjuntando los documentos requeridos de forma 100% digital."
            icon={<Sparkles className="w-6 h-6" />}
          />
          <Step
            number="03"
            title="Recibe tu Oferta"
            description="Nuestro equipo, potenciado por IA, analizará tu solicitud en tiempo récord y se contactará contigo con una oferta personalizada."
            icon={<CheckCircle2 className="w-6 h-6" />}
          />
        </div>

        <div className="text-center mt-16">
          <Button
            size="lg"
            className="h-14 px-8 rounded-lg text-lg font-medium bg-brand-secondary hover:bg-brand-hover text-white transition-all duration-300 shadow-lg shadow-blue-500/20 group"
            asChild
          >
            <Link href="/solicitud">
              Comenzar Ahora
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
