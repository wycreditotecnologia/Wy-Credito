"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2 } from "lucide-react";

export interface FinancialSummary {
  totals: { activos: number; pasivos: number; patrimonio: number };
  confidence: number;
  metrics: { liquidez: number; solvencia: number; endeudamiento: number; margen: number };
  inserted?: number;
  is_real?: boolean;
  warning?: string;
}

interface SmartFinancialUploaderProps {
  requestId: string;
  userId: string;
  onExtractionComplete?: (summary: FinancialSummary) => void;
}

export default function SmartFinancialUploader({ requestId, userId, onExtractionComplete }: SmartFinancialUploaderProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<"idle"|"uploading"|"extracting"|"done"|"error">("idle");
  const [registryId, setRegistryId] = useState<string>("");
  const [summary, setSummary] = useState<FinancialSummary | null>(null);

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
      const rid = json?.data?.registry_id || json?.registry_id || "";
      console.log("CLIENTE TRAZA: Intentando extraer con ID:", rid);
      if (!rid) {
        toast({ title: "Error crítico", description: "No se pudo obtener el ID de registro. Falla de DB.", variant: "destructive" });
        return;
      }
      if (!rid) throw new Error("registry_id no devuelto por upload");
      setRegistryId(rid);
      await handleExtract(rid);
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
      const data = json?.data || {};
      toast({ title: "Wy-IA analizando activos y pasivos...", description: `Filas insertadas: ${data.inserted || 0}` });
      onExtractionComplete?.(data);
      setSummary(data);
      setState("done");
    } catch (e: any) {
      setState("error");
      toast({ title: "Error", description: e?.message || "Fallo en extracción", variant: "destructive" });
    }
  };

  const handleReport = async () => {
    try {
      const waitTimeout = setTimeout(() => {
        toast({ title: "Estamos leyendo detalladamente cada cuenta..." });
      }, 10000);
      const res = await fetch(`/next_api/docmanager/report?request_id=${encodeURIComponent(requestId)}`);
      clearTimeout(waitTimeout);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.errorMessage || "Error en reporte");
      const s: FinancialSummary = { totals: json.totals, confidence: json.confidence, metrics: json.metrics };
      setSummary(s);
      setState("done");
      toast({ title: "Análisis completado" });
      onExtractionComplete?.(s);
    } catch (e: any) {
      setState("error");
      toast({ title: "Error", description: e?.message || "Fallo en reporte", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {state === "idle" && (
        <div
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <div className="flex items-center justify-center gap-3">
            <Upload className="w-5 h-5 text-blue-500" />
            <span className="text-blue-500">Arrastra tus Estados Financieros (2023-2024)</span>
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Input type="file" accept="application/pdf,.pdf" onChange={(e) => { const f=e.target.files?.[0]||null; setFile(f); }} className="max-w-sm" />
            <Button onClick={() => handleUpload()} disabled={!file}>{"Subir y procesar"}</Button>
          </div>
        </div>
      )}

      {state === "uploading" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-500"><Loader2 className="h-4 w-4 animate-spin" /> Subiendo documento...</div>
          {registryId && <div className="text-xs text-muted-foreground mt-1">registry_id: {registryId}</div>}
        </div>
      )}

      {state === "extracting" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-blue-500 font-medium">Wy-IA analizando activos y pasivos...</div>
          <div className="mt-3 h-2 w-full bg-blue-500/20 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-blue-500 animate-pulse" />
          </div>
        </div>
      )}

      {state === "done" && summary && (
        <div className="rounded-lg p-5 border border-zinc-300 bg-white/80 text-zinc-900 shadow-sm">
          <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
            <span>✅ ANÁLISIS COMPLETADO</span>
            {!summary.is_real && <span className="text-red-600 font-medium">(Validación requerida)</span>}
          </div>
          {summary.warning && (
            <div className="mt-2 text-sm text-red-700">{summary.warning}</div>
          )}
          {summary.is_real && (
            <>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-zinc-50 border border-zinc-200 rounded-md p-3">
                  <div className="text-xs text-zinc-500">Activos Totales</div>
                  <div className="text-base font-medium">$ {summary.totals.activos.toLocaleString()}</div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded-md p-3">
                  <div className="text-xs text-zinc-500">Pasivos Totales</div>
                  <div className="text-base font-medium">$ {summary.totals.pasivos.toLocaleString()}</div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded-md p-3">
                  <div className="text-xs text-zinc-500">Patrimonio</div>
                  <div className="text-base font-medium">$ {summary.totals.patrimonio.toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-zinc-50 border border-zinc-200 rounded-md p-3"><div className="text-xs text-zinc-500">Liquidez</div><div className="text-base font-medium">{(summary.metrics.liquidez).toFixed(2)}</div></div>
                <div className="bg-zinc-50 border border-zinc-200 rounded-md p-3"><div className="text-xs text-zinc-500">Solvencia</div><div className="text-base font-medium">{(summary.metrics.solvencia).toFixed(2)}</div></div>
                <div className="bg-zinc-50 border border-zinc-200 rounded-md p-3"><div className="text-xs text-zinc-500">Endeudamiento</div><div className="text-base font-medium">{(summary.metrics.endeudamiento).toFixed(2)}</div></div>
                <div className="bg-zinc-50 border border-zinc-200 rounded-md p-3"><div className="text-xs text-zinc-500">Margen</div><div className="text-base font-medium">{(summary.metrics.margen).toFixed(2)}</div></div>
              </div>
              <div className="mt-4 text-sm text-zinc-700">Nivel de Confianza: {Math.round(summary.confidence)}%</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
