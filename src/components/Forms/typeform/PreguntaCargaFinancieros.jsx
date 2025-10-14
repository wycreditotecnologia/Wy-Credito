// src/components/forms/typeform/PreguntaCargaFinancieros.jsx
import React from 'react';
import { Label } from '@/components/ui/label';
import FileUpload from '@/components/FileUpload/FileUpload';

const PreguntaCargaFinancieros = ({ onComplete, sessionId }) => {
  const handleUploadSuccess = (fileUrl) => {
    // Completa el paso inmediatamente al subir el archivo
    onComplete({ url_documento_financiero: fileUrl });
  };

  return (
    <div className="flex flex-col items-start w-full">
      <Label className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
        Ahora, necesitamos tus documentos financieros.
      </Label>
      <p className="text-muted-foreground mb-8">
        Por favor, sube tus estados financieros más recientes o el certificado de ingresos.
      </p>

      <FileUpload
        sessionId={sessionId}
        documentType="estados_financieros"
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default PreguntaCargaFinancieros;