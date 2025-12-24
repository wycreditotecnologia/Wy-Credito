"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ChevronLeft } from "lucide-react";

const schema = z.object({
    legal_rep_name: z.string().min(2, "Nombre requerido"),
    legal_rep_doc_type: z.string().min(1, "Seleccione un tipo de documento"),
    legal_rep_doc_number: z.string().min(5, "Número de documento inválido"),
    legal_rep_phone: z.string().min(10, "Número de teléfono inválido (mín. 10 dígitos)"),
});

interface StepProps {
    data: any;
    onNext: (data: any) => void;
    onBack: () => void;
}

export default function StepLegalRepresentative({ data, onNext, onBack }: StepProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            legal_rep_name: data.legal_rep_name || "",
            legal_rep_doc_type: data.legal_rep_doc_type || "",
            legal_rep_doc_number: data.legal_rep_doc_number || "",
            legal_rep_phone: data.legal_rep_phone || "",
        },
    });

    const docType = watch("legal_rep_doc_type");

    return (
        <form onSubmit={handleSubmit(onNext)} className="space-y-8 py-4">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Representante Legal
                </h2>
                <p className="text-lg text-slate-500 dark:text-zinc-400">
                    Necesitamos los datos de quien actúa en nombre de la empresa.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 group md:col-span-2">
                    <Label htmlFor="legal_rep_name" className="text-sm font-semibold group-focus-within:text-brand-primary transition-colors">
                        Nombre Completo
                    </Label>
                    <Input
                        id="legal_rep_name"
                        placeholder="Ej: Juan Pérez"
                        className="text-lg py-6 border-slate-200"
                        {...register("legal_rep_name")}
                    />
                    {errors.legal_rep_name && <p className="text-sm text-red-500">{errors.legal_rep_name.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Tipo de Documento</Label>
                    <Select
                        onValueChange={(val) => setValue("legal_rep_doc_type", val)}
                        defaultValue={docType}
                    >
                        <SelectTrigger className="text-lg py-6 border-slate-200">
                            <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-zinc-900">
                            <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                            <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                            <SelectItem value="PP">Pasaporte</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.legal_rep_doc_type && <p className="text-sm text-red-500">{errors.legal_rep_doc_type.message as string}</p>}
                </div>

                <div className="space-y-2 group">
                    <Label htmlFor="legal_rep_doc_number" className="text-sm font-semibold group-focus-within:text-brand-primary transition-colors">
                        Número de Documento
                    </Label>
                    <Input
                        id="legal_rep_doc_number"
                        placeholder="12345678"
                        className="text-lg py-6 border-slate-200"
                        {...register("legal_rep_doc_number")}
                    />
                    {errors.legal_rep_doc_number && <p className="text-sm text-red-500">{errors.legal_rep_doc_number.message as string}</p>}
                </div>

                <div className="space-y-2 group md:col-span-2">
                    <Label htmlFor="legal_rep_phone" className="text-sm font-semibold group-focus-within:text-brand-primary transition-colors">
                        Celular de Contacto
                    </Label>
                    <Input
                        id="legal_rep_phone"
                        placeholder="300 123 4567"
                        className="text-lg py-6 border-slate-200"
                        {...register("legal_rep_phone")}
                    />
                    {errors.legal_rep_phone && <p className="text-sm text-red-500">{errors.legal_rep_phone.message as string}</p>}
                </div>
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
