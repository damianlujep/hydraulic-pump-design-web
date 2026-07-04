"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light";
export type Accent = "indigo" | "cyan" | "emerald" | "amber";

type ThemeContextValue = {
  theme: Theme;
  accent: Accent;
  toggleTheme: () => void;
  setAccent: (accent: Accent) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = "hydrapump-theme";
const ACCENT_KEY = "hydrapump-accent";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [accent, setAccentState] = useState<Accent>("indigo");

  useEffect(() => {
    // One-time sync from localStorage after mount: the value isn't known during SSR,
    // so it can't be read in the initial useState without causing a hydration mismatch.
    const storedTheme = window.localStorage.getItem(THEME_KEY) as Theme | null;
    const storedAccent = window.localStorage.getItem(ACCENT_KEY) as Accent | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (storedTheme) setTheme(storedTheme);
    if (storedAccent) setAccentState(storedAccent);
  }, []);

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
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
