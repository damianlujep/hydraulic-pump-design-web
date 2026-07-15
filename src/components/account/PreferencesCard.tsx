"use client";

import { useTheme } from "@/context/ThemeContext";
import { AccountCard, DataRow } from "./AccountCard";

export const PreferencesCard = () => {
  const { toggleTheme } = useTheme();

  return (
    <AccountCard title="Preferencias">
      <div className="flex items-center justify-between border-b border-border py-[11px]">
        <div>
          <div className="text-[13px] font-medium text-text">Tema de la interfaz</div>
          <div className="mt-[1px] text-[12px] text-text-faint">
            <span className="light:hidden">Oscuro</span>
            <span className="hidden light:inline">Claro</span>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="cursor-pointer inline-flex items-center rounded-[9px] border border-border bg-surface-2 px-[12px] py-[7px] text-[12px] font-semibold text-text hover:border-border-strong"
        >
          Cambiar
        </button>
      </div>
      <DataRow label="Sistema de unidades" value="Campo (bbl · psi · °F)" />
    </AccountCard>
  );
};
