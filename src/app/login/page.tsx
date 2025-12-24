"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { useAuth } from "@/components/auth/AuthProvider";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/solicitud";
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && redirectTo) {
      router.replace(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans selection:bg-brand-primary/20 flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center relative pt-24 pb-24 px-4 md:px-8">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 bg-grid-lines opacity-30 pointer-events-none" />

        {/* Orbs - Adjusted positioning for new layout */}
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-3xl animate-pulse-slow mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

        <div className="container mx-auto max-w-[1400px] w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-12 lg:gap-20 items-center">

            {/* Left Column: Form */}
            <div className="w-full max-w-md mx-auto lg:ml-auto lg:mr-0 order-2 lg:order-1">
              <MagicLinkForm redirectTo={redirectTo} />
            </div>

            {/* Right Column: Text Content */}
            <div className="order-1 lg:order-2 text-center lg:text-left lg:pl-10">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading leading-tight text-slate-900 dark:text-white mb-6 tracking-tight">
                Accede o crea tu cuenta, <br className="hidden xl:block" />
                <span className="text-brand-primary">de forma simple y segura.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-body mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Inicia sesión con tu correo y contraseña o regístrate para empezar tu solicitud.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  className="h-12 px-8 text-lg font-bold bg-brand-secondary hover:bg-brand-hover text-white rounded-lg shadow-lg shadow-blue-500/20"
                  onClick={() => router.push('/solicitud')}
                >
                  Ir a Solicitud
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-8 text-lg font-medium border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-gray-800"
                  onClick={() => router.push('/#beneficios')}
                >
                  Conocer Beneficios
                </Button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
