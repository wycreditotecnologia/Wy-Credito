import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import SignupFormDemo from '@/components/ui/SignupFormDemo.jsx';
import ProgressTimeline from '@/components/ui/ProgressTimeline.jsx';
import HeaderKit from '@/components/ui/kits/HeaderKit.jsx';
import HeroKit from '@/components/ui/kits/HeroKit.jsx';

export default function UiShowcase() {
  const steps = ['Empresa', 'Representante', 'Financiero', 'Garantía', 'Documentación', 'Referencias', 'Resumen'];

  return (
    <div className="min-h-screen relative">
      {/* Fondo sutil */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-white" />
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <HeaderKit />
      <HeroKit />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Kits UI Wy Credito</h1>
          <p className="text-neutral-600 mt-2">Componentes oficiales reutilizables para la ruta /solicitud</p>
        </div>

        {/* Timeline */}
        <div className="mt-10">
          <Card className="p-6 bg-white/90 backdrop-blur shadow-md">
            <h2 className="text-lg font-semibold">Kit Progreso de Solicitud</h2>
            <p className="text-sm text-muted-foreground">Indicador de progreso oficial para la ruta /solicitud</p>
            <div className="mt-4">
              <ProgressTimeline steps={steps} currentStep={3} />
            </div>
          </Card>
        </div>

        {/* Botones */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white/90 backdrop-blur shadow-md">
            <h2 className="text-lg font-semibold">Kit Botones de Acción</h2>
            <p className="text-sm text-muted-foreground">Conjunto de botones oficiales con variantes y microinteracciones</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button>Acción</Button>
              <Button variant="outline">Secundario</Button>
              <Button variant="ghost">Ghost</Button>
              <ShimmerButton>Primario Destacado</ShimmerButton>
            </div>
          </Card>

          <Card className="p-6 bg-white/90 backdrop-blur shadow-md">
            <h2 className="text-lg font-semibold">Kit Tarjetas Informativas</h2>
            <p className="text-sm text-muted-foreground">Tarjetas base para módulos de información y estados</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1,2,3,4].map((i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-20 rounded bg-neutral-100" />
                    <p className="mt-3 text-sm text-muted-foreground">Card {i}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Signup Form Demo (Aceternity) */}
        <div className="mt-10">
          <Card className="p-6 bg-white/90 backdrop-blur shadow-md">
            <h2 className="text-lg font-semibold">Kit Formulario de Registro</h2>
            <p className="text-sm text-muted-foreground">Formulario de registro adaptado a Wy Credito, sin login social</p>
            <div className="mt-4">
              <SignupFormDemo />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}