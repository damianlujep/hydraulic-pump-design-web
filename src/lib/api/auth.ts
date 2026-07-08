import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-context";
import type { User } from "@/interfaces/user";
import type { components } from "@/lib/api/schema";

export type LoginRequest = components["schemas"]["LoginRequest"];

export const useLogin = () => {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: async (body: LoginRequest): Promise<{ user?: User }> => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err: unknown = await res.json().catch(() => ({}));
        if (res.status === 429) {
          const retryAfter = Number(res.headers.get("Retry-After"));
          throw {
            ...(typeof err === "object" && err !== null ? err : {}),
            status: 429,
            retryAfterSeconds: Number.isFinite(retryAfter) ? retryAfter : undefined,
          };
        }
        throw err;
      }
      return res.json();
    },
    onSuccess: ({ user }) => {
      setUser(user ?? null);
    },
  });
};

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    onSettled: () => {
      qc.clear();
      window.location.replace("/login");
    },
  });
};
