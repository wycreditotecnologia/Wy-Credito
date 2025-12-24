"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function ConfiguracionPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Preferencias de la aplicación.</p>
        <div className="p-4 rounded-lg border flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Tema</h2>
            <p className="text-sm text-muted-foreground">Cambiar entre claro y oscuro.</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

