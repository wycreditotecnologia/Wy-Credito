"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, Shield, FileText, CheckCircle } from "lucide-react";

interface Step5DeclarationsProps {
  initialData?: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

export function Step5Declarations({ initialData, onComplete, onBack }: Step5DeclarationsProps) {
  const [formData, setFormData] = useState({
    declaration_productive_use: initialData?.declaration_productive_use || false,
    declaration_no_personal_use: initialData?.declaration_no_personal_use || false,
    declaration_terms_accepted: initialData?.declaration_terms_accepted || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const allChecked =
    formData.declaration_productive_use &&
    formData.declaration_no_personal_use &&
    formData.declaration_terms_accepted;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-montserrat font-bold mb-2">Declaraciones importantes</h2>
        <p className="text-muted-foreground">Confirma que comprendes y aceptas lo siguiente</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className={`p-3 rounded-lg border ${formData.declaration_productive_use ? 'border-primary bg-primary/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
          <div className="flex items-start gap-3">
            <Checkbox
              id="declaration_productive_use"
              checked={formData.declaration_productive_use}
              onCheckedChange={(checked) => setFormData({ ...formData, declaration_productive_use: checked as boolean })}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <Label htmlFor="declaration_productive_use" className="text-base font-medium">Uso productivo del crédito</Label>
              </div>
              <p className="text-sm text-muted-foreground">Los recursos se destinarán exclusivamente a actividades productivas y comerciales.</p>
            </div>
          </div>
        </div>

        <div className={`p-3 rounded-lg border ${formData.declaration_no_personal_use ? 'border-primary bg-primary/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
          <div className="flex items-start gap-3">
            <Checkbox
              id="declaration_no_personal_use"
              checked={formData.declaration_no_personal_use}
              onCheckedChange={(checked) => setFormData({ ...formData, declaration_no_personal_use: checked as boolean })}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <Label htmlFor="declaration_no_personal_use" className="text-base font-medium">Declaración de veracidad</Label>
              </div>
              <p className="text-sm text-muted-foreground">Los recursos no serán usados para fines personales y la información es veraz.</p>
            </div>
          </div>
        </div>

        <div className={`p-3 rounded-lg border md:col-span-2 ${formData.declaration_terms_accepted ? 'border-primary bg-primary/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
          <div className="flex items-start gap-3">
            <Checkbox
              id="declaration_terms_accepted"
              checked={formData.declaration_terms_accepted}
              onCheckedChange={(checked) => setFormData({ ...formData, declaration_terms_accepted: checked as boolean })}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <Label htmlFor="declaration_terms_accepted" className="text-base font-medium">Aceptación de términos</Label>
              </div>
              <p className="text-sm text-muted-foreground">Acepto las políticas de Habeas Data y los términos y condiciones.</p>
            </div>
          </div>
        </div>
        </div>
        <div className="flex gap-4 pt-2">
          <Button type="button" variant="outline" size="lg" className="flex-1 text-base py-2 h-10" onClick={onBack}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Atrás
          </Button>
          <Button type="submit" size="lg" className="flex-1 text-base py-2 h-10" disabled={!allChecked}>
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
