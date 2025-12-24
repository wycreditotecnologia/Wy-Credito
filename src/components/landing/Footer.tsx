
"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Col 1: Brand & Social */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="relative w-10 h-10">
                <Image
                  src="/assets/Logo Icono Wy.svg"
                  alt="Wy Credito Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-heading font-bold text-2xl text-wy-dark dark:text-white">Wy Crédito</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Transformamos el acceso al crédito empresarial con tecnología, rapidez y transparencia.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Empresa */}
          <div>
            <h3 className="font-heading font-bold mb-6 text-lg text-wy-dark dark:text-white">Empresa</h3>
            <ul className="space-y-4 text-sm">
              {["Sobre Nosotros", "Equipo", "Carreras", "Contacto"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Productos */}
          <div>
            <h3 className="font-heading font-bold mb-6 text-lg text-wy-dark dark:text-white">Productos</h3>
            <ul className="space-y-4 text-sm">
              {["Crédito Empresarial", "Línea de Crédito", "Factoring", "Leasing"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div>
            <h3 className="font-heading font-bold mb-6 text-lg text-wy-dark dark:text-white">Legal</h3>
            <ul className="space-y-4 text-sm">
              {["Términos y Condiciones", "Política de Privacidad", "Política de Habeas Data", "Política de Cookies"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-slate-500 dark:text-slate-500">
          <p>&copy; 2025 Wy Crédito. Derechos reservados. Diseño y Desarrollo por <span className="font-bold">Krezco.Digital</span></p>
        </div>
      </div>
    </footer>
  );
}
