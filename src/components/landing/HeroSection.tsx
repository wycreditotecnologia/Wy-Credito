"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const HeroSection = () => {
  return (
    <section
      id="inicio"
      className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4 overflow-visible pt-32 pb-40"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 bg-gray-50 dark:bg-black" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-grid-lines opacity-100" />

      {/* Orbes Resplandecientes */}
      {/* Orb Azul */}
      <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-3xl animate-pulse-slow mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      {/* Orb Cyan */}
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-brand-secondary/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

      <div className="z-20 flex flex-col items-center max-w-5xl mx-auto animate-in slide-in-from-bottom-10 duration-700 fade-in">

        {/* AI Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-brand-primary backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          <span>Impulsado por Inteligencia Artificial</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-heading text-wy-dark dark:text-white leading-[1.1]">
          El Impulso Financiero que tu{" "}
          <br className="hidden md:block" />
          Empresa Necesita,{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
            Ahora más <br className="hidden md:block" /> Simple que Nunca.
          </span>
        </h1>

        <p className="mt-4 max-w-3xl text-lg md:text-xl text-gray-600 dark:text-gray-300 font-body leading-relaxed mb-10">
          En Wy Crédito, transformamos el acceso a la financiación. Olvídate de la burocracia interminable y obtén el capital para crecer con un proceso 100% digital, ágil y transparente.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-[1.02] border-0"
            asChild
          >
            <Link href="/solicitud">
              Inicia tu Solicitud Ahora
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-14 px-8 text-lg font-medium border-wy-dark/20 text-wy-dark hover:bg-wy-light dark:border-white/20 dark:text-white dark:hover:bg-white/10"
            asChild
          >
            <Link href="#beneficios" className="w-full sm:w-auto">
              Conocer Beneficios
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
