"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/Modal";
import { PlusIcon, XIcon } from "@/components/icons";
import { ProjectInfoFields } from "@/components/ProjectInfoFields";
import { useCreateProject } from "@/lib/api/projects";
import { isErrorResponse } from "@/lib/api/errors";
import { projectInfoSchema, toNewProjectInfoDto, type ProjectInfoFormValues } from "@/lib/validation/projectInfo";

const EMPTY_VALUES: ProjectInfoFormValues = {
  name: "",
  visibility: "PRIVATE",
  companyName: "",
  oilField: "",
  location: "",
  wellName: "",
  sandType: "",
  date: "",
  analystName: "",
  wellType: "",
  commentaries: "",
};

export const NewProjectModal = () => {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const createProject = useCreateProject();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectInfoFormValues>({
    resolver: zodResolver(projectInfoSchema),
    mode: "onTouched",
    defaultValues: EMPTY_VALUES,
  });

  const onSubmit = (data: ProjectInfoFormValues) => {
    setErrorMessage(null);
    createProject.mutate(
      {
        name: data.name,
        visibility: data.visibility,
        designData: {
          newProjectInfo: { dataEntered: true, data: toNewProjectInfoDto(data.name, data) },
        },
      },
      {
        onSuccess: (created) => {
          setOpen(false);
          if (created.id != null) router.push(`/workspace/${created.id}`);
        },
        onError: (err) => {
          if (isErrorResponse(err) && err.code === "DUPLICATE_ENTITY") {
            setErrorMessage("Ya existe un proyecto con ese nombre");
          } else if (isErrorResponse(err)) {
            setErrorMessage(err.message);
          } else {
            setErrorMessage("No se pudo crear el proyecto");
          }
        },
      },
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-[9px] px-[18px] py-[11px] rounded-[10px] bg-primary text-primary-fg text-[13.5px] font-bold cursor-pointer shadow-[0_5px_16px_var(--primary-ring)] hover:bg-primary-hover"
      >
        <PlusIcon size={17} strokeWidth={2.4} />
        Crear Nuevo Proyecto
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)} maxWidthPx={740} zIndex={50} scroll="outer">
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <div className="sticky top-0 bg-surface flex items-start justify-between gap-4 p-[20px_24px_16px] border-b border-border">
              <div>
                <h2 className="m-0 text-lg font-bold tracking-[-.01em]">Crear Nuevo Proyecto</h2>
                <p className="mt-[5px] text-[12.5px] text-text-dim">Información del proyecto y del pozo de diseño</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-2 border border-border text-text-dim cursor-pointer flex items-center justify-center flex-none hover:text-text hover:border-border-strong"
              >
                <XIcon size={16} />
              </button>
            </div>

            <div className="p-[22px_24px]">
              <ProjectInfoFields register={register} errors={errors} />

              {errorMessage && <div className="mt-4 text-danger text-[12px]">{errorMessage}</div>}

              <div className="flex flex-col items-center gap-3 mt-[26px]">
                <button
                  type="submit"
                  disabled={createProject.isPending}
                  className="w-[240px] p-3 rounded-[10px] bg-primary text-primary-fg text-sm font-bold tracking-[.02em] cursor-pointer shadow-[0_6px_18px_var(--primary-ring)] hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createProject.isPending ? "Creando..." : "Continuar"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-[160px] p-[10px] rounded-[10px] bg-transparent text-danger border border-danger text-[13px] font-semibold cursor-pointer hover:bg-danger hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};
