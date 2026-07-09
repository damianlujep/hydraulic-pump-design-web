"use client";

import { Modal } from "@/components/Modal";
import { AlertCircleIcon } from "@/components/icons";

type ConflictDialogProps = {
  onReload: () => void;
  onKeepEditing: () => void;
};

export const ConflictDialog = ({ onReload, onKeepEditing }: ConflictDialogProps) => {
  return (
    <Modal onClose={onKeepEditing} maxWidthPx={440} zIndex={100}>
      <div role="alertdialog" aria-labelledby="conflict-title" className="p-[22px_24px]">
        <div className="w-11 h-11 rounded-[12px] border border-danger-ring bg-danger-soft text-danger flex items-center justify-center mb-4">
          <AlertCircleIcon size={20} />
        </div>
        <h2 id="conflict-title" className="m-0 text-[15px] font-bold tracking-[-.01em]">
          Otro usuario guardó cambios en este proyecto
        </h2>
        <p className="mt-[9px] text-[12.5px] text-text-dim leading-[1.5]">
          Alguien más modificó y guardó este proyecto mientras editabas. Si recargas la copia del
          servidor, tus cambios sin guardar en esta sesión se perderán.
        </p>
        <div className="flex items-center justify-end gap-[10px] mt-5">
          <button
            onClick={onKeepEditing}
            className="px-4 py-[9px] rounded-[9px] bg-surface-2 border border-border text-text-dim text-[12.5px] font-semibold cursor-pointer hover:border-border-strong"
          >
            Seguir editando
          </button>
          <button
            onClick={onReload}
            className="px-4 py-[9px] rounded-[9px] bg-danger text-white border-none text-[12.5px] font-bold cursor-pointer shadow-[0_5px_16px_var(--danger-ring)] hover:bg-danger-hover"
          >
            Recargar copia del servidor
          </button>
        </div>
      </div>
    </Modal>
  );
};
