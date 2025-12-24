
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";

interface Step2LegalDocsProps {
  initialData?: any;
  applicationId?: number | null;
  onComplete: (data: any) => void;
  onBack: () => void;
}

export function Step2LegalDocs({ initialData, applicationId, onComplete, onBack }: Step2LegalDocsProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    legal_rep_name: initialData?.legal_rep_name || "",
    legal_rep_doc_type: initialData?.legal_rep_doc_type || "",
    legal_rep_doc_number: initialData?.legal_rep_doc_number || "",
    legal_rep_phone: initialData?.legal_rep_phone || "",
    id_document_url: initialData?.id_document_url || "",
    certificate_url: initialData?.certificate_url || "",
    shareholders_url: initialData?.shareholders_url || "",
    extracted_legal: initialData?.extracted_legal || null,
  });

  const [uploadsDisabled] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const getStatus = () => "";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-montserrat font-bold mb-2">Documentación Legal</h2>
        <p className="text-muted-foreground">Información del representante legal y documentos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-2">
            <Label htmlFor="legal_rep_name" className="text-base">Nombre del Representante Legal</Label>
            <Input
              id="legal_rep_name"
              value={formData.legal_rep_name}
              onChange={(e) => setFormData({ ...formData, legal_rep_name: e.target.value })}
              placeholder="Nombre completo"
              required
              className="text-base py-2 h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal_rep_doc_type" className="text-base">Tipo de Documento</Label>
            <Select
              value={formData.legal_rep_doc_type}
              onValueChange={(value) => setFormData({ ...formData, legal_rep_doc_type: value })}
            >
              <SelectTrigger className="text-base py-2 h-10">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal_rep_doc_number" className="text-base">Número de Documento</Label>
            <Input
              id="legal_rep_doc_number"
              value={formData.legal_rep_doc_number}
              onChange={(e) => setFormData({ ...formData, legal_rep_doc_number: e.target.value })}
              placeholder="123456789"
              required
              className="text-base py-2 h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal_rep_phone" className="text-base">Celular</Label>
            <Input
              id="legal_rep_phone"
              type="tel"
              value={formData.legal_rep_phone}
              onChange={(e) => setFormData({ ...formData, legal_rep_phone: e.target.value })}
              placeholder="3001234567"
              required
              className="text-base py-2 h-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-3 md:col-span-1">
          <Label className="text-lg">Documento de Identidad (PDF)</Label>
          <div className="w-full p-4 bg-primary/10 rounded-md border border-primary/40">
            <div className="flex items-center gap-3">
              <Input type="file" accept="application/pdf" className="bg-white" disabled={uploadsDisabled} />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">La carga de documentos se realiza en el Paso 3.</div>
          </div>
          </div>
          <div className="space-y-3 md:col-span-1">
          <Label className="text-lg">Certificado de Existencia (PDF)</Label>
          <div className="w-full p-4 bg-primary/10 rounded-md border border-primary/40">
            <div className="flex items-center gap-3">
              <Input type="file" accept="application/pdf" className="bg-white" disabled={uploadsDisabled} />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">La carga de documentos se realiza en el Paso 3.</div>
          </div>
          </div>
          <div className="space-y-3 md:col-span-2">
          <Label className="text-lg">Composición Accionaria (PDF)</Label>
          <div className="w-full p-4 bg-primary/10 rounded-md border border-primary/40">
            <div className="flex items-center gap-3">
              <Input type="file" accept="application/pdf" className="bg-white" disabled={uploadsDisabled} />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">La carga de documentos se realiza en el Paso 3.</div>
          </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1 text-lg py-3 h-12"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Atrás
          </Button>
          <Button
            type="submit"
            size="lg"
            className="flex-1 text-lg py-3 h-12"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        {formData.extracted_legal && (
          <div className="space-y-2">
            <Label className="text-lg">Extracción Legal</Label>
            <pre className="bg-zinc-800/50 rounded-md border border-zinc-700 p-4 text-xs overflow-auto max-h-64">
              {JSON.stringify(formData.extracted_legal, null, 2)}
            </pre>
          </div>
        )}
      </form>
    </div>
  );
}
