"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, Filter, CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function AdminDashboardPage() {
    const [solicitudes, setSolicitudes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const supabase = createClient();

    useEffect(() => {
        fetchSolicitudes();

        // Realtime Subscription
        const channel = supabase
            .channel('admin-dashboard')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'solicitudes' },
                () => fetchSolicitudes()
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchSolicitudes = async () => {
        // En producción, esto debería ser un JOIN con 'empresas' para traer nombres reales
        // Por ahora, asumimos que 'solicitudes' tiene lo básico o usamos mock
        const { data, error } = await supabase
            .from('solicitudes')
            .select(`
                *,
                empresas ( razon_social, nit )
            `)
            .order('created_at', { ascending: false });

        if (data) setSolicitudes(data);
        setLoading(false);
    };

    const filteredSolicitudes = solicitudes.filter(s => {
        if (filterStatus === "all") return true;
        // Mapeo simple de estados del filtro
        if (filterStatus === "pendientes") return ['en_revision', 'submitted'].includes(s.estado);
        if (filterStatus === "aprobados") return s.estado === 'aprobado';
        if (filterStatus === "rechazados") return s.estado === 'rechazado';
        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'aprobado': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Aprobado</Badge>;
            case 'rechazado': return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Rechazado</Badge>;
            case 'en_revision':
            case 'en_estudio':
            case 'submitted': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">En Revisión</Badge>;
            default: return <Badge variant="outline" className="text-slate-500">Borrador</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Bandeja de Entrada</h2>
                    <p className="text-slate-500">Gestiona las solicitudes de crédito recientes.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtros
                    </Button>
                    <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                        <Clock className="mr-2 h-4 w-4" />
                        Actualizar
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <Tabs defaultValue="all" className="w-[400px]" onValueChange={setFilterStatus}>
                            <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800">
                                <TabsTrigger value="all">Todas</TabsTrigger>
                                <TabsTrigger value="pendientes" className="data-[state=active]:text-blue-600">Pendientes</TabsTrigger>
                                <TabsTrigger value="aprobados" className="data-[state=active]:text-green-600">Aprobadas</TabsTrigger>
                                <TabsTrigger value="rechazados" className="data-[state=active]:text-red-600">Rechazadas</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="Buscar por NIT o Empresa" className="pl-8 h-9 bg-slate-50" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                            <TableRow>
                                <TableHead className="w-[100px]">Radicado</TableHead>
                                <TableHead>Empresa / NIT</TableHead>
                                <TableHead>Monto Solicitado</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-center">IA Score</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">Cargando solicitudes...</TableCell>
                                </TableRow>
                            ) : filteredSolicitudes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                                        No hay solicitudes en esta bandeja. 📭
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSolicitudes.map((solicitud) => (
                                    <TableRow key={solicitud.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <TableCell className="font-medium text-slate-500 text-xs">
                                            {new Date(solicitud.created_at).toLocaleDateString()}
                                            <br />
                                            <span className="text-[10px]">{new Date(solicitud.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    {solicitud.empresas?.razon_social || "Empresa Pendiente"}
                                                </span>
                                                <span className="text-xs text-slate-500 font-mono">
                                                    NIT: {solicitud.empresas?.nit || "---"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-slate-700 dark:text-slate-300">
                                            ${Number(solicitud.monto_solicitado || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(solicitud.estado)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {/* Mock AI Score - Semaforo */}
                                            <div className="flex justify-center items-center gap-1">
                                                {/* Lógica mock: si tiene documentos, verde */}
                                                <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" title="Documentos Validados OK"></div>
                                                <span className="text-xs font-bold text-green-600">High</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild size="sm" className="bg-slate-900 hover:bg-brand-primary text-white shadow-sm">
                                                <Link href={`/admin/requests/${solicitud.id}`}>
                                                    <Search className="w-3 h-3 mr-1" />
                                                    Gestionar
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
