## Problemas y Objetivos
- Problemas actuales: UI poco profesional, ausencia de toggle light/dark, avance de pasos poco claro/flicker, chat flotante sin integración visual, bordes/radii y color no coherentes.
- Objetivo: UI tipo Typeform, moderna y elegante, con: contador de pasos visible, dashboard central de preguntas, sidebar (izquierdo) para chat, toggle light/dark, radii y colores consistentes (#3A85F5 acento), sin flicker.

## Arquitectura de Interfaz
- Layout Solicitud: Header (progreso + toggle), Sidebar Izq (Chat), Content (StepCard), Footer (acciones).
- Contenedores:
  - StepShell: orquesta pasos y estado, persistencia y navegación.
  - StepCard: tarjeta central con preguntas (radii grandes, sombras suaves).
  - SidebarChat: chat embebido, anclado a la izquierda con panel history.
  - HeaderNav: muestra “Paso X de 7” y breadcrumbs (Typeform-like).
  - ThemeToggle: selector light/dark persistente.

## Implementación Técnica
- Diseño base (Tailwind/shadcn):
  - Tokens: usar `--radius`, `--primary`, `--background`, ajustar radii (12–16px), sombras (`shadow-lg`/`shadow-sm`), espaciamiento (`px-6 py-8`).
  - Paleta: acento `#3A85F5` (ya definida), neutrales gris-zinc con contraste AA.
- Componentes nuevos/actualizados:
  1) Crear `src/components/layout/StepShell.tsx`: maneja `currentStep`, `onComplete`, persistencia (`/next_api/solicitud/save-step`) y transiciones (framer-motion con page-level). Evita flicker sincronizando session antes de render.
  2) Crear `src/components/layout/StepCard.tsx`: contenedor con radii, fondo, sombra; soporta títulos/subtítulos; slots para contenido del paso.
  3) Crear `src/components/layout/HeaderNav.tsx`: muestra progreso tipo barra + “Paso X de 7”; breadcrumbs minimal.
  4) Crear `src/components/ui/ThemeToggle.tsx` (si no está integrado): persistir preferencia en `localStorage`; respetar `prefers-color-scheme`.
  5) Reubicar `ChatWidget` a `SidebarChat.tsx`: ancho fijo 320–360px, scroll, botón “Regenerar respuesta” y quick actions; usa `AssistantBus` existente.
  6) Reescribir `ApplicationForm.tsx` para usar `StepShell` + `StepCard`; mover la lógica de avance/retroceso dentro de `StepShell` con guardas de validación.
  7) Ajustar Steps (1–7): aplicar patrón de formulario con inputs más grandes, validaciones inline y CTA primario; optimismo y loading.
- Estabilización del avance de pasos:
  - Session gate antes de `/solicitud` (useAuth); render condicional tras `isLoading=false`.
  - Persistencia optimista y rollback si falla; `await` en `save-step` y transición controlada.
  - Bloqueo de doble-submisión; indicadores `isSaving` y `disabled` en botones.

## Animación y Experiencia
- Transiciones suaves entre pasos (slide/fade 300–400ms), sin hmr flicker.
- Microinteracciones: hover, focus-visible, feedback con checkmarks.

## Accesibilidad
- Roles/aria en barra de progreso; focus management al cambiar de paso; contraste AA.

## Entrega y Validación
- Fase 1 (Layout + Shell + Header + ThemeToggle): 1–2 días.
- Fase 2 (SidebarChat + integración bus + estilo): 1 día.
- Fase 3 (StepCard y Steps 1–7 remaquetado + validación + persistencia optimista): 2–3 días.
- QA/UAT: pruebas en `localhost:4000` y checklist: 
  - Toggle light/dark persistente.
  - Avance 1→2 sin flicker y persistencia correcta.
  - Chat visible en sidebar, mensajes proactivos tras extracción.
  - Radii y colores uniformes.

## Criterios de Aceptación
- La UI refleja estilo tipo Typeform: barra de progreso clara, tarjeta central, chat lateral, toggle light/dark.
- Avance entre pasos fluido sin titilar; datos guardados en `application_steps`.
- Chat responde a eventos y se integra visualmente.

¿Confirmas para ejecutar el rediseño y estabilización según esta propuesta? 