
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface Step4ReferencesProps {
  initialData?: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

export function Step4References({ initialData, onComplete, onBack }: Step4ReferencesProps) {
  const [formData, setFormData] = useState({
    reference1_name: initialData?.reference1_name || "",
    reference1_phone: initialData?.reference1_phone || "",
    reference2_name: initialData?.reference2_name || "",
    reference2_phone: initialData?.reference2_phone || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ""));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.reference1_name.trim()) {
      newErrors.reference1_name = "El nombre es requerido";
    }
    if (!formData.reference1_phone.trim()) {
      newErrors.reference1_phone = "El teléfono es requerido";
    } else if (!validatePhone(formData.reference1_phone)) {
      newErrors.reference1_phone = "Ingresa un número válido de 10 dígitos";
    }
    if (!formData.reference2_name.trim()) {
      newErrors.reference2_name = "El nombre es requerido";
    }
    if (!formData.reference2_phone.trim()) {
      newErrors.reference2_phone = "El teléfono es requerido";
    } else if (!validatePhone(formData.reference2_phone)) {
      newErrors.reference2_phone = "Ingresa un número válido de 10 dígitos";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onComplete(formData);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-montserrat font-bold mb-2">
          ¿Quiénes pueden dar referencia de tu negocio?
        </h2>
        <p className="text-muted-foreground">
          Proporciona dos referencias comerciales que conozcan tu empresa
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 rounded-lg border md:border-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="reference1_name" className="text-base font-medium">Nombre de la primera referencia</Label>
                <Input
                  id="reference1_name"
                  value={formData.reference1_name}
                  onChange={(e) => {
                    setFormData({ ...formData, reference1_name: e.target.value });
                    if (errors.reference1_name) setErrors({ ...errors, reference1_name: "" });
                  }}
                  placeholder="Ej: María González"
                  required
                  className="text-base py-2 h-10"
                />
                {errors.reference1_name && (
                  <p className="text-sm text-destructive mt-1">{errors.reference1_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference1_phone" className="text-base font-medium">Teléfono</Label>
                <Input
                  id="reference1_phone"
                  type="tel"
                  value={formData.reference1_phone}
                  onChange={(e) => {
                    setFormData({ ...formData, reference1_phone: e.target.value });
                    if (errors.reference1_phone) setErrors({ ...errors, reference1_phone: "" });
                  }}
                  placeholder="300 123 4567"
                  required
                  className="text-base py-2 h-10"
                />
                {errors.reference1_phone && (
                  <p className="text-sm text-destructive mt-1">{errors.reference1_phone}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border md:border-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="reference2_name" className="text-base font-medium">Nombre de la segunda referencia</Label>
                <Input
                  id="reference2_name"
                  value={formData.reference2_name}
                  onChange={(e) => {
                    setFormData({ ...formData, reference2_name: e.target.value });
                    if (errors.reference2_name) setErrors({ ...errors, reference2_name: "" });
                  }}
                  placeholder="Ej: Carlos Rodríguez"
                  required
                  className="text-base py-2 h-10"
                />
                {errors.reference2_name && (
                  <p className="text-sm text-destructive mt-1">{errors.reference2_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference2_phone" className="text-base font-medium">Teléfono</Label>
                <Input
                  id="reference2_phone"
                  type="tel"
                  value={formData.reference2_phone}
                  onChange={(e) => {
                    setFormData({ ...formData, reference2_phone: e.target.value });
                    if (errors.reference2_phone) setErrors({ ...errors, reference2_phone: "" });
                  }}
                  placeholder="300 987 6543"
                  required
                  className="text-base py-2 h-10"
                />
                {errors.reference2_phone && (
                  <p className="text-sm text-destructive mt-1">{errors.reference2_phone}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1 text-base py-2 h-10"
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Atrás
            </Button>
            <Button 
              type="submit" 
              size="lg" 
              className="flex-1 text-base py-2 h-10"
            >
              Continuar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
  );
}
