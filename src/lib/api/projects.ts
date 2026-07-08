import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client-fetch";
import { queryKeys } from "@/lib/api/query-keys";
import type { components } from "@/lib/api/schema";
import type { ProjectListParams } from "@/interfaces/project";

export type ProjectSummaryResponse = components["schemas"]["ProjectSummaryResponse"];
export type ProjectResponse = components["schemas"]["ProjectResponse"];
export type CreateProjectRequest = components["schemas"]["CreateProjectRequest"];
export type ProjectPage = components["schemas"]["PageResponseProjectSummaryResponse"];

export const useProjectList = (params: ProjectListParams) => {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(params.page), size: String(params.size) });
      if (params.sort) query.set("sort", params.sort);
      if (params.q) query.set("q", params.q);
      if (params.scope) query.set("scope", params.scope);
      const res = await apiFetch(`/api/projects?${query}`);
      if (!res.ok) throw new Error("Failed to load projects");
      return res.json() as Promise<ProjectPage>;
    },
    placeholderData: (prev) => prev,
  });
};

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateProjectRequest): Promise<ProjectResponse> => {
      const res = await apiFetch("/api/projects", {
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
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.projects.all }),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const res = await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err: unknown = await res.json().catch(() => ({}));
        throw err;
      }
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.projects.all }),
  });
};
