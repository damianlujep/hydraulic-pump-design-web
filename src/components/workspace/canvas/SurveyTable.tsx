"use client";

import { useEffect, useState } from "react";
import { ChevronRightThinIcon, PencilIcon } from "@/components/icons";
import { isErrorResponse } from "@/lib/api/errors";
import { useInterpolateTvd } from "@/lib/api/calculations";
import { useWorkspace } from "../state/WorkspaceContext";
import { sanitizeNumeric } from "../state/numericInput";

const GRID_COLS = "grid-cols-[56px_repeat(4,1fr)]";

const translateTvdDomainError = (message: string): string => {
  if (/^surveyStations must be sorted by measuredDepth with no duplicate depths$/.test(message)) {
    return "El survey debe estar ordenado por MD, sin profundidades duplicadas";
  }
  return "No se pudo calcular el TVD";
};

export const SurveyTable = () => {
  const { state, dispatch, canEdit } = useWorkspace();
  const [mdInput, setMdInput] = useState("");
  const interpolateTvd = useInterpolateTvd();
  const hasEnoughStations = state.survey.length >= 2;

  const parsedMd = mdInput.trim() === "" ? null : Number(mdInput);
  const mdIsValid = parsedMd !== null && Number.isFinite(parsedMd);

  useEffect(() => {
    if (!hasEnoughStations || !mdIsValid) return;
    const timer = setTimeout(() => {
      interpolateTvd.mutate({
        surveyStations: state.survey.map((r) => ({ measuredDepth: r.md, trueVerticalDepth: r.tvd })),
        targetMeasuredDepth: parsedMd,
      });
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mdIsValid, parsedMd, state.survey, hasEnoughStations]);

  const showResult = mdIsValid && interpolateTvd.variables?.targetMeasuredDepth === parsedMd;
  const tvdValue = showResult ? interpolateTvd.data?.trueVerticalDepth : undefined;
  const errorMessage =
    showResult && interpolateTvd.isError
      ? isErrorResponse(interpolateTvd.error) && interpolateTvd.error.code === "DOMAIN_ERROR"
        ? translateTvdDomainError(interpolateTvd.error.message)
        : "No se pudo calcular el TVD"
      : null;
  const tvdDisplayValue = !showResult ? "" : interpolateTvd.isPending ? "…" : (tvdValue?.toFixed(2) ?? "");

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden flex-none">
      <div className="p-[12px_16px] border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-[10px]">
          <div className="text-[13px] font-bold tracking-[-.01em]">Survey Direccional</div>
          <span className="text-[11px] text-text-faint font-mono">{state.survey.length} estaciones</span>
        </div>
        <button
          onClick={() => dispatch({ type: "OPEN_SURVEY_MODAL" })}
          disabled={!canEdit}
          className="inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-[9px] bg-primary border-none text-primary-fg text-xs font-semibold cursor-pointer shadow-[0_4px_12px_var(--primary-ring)] hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
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
          {state.survey.map((r) => (
            <div key={r.id} className={`grid ${GRID_COLS} border-t border-border hover:bg-primary-soft`}>
              <div className="text-right p-[6px_12px] text-text-faint">{r.id}</div>
              <div className="text-right p-[6px_12px] text-text">{r.md.toFixed(3)}</div>
              <div className="text-right p-[6px_12px] text-text">{r.tvd.toFixed(3)}</div>
              <div className="text-right p-[6px_12px] text-text-dim">{r.hd}</div>
              <div className="text-right p-[6px_12px] text-data-blue">{r.angle.toFixed(0)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-[13px_16px] border-t border-border">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-text-dim">Calcular TVD desde MD</div>
            <div className="mt-[3px] text-[10.5px] text-text-faint">
              {hasEnoughStations
                ? "Inserte MD para calcular TVD por interpolación del survey"
                : "Se requieren al menos 2 estaciones en el survey"}
            </div>
            {errorMessage && <div className="mt-[3px] text-[10.5px] text-danger">{errorMessage}</div>}
          </div>
          <div className="flex items-center gap-2 flex-none">
            <div className="relative flex items-center">
              <input
                placeholder="MD"
                inputMode="decimal"
                disabled={!hasEnoughStations}
                value={mdInput}
                onChange={(e) => {
                  const sanitized = sanitizeNumeric(e.target.value);
                  if (sanitized !== e.target.value) e.target.value = sanitized;
                  setMdInput(sanitized);
                }}
                className="w-24 py-[6px] pr-6 pl-[9px] font-mono text-xs text-left bg-surface-3 border border-border rounded-[7px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)] disabled:opacity-60"
              />
              <span className="absolute right-[9px] top-1/2 -translate-y-1/2 text-[10px] text-text-faint">ft</span>
            </div>
            <ChevronRightThinIcon size={15} className="flex-none" />
            <div className="relative flex items-center">
              <input
                placeholder="TVD"
                disabled
                value={tvdDisplayValue}
                readOnly
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
