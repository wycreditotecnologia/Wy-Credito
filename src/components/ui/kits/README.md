# Kits UI: HeaderKit y HeroKit

Componentes reutilizables y modulares para mantener consistencia visual y funcional.

## Uso básico

Importa y monta los kits en cualquier página o sección:

```jsx
import HeaderKit from '@/components/ui/kits/HeaderKit.jsx';
import HeroKit from '@/components/ui/kits/HeroKit.jsx';

export default function MiPagina() {
  return (
    <>
      <HeaderKit />
      <HeroKit />
      {/* contenido de la página */}
    </>
  );
}
```

También puedes solicitar su implementación diciendo: "Monta este kit en [nombre de la página/sección]".

## HeaderKit: Props

- `logoSrc` (string): ruta del logo. Por defecto `/assets/Logo Icono Wy.svg`.
- `brandName` (string): nombre de la marca. Por defecto `Wy Credito`.
- `navItems` (array): `{ label, href }[]` para enlaces del menú.
- `showDualModal` (boolean): muestra el toggle de modales. Por defecto `true`.
- `simulateHref` (string): ancla para "Simular Crédito". Por defecto `#simulator`.
- `solicitarTo` (string): ruta del CTA principal. Por defecto `/solicitud`.
- `sticky` (boolean): activa comportamiento pegajoso. Por defecto `true`.
- `className` (string): clases adicionales.

Ejemplo personalizado:

```jsx
<HeaderKit
  brandName="Mi Marca"
  logoSrc="/assets/mi-logo.svg"
  navItems=[
    { label: 'Inicio', href: '#hero' },
    { label: 'Servicios', href: '#services' },
  ]
  solicitarTo="/contacto"
/>
```

## HeroKit: Props

- `id` (string): id de sección. Por defecto `hero`.
- `showAIChip` (boolean): muestra etiqueta de IA. Por defecto `true`.
- `headline` (string): texto principal.
- `highlight` (string): texto con gradiente.
- `subtitle` (string): descripción.
- `gradientFrom`, `gradientTo` (string): clases Tailwind para el gradiente.
- `primaryCta` ({ label, to, icon }): CTA principal (usa `react-router Link`).
- `secondaryCta` ({ label, href }): CTA secundario (ancla o URL).
- `showGridBackground` (boolean): muestra cuadrícula de fondo. Por defecto `true`.
- `className` (string): clases adicionales.

Ejemplo personalizado:

```jsx
<HeroKit
  headline="Impulso financiero para tu negocio,"
  highlight="sin complicaciones."
  subtitle="Proceso 100% digital y transparente."
  primaryCta={{ label: 'Solicitar ahora', to: '/solicitud', icon: true }}
  secondaryCta={{ label: 'Ver beneficios', href: '#features' }}
  gradientFrom="from-blue-500"
  gradientTo="to-cyan-500"
/>
```

## Buenas prácticas

- Usa los valores por defecto para mantener consistencia visual.
- Personaliza `navItems`, CTAs y textos según la sección.
- Evita modificar estilos base salvo que definas variantes en la capa de diseño.
- Documenta cada uso en la página donde lo montes para rastreabilidad.