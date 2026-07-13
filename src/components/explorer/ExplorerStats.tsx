"use client";

import { useProjectStats } from "@/lib/api/projects";
import { StatCard } from "./StatCard";

export const ExplorerStats = () => {
  const { data, isPending } = useProjectStats();

  const totalVisible = data?.totalVisible;
  const percentComplete =
    totalVisible && data?.completedCount != null ? `${Math.round((data.completedCount / totalVisible) * 100)}%` : "—";

  return (
    <>
      <StatCard label="Proyectos activos" value={isPending ? "…" : String(totalVisible ?? "—")} />
      <StatCard label="Proyectos nuevos (mes)" value={isPending ? "…" : String(data?.createdThisMonth ?? "—")} />
      <StatCard
        label="Simulaciones (mes)"
        value="—"
        hint="Pendiente: se habilitará junto con el módulo de Cálculos y reportes PDF"
      />
      <StatCard label="% Diseños completos" value={isPending ? "…" : percentComplete} accent />
    </>
  );
};
