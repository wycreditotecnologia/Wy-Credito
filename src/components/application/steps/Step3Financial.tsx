
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import SmartFinancialUploader from "@/components/docmanager/SmartFinancialUploader";
import { useAuth } from "@/components/auth/AuthProvider";
 

interface Step3FinancialProps {
  initialData?: any;
  applicationId?: number | null;
  onComplete: (data: any) => void;
  onBack: () => void;
}

export function Step3Financial({ initialData, applicationId, onComplete, onBack }: Step3FinancialProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    tax_return_url: initialData?.tax_return_url || "",
    financial_statements_url: initialData?.financial_statements_url || "",
    resource_purpose: initialData?.resource_purpose || "",
    acquire_fixed_assets: initialData?.acquire_fixed_assets || "",
    fixed_assets_description: initialData?.fixed_assets_description || "",
    extracted_financials: initialData?.extracted_financials || null,
    financials_uploaded: initialData?.financials_uploaded || false,
  });

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-montserrat font-bold mb-2">Información Financiera</h2>
        <p className="text-muted-foreground">Documentos financieros y uso de recursos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

          <div className="space-y-2">
            <Label className="text-lg">Estados Financieros (Magic UI)</Label>
            <SmartFinancialUploader
              requestId={String(applicationId || "guest")}
              userId={user?.sub || ""}
              onExtractionComplete={(s) => {
                const isReal = s?.is_real !== false;
                setFormData((prev) => ({ ...prev, extracted_financials: s, financials_uploaded: isReal }));
                if (isReal) toast.success("Extracción verificada, puedes continuar");
                else toast.error("Los datos no pudieron verificarse. Reintenta con un PDF claro.");
              }}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
          <Label htmlFor="resource_purpose" className="text-lg">
            ¿Para qué usará los recursos solicitados?
          </Label>
          <Textarea
            id="resource_purpose"
            value={formData.resource_purpose}
            onChange={(e) => setFormData({ ...formData, resource_purpose: e.target.value })}
            placeholder="Describe el destino de los recursos..."
            required
            rows={4}
            className="text-base py-2"
          />
          </div>

          <div className="space-y-3 md:col-span-2">
          <Label className="text-lg">¿Planea adquirir activos fijos?</Label>
          <RadioGroup
            value={formData.acquire_fixed_assets}
            onValueChange={(value) =>
              setFormData({ ...formData, acquire_fixed_assets: value })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes" className="font-normal cursor-pointer">
                Sí
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no" className="font-normal cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
          </div>

        {formData.acquire_fixed_assets === "yes" && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fixed_assets_description" className="text-lg">
              Describe los activos fijos a adquirir
            </Label>
            <Textarea
              id="fixed_assets_description"
              value={formData.fixed_assets_description}
              onChange={(e) =>
                setFormData({ ...formData, fixed_assets_description: e.target.value })
              }
              placeholder="Describe los activos..."
              required
              rows={3}
              className="text-base"
            />
          </div>
        )}
        </div>

        {formData.extracted_financials && formData.extracted_financials.is_real !== false && (
          <div className="space-y-2">
            <Label className="text-lg">Extracción</Label>
            <pre className="bg-zinc-800/50 rounded-md border border-zinc-700 p-4 text-xs overflow-auto max-h-64">
              {JSON.stringify(formData.extracted_financials, null, 2)}
            </pre>
          </div>
        )}

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
          disabled={!formData.financials_uploaded}
        >
          Continuar
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        </div>
      </form>
    </div>
  );
}
