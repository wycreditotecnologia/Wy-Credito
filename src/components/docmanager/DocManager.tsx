"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";

type Report = { metrics: { liquidez: number; solvencia: number; endeudamiento: number; margen: number }, flags: Record<string, boolean> } | null;

export default function DocManager() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<"idle"|"uploading"|"extracting"|"done"|"error">("idle");
  const [registryId, setRegistryId] = useState<string>("");
  const [report, setReport] = useState<Report>(null);
  const [userId, setUserId] = useState<string>("");
  const [requestId, setRequestId] = useState<string>("");

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] || null;
    if (!f) return;
    setFile(f);
    handleUpload(f);
  };

  const handleUpload = async (f?: File | null) => {
    const pdf = f || file;
    if (!pdf) {
      toast({ title: "Selecciona un PDF", description: "Arrastra o elige un archivo .pdf" });
      return;
    }
    if (pdf.type !== "application/pdf") {
      toast({ title: "Tipo no permitido", description: "Solo PDF", variant: "destructive" });
      return;
    }
    if (!userId || !requestId) {
      toast({ title: "Faltan datos", description: "Ingresa usuario y solicitud", variant: "destructive" });
      return;
    }
    try {
      setState("uploading");
      const fd = new FormData();
      fd.append("file", pdf);
      fd.append("user_id", userId);
      fd.append("request_id", requestId);
      fd.append("doc_type", "estados_financieros");
      const res = await fetch("/next_api/docmanager/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.errorMessage || "Error al subir");
      toast({ title: "Subido", description: "Documento guardado en Storage" });
      setRegistryId(json.registry_id);
      await handleExtract(json.registry_id);
    } catch (e: any) {
      setState("error");
      toast({ title: "Error", description: e?.message || "Fallo en subida", variant: "destructive" });
    }
  };

  const handleExtract = async (rid: string) => {
    try {
      setState("extracting");
      const res = await fetch("/next_api/docmanager/extract", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registry_id: rid }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.errorMessage || "Error extrayendo");
      toast({ title: "Procesado", description: `Filas insertadas: ${json.inserted}` });
      await handleReport();
    } catch (e: any) {
      setState("error");
      toast({ title: "Error", description: e?.message || "Fallo en extracción", variant: "destructive" });
    }
  };

  const handleReport = async () => {
    try {
      const res = await fetch(`/next_api/docmanager/report?request_id=${encodeURIComponent(requestId)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.errorMessage || "Error en reporte");
      setReport(json);
      setState("done");
      toast({ title: "Listo", description: "Reporte generado" });
    } catch (e: any) {
      setState("error");
      toast({ title: "Error", description: e?.message || "Fallo en reporte", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <Label className="text-blue-500">Usuario</Label>
          <Input value={userId} onChange={(e) => setUserId(e.target.value)} className="mt-2" />
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <Label className="text-blue-500">Solicitud</Label>
          <Input value={requestId} onChange={(e) => setRequestId(e.target.value)} className="mt-2" />
        </div>
      </div>

      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className="flex items-center justify-center gap-3">
          <Upload className="w-5 h-5 text-blue-500" />
          <span className="text-blue-500">Arrastra tu PDF de EEFF aquí</span>
        </div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Input type="file" accept="application/pdf,.pdf" onChange={(e) => { const f=e.target.files?.[0]||null; setFile(f); }} className="max-w-sm" />
          <Button onClick={() => handleUpload()} disabled={!file || state==="uploading"||state==="extracting"}>
            {state === "uploading" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Subiendo...</> : "Subir y procesar"}
          </Button>
        </div>
      </div>

      {state !== "idle" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-blue-500 font-medium">Estado: {state === "extracting" ? "Procesando" : state}</div>
          {registryId && <div className="text-xs text-muted-foreground mt-1">registry_id: {registryId}</div>}
        </div>
      )}

      {report && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-blue-500 font-semibold mb-2">Resumen de Riesgo</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>Liquidez: {report.metrics.liquidez.toFixed(3)}</div>
            <div>Solvencia: {report.metrics.solvencia.toFixed(3)}</div>
            <div>Endeudamiento: {report.metrics.endeudamiento.toFixed(3)}</div>
            <div>Margen: {report.metrics.margen.toFixed(3)}</div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Flags: {Object.entries(report.flags).map(([k,v])=>`${k}:${v?'true':'false'}`).join(', ')}</div>
        </div>
      )}
    </div>
  );
}

