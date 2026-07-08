"use client";

import { cn } from "@/utils/cn";

type ModalProps = {
  onClose?: () => void;
  maxWidthPx: number;
  zIndex?: number;
  align?: "center" | "start";
  scroll?: "inner" | "outer";
  children: React.ReactNode;
};

export const Modal = ({
  onClose,
  maxWidthPx,
  zIndex = 50,
  align = "center",
  scroll = "inner",
  children,
}: ModalProps) => {
  return (
    <div
      onClick={onClose}
      className={cn(
        "fixed inset-0 flex justify-center p-[28px] animate-fade",
        align === "start" ? "items-start pt-[60px]" : "items-center",
      )}
      style={{ background: "var(--overlay)", backdropFilter: "blur(4px)", zIndex }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full flex flex-col bg-surface border border-border rounded-[16px] shadow-app animate-pop-in",
          scroll === "outer" ? "overflow-y-auto" : "overflow-hidden",
        )}
        style={{ maxWidth: maxWidthPx, maxHeight: "92%" }}
      >
        {children}
      </div>
    </div>
  );
};
