## Objetivo
- Replicar el diseño de referencia: superficie limpia sin tarjetas, contenido centrado (max‑width 720px), barra de progreso tipo “rail”, CTA moderno, sliders/inputs finos y sidebar izquierdo con chat.

## Layout Global
- Crear `TypeformShell` como contenedor de todo el flujo (excepto landing):
  - Header: `ProgressRail` con “Paso X/Y” y puntos conectados.
  - Sidebar izquierdo: `SidebarNav` (iconos) + `SidebarChatDock` (chat acoplado).
  - Content: bloque centrado (H1/H2 grandes, métricas, controles, CTA).
  - Footer slim: acciones cuando aplique.
- Integrar `ThemeToggle` persistente en header.

## Componentes
1) `ProgressRail.tsx`
- Línea continua con marcadores circulares y etiqueta del paso actual.
2) `SidebarNav.tsx`
- Lista vertical de iconos (home, pasos, docs, soporte) con estados hover.
3) `SidebarChatDock.tsx`
- Panel de chat con scroll, quick actions y entrada; escucha `AssistantBus`.
4) `TypeformShell.tsx`
- Orquesta grid: `lg:grid-cols-[72px_360px_1fr]` (nav, chat, contenido).
5) `CTAButton.tsx`
- Botón “Continuar” con gradiente suave y sombra.
6) `SliderRow.tsx`
- Fila con etiqueta, slider fino y porcentaje a la derecha.

## Estilos y Tokens
- `globals.css`:
  - `--primary: #3A85F5`; `--radius: 16px`; sombras suaves.
  - Tema light: fondo gris muy claro; dark: zinc.
- Tipografía: Montserrat en H1/H2 (36–48px), Lato en cuerpo.

## Re‑maquetado de Pasos
- Paso 1–7:
  - Sin “card”; H1/H2; controles XL; validación inline; CTA primario.
  - Paso 3: sliders para proporciones + valor principal (ej. “$24,000”) centrado.
  - Animaciones fade/slide 300ms entre pasos; bloqueo doble submit.

## Integración y Estado
- `ApplicationForm` usa `TypeformShell`, `ProgressRail` y nuevos componentes.
- Persistencia en `application_steps` intacta; optimismo + rollback.
- Gate de sesión antes de render para eliminar flicker.

## Accesibilidad
- Roles/aria en `ProgressRail`; focus management al avanzar; contraste AA.

## Entregables por Fases
- Fase 1: Shell + Header + ThemeToggle + SidebarNav.
- Fase 2: SidebarChatDock integrado a `AssistantBus`.
- Fase 3: Re‑maquetado Steps 1–3 (incluye sliders y CTA) y luego 4–7.

## Criterios de Aceptación
- Apariencia coincide con el ejemplo: superficie sin tarjetas, progreso tipo rail, CTA moderno, chat lateral.
- Avance estable (1→2…) con datos guardados.
- Tema light/dark funcional en todo el producto.

¿Confirmas que ejecute este refactor completo ahora (excepto la landing)?