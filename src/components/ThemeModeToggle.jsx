import React from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/ThemeProvider";

const ThemeModeToggle = ({ className = "" }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const activateLight = () => {
    if (isDarkMode) toggleTheme();
  };
  const activateDark = () => {
    if (!isDarkMode) toggleTheme();
  };

  return (
    <div
      role="tablist"
      aria-label="Alternar tema visual"
      className={`inline-flex items-center rounded-full border border-white/15 bg-white/40 dark:bg-black/30 backdrop-blur-md p-1 shadow-sm ${className}`}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={activateLight}
        aria-selected={!isDarkMode}
        className={`rounded-full px-3 py-1 transition-all ${
          !isDarkMode
            ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-sm"
            : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <Sun className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Versión Light</span>
        <span className="sm:hidden">Light</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={activateDark}
        aria-selected={isDarkMode}
        className={`rounded-full px-3 py-1 transition-all ${
          isDarkMode
            ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-sm"
            : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <Moon className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Versión Dark</span>
        <span className="sm:hidden">Dark</span>
      </Button>
    </div>
  );
};

export default ThemeModeToggle;