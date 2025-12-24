"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <Button
                onClick={scrollToTop}
                className={cn(
                    "rounded-full p-3 h-12 w-12 shadow-xl transition-all duration-500 ease-in-out transform hover:scale-110",
                    "bg-black dark:bg-white text-white dark:text-black", // Base colors flipped for contrast or sticking to brand
                    "border-2 border-brand-primary hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white", // Brand interaction
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 pointer-events-none"
                )}
                aria-label="Volver arriba"
            >
                <ArrowUp className="h-6 w-6" />
            </Button>
            {/* Glow effect */}
            <div
                className={cn(
                    "absolute inset-0 rounded-full bg-brand-primary blur-md -z-10 transition-opacity duration-500",
                    isVisible ? "opacity-40" : "opacity-0"
                )}
            />
        </div>
    );
}
