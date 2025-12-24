"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, Clock } from "lucide-react";
import SmartUploader from "@/components/SmartUploader";
import { toast } from "sonner";

interface StepProps {
    applicationId: string;
    onNext: (data: any) => void;
    onBack?: () => void;
}

export default function StepShareholders({ applicationId, onNext, onBack }: StepProps) {
    const supabase = createClient();
    const [uploadComplete, setUploadComplete] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canContinue, setCanContinue] = useState(false);

    const onUploadSuccess = () => {
        setUploadComplete(true);
        setIsWaiting(true);

        // Iniciar countdown de 30 segundos
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
    };

    const handleContinue = async () => {
        // VALIDACIÓN ON-CLICK: Verificar que los datos existan antes de avanzar
        const { data: shareholdersData, error } = await supabase
            .from('composicion_accionaria')
            .select('*')
            .eq('solicitud_id', applicationId);

        if (error) {
            toast.error("Error verificando composición accionaria");
            console.error("Error query shareholders:", error);
            return;
        }

        if (!shareholdersData || shareholdersData.length === 0) {
            toast.warning("⏳ Aún estamos procesando tu documento. Intenta en 10 segundos.");
            return;
        }

        // Datos validados, avanzar
        console.log(`Composición accionaria encontrada. ${shareholdersData.length} socios procesados.`);
        onNext({ shareholdersData });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Los Dueños 👥
                </h2>
                <p className="text-slate-500 dark:text-zinc-400">
                    Sube el Certificado de Composición Accionaria. Esperaremos 1 minuto para el análisis.
                </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
                <SmartUploader
                    solicitudId={applicationId}
                    tipoDocumento="composicion_accionaria"
                    label="Certificado Accionaria (Revisor Fiscal)"
                    onUploadSuccess={onUploadSuccess}
                    disabled={uploadComplete}
                />

                {uploadComplete && (
                    <Card className="bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800 animate-in fade-in zoom-in duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 text-purple-700 dark:text-purple-400">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Documento cargado exitosamente</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isWaiting && (
                    <Card className="bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 animate-in fade-in zoom-in duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                                <div className="flex-1">
                                    <p className="font-medium text-indigo-700 dark:text-indigo-400">
                                        Analizando documento...
                                    </p>
                                    <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
                                        Por favor espera {countdown} segundos
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-indigo-600">
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
