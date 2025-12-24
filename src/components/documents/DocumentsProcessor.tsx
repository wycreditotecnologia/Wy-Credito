"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

type DocItem = { name: string; size: number; type: string; status: "pending" | "uploading" | "processing" | "done" | "error"; url?: string };

export default function DocumentsProcessor() {
  const [items, setItems] = useState<DocItem[]>([]);
  const [folder, setFolder] = useState("solicitudes/001");
  const [solicitudId, setSolicitudId] = useState<string>(crypto.randomUUID());
  const [busy, setBusy] = useState(false);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const pdfs = arr.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    const rejected = arr.length - pdfs.length;
    if (rejected > 0) {
      toast.warning("Solo se aceptan archivos PDF");
    }
    const next = pdfs.map((f) => ({ name: f.name, size: f.size, type: f.type, status: "pending" as const }));
    setItems((prev) => [...prev, ...next]);
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  };

  const startProcess = async (files: File[]) => {
    setBusy(true);
    try {
      const form = new FormData();
      form.append("folder", folder);
      form.append("solicitud_id", solicitudId);
      for (const f of files) form.append("files", f);
      const res = await fetch("/next_api/docs/process", { method: "POST", body: form });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Procesados ${json.count} documentos`);
      } else {
        toast.error(json.error || "Error procesando documentos");
      }
    } catch (e: any) {
      toast.error(e?.message || "Error procesando documentos");
    }
    setBusy(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label>Carpeta</Label>
          <Input value={folder} onChange={(e) => setFolder(e.target.value)} />
        </div>
        <div className="flex-1">
          <Label>Solicitud ID</Label>
          <Input value={solicitudId} onChange={(e) => setSolicitudId(e.target.value)} />
        </div>
      </div>

      <div
        className="border-2 border-dashed rounded-xl p-8 text-center bg-primary/5"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-center gap-3">
          <Upload className="w-5 h-5 text-primary" />
          <span>Arrastra y suelta aquí tus documentos</span>
        </div>
        <div className="mt-4">
          <Input type="file" multiple accept="application/pdf,.pdf" onChange={(e) => onFiles(e.target.files)} />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((it, idx) => (
          <div key={`${it.name}-${idx}`} className="flex items-center justify-between border rounded-lg p-3">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <div>
                <div className="font-medium">{it.name}</div>
                <div className="text-xs text-muted-foreground">{(it.size / 1024).toFixed(1)} KB</div>
              </div>
            </div>
            <div>
              {it.status === "done" && <Check className="w-4 h-4 text-green-600" />}
              {it.status === "uploading" && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          disabled={busy}
          onClick={async () => {
            const input = document.createElement("input");
            input.type = "file"; input.multiple = true; input.accept = "application/pdf,.pdf";
            input.onchange = () => startProcess(Array.from(input.files || []));
            input.click();
          }}
        >
          Procesar por lotes
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const files = await (async () => {
              const picker = document.createElement("input");
              picker.type = "file"; picker.multiple = true; picker.accept = "application/pdf,.pdf";
              return new Promise<File[]>((resolve) => {
                picker.onchange = () => resolve(Array.from(picker.files || []));
                picker.click();
              })
            })();
            await startProcess(files);
          }}
        >
          Subir y procesar
        </Button>
      </div>
    </div>
  );
}
