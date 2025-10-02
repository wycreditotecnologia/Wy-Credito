// src/pages/landing/HeroSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Zap, ShieldCheck } from 'lucide-react';

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-32">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-black" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e1e1e_1px,transparent_1px),linear-gradient(to_bottom,#1e1e1e_1px,transparent_1px)] bg-[size:6rem_4rem]" />
      
      {/* Glowing Orbs con Nueva Paleta */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl" // Azul principal
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl" // Cyan brillante
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* AI Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-brand-primary dark:text-blue-400" />
            <span className="text-sm text-brand-primary dark:text-blue-300">Impulsado por Inteligencia Artificial</span>
          </motion.div>

          {/* Headline con Nueva Paleta */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold max-w-5xl mx-auto text-black dark:text-white"
          >
            El Impulso Financiero que tu Empresa Necesita,{" "}
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              Ahora más Simple que Nunca.
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
          >
            En Wy Credito, transformamos el acceso a la financiación. Olvídate de la burocracia interminable y obtén el capital para crecer con un proceso 100% digital, ágil y transparente.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" asChild className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 shadow-lg shadow-blue-500/30">
              <Link to="/solicitud">
                <TrendingUp className="w-4 h-4 mr-2" />
                Inicia tu Solicitud Ahora
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-black dark:text-white border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/10">
              <a href="#features">Conocer Beneficios</a>
            </Button>
          </motion.div>
        
          {/* Key Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 max-w-4xl mx-auto"
          >
             {/* ... (contenido de beneficios sin cambios de color por ahora) ... */}
          </motion.div>
        </div>
      </div>
    </section>
  );
}