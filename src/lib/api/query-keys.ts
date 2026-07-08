import type { ProjectListParams } from "@/interfaces/project";

export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    list: (params: ProjectListParams) => ["projects", "list", params] as const,
  },
};
