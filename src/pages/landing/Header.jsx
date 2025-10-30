// src/pages/landing/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link';
import { Button } from '@/components/ui/button';
import DualModalToggle from '@/components/DualModalToggle';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const base = isHome ? '' : '/';

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
            {/* Logo: enlace interno a la raíz con SPA y scroll suave al top */}
            <RouterLink
              to="/"
              className="flex items-center gap-2"
              onClick={(e) => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                handleLinkClick && handleLinkClick(e);
              }}
            >
              <div className={`flex items-center justify-center transition-all duration-500 ${isScrolled ? 'w-7 h-7' : 'w-10 h-10'}`}>
                <img src="/assets/Logo Icono Wy.svg" alt="Wy Crédito Logo" className="h-full w-auto object-contain" />
              </div>
              <span className={`font-bold text-black dark:text-white transition-all duration-500 ${isScrolled ? 'text-lg' : 'text-2xl'}`}>
                Wy Crédito
              </span>
            </RouterLink>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-6">
        <Link to={`${base}#inicio`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">Inicio</Link>
        <Link to={`${base}#como-funciona`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">Cómo Funciona</Link>
        <Link to={`${base}#simulador`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">Simulador</Link>
        <Link to={`${base}#beneficios`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">Beneficios</Link>
        <Link to={`${base}#testimonios`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">Testimonios</Link>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <DualModalToggle />
              <ThemeToggle />
              <Button variant="ghost" size="sm" asChild className="text-black dark:text-white">
        <Link to={`${base}#simulador`}>Simular Crédito</Link>
              </Button>
              <Button size="sm" asChild className="bg-brand-blue hover:bg-blue-600 text-white">
                <RouterLink to="/solicitud">Solicitar Crédito</RouterLink>
              </Button>
            </div>

            {/* Mobile Menu Button + Theme Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <DualModalToggle />
              <ThemeToggle />
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
        <Link to={`${base}#inicio`} className="block text-gray-700 dark:text-gray-200 py-2" onClick={handleLinkClick}>Inicio</Link>
        <Link to={`${base}#como-funciona`} className="block text-gray-700 dark:text-gray-200 py-2" onClick={handleLinkClick}>Cómo Funciona</Link>
        <Link to={`${base}#simulador`} className="block text-gray-700 dark:text-gray-200 py-2" onClick={handleLinkClick}>Simulador</Link>
        <Link to={`${base}#beneficios`} className="block text-gray-700 dark:text-gray-200 py-2" onClick={handleLinkClick}>Beneficios</Link>
        <Link to={`${base}#testimonios`} className="block text-gray-700 dark:text-gray-200 py-2" onClick={handleLinkClick}>Testimonios</Link>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-start text-black dark:text-white">
        <Link to={`${base}#simulador`} onClick={handleLinkClick}>Simular Crédito</Link>
                  </Button>
                  <Button size="sm" asChild className="w-full bg-brand-blue hover:bg-blue-600 text-white">
                    <RouterLink to="/solicitud" onClick={handleLinkClick}>Solicitar Crédito</RouterLink>
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