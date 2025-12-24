"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAssistantBus } from "@/components/context/AssistantBus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, X, Send } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function ChatWidget() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bus = useAssistantBus();

  const visible = !!user && pathname?.startsWith("/solicitud");
  if (!visible) return null;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    try {
      const res = await fetch("/next_api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const reply = data?.data?.response || data?.response || "Hola, soy tu asistente. ¿En qué te ayudo?";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "No pude procesar tu mensaje ahora." }]);
    }
  };

  bus.subscribe((event) => {
    if (event.type === "financials") {
      const e = event.data?.extraction || {};
      const assets = e?.balance_sheet?.assets;
      const revenue = e?.income_statement?.revenue;
      const detail = assets ?? revenue ?? null;
      const txt = detail != null ? `Veo un valor clave: ${detail}.` : `Procesé tus Estados Financieros.`;
      setMessages((prev) => [...prev, { role: "assistant", content: `Listo. ${txt} Continuemos.` }]);
      setOpen(true);
    }
    if (event.type === "legal") {
      const e = event.data?.extraction || {};
      const nit = e?.nit;
      const rs = e?.razon_social;
      const parts = [nit ? `NIT ${nit}` : null, rs ? `Razón Social ${rs}` : null].filter(Boolean).join(", ");
      const txt = parts ? `Veo ${parts}.` : `Procesé tu Certificado de Existencia.`;
      setMessages((prev) => [...prev, { role: "assistant", content: `Listo. ${txt} Sigamos con el siguiente paso.` }]);
      setOpen(true);
    }
  });

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <Button className="rounded-full h-12 w-12 p-0 bg-primary text-primary-foreground shadow-lg" onClick={() => setOpen(true)} aria-label="Abrir chat">
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {open && (
        <Card className="w-[360px] bg-zinc-900 border-zinc-800 shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <div className="font-semibold">Asistente</div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="max-h-[320px] overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground">Hola, soy tu asistente. ¿En qué te ayudo?</div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div className={
                  m.role === "user"
                    ? "inline-block rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm"
                    : "inline-block rounded-lg bg-zinc-800 text-zinc-200 px-3 py-2 text-sm"
                }>
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex items-center gap-2 px-4 py-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
            />
            <Button onClick={sendMessage} className="bg-primary text-primary-foreground" aria-label="Enviar">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
