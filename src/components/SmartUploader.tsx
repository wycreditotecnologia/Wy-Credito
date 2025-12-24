"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Loader2, FileText, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SmartUploaderProps {
    solicitudId: string;
    tipoDocumento: string;
    label?: string;
    className?: string;
    onUploadSuccess?: () => void;
    disabled?: boolean;
}

export default function SmartUploader({
    solicitudId,
    tipoDocumento,
    label,
    className,
    onUploadSuccess,
    disabled = false
}: SmartUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const supabase = createClient();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = e.target.files?.[0];
            if (!file) return;

            if (file.type !== "application/pdf") {
                toast.error("Solo se permiten archivos PDF");
                return;
            }

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Usuario no autenticado");
                return;
            }

            // 1. Sanitizar nombre de archivo
            const fileExt = file.name.split(".").pop();
            const cleanName = `${Math.random()
                .toString(36)
                .substring(7)}_${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${solicitudId}/${tipoDocumento}/${cleanName}`;

            // 2. Subir a Storage
            const { error: uploadError } = await supabase.storage
                .from("documentos")
                .upload(filePath, file, {
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // 3. Registrar en Base de Datos
            const { data: existingDoc } = await supabase
                .from("documentos_adjuntos")
                .select("id")
                .eq("solicitud_id", solicitudId)
                .eq("tipo_documento", tipoDocumento)
                .single();

            let dbError;
            if (existingDoc) {
                const { error } = await supabase
                    .from("documentos_adjuntos")
                    .update({
                        storage_path: filePath,
                        ia_status: "pendiente",
                    })
                    .eq("id", existingDoc.id);
                dbError = error;
            } else {
                const { error } = await supabase.from("documentos_adjuntos").insert({
                    solicitud_id: solicitudId,
                    tipo_documento: tipoDocumento,
                    storage_path: filePath,
                    ia_status: "pendiente",
                });
                dbError = error;
            }

            if (dbError) throw dbError;

            setFileName(file.name);
            setUploaded(true);
            if (onUploadSuccess) onUploadSuccess();
            toast.success("Documento subido correctamente");
        } catch (error: any) {
            console.error("Error uploading:", JSON.stringify(error, null, 2));
            toast.error(
                "Error al subir el documento: " + (error.message || "Error desconocido")
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div
            className={cn(
                "flex flex-col gap-3 p-5 border rounded-xl bg-white dark:bg-zinc-950/50 shadow-sm transition-all hover:shadow-md",
                uploaded ? "border-green-200 dark:border-green-900/50" : "border-slate-200 dark:border-zinc-800",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <span className="font-semibold text-sm md:text-base text-slate-800 dark:text-slate-200">
                    {label || tipoDocumento}
                </span>
                {uploaded && (
                    <span className="flex items-center text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full border border-green-200 dark:border-green-900/50">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Listo
                    </span>
                )}
            </div>

            <div className="relative group">
                {uploaded ? (
                    <div className="flex items-center p-4 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-dashed border-slate-300 dark:border-zinc-700">
                        <FileText className="w-6 h-6 text-brand-primary mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                {fileName || "Documento subido"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                                Listo para procesar
                            </p>
                        </div>

                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                                setUploaded(false);
                                setFileName(null);
                                document
                                    .getElementById(`file-${solicitudId}-${tipoDocumento}`)
                                    ?.click();
                            }}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            title="Reemplazar archivo"
                        >
                            <Upload className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <label
                        htmlFor={`file-${solicitudId}-${tipoDocumento}`}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200",
                            "border-slate-300 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/50",
                            "hover:bg-slate-50 dark:hover:bg-zinc-900 hover:border-brand-primary/50 dark:hover:border-brand-secondary/50",
                            (uploading || disabled) ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                        )}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                            {uploading ? (
                                <>
                                    <Loader2 className="w-8 h-8 mb-3 text-brand-primary animate-spin" />
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        Subiendo documento...
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm mb-3">
                                        <Upload className="w-6 h-6 text-brand-primary dark:text-brand-secondary" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Click para subir PDF
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-500">
                                        O arrastra y suelta aquí
                                    </p>
                                </>
                            )}
                        </div>
                    </label>
                )}

                <input
                    id={`file-${solicitudId}-${tipoDocumento}`}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading || disabled}
                />
            </div>
        </div>
    );
}
