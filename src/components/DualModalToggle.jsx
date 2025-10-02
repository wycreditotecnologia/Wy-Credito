import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

const DualModalToggle = ({ className = "" }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  return (
    <div className={className}>
      <button
        type="button"
        role="switch"
        aria-checked={isDarkMode}
        onClick={handleToggle}
        aria-label={isDarkMode ? "Alternar a modo blanco" : "Alternar a modo oscuro"}
        className="relative inline-flex items-center h-8 w-24 rounded-full pl-1 pr-2 select-none shadow-md ring-1 ring-black/10 dark:ring-white/10 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
      >
        <span
          className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-lg flex items-center justify-center transition-transform duration-300 ${
            isDarkMode ? "translate-x-0" : "translate-x-16"
          }`}
          aria-hidden="true"
        >
          {isDarkMode ? (
            <Moon className="h-4 w-4 text-gray-700" />
          ) : (
            <Sun className="h-4 w-4 text-yellow-500" />
          )}
        </span>
        <span
          className={`ml-7 text-[10px] font-poppins font-medium tracking-wide ${
            isDarkMode ? "text-gray-100" : "text-gray-700"
          }`}
        >
          {isDarkMode ? "Oscuro" : "Blanco"}
        </span>
      </button>
    </div>
  );
};

export default DualModalToggle;