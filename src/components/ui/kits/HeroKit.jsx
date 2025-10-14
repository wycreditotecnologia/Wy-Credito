// src/components/ui/kits/HeroKit.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';

/**
 * HeroKit
 * Hero reutilizable con fondo, gradientes y CTAs.
 * Permite configurar textos, colores, enlaces y visibilidad de elementos.
 */
export default function HeroKit({
  id = 'hero',
  showAIChip = true,
  headline = 'El Impulso Financiero que tu Empresa Necesita,',
  highlight = 'Ahora más Simple que Nunca.',
  subtitle = 'En Wy Credito, transformamos el acceso a la financiación. Olvídate de la burocracia interminable y obtén el capital para crecer con un proceso 100% digital, ágil y transparente.',
  gradientFrom = 'from-brand-primary',
  gradientTo = 'to-brand-secondary',
  primaryCta = { label: 'Inicia tu Solicitud Ahora', to: '/solicitud', icon: true },
  secondaryCta = { label: 'Conocer Beneficios', href: '#features' },
  showGridBackground = true,
  showDefaultContent = true,
  className = '',
  children,
}) {
  return (
    <section id={id} className={`relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-32 ${className}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-black" />
      {showGridBackground && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e1e1e_1px,transparent_1px),linear-gradient(to_bottom,#1e1e1e_1px,transparent_1px)] bg-[size:6rem_4rem]" />
      )}

      {/* Glowing Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {showDefaultContent && (
          <div className="text-center space-y-8">
            {/* AI Tag */}
            {showAIChip && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 text-brand-primary dark:text-blue-400" />
                <span className="text-sm text-brand-primary dark:text-blue-300">Impulsado por Inteligencia Artificial</span>
              </motion.div>
            )}

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold max-w-5xl mx-auto text-black dark:text-white"
            >
              {headline} {" "}
              <span className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
                {highlight}
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
            >
              {subtitle}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" asChild className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 shadow-lg shadow-blue-500/30">
                <Link to={primaryCta.to}>
                  {primaryCta.icon && <TrendingUp className="w-4 h-4 mr-2" />}
                  {primaryCta.label}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-black dark:text-white border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/10">
                <a href={secondaryCta.href}>{secondaryCta.label}</a>
              </Button>
            </motion.div>
          </div>
        )}
        {children && (
          <div className={showDefaultContent ? "mt-8" : ""}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}