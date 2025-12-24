"use client";

import { useState } from "react";
import { Home, FileText, Users, HelpCircle, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { icon: Home, label: "Inicio", href: "/" },
  { icon: FileText, label: "Solicitud", href: "/solicitud" },
  { icon: Users, label: "Admin", href: "/admin" },
  { icon: HelpCircle, label: "Ayuda", href: "/ayuda" },
  { icon: Settings, label: "Configuración", href: "/configuracion" },
];

export function SidebarNav() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  return (
    <nav className="h-full py-6 px-3 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        const isHovered = hoveredItem === item.href;

        return (
          <motion.div
            key={item.href}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={item.href}
              className={`
                relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200
                ${isActive
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }
                ${isHovered ? "shadow-md" : ""}
              `}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              title={item.label}
            >
              <Icon className="w-5 h-5" />

              {/* Tooltip */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-full ml-3 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-md whitespace-nowrap z-50 pointer-events-none"
                >
                  {item.label}
                  <div className="absolute top-1/2 -left-1 w-2 h-2 bg-popover transform -translate-y-1/2 rotate-45" />
                </motion.div>
              )}
            </Link>
          </motion.div>
        );
      })}

      {/* Salir */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <button
          type="button"
          className="relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground"
          title="Salir"
          onClick={async () => {
            if (supabase) {
              await supabase.auth.signOut();
            }
            router.push("/login");
          }}
          onMouseEnter={() => setHoveredItem("/logout")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <LogOut className="w-5 h-5" />
          {hoveredItem === "/logout" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute left-full ml-3 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-md whitespace-nowrap z-50 pointer-events-none"
            >
              Salir
              <div className="absolute top-1/2 -left-1 w-2 h-2 bg-popover transform -translate-y-1/2 rotate-45" />
            </motion.div>
          )}
        </button>
      </motion.div>
    </nav>
  );
}
