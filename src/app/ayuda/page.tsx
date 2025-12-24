"use client";

import Link from "next/link";

export default function AyudaPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Ayuda</h1>
        <p className="text-muted-foreground">Encuentra respuestas y contáctanos si necesitas soporte.</p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border">
            <h2 className="font-semibold">Preguntas frecuentes</h2>
            <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
              <li>¿Cómo envío mi solicitud?</li>
              <li>¿Qué documentos necesito?</li>
              <li>¿Cómo verifico el estado de mi solicitud?</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border">
            <h2 className="font-semibold">Soporte</h2>
            <p className="text-sm mt-2">Escríbenos a soporte@wycredito.com o visita el <Link href="/" className="text-primary underline">inicio</Link>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

