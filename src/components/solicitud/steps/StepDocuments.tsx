"use client";

import SmartUploader from "@/components/SmartUploader";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StepProps {
    applicationId: string;
    onNext: (data: any) => void;
    onBack: () => void;
}

export default function StepDocuments({ applicationId, onNext, onBack }: StepProps) {
    return (
        <div className="space-y-8 py-4">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Documentación Requerida
                </h2>
                <p className="text-lg text-slate-500 dark:text-zinc-400">
                    Sube tus documentos en formato PDF. Nuestra IA los analizará automáticamente.
                </p>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="ml-2">
                    <AlertTitle className="font-bold">Análisis Inteligente</AlertTitle>
                    <AlertDescription className="text-sm opacity-90">
                        Al subir tus estados financieros, nuestro motor de IA extraerá los indicadores clave para agilizar tu crédito.
                    </AlertDescription>
                </div>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2">
                <SmartUploader
                    solicitudId={applicationId}
                    tipoDocumento="estados_financieros"
                    label="Estados Financieros (Balance / PyG)"
                />
                <SmartUploader
                    solicitudId={applicationId}
                    tipoDocumento="declaracion_renta"
                    label="Declaración de Renta"
                />
                <SmartUploader
                    solicitudId={applicationId}
                    tipoDocumento="composicion_accionaria"
                    label="Composición Accionaria"
                />
                <SmartUploader
                    solicitudId={applicationId}
                    tipoDocumento="camara_comercio"
                    label="Cámara de Comercio"
                />
            </div>

            <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" size="lg" onClick={onBack} className="px-8 py-6 text-lg border-slate-200 rounded-xl">
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Atrás
                </Button>
                <Button
                    onClick={() => onNext({})}
                    size="lg"
                    className="flex-grow md:flex-none px-12 py-6 text-lg bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                    Continuar
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
