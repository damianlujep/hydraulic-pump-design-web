"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { CheckIcon, PlusIcon, PumpIcon, XIcon } from "@/components/icons";
import { useWorkspace } from "../state/WorkspaceContext";
import { deriveSurveyGeometry } from "../state/survey";
import { sanitizeNumeric } from "../state/numericInput";
import { useModalOpenReset } from "../state/useModalOpenReset";

const GRID_COLS = "grid-cols-[56px_1fr_1fr_1fr_1fr_40px]";
const MIN_ROWS = 3;
const MAX_ROWS = 20;

type Draft = { md: string; tvd: string };

const EMPTY_ROW: Draft = { md: "", tvd: "" };

const buildDraft = (survey: { md: number; tvd: number }[]): Draft[] => {
  const rows = survey.length > 0 ? survey.map((r) => ({ md: String(r.md), tvd: String(r.tvd) })) : [];
  while (rows.length < MIN_ROWS) rows.push({ ...EMPTY_ROW });
  return rows;
};

export const SurveyModal = () => {
  const { state, dispatch, canEdit } = useWorkspace();
  const [draft, setDraft] = useState<Draft[]>(() => buildDraft(state.survey));

  useModalOpenReset(state.surveyModalOpen, () => setDraft(buildDraft(state.survey)));

  if (!state.surveyModalOpen) return null;
  const rows = draft;

  const parsed = rows.map((r) => ({ md: Number(r.md), tvd: Number(r.tvd) }));
  const geometry = deriveSurveyGeometry(parsed);

  const close = () => dispatch({ type: "CLOSE_SURVEY_MODAL" });

  const setRow = (i: number, field: "md" | "tvd", value: string) => {
    const next = rows.slice();
    next[i] = { ...next[i], [field]: sanitizeNumeric(value) };
    setDraft(next);
  };

  const addRow = () => {
    if (rows.length >= MAX_ROWS) return;
    setDraft([...rows, { ...EMPTY_ROW }]);
  };
  const removeRow = (i: number) => {
    if (rows.length <= MIN_ROWS) return;
    setDraft(rows.filter((_, idx) => idx !== i));
  };

  const validRows = parsed
    .map((r, i) => ({ ...r, valid: Number.isFinite(r.md) && Number.isFinite(r.tvd), row: rows[i] }))
    .filter((r) => r.row.md.trim() !== "" && r.row.tvd.trim() !== "" && r.valid);
  const canSave = validRows.length >= MIN_ROWS;

  const handleSave = () => {
    if (!canSave) return;
    const savedRows = deriveSurveyGeometry(validRows.map((r) => ({ md: r.md, tvd: r.tvd })));
    dispatch({ type: "SAVE_SURVEY", rows: savedRows });
  };

  return (
    <Modal onClose={close} maxWidthPx={760} zIndex={60}>
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
            <div />
          </div>
          {rows.map((r, i) => (
            <div key={i} className={`grid ${GRID_COLS} items-center border-t border-border`}>
              <div className="text-right p-[5px_14px] text-text-faint">{i + 1}</div>
              <div className="p-1 px-2">
                <input
                  value={r.md}
                  disabled={!canEdit}
                  inputMode="decimal"
                  placeholder="0.000"
                  onChange={(e) => setRow(i, "md", e.target.value)}
                  className="w-full p-[5px_9px] font-mono text-xs text-left bg-primary-soft border border-transparent rounded-[6px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)] focus:bg-surface-3 disabled:opacity-60"
                />
              </div>
              <div className="p-1 px-2">
                <input
                  value={r.tvd}
                  disabled={!canEdit}
                  inputMode="decimal"
                  placeholder="0.000"
                  onChange={(e) => setRow(i, "tvd", e.target.value)}
                  className="w-full p-[5px_9px] font-mono text-xs text-left bg-primary-soft border border-transparent rounded-[6px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)] focus:bg-surface-3 disabled:opacity-60"
                />
              </div>
              <div className="text-right p-[5px_14px] text-text-dim">
                {Number.isFinite(geometry[i]?.hd) ? geometry[i].hd.toFixed(3) : "—"}
              </div>
              <div className="text-right p-[5px_18px_5px_14px] text-data-blue">
                {Number.isFinite(geometry[i]?.angle) ? geometry[i].angle.toFixed(3) : "—"}
              </div>
              <div className="text-center">
                {canEdit && rows.length > MIN_ROWS && (
                  <button
                    onClick={() => removeRow(i)}
                    className="inline-flex p-1 rounded-[6px] bg-transparent border-none text-text-faint cursor-pointer hover:text-danger hover:bg-danger-soft"
                  >
                    <XIcon size={12} strokeWidth={2.2} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 p-[14px_24px] border-t border-border flex-none bg-surface">
        <span className="text-[11px] text-text-faint font-mono">
          {rows.length}/{MAX_ROWS} estaciones
        </span>
        {canEdit && (
          <button
            onClick={addRow}
            disabled={rows.length >= MAX_ROWS}
            className="inline-flex items-center gap-[5px] px-3 py-[6px] rounded-[8px] bg-surface-2 border border-dashed border-border-strong text-text-dim text-[11.5px] font-semibold cursor-pointer hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border-strong disabled:hover:text-text-dim"
          >
            <PlusIcon size={12} strokeWidth={2.2} />
            Agregar estación
          </button>
        )}
        <div className="ml-auto flex items-center gap-[10px]">
          <button
            onClick={close}
            className="px-5 py-[10px] rounded-[10px] bg-transparent text-danger border border-danger text-[13px] font-semibold cursor-pointer hover:bg-danger hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!canEdit || !canSave}
            title={!canSave ? `Ingrese al menos ${MIN_ROWS} estaciones válidas` : undefined}
            className="inline-flex items-center gap-2 px-[22px] py-[10px] rounded-[10px] bg-primary text-primary-fg border-none text-[13px] font-bold cursor-pointer shadow-[0_5px_16px_var(--primary-ring)] hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <CheckIcon size={15} />
            Guardar survey
          </button>
        </div>
      </div>
    </Modal>
  );
};
