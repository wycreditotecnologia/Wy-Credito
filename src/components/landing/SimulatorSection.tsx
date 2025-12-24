
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Calculator } from "lucide-react";

export function SimulatorSection() {
  const [amount, setAmount] = useState(50000000);
  const [term, setTerm] = useState(12);

  const monthlyRate = 0.02;
  const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
  const totalPayment = monthlyPayment * term;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <section id="simulador" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Calculator className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Calculadora de Crédito</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
              Simula tu Crédito
            </h2>
            <p className="text-xl text-muted-foreground">
              Calcula cuánto puedes solicitar y cuál sería tu cuota mensual
            </p>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Calculadora Interactiva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Monto a solicitar</label>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <Slider
                  value={[amount]}
                  onValueChange={(value) => setAmount(value[0])}
                  min={10000000}
                  max={500000000}
                  step={5000000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$10M</span>
                  <span>$500M</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Plazo</label>
                  <span className="text-2xl font-bold text-primary">{term} meses</span>
                </div>
                <Slider
                  value={[term]}
                  onValueChange={(value) => setTerm(value[0])}
                  min={6}
                  max={60}
                  step={6}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>6 meses</span>
                  <span>60 meses</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Cuota mensual estimada</div>
                  <div className="text-3xl font-bold">{formatCurrency(monthlyPayment)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Total a pagar</div>
                  <div className="text-3xl font-bold">{formatCurrency(totalPayment)}</div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center pt-4">
                * Simulación con tasa de interés del 2% mensual. Los valores son aproximados y pueden variar según el análisis de crédito.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
