/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        'brand-primary': '#3A85F5',     // Antes 'brand-blue', ahora es el azul principal
        'brand-secondary': '#31C4E2',   // Nuevo cyan brillante
        'brand-blue': '#3B82F6',        // Color de marca azul (mantenido para compatibilidad)
        // Colores Primarios de Wy Crédito
        'wy-primary': '#3097CD',        // Strong Blue - Color principal
        'wy-secondary': '#31C4E2',      // Bright Cyan - Acentos secundarios
        
        // Colores Secundarios
        'wy-dark': '#115466',           // Very Dark Blue - Fondos importantes
        'wy-moderate': '#318590',       // Dark Moderate Cyan - Texto secundario
        'wy-black': '#000000',          // Negro - Texto principal
        'wy-light': '#F5F7FA',          // Gris claro - Fondos principales
        'wy-white': '#FFFFFF',          // Blanco - Fondos y texto invertido
        
        // Aliases para compatibilidad
        primary: '#3097CD',
        secondary: '#31C4E2',
        accent: '#318590',
        dark: '#115466',
        light: '#F5F7FA',

        // shadcn/ui colors with Slate base
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // Tipografía corporativa de Wy Crédito
        'heading': ['Segoe UI', 'system-ui', 'sans-serif'],     // Para encabezados
        'body': ['Century Gothic Pro', 'Century Gothic', 'system-ui', 'sans-serif'], // Para párrafos
        'sans': ['Century Gothic Pro', 'Century Gothic', 'system-ui', 'sans-serif']  // Default
      },
      fontSize: {
        // Jerarquía tipográfica según Brand Book
        'h1': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['36px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'label': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'button': ['16px', { lineHeight: '1.4', fontWeight: '400' }]
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        'shimmer-slide': "shimmer-slide 4s linear infinite",
        'spin-around': "spin-around 1s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        shimmer: {
          from: {
            backgroundPosition: "0 0",
          },
          to: {
            backgroundPosition: "-200% 0",
          },
        },
        "shimmer-slide": {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        "spin-around": {
          '0%': { transform: 'translateZ(0) rotate(0)' },
          '100%': { transform: 'translateZ(0) rotate(360deg)' },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}