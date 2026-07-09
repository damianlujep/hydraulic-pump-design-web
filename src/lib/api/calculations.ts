import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client-fetch";
import type { components } from "@/lib/api/schema";

export type IprCalculationRequest = components["schemas"]["IprCalculationRequest"];
export type IprCalculationResponse = components["schemas"]["IprCalculationResponse"];
export type IprCurvePoint = components["schemas"]["IprCurvePoint"];

export const useCalculateIpr = () => {
  return useMutation({
    mutationFn: async (body: IprCalculationRequest): Promise<IprCalculationResponse> => {
      const res = await apiFetch("/api/calculations/ipr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err: unknown = await res.json().catch(() => ({}));
        throw err;
      }
      return res.json();
    },
  });
};
