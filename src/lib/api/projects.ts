import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client-fetch";
import { queryKeys } from "@/lib/api/query-keys";
import type { components } from "@/lib/api/schema";
import type { ProjectListParams } from "@/interfaces/project";

export type ProjectSummaryResponse = components["schemas"]["ProjectSummaryResponse"];
export type ProjectResponse = components["schemas"]["ProjectResponse"];
export type CreateProjectRequest = components["schemas"]["CreateProjectRequest"];
export type ProjectPage = components["schemas"]["PageResponseProjectSummaryResponse"];
export type DesignDataDto = components["schemas"]["DesignDataDto"];
export type UpdateDesignDataRequest = components["schemas"]["UpdateDesignDataRequest"];
export type LockStatusResponse = components["schemas"]["LockStatusResponse"];
export type UpdateProjectMetadataRequest = components["schemas"]["UpdateProjectMetadataRequest"];
export type NewProjectInfoDto = components["schemas"]["NewProjectInfoDto"];
export type ProjectStatsResponse = components["schemas"]["ProjectStatsResponse"];
export type ProjectMemberResponse = components["schemas"]["ProjectMemberResponse"];
export type AddProjectMemberRequest = components["schemas"]["AddProjectMemberRequest"];
export type ProjectMemberRole = AddProjectMemberRequest["role"];

export const useProjectStats = () => {
  return useQuery({
    queryKey: queryKeys.projects.stats,
    queryFn: async () => {
      const res = await apiFetch("/api/projects/stats");
      if (!res.ok) throw new Error("Failed to load project stats");
      return res.json() as Promise<ProjectStatsResponse>;
    },
  });
};

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

export const useProject = (id: number, options?: { initialData?: ProjectResponse }) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: async () => {
      const res = await apiFetch(`/api/projects/${id}`);
      if (!res.ok) {
        const err: unknown = await res.json().catch(() => ({}));
        throw err;
      }
      return res.json() as Promise<ProjectResponse>;
    },
    initialData: options?.initialData,
  });
};

export const useSaveDesignData = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateDesignDataRequest): Promise<ProjectResponse> => {
      const res = await apiFetch(`/api/projects/${id}/design-data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err: unknown = await res.json().catch(() => ({}));
        throw err;
      }
      return res.json();
    },
    onSuccess: (fresh) => {
      qc.setQueryData(queryKeys.projects.detail(id), fresh);
      void qc.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
};

export const useUpdateProjectMetadata = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateProjectMetadataRequest): Promise<ProjectResponse> => {
      const res = await apiFetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err: unknown = await res.json().catch(() => ({}));
        throw err;
      }
      return res.json();
    },
    onSuccess: (fresh) => {
      // Seed the detail cache directly (it's already fresh) and only invalidate the list —
      // invalidating `projects.all` would immediately re-fetch the detail entry we just set.
      qc.setQueryData(queryKeys.projects.detail(id), fresh);
      void qc.invalidateQueries({ queryKey: ["projects", "list"] });
    },
  });
};

// Lock endpoints are imperative lifecycle calls (acquire on mount, heartbeat on an interval,
// release on unmount/pagehide) rather than TanStack queries/mutations.
export const acquireProjectLock = async (
  id: number,
): Promise<{ ok: boolean; body: LockStatusResponse | unknown }> => {
  const res = await apiFetch(`/api/projects/${id}/lock`, { method: "POST" });
  const body: unknown = await res.json().catch(() => ({}));
  return { ok: res.ok, body };
};

export const heartbeatProjectLock = async (
  id: number,
): Promise<{ ok: boolean; body: LockStatusResponse | unknown }> => {
  const res = await apiFetch(`/api/projects/${id}/lock`, { method: "PUT" });
  const body: unknown = await res.json().catch(() => ({}));
  return { ok: res.ok, body };
};

// Fire-and-forget: raw `fetch` with `keepalive` (not `apiFetch`) so release survives page unload
// and doesn't get caught up in the 401-refresh dance.
export const releaseProjectLock = (id: number): void => {
  void fetch(`/api/projects/${id}/lock`, { method: "DELETE", keepalive: true });
};

export const useProjectMembers = (id: number) => {
  return useQuery({
    queryKey: queryKeys.projects.members(id),
    queryFn: async () => {
      const res = await apiFetch(`/api/projects/${id}/members`);
      if (!res.ok) {
        const err: unknown = await res.json().catch(() => ({}));
        throw err;
      }
      return res.json() as Promise<ProjectMemberResponse[]>;
    },
  });
};

export const useAddProjectMember = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: AddProjectMemberRequest): Promise<ProjectMemberResponse> => {
      const res = await apiFetch(`/api/projects/${id}/members`, {
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
    // The POST returns the fresh grant (add and role-change alike) — upsert it into the cache
    // directly instead of refetching the list, same precedent as useSaveDesignData.
    onSuccess: (fresh) =>
      qc.setQueryData<ProjectMemberResponse[]>(queryKeys.projects.members(id), (prev) =>
        prev?.some((m) => m.userId === fresh.userId)
          ? prev.map((m) => (m.userId === fresh.userId ? fresh : m))
          : [...(prev ?? []), fresh],
      ),
  });
};

export const useRemoveProjectMember = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number): Promise<void> => {
      const res = await apiFetch(`/api/projects/${id}/members/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const err: unknown = await res.json().catch(() => ({}));
        throw err;
      }
    },
    onSuccess: (_data, userId) =>
      qc.setQueryData<ProjectMemberResponse[]>(queryKeys.projects.members(id), (prev) =>
        prev?.filter((m) => m.userId !== userId),
      ),
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
