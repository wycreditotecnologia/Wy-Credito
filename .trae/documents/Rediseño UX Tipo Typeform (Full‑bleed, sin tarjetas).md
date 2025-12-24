## Objetivo
- Transformar el flujo de solicitud a un diseño moderno tipo Typeform: superficie limpia sin tarjetas, contenido centrado, paso a paso claro, sidebar izquierdo con chat, y toggle light/dark.

## Principios de Diseño
- Full‑bleed: eliminar cajas y bordes innecesarios; usar una sola superficie con jerarquía por tipografía/espacios.
- Ritmo visual: grid simple con ancho máximo del contenido (640–720px), paddings amplios (px-8 py-10), y radii globales solo en controles.
- Color y contraste: light (gris muy claro) y dark (zinc) con acento #3A85F5; estados hover/focus con sombras suaves.

## Arquitectura de Interfaz
- **Header**: barra de progreso tipo “rail” + texto “Paso X de Y” + `ThemeToggle` visible.
- **Sidebar Izquierdo (Chat)**: panel fijo (320–360px) con historia y entrada; integrado a `AssistantBus`.
- **Content Center**: bloque centrado con título grande, subtítulo, controles (sliders/inputs) y CTA primario.
- **Footer Slim**: sólo acciones cuando sea necesario.

## Componentes Nuevos/Actualizados
1) `src/components/layout/ProgressRail.tsx`
- Barra superior continua con indicador y etiquetas de pasos (opcional breadcrumbs).
2) `src/components/layout/TypeformShell.tsx`
- Orquesta el layout: header + grid `lg:grid-cols-[360px_1fr]` con sidebar chat + contenido centrado (max-w-720).
- Gestiona `currentStep`, avance y persistencia (sin flicker; gate de sesión antes de render).
3) `src/components/layout/SidebarChatDock.tsx`
- Chat en panel, con quick replies y microinteracciones; escucha `AssistantBus`.
4) `src/components/ui/ThemeToggle.tsx`
- Toggle visible y persistente; respeta `prefers-color-scheme`.
5) Reestilizar Steps (1–7)
- Remover “card” contenedoras; títulos H1/H2 grandes; inputs XL; validación inline; CTA primario; loaders.
- Step 3: sliders/inputs con estilo fino; mensajes de estado debajo.

## Cambios de Estilo Global
- `globals.css`: tokens
  - `--radius: 1rem` (aplicado sólo a inputs/botones)
  - paleta light: fondo gris muy claro; dark: zinc; acento `#3A85F5`.
- Tipografía: Montserrat para headings (escala 36–48px) y Lato para cuerpo.

## Integración y Flujo
- Login: si hay sesión, `login/page.tsx` redirige a `/solicitud` (ya implementado; se mantiene).
- Solicitud: `app/solicitud/page.tsx` renderiza `TypeformShell` con `currentStep`, evita flicker (render tras `isLoading=false`).
- Persistencia: `save-step` con optimismo y rollback si falla; bloqueo de doble submit.

## Animación/Microinteracciones
- Transición pasos: fade/slide 300ms; focus management al cambiar; hover en CTA; feedback “guardado”.

## Entregables
- Shell y Header con progreso.
- SidebarChatDock integrado al bus.
- Steps reestilizados (1–3 primero; luego 4–7).
- Toggle light/dark y tokens globales.

## Criterios de Aceptación
- Apariencia y composición alineadas con el ejemplo: sin tarjetas, contenido centrado, progreso claro, chat lateral.
- Avance 1→2 estable, sin titilar; persistencia correcta en `application_steps`.
- Tema seleccionable (light/dark) coherente en todo el flujo.

## UAT rápido
- Login → Solicitud (sesión activa).
- Paso 1 completar → avanzar a 2 sin flicker.
- Paso 2/3 subida PDFs → extracción y chat proactivo.

¿Confirmas que proceda con este rediseño y entrega por fases (1: shell/header, 2: sidebar chat, 3: steps)?