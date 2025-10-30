import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link';
import DualModalToggle from '../DualModalToggle';
import { ThemeToggle } from '@/components/ThemeToggle';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const base = isHome ? '' : '/';
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gray-900/50 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <RouterLink
          to="/"
          className="flex items-center gap-2"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          {/* Aquí irá nuestro logo. Por ahora, un texto. */}
          <span className="text-xl font-bold text-white">Wy Crédito</span>
        </RouterLink>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link to={`${base}#simulador`} className="text-gray-300 hover:text-white transition-colors">Simulador</Link>
          <Link to={`${base}#beneficios`} className="text-gray-300 hover:text-white transition-colors">Beneficios</Link>
          <Link to={`${base}#como-funciona`} className="text-gray-300 hover:text-white transition-colors">Cómo Funciona</Link>
        </nav>
        <div className="flex items-center gap-4">
          <RouterLink to="#" className="text-gray-300 hover:text-white transition-colors">Iniciar Sesión</RouterLink>
          <RouterLink
            to="/solicitud"
            className="inline-flex h-9 items-center justify-center rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-cyan-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-700"
          >
            Solicitar Crédito
          </RouterLink>
          <ThemeToggle />
          <DualModalToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;