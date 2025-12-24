"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Loader2, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StepProps {
    applicationId: string | null;
    userId: string;
    onNext: (data: any) => void;
    onBack?: () => void;
    onApplicationCreated: (id: string) => void;
}

export default function StepSmartFilter({
    applicationId,
    userId,
    onNext,
    onBack,
    onApplicationCreated
}: StepProps) {
    const supabase = createClient();
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [isWaiting, setIsWaiting] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canContinue, setCanContinue] = useState(false);
    const [createdAppId, setCreatedAppId] = useState<string | null>(applicationId);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Solo se permiten archivos PDF");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("El archivo no debe superar 10MB");
            return;
        }

        setUploading(true);

        try {
            // 1. Crear solicitud si no existe
            let currentAppId = applicationId;
            if (!currentAppId) {
                const { data: newApp, error: appError } = await supabase
                    .from("solicitudes")
                    .insert({ user_id: userId, estado: "borrador", step_actual: 1 })
                    .select()
                    .single();

                if (appError) throw appError;
                currentAppId = newApp.id;
                setCreatedAppId(currentAppId); // Guardar en estado
                if (currentAppId) {
                    onApplicationCreated(currentAppId);
                }
            }

            // Verificar que tenemos un ID válido
            if (!currentAppId) {
                throw new Error("No se pudo crear la solicitud");
            }

            // 2. Subir archivo a Storage
            const fileName = `${userId}/${currentAppId}/camara_comercio/camara_comercio_${Date.now()}.pdf`;
            const { error: uploadError } = await supabase.storage
                .from("documentos")
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 3. Registrar en documentos_adjuntos
            const { error: docError } = await supabase
                .from("documentos_adjuntos")
                .insert({
                    solicitud_id: currentAppId,
                    tipo_documento: "camara_comercio",
                    nombre_archivo: file.name,
                    storage_path: fileName,
                });

            if (docError) throw docError;

            setUploadedFile(file.name);
            setUploading(false);
            toast.success("✅ Documento recibido");

            // Iniciar countdown de 60 segundos
            setIsWaiting(true);
            let timeLeft = 60;
            const countdownInterval = setInterval(() => {
                timeLeft--;
                setCountdown(timeLeft);

                if (timeLeft <= 0) {
                    clearInterval(countdownInterval);
                    setIsWaiting(false);
                    setCanContinue(true);
                    toast.success("✅ Análisis completado. Puedes continuar.");
                }
            }, 1000);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al subir documento");
            setUploading(false);
        }
    };

    const handleContinue = async () => {
        // VALIDACIÓN ON-CLICK: Verificar que los datos de empresa existan
        // NOTA: Esto es opcional - si falla, igual dejamos avanzar

        const appIdToUse = createdAppId || applicationId;

        if (!appIdToUse) {
            console.warn("No hay applicationId disponible");
            onNext({ companyData: {} });
            return;
        }

        try {
            const { data: empresaData, error } = await supabase
                .from('empresas')
                .select('*')
                .eq('solicitud_id', appIdToUse) // CORREGIDO: usar solicitud_id
                .maybeSingle();

            if (error) {
                console.warn("No se pudieron cargar datos de empresa (puede ser normal si n8n aún no terminó):", error);
                // No bloqueamos - los datos se cargarán en Paso 2
                onNext({ companyData: {} });
                return;
            }

            if (!empresaData || !empresaData.razon_social) {
                console.log("Empresa aún no procesada por n8n. Datos se cargarán en Paso 2.");
                toast.info("ℹ️ Los datos de empresa se cargarán en el siguiente paso");
            } else {
                console.log("Datos de empresa encontrados:", empresaData.razon_social);
            }

            // Avanzar con los datos disponibles (o vacío si no hay)
            onNext({ companyData: empresaData || {} });

        } catch (err) {
            console.error("Error inesperado verificando empresa:", err);
            // Igual dejamos avanzar
            onNext({ companyData: {} });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Documento Base 📄
                </h2>
                <p className="text-slate-500 dark:text-zinc-400">
                    Sube tu Cámara de Comercio actualizada. Esperaremos 1 minuto para el análisis.
                </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
                <label className={`
                    relative flex flex-col items-center justify-center w-full h-64 
                    border-2 border-dashed rounded-lg cursor-pointer
                    transition-all duration-200
                    ${uploading || uploadedFile
                        ? "border-brand-primary bg-brand-primary/5"
                        : "border-slate-300 dark:border-zinc-700 hover:border-brand-primary hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                    }
                `}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="p-4 bg-white dark:bg-zinc-800 rounded-full shadow-lg mb-4">
                            {uploading ? (
                                <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                            ) : uploadedFile ? (
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            ) : (
                                <FileText className="w-10 h-10 text-brand-primary" />
                            )}
                        </div>
                        <p className="mb-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
                            {uploading ? "Subiendo documento..." : uploadedFile ? "✅ Documento cargado" : "Cargar Cámara de Comercio"}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            PDF (Máx. 10MB)
                        </p>
                    </div>
                    <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading || uploadedFile !== null}
                    />
                </label>

                {uploadedFile && (
                    <Card className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 animate-in fade-in zoom-in duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Documento cargado exitosamente</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isWaiting && (
                    <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 animate-in fade-in zoom-in duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                <div className="flex-1">
                                    <p className="font-medium text-blue-700 dark:text-blue-400">
                                        Analizando documento...
                                    </p>
                                    <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                                        Por favor espera {countdown} segundos
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-mono font-bold">{countdown}s</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {canContinue && (
                    <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800 animate-in fade-in zoom-in duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">✅ Análisis completado. Puedes avanzar.</span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="flex justify-between pt-4">
                {onBack && (
                    <Button type="button" variant="ghost" onClick={onBack}>
                        Atrás
                    </Button>
                )}
                <Button
                    onClick={handleContinue}
                    className="ml-auto bg-brand-primary text-white hover:bg-brand-primary/90"
                    disabled={!canContinue}
                >
                    Continuar
                </Button>
            </div>
        </div>
    );
}
