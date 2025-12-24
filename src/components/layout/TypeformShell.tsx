"use client";

import { ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import { SidebarChatDock } from "./SidebarChatDock";
import { ProgressRail } from "./ProgressRail";
import { ThemeToggle } from "../ui/ThemeToggle";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

interface TypeformShellProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  stepName: string;
}

export function TypeformShell({ children, currentStep, totalSteps, stepName }: TypeformShellProps) {
  const progress = (currentStep / totalSteps) * 100;
  const [chatOpen, setChatOpen] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/next_api/drive/status")
      .then((r) => r.json())
      .then((j) => {
        if (mounted) setDriveConnected(Boolean(j?.connected));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* Header con Progress Rail */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-primary h-28">
        <div className="flex items-start h-full px-8 pt-3 pb-1">
          <div className="flex-1">
            <ProgressRail 
              currentStep={currentStep} 
              totalSteps={totalSteps} 
              stepName={stepName}
              progress={progress}
            />
          </div>
          <div className="ml-8 flex items-center gap-3">
            <ThemeToggle />
            {driveConnected && (
              <span className="text-xs px-2 py-1 rounded border border-primary text-primary">Drive conectado</span>
            )}
          </div>
        </div>
      </header>

      {/* Layout principal */}
      <div className="flex h-[calc(100vh-7rem)] mt-28">
        {/* Sidebar izquierdo - Navegación */}
        <aside className="w-20 border-r border-primary/40 bg-background h-full">
          <SidebarNav />
        </aside>

        {/* Sidebar derecho - Chat (colapsable) */}
        {chatOpen && (
          <aside className="w-[380px] h-full px-2">
            <div className="h-full bg-background/95 backdrop-blur-sm border-r border-primary/40">
              <SidebarChatDock onClose={() => setChatOpen(false)} />
            </div>
          </aside>
        )}

        {/* Contenido principal */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto relative">
          <div className="min-h-full flex items-center justify-center px-12 py-12">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl"
            >
              {children}
            </motion.div>
          </div>

          {/* Botón flotante para abrir chat */}
          {!chatOpen && (
            <div className="absolute top-4 left-4 z-40 flex items-center gap-3">
              <Button
                size="icon"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setChatOpen(true)}
                title="Pregunta aquí a Wally"
              >
                <Bot className="w-5 h-5" />
              </Button>
              <span className="text-sm font-semibold">Pregunta aquí a Wally</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
