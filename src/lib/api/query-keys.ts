import type { ProjectListParams } from "@/interfaces/project";

export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    list: (params: ProjectListParams) => ["projects", "list", params] as const,
    detail: (id: number) => ["projects", "detail", id] as const,
    stats: ["projects", "stats"] as const,
  },
  casings: {
    all: ["casings"] as const,
  },
  tubings: {
    all: ["tubings"] as const,
  },
};
