"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/Modal";
import { CheckIcon, PlusIcon, PumpIcon, XIcon } from "@/components/icons";
import type { SurveyRow } from "@/interfaces/workspace";
import { cn } from "@/utils/cn";
import { useWorkspace } from "../state/WorkspaceContext";
import { analyzeSurveyDraft, type SurveyDraftStatus } from "../state/survey";
import { sanitizeNumeric } from "../state/numericInput";
import { useModalOpenReset } from "../state/useModalOpenReset";

const GRID_COLS = "grid-cols-[56px_1fr_1fr_1fr_1fr_40px]";
const MIN_ROWS = 3;
const MAX_ROWS = 20;
// While the user is actively typing, validation messages stay hidden; they surface after this
// pause, or immediately when a field is blurred.
const ERROR_REVEAL_DELAY_MS = 1000;

type Draft = { md: string; tvd: string };

const EMPTY_ROW: Draft = { md: "", tvd: "" };
// Station 1 is always the surface reference (0, 0) — fixed and non-editable.
const FIXED_FIRST_ROW: Draft = { md: "0.000", tvd: "0.000" };

const buildDraft = (survey: { md: number; tvd: number }[]): Draft[] => {
  const rows: Draft[] = survey.map((r) => ({ md: String(r.md), tvd: String(r.tvd) }));
  if (rows.length > 0 && survey[0].md === 0 && survey[0].tvd === 0) {
    rows[0] = { ...FIXED_FIRST_ROW };
  } else {
    // A survey without a surface station (also the empty-survey case) gets one prepended, even
    // if that puts the draft one past MAX_ROWS — truncating would silently lose the deepest
    // station on save.
    rows.unshift({ ...FIXED_FIRST_ROW });
  }
  while (rows.length < MIN_ROWS) rows.push({ ...EMPTY_ROW });
  return rows;
};

const INVALID_REASON_TEXT = {
  mdNotIncreasing: "MD debe ser mayor que el de la estación válida anterior",
  tvdExceedsMd: "El cambio de TVD no puede ser mayor que el cambio de MD",
} as const;

type BlockingIssue = { rowIndex: number | null; message: string };

const findBlockingIssue = (statuses: SurveyDraftStatus[]): BlockingIssue | null => {
  let okCount = 0;
  for (let i = 0; i < statuses.length; i++) {
    const s = statuses[i];
    if (s.kind === "ok") okCount++;
    if (s.kind === "partial") return { rowIndex: i, message: `Fila ${i + 1}: complete MD y TVD, o deje ambos vacíos` };
    if (s.kind === "invalid") return { rowIndex: i, message: `Fila ${i + 1}: ${INVALID_REASON_TEXT[s.reason]}` };
  }
  if (okCount < MIN_ROWS) return { rowIndex: null, message: `Ingrese al menos ${MIN_ROWS} estaciones válidas` };
  return null;
};

const INPUT_CLASS =
  "w-full p-[5px_9px] font-mono text-xs text-left bg-primary-soft border border-transparent rounded-[6px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)] focus:bg-surface-3 disabled:opacity-60";

