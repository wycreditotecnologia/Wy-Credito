
"use client";

import { Progress } from "@/components/ui/progress";

interface ApplicationStepperProps {
  currentStep: number;
  totalSteps: number;
}

const stepNames = [
  "Información de Empresa",
  "Documentación Legal",
  "Información Financiera",
  "Referencias Comerciales",
  "Declaraciones y Aceptación",
  "Garantía Mobiliaria",
  "Revisión y Envío",
];

export function ApplicationStepper({ currentStep, totalSteps }: ApplicationStepperProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-zinc-400">
            Paso {currentStep} de {totalSteps}
          </div>
          <div className="text-sm font-medium text-white">
            {stepNames[currentStep - 1]}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
