import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client-fetch";
import { queryKeys } from "@/lib/api/query-keys";
import type { TubularItem } from "@/lib/api/casings";

export const useTubings = (options?: { initialData?: TubularItem[] }) => {
  return useQuery({
    queryKey: queryKeys.tubings.all,
    queryFn: async () => {
      const res = await apiFetch("/api/tubings");
      if (!res.ok) throw new Error("Failed to load tubings");
      return res.json() as Promise<TubularItem[]>;
    },
    staleTime: Infinity,
    initialData: options?.initialData,
  });
};
