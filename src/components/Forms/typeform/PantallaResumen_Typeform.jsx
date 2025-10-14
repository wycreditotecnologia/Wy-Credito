import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const PantallaResumen_Typeform = ({ formData, onSubmit, isLoading = false, error }) => {
  return (
    <div className="flex flex-col items-start w-full text-left">
      <Label className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
        Revisa tu información
      </Label>
      <p className="text-muted-foreground mb-8">
        Este es el resumen de tu solicitud. Por favor, verifica que todos los datos sean correctos antes de enviar.
      </p>

      <div className="w-full space-y-4 text-sm bg-background/50 p-6 rounded-lg border">
        <div>
          <p className="font-semibold text-muted-foreground">NIT</p>
          <p>{formData.nit || 'No especificado'}</p>
        </div>
        <div>
          <p className="font-semibold text-muted-foreground">Razón Social</p>
          <p>{formData.razonSocial || 'No especificado'}</p>
        </div>
        {/* Campos adicionales del resumen */}
        <div>
          <p className="font-semibold text-muted-foreground">Tipo de Documento del Representante</p>
          <p>{formData.tipoDocumentoRepresentante || 'No especificado'}</p>
        </div>
        <div>
          <p className="font-semibold text-muted-foreground">Documento Financiero</p>
          <p>{formData.url_documento_financiero ? 'Archivo cargado' : 'No cargado'}</p>
        </div>
        <div>
          <p className="font-semibold text-muted-foreground">Referencia 1 - Nombre</p>
          <p>{formData.referencia1_nombre || 'No especificado'}</p>
        </div>
        <div>
          <p className="font-semibold text-muted-foreground">Garantía - Descripción</p>
          <p>{formData.descripcion_garantia || 'No especificado'}</p>
        </div>
      </div>

      {/* Error de envío */}
      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle />
          <AlertTitle>Error al enviar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={onSubmit} className="mt-8 bg-black text-white hover:bg-black/80" disabled={isLoading} aria-busy={isLoading}>
        {isLoading && <Spinner className="mr-2 h-4 w-4" />} Enviar Solicitud
      </Button>
    </div>
  );
};

export default PantallaResumen_Typeform;