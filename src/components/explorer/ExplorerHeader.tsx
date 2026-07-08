import { ChevronDownIcon, LockBadgeIcon, SearchIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "./UserMenu";

export const ExplorerHeader = () => {
  return (
    <header className="h-[60px] flex-none flex items-center gap-4 px-6 border-b border-border bg-surface">
      <div className="flex items-center gap-[11px] whitespace-nowrap">
        <button
          title="Cambiar de workspace"
          className="inline-flex items-center gap-[9px] p-[6px_10px_6px_7px] rounded-[9px] bg-surface-2 border border-border cursor-pointer hover:border-border-strong"
        >
          <span
            className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-primary-fg text-[11px] font-bold flex-none"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))" }}
          >
            PE
          </span>
          <span className="leading-[1.2] text-left">
            <span className="block text-[12.5px] font-semibold text-text">PAM EP</span>
            <span className="flex items-center gap-1 text-[9.5px] font-semibold tracking-[.04em] uppercase text-green">
              <LockBadgeIcon size={9} strokeWidth={2.4} />
              Workspace interno
            </span>
          </span>
          <ChevronDownIcon size={13} strokeWidth={2.2} className="ml-px text-text-faint" />
        </button>
        <span className="text-xs text-text-faint font-semibold tracking-[.02em]">/ Explorador</span>
      </div>

      <div className="flex-1 max-w-[440px] ml-1.5 relative flex items-center">
        <SearchIcon size={15} className="absolute left-[11px] text-text-faint" />
        <input
          placeholder="Buscar activos, campos o pozos..."
          className="w-full py-2 pr-3 pl-[34px] bg-surface-2 border border-border rounded-[9px] text-[13px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)]"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <div className="w-px h-[26px] bg-border" />
        <UserMenu />
      </div>
    </header>
  );
};
