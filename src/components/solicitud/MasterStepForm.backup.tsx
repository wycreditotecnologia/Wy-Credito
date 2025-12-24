"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

// Pasos Importados
import StepSmartFilter from "./steps/StepSmartFilter";
import StepCorporateIdentity from "./steps/StepCorporateIdentity";
import StepLegalContact from "./steps/StepLegalContact";
import StepFinancialStatements from "./steps/StepFinancialStatements";
import StepTaxInfo from "./steps/StepTaxInfo";
import StepShareholders from "./steps/StepShareholders";
import StepCreditConfig from "./steps/StepCreditConfig";
import StepReferences from "./steps/StepReferences";
import StepSummary from "./steps/StepSummary";

interface MasterStepFormProps {
    applicationId: string | null;
    initialStep?: number;
    initialData?: any;
    userId: string;
}

export default function MasterStepForm({
    applicationId: initialAppId,
    initialStep = 1,
    initialData = {},
    userId
}: MasterStepFormProps) {
    const [applicationId, setApplicationId] = useState<string | null>(initialAppId);
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [formData, setFormData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [direction, setDirection] = useState(0);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const supabase = createClient();

    const totalSteps = 9;
    const progress = (currentStep / totalSteps) * 100;

    // RESUME DRAFT LOGIC
    useEffect(() => {
        const resumeDraft = async () => {
            // Si ya viene con ID por props (ej. edit mode), no chequeamos
            // O si no hay userId válido aún
            if (applicationId || !userId) {
                if (applicationId) setIsCheckingSession(false);
                return;
            }

            console.log("MasterStepForm: Verificando sesiones/borradores activos para", userId);

            try {
                // Buscamos borrador, en_revision o correccion_solicitada
                const { data: drafts } = await supabase
                    .from('solicitudes')
                    .select('*')
                    .eq('user_id', userId)
                    .in('estado', ['borrador', 'en_revision', 'correccion_solicitada'])
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (drafts && drafts.length > 0) {
                    const draft = drafts[0];
                    console.log("MasterStepForm: Borrador encontrado:", draft);

                    // 1. Recuperar info de la empresa asociada (Self-Healing)
                    let companyData = {};
                    const { data: company } = await supabase
                        .from('empresas')
                        .select('*')
                        .eq('solicitud_id', draft.id) // CORREGIDO: usar solicitud_id
                        .maybeSingle();

                    if (company) {
                        console.log("Datos de empresa recuperados con éxito:", company);
                        companyData = company;
                    }

                    // RESTAURAR ESTADO
                    setApplicationId(draft.id);
                    setFormData((prev: any) => ({ ...prev, ...draft, companyData: companyData }));

                    // Lógica de recuperación de paso
                    if (draft.step_actual && draft.step_actual > 1) {
                        setCurrentStep(draft.step_actual);
                    } else {
                        // Fallback Inteligente: Si hay borrador, asumimos al menos paso 2
                        setCurrentStep(2);
                    }

                    toast.info("Sesión recuperada. Continuando donde lo dejaste.");
                } else {
                    console.log("MasterStepForm: No se encontraron borradores. Iniciando nuevo.");
                }
            } catch (err) {
                console.error("MasterStepForm: Error crítico recuperando sesión:", err);
            } finally {
                // SIEMPRE liberar el bloqueo de UI
                setIsCheckingSession(false);
            }
        };

        resumeDraft();
    }, [userId, applicationId, supabase]);

    // Callback para cuando se crea la solicitud en el Paso 1
    const handleApplicationCreated = (newId: string, data?: any) => {
        setApplicationId(newId);
        if (data) setFormData((prev: any) => ({ ...prev, ...data }));
    };

    const handleNext = async (stepData: any) => {
        const updatedData = { ...formData, ...stepData };
        setFormData(updatedData);

        // Guardar progreso en Supabase (si ya tenemos ID)
        // CORREGIDO: Guardar desde paso 1 también para persistir step_actual
        if (applicationId && currentStep < totalSteps) {
            await saveProgress(updatedData, currentStep + 1);
        }

        if (currentStep < totalSteps) {
            setDirection(1);
            setCurrentStep((prev) => prev + 1);
        } else {
            // Último paso
            if (applicationId) {
                await saveProgress(updatedData, currentStep, 'submitted');
            }
            toast.success("¡Solicitud enviada correctamente!");
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setDirection(-1);
            setCurrentStep((prev) => prev - 1);
        } else {
            // Si estamos en el Paso 1, volver al Dashboard
            window.location.href = "/dashboard";
        }
    };


    const saveProgress = async (data: any, nextStep: number, status?: string) => {
        // Early return si no hay applicationId (ej: Paso 1 -> Paso 2)
        if (!applicationId) {
            console.log("saveProgress: Saltando guardado (no hay applicationId aún)");
            setIsSaving(false);
            return;
        }

        setIsSaving(true);
        try {
            console.log("Guardando progreso...", { step: currentStep, next: nextStep });

            // 1. Actualización General de la Solicitud (Progress Tracking)
            const updatePayload: any = {
                step_actual: nextStep,
                // REMOVED: updated_at (columna no existe en tabla solicitudes)
            };

            if (status) updatePayload.estado = status;

            // Mapeos específicos
            if (data.monto_solicitado) updatePayload.monto_solicitado = data.monto_solicitado;
            if (currentStep === 3 && data.celular_contacto) {
                updatePayload.celular_contacto = data.celular_contacto;
            }

            // Paso 7: Configuración del Crédito
            if (currentStep === 7) {
                if (data.monto_solicitado) updatePayload.monto_solicitado = data.monto_solicitado;
                if (data.plazo_meses) updatePayload.plazo_meses = data.plazo_meses;
                if (data.proposito_recursos) updatePayload.proposito_recursos = data.proposito_recursos;
                if (data.adquisicion_activos_fijos !== undefined) updatePayload.adquisicion_activos_fijos = data.adquisicion_activos_fijos;
                if (data.detalle_activos_fijos) updatePayload.detalle_activos_fijos = data.detalle_activos_fijos;
            } else {
                if (data.monto_solicitado) updatePayload.monto_solicitado = data.monto_solicitado;
            }

            const { error: appError } = await supabase
                .from("solicitudes")
                .update(updatePayload)
                .eq("id", applicationId);

            if (appError) {
                console.error("Error actualizando solicitud:", appError);
                toast.error(`Error guardando progreso: ${appError.message}`);
            }

            // 2. Mapeo Específico Paso 2 -> Tabla 'empresas'
            // ESTRATEGIA: Check-then-Update
            // Solo actualiza si el registro ya existe (creado por n8n)
            if (currentStep === 2) {
                // Primero verificar si existe
                const { data: existingCompany } = await supabase
                    .from("empresas")
                    .select("id")
                    .eq("user_id", userId)
                    .maybeSingle();

                if (existingCompany) {
                    // Solo actualizar si existe
                    const companyPayload = {
                        tipo_empresa: data.tipo_empresa_manual,
                        es_startup: data.es_startup,
                        sitio_web: data.sitio_web,
                        facebook: data.facebook,
                        linkedin: data.linkedin,
                        instagram: data.instagram,
                    };

                    const { error: companyError } = await supabase
                        .from("empresas")
                        .update(companyPayload)
                        .eq("user_id", userId);

                    if (companyError) {
                        console.error("Error actualizando empresa:", companyError);
                        toast.error("Error guardando datos de empresa");
                    }
                } else {
                    console.log("Empresa aún no creada por n8n. Datos se guardarán cuando esté disponible.");
                }
            }

            // 3. Mapeo Específico Paso 8 -> Tabla 'referencias'
            if (currentStep === 8 && data.references && Array.isArray(data.references)) {
                await supabase.from('referencias').delete().eq('solicitud_id', applicationId);

                const referenciasPayload = data.references.map((ref: any) => ({
                    solicitud_id: applicationId,
                    nombre_empresa: ref.nombre_entidad || ref.company || ref.nombre_empresa,
                    contacto_nombre: ref.contacto || ref.contactName || ref.contacto_nombre,
                    telefono: ref.telefono || ref.phone,
                    relacion_comercial: ref.tipo_referencia || ref.type || ref.relacion_comercial || 'comercial'
                }));

                const { error: refError } = await supabase
                    .from('referencias')
                    .insert(referenciasPayload);

                if (refError) {
                    console.error("Error guardando referencias:", refError);
                    toast.error(`Error referencias: ${refError.message}`);
                }
            }

        } catch (error: any) {
            console.error("Error saving progress:", error);
            toast.error("Error de conexión al guardar");
        } finally {
            setIsSaving(false);
        }
    };

    const variants = {
        enter: (direction: number) => ({ y: direction > 0 ? 50 : -50, opacity: 0 }),
        center: { y: 0, opacity: 1 },
        exit: (direction: number) => ({ y: direction < 0 ? 50 : -50, opacity: 0 }),
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <StepSmartFilter
                        applicationId={applicationId}
                        onNext={handleNext}
                        userId={userId}
                        onApplicationCreated={handleApplicationCreated}
                        onBack={handleBack}
                    />
                );
            case 2:
                // Aseguramos que data.userId exista para el Step 2
                return <StepCorporateIdentity data={{ ...formData, userId }} onNext={handleNext} onBack={handleBack} />;
            case 3:
                return <StepLegalContact data={formData} onNext={handleNext} onBack={handleBack} />;
            case 4:
                return applicationId ? (
                    <StepFinancialStatements applicationId={applicationId} onNext={handleNext} onBack={handleBack} />
                ) : <div>Error críptico: Falta ID de solicitud</div>;
            case 5:
                return applicationId ? (
                    <StepTaxInfo applicationId={applicationId} onNext={handleNext} onBack={handleBack} />
                ) : <div>Error críptico: Falta ID de solicitud</div>;
            case 6:
                return applicationId ? (
                    <StepShareholders applicationId={applicationId} onNext={handleNext} onBack={handleBack} />
                ) : <div>Error críptico: Falta ID de solicitud</div>;
            case 7:
                return <StepCreditConfig data={formData} onNext={handleNext} onBack={handleBack} />;
            case 8:
                return applicationId ? (
                    <StepReferences data={formData} applicationId={applicationId} onNext={handleNext} onBack={handleBack} />
                ) : <div>Error críptico: Falta ID de solicitud</div>;
            case 9:
                return applicationId ? (
                    <StepSummary applicationId={applicationId} data={{ ...formData, userId }} onNext={handleNext} onBack={handleBack} />
                ) : <div>Error críptico: Falta ID de solicitud</div>;
            default:
                return <div>Paso no encontrado</div>;
        }
    };

    if (isCheckingSession) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Recuperando tu sesión...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[600px] w-full max-w-4xl mx-auto">
            <div className="mb-8 space-y-4">
                <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-slate-500 dark:text-zinc-400">
                        Paso {currentStep} de {totalSteps}
                    </span>
                </div>
                <Progress value={progress} className="h-2 bg-slate-100 dark:bg-zinc-800" />
            </div>

            <div className="relative flex-grow overflow-hidden px-1">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="w-full"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
