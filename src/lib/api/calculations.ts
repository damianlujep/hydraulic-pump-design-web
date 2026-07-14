import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client-fetch";
import type { components } from "@/lib/api/schema";

export type IprCalculationRequest = components["schemas"]["IprCalculationRequest"];
export type IprCalculationResponse = components["schemas"]["IprCalculationResponse"];
export type IprCurvePoint = components["schemas"]["IprCurvePoint"];

export type TvdInterpolationRequest = components["schemas"]["TvdInterpolationRequest"];
export type TvdInterpolationResponse = components["schemas"]["TvdInterpolationResponse"];

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

export const useInterpolateTvd = () => {
  return useMutation({
    mutationFn: async (body: TvdInterpolationRequest): Promise<TvdInterpolationResponse> => {
      const res = await apiFetch("/api/calculations/directional-survey/interpolate-tvd", {
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
