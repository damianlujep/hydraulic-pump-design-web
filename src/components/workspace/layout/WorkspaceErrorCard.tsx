"use client";

import Link from "next/link";
import { AlertCircleIcon, ArrowLeftIcon } from "@/components/icons";

type WorkspaceErrorCardProps = {
  title: string;
  message: string;
  onRetry?: () => void;
};

export const WorkspaceErrorCard = ({ title, message, onRetry }: WorkspaceErrorCardProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <div className="w-14 h-14 rounded-[16px] border border-danger-ring bg-danger-soft text-danger flex items-center justify-center">
        <AlertCircleIcon size={26} />
      </div>
      <div className="max-w-[380px]">
        <div className="text-[15px] font-bold tracking-[-.01em]">{title}</div>
        <div className="mt-[7px] text-[13px] text-text-dim leading-[1.5]">{message}</div>
      </div>
      <div className="flex items-center gap-[10px] mt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-[10px] rounded-[9px] bg-primary text-primary-fg border-none text-[13px] font-semibold cursor-pointer hover:bg-primary-hover"
          >
            Reintentar
          </button>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-[7px] px-4 py-[10px] rounded-[9px] bg-surface-2 border border-border text-text-dim text-[13px] font-semibold hover:text-text hover:border-border-strong"
        >
          <ArrowLeftIcon size={15} />
          Regresar al Explorador
        </Link>
      </div>
    </div>
  );
};
