
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2, ExternalLink } from "lucide-react";

interface ApplicationDetailDialogProps {
  applicationId: number;
  onClose: () => void;
  onUpdate: () => void;
}

export function ApplicationDetailDialog({
  applicationId,
  onClose,
  onUpdate,
}: ApplicationDetailDialogProps) {
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  const loadApplication = async () => {
    try {
      const data = await api.get(`/admin/applications/${applicationId}`);
      setApplication(data);
      setStatus(data.status);
      setAdminNotes(data.admin_notes || "");
    } catch (error) {
      toast.error("Error al cargar la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/admin/applications/${applicationId}`, {
        status,
        admin_notes: adminNotes,
      });
      toast.success("Solicitud actualizada");
      onUpdate();
      onClose();
    } catch (error) {
      toast.error("Error al actualizar la solicitud");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de la Solicitud #{application.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Información de la Empresa</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">NIT:</span>{" "}
                  {application.company_nit || "N/A"}
                </div>
                <div>
                  <span className="text-muted-foreground">Razón Social:</span>{" "}
                  {application.company_name || "N/A"}
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo:</span>{" "}
                  {application.company_type || "N/A"}
                </div>
                {application.company_website && (
                  <div>
                    <span className="text-muted-foreground">Web:</span>{" "}
                    <a
                      href={application.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {application.company_website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Representante Legal</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Nombre:</span>{" "}
                  {application.legal_rep_name || "N/A"}
                </div>
                <div>
                  <span className="text-muted-foreground">Documento:</span>{" "}
                  {application.legal_rep_doc_type} {application.legal_rep_doc_number}
                </div>
                <div>
                  <span className="text-muted-foreground">Teléfono:</span>{" "}
                  {application.legal_rep_phone || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Uso de Recursos</h3>
            <p className="text-sm text-muted-foreground">
              {application.resource_purpose || "No especificado"}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Garantía</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Descripción:</span>{" "}
                {application.guarantee_description || "N/A"}
              </div>
              <div>
                <span className="text-muted-foreground">Valor:</span>{" "}
                {application.guarantee_value
                  ? new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                    }).format(application.guarantee_value)
                  : "N/A"}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Gestión de la Solicitud</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Enviada</SelectItem>
                    <SelectItem value="under_review">En Revisión</SelectItem>
                    <SelectItem value="approved">Aprobada</SelectItem>
                    <SelectItem value="rejected">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notas Internas</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Agrega notas sobre esta solicitud..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
