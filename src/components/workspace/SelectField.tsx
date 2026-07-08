import type { SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  widthPx?: number;
  fontSizePx?: number;
};

export const SelectField = ({ widthPx = 150, fontSizePx = 12.5, className = "", style, disabled, ...props }: SelectFieldProps) => {
  return (
    <select
      disabled={disabled}
      className={cn(
        "rounded-[6px] border outline-none focus:border-primary",
        disabled
          ? "bg-surface-2 border-border text-text-faint cursor-not-allowed opacity-70"
          : "bg-surface-3 border-border text-text cursor-pointer",
        className,
      )}
      style={{ width: widthPx, fontSize: fontSizePx, padding: "5px 8px", ...style }}
      {...props}
    />
  );
};
