import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative mx-auto mt-24 w-full max-w-6xl px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_60%)]" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <span className="inline-block rounded-full border border-blue-200/50 bg-blue-50 px-3 py-1 text-xs text-blue-600 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300">
          Impulsado por Inteligencia Artificial
        </span>
        <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
          El Impulso Financiero que tu Empresa Necesita,
          <br />
          <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            Ahora más Simple que Nunca.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Transformamos el acceso a la financiación con un proceso 100% digital, ágil y transparente.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button size="sm" className="px-4">Inicia tu Solicitud Ahora</Button>
          <Button size="sm" variant="outline" className="px-4">Conocer Beneficios</Button>
        </div>
      </motion.div>
    </section>
  );
}