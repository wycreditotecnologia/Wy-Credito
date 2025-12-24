
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Camera, Shield, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step6GuaranteeProps {
  initialData?: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

export function Step6Guarantee({ initialData, onComplete, onBack }: Step6GuaranteeProps) {
  const [formData, setFormData] = useState({
    guarantee_photo_url: initialData?.guarantee_photo_url || "",
    guarantee_description: initialData?.guarantee_description || "",
    guarantee_value: initialData?.guarantee_value || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.guarantee_description.trim()) {
      newErrors.guarantee_description = "La descripción es requerida";
    }
    if (!formData.guarantee_value.trim()) {
      newErrors.guarantee_value = "El valor es requerido";
    } else if (Number(formData.guarantee_value) <= 0) {
      newErrors.guarantee_value = "El valor debe ser mayor a 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onComplete(formData);
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, "");
    return new Intl.NumberFormat("es-CO").format(Number(number));
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, guarantee_value: value });
    if (errors.guarantee_value) setErrors({ ...errors, guarantee_value: "" });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Aquí iría la lógica de carga de archivo
      console.log("Archivo droppeado:", e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-montserrat font-bold mb-2">Garantía Mobiliaria</h2>
        <p className="text-muted-foreground">Describe el bien ofrecido como respaldo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-base">Foto de la garantía (URL)</Label>
            <Input
              id="guarantee_photo_url"
              value={formData.guarantee_photo_url}
              onChange={(e) => setFormData({ ...formData, guarantee_photo_url: e.target.value })}
              placeholder="https://..."
              className="text-base py-2 h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guarantee_description" className="text-base">Descripción</Label>
            <Textarea
              id="guarantee_description"
              value={formData.guarantee_description}
              onChange={(e) => {
                setFormData({ ...formData, guarantee_description: e.target.value });
                if (errors.guarantee_description) setErrors({ ...errors, guarantee_description: "" });
              }}
              placeholder="Describe el bien ofrecido"
              required
              rows={4}
              className="text-base"
            />
            {errors.guarantee_description && (
              <p className="text-sm text-destructive mt-1">{errors.guarantee_description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guarantee_value" className="text-base">Valor estimado</Label>
            <Input
              id="guarantee_value"
              type="text"
              inputMode="numeric"
              value={formData.guarantee_value}
              onChange={handleValueChange}
              placeholder="0"
              required
              className="text-base h-10"
            />
            {errors.guarantee_value && (
              <p className="text-sm text-destructive mt-1">{errors.guarantee_value}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" size="lg" className="flex-1 text-base py-2 h-10" onClick={onBack}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Atrás
          </Button>
          <Button type="submit" size="lg" className="flex-1 text-base py-2 h-10">
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
