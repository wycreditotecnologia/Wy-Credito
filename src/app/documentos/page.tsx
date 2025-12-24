"use client";
import DocumentsProcessor from "@/components/documents/DocumentsProcessor";

export default function Page() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Procesamiento de Documentos</h1>
        <p className="text-muted-foreground">Carga, extracción con IA y organización por solicitud.</p>
        <DocumentsProcessor />
      </div>
    </div>
  );
}

