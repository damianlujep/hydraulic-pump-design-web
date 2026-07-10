"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/Modal";
import { XIcon } from "@/components/icons";
import { ProjectInfoFields } from "@/components/ProjectInfoFields";
import { isErrorResponse } from "@/lib/api/errors";
import { fromNewProjectInfoDto, projectInfoSchema, type ProjectInfoFormValues } from "@/lib/validation/projectInfo";
import { useWorkspace } from "../state/WorkspaceContext";

export const ProjectMetadataModal = ({ onClose }: { onClose: () => void }) => {
  const { state, projectName, visibility, saveProjectInfo, savingProjectInfo } = useWorkspace();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // useForm only reads `defaultValues` once, on mount — lazy-init so this isn't rebuilt every
  // render while the modal stays open (WorkspaceProvider re-renders often: watch()/autosave ticks).
  const [defaultValues] = useState<ProjectInfoFormValues>(() => ({
    name: projectName,
    visibility: visibility ?? "PRIVATE",
    ...fromNewProjectInfoDto(state.newProjectInfo?.data),
  }));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectInfoFormValues>({
    resolver: zodResolver(projectInfoSchema),
    mode: "onTouched",
    defaultValues,
  });

  const onSubmit = async (data: ProjectInfoFormValues) => {
    setErrorMessage(null);
    try {
      await saveProjectInfo(data);
      onClose();
    } catch (err) {
      if (isErrorResponse(err) && err.code === "DUPLICATE_ENTITY") {
        setErrorMessage("Ya existe un proyecto con ese nombre");
      } else if (isErrorResponse(err)) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("No se pudieron guardar los cambios");
      }
    }
  };

  return (
    <Modal onClose={onClose} maxWidthPx={740} zIndex={60} scroll="outer">
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
        <div className="sticky top-0 bg-surface flex items-start justify-between gap-4 p-[20px_24px_16px] border-b border-border">
          <h2 className="m-0 text-[16px] font-bold tracking-[-.01em]">Editar información del proyecto</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-2 border border-border text-text-dim cursor-pointer flex items-center justify-center flex-none hover:text-text hover:border-border-strong"
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="p-[22px_24px]">
          <ProjectInfoFields register={register} errors={errors} />

          {errorMessage && <div className="mt-4 text-danger text-[12px]">{errorMessage}</div>}

          <div className="flex justify-end gap-[10px] mt-[22px]">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-[9px] border border-border bg-surface-2 px-4 py-[9px] text-[12.5px] font-semibold text-text hover:border-border-strong"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingProjectInfo}
              className="cursor-pointer rounded-[9px] bg-primary px-4 py-[9px] text-[12.5px] font-bold text-primary-fg shadow-[0_5px_16px_var(--primary-ring)] hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingProjectInfo ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
