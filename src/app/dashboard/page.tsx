"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Ban, Rocket, CreditCard, DollarSign, AlertTriangle, FileText, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
// import { useAuth } from "@/hooks/useAuth"; // Asumimos hook si existe, si no usamos useEffect directo

// --- Componente Hero Estado 1: Sin Solicitud ---
function HeroEmptyState() {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary to-blue-900 px-6 py-12 md:px-12 md:py-16 text-center text-white shadow-xl">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
            <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                    Impulsa tu negocio con capital inteligente 🚀
                </h1>
                <p className="text-lg md:text-xl text-blue-100 max-w-lg">
                    Obtén tu cupo de crédito rotativo en minutos. Sin papeleos físicos y con aprobación 100% digital.
                </p>
                <div className="pt-4">
                    <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-white text-brand-primary hover:bg-blue-50 shadow-lg transition-transform hover:scale-105">
                        <Link href="/solicitud">
                            SOLICITAR NUEVO CUPO
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

// --- Componente Hero Estado 2: Tracking Solicitud ---
function HeroTrackingState({ solicitud }: { solicitud: any }) {
    // Calcular progreso basado en estado
    const getProgress = (status: string) => {
        switch (status) {
            case 'borrador': return 10;
            case 'en_revision': return 50;
            case 'aprobado': return 90;
            case 'desembolsado': return 100;
            case 'rechazado': return 100; // Caso especial rojo
            default: return 0;
        }
    }

    const progressValue = getProgress(solicitud.estado || 'borrador');
    const documents = solicitud.documentos_adjuntos || [];

    // Helper para verificar documentos
    const checkDoc = (type: string) => documents.some((d: any) => d.tipo_documento === type);

    // Configurar Badge y Textos
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'borrador': return { label: 'Continuar Solicitud', color: 'bg-slate-100 text-slate-700', icon: Clock };
            case 'en_revision': return { label: 'En Estudio', color: 'bg-blue-100 text-blue-700 animate-pulse', icon: Clock };
            case 'correccion_solicitada': return { label: 'Acción Requerida', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle };
            case 'aprobado': return { label: '¡Aprobado!', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
            case 'rechazado': return { label: 'No viable', color: 'bg-red-100 text-red-700', icon: Ban };
            default: return { label: 'Borrador', color: 'bg-slate-100 text-slate-700', icon: Clock };
        }
    }

    const statusConfig = getStatusConfig(solicitud.estado || 'borrador');
    const StatusIcon = statusConfig.icon;

    return (
        <Card className="border-none shadow-lg bg-white dark:bg-zinc-900 overflow-hidden">
            <div className={`h-2 w-full ${solicitud.estado === 'aprobado' ? 'bg-green-500' : 'bg-brand-primary'}`} />
            <CardHeader className="md:px-8 pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${statusConfig.color} hover:${statusConfig.color} px-3 py-1 text-sm flex gap-1 items-center border-none`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                            </Badge>
                            <span className="text-slate-400 text-xs font-mono uppercase">#{solicitud.id?.substring(0, 8)}</span>
                        </div>
                        <CardTitle className="text-2xl md:text-3xl text-slate-900 dark:text-white">
                            Solicitud de Crédito - {solicitud.proposito_recursos || "Capital de Trabajo"}
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            Monto: <span className="font-semibold text-slate-900 dark:text-white text-lg">${Number(solicitud.monto_solicitado || 0).toLocaleString()}</span>
                        </CardDescription>
                    </div>
                    {solicitud.estado === 'borrador' && (
                        <Button asChild>
                            <Link href="/solicitud">Continuar Diligenciamiento</Link>
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="md:px-8 pb-8 space-y-8">
                {/* Progress Bar Visual (Stepper) */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                        <span>Radicado</span>
                        <span>Análisis</span>
                        <span>Decisión</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                </div>

                {/* Lista de Chequeo de Documentos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                        <h4 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-4">
                            <FileText className="w-4 h-4 text-brand-primary" />
                            Documentación Requerida
                        </h4>
                        <div className="space-y-3">
                            {[
                                { id: 'camara_comercio', label: 'Cámara de Comercio' },
                                { id: 'estados_financieros', label: 'Estados Financieros' },
                                { id: 'declaracion_renta', label: 'Declaración de Renta' },
                                { id: 'composicion_accionaria', label: 'Composición Accionaria' }
                            ].map((doc) => {
                                const isReady = checkDoc(doc.id);
                                return (
                                    <div key={doc.id} className="flex items-center justify-between text-sm">
                                        <span className={isReady ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}>
                                            {doc.label}
                                        </span>
                                        {isReady ? (
                                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Listo
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Pendiente
                                            </Badge>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Mensaje de Estado */}
                    <div className="flex items-center justify-center p-6 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 text-center">
                        <div>
                            {solicitud.estado === 'en_revision' ? (
                                <>
                                    <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto mb-3" />
                                    <h5 className="font-semibold text-slate-900 dark:text-white">Analizando tu perfil</h5>
                                    <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">Nuestro motor de riesgo está procesando toda la información recibida.</p>
                                </>
                            ) : solicitud.estado === 'aprobado' ? (
                                <>
                                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <h5 className="font-semibold text-green-700 dark:text-green-400">¡Crédito Aprobado!</h5>
                                    <p className="text-sm text-slate-500 mt-1">Tu cupo ya está disponible para desembolso inmediato.</p>
                                </>
                            ) : (
                                <>
                                    <Info className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                                    <h5 className="font-semibold text-slate-900 dark:text-white">Expediente en curso</h5>
                                    <p className="text-sm text-slate-500 mt-1">Completa los pasos pendientes para recibir una oferta.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// --- KPIs ---
function KPIStats({ solicitud }: { solicitud: any }) {
    // Si no hay solicitud aprobada, cupo es 0.
    const cupo = solicitud?.estado === 'aprobado' ? Number(solicitud.monto_solicitado) : 0;
    const activos = solicitud?.estado === 'desembolsado' ? 1 : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                        Cupo Aprobado
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">${cupo.toLocaleString()}</div>
                    <p className="text-xs text-slate-500">Disponible para uso</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                        Créditos Activos
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{activos}</div>
                    <p className="text-xs text-slate-500">En curso</p>
                </CardContent>
            </Card>
        </div>
    )
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [solicitud, setSolicitud] = useState<any>(null);
    const [userName, setUserName] = useState("Empresario");
    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Get User
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return; // Handle redirect if needed

                // Get User Profile Name (Mock or DB)
                // const { data: profile } = await supabase.from('perfiles').select('nombre').eq('id', user.id).single();
                // if (profile) setUserName(profile.nombre);

                // 2. Get Last Request
                const { data: solicitudes, error } = await supabase
                    .from('solicitudes')
                    .select('*, documentos_adjuntos(*)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (solicitudes && solicitudes.length > 0) {
                    setSolicitud(solicitudes[0]);
                }

                // 3. Realtime Subscription
                const channel = supabase
                    .channel('dashboard-updates')
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'solicitudes',
                            filter: `user_id=eq.${user.id}`,
                        },
                        (payload) => {
                            console.log('Realtime update:', payload);
                            // Refresh logic (simple: update state with new payload if matches)
                            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                                setSolicitud(payload.new);
                            }
                        }
                    )
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                }

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center">Cargando tu Torre de Control...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Saludo */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Hola, {userName} 👋
                    </h2>
                    <p className="text-slate-500 dark:text-zinc-400">
                        Así van tus negocios hoy.
                    </p>
                </div>
                {/* Date or extra info could go here */}
            </div>

            {/* KPI Section */}
            <KPIStats solicitud={solicitud} />

            {/* Hero Section Dynamic */}
            <section className="mt-8">
                {(!solicitud || solicitud.estado === 'borrador') ? (
                    // Estado 1: Sin solicitud activa (o solo borrador) -> CTA Gigante
                    <HeroEmptyState />
                ) : (
                    // Estado 2: Tracking Activo
                    <HeroTrackingState solicitud={solicitud} />
                )}
            </section>
        </div>
    );
}
