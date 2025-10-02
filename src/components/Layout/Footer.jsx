import React from 'react';
import { Link } from 'react-router-dom';
// Usaremos los íconos que instalamos anteriormente
import { Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-white/10 py-8">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Wy Credito</h3>
          <p className="text-gray-400">Financiación inteligente para el futuro de tu empresa. Bogotá, Colombia.</p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Navegación</h3>
          <ul className="space-y-2">
            <li><Link to="/#beneficios" className="text-gray-400 hover:text-white">Beneficios</Link></li>
            <li><Link to="/solicitud" className="text-gray-400 hover:text-white">Solicitar Crédito</Link></li>
            <li><Link to="/terminos-y-condiciones" className="text-gray-400 hover:text-white">Términos y Condiciones</Link></li>
            <li><Link to="/politica-de-privacidad" className="text-gray-400 hover:text-white">Política de Privacidad</Link></li>
            <li><Link to="/politica-de-cookies" className="text-gray-400 hover:text-white">Política de Cookies</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Síguenos</h3>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white"><Twitter size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-white"><Facebook size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-white"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 mt-8 text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} Wy Credito. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;