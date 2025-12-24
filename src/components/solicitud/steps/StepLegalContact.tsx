"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Phone, Mail } from "lucide-react";

const formSchema = z.object({
    celular_contacto: z.string().min(10, "Número inválido (mín. 10 dígitos)"),
});

interface StepProps {
    data: any;
    onNext: (data: any) => void;
    onBack?: () => void;
}

export default function StepLegalContact({ data, onNext, onBack }: StepProps) {
    const company = data.companyData || {};

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            // Intentar pre-llenar con datos guardados del formulario, o profile si existiera
            celular_contacto: data.celular_contacto || data.userProfile?.phone || "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onNext(values);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Representación Legal & Contacto
                </h2>
                <p className="text-slate-500 dark:text-zinc-400">
                    Datos del representante y canal de comunicación.
                </p>
            </div>

            {/* A. Datos Automáticos (Read-only) */}
            <Card className="bg-slate-50 dark:bg-zinc-900 border-dashed">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Representante Legal (IA)
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="block text-xs text-slate-400">Nombre del Representante Legal</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {company.representante_legal || company.principal_rl || "No detectado"}
                        </span>
                    </div>
                    <div>
                        <span className="block text-xs text-slate-400">Cédula del Representante</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {company.identificacion_p_rl || company.cedula_representante || "No detectado"}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* B. Datos Manuales */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="celular_contacto">Celular de Contacto Directo</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                id="celular_contacto"
                                className="pl-9"
                                type="tel"
                                placeholder="300 000 0000"
                                {...form.register("celular_contacto")}
                            />
                        </div>
                        <p className="text-xs text-slate-400">
                            Número celular para notificaciones del crédito.
                        </p>
                        {form.formState.errors.celular_contacto && (
                            <p className="text-xs text-red-500">
                                {form.formState.errors.celular_contacto.message}
                            </p>
                        )}
                    </div>

                    {/* Campo de Correo ELIMINADO según requerimiento */}
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
            </form >
        </div >
    );
}
