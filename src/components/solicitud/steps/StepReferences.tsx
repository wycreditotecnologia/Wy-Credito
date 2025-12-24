"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const referenceSchema = z.object({
    nombre_entidad: z.string().min(2, "Nombre requerido"),
    contacto: z.string().min(2, "Contacto requerido"),
    telefono: z.string().min(7, "Teléfono requerido"),
    tipo_referencia: z.string().min(1, "Tipo requerido"),
});

const formSchema = z.object({
    references: z.array(referenceSchema).min(2, "Debes agregar al menos 2 referencias"),
});

interface StepProps {
    applicationId: string;
    data: any;
    onNext: (data: any) => void;
    onBack?: () => void;
}

export default function StepReferences({ applicationId, data, onNext, onBack }: StepProps) {
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            references: data.references || [
                { nombre_entidad: "", contacto: "", telefono: "", tipo_referencia: "comercial" },
                { nombre_entidad: "", contacto: "", telefono: "", tipo_referencia: "comercial" }
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "references",
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        // La lógica de guardado en BD ahora la maneja MasterStepForm (Centralizado)
        // Pasamos los datos hacia arriba
        onNext({ references: values.references });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Referencias Comerciales
                </h2>
                <p className="text-slate-500 dark:text-zinc-400">
                    Necesitamos validar tu historial comercial con al menos 2 proveedores o aliados.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-xl bg-white dark:bg-zinc-950 relative group">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {fields.length > 2 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            <h4 className="text-sm font-medium text-slate-500 mb-3 flex items-center">
                                <Users className="w-4 h-4 mr-2" /> Referencia #{index + 1}
                            </h4>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Empresa / Entidad</Label>
                                    <Input
                                        placeholder="Nombre empresa"
                                        {...form.register(`references.${index}.nombre_entidad`)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contacto</Label>
                                    <Input
                                        placeholder="Nombre persona"
                                        {...form.register(`references.${index}.contacto`)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Teléfono</Label>
                                    <Input
                                        placeholder="Ej: 300..."
                                        {...form.register(`references.${index}.telefono`)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo</Label>
                                    <Select
                                        onValueChange={(val) => form.setValue(`references.${index}.tipo_referencia`, val)}
                                        defaultValue={form.watch(`references.${index}.tipo_referencia`)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="comercial">Comercial</SelectItem>
                                            <SelectItem value="bancaria">Bancaria</SelectItem>
                                            <SelectItem value="personal">Personal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => append({ nombre_entidad: "", contacto: "", telefono: "", tipo_referencia: "comercial" })}
                >
                    <Plus className="w-4 h-4 mr-2" /> Agregar otra referencia
                </Button>

                {form.formState.errors.references && (
                    <p className="text-sm text-red-500 text-center">
                        {form.formState.errors.references.message}
                    </p>
                )}

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
