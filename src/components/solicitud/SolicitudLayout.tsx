"use client";

import { ReactNode } from "react";
import { CheckCircle2, Lightbulb } from "lucide-react";
import Image from "next/image";

interface SolicitudLayoutProps {
    children: ReactNode;
    currentStep: number;
    totalSteps: number;
}

const steps = [
    { number: 1, title: "Documento Base", subtitle: "Cámara de Comercio" },
    { number: 2, title: "Identidad Corporativa", subtitle: "Datos de la empresa" },
    { number: 3, title: "Contacto Legal", subtitle: "Representante legal" },
    { number: 4, title: "Salud Financiera", subtitle: "Estados financieros" },
    { number: 5, title: "Información Tributaria", subtitle: "Declaración de renta" },
    { number: 6, title: "Los Dueños", subtitle: "Composición accionaria" },
    { number: 7, title: "Configuración", subtitle: "Monto y plazo" },
    { number: 8, title: "Referencias", subtitle: "Contactos comerciales" },
    { number: 9, title: "Resumen", subtitle: "Radiografía final" },
];

export default function SolicitudLayout({ children, currentStep, totalSteps }: SolicitudLayoutProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-background-light dark:bg-background-dark">
            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 z-50 w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/assets/Logo Icono Wy.svg"
                            alt="Wy Crédito"
                            width={24}
                            height={24}
                            className="text-brand-primary"
                        />
                        <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Wy Crédito</span>
                    </div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Paso {currentStep} de {totalSteps}
                    </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                    <div
                        className="bg-brand-primary h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-[30%] min-w-[320px] max-w-[400px] flex-col justify-between bg-slate-900 text-white p-8 relative overflow-hidden">
                {/* Decorative gradient */}
                <div
                    className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at 10% 20%, #1337ec 0%, transparent 40%), radial-gradient(circle at 90% 90%, #6366f1 0%, transparent 40%)'
                    }}
                />

                <div className="relative z-10 flex flex-col h-full">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-12">
                        <Image
                            src="/assets/Logo Icono Wy.svg"
                            alt="Wy Crédito"
                            width={32}
                            height={32}
                            className="text-brand-primary"
                        />
                        <h1 className="text-2xl font-bold tracking-tight">Wy Crédito</h1>
                    </div>

                    {/* Vertical Stepper */}
                    <nav className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <ul className="flex flex-col gap-0">
                            {steps.map((step, index) => {
                                const isCompleted = currentStep > step.number;
                                const isActive = currentStep === step.number;
                                const isPending = currentStep < step.number;

                                return (
                                    <li
                                        key={step.number}
                                        className={`relative pb-8 flex gap-4 group ${index === steps.length - 1 ? 'last-step' : ''}`}
                                    >
                                        {/* Connector Line */}
                                        {index !== steps.length - 1 && (
                                            <div
                                                className={`absolute top-8 left-4 bottom-0 w-0.5 z-0 ${isCompleted ? 'bg-brand-primary' : 'bg-slate-700'
                                                    }`}
                                            />
                                        )}

                                        {/* Step Circle */}
                                        <div className={`relative z-10 flex-shrink-0 size-8 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                                                ? 'bg-brand-primary border-brand-primary text-white'
                                                : isActive
                                                    ? 'bg-white text-brand-primary border-brand-primary shadow-[0_0_0_4px_rgba(19,55,236,0.3)]'
                                                    : 'bg-transparent border-slate-600 text-slate-400'
                                            }`}>
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-4 h-4" />
                                            ) : (
                                                <span className="text-sm font-bold">{step.number}</span>
                                            )}
                                        </div>

                                        {/* Step Info */}
                                        <div className="pt-1">
                                            <p className={`text-sm font-semibold ${isActive ? 'text-white' : isPending ? 'text-slate-400' : 'text-white'
                                                }`}>
                                                {step.title}
                                            </p>
                                            <p className={`text-xs ${isActive ? 'text-blue-300' : 'text-slate-500'
                                                }`}>
                                                {step.subtitle}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Pro Tip Widget */}
                    <div className="mt-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
                        <div className="flex gap-3 mb-2">
                            <Lightbulb className="w-5 h-5 text-amber-400" />
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pro Tip</p>
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed">
                            Tener tus documentos listos antes de empezar puede acelerar el proceso de aprobación hasta en un 50%.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-y-auto w-full bg-background-light dark:bg-slate-950">
                {/* Top Actions */}
                <div className="absolute top-0 right-0 p-6 z-20 hidden lg:flex gap-4">
                    <button className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium text-sm transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">help</span>
                        Ayuda
                    </button>
                    <button className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 font-medium text-sm transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Guardar y Salir
                    </button>
                </div>

                {/* Content */}
                <div className="flex items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
}
