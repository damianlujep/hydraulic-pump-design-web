"use client";

import { useState } from "react";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import { ArrowLeftIcon, ArrowRightIcon, PumpIcon, TrashIcon } from "@/components/icons";
import { useDeleteProject, useProjectList } from "@/lib/api/projects";
import { EmptyPanel } from "@/components/workspace/EmptyPanel";
import { LockStatusBadge } from "./LockStatusBadge";

const GRID_COLS = "grid-cols-[minmax(0,2.4fr)_minmax(0,1.2fr)_150px_132px_140px]";
const PAGE_SIZE = 20;

const dateFormatter = new Intl.DateTimeFormat("es", { day: "2-digit", month: "short", year: "numeric" });

export const ProjectsTable = () => {
  const [page, setPage] = useState(0);
  const { data, isPending, isError, refetch } = useProjectList({
    page,
    size: PAGE_SIZE,
    sort: "-updatedAt",
    scope: "all",
  });
  const deleteProject = useDeleteProject();

  const projects = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden">
      <div className="text-[13px]">
        <div className={`grid ${GRID_COLS} bg-surface-2`}>
          <div className="p-[11px_16px] text-[10.5px] tracking-[.06em] uppercase text-text-faint font-semibold">
            Nombre del Proyecto
          </div>
          <div className="p-[11px_16px] text-[10.5px] tracking-[.06em] uppercase text-text-faint font-semibold">
            Visibilidad
          </div>
          <div className="p-[11px_16px] text-[10.5px] tracking-[.06em] uppercase text-text-faint font-semibold">
            Estado
          </div>
          <div className="p-[11px_16px] text-[10.5px] tracking-[.06em] uppercase text-text-faint font-semibold">
            Última Modificación
          </div>
          <div className="p-[11px_16px]" />
        </div>

        {isPending &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`grid ${GRID_COLS} items-center border-t border-border`}>
              <div className="p-[13px_16px]">
                <div className="flex items-center gap-3">
                  <Skeleton
                    circle
                    width={34}
                    height={34}
                    baseColor="var(--surface-2)"
                    highlightColor="var(--surface-3)"
                  />
                  <div className="min-w-0 flex-1">
                    <Skeleton
                      width="70%"
                      height={13}
                      baseColor="var(--surface-2)"
                      highlightColor="var(--surface-3)"
                    />
                    <Skeleton
                      width="45%"
                      height={11}
                      baseColor="var(--surface-2)"
                      highlightColor="var(--surface-3)"
                    />
                  </div>
                </div>
              </div>
              <div className="p-[13px_16px]">
                <Skeleton width="60%" height={13} baseColor="var(--surface-2)" highlightColor="var(--surface-3)" />
              </div>
              <div className="p-[13px_16px]">
                <Skeleton
                  width={96}
                  height={20}
                  borderRadius={999}
                  baseColor="var(--surface-2)"
                  highlightColor="var(--surface-3)"
                />
              </div>
              <div className="p-[13px_16px]">
                <Skeleton width={64} height={13} baseColor="var(--surface-2)" highlightColor="var(--surface-3)" />
              </div>
              <div className="p-[13px_16px]" />
            </div>
          ))}

        {!isPending &&
          (isError ? (
            <div className="border-t border-border p-6">
              <EmptyPanel
                title="No se pudieron cargar los proyectos"
                message="Ocurrió un error al comunicarse con el servidor."
                cta="Reintentar"
                onCta={() => void refetch()}
              />
            </div>
          ) : projects.length === 0 ? (
            <div className="border-t border-border p-6">
              <EmptyPanel
                title="Aún no hay proyectos"
                message="Crea un nuevo proyecto para comenzar a diseñar tu sistema de bombeo."
                cta="Crear proyecto"
              />
            </div>
          ) : (
            projects.map((project) => {
              if (project.id == null) return null;
              const projectId = project.id;
              return (
                <div
                  key={project.id}
                  className={`grid ${GRID_COLS} items-center border-t border-border hover:bg-surface-2`}
                >
                  <div className="p-[13px_16px]">
                    <div className="flex items-center gap-3">
                      <div className="w-[34px] h-[34px] rounded-lg bg-surface-3 border border-border flex items-center justify-center text-primary flex-none">
                        <PumpIcon size={16} strokeWidth={1.9} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[13px] tracking-[-.01em]">{project.name}</div>
                        <div className="text-[11px] text-text-faint font-mono mt-px">{project.ownerName}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-[13px_16px] text-text-dim text-[12.5px]">
                    {project.visibility === "ORGANIZATION" ? "Organización" : "Privado"}
                  </div>
                  <div className="p-[13px_16px]">
                    <LockStatusBadge lockedBy={project.lockedByName} />
                  </div>
                  <div className="p-[13px_16px] text-text-dim text-xs font-mono">
                    {project.updatedAt ? dateFormatter.format(new Date(project.updatedAt)) : "—"}
                  </div>
                  <div className="p-[13px_16px] flex items-center justify-end gap-2">
                    {project.myPermission === "OWNER" && (
                      <button
                        title="Eliminar proyecto"
                        onClick={() => {
                          if (window.confirm(`¿Eliminar el proyecto "${project.name}"?`)) {
                            deleteProject.mutate(projectId);
                          }
                        }}
                        className="w-8 h-8 rounded-lg border border-border text-text-faint flex items-center justify-center cursor-pointer hover:border-danger hover:text-danger"
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                    <Link
                      href={`/workspace?projectId=${project.id}`}
                      className="inline-flex items-center gap-[6px] px-[15px] py-[7px] rounded-lg border border-border-strong text-text text-[12.5px] font-semibold hover:border-primary hover:text-primary hover:bg-primary-soft"
                    >
                      Abrir
                      <ArrowRightIcon size={14} />
                    </Link>
                  </div>
                </div>
              );
            })
          ))}
      </div>

      {!isPending && !isError && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border p-[11px_16px] text-[12px] text-text-dim">
          <span>
            Página {page + 1} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex items-center gap-[6px] px-3 py-[6px] rounded-lg border border-border text-text-dim text-[12px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-border-strong"
            >
              <ArrowLeftIcon size={13} />
              Anterior
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-[6px] px-3 py-[6px] rounded-lg border border-border text-text-dim text-[12px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-border-strong"
            >
              Siguiente
              <ArrowRightIcon size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
