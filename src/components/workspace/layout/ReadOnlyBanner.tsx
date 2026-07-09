"use client";

import { LockIcon } from "@/components/icons";
import type { LockView } from "@/interfaces/workspace";

export const ReadOnlyBanner = ({ lock, onRetry }: { lock: LockView; onRetry: () => void }) => {
  if (lock.status === "acquiring" || lock.status === "mine") return null;

  const message =
    lock.status === "no-permission"
      ? "Tienes acceso de solo lectura a este proyecto."
      : lock.status === "held-by-other"
        ? `${lock.holderName} está editando este proyecto — modo solo lectura.`
        : "No se pudo obtener el bloqueo de edición.";

  const showRetry = lock.status === "held-by-other" || lock.status === "error";

  return (
    <div className="flex items-center gap-[10px] px-[22px] py-[10px] bg-amber-soft border-b border-border text-amber text-[12.5px] font-semibold">
      <LockIcon size={14} />
      {message}
      {showRetry && (
        <button
          onClick={onRetry}
          className="ml-auto px-3 py-[5px] rounded-[7px] bg-transparent border border-amber text-amber text-[11.5px] font-semibold cursor-pointer hover:bg-surface-2"
        >
          Reintentar
        </button>
      )}
    </div>
  );
};
