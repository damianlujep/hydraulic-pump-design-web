"use client";

import { useState } from "react";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";
import { ArrowLeftIcon, ArrowRightIcon, PumpIcon, TrashIcon } from "@/components/icons";
import { useDeleteProject, useProjectList } from "@/lib/api/projects";
import { EmptyPanel } from "@/components/workspace/atoms/EmptyPanel";
import { isErrorResponse } from "@/lib/api/errors";
import { LockStatusBadge } from "./LockStatusBadge";
import { Modal } from "@/components/Modal";
import { useExplorerFilters } from "./useExplorerFilters";

type PendingDelete = { id: number; name: string };

const GRID_COLS = "grid-cols-[minmax(0,2.4fr)_minmax(0,1.2fr)_150px_132px_140px]";
const PAGE_SIZE = 20;

const dateFormatter = new Intl.DateTimeFormat("es", { day: "2-digit", month: "short", year: "numeric" });

export const ProjectsTable = () => {
  const { page, q, setFilters } = useExplorerFilters();
  const goToPage = (nextPage: number) => setFilters({ page: nextPage });

  const { data, isPending, isError, refetch } = useProjectList({
    page,
    size: PAGE_SIZE,
    sort: "-updatedAt",
    scope: "all",
    q,
  });
  const deleteProject = useDeleteProject();
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

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
                        onClick={() => setPendingDelete({ id: projectId, name: project.name ?? "" })}
                        className="w-8 h-8 rounded-lg border border-border text-text-faint flex items-center justify-center cursor-pointer hover:border-danger hover:text-danger"
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                    <Link
                      href={`/workspace/${project.id}`}
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
              onClick={() => goToPage(Math.max(0, page - 1))}
              className="inline-flex items-center gap-[6px] px-3 py-[6px] rounded-lg border border-border text-text-dim text-[12px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-border-strong"
            >
              <ArrowLeftIcon size={13} />
              Anterior
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => goToPage(page + 1)}
              className="inline-flex items-center gap-[6px] px-3 py-[6px] rounded-lg border border-border text-text-dim text-[12px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-border-strong"
            >
              Siguiente
              <ArrowRightIcon size={13} />
            </button>
          </div>
        </div>
      )}

      {pendingDelete && (
        <Modal onClose={() => setPendingDelete(null)} maxWidthPx={400} zIndex={100}>
          <div className="px-[22px] pb-[18px] pt-[22px]" role="alertdialog" aria-labelledby="delete-project-title">
            <div className="flex items-start gap-[14px]">
              <div className="flex h-[44px] w-[44px] flex-none items-center justify-center rounded-[12px] border border-danger-ring bg-danger-soft text-danger">
                <TrashIcon size={20} />
              </div>
              <div className="min-w-0">
                <h2 id="delete-project-title" className="m-0 text-[16px] font-bold tracking-[-0.01em] text-text">
                  ¿Eliminar proyecto?
                </h2>
                <p className="mb-5 mt-3 text-[12.5px] leading-[1.55] text-text-dim">
                  Se eliminará el proyecto <strong className="text-text">{pendingDelete.name}</strong> de forma
                  permanente. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-[10px]">
              <button
                type="button"
                className="cursor-pointer rounded-[9px] border border-border bg-surface-2 px-4 py-[9px] text-[12.5px] font-semibold text-text transition-colors hover:border-border-strong"
                onClick={() => setPendingDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-2 rounded-[9px] border border-danger bg-danger px-4 py-[9px] text-[12.5px] font-bold text-white shadow-[0_5px_16px_var(--danger-ring)] transition-colors hover:border-danger-hover hover:bg-danger-hover"
                onClick={() => {
                  deleteProject.mutate(pendingDelete.id, {
                    onError: (err) => toast.error(isErrorResponse(err) ? err.message : "No se pudo eliminar el proyecto"),
                  });
                  setPendingDelete(null);
                }}
              >
                <TrashIcon size={15} />
                Eliminar proyecto
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
