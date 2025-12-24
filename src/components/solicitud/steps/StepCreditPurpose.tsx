"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, ChevronLeft } from "lucide-react";

const schema = z.object({
    resource_purpose: z.string().min(10, "Por favor describa el propósito (mín. 10 caracteres)"),
    acquire_fixed_assets: z.boolean().default(false),
    fixed_assets_description: z.string().optional(),
});

interface StepProps {
    data: any;
    onNext: (data: any) => void;
    onBack: () => void;
}

export default function StepCreditPurpose({ data, onNext, onBack }: StepProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            resource_purpose: data.resource_purpose || "",
            acquire_fixed_assets: data.acquire_fixed_assets || false,
            fixed_assets_description: data.fixed_assets_description || "",
        },
    });

    const acquireFixedAssets = watch("acquire_fixed_assets");

    return (
        <form onSubmit={handleSubmit(onNext)} className="space-y-8 py-4">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Uso de los Recursos
                </h2>
                <p className="text-lg text-slate-500 dark:text-zinc-400">
                    Cuéntanos para qué necesitas el crédito y tus planes de inversión.
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2 group">
                    <Label htmlFor="resource_purpose" className="text-sm font-semibold group-focus-within:text-brand-primary transition-colors">
                        ¿Cuál es el propósito principal del crédito?
                    </Label>
                    <Textarea
                        id="resource_purpose"
                        placeholder="Ej: Capital de trabajo para expandir operaciones en la costa..."
                        className="text-lg min-h-[120px] border-slate-200 resize-none focus-visible:ring-brand-primary/20"
                        {...register("resource_purpose")}
                    />
                    {errors.resource_purpose && <p className="text-sm text-red-500">{errors.resource_purpose.message as string}</p>}
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <div className="space-y-0.5">
                        <Label className="text-base font-semibold">¿Se adquirirán activos fijos?</Label>
                        <p className="text-sm text-slate-500">Activa esta opción si el dinero se usará para maquinaria, equipos o locales.</p>
                    </div>
                    <Switch
                        checked={acquireFixedAssets}
                        onCheckedChange={(val) => setValue("acquire_fixed_assets", val)}
                    />
                </div>

                {acquireFixedAssets && (
                    <div className="space-y-2 group animate-in slide-in-from-top-2 duration-300">
                        <Label htmlFor="fixed_assets_description" className="text-sm font-semibold group-focus-within:text-brand-primary transition-colors">
                            Descripción de los activos a adquirir
                        </Label>
                        <Textarea
                            id="fixed_assets_description"
                            placeholder="Describa la maquinaria o equipos..."
                            className="text-lg min-h-[100px] border-slate-200 resize-none"
                            {...register("fixed_assets_description")}
                        />
                    </div>
                )}
            </div>

            <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" size="lg" onClick={onBack} className="px-8 py-6 text-lg border-slate-200 rounded-xl">
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Atrás
                </Button>
                <Button type="submit" size="lg" className="flex-grow md:flex-none px-12 py-6 text-lg bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl shadow-lg transition-all flex items-center gap-2">
                    Continuar
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </form>
    );
}
