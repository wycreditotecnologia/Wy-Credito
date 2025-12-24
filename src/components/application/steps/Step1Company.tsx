
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";

interface Step1CompanyProps {
  initialData?: any;
  onComplete: (data: any) => void;
}

export function Step1Company({ initialData, onComplete }: Step1CompanyProps) {
  const [formData, setFormData] = useState({
    nit: initialData?.nit || "",
    company_name: initialData?.company_name || "",
    company_type: initialData?.company_type || "",
    website: initialData?.website || "",
    social_media: initialData?.social_media || "",
    data_authorization: initialData?.data_authorization || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-montserrat font-bold mb-2">Información de tu Empresa</h2>
        <p className="text-zinc-400">Cuéntanos sobre tu negocio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-2">
            <Label htmlFor="nit" className="text-base">NIT de la empresa</Label>
            <Input
              id="nit"
              value={formData.nit}
              onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
              placeholder="123456789-0"
              required
              className="text-base py-2 h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name" className="text-base">Razón Social</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Nombre legal de la empresa"
              required
              className="text-base py-2 h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_type" className="text-base">Tipo de empresa</Label>
            <Select
              value={formData.company_type}
              onValueChange={(value) => setFormData({ ...formData, company_type: value })}
            >
              <SelectTrigger className="text-base py-2 h-10">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAS">SAS - Sociedad por Acciones Simplificada</SelectItem>
                <SelectItem value="SA">SA - Sociedad Anónima</SelectItem>
                <SelectItem value="LTDA">Ltda - Sociedad Limitada</SelectItem>
                <SelectItem value="EU">E.U. - Empresa Unipersonal</SelectItem>
                <SelectItem value="OTRO">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-base">Página Web (opcional)</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://www.tuempresa.com"
              className="text-base py-2 h-10"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="social_media" className="text-base">Redes Sociales (opcional)</Label>
            <Input
              id="social_media"
              value={formData.social_media}
              onChange={(e) => setFormData({ ...formData, social_media: e.target.value })}
              placeholder="Enlaces a redes sociales separados por comas"
              className="text-base py-2 h-10"
            />
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 rounded-lg border border-zinc-800">
          <Checkbox
            id="data_authorization"
            checked={formData.data_authorization}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, data_authorization: checked as boolean })
            }
            required
          />
          <div className="space-y-1">
            <Label
              htmlFor="data_authorization"
              className="text-sm font-normal cursor-pointer"
            >
              Autorizo la consulta de mi información en centrales de riesgo y acepto la política de tratamiento de datos personales (Habeas Data)
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full text-base py-2 h-10"
          disabled={!formData.data_authorization}
        >
          Continuar
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
