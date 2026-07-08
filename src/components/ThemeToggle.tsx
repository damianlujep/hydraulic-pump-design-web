"use client";

import { MoonIcon, SunIcon } from "@/components/icons";
import { useTheme } from "@/context/ThemeContext";

export const ThemeToggle = () => {
  const { toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      title="Cambiar tema"
      className="inline-flex items-center gap-[7px] px-3 py-[7px] rounded-[9px] bg-surface-2 border border-border text-text-dim text-xs font-semibold cursor-pointer hover:border-border-strong hover:text-text"
    >
      <span className="inline-flex items-center gap-[7px] light:hidden">
        <MoonIcon size={15} />
        Oscuro
      </span>
      <span className="hidden items-center gap-[7px] light:inline-flex">
        <SunIcon size={15} />
        Claro
      </span>
    </button>
  );
};
