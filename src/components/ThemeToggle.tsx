"use client";

import { MoonIcon, SunIcon } from "@/components/icons";
import { useTheme } from "@/components/theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggleTheme}
      title="Cambiar tema"
      className="inline-flex items-center gap-[7px] px-3 py-[7px] rounded-[9px] bg-surface-2 border border-border text-text-dim text-xs font-semibold cursor-pointer hover:border-border-strong hover:text-text"
    >
      {isDark ? (
        <>
          <MoonIcon size={15} />
          Oscuro
        </>
      ) : (
        <>
          <SunIcon size={15} />
          Claro
        </>
      )}
    </button>
  );
}
