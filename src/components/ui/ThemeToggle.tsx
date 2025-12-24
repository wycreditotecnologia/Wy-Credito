"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita errores de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative w-10 h-10">
        <div className="w-5 h-5 bg-muted rounded" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative w-10 h-10 rounded-full transition-all duration-300 hover:bg-secondary/50"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <motion.div
          initial={false}
          animate={{ 
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0.5 : 1
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Sun className="w-5 h-5 text-yellow-500" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ 
            opacity: isDark ? 1 : 0,
            scale: isDark ? 1 : 0.5
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Moon className="w-5 h-5 text-blue-500" />
        </motion.div>
      </motion.div>
      
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
}