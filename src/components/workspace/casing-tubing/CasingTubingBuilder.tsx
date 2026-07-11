"use client";

import { useState } from "react";
import { DiameterIcon, PlusIcon, SearchIcon, XIcon } from "@/components/icons";
import { UnitField } from "../atoms/UnitField";
import { useWorkspace } from "../state/WorkspaceContext";
import { sanitizeNumeric } from "../state/numericInput";
import { buildSections } from "./casingTubing";
import type { PipeKind } from "@/interfaces/workspace";
import { cn } from "@/utils/cn";

export const CasingTubingBuilder = ({ kind, title }: { kind: PipeKind; title: string }) => {
  const { state, dispatch, casings, tubings } = useWorkspace();
  const sections = state[kind];
  const rows = buildSections(sections, kind === "casing" ? casings : tubings);
  const atLimit = sections.length >= 3;
  const [touchedLength, setTouchedLength] = useState<Set<number>>(new Set());

  return (
    <div className="rounded-[11px] border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between p-[10px_14px] bg-surface-2 border-b border-border">
        <span className="text-[11px] tracking-[.07em] uppercase text-text-dim font-semibold">{title}</span>
        <span className="font-mono text-[10px] text-text-faint">{sections.length} de 3 tramos</span>
      </div>

      <div className="p-2 flex flex-col gap-2">
        {rows.map((sec, i) => {
          const lengthMissing = touchedLength.has(i) && sec.length.trim() === "";
          return (
          <div
            key={i}
            className="rounded-[9px] border border-border overflow-hidden"
            style={{ background: sec.tint }}
          >
            <div className="flex items-center justify-between p-[7px_10px]">
              <span className="flex items-center gap-2">
                <span className="w-[7px] h-[7px] rounded-full" style={{ background: sec.accent }} />
                <span
                  className="text-[10.5px] font-bold tracking-[.05em] uppercase"
                  style={{ color: sec.accent }}
                >
                  {sec.label}
                </span>
              </span>
              {sec.canRemove && (
                <button
                  title="Eliminar tramo"
                  onClick={() => dispatch({ type: "REMOVE_SECTION", kind, index: i })}
                  className="inline-flex items-center p-[3px_7px] rounded-[6px] bg-transparent border border-border text-text-faint cursor-pointer hover:border-danger hover:text-danger hover:bg-danger-soft"
                >
                  <XIcon size={11} strokeWidth={2.2} />
                </button>
              )}
            </div>

            <div className="p-[0_10px_10px] flex flex-col gap-2">
              <label className="flex items-center justify-between gap-3">
                <span className="text-[12.5px] text-text-dim">Tamaño [in] · [lbs/ft]</span>
                <button
                  onClick={() => dispatch({ type: "OPEN_SIZE_MODAL", kind, target: i })}
                  className="w-[210px] flex items-center justify-between gap-2 p-[6px_10px] bg-surface-3 border border-border rounded-[7px] text-text cursor-pointer text-left hover:border-primary"
                >
                  <span className="font-mono text-xs">{sec.sizeLabel}</span>
                  <SearchIcon size={13} className="text-text-faint" />
                </button>
              </label>

              <div className="flex gap-[6px]">
                <div className="flex-1 bg-surface-2 border border-border rounded-[7px] p-[5px_8px]">
                  <div className="flex items-center gap-1 text-[9px] tracking-[.04em] uppercase text-text-faint">
                    <DiameterIcon size={9} />
                    Ø ext
                  </div>
                  <div className="mt-px font-mono text-[12.5px] text-text">
                    {sec.od} <span className="text-text-faint text-[9.5px]">in</span>
                  </div>
                </div>
                <div className="flex-1 bg-surface-2 border border-border rounded-[7px] p-[5px_8px]">
                  <div className="flex items-center gap-1 text-[9px] tracking-[.04em] uppercase text-text-faint">
                    <DiameterIcon size={9} />
                    Ø int
                  </div>
                  <div className="mt-px font-mono text-[12.5px] text-text">
                    {sec.id} <span className="text-text-faint text-[9.5px]">in</span>
                  </div>
                </div>
                <div className="flex-1 bg-surface-2 border border-border rounded-[7px] p-[5px_8px]">
                  <div className="flex items-center gap-1 text-[9px] tracking-[.04em] uppercase text-text-faint">
                    <DiameterIcon size={9} />
                    Peso
                  </div>
                  <div className="mt-px font-mono text-[12.5px] text-text">
                    {sec.w} <span className="text-text-faint text-[9.5px]">lb/ft</span>
                  </div>
                </div>
              </div>

              <label className="flex items-center justify-between gap-3">
                <span className="text-[12.5px] text-text-dim">Longitud</span>
                <UnitField
                  unit="ft"
                  error={lengthMissing}
                  value={sec.length}
                  onChange={(e) => {
                    const sanitized = sanitizeNumeric(e.target.value);
                    // Controlled input: force the DOM back in sync even when we skip the dispatch
                    // below, since a same-value dispatch wouldn't trigger a re-render to do it for us.
                    if (sanitized !== e.target.value) e.target.value = sanitized;
                    if (sanitized === sec.length) return;
                    dispatch({ type: "SET_SECTION_LENGTH", kind, index: i, length: sanitized });
                  }}
                  onBlur={() => setTouchedLength((prev) => new Set(prev).add(i))}
                />
              </label>
            </div>
          </div>
          );
        })}

        <button
          onClick={() => dispatch({ type: "ADD_SECTION", kind })}
          disabled={atLimit}
          className={cn(
            "flex items-center justify-center gap-[7px] w-full p-[9px] rounded-[9px] text-[12.5px] font-semibold bg-surface-2 border border-dashed",
            atLimit
              ? "border-border text-text-faint opacity-50 cursor-not-allowed"
              : "border-border-strong text-text-dim cursor-pointer hover:border-primary hover:text-primary hover:bg-primary-soft",
          )}
        >
          <PlusIcon size={14} strokeWidth={2.2} />
          Agregar tramo
        </button>
      </div>
    </div>
  );
};
