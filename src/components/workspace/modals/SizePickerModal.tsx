"use client";

import { Modal } from "@/components/Modal";
import { CheckThinIcon, SearchIcon, XIcon } from "@/components/icons";
import { useWorkspace } from "../state/WorkspaceContext";
import { cn } from "@/utils/cn";

export const SizePickerModal = () => {
  const { state, dispatch, casings, tubings } = useWorkspace();
  const { sizeModal } = state;
  if (!sizeModal.open) return null;

  const catalog = sizeModal.kind === "tubing" ? tubings : casings;
  const query = sizeModal.search.trim().toLowerCase();
  const current = state[sizeModal.kind][sizeModal.target];
  const rows = catalog.filter(
    (t) =>
      !query ||
      `${t.outerDiameter} ${t.innerDiameter} ${t.nominalWeight} ${t.grade}`.toLowerCase().includes(query),
  );

  const title = sizeModal.kind === "tubing" ? "Catálogo de tubería de producción" : "Catálogo de revestimiento";

  return (
    <Modal onClose={() => dispatch({ type: "CLOSE_SIZE_MODAL" })} maxWidthPx={500} zIndex={70} align="start">
      <div className="flex items-center justify-between gap-4 p-[16px_18px_14px] border-b border-border flex-none">
        <span className="text-[13.5px] font-semibold text-text">{title}</span>
        <button
          onClick={() => dispatch({ type: "CLOSE_SIZE_MODAL" })}
          className="inline-flex p-[5px] rounded-[7px] bg-transparent border-none text-text-faint cursor-pointer hover:text-text hover:bg-surface-2"
        >
          <XIcon size={16} />
        </button>
      </div>

      <div className="p-[14px_18px] border-b border-border flex-none">
        <span className="flex items-center gap-[9px] bg-surface-3 border border-border rounded-[9px] px-3 focus-within:border-primary focus-within:shadow-[0_0_0_2px_var(--primary-ring)]">
          <SearchIcon size={15} className="text-text-faint" />
          <input
            value={sizeModal.search}
            onChange={(e) => dispatch({ type: "SET_SIZE_SEARCH", search: e.target.value })}
            placeholder="Buscar por tamaño, Ø, grado o peso (ej. 9.625, K-55)"
            className="flex-1 py-[10px] bg-transparent border-none outline-none text-text text-[13px]"
          />
        </span>
      </div>

      <div className="overflow-y-auto p-2 flex-1">
        <div className="grid grid-cols-[1fr_74px_74px_64px] gap-2 p-[4px_14px_7px] text-[9.5px] tracking-[.05em] uppercase text-text-faint">
          <span>Tamaño nominal</span>
          <span className="text-right font-mono">Ø ext</span>
          <span className="text-right font-mono">Ø int</span>
          <span className="text-right font-mono">lb/ft</span>
        </div>

        {rows.map((t) => {
          const selected = !!current && current.catalogId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => t.id != null && dispatch({ type: "PICK_SIZE", catalogId: t.id })}
              className={cn(
                "block w-full text-left p-[9px_14px] my-px rounded-[9px] border cursor-pointer hover:bg-surface-2",
                selected ? "bg-primary-soft border-primary-ring" : "bg-transparent border-transparent",
              )}
            >
              <span className="grid grid-cols-[1fr_74px_74px_64px] gap-2 items-center w-full">
                <span className="flex items-center gap-2 text-[13px] text-text">
                  {selected && (
                    <span className="text-primary inline-flex">
                      <CheckThinIcon size={14} />
                    </span>
                  )}
                  {t.outerDiameter}″ · {t.grade}
                </span>
                <span className="text-right font-mono text-[12.5px] text-text-dim">{t.outerDiameter?.toFixed(3)}</span>
                <span className="text-right font-mono text-[12.5px] text-text-dim">{t.innerDiameter?.toFixed(3)}</span>
                <span className="text-right font-mono text-[12.5px] text-data-blue">{t.nominalWeight}</span>
              </span>
            </button>
          );
        })}

        {rows.length === 0 && (
          <div className="p-[26px] text-center text-[12.5px] text-text-faint">
            Sin coincidencias en el catálogo.
          </div>
        )}
      </div>
    </Modal>
  );
};
