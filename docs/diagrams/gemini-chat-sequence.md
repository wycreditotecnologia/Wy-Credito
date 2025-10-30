# Secuencia: /api/gemini-chat

Descripción del flujo de conversación segura con Gemini, manteniendo el API key en backend.

```mermaid
sequenceDiagram
  autonumber
  participant U as Usuario
  participant F as Frontend (React/Vite)
  participant B as Backend (Vercel Function)
  participant G as Google Gemini API

  U->>F: Ingresar prompt
  F->>B: POST /api/gemini-chat { prompt, model? }
  Note right of B: Validación de env: GEMINI_API_KEY, GEMINI_MODEL
  B->>G: generateResponse(prompt, model)
  G-->>B: Respuesta generada
  B-->>F: { ok: true, text, usage }
  F-->>U: Mostrar respuesta

  alt Error de configuración/modelo
    B-->>F: { ok: false, error }
    F-->>U: Notificar error y sugerir reintento
  end
```

Entradas:
- `prompt` (string, requerido)
- `model` (opcional, por defecto `gemini-1.5-flash-latest`)

Salidas:
- `{ ok: true, text, usage }` o `{ ok: false, error }`

Notas:
- La API key (`GEMINI_API_KEY`) nunca se expone al frontend.
- Validar habilitación de Generative Language API y restricciones del key.