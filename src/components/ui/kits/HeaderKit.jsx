// src/components/ui/kits/HeaderKit.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link';
import { Button } from '@/components/ui/button';
import DualModalToggle from '@/components/DualModalToggle';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

/**
 * HeaderKit
 * Header reutilizable y pegajoso (sticky) con animaciones.
 * Props principales para personalización visual y funcional.
 */
export default function HeaderKit({
  logoSrc = '/assets/Logo Icono Wy.svg',
  brandName = 'Wy Credito',
  navItems = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Cómo Funciona', href: '#como-funciona' },
    { label: 'Simulador', href: '#simulador' },
    { label: 'Beneficios', href: '#beneficios' },
    { label: 'Testimonios', href: '#testimonios' },
  ],
  showDualModal = true,
  simulateHref = '#simulador',
  solicitarTo = '/solicitud',
  sticky = true,
  showActions = true,
  className = '',
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const base = isHome ? '' : '/';

  const resolveHref = (href) => {
    if (!href) return undefined;
    return href.startsWith('#') ? `${base}${href}` : href;
  };

  useEffect(() => {
    if (!sticky) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  const handleLinkClick = () => setMobileMenuOpen(false);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ease-out ${
        isScrolled ? 'top-0 left-0 right-0' : 'top-4 left-4 right-4 md:left-8 md:right-8'
      } ${className}`}
    >
      <div
        className={`transition-all duration-500 ease-out bg-white/80 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 ${
          isScrolled ? 'rounded-none border-t-0 border-l-0 border-r-0' : 'rounded-2xl shadow-xl shadow-blue-500/10'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-500 ease-out ${isScrolled ? 'h-14' : 'h-20'}`}>
            {/* Logo: navegación SPA a raíz y scroll suave al inicio */}
            <RouterLink
              to="/"
              className="flex items-center gap-2"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                handleLinkClick && handleLinkClick();
              }}
            >
              <div className={`flex items-center justify-center transition-all duration-500 ${isScrolled ? 'w-7 h-7' : 'w-10 h-10'}`}>
                <img src={logoSrc} alt={`${brandName} Logo`} className="w-full h-full" />
              </div>
              <span className={`font-bold text-black dark:text-white transition-all duration-500 ${isScrolled ? 'text-lg' : 'text-2xl'}`}>
                {brandName}
              </span>
            </RouterLink>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={resolveHref(item.href)}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Toggle de tema siempre visible (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
            </div>

            {showActions && (
              <div className="hidden md:flex items-center gap-3">
                {showDualModal && <DualModalToggle />}
                <Button variant="ghost" size="sm" asChild className="text-black dark:text-white">
                  <Link to={resolveHref(simulateHref)}>Simular Crédito</Link>
                </Button>
                <Button size="sm" asChild className="bg-brand-blue hover:bg-blue-600 text-white">
                  <RouterLink to={solicitarTo}>Solicitar Crédito</RouterLink>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button + Theme Toggle */}
            <div className="flex md:hidden items-center gap-2">
              {showDualModal && <DualModalToggle />}
              <ThemeToggle />
              <button className="p-2 text-black dark:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-black/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={resolveHref(item.href)}
                  className="block text-gray-700 dark:text-gray-200 py-2"
                  onClick={handleLinkClick}
                >
                  {item.label}
                </Link>
              ))}
              {showActions && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-start text-black dark:text-white">
                    <Link to={resolveHref(simulateHref)} onClick={handleLinkClick}>Simular Crédito</Link>
                  </Button>
                  <Button size="sm" asChild className="w-full bg-brand-blue hover:bg-blue-600 text-white">
                    <RouterLink to={solicitarTo} onClick={handleLinkClick}>Solicitar Crédito</RouterLink>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}