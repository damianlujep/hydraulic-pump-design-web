"use client";

import { ChevronRightThinIcon, PencilIcon } from "@/components/icons";
import { SURVEY } from "@/lib/data";
import { useWorkspace } from "../WorkspaceContext";

const GRID_COLS = "grid-cols-[56px_repeat(4,1fr)]";

export const SurveyTable = () => {
  const { dispatch } = useWorkspace();

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden flex-none">
      <div className="p-[12px_16px] border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-[10px]">
          <div className="text-[13px] font-bold tracking-[-.01em]">Survey Direccional</div>
          <span className="text-[11px] text-text-faint font-mono">20 estaciones</span>
        </div>
        <button
          onClick={() => dispatch({ type: "OPEN_SURVEY_MODAL" })}
          className="inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-[9px] bg-primary border-none text-primary-fg text-xs font-semibold cursor-pointer shadow-[0_4px_12px_var(--primary-ring)] hover:bg-primary-hover"
        >
          <PencilIcon size={13} />
          Editar survey direccional
        </button>
      </div>

      <div className="h-[340px] overflow-y-auto flex-none">
        <div className="text-xs font-mono">
          <div className={`sticky top-0 z-[1] grid ${GRID_COLS} bg-surface-2`}>
            <div className="text-right p-[8px_12px] text-[10px] uppercase tracking-[.05em] text-text-faint font-sans">#</div>
            <div className="text-right p-[8px_12px] text-[10px] uppercase tracking-[.05em] text-text-faint font-sans">MD (ft)</div>
            <div className="text-right p-[8px_12px] text-[10px] uppercase tracking-[.05em] text-text-faint font-sans">TVD (ft)</div>
            <div className="text-right p-[8px_12px] text-[10px] uppercase tracking-[.05em] text-text-faint font-sans">Dist.Hor (ft)</div>
            <div className="text-right p-[8px_12px] text-[10px] uppercase tracking-[.05em] text-text-faint font-sans">Áng (°)</div>
          </div>
          {SURVEY.map((r) => (
            <div key={r.n} className={`grid ${GRID_COLS} border-t border-border hover:bg-primary-soft`}>
              <div className="text-right p-[6px_12px] text-text-faint">{r.n}</div>
              <div className="text-right p-[6px_12px] text-text">{r.md}</div>
              <div className="text-right p-[6px_12px] text-text">{r.tvd}</div>
              <div className="text-right p-[6px_12px] text-text-dim">{r.hd}</div>
              <div className="text-right p-[6px_12px] text-data-blue">{r.ang}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-[13px_16px] border-t border-border">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-text-dim">Calcular TVD desde MD</div>
            <div className="mt-[3px] text-[10.5px] text-text-faint">
              Inserte MD para calcular TVD por interpolación del survey
            </div>
          </div>
          <div className="flex items-center gap-2 flex-none">
            <div className="relative flex items-center">
              <input
                placeholder="MD"
                className="w-24 py-[6px] pr-6 pl-[9px] font-mono text-xs text-left bg-surface-3 border border-border rounded-[7px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)]"
              />
              <span className="absolute right-[9px] top-1/2 -translate-y-1/2 text-[10px] text-text-faint">ft</span>
            </div>
            <ChevronRightThinIcon size={15} className="flex-none" />
            <div className="relative flex items-center">
              <input
                placeholder="TVD"
                disabled
                className="w-24 py-[6px] pr-6 pl-[9px] font-mono text-xs text-left bg-surface-2 border border-dashed border-border rounded-[7px] text-text-faint outline-none"
              />
              <span className="absolute right-[9px] top-1/2 -translate-y-1/2 text-[10px] text-text-faint">ft</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
