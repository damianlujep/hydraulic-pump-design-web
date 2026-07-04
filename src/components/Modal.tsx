"use client";

type ModalProps = {
  onClose?: () => void;
  maxWidthPx: number;
  zIndex?: number;
  align?: "center" | "start";
  scroll?: "inner" | "outer";
  children: React.ReactNode;
};

export function Modal({
  onClose,
  maxWidthPx,
  zIndex = 50,
  align = "center",
  scroll = "inner",
  children,
}: ModalProps) {
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 flex justify-center p-[28px] animate-fade ${
        align === "start" ? "items-start pt-[60px]" : "items-center"
      }`}
      style={{ background: "rgba(5,8,13,.62)", backdropFilter: "blur(4px)", zIndex }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full flex flex-col bg-surface border border-border rounded-[16px] shadow-app animate-pop-in ${
          scroll === "outer" ? "overflow-y-auto" : "overflow-hidden"
        }`}
        style={{ maxWidth: maxWidthPx, maxHeight: "92%" }}
      >
        {children}
      </div>
    </div>
  );
}