export const SurveyModal = () => {
  const { state, dispatch, canEdit } = useWorkspace();
  const [rows, setRows] = useState<Draft[]>(() => buildDraft(state.survey));
  const [showErrors, setShowErrors] = useState(true);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useModalOpenReset(state.surveyModalOpen, () => {
    setRows(buildDraft(state.survey));
    setShowErrors(true);
  });

  // Debounced reveal: setRow hides errors on every keystroke; they come back after a pause
  // (or instantly via the inputs' onBlur). Same setTimeout-in-effect shape as SurveyTable's
  // TVD-interpolation debounce. Firing when errors are already shown is a state-identical
  // no-op, so the effect doesn't need to read showErrors at all.
  useEffect(() => {
    const timer = setTimeout(() => setShowErrors(true), ERROR_REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [rows]);

  const statuses = analyzeSurveyDraft(rows);
  const blocked = findBlockingIssue(statuses);

  // The strip names a row ("Fila 17: …") that can be scrolled out of view — bring it into
  // view whenever the error reveals or the offending row changes. block: "nearest" makes it
  // a no-op when the row is already visible.
  const blockedRowIndex = showErrors && blocked !== null ? blocked.rowIndex : null;
  useEffect(() => {
    if (blockedRowIndex === null) return;
    rowRefs.current[blockedRowIndex]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [blockedRowIndex]);

  if (!state.surveyModalOpen) return null;

  const close = () => dispatch({ type: "CLOSE_SURVEY_MODAL" });

  const setRow = (i: number, field: "md" | "tvd", value: string) => {
    const next = rows.slice();
    next[i] = { ...next[i], [field]: sanitizeNumeric(value) };
    setRows(next);
    setShowErrors(false);
  };

  const addRow = () => {
    if (rows.length >= MAX_ROWS) return;
    setRows([...rows, { ...EMPTY_ROW }]);
  };
  const removeRow = (i: number) => {
    if (i === 0 || rows.length <= MIN_ROWS) return;
    setRows(rows.filter((_, idx) => idx !== i));
  };

  const handleSave = () => {
    if (blocked !== null) return;
    const savedRows: SurveyRow[] = [];
    rows.forEach((r, i) => {
      const s = statuses[i];
      if (s.kind !== "ok") return;
      savedRows.push({ id: savedRows.length + 1, md: Number(r.md), tvd: Number(r.tvd), hd: s.hd, angle: s.angle });
    });
    dispatch({ type: "SAVE_SURVEY", rows: savedRows });
  };

  const derivedCell = (s: SurveyDraftStatus, value: (ok: { hd: number; angle: number }) => string) => {
    if (s.kind === "ok") return value(s);
    if (s.kind === "invalid" && showErrors)
      return (
        <span className="text-danger" title={INVALID_REASON_TEXT[s.reason]}>
          ✕
        </span>
      );
    return "—";
  };

  return (
    <Modal onClose={close} maxWidthPx={760} zIndex={60}>
      <div className="flex items-start justify-between gap-4 p-[20px_24px_16px] border-b border-border flex-none">
        <div>
          <h2 className="m-0 text-lg font-bold tracking-[-.01em]">Insertar Datos de Survey Direccional</h2>
          <p className="mt-[5px] text-[12.5px] text-text-dim flex items-center gap-[7px]">
            <PumpIcon size={14} strokeWidth={2} className="text-primary" />
            MD y TVD editables — HD y ángulo se calculan automáticamente. La estación 1 es la
            referencia de superficie.
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
          {rows.map((r, i) => {
            const status = statuses[i];
            const locked = !canEdit || i === 0;
            const problem = showErrors && (status.kind === "partial" || status.kind === "invalid");
            return (
              <div
                key={i}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className={`grid ${GRID_COLS} items-center border-t border-border`}
              >
                <div className={cn("text-right p-[5px_14px] text-text-faint", problem && "text-danger")}>{i + 1}</div>
                <div className="p-1 px-2">
                  <input
                    value={r.md}
                    disabled={locked}
                    inputMode="decimal"
                    placeholder="0.000"
                    onChange={(e) => setRow(i, "md", e.target.value)}
                    onBlur={() => setShowErrors(true)}
                    className={cn(INPUT_CLASS, problem && "border-danger")}
                  />
                </div>
                <div className="p-1 px-2">
                  <input
                    value={r.tvd}
                    disabled={locked}
                    inputMode="decimal"
                    placeholder="0.000"
                    onChange={(e) => setRow(i, "tvd", e.target.value)}
                    onBlur={() => setShowErrors(true)}
                    className={cn(INPUT_CLASS, problem && "border-danger")}
                  />
                </div>
                <div className="text-right p-[5px_14px] text-text-dim">
                  {derivedCell(status, (ok) => String(ok.hd))}
                </div>
                <div className="text-right p-[5px_18px_5px_14px] text-data-blue">
                  {derivedCell(status, (ok) => ok.angle.toFixed(0))}
                </div>
                <div className="text-center">
                  {canEdit && i > 0 && rows.length > MIN_ROWS && (
                    <button
                      onClick={() => removeRow(i)}
                      className="inline-flex p-1 rounded-[6px] bg-transparent border-none text-text-faint cursor-pointer hover:text-danger hover:bg-danger-soft"
                    >
                      <XIcon size={12} strokeWidth={2.2} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {canEdit && showErrors && blocked !== null && (
        <div className="px-6 py-[8px] text-[11.5px] text-danger bg-danger-soft border-t border-border flex-none">
          {blocked.message}
        </div>
      )}
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
            disabled={!canEdit || blocked !== null}
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
