"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Shared read/write for the Explorer's URL-driven filter state (page + search query), so
// ExplorerHeader, FilterPills, and ProjectsTable stay in sync without prop drilling — they read
// the same params and, since useProjectList keys on the params object, share one TanStack Query
// cache entry.
export const useExplorerFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 0);
  const q = searchParams.get("q") ?? undefined;

  const setFilters = (patch: { page?: number; q?: string | null }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (patch.page !== undefined) params.set("page", String(patch.page));
    if (patch.q !== undefined) {
      if (patch.q) params.set("q", patch.q);
      else params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return { page, q, setFilters };
};
