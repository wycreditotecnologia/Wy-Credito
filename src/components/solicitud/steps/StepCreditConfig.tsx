"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DollarSign } from "lucide-react";

const formSchema = z.object({
    monto_solicitado: z.number().min(1000000, "El monto mínimo es $1.000.000"),
    plazo_meses: z.string().min(1, "Selecciona un plazo"),
    proposito_recursos: z.string().min(10, "Cuéntanos más detalladamente el propósito"),
    adquisicion_activos_fijos: z.boolean().default(false),
    detalle_activos_fijos: z.string().optional(),
}).refine(data => {
    if (data.adquisicion_activos_fijos && (!data.detalle_activos_fijos || data.detalle_activos_fijos.length < 5)) {
        return false;
    }
    return true;
}, {
    message: "Describe los activos fijos que vas a adquirir",
    path: ["detalle_activos_fijos"],
});

interface StepProps {
    data: any;
    onNext: (data: any) => void;
    onBack?: () => void;
}

export default function StepCreditConfig({ data, onNext, onBack }: StepProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            monto_solicitado: data.monto_solicitado ? Number(data.monto_solicitado) : undefined,
            plazo_meses: data.plazo_meses?.toString() || "",
            proposito_recursos: data.proposito_recursos || "",
            adquisicion_activos_fijos: data.adquisicion_activos_fijos || false,
            detalle_activos_fijos: data.detalle_activos_fijos || "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onNext(values);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Configura tu Crédito
                </h2>
                <p className="text-slate-500 dark:text-zinc-400">
                    Define las condiciones que mejor se adapten a tu flujo de caja.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>¿Cuánto dinero necesitas?</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                type="number"
                                className="pl-9"
                                placeholder="0"
                                {...form.register("monto_solicitado", { valueAsNumber: true })}
                            />
                        </div>
                        {form.formState.errors.monto_solicitado && (
                            <p className="text-xs text-red-500">
                                {form.formState.errors.monto_solicitado.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>¿A qué plazo?</Label>
                        <Select
                            onValueChange={(val) => form.setValue("plazo_meses", val)}
                            defaultValue={form.watch("plazo_meses")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar meses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="6">6 Meses</SelectItem>
                                <SelectItem value="12">12 Meses</SelectItem>
                                <SelectItem value="24">24 Meses</SelectItem>
                                <SelectItem value="36">36 Meses</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.formState.errors.plazo_meses && (
                            <p className="text-xs text-red-500">
                                {form.formState.errors.plazo_meses.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>¿Cuál es el destino de los recursos?</Label>
                    <Textarea
                        placeholder="Ej: Compra de materia prima para la temporada escolar..."
                        className="resize-none h-24"
                        {...form.register("proposito_recursos")}
                    />
                    {form.formState.errors.proposito_recursos && (
                        <p className="text-xs text-red-500">
                            {form.formState.errors.proposito_recursos.message}
                        </p>
                    )}
                </div>

                <div className="p-4 border rounded-xl bg-slate-50 dark:bg-zinc-900/50 space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="cursor-pointer" htmlFor="activos-fijos">
                            ¿Incluye adquisición de Activos Fijos?
                        </Label>
                        <Switch
                            id="activos-fijos"
                            checked={form.watch("adquisicion_activos_fijos")}
                            onCheckedChange={(checked) => form.setValue("adquisicion_activos_fijos", checked)}
                        />
                    </div>

                    {form.watch("adquisicion_activos_fijos") && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label>Detalle de Activos</Label>
                            <Input
                                placeholder="Ej: Maquinaria industrial marca X..."
                                {...form.register("detalle_activos_fijos")}
                            />
                            {form.formState.errors.detalle_activos_fijos && (
                                <p className="text-xs text-red-500">
                                    {form.formState.errors.detalle_activos_fijos.message}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-between pt-4">
                    {onBack && (
                        <Button type="button" variant="ghost" onClick={onBack}>
                            Atrás
                        </Button>
                    )}
                    <Button type="submit" className="ml-auto bg-brand-primary text-white hover:bg-brand-primary/90">
                        Continuar
                    </Button>
                </div>
            </form>
        </div>
    );
}
