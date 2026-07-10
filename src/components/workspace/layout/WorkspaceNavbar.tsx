"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PencilIcon, PumpIcon, SpinnerIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/explorer/UserMenu";
import { useWorkspace } from "../state/WorkspaceContext";
import { ProjectMetadataModal } from "../modals/ProjectMetadataModal";

const SaveStatusBadge = () => {
  const { state, canEdit } = useWorkspace();

  if (!canEdit) {
    return (
      <span className="inline-flex items-center gap-[7px] text-[11.5px] font-semibold text-amber">
        <span className="w-[7px] h-[7px] rounded-full bg-amber" />
        Solo lectura
      </span>
    );
  }

  switch (state.saveStatus) {
    case "saving":
      return (
        <span className="inline-flex items-center gap-[7px] text-[11.5px] font-semibold text-text-dim">
          <SpinnerIcon size={12} className="animate-spin-fast" />
          Guardando…
        </span>
      );
    case "dirty":
      return (
        <span className="inline-flex items-center gap-[7px] text-[11.5px] font-semibold text-text-dim">
          <span className="w-[7px] h-[7px] rounded-full bg-text-faint" />
          Cambios sin guardar
        </span>
      );
    case "error":
    case "conflict":
      return (
        <span className="inline-flex items-center gap-[7px] text-[11.5px] font-semibold text-danger">
          <span className="w-[7px] h-[7px] rounded-full bg-danger" />
          Error al guardar
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-[7px] text-[11.5px] font-semibold text-green">
          <span className="w-[7px] h-[7px] rounded-full bg-green shadow-[0_0_0_3px_var(--green-soft)]" />
          Guardado en la nube
        </span>
      );
  }
};

export const WorkspaceNavbar = () => {
  const router = useRouter();
  const { state, projectName, isOwner, canEdit } = useWorkspace();
  const [editOpen, setEditOpen] = useState(false);
  const info = state.newProjectInfo?.data;
  const subtitleParts = [
    info?.wellName ? `Pozo Activo: ${info.wellName}` : null,
    info?.sandType ? `Arena ${info.sandType}` : null,
    info?.companyName ?? null,
  ].filter(Boolean);

  return (
    <header className="h-[58px] flex-none flex items-center gap-[15px] px-[22px] bg-surface border-b border-border">
      <button
        onClick={() => router.push("/")}
        className="inline-flex items-center gap-[7px] px-[13px] py-2 rounded-[9px] bg-surface-2 border border-border text-text-dim text-[12.5px] font-semibold cursor-pointer hover:text-text hover:border-border-strong"
      >
        <ArrowLeftIcon size={15} />
        Regresar al Explorador
      </button>
      <div className="w-px h-[26px] bg-border" />
      <div className="flex items-center gap-[11px]">
        <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary flex-none">
          <PumpIcon size={16} strokeWidth={1.9} />
        </div>
        <div className="leading-[1.3]">
          <div className="flex items-center gap-[7px]">
            <div className="text-sm font-bold tracking-[-.01em]">{projectName}</div>
            {isOwner && canEdit && (
              <button
                title="Editar información del proyecto"
                aria-label="Editar información del proyecto"
                onClick={() => setEditOpen(true)}
                className="text-text-faint cursor-pointer hover:text-text"
              >
                <PencilIcon size={13} />
              </button>
            )}
          </div>
          {subtitleParts.length > 0 && (
            <div className="text-[11px] text-text-dim font-mono">{subtitleParts.join(" · ")}</div>
          )}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <SaveStatusBadge />
        <div className="w-px h-6 bg-border" />
        <ThemeToggle />
        <div className="w-px h-6 bg-border" />
        <UserMenu />
      </div>
      {editOpen && <ProjectMetadataModal onClose={() => setEditOpen(false)} />}
    </header>
  );
};
