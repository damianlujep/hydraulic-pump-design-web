"use client";

import { useProjectList } from "@/lib/api/projects";
import { StatCard } from "./StatCard";

export const ActiveProjectsStat = () => {
  const { data, isPending } = useProjectList({ page: 0, size: 1, sort: "-updatedAt", scope: "all" });
  return <StatCard label="Proyectos activos" value={isPending ? "…" : String(data?.totalElements ?? 0)} />;
};
