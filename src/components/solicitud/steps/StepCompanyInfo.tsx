"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

const schema = z.object({
    company_nit: z.string().min(5, "NIT inválido"),
    company_name: z.string().min(2, "Nombre de empresa requerido"),
    company_type: z.string().min(1, "Seleccione un tipo de empresa"),
});

interface StepProps {
    data: any;
    onNext: (data: any) => void;
}

export default function StepCompanyInfo({ data, onNext }: StepProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            company_nit: data.company_nit || "",
            company_name: data.company_name || "",
            company_type: data.company_type || "",
        },
    });

    const companyType = watch("company_type");

    return (
        <form onSubmit={handleSubmit(onNext)} className="space-y-8 py-4">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Comencemos con lo básico
                </h2>
                <p className="text-lg text-slate-500 dark:text-zinc-400">
                    Cuéntanos un poco sobre tu empresa para personalizar tu experiencia.
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2 group">
                    <Label htmlFor="company_nit" className="text-sm font-semibold group-focus-within:text-brand-primary transition-colors">
                        NIT de la Empresa
                    </Label>
                    <Input
                        id="company_nit"
                        placeholder="123456789-0"
                        className="text-lg py-6 border-slate-200 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-all"
                        {...register("company_nit")}
                    />
                    {errors.company_nit && (
                        <p className="text-sm text-red-500">{errors.company_nit.message as string}</p>
                    )}
                </div>

                <div className="space-y-2 group">
                    <Label htmlFor="company_name" className="text-sm font-semibold group-focus-within:text-brand-primary transition-colors">
                        Nombre Legal o Razón Social
                    </Label>
                    <Input
                        id="company_name"
                        placeholder="Nombre de tu empresa"
                        className="text-lg py-6 border-slate-200 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-all"
                        {...register("company_name")}
                    />
                    {errors.company_name && (
                        <p className="text-sm text-red-500">{errors.company_name.message as string}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Tipo de Empresa</Label>
                    <Select
                        onValueChange={(val) => setValue("company_type", val)}
                        defaultValue={companyType}
                    >
                        <SelectTrigger className="text-lg py-6 border-slate-200">
                            <SelectValue placeholder="Seleccione una opción" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-zinc-900">
                            <SelectItem value="SAS">S.A.S.</SelectItem>
                            <SelectItem value="SA">S.A.</SelectItem>
                            <SelectItem value="LTDA">Limitada (Ltda.)</SelectItem>
                            <SelectItem value="PJ">Persona Jurídica (Otro)</SelectItem>
                            <SelectItem value="PN">Persona Natural</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.company_type && (
                        <p className="text-sm text-red-500">{errors.company_type.message as string}</p>
                    )}
                </div>
            </div>

            <Button type="submit" size="lg" className="w-full md:w-auto px-8 py-6 text-lg bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl shadow-lg hover:shadow-brand-primary/20 transition-all flex items-center gap-2">
                Continuar
                <ArrowRight className="w-5 h-5" />
            </Button>
        </form>
    );
}
