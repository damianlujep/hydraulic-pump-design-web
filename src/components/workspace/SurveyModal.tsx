"use client";

import { Modal } from "@/components/Modal";
import { CheckIcon, PumpIcon, XIcon } from "@/components/icons";
import { SURVEY_FULL } from "@/lib/data";
import { useWorkspace } from "./WorkspaceContext";

const GRID_COLS = "grid-cols-[56px_1fr_1fr_1fr_1fr]";

export function SurveyModal() {
  const { state, dispatch } = useWorkspace();
  if (!state.surveyModalOpen) return null;

  const close = () => dispatch({ type: "CLOSE_SURVEY_MODAL" });

  return (
    <Modal onClose={close} maxWidthPx={720} zIndex={60}>
      <div className="flex items-start justify-between gap-4 p-[20px_24px_16px] border-b border-border flex-none">
        <div>
          <h2 className="m-0 text-lg font-bold tracking-[-.01em]">Insertar Datos de Survey Direccional</h2>
          <p className="mt-[5px] text-[12.5px] text-text-dim flex items-center gap-[7px]">
            <PumpIcon size={14} strokeWidth={2} className="text-primary" />
            MD y TVD editables — HD y ángulo se calculan automáticamente
          </p>
        </div>
        <button
          onClick={close}
          className="w-8 h-8 rounded-lg bg-surface-2 border border-border text-text-dim cursor-pointer flex items-center justify-center flex-none hover:text-text hover:border-border-strong"
        >
          <XIcon size={16} />
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        <div className="text-xs font-mono">
          <div className={`sticky top-0 z-[1] grid ${GRID_COLS} bg-surface-2 shadow-[0_1px_0_var(--border)]`}>
            <div className="text-right p-[9px_14px] text-[10px] uppercase tracking-[.05em] text-text-faint font-sans">id</div>
            <div className="text-right p-[9px_14px] text-[10px] uppercase tracking-[.05em] text-primary font-sans">MD [ft] ✎</div>
            <div className="text-right p-[9px_14px] text-[10px] uppercase tracking-[.05em] text-primary font-sans">TVD [ft] ✎</div>
            <div className="text-right p-[9px_14px] text-[10px] uppercase tracking-[.05em] text-text-faint font-sans">HD [ft]</div>
            <div className="text-right p-[9px_18px_9px_14px] text-[10px] uppercase tracking-[.05em] text-text-faint font-sans">Áng [°]</div>
          </div>
          {SURVEY_FULL.map((r) => (
            <div key={r.n} className={`grid ${GRID_COLS} items-center border-t border-border`}>
              <div className="text-right p-[5px_14px] text-text-faint">{r.n}</div>
              <div className="p-1 px-2">
                <input
                  defaultValue={r.md}
                  className="w-full p-[5px_9px] font-mono text-xs text-left bg-primary-soft border border-transparent rounded-[6px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)] focus:bg-surface-3"
                />
              </div>
              <div className="p-1 px-2">
                <input
                  defaultValue={r.tvd}
                  className="w-full p-[5px_9px] font-mono text-xs text-left bg-primary-soft border border-transparent rounded-[6px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)] focus:bg-surface-3"
                />
              </div>
              <div className="text-right p-[5px_14px] text-text-dim">{r.hd}</div>
              <div className="text-right p-[5px_18px_5px_14px] text-data-blue">{r.ang}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 p-[14px_24px] border-t border-border flex-none bg-surface">
        <span className="text-[11px] text-text-faint font-mono">20 estaciones</span>
        <div className="ml-auto flex items-center gap-[10px]">
          <button
            onClick={close}
            className="px-5 py-[10px] rounded-[10px] bg-transparent text-danger border border-danger text-[13px] font-semibold cursor-pointer hover:bg-danger hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={() => dispatch({ type: "SAVE_SURVEY" })}
            className="inline-flex items-center gap-2 px-[22px] py-[10px] rounded-[10px] bg-primary text-primary-fg border-none text-[13px] font-bold cursor-pointer shadow-[0_5px_16px_var(--primary-ring)] hover:bg-primary-hover"
          >
            <CheckIcon size={15} />
            Guardar survey
          </button>
        </div>
      </div>
    </Modal>
  );
}
