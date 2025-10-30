# Secuencia: /api/orchestrator

Descripción del flujo principal de orquestación de la solicitud de crédito (crear sesión, guardar pasos, completar envío).

```mermaid
sequenceDiagram
  autonumber
  participant U as Usuario
  participant F as Frontend (React/Vite)
  participant B as Backend (Vercel Function)
  participant S as Supabase

  U->>F: Iniciar proceso
  F->>B: POST /api/orchestrator { action: "start_session" }
  B->>S: Insert nueva sesión (tabla solicitudes)
  S-->>B: { id: sessionId }
  B-->>F: { ok: true, sessionId }

  U->>F: Completar formulario (paso)
  F->>B: POST /api/orchestrator { action: "save_step", sessionId, payload, nextStep }
  B->>S: Update solicitud con payload.solicitudUpdates
  S-->>B: { ok }
  B-->>F: { ok: true, nextStep }

  U->>F: Enviar solicitud
  F->>B: POST /api/orchestrator { action: "complete_submission", sessionId }
  B->>S: Update estado → "pendiente"
  S-->>B: { ok }
  B-->>F: { ok: true, status: "pendiente" }

  alt Errores (validación/RLS/DB)
    B-->>F: { ok: false, error }
    F-->>U: Notificar y permitir reintento
  end
```

Acciones soportadas:
- `start_session`: crea una nueva fila en `solicitudes` y retorna `sessionId`.
- `save_step`: actualiza campos de la solicitud; puede definir `nextStep`.
- `complete_submission`: marca la solicitud como `pendiente`.

Notas:
- Verificar RLS y políticas de Supabase; las funciones requieren permisos adecuados.
- Log de errores/latencias recomendado para diagnóstico y soporte.