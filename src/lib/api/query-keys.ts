export type ProjectListParams = {
  page: number;
  size: number;
  sort?: string;
  q?: string;
  scope?: "own" | "shared" | "org" | "all";
};

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: (params: ProjectListParams) => ["projects", "list", params] as const,
  },
};
