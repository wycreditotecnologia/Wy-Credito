"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Phone, Mail, Globe, Facebook, Linkedin, FileText, CheckCircle2, XCircle, AlertCircle, Save, ExternalLink, Users } from "lucide-react";
import { toast } from "sonner";

export default function RequestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const requestId = params.id as string;
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<any>(null);

    // Formulario de Decisión (Estado local)
    const [decision, setDecision] = useState({
        estado: "",
        monto_aprobado: 0,
        plazo_aprobado: 0,
        tasa_interes: 0,
        observaciones: ""
    });

    useEffect(() => {
        if (requestId) {
            loadRequestData();

            // 📡 Realtime: Escuchar si n8n inyecta datos en las tablas satélite
            const channel = supabase
                .channel(`realtime-request-${requestId}`)
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'estados_financieros', filter: `solicitud_id=eq.${requestId}` },
                    (payload) => {
                        console.log("Realtime: Nuevos Estados Financieros!", payload);
                        toast.info("Análisis Financiero recibido 📊");
                        loadRequestData();
                    }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'declaracion_renta', filter: `solicitud_id=eq.${requestId}` },
                    (payload) => {
                        console.log("Realtime: Nueva Renta!", payload);
                        toast.info("Análisis Tributario recibido 🏛️");
                        loadRequestData();
                    }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'composicion_accionaria', filter: `solicitud_id=eq.${requestId}` },
                    (payload) => {
                        console.log("Realtime: Nuevos Socios!", payload);
                        loadRequestData();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [requestId]);

    const loadRequestData = async () => {
        try {
            setLoading(true);
            // El Super Query solicitado para traer todo el expediente
            const { data: requestWrapper, error } = await supabase
                .from('solicitudes')
                .select(`
                    *,
                    empresas (*),
                    perfiles:user_id (id, full_name, email, phone),
                    estados_financieros (*),
                    declaracion_renta (*),
                    composicion_accionaria (*),
                    documentos_adjuntos (*),
                    referencias (*)
                `)
                .eq('id', requestId)
                .single();

            if (error) throw error;

            setData(requestWrapper);

            // Pre-llenar formulario de decisión con datos actuales
            setDecision({
                estado: requestWrapper.estado || "en_revision",
                monto_aprobado: requestWrapper.monto_aprobado || requestWrapper.monto_solicitado || 0,
                plazo_aprobado: requestWrapper.plazo_aprobado || requestWrapper.plazo_meses || 0,
                tasa_interes: requestWrapper.tasa_aprobada || 1.5, // Default sugerido
                observaciones: requestWrapper.comentarios_analista || ""
            });

        } catch (error: any) {
            console.error("Error cargando solicitud:", error);
            toast.error("Error al cargar el expediente.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDecision = async () => {
        try {
            setSaving(true);
            const { error } = await supabase
                .from('solicitudes')
                .update({
                    estado: decision.estado,
                    monto_aprobado: decision.monto_aprobado,
                    plazo_aprobado: decision.plazo_aprobado,
                    tasa_aprobada: decision.tasa_interes,
                    comentarios_analista: decision.observaciones,
                    updated_at: new Date().toISOString() // Force realtime trigger
                })
                .eq('id', requestId);

            if (error) throw error;

            toast.success("Decisión guardada y notificada al cliente.");
            router.refresh(); // Refrescar para asegurar sync
        } catch (error: any) {
            console.error(error);
            toast.error("Error al guardar decisión.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-slate-400" /></div>;
    if (!data) return <div className="p-8 text-center">Expediente no encontrado.</div>;

    const empresa = data.empresas;
    const perfil = data.perfiles;

    // Helpers para Data Real
    const estadosFinancieros = data.estados_financieros?.[0] || {};
    const declaracionRenta = data.declaracion_renta?.[0] || {};

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header del Cockpit */}
            <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Expediente #{data.id.slice(0, 8)}
                            <Badge variant="outline" className="ml-2 capitalize">{data.estado.replace('_', ' ')}</Badge>
                        </h1>
                        <p className="text-sm text-slate-500">
                            Radicado: {new Date(data.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadRequestData}>Recargar Data</Button>
                </div>
            </div>

            {/* Grid de 3 Columnas - Scrollable area */}
            <div className="flex-1 overflow-auto p-4 md:p-6 grid grid-cols-12 gap-6 bg-slate-50 dark:bg-zinc-950">

                {/* 🏛️ COLUMNA 1: PERFIL DEL CLIENTE (20% -> 3 cols en 12-grid) */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <Card className="border-slate-200 shadow-sm h-full rounded-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold">{empresa?.razon_social || "N/A"}</CardTitle>
                            <CardDescription className="font-mono">NIT: {empresa?.nit || "N/A"}</CardDescription>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {empresa?.es_startup && <Badge variant="secondary" className="bg-purple-100 text-purple-700">Startup 🚀</Badge>}
                                <Badge variant="outline">{empresa?.tipo_empresa || "Pyme"}</Badge>
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-4 space-y-6">
                            {/* Contacto */}
                            <div>
                                <h4 className="text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">Contacto Principal</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-100 p-2 rounded-full"><Users className="h-4 w-4 text-slate-600" /></div>
                                        <div>
                                            <p className="text-sm font-medium">{empresa?.representante_legal || "No registrado"}</p>
                                            <p className="text-xs text-slate-500">Rep. Legal</p>
                                        </div>
                                    </div>

                                    {empresa?.celular_contacto && (
                                        <a href={`https://wa.me/57${empresa.celular_contacto}`} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-3 group hover:bg-slate-50 p-1 rounded-lg transition-colors cursor-pointer">
                                            <div className="bg-green-100 p-2 rounded-full group-hover:bg-green-200"><Phone className="h-4 w-4 text-green-700" /></div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 group-hover:text-green-700">{empresa.celular_contacto}</p>
                                                <p className="text-xs text-slate-500">Clic para WhatsApp</p>
                                            </div>
                                        </a>
                                    )}

                                    {perfil?.email && (
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-50 p-2 rounded-full"><Mail className="h-4 w-4 text-blue-600" /></div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium truncate" title={perfil.email}>{perfil.email}</p>
                                                <p className="text-xs text-slate-500">Email Usuario</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Redes */}
                            <div>
                                <h4 className="text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">Perfil Digital</h4>
                                <div className="flex gap-2">
                                    {empresa?.sitio_web && (
                                        <a href={empresa.sitio_web} target="_blank" className="p-2 bg-slate-100 rounded-md hover:bg-slate-200 text-slate-600"><Globe className="h-4 w-4" /></a>
                                    )}
                                    {empresa?.linkedin && (
                                        <a href={empresa.linkedin} target="_blank" className="p-2 bg-blue-50 rounded-md hover:bg-blue-100 text-blue-700"><Linkedin className="h-4 w-4" /></a>
                                    )}
                                    {empresa?.facebook && (
                                        <a href={empresa.facebook} target="_blank" className="p-2 bg-blue-50 rounded-md hover:bg-blue-100 text-blue-600"><Facebook className="h-4 w-4" /></a>
                                    )}
                                </div>
                            </div>

                            {/* Referencias (Mock por ahora si no hay data) */}
                            {data.referencias && data.referencias.length > 0 && (
                                <div>
                                    <h4 className="text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">Referencias</h4>
                                    <ul className="text-sm space-y-1">
                                        {data.referencias.map((ref: any, i: number) => (
                                            <li key={i} className="text-slate-600 truncate">• {ref.nombre_empresa}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                        </CardContent>
                    </Card>
                </div>

                {/* 🤖 COLUMNA 2: LA RADIOGRAFÍA (50% -> 6 cols en 12-grid) */}
                <div className="col-span-12 lg:col-span-6 h-full flex flex-col">
                    <Card className="border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                        <Tabs defaultValue="financiero" className="flex-1 flex flex-col">
                            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="financiero">Financiero</TabsTrigger>
                                    <TabsTrigger value="tributario">Tributario</TabsTrigger>
                                    <TabsTrigger value="socios">Socios</TabsTrigger>
                                    <TabsTrigger value="archivos">Archivos</TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-auto p-6 bg-white">
                                <TabsContent value="financiero" className="mt-0 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-lg">Estados Financieros</h3>
                                        {data.documentos_adjuntos?.find((d: any) => d.tipo === 'estados_financieros') && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={data.documentos_adjuntos.find((d: any) => d.tipo === 'estados_financieros').file_url /* TODO: Signed URL logic */} target="_blank">
                                                    <FileText className="h-4 w-4 mr-2" /> Ver PDF
                                                </a>
                                            </Button>
                                        )}
                                    </div>

                                    {/* DATA REAL O MOCK SI VACIO */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.keys(estadosFinancieros).length === 0 ? (
                                            <div className="col-span-2 text-center p-8 bg-slate-50 rounded-lg border border-dashed">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400 mb-2" />
                                                <p className="text-slate-500">Esperando análisis de IA...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                                                    <p className="text-xs text-emerald-600 uppercase font-bold">Total Activos</p>
                                                    <p className="text-2xl font-bold text-emerald-900">
                                                        ${Number(estadosFinancieros.total_activos || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                                                    <p className="text-xs text-orange-600 uppercase font-bold">Total Pasivos</p>
                                                    <p className="text-2xl font-bold text-orange-900">
                                                        ${Number(estadosFinancieros.total_pasivos || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 col-span-2">
                                                    <p className="text-xs text-blue-600 uppercase font-bold">Patrimonio Neto</p>
                                                    <p className="text-2xl font-bold text-blue-900">
                                                        ${Number(estadosFinancieros.patrimonio_neto || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400 italic text-center mt-4">
                                        {Object.keys(estadosFinancieros).length === 0 ? "Sube un archivo para iniciar." : "Datos extraídos automáticamente por IA"}
                                    </p>
                                </TabsContent>

                                <TabsContent value="tributario" className="mt-0 space-y-6">
                                    <h3 className="font-bold text-lg">Declaración de Renta</h3>
                                    {/* MOCK DATA */}
                                    {Object.keys(declaracionRenta).length === 0 ? (
                                        <div className="text-center p-8 bg-slate-50 rounded-lg border border-dashed">
                                            <p className="text-slate-500">Sin información tributaria procesada.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-3 border rounded-lg">
                                                <span className="text-slate-600">Ingresos Brutos</span>
                                                <span className="font-bold text-lg">
                                                    ${Number(declaracionRenta.ingresos_brutos || 0).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 border rounded-lg bg-slate-50">
                                                <span className="text-slate-600">Renta Líquida</span>
                                                <span className="font-bold text-lg text-emerald-600">
                                                    ${Number(declaracionRenta.renta_liquida || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="socios" className="mt-0">
                                    <h3 className="font-bold text-lg mb-4">Composición Accionaria</h3>
                                    <div className="rounded-md border">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                                                <tr>
                                                    <th className="px-4 py-3">Accionista</th>
                                                    <th className="px-4 py-3 text-right">Participación</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.composicion_accionaria && data.composicion_accionaria.length > 0 ? (
                                                    data.composicion_accionaria.map((socio: any) => (
                                                        <tr key={socio.id} className="border-b">
                                                            <td className="px-4 py-3">{socio.nombre_accionista}</td>
                                                            <td className="px-4 py-3 text-right">{socio.participacion_porcentaje}%</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={2} className="text-center py-4 text-slate-500">No hay accionistas registrados</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md flex gap-2 items-start text-sm">
                                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                        <p>IA Alert: Uno de los socios es persona jurídica. Se recomienda solicitar certificado de composición de esa empresa también.</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="archivos" className="mt-0">
                                    <h3 className="font-bold text-lg mb-4">Expediente Digital</h3>
                                    <div className="space-y-2">
                                        {data.documentos_adjuntos?.map((doc: any) => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-slate-400" />
                                                    <div>
                                                        <p className="text-sm font-medium">{doc.file_name || doc.tipo}</p>
                                                        <p className="text-xs text-slate-500 capitalize">{doc.tipo.replace('_', ' ')}</p>
                                                    </div>
                                                </div>
                                                <Button size="icon" variant="ghost">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {(!data.documentos_adjuntos || data.documentos_adjuntos.length === 0) && (
                                            <p className="text-slate-500 text-sm">No hay documentos adjuntos aún.</p>
                                        )}
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </Card>
                </div>

                {/* ⚖️ COLUMNA 3: EL MARTILLO (30% -> 3 cols en 12-grid) */}
                <div className="col-span-12 lg:col-span-3 h-full flex flex-col">
                    <Card className="border-slate-200 shadow-xl border-t-4 border-t-slate-900 h-full flex flex-col">
                        <CardHeader className="bg-slate-50/50 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                ⚖️ Decisión
                            </CardTitle>
                            <CardDescription>
                                Solicitado:
                                <span className="font-bold text-slate-900 block text-lg">
                                    ${Number(data.monto_solicitado || 0).toLocaleString()} <span className="text-sm font-normal text-slate-500">a {data.plazo_meses} meses</span>
                                </span>
                                <span className="text-xs">{data.proposito_recursos || "Capital de Trabajo"}</span>
                            </CardDescription>
                        </CardHeader>

                        <Separator />

                        <CardContent className="flex-1 p-6 space-y-6 overflow-auto">

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Dictamen Analista</Label>
                                    <Select
                                        value={decision.estado}
                                        onValueChange={(val) => setDecision({ ...decision, estado: val })}
                                    >
                                        <SelectTrigger className="w-full font-medium">
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en_revision">🔵 En Revisión</SelectItem>
                                            <SelectItem value="aprobado" className="text-green-600 font-bold">🟢 Aprobado</SelectItem>
                                            <SelectItem value="rechazado" className="text-red-600 font-bold">🔴 Rechazado</SelectItem>
                                            <SelectItem value="devolver" className="text-orange-600 font-bold">🟠 Devolver (Subsanar)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {decision.estado === 'aprobado' && (
                                    <div className="p-4 bg-green-50 rounded-lg space-y-3 border border-green-100 animate-in fade-in zoom-in duration-300">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-green-800">Monto Aprobado</Label>
                                            <Input
                                                type="number"
                                                value={decision.monto_aprobado}
                                                onChange={(e) => setDecision({ ...decision, monto_aprobado: Number(e.target.value) })}
                                                className="bg-white border-green-200"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-green-800">Plazo (Meses)</Label>
                                                <Input
                                                    type="number"
                                                    value={decision.plazo_aprobado}
                                                    onChange={(e) => setDecision({ ...decision, plazo_aprobado: Number(e.target.value) })}
                                                    className="bg-white border-green-200"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-green-800">Tasa (M.V.)</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        value={decision.tasa_interes}
                                                        onChange={(e) => setDecision({ ...decision, tasa_interes: Number(e.target.value) })}
                                                        className="bg-white border-green-200 pr-6"
                                                    />
                                                    <span className="absolute right-2 top-2.5 text-xs text-green-600">%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Observaciones (Internas/Cliente)</Label>
                                    <Textarea
                                        placeholder="Justifica tu decisión..."
                                        className="h-32 resize-none"
                                        value={decision.observaciones}
                                        onChange={(e) => setDecision({ ...decision, observaciones: e.target.value })}
                                    />
                                </div>
                            </div>

                        </CardContent>

                        <div className="p-4 bg-slate-50 border-t sticky bottom-0">
                            <Button
                                onClick={handleSaveDecision}
                                disabled={saving}
                                className={`w-full h-12 text-base font-bold shadow-lg transition-all ${decision.estado === 'aprobado' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                    decision.estado === 'rechazado' ? 'bg-red-600 hover:bg-red-700 text-white' :
                                        'bg-slate-900 hover:bg-slate-800 text-white'
                                    }`}
                            >
                                {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                {saving ? 'Guardando...' : 'GUARDAR Y NOTIFICAR'}
                            </Button>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
