"use client";
import React, { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAssistantBus } from "@/components/context/AssistantBus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function SidebarChat() {
  const { user } = useAuth();
  const bus = useAssistantBus();
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: "Hola, soy tu asistente. ¿En qué te ayudo?" }]);
  const [input, setInput] = useState("");
  if (!user) return null;

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
      const reply = data?.data?.response || data?.response || "Entendido";
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
      const txt = detail != null ? `Procesé tus estados. Valor clave: ${detail}.` : `Procesé tus estados financieros.`;
      setMessages((prev) => [...prev, { role: "assistant", content: `${txt} Continuemos.` }]);
    }
    if (event.type === "legal") {
      const e = event.data?.extraction || {};
      const nit = e?.nit;
      const rs = e?.razon_social;
      const parts = [nit ? `NIT ${nit}` : null, rs ? `Razón Social ${rs}` : null].filter(Boolean).join(", ");
      const txt = parts ? `Certificado listo: ${parts}.` : `Procesé tu certificado de existencia.`;
      setMessages((prev) => [...prev, { role: "assistant", content: `${txt} Sigamos.` }]);
    }
  });

  return (
    <aside className="w-full max-w-[360px] rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg p-4">
      <div className="text-sm font-semibold mb-2">Asistente</div>
      <div className="max-h-[480px] overflow-y-auto space-y-3 mb-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={m.role === "user" ? "inline-block rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm" : "inline-block rounded-lg bg-zinc-800 text-zinc-200 px-3 py-2 text-sm"}>{m.content}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu mensaje..." />
        <Button onClick={sendMessage} className="bg-primary text-primary-foreground" aria-label="Enviar">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}

