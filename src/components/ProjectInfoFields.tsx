"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { ProjectInfoFormValues } from "@/lib/validation/projectInfo";

const TEXT_INPUT_CLASS =
  "w-full p-[9px_12px] bg-surface-2 border border-border rounded-lg text-[13.5px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)]";

const FieldError = ({ message }: { message?: string }) =>
  message ? <span className="mt-[4px] block text-[11px] text-danger">{message}</span> : null;

type ProjectInfoFieldsProps = {
  register: UseFormRegister<ProjectInfoFormValues>;
  errors: FieldErrors<ProjectInfoFormValues>;
};

export const ProjectInfoFields = ({ register, errors }: ProjectInfoFieldsProps) => {
  return (
    <>
      <div className="flex flex-col gap-[6px] mb-5">
        <label className="text-[11.5px] font-semibold text-text-dim">Nombre del Proyecto</label>
        <input
          {...register("name")}
          className="w-full p-[11px_13px] bg-surface-2 border border-border rounded-[9px] text-[15px] font-semibold text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)]"
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="flex flex-col gap-[6px] mb-5">
        <label className="text-[11.5px] font-semibold text-text-dim">Visibilidad</label>
        <select {...register("visibility")} className={`${TEXT_INPUT_CLASS} cursor-pointer`}>
          <option value="PRIVATE">Privado</option>
          <option value="ORGANIZATION">Organización</option>
        </select>
        <FieldError message={errors.visibility?.message} />
      </div>

      <div className="grid grid-cols-2 gap-x-[18px] gap-y-4">
        <div className="flex flex-col gap-[6px]">
          <label className="text-[11.5px] font-semibold text-text-dim">Nombre de la Compañía</label>
          <input {...register("companyName")} className={TEXT_INPUT_CLASS} />
          <FieldError message={errors.companyName?.message} />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className="text-[11.5px] font-semibold text-text-dim">Campo Petrolero</label>
          <input {...register("oilField")} className={TEXT_INPUT_CLASS} />
          <FieldError message={errors.oilField?.message} />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className="text-[11.5px] font-semibold text-text-dim">Locación</label>
          <input {...register("location")} className={TEXT_INPUT_CLASS} />
          <FieldError message={errors.location?.message} />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className="text-[11.5px] font-semibold text-text-dim">Nombre del Pozo</label>
          <input {...register("wellName")} className={TEXT_INPUT_CLASS} />
          <FieldError message={errors.wellName?.message} />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className="text-[11.5px] font-semibold text-text-dim">Arena o Reservorio</label>
          <input {...register("sandType")} className={TEXT_INPUT_CLASS} />
          <FieldError message={errors.sandType?.message} />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className="text-[11.5px] font-semibold text-text-dim">Fecha</label>
          <input type="date" {...register("date")} className={`${TEXT_INPUT_CLASS} font-mono`} />
          <FieldError message={errors.date?.message} />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className="text-[11.5px] font-semibold text-text-dim">Nombre del Analista</label>
          <input {...register("analystName")} className={TEXT_INPUT_CLASS} />
          <FieldError message={errors.analystName?.message} />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className="text-[11.5px] font-semibold text-text-dim">Tipo de Pozo</label>
          <select {...register("wellType")} className={`${TEXT_INPUT_CLASS} cursor-pointer`}>
            <option value="" disabled hidden>
              Selecciona…
            </option>
            <option value="Direccional">Direccional</option>
            <option value="Vertical">Vertical</option>
            <option value="Horizontal">Horizontal</option>
          </select>
          <FieldError message={errors.wellType?.message} />
        </div>
        <div className="flex flex-col gap-[6px] col-span-2">
          <label className="text-[11.5px] font-semibold text-text-dim">Comentarios</label>
          <textarea
            {...register("commentaries")}
            className={`${TEXT_INPUT_CLASS} min-h-[74px] resize-y leading-[1.5]`}
          />
          <FieldError message={errors.commentaries?.message} />
        </div>
      </div>
    </>
  );
};
