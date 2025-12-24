
import type { Metadata } from "next";
import { Montserrat, Lato } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { AssistantBusProvider } from "@/components/context/AssistantBus";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wy Crédito - Financiación Ágil para Empresas",
  description: "Obtén financiación rápida y flexible para tu empresa. Proceso 100% digital.",
  icons: {
    icon: "/assets/Logo Icono Wy.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <>
      {children}
      <Toaster />
      {/* GlobalClientEffects eliminado durante la esterilización de Zoer */}
    </>
  );

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${montserrat.variable} ${lato.variable} antialiased font-lato`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AssistantBusProvider>
              {content}
              <ScrollToTop />
            </AssistantBusProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
