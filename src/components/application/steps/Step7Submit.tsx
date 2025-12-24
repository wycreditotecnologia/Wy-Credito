"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { AUTH_CODE } from "@/constants/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Step7SubmitProps {
  applicationData: any;
  applicationId: number | null;
  onBack: () => void;
}

export function Step7Submit({ applicationData, applicationId, onBack }: Step7SubmitProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/solicitud/submit", { application_id: applicationId });
      setIsSubmitted(true);
      toast.success("Solicitud enviada exitosamente");
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.errorCode === AUTH_CODE.TOKEN_MISSING)) {
        const redirect = encodeURIComponent("/solicitud");
        const msg = encodeURIComponent("Inicia sesión para enviar la solicitud");
        router.push(`/login?redirect=${redirect}&msg=${msg}`);
        return;
      }
      toast.error("Error al enviar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-montserrat font-bold mb-2">Revisión y Envío</h2>
        <p className="text-muted-foreground">Confirma que todo está completo antes de enviar.</p>
      </div>

      <div className="flex gap-4 pt-2">
        <Button type="button" variant="outline" size="lg" className="flex-1 h-12" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          Revisar
        </Button>
        <Button size="lg" className="flex-1 h-12" onClick={handleSubmit} disabled={isSubmitted || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Enviar solicitud
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
