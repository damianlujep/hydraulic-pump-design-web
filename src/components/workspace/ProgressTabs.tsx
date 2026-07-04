"use client";

import { CheckIcon, ChevronRightThinIcon, LockIcon } from "@/components/icons";
import { useWorkspace } from "./WorkspaceContext";
import type { TabId } from "@/lib/types";

function pillClass(selected: boolean, locked: boolean) {
  const base =
    "inline-flex items-center gap-2 px-[15px] py-2 rounded-full text-[12.5px] font-semibold whitespace-nowrap border transition-[box-shadow,border-color,background] duration-150";
  if (locked) return `${base} bg-surface-2 border-border text-text-faint cursor-not-allowed`;
  if (selected) return `${base} bg-primary-soft border-primary text-text cursor-pointer shadow-[0_0_0_3px_var(--primary-ring)]`;
  return `${base} bg-surface border-border text-text-dim cursor-pointer`;
}

function StepPill({
  label,
  tab,
  icon,
}: {
  label: string;
  tab: TabId;
  icon: React.ReactNode;
}) {
  const { state, dispatch } = useWorkspace();
  return (
    <button onClick={() => dispatch({ type: "SET_TAB", tab })} className={pillClass(state.activeTab === tab, false)}>
      {icon}
      {label}
    </button>
  );
}

export function ProgressTabs() {
  return (
    <div className="flex items-center gap-[9px] p-[11px_22px] bg-surface border-b border-border">
      <StepPill
        tab="completion"
        label="Completación"
        icon={
          <span className="w-[18px] h-[18px] rounded-full bg-green inline-flex items-center justify-center text-green-fg flex-none">
            <CheckIcon size={11} />
          </span>
        }
      />
      <ChevronRightThinIcon size={16} />
      <StepPill
        tab="fluids"
        label="Fluidos y PVT"
        icon={
          <span className="w-[18px] h-[18px] rounded-full bg-green inline-flex items-center justify-center text-green-fg flex-none">
            <CheckIcon size={11} />
          </span>
        }
      />
      <ChevronRightThinIcon size={16} />
      <StepPill
        tab="ipr"
        label="IPR y OPR"
        icon={
          <span className="w-[18px] h-[18px] box-border rounded-full border-2 border-primary inline-flex items-center justify-center flex-none">
            <span className="w-[7px] h-[7px] rounded-full bg-primary flex-none" />
          </span>
        }
      />
      <ChevronRightThinIcon size={16} />
      <button disabled className={pillClass(false, true)}>
        <LockIcon size={14} />
        Cálculos
      </button>

      <div className="ml-auto text-[11.5px] text-text-faint font-mono">Paso 3 de 4 · Validación de entradas</div>
    </div>
  );
}
