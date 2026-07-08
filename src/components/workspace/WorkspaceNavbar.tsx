"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PumpIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/explorer/UserMenu";

export const WorkspaceNavbar = () => {
  const router = useRouter();

  return (
    <header className="h-[58px] flex-none flex items-center gap-[15px] px-[22px] bg-surface border-b border-border">
      <button
        onClick={() => router.push("/")}
        className="inline-flex items-center gap-[7px] px-[13px] py-2 rounded-[9px] bg-surface-2 border border-border text-text-dim text-[12.5px] font-semibold cursor-pointer hover:text-text hover:border-border-strong"
      >
        <ArrowLeftIcon size={15} />
        Regresar al Explorador
      </button>
      <div className="w-px h-[26px] bg-border" />
      <div className="flex items-center gap-[11px]">
        <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary flex-none">
          <PumpIcon size={16} strokeWidth={1.9} />
        </div>
        <div className="leading-[1.3]">
          <div className="text-sm font-bold tracking-[-.01em]">APK-11M2 JET PUMP</div>
          <div className="text-[11px] text-text-dim font-mono">Pozo Activo: APAIKA-11 · Arena M2 · PAM EP</div>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <span className="inline-flex items-center gap-[7px] text-[11.5px] font-semibold text-green">
          <span className="w-[7px] h-[7px] rounded-full bg-green shadow-[0_0_0_3px_var(--green-soft)]" />
          Guardado en la nube
        </span>
        <div className="w-px h-6 bg-border" />
        <ThemeToggle />
        <div className="w-px h-6 bg-border" />
        <UserMenu />
      </div>
    </header>
  );
};
