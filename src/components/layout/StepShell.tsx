"use client";
import React, { useMemo } from "react";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { SidebarChat } from "@/components/layout/SidebarChat";

export function StepShell({ currentStep, totalSteps, stepName, children }: { currentStep: number; totalSteps: number; stepName?: string; children: React.ReactNode }) {
  const name = useMemo(() => stepName, [stepName]);
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <HeaderNav currentStep={currentStep} totalSteps={totalSteps} stepName={name} />
      <div className="container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <div className="hidden lg:block">
          <SidebarChat />
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}

