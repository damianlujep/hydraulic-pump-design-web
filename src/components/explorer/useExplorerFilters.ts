"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProjectListParams } from "@/interfaces/project";

type Scope = NonNullable<ProjectListParams["scope"]>;

const SCOPES: Scope[] = ["all", "own", "shared", "org"];

// Shared read/write for the Explorer's URL-driven filter state (page, search query, scope), so
// ExplorerHeader, FilterPills, and ProjectsTable stay in sync without prop drilling — they read
// the same params and, since useProjectList keys on the params object, share one TanStack Query
// cache entry.
export const useExplorerFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 0);
  const q = searchParams.get("q") ?? undefined;
  const rawScope = searchParams.get("scope");
  const scope: Scope = SCOPES.includes(rawScope as Scope) ? (rawScope as Scope) : "all";

  const setFilters = (patch: { page?: number; q?: string | null; scope?: Scope }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (patch.page !== undefined) params.set("page", String(patch.page));
    if (patch.q !== undefined) {
      if (patch.q) params.set("q", patch.q);
      else params.delete("q");
    }
    if (patch.scope !== undefined) {
      if (patch.scope === "all") params.delete("scope");
      else params.set("scope", patch.scope);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return { page, q, scope, setFilters };
};
