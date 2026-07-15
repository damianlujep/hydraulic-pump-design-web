import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/explorer/UserMenu";

export const AccountHeader = () => {
  return (
    <header className="flex h-[60px] flex-none items-center gap-4 border-b border-border bg-surface px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-[9px] whitespace-nowrap rounded-[9px] border border-border bg-surface-2 px-[12px] py-[7px] text-[12.5px] font-semibold text-text hover:border-border-strong"
      >
        <ArrowLeftIcon size={15} />
        Regresar al Explorador
      </Link>

      <div className="flex items-center gap-[7px] text-[12px] text-text-faint">
        <span>Mi cuenta</span>
        <span>/</span>
        <span className="font-semibold text-text">Perfil</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <div className="h-[26px] w-px bg-border" />
        <UserMenu />
      </div>
    </header>
  );
};
