
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { FileText, Search, Filter } from "lucide-react";
import { ApplicationDetailDialog } from "./ApplicationDetailDialog";

interface Application {
  id: number;
  user_id: number;
  company_name: string;
  company_nit: string;
  status: string;
  submitted_at: string;
  created_at: string;
}

export function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<number | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const loadApplications = async () => {
    try {
      const data = await api.get("/admin/applications");
      setApplications(data || []);
    } catch (error) {
      toast.error("Error al cargar las solicitudes");
    } finally {
      setIsLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.company_nit?.includes(searchTerm)
      );
    }

    setFilteredApplications(filtered);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: "bg-zinc-700 text-zinc-300",
      submitted: "bg-blue-500/20 text-blue-400",
      under_review: "bg-yellow-500/20 text-yellow-400",
      approved: "bg-green-500/20 text-green-400",
      rejected: "bg-red-500/20 text-red-400",
    };

    const labels = {
      draft: "Borrador",
      submitted: "Enviada",
      under_review: "En Revisión",
      approved: "Aprobada",
      rejected: "Rechazada",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-montserrat font-bold mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona las solicitudes de crédito</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Solicitudes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Enviadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {applications.filter((a) => a.status === "submitted").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aprobadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {applications.filter((a) => a.status === "approved").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rechazadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">
                {applications.filter((a) => a.status === "rejected").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle>Solicitudes de Crédito</CardTitle>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por empresa o NIT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="submitted">Enviadas</SelectItem>
                    <SelectItem value="under_review">En Revisión</SelectItem>
                    <SelectItem value="approved">Aprobadas</SelectItem>
                    <SelectItem value="rejected">Rechazadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No se encontraron solicitudes
                </div>
              ) : (
                filteredApplications.map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {application.company_name || "Sin nombre"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          NIT: {application.company_nit || "N/A"} • ID: {application.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(application.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApplication(application.id)}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedApplication && (
        <ApplicationDetailDialog
          applicationId={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onUpdate={loadApplications}
        />
      )}
    </div>
  );
}
