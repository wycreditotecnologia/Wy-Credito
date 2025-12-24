"use client";

import { motion } from "framer-motion";

interface ProgressRailProps {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  progress: number;
}

export function ProgressRail({ currentStep, totalSteps, stepName, progress }: ProgressRailProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Paso</span>
          <span className="font-semibold">{currentStep} de {totalSteps}</span>
        </div>
        <span className="text-muted-foreground">{Math.round(progress)}% completado</span>
      </div>
      
      <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{stepName}</h3>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < currentStep 
                  ? "bg-primary scale-110" 
                  : i === currentStep - 1
                  ? "bg-primary/60"
                  : "bg-secondary"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
