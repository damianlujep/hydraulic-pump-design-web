"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { PlusIcon, XIcon } from "@/components/icons";

const TEXT_INPUT_CLASS =
  "p-[9px_12px] bg-surface-2 border border-border rounded-lg text-[13.5px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)]";

export function NewProjectModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

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
          <div className="sticky top-0 bg-surface flex items-start justify-between gap-4 p-[20px_24px_16px] border-b border-border">
            <div>
              <h2 className="m-0 text-lg font-bold tracking-[-.01em]">Crear Nuevo Proyecto</h2>
              <p className="mt-[5px] text-[12.5px] text-text-dim">Información del proyecto y del pozo de diseño</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-lg bg-surface-2 border border-border text-text-dim cursor-pointer flex items-center justify-center flex-none hover:text-text hover:border-border-strong"
            >
              <XIcon size={16} />
            </button>
          </div>

          <div className="p-[22px_24px]">
            <div className="flex flex-col gap-[6px] mb-5">
              <label className="text-[11.5px] font-semibold text-text-dim">Nombre del Proyecto</label>
              <input
                defaultValue="APK-11M2 JET PUMP"
                className="w-full p-[11px_13px] bg-surface-2 border border-border rounded-[9px] text-[15px] font-semibold text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-x-[18px] gap-y-4">
              <div className="flex flex-col gap-[6px]">
                <label className="text-[11.5px] font-semibold text-text-dim">Nombre de la Compañía</label>
                <input defaultValue="PAM EP" className={TEXT_INPUT_CLASS} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[11.5px] font-semibold text-text-dim">Campo Petrolero</label>
                <input defaultValue="APAIKA" className={TEXT_INPUT_CLASS} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[11.5px] font-semibold text-text-dim">Locación</label>
                <input defaultValue="APAIKA & NENKE" className={TEXT_INPUT_CLASS} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[11.5px] font-semibold text-text-dim">Nombre del Pozo</label>
                <input defaultValue="APAIKA-11" className={TEXT_INPUT_CLASS} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[11.5px] font-semibold text-text-dim">Arena o Reservorio</label>
                <input defaultValue="M2" className={TEXT_INPUT_CLASS} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[11.5px] font-semibold text-text-dim">Fecha</label>
                <input type="date" defaultValue="2026-04-25" className={`${TEXT_INPUT_CLASS} font-mono`} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[11.5px] font-semibold text-text-dim">Nombre del Analista</label>
                <input defaultValue="App Tester" className={TEXT_INPUT_CLASS} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[11.5px] font-semibold text-text-dim">Tipo de Pozo</label>
                <select defaultValue="Direccional" className={`${TEXT_INPUT_CLASS} cursor-pointer`}>
                  <option>Direccional</option>
                  <option>Vertical</option>
                  <option>Horizontal</option>
                </select>
              </div>
              <div className="flex flex-col gap-[6px] col-span-2">
                <label className="text-[11.5px] font-semibold text-text-dim">Comentarios</label>
                <textarea
                  defaultValue="Survey Direccional, ajuste Jet Claw 10 L, PIP 1720 de Griffith."
                  className={`${TEXT_INPUT_CLASS} min-h-[74px] resize-y leading-[1.5]`}
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 mt-[26px]">
              <button
                onClick={() => router.push("/workspace?new=1")}
                className="w-[240px] p-3 rounded-[10px] bg-primary text-primary-fg text-sm font-bold tracking-[.02em] cursor-pointer shadow-[0_6px_18px_var(--primary-ring)] hover:bg-primary-hover"
              >
                Continuar
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-[160px] p-[10px] rounded-[10px] bg-transparent text-danger border border-danger text-[13px] font-semibold cursor-pointer hover:bg-danger hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
