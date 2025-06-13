"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AnimationStart,
  AnimationVariant,
  createAnimation,
} from "@/lib/theme/animations";

interface ThemeOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface ThemeToggleDropdownProps {
  variant?: AnimationVariant;
  start?: AnimationStart;
  url?: string;
}

export const ThemeToggleDropdown = ({
  variant = "circle-blur",
  start = "top-left",
  url = "",
}: ThemeToggleDropdownProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const styleId = "theme-transition-styles";

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateStyles = useCallback((css: string) => {
    if (typeof window === "undefined") return;

    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;
  }, []);

  const themeOptions: ThemeOption[] = [
    {
      value: "light",
      label: "Light",
      icon: <Sun className="h-4 w-4" />,
    },
    {
      value: "dark",
      label: "Dark",
      icon: <Moon className="h-4 w-4" />,
    },
    {
      value: "system",
      label: "System",
      icon: <Monitor className="h-4 w-4" />,
    },
  ];

  const getCurrentTheme = () => {
    if (!mounted) return themeOptions[0];
    return (
      themeOptions.find((option) => option.value === theme) || themeOptions[0]
    );
  };

  const getDisplayIcon = () => {
    if (!mounted) return <Sun className="h-4 w-4" />;

    if (theme === "system") {
      return resolvedTheme === "dark" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      );
    }

    return getCurrentTheme()!.icon;
  };

  const handleThemeChange = (newTheme: string) => {
    // Skip animation for system theme or if it's the same theme
    if (newTheme === "system" || newTheme === theme) {
      setTheme(newTheme);
      setIsOpen(false);
      return;
    }

    const animation = createAnimation(variant, start, url);
    updateStyles(animation.css);

    const switchTheme = () => {
      setTheme(newTheme);
      setIsOpen(false);
    };

    if (typeof window === "undefined" || !document.startViewTransition) {
      switchTheme();
      return;
    }

    document.startViewTransition(switchTheme);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-auto h-9 px-3 rounded-xl">
        <Sun className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Light</span>
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-auto  px-3 rounded-full hover:bg-accent/80 transition-all duration-200",
          "flex items-center gap-2 text-sm font-medium cursor-pointer",
          isOpen && "bg-accent/50",
        )}
      >
        <motion.div
          key={`${theme}-${resolvedTheme}`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {getDisplayIcon()}
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={cn(
                "absolute right-0 top-12 z-50 min-w-[160px] overflow-hidden rounded-xl  bg-white/95 backdrop-blur-xl shadow-lg",
                "dark:bg-neutral-950/95",
                "shadow-[0_0_32px_rgba(0,_0,_0,_0.08),_0_2px_16px_rgba(0,_0,_0,_0.04),_0_0_0_1px_rgba(0,_0,_0,_0.04)]",
                "dark:shadow-[0_0_32px_rgba(0,_0,_0,_0.3),_0_2px_16px_rgba(0,_0,_0,_0.2),_0_0_0_1px_rgba(255,_255,_255,_0.1)]",
              )}
            >
              <div className="p-1 space-y-1">
                {themeOptions.map((option) => {
                  const isActive = theme === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => handleThemeChange(option.value)}
                      className={cn(
                        "cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        "hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-primary/20",
                        isActive
                          ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                          : "text-foreground hover:text-foreground",
                      )}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        animate={{
                          scale: isActive ? 1.1 : 1,
                          color: isActive ? "var(--primary)" : "currentColor",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      >
                        {option.icon}
                      </motion.div>
                      <span>{option.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
