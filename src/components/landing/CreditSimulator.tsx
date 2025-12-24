"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Info, ArrowRight, Calculator, Wallet, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function CreditSimulator() {
    const [amount, setAmount] = useState(50000000);
    const [term, setTerm] = useState(24);
    const [monthlyPayment, setMonthlyPayment] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Constants from Reference
    const MIN_AMOUNT = 5000000; // Reference min: 5M
    const MAX_AMOUNT = 200000000; // Reference max: 200M
    const MIN_TERM = 6;
    const MAX_TERM = 36; // Reference max: 36
    const ANNUAL_RATE = 0.28; // Reference rate: 28%

    // Calculations
    useEffect(() => {
        const calculatePayment = () => {
            const monthlyRate = ANNUAL_RATE / 12;
            if (monthlyRate > 0) {
                const payment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
                setMonthlyPayment(payment);
            } else {
                setMonthlyPayment(amount / term);
            }
        };
        calculatePayment();
    }, [amount, term]);

    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - amount;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <section id="simulador" className="py-24 pt-32 bg-slate-50 dark:bg-black relative overflow-hidden -mt-20 z-10">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] right-[-10%] w-[800px] h-[800px] bg-wy-primary/5 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-wy-secondary/5 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Side: Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wy-primary/10 border border-wy-primary/20">
                            <Calculator className="w-4 h-4 text-wy-primary" />
                            <span className="text-sm font-medium text-wy-primary">Simulador de Crédito</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-heading font-bold text-wy-dark dark:text-white leading-tight">
                            Proyecta tu Crecimiento. <span className="text-wy-secondary">Sin Compromisos.</span>
                        </h2>

                        <p className="text-xl text-slate-600 dark:text-gray-300 leading-relaxed font-body">
                            Sin complicaciones ni letra chica. Ajusta el monto y el plazo para encontrar el plan de pagos que mejor se adapte al flujo de caja de tu empresa.
                        </p>

                        <div className="space-y-6 pt-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                                    <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-wy-dark dark:text-white">Desembolso Inmediato</h3>
                                    <p className="text-slate-600 dark:text-gray-400">Recibe el dinero en tu cuenta en menos de 24 horas tras la aprobación.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                    <Banknote className="w-6 h-6 text-wy-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-wy-dark dark:text-white">Tasas Transparentes</h3>
                                    <p className="text-slate-600 dark:text-gray-400">Conoce exactamente cuánto pagarás desde el primer momento.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Simulator Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <Card className="border-0 shadow-2xl shadow-wy-primary/10 dark:shadow-[0_0_40px_rgba(59,130,246,0.2)] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl overflow-hidden relative ring-1 ring-black/5 dark:ring-white/10 card-glass">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-wy-primary via-wy-secondary to-wy-primary" />

                            <CardContent className="p-8 space-y-8">
                                {/* Amount Slider */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-bold text-wy-dark dark:text-white uppercase tracking-wide">
                                            Monto a Solicitar
                                        </label>
                                        <div className="text-2xl font-bold text-wy-primary">
                                            {formatCurrency(amount)}
                                        </div>
                                    </div>
                                    <Slider
                                        value={[amount]}
                                        onValueChange={(value) => setAmount(value[0])}
                                        min={MIN_AMOUNT}
                                        max={MAX_AMOUNT}
                                        step={1000000}
                                        className="py-4 cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>{formatCurrency(MIN_AMOUNT)}</span>
                                        <span>{formatCurrency(MAX_AMOUNT)}</span>
                                    </div>
                                </div>

                                {/* Term Slider */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-bold text-wy-dark dark:text-white uppercase tracking-wide">
                                            Plazo de Pago
                                        </label>
                                        <div className="text-2xl font-bold text-wy-primary">
                                            {term} Meses
                                        </div>
                                    </div>
                                    <Slider
                                        value={[term]}
                                        onValueChange={(value) => setTerm(value[0])}
                                        min={MIN_TERM}
                                        max={MAX_TERM}
                                        step={1}
                                        className="py-4 cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>{MIN_TERM} meses</span>
                                        <span>{MAX_TERM} meses</span>
                                    </div>
                                </div>

                                {/* Results Box */}
                                <div className="bg-blue-50/50 dark:bg-slate-900/60 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-8 space-y-6 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
                                            Cuota Mensual Estimada
                                        </p>
                                        <div className="text-5xl font-bold tracking-tight text-brand-primary drop-shadow-sm">
                                            {formatCurrency(monthlyPayment)}
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-blue-200/50 dark:border-blue-800/30 relative z-10">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600 dark:text-slate-300 font-medium">Total Intereses*</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalInterest)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full h-14 text-lg font-bold bg-brand-primary hover:bg-brand-hover text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] relative z-10 border-none rounded-xl"
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                    >
                                        Solicitar este Crédito
                                        <ArrowRight className={cn("ml-2 h-5 w-5 transition-transform duration-300", isHovered ? "translate-x-1" : "")} />
                                    </Button>

                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center relative z-10 leading-tight">
                                        *Cálculo aproximado. Tasa efectiva anual del 28%. Sujeto a estudio de crédito.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
