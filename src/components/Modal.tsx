"use client";

import { cn } from "@/utils/cn";

type ModalProps = {
  onClose?: () => void;
  maxWidthPx: number;
  zIndex?: number;
  align?: "center" | "start";
  scroll?: "inner" | "outer";
  sheetBelowMd?: boolean;
  children: React.ReactNode;
};

export const Modal = ({
  onClose,
  maxWidthPx,
  zIndex = 50,
  align = "center",
  scroll = "inner",
  sheetBelowMd = false,
  children,
}: ModalProps) => {
  return (
    <div
      onClick={onClose}
      className={cn(
        "fixed inset-0 flex justify-center animate-fade",
        sheetBelowMd ? "items-end p-0 md:items-center md:p-[28px]" : "p-[28px]",
        !sheetBelowMd && (align === "start" ? "items-start pt-[60px]" : "items-center"),
      )}
      style={{ background: "var(--overlay)", backdropFilter: "blur(4px)", zIndex }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full flex flex-col bg-surface border border-border shadow-app",
          sheetBelowMd
            ? "rounded-t-[24px] rounded-b-none border-b-0 max-h-[94%] animate-slide-up md:rounded-[16px] md:border-b md:max-h-[92%] md:animate-pop-in max-w-none md:max-w-[var(--modal-max-w)]"
            : "rounded-[16px] animate-pop-in",
          scroll === "outer" ? "overflow-y-auto" : "overflow-hidden",
        )}
        style={
          sheetBelowMd
            ? ({ "--modal-max-w": `${maxWidthPx}px` } as React.CSSProperties)
            : { maxWidth: maxWidthPx, maxHeight: "92%" }
        }
      >
        {children}
      </div>
    </div>
  );
};
