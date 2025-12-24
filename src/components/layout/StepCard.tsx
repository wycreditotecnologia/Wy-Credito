"use client";
import React from "react";

export function StepCard({ title, subtitle, children }: { title?: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
      <div className="px-6 pt-6">
        {title && <h2 className="text-2xl font-montserrat font-bold mb-1">{title}</h2>}
        {subtitle && <p className="text-zinc-400 mb-4">{subtitle}</p>}
      </div>
      <div className="px-6 pb-6">
        {children}
      </div>
    </div>
  );
}

