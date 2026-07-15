import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client-fetch";
import type { components } from "@/lib/api/schema";

type ChangePasswordRequest = components["schemas"]["ChangePasswordRequest"];

export const useChangePassword = (userId: number) =>
  useMutation({
    mutationFn: async (body: ChangePasswordRequest): Promise<void> => {
      const res = await apiFetch(`/api/users/${userId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err: unknown = await res.json().catch(() => ({}));
        throw err;
      }
    },
  });
