export type ProjectListParams = {
  page: number;
  size: number;
  sort?: string;
  q?: string;
  scope?: "own" | "shared" | "org" | "all";
};
