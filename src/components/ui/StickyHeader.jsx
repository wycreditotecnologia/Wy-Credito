import React from "react";
import { motion, useScroll } from "framer-motion";
import { Button } from "@/components/ui/button";

const nav = [
  { label: "Inicio", href: "/" },
  { label: "Cómo Funciona", href: "/#como-funciona" },
  { label: "Simulador", href: "/#simulador" },
  { label: "Beneficios", href: "/#beneficios" },
  { label: "Testimonios", href: "/#testimonios" },
];

export default function StickyHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 6));
    return () => unsub();
  }, [scrollY]);

  return (
    <motion.header
      className="sticky top-4 z-50 mx-auto w-full max-w-6xl"
      animate={{
        boxShadow: scrolled
          ? "0 8px 24px rgba(0,0,0,0.08)"
          : "0 2px 10px rgba(0,0,0,0.04)",
        backgroundColor: scrolled ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.6)",
      }}
      transition={{ type: "spring", stiffness: 180, damping: 24 }}
    >
      <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/60 px-4 py-2 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/60">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary" />
          <span className="font-semibold">Wy Credito</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          {nav.map((item) => (
            <a key={item.label} href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Simular Crédito</Button>
          <Button size="sm">Solicitar Crédito</Button>
        </div>
      </div>
    </motion.header>
  );
}