import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link';
// Usaremos los íconos que instalamos anteriormente
import { Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const base = isHome ? '' : '/';
  return (
    <footer className="bg-gray-950 border-t border-white/10 py-8">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Wy Crédito</h3>
          <p className="text-gray-400">Financiación inteligente para el futuro de tu empresa. Bogotá, Colombia.</p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Navegación</h3>
          <ul className="space-y-2">
            <li><Link to={`${base}#beneficios`} className="text-gray-400 hover:text-white">Beneficios</Link></li>
            <li><RouterLink to="/solicitud" className="text-gray-400 hover:text-white">Solicitar Crédito</RouterLink></li>
            <li><RouterLink to="/terminos-y-condiciones" className="text-gray-400 hover:text-white">Términos y Condiciones</RouterLink></li>
            <li><RouterLink to="/politica-de-privacidad" className="text-gray-400 hover:text-white">Política de Privacidad</RouterLink></li>
            <li><RouterLink to="/politica-de-cookies" className="text-gray-400 hover:text-white">Política de Cookies</RouterLink></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Síguenos</h3>
  <div className="flex gap-4">
            <RouterLink to="#" className="text-gray-400 hover:text-white"><Twitter size={20} /></RouterLink>
            <RouterLink to="#" className="text-gray-400 hover:text-white"><Facebook size={20} /></RouterLink>
            <RouterLink to="#" className="text-gray-400 hover:text-white"><Linkedin size={20} /></RouterLink>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 mt-8 text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} Wy Crédito. Derechos reservados. Diseño y Desarrollo por{" "}
        <a
          href="https://krezco.digital"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gray-400 hover:text-white"
        >
          Krezco.Digital
        </a>
      </div>
    </footer>
  );
};

export default Footer;