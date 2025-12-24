"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ProcessingModalProps {
  open: boolean;
  title?: string;
  message?: string;
}

export default function ProcessingModal({ open, title = "Procesando", message = "Estamos extrayendo la información del documento" }: ProcessingModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
      </DialogContent>
    </Dialog>
  );
}

