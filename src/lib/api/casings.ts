import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client-fetch";
import { queryKeys } from "@/lib/api/query-keys";
import type { components } from "@/lib/api/schema";

export type TubularItem = components["schemas"]["CasingResponse"];

export const useCasings = (options?: { initialData?: TubularItem[] }) => {
  return useQuery({
    queryKey: queryKeys.casings.all,
    queryFn: async () => {
      const res = await apiFetch("/api/casings");
      if (!res.ok) throw new Error("Failed to load casings");
      return res.json() as Promise<TubularItem[]>;
    },
    staleTime: Infinity,
    initialData: options?.initialData,
  });
};
