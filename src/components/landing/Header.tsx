
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggleSwitch } from "@/components/ThemeToggleSwitch";
import { Menu, X, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ease-out border
        ${isScrolled
          ? "top-0 left-0 right-0 h-14 rounded-none border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md"
          : "top-4 left-4 right-4 md:left-8 md:right-8 h-20 rounded-2xl shadow-xl shadow-blue-500/10 border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md"
        }
      `}
    >
      <div className="h-full container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* LOGO AREA */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className={`relative transition-all duration-500 ${isScrolled ? 'w-7 h-7' : 'w-10 h-10'}`}>
            <Image
              src="/assets/Logo Icono Wy.svg"
              alt="Wy Credito Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className={`font-heading font-bold tracking-tight transition-colors text-wy-dark dark:text-white
             ${isScrolled ? 'text-lg' : 'text-xl'}
          `}>
            Wy Crédito
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center space-x-6">
          {[
            { label: "Inicio", id: "inicio" },
            { label: "Simulador", id: "simulador" },
            { label: "Beneficios", id: "beneficios" },
            { label: "Cómo Funciona", id: "como-funciona" },
            { label: "Testimonios", id: "testimonios" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.id)}
              className="text-sm font-body font-medium text-slate-700 dark:text-slate-200 hover:text-brand-primary transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* ACTIONS AREA */}
        <div className="hidden md:flex items-center space-x-3">
          <ThemeToggleSwitch />
          {user ? (
            <div className="flex items-center gap-3">
              {user.isAdmin && (
                <Button variant="ghost" size="sm" className="font-body text-slate-600 dark:text-slate-300 hover:text-brand-primary" asChild>
                  <Link href="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button className="font-body rounded-full px-6 bg-brand-primary hover:bg-brand-hover text-white transition-all shadow-lg shadow-blue-500/20" asChild>
                <Link href="/solicitud">
                  Mi Solicitud
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
              >
                Salir
              </Button>
            </div>
          ) : (
            <Button className="font-body rounded-full px-6 bg-brand-primary hover:bg-brand-hover text-white transition-all shadow-lg shadow-blue-500/20" asChild>
              <Link href="/login">
                Iniciar Solicitud
              </Link>
            </Button>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggleSwitch />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-700 dark:text-white"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 mx-4 md:hidden card-glass dark:card-glass-dark rounded-2xl animate-in slide-in-from-top-5 z-50">
          <nav className="flex flex-col space-y-4">
            {[
              { label: "Inicio", id: "inicio" },
              { label: "Simulador", id: "simulador" },
              { label: "Beneficios", id: "beneficios" },
              { label: "Cómo Funciona", id: "como-funciona" },
              { label: "Testimonios", id: "testimonios" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-body font-medium text-slate-600 dark:text-slate-300 hover:text-brand-primary transition-colors text-left"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-3">
              {user ? (
                <Button className="w-full rounded-full bg-brand-primary hover:bg-brand-hover text-white" asChild>
                  <Link href="/solicitud">Mi Solicitud</Link>
                </Button>
              ) : (
                <Button className="w-full rounded-full bg-brand-primary hover:bg-brand-hover text-white" asChild>
                  <Link href="/login">
                    Iniciar Solicitud
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
