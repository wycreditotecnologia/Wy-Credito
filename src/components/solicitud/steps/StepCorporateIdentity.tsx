"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Globe, Facebook, Linkedin, Instagram, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Esquema de validación
const formSchema = z.object({
    tipo_empresa_manual: z.string().min(3, "Describe tu actividad económica"),
    es_startup: z.boolean().default(false),
    sitio_web: z.string().optional().refine(
        (val) => {
            if (!val || val === "") return true;
            // Si empieza con http/https, validar como URL completa
            if (val.startsWith("http://") || val.startsWith("https://")) {
                try {
                    new URL(val);
                    return true;
                } catch {
                    return false;
                }
            }
            // Si no tiene protocolo, aceptar formato de dominio simple
            return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/.test(val);
        },
        { message: "URL inválida (ej: ejemplo.com o https://ejemplo.com)" }
    ),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
});

interface StepProps {
    data: any; // Datos acumulados (incluye lo que vino de Step 1: companyData)
    onNext: (data: any) => void;
    onBack?: () => void;
}

export default function StepCorporateIdentity({ data, onNext, onBack }: StepProps) {
    const supabase = createClient();
    const [company, setCompany] = useState<any>(data.companyData || {});

    // Optimistic UI: No bloqueamos, solo escuchamos pasivamente
    useEffect(() => {
        if (!data.userId) return;

        // Realtime pasivo: Si llega data, actualizar silenciosamente
        const channel = supabase
            .channel('realtime-corporate-identity-passive')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'empresas', filter: `user_id=eq.${data.userId}` },
                (payload) => {
                    console.log("Realtime: Datos de empresa actualizados (background)", payload);
                    if (payload.new && (payload.new as any).razon_social) {
                        setCompany((prev: any) => ({ ...prev, ...payload.new }));
                        toast.info("✨ Datos de empresa detectados automáticamente");
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [data.userId, supabase]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipo_empresa_manual: data.tipo_empresa_manual || "",
            es_startup: data.es_startup || false,
            sitio_web: data.sitio_web || "",
            facebook: data.facebook || "",
            linkedin: data.linkedin || "",
            instagram: data.instagram || "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onNext(values);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Identidad Corporativa
                </h2>
                <p className="text-slate-500 dark:text-zinc-400">
                    Confirma los datos de tu empresa y cuéntanos un poco más.
                </p>
            </div>

            {/* A. Datos Automáticos (Read-only) */}
            <Card className="bg-slate-50 dark:bg-zinc-900 border-dashed">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Datos Validados por IA
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 text-sm animate-in fade-in duration-500">
                        <div>
                            <span className="block text-xs text-slate-400">Razón Social</span>
                            {company.razon_social || company.nombre ? (
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {company.razon_social || company.nombre}
                                </span>
                            ) : (
                                <span className="text-slate-400 italic text-sm">Procesando...</span>
                            )}
                        </div>
                        <div>
                            <span className="block text-xs text-slate-400">NIT</span>
                            {company.nit ? (
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {company.nit}
                                </span>
                            ) : (
                                <span className="text-slate-400 italic text-sm">Procesando...</span>
                            )}
                        </div>
                        <div>
                            <span className="block text-xs text-slate-400">Dirección Principal</span>
                            {company.direccion ? (
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {company.direccion}
                                </span>
                            ) : (
                                <span className="text-slate-400 italic text-sm">Procesando...</span>
                            )}
                        </div>
                        <div>
                            <span className="block text-xs text-slate-400">Ciudad</span>
                            {company.municipio || company.ciudad ? (
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {company.municipio || company.ciudad}
                                </span>
                            ) : (
                                <span className="text-slate-400 italic text-sm">Procesando...</span>
                            )}
                        </div>
                        <div>
                            <span className="block text-xs text-slate-400">Tipo Sociedad</span>
                            {company.type || company.tipo_sociedad ? (
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {company.type || company.tipo_sociedad}
                                </span>
                            ) : (
                                <span className="text-slate-400 italic text-sm">Procesando...</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* B. Datos Manuales */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tipo_empresa_manual">¿A qué se dedica tu negocio principalmente?</Label>
                        <Input
                            id="tipo_empresa_manual"
                            placeholder="Ej: Venta de calzado deportivo al por mayor"
                            {...form.register("tipo_empresa_manual")}
                        />
                        {form.formState.errors.tipo_empresa_manual && (
                            <p className="text-xs text-red-500">
                                {form.formState.errors.tipo_empresa_manual.message}
                            </p>
                        )}
                        <p className="text-xs text-slate-400">
                            Describe tu negocio en tus propias palabras.
                        </p>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-xl bg-white dark:bg-zinc-950">
                        <div className="space-y-0.5">
                            <Label className="text-base">¿Eres una Startup?</Label>
                            <p className="text-xs text-slate-500">
                                Selecciona si tu modelo es de alto crecimiento tecnológico.
                            </p>
                        </div>
                        <Switch
                            checked={form.watch("es_startup")}
                            onCheckedChange={(checked) => form.setValue("es_startup", checked)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Sitio Web</Label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                className="pl-9"
                                placeholder="https://www.tuempresa.com"
                                {...form.register("sitio_web")}
                            />
                        </div>
                        {form.formState.errors.sitio_web && (
                            <p className="text-xs text-red-500">
                                {form.formState.errors.sitio_web.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label>Redes Sociales (Opcional)</Label>
                        <div className="grid gap-3">
                            <div className="relative">
                                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    className="pl-9"
                                    placeholder="Facebook URL"
                                    {...form.register("facebook")}
                                />
                            </div>
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    className="pl-9"
                                    placeholder="LinkedIn URL"
                                    {...form.register("linkedin")}
                                />
                            </div>
                            <div className="relative">
                                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    className="pl-9"
                                    placeholder="Instagram URL"
                                    {...form.register("instagram")}
                                />
                            </div>
                        </div>
                    </div>
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
        </div >
    );
}
