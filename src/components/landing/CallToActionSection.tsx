"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CallToActionSection = () => {
    return (
        <section className="py-20 bg-white dark:bg-black relative overflow-hidden">

            {/* Grid Background applied to the section foundation */}
            <div className="absolute inset-0 z-0 bg-grid-lines opacity-50 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-slate-100 dark:border-gray-800 p-12 md:p-16 text-center relative overflow-hidden group">

                    {/* Subtle Glows inside the card */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-primary/10 transition-colors duration-700" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-secondary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-secondary/10 transition-colors duration-700" />

                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white font-heading mb-6 tracking-tight">
                        ¿Listo para <span className="text-brand-primary">impulsar tu empresa?</span>
                    </h2>

                    <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300 font-body mb-10 leading-relaxed">
                        Únete a cientos de empresas que ya han descubierto el poder de la financiación inteligente con IA.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/solicitud" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="w-full h-14 px-8 text-lg font-bold bg-brand-primary hover:bg-brand-hover text-white rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
                            >
                                Solicitar Crédito Ahora
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>

                        <Link href="/contacto" className="w-full sm:w-auto">
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full h-14 px-8 text-lg font-medium border-2 border-slate-200 dark:border-gray-700 text-wy-dark dark:text-white hover:bg-slate-50 dark:hover:bg-gray-800 rounded-lg hover:border-slate-300 dark:hover:border-gray-600 transition-all duration-300"
                            >
                                Hablar con un Asesor
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-slate-500 dark:text-slate-400 font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            Respuesta en 24h
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            100% Digital
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            Sin comisiones ocultas
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
