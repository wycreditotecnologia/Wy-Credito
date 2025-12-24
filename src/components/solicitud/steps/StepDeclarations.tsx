"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ShieldCheck } from "lucide-react";

const schema = z.object({
    declaration_productive_use: z.boolean().refine(val => val === true, "Debe aceptar esta declaración"),
    declaration_no_personal_use: z.boolean().refine(val => val === true, "Debe aceptar esta declaración"),
    declaration_terms_accepted: z.boolean().refine(val => val === true, "Debe aceptar los términos y condiciones"),
});

interface StepProps {
    data: any;
    onNext: (data: any) => void;
    onBack: () => void;
}

export default function StepDeclarations({ data, onNext, onBack }: StepProps) {
    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            declaration_productive_use: data.declaration_productive_use || false,
            declaration_no_personal_use: data.declaration_no_personal_use || false,
            declaration_terms_accepted: data.declaration_terms_accepted || false,
        },
    });

    const values = watch();

    return (
        <form onSubmit={handleSubmit(onNext)} className="space-y-8 py-4">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                    Declaraciones Legales
                </h2>
                <p className="text-lg text-slate-500 dark:text-zinc-400">
                    Para finalizar, por favor confirma las siguientes declaraciones de cumplimiento.
                </p>
            </div>

            <div className="space-y-5">
                {[
                    { id: "declaration_productive_use", label: "Declaro que los recursos solicitados serán destinados exclusivamente a fines productivos de la empresa.", field: "declaration_productive_use" },
                    { id: "declaration_no_personal_use", label: "Declaro que los recursos no serán utilizados para gastos personales ni actividades ajenas al objeto social.", field: "declaration_no_personal_use" },
                    { id: "declaration_terms_accepted", label: "Acepto los términos, condiciones y la política de tratamiento de datos personales de Wy Crédito.", field: "declaration_terms_accepted" },
                ].map((item) => (
                    <div
                        key={item.id}
                        className="flex items-start space-x-4 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => setValue(item.field as any, !values[item.field as keyof typeof values])}
                    >
                        <Checkbox
                            id={item.id}
                            checked={values[item.field as keyof typeof values]}
                            onCheckedChange={(val) => setValue(item.field as any, val as boolean)}
                            className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                                htmlFor={item.id}
                                className="text-base font-medium leading-relaxed text-slate-700 dark:text-zinc-300 cursor-pointer"
                            >
                                {item.label}
                            </Label>
                        </div>
                    </div>
                ))}
                {(errors.declaration_productive_use || errors.declaration_no_personal_use || errors.declaration_terms_accepted) && (
                    <p className="text-sm text-red-500 font-medium">Debe aceptar todas las declaraciones para continuar.</p>
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
