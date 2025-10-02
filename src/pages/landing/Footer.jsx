// src/pages/landing/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
          
          {/* Columna 1: Marca */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 justify-center md:justify-start">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/assets/Logo Icono Wy.svg" alt="Wy Credito Logo" className="w-full h-full" />
              </div>
              <span className="text-xl font-bold text-black dark:text-white">
                Wy Credito
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Financiación inteligente para el futuro de tu empresa.
            </p>
          </div>

          {/* Columna 2: Navegación */}
          <div>
            <h4 className="font-semibold mb-4 text-black dark:text-white">Navegación</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#hero" className="hover:text-black dark:hover:text-white transition-colors">Inicio</a></li>
              <li><a href="#how-it-works" className="hover:text-black dark:hover:text-white transition-colors">Cómo Funciona</a></li>
              <li><a href="#simulator" className="hover:text-black dark:hover:text-white transition-colors">Simulador</a></li>
              <li><a href="#features" className="hover:text-black dark:hover:text-white transition-colors">Beneficios</a></li>
              <li><a href="#testimonials" className="hover:text-black dark:hover:text-white transition-colors">Testimonios</a></li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-black dark:text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/terminos-y-condiciones" className="hover:text-black dark:hover:text-white transition-colors">Términos y Condiciones</Link></li>
              <li><Link to="/politica-de-privacidad" className="hover:text-black dark:hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link to="/politica-de-cookies" className="hover:text-black dark:hover:text-white transition-colors">Política de Cookies</Link></li>
            </ul>
          </div>

          {/* Columna 4: Contacto y Redes */}
          <div>
            <h4 className="font-semibold mb-4 text-black dark:text-white">Contacto</h4>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>info@wycredito.com</p>
              <p>Bogotá, Colombia</p>
            </div>
            <div className="flex gap-3 mt-4 justify-center md:justify-start">
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </a>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-black dark:text-white">
          <p className="text-black dark:text-white">
            © {new Date().getFullYear()} Wy Credito. Derechos reservados. Diseño y Desarrollo por{" "}
            <a
              href="https://krezco.digital"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-black dark:text-white hover:text-black dark:hover:text-white transition-colors"
            >
              Krezco.Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}