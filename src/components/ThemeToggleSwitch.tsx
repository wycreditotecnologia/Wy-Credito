"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

export function ThemeToggleSwitch() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 h-9 px-3">
        <div className="w-16 h-5 bg-muted rounded-full animate-pulse" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm transition-all hover:bg-muted/70">
      <Sun 
        className={`h-4 w-4 transition-all duration-300 ${
          isDark ? "text-muted-foreground scale-90 opacity-50" : "text-primary scale-100 opacity-100"
        }`} 
      />
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30"
      />
      <Moon 
        className={`h-4 w-4 transition-all duration-300 ${
          isDark ? "text-primary scale-100 opacity-100" : "text-muted-foreground scale-90 opacity-50"
        }`} 
      />
      <span className="text-xs font-medium text-foreground/80 min-w-[48px] transition-all">
        {isDark ? "Oscuro" : "Blanco"}
      </span>
    </div>
  );
}
