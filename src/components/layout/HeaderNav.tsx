"use client";
import React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function HeaderNav({ currentStep, totalSteps, stepName }: { currentStep: number; totalSteps: number; stepName?: string }) {
  const progress = Math.round((currentStep / totalSteps) * 100);
  return (
    <div className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <div>
          <div className="text-sm text-zinc-400">Paso {currentStep} de {totalSteps}</div>
          {stepName && <div className="text-sm font-medium text-white">{stepName}</div>}
        </div>
        <ThemeToggle />
      </div>
      <div className="container mx-auto px-6 pb-3">
        <div className="h-2 w-full rounded-full bg-zinc-800">
          <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

