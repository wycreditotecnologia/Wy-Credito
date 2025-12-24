"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useAssistantBus } from "@/components/context/AssistantBus";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SidebarChatDockProps {
  onClose?: () => void;
}

export function SidebarChatDock({ onClose }: SidebarChatDockProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "¡Hola! Soy tu asistente de crédito. ¿En qué puedo ayudarte con tu solicitud?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const bus = useAssistantBus();

  useEffect(() => {
    const handleAssistantMessage = (event: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: event.data || "Mensaje del asistente",
          timestamp: new Date(),
        },
      ]);
    };

    const unsubscribe = bus.subscribe(handleAssistantMessage);
    return unsubscribe;
  }, [bus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simular respuesta del asistente
    setTimeout(() => {
      const responses = [
        "Entiendo tu consulta. Te ayudo con eso inmediatamente.",
        "Excelente pregunta. Déjame verificar la información.",
        "Gracias por tu paciencia. Estoy procesando tu solicitud.",
        "Perfecto, todo se ve bien. ¿Necesitas ayuda con algo más?",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: randomResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Se removieron acciones rápidas para mantener el chat limpio

  return (
    <div className="h-full flex flex-col bg-background/95">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Wally Tu Asistente Crediticio</h3>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} title="Ocultar chat">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground ml-8"
                    : "bg-secondary text-secondary-foreground mr-8"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-2 mr-8">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>


      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <Input
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-background"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
