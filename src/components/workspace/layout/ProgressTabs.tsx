"use client";

import { CheckIcon, ChevronRightThinIcon, LockIcon } from "@/components/icons";
import { useWorkspace } from "../state/WorkspaceContext";
import type { StepId, TabId } from "@/interfaces/workspace";
import { cn } from "@/utils/cn";

const pillClass = (selected: boolean, locked: boolean) =>
  cn(
    "inline-flex items-center gap-2 px-[15px] py-2 rounded-full text-[12.5px] font-semibold whitespace-nowrap border transition-[box-shadow,border-color,background] duration-150",
    locked && "bg-surface-2 border-border text-text-faint cursor-not-allowed",
    !locked && selected && "bg-primary-soft border-primary text-text cursor-pointer shadow-[0_0_0_3px_var(--primary-ring)]",
    !locked && !selected && "bg-surface border-border text-text-dim cursor-pointer",
  );

const StepIcon = ({ done }: { done: boolean }) => {
  if (done) {
    return (
      <span className="w-[18px] h-[18px] rounded-full bg-green inline-flex items-center justify-center text-green-fg flex-none">
        <CheckIcon size={11} />
      </span>
    );
  }
  return (
    <span className="w-[18px] h-[18px] box-border rounded-full border-2 border-primary inline-flex items-center justify-center flex-none">
      <span className="w-[7px] h-[7px] rounded-full bg-primary flex-none" />
    </span>
  );
};

const StepPill = ({ label, tab, step }: { label: string; tab: TabId; step: StepId }) => {
  const { state, dispatch, stepDone } = useWorkspace();
  return (
    <button onClick={() => dispatch({ type: "SET_TAB", tab })} className={pillClass(state.activeTab === tab, false)}>
      <StepIcon done={stepDone[step]} />
      {label}
    </button>
  );
};

const STEP_LABELS: Record<TabId, string> = {
  completion: "Paso 1 de 4",
  fluids: "Paso 2 de 4",
  ipr: "Paso 3 de 4",
  calc: "Paso 4 de 4",
};

export const ProgressTabs = () => {
  const { state, dispatch, calcUnlocked } = useWorkspace();

  return (
    <div className="flex items-center gap-[9px] p-[11px_22px] bg-surface border-b border-border">
      <StepPill tab="completion" step="completion" label="Completación" />
      <ChevronRightThinIcon size={16} />
      <StepPill tab="fluids" step="fluids" label="Fluidos y PVT" />
      <ChevronRightThinIcon size={16} />
      <StepPill tab="ipr" step="ipr" label="IPR y OPR" />
      <ChevronRightThinIcon size={16} />
      <button
        disabled={!calcUnlocked}
        onClick={() => calcUnlocked && dispatch({ type: "SET_TAB", tab: "calc" })}
        className={pillClass(state.activeTab === "calc", !calcUnlocked)}
      >
        {!calcUnlocked && <LockIcon size={14} />}
        Cálculos
      </button>

      <div className="ml-auto text-[11.5px] text-text-faint font-mono">
        {STEP_LABELS[state.activeTab]} · Validación de entradas
      </div>
    </div>
  );
};
