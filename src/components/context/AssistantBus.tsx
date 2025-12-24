"use client";
import { createContext, useContext, useRef } from "react";

type AssistantEvent = { type: "financials" | "legal"; data: any };

type Bus = {
  notify: (event: AssistantEvent) => void;
  subscribe: (handler: (event: AssistantEvent) => void) => () => void;
};

const Ctx = createContext<Bus | null>(null);

export function AssistantBusProvider({ children }: { children: React.ReactNode }) {
  const listeners = useRef<Array<(e: AssistantEvent) => void>>([]);
  const notify = (event: AssistantEvent) => {
    for (const fn of listeners.current) fn(event);
  };
  const subscribe = (handler: (event: AssistantEvent) => void) => {
    listeners.current.push(handler);
    return () => {
      listeners.current = listeners.current.filter((h) => h !== handler);
    };
  };
  return <Ctx.Provider value={{ notify, subscribe }}>{children}</Ctx.Provider>;
}

export function useAssistantBus() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("AssistantBusProvider missing");
  return ctx;
}

