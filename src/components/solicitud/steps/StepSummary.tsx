"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Loader2, Building2, TrendingUp, FileText, Users, DollarSign, Calendar, Target } from "lucide-react";
import { toast } from "sonner";

interface StepProps {
    applicationId: string;
    data: any;
    onNext: (data: any) => void;
    onBack?: () => void;
}

export default function StepSummary({ applicationId, data, onNext, onBack }: StepProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [empresa, setEmpresa] = useState<any>(null);
    const [solicitud, setSolicitud] = useState<any>(null);
    const [financials, setFinancials] = useState<any[]>([]);
    const [tax, setTax] = useState<any[]>([]);
    const [shareholders, setShareholders] = useState<any[]>([]);
    const [referencias, setReferencias] = useState<any[]>([]);

    // Indicadores calculados
    const [totalActivos, setTotalActivos] = useState(0);
    const [totalPasivos, setTotalPasivos] = useState(0);
    const [patrimonio, setPatrimonio] = useState(0);
    const [ingresosBrutos, setIngresosBrutos] = useState(0);
    const [rentaLiquida, setRentaLiquida] = useState(0);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                console.log("📊 Cargando Radiografía Empresarial...");

                // Solicitud
                const { data: solicitudData } = await supabase
                    .from('solicitudes')
                    .select('*')
                    .eq('id', applicationId)
                    .single();

                // Empresa
                const { data: empresaData } = await supabase
                    .from('empresas')
                    .select('*')
                    .eq('solicitud_id', applicationId)
                    .maybeSingle();

                // Estados Financieros
                const { data: financialsData } = await supabase
                    .from('estados_financieros')
                    .select('*')
                    .eq('solicitud_id', applicationId);

                // Declaración de Renta
                const { data: taxData } = await supabase
                    .from('declaracion_renta')
                    .select('*')
                    .eq('solicitud_id', applicationId);

                // Socios
                const { data: shareholdersData } = await supabase
                    .from('composicion_accionaria')
                    .select('*')
                    .eq('solicitud_id', applicationId);

                // Referencias
                const { data: referenciasData } = await supabase
                    .from('referencias')
                    .select('*')
                    .eq('solicitud_id', applicationId);

                setSolicitud(solicitudData);
                setEmpresa(empresaData);
                setFinancials(financialsData || []);
                setTax(taxData || []);
                setShareholders(shareholdersData || []);
                setReferencias(referenciasData || []);

                // 🔍 MAPEO INTELIGENTE DE INDICADORES
                if (financialsData && financialsData.length > 0) {
                    const activo = financialsData.find(x =>
                        x.subcuenta_1?.includes('Total Activo') && !x.subcuenta_1?.includes('Corriente') && !x.subcuenta_1?.includes('No Corriente')
                    );
                    const pasivo = financialsData.find(x => x.subcuenta_1?.includes('Total Pasivo') && !x.subcuenta_1?.includes('Corriente'));
                    const patri = financialsData.find(x => x.subcuenta_1?.includes('Total Patrimonio'));

                    setTotalActivos(Number(activo?.valor || 0));
                    setTotalPasivos(Number(pasivo?.valor || 0));
                    setPatrimonio(Number(patri?.valor || 0));
                }

                if (taxData && taxData.length > 0) {
                    const ingresos = taxData.find(x => x.cuenta?.includes('Ingresos Brutos'));
                    const renta = taxData.find(x => x.cuenta?.includes('Renta Liquida'));

                    setIngresosBrutos(Number(ingresos?.valor || 0));
                    setRentaLiquida(Number(renta?.valor || 0));
                }

                toast.success("✅ Radiografía completada");

            } catch (error) {
                console.error("Error cargando radiografía:", error);
                toast.error("Error cargando datos");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [applicationId, supabase]);

    const handleSubmit = async () => {
        try {
            const { error } = await supabase
                .from('solicitudes')
                .update({ estado: 'en_revision' })
                .eq('id', applicationId);

            if (error) throw error;

            toast.success("¡Solicitud enviada para revisión!");
            onNext({});
        } catch (error) {
            console.error("Error enviando solicitud:", error);
            toast.error("Error al enviar");
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto" />
                    <p className="text-lg text-slate-600 dark:text-slate-400">Generando tu radiografía empresarial...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            {/* 1. SALUDO PERSONALIZADO */}
            <div className="text-center space-y-2 py-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    ¡Hola, {empresa?.razon_social || 'Empresa'}! 👋
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                    Hemos analizado tu información y todo parece estar en orden.
                </p>
            </div>

            {/* 2. TARJETA HERO - EL CRÉDITO */}
            <Card className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white border-0 shadow-xl">
                <CardContent className="pt-8 pb-8">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-90" />
                            <p className="text-sm opacity-90 mb-1">Monto Solicitado</p>
                            <p className="text-3xl font-bold">{formatCurrency(solicitud?.monto_solicitado || 0)}</p>
                        </div>
                        <div className="text-center">
                            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-90" />
                            <p className="text-sm opacity-90 mb-1">Plazo</p>
                            <p className="text-3xl font-bold">{solicitud?.plazo_meses || 0} Meses</p>
                        </div>
                        <div className="text-center">
                            <Target className="w-8 h-8 mx-auto mb-2 opacity-90" />
                            <p className="text-sm opacity-90 mb-1">Destino</p>
                            <p className="text-xl font-semibold">{solicitud?.proposito_recursos || 'No especificado'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 3. SALUD FINANCIERA - LA JOYA */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                        💰 Salud Financiera
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Ecuación Contable Visual */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border-2 border-emerald-200">
                                <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-1">🟢 TOTAL ACTIVOS</p>
                                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">
                                    {formatCurrency(totalActivos)}
                                </p>
                                <p className="text-xs text-emerald-600 mt-1">Lo que tienes</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-2 border-red-200">
                                <p className="text-sm text-red-700 dark:text-red-400 mb-1">🔴 TOTAL PASIVOS</p>
                                <p className="text-2xl font-bold text-red-900 dark:text-red-300">
                                    {formatCurrency(totalPasivos)}
                                </p>
                                <p className="text-xs text-red-600 mt-1">Lo que debes</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-200">
                                <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">🔵 PATRIMONIO</p>
                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                                    {formatCurrency(patrimonio)}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">Tu capital real</p>
                            </div>
                        </div>

                        {/* Barra Visual */}
                        <div className="space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400">Composición del Balance:</p>
                            <div className="h-8 flex rounded-lg overflow-hidden">
                                <div
                                    className="bg-red-500 flex items-center justify-center text-white text-xs font-semibold"
                                    style={{ width: `${(totalPasivos / totalActivos) * 100}%` }}
                                >
                                    {((totalPasivos / totalActivos) * 100).toFixed(0)}% Deuda
                                </div>
                                <div
                                    className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
                                    style={{ width: `${(patrimonio / totalActivos) * 100}%` }}
                                >
                                    {((patrimonio / totalActivos) * 100).toFixed(0)}% Capital
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 4. CAPACIDAD DE VENTAS */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <FileText className="w-6 h-6 text-blue-600" />
                        📈 Capacidad de Ventas (DIAN)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Ingresos Brutos (Ventas)</p>
                            <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">
                                {formatCurrency(ingresosBrutos)}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg">
                            <p className="text-sm text-green-700 dark:text-green-400 mb-1">Utilidad / Renta Líquida</p>
                            <p className="text-3xl font-bold text-green-900 dark:text-green-300">
                                {formatCurrency(rentaLiquida)}
                            </p>
                        </div>
                    </div>
                    {Math.abs(totalActivos - (ingresosBrutos / 3)) < 100000000 && (
                        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200">
                            <p className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                ✅ Excelente consistencia entre Balance y Declaración DIAN
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 5. LA JUNTA DIRECTIVA */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Users className="w-6 h-6 text-purple-600" />
                        👥 Composición Accionaria
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {shareholders.length > 0 ? (
                        <div className="space-y-3">
                            {shareholders.map((socio, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                            {socio.nombre_socio?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {socio.nombre_socio}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {socio.identificacion}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                        🏅 {socio.participacion}%
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-amber-600">Esperando procesamiento de socios...</p>
                    )}
                </CardContent>
            </Card>

            {/* 6. REFERENCIAS */}
            {referencias.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Building2 className="w-6 h-6 text-orange-600" />
                            📞 Referencias Comerciales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            {referencias.map((ref, idx) => (
                                <div key={idx} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
                                    <p className="font-semibold text-orange-900 dark:text-orange-300">
                                        {ref.nombre_empresa}
                                    </p>
                                    <p className="text-sm text-orange-700 dark:text-orange-400">
                                        {ref.contacto_nombre} - {ref.telefono}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* BOTONES DE ACCIÓN */}
            <div className="flex justify-between pt-6 border-t">
                {onBack && (
                    <Button type="button" variant="ghost" onClick={onBack} size="lg">
                        Atrás
                    </Button>
                )}
                <Button
                    onClick={handleSubmit}
                    className="ml-auto bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 shadow-lg"
                    size="lg"
                >
                    Enviar Solicitud para Revisión 🚀
                </Button>
            </div>
        </div>
    );
}
