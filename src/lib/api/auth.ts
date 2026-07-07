import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client-fetch";
import { queryKeys } from "@/lib/api/query-keys";
import type { components } from "@/lib/api/schema";

export type UserResponse = components["schemas"]["UserResponse"];
export type LoginRequest = components["schemas"]["LoginRequest"];

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const res = await apiFetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to load current user");
      return res.json() as Promise<UserResponse>;
    },
    staleTime: Infinity,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: LoginRequest): Promise<{ user: UserResponse }> => {
      const res = await fetch("/api/auth/login", {
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
    onSuccess: ({ user }) => {
      qc.setQueryData(queryKeys.auth.me, user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    onSettled: () => {
      qc.clear();
      window.location.href = "/login";
    },
  });
}
