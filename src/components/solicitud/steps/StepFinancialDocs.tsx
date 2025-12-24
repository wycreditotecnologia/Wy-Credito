"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import SmartUploader from "@/components/SmartUploader";

interface StepProps {
    applicationId: string;
    onNext: (data: any) => void;
    onBack?: () => void;
}

export default function StepFinancialDocs({ applicationId, onNext, onBack }: StepProps) {
    // Estado local para trackear si ya subió los docs obligatorios (opcional, por ahora dependemos de la visual del uploader)
    // En una implementación más estricta, SmartUploader debería tener un callback onUploadSuccess

    const handleContinue = () => {
        // Aquí podríamos validar si existen los documentos en la base de datos antes de dejar pasar
        onNext({});
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Soportes Financieros
                </h2>
                <p className="text-slate-500 dark:text-zinc-400">
                    Para aprobar tu cupo, necesitamos validar la salud financiera de tu empresa.
                </p>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-700 dark:text-blue-300">Tips de aprobación</AlertTitle>
                <AlertDescription className="text-blue-600 dark:text-blue-400 text-xs">
                    Sube documentos recientes (2023-2024) y asegúrate de que sean legibles y estén firmados.
                </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <SmartUploader
                    solicitudId={applicationId}
                    tipoDocumento="estados_financieros"
                    label="Estados Financieros (Año reciente)"
                />
                <SmartUploader
                    solicitudId={applicationId}
                    tipoDocumento="declaracion_renta"
                    label="Declaración de Renta"
                />
                <SmartUploader
                    solicitudId={applicationId}
                    tipoDocumento="composicion_accionaria"
                    label="Certificado de Socios / Accionaria"
                />
            </div>

            <div className="flex justify-between pt-8">
                {onBack && (
                    <Button type="button" variant="ghost" onClick={onBack}>
                        Atrás
                    </Button>
                )}
                <Button onClick={handleContinue} className="ml-auto bg-brand-primary text-white hover:bg-brand-primary/90">
                    Continuar
                </Button>
            </div>
        </div>
    );
}
