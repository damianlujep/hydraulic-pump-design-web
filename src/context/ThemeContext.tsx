"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Accent, ThemeContext as Theme } from "@/interfaces/theme";

type ThemeContextValue = {
  theme: Theme;
  accent: Accent;
  toggleTheme: () => void;
  setAccent: (accent: Accent) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = "hydrapump-theme";
const ACCENT_KEY = "hydrapump-accent";
const ACCENTS: Accent[] = ["indigo", "cyan", "emerald", "amber"];

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  });
  const [accent, setAccentState] = useState<Accent>(() => {
    if (typeof document === "undefined") return "indigo";
    const attr = document.documentElement.getAttribute("data-accent");
    return ACCENTS.includes(attr as Accent) ? (attr as Accent) : "indigo";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
    window.localStorage.setItem(ACCENT_KEY, accent);
  }, [accent]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const setAccent = (next: Accent) => setAccentState(next);

  return (
    <ThemeContext.Provider value={{ theme, accent, toggleTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};
