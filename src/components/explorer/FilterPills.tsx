"use client";

import { useProjectList } from "@/lib/api/projects";
import { useExplorerFilters } from "./useExplorerFilters";

const SCOPE_FILTERS = [
  { value: "all", label: "Todos los proyectos" },
  { value: "own", label: "Mis proyectos" },
  { value: "shared", label: "Compartidos conmigo" },
  { value: "org", label: "Organización" },
] as const;
const PAGE_SIZE = 20;

export const FilterPills = () => {
  const { page, q, scope, setFilters } = useExplorerFilters();
  const { data, isPending } = useProjectList({ page, size: PAGE_SIZE, sort: "-updatedAt", scope, q });

  return (
    <div className="flex items-center gap-[10px] mb-3">
      <div className="flex gap-[6px]">
        {SCOPE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setFilters({ scope: filter.value, page: 0 })}
            className={
              filter.value === scope
                ? "px-[13px] py-[6px] rounded-[8px] text-xs font-semibold bg-primary-soft text-text shadow-[inset_0_0_0_1px_var(--primary-ring)] cursor-pointer"
                : "px-[13px] py-[6px] rounded-[8px] text-xs font-medium bg-surface text-text-dim border border-border cursor-pointer hover:text-text"
            }
          >
            {filter.label}
          </button>
        ))}
      </div>
      {!isPending && data && (
        <span className="ml-auto text-[11.5px] text-text-faint font-mono">
          {data.content?.length ?? 0} de {data.totalElements ?? 0} proyectos
        </span>
      )}
    </div>
  );
};
