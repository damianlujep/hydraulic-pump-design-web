"use client";

import { useProjectList } from "@/lib/api/projects";
import { useExplorerFilters } from "./useExplorerFilters";

const FILTERS = ["Todos", "Sincronizados", "Caché local"];
const PAGE_SIZE = 20;

export const FilterPills = () => {
  const { page, q } = useExplorerFilters();
  const { data, isPending } = useProjectList({ page, size: PAGE_SIZE, sort: "-updatedAt", scope: "all", q });

  return (
    <div className="flex items-center gap-[10px] mb-3">
      <div className="flex gap-[6px]">
        {FILTERS.map((filter, i) =>
          i === 0 ? (
            <span
              key={filter}
              className="px-[13px] py-[6px] rounded-[8px] text-xs font-semibold bg-primary-soft text-text shadow-[inset_0_0_0_1px_var(--primary-ring)] cursor-pointer"
            >
              {filter}
            </span>
          ) : (
            <span
              key={filter}
              className="px-[13px] py-[6px] rounded-[8px] text-xs font-medium bg-surface text-text-dim border border-border cursor-pointer hover:text-text"
            >
              {filter}
            </span>
          )
        )}
      </div>
      {!isPending && data && (
        <span className="ml-auto text-[11.5px] text-text-faint font-mono">
          {data.content?.length ?? 0} de {data.totalElements ?? 0} proyectos
        </span>
      )}
    </div>
  );
};
