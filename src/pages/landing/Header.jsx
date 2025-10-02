// src/pages/landing/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DualModalToggle from '@/components/DualModalToggle';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función para cerrar el menú al hacer clic en un enlace
  const handleLinkClick = () => setMobileMenuOpen(false);

  return (
    <header 
      className={`fixed z-50 transition-all duration-500 ease-out ${
        isScrolled ? 'top-0 left-0 right-0' : 'top-4 left-4 right-4 md:left-8 md:right-8'
      }`}
    >
      <div 
        className={`transition-all duration-500 ease-out bg-white/80 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 ${
          isScrolled ? 'rounded-none border-t-0 border-l-0 border-r-0' : 'rounded-2xl shadow-xl shadow-blue-500/10'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-500 ease-out ${isScrolled ? 'h-14' : 'h-20'}`}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" onClick={handleLinkClick}>
              <div className={`flex items-center justify-center transition-all duration-500 ${isScrolled ? 'w-7 h-7' : 'w-10 h-10'}`}>
                <img src="/assets/Logo Icono Wy.svg" alt="Wy Credito Logo" className="w-full h-full" />
              </div>
              <span className={`font-bold text-black dark:text-white transition-all duration-500 ${isScrolled ? 'text-lg' : 'text-2xl'}`}>
                Wy Credito
              </span>
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#hero" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">Inicio</a>
              <a href="#how-it-works" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">Cómo Funciona</a>
              <a href="#simulator" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">Simulador</a>
              <a href="#features" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">Beneficios</a>
              <a href="#testimonials" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">Testimonios</a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <DualModalToggle />
              <Button variant="ghost" size="sm" asChild className="text-black dark:text-white">
                <a href="#simulator">Simular Crédito</a>
              </Button>
              <Button size="sm" asChild className="bg-brand-blue hover:bg-blue-600 text-white">
                <Link to="/solicitud">Solicitar Crédito</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <DualModalToggle />
              <button className="p-2 text-black dark:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* === INICIO: Mobile Menu Desplegable === */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-black/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-3">
              <a href="#hero" className="block text-gray-700 dark:text-gray-200 py-2" onClick={handleLinkClick}>Inicio</a>
              <a href="#how-it-works" className="block text-gray-700 dark:text-gray-200 py-2" onClick={handleLinkClick}>Cómo Funciona</a>
              <a href="#simulator" className="block text-gray-700 dark:text-gray-200 py-2" onClick={handleLinkClick}>Simulador</a>
              <a href="#features" className="block text-gray-700 dark:text-gray-200 py-2" onClick={handleLinkClick}>Beneficios</a>
              <a href="#testimonials" className="block text-gray-700 dark:text-gray-200 py-2" onClick={handleLinkClick}>Testimonios</a>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start text-black dark:text-white">
                    <a href="#simulator" onClick={handleLinkClick}>Simular Crédito</a>
                </Button>
                <Button size="sm" asChild className="w-full bg-brand-blue hover:bg-blue-600 text-white">
                    <Link to="/solicitud" onClick={handleLinkClick}>Solicitar Crédito</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* === FIN: Mobile Menu Desplegable === */}
      </div>
    </header>
  );
}