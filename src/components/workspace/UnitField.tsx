import type { InputHTMLAttributes } from "react";

type UnitFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  unit: string;
  error?: boolean;
  widthPx?: number;
};

export function UnitField({ unit, error = false, widthPx = 150, className = "", style, ...props }: UnitFieldProps) {
  return (
    <span
      className={`inline-flex items-center flex-none rounded-[6px] overflow-hidden border bg-surface-3 focus-within:border-primary focus-within:shadow-[0_0_0_2px_var(--primary-ring)] ${
        error ? "border-danger shadow-[0_0_0_2px_var(--danger-ring)]" : "border-border"
      } ${className}`}
      style={{ width: widthPx, ...style }}
    >
      <input
        className="flex-1 min-w-0 bg-transparent border-none outline-none pl-[10px] py-[5px] text-left font-mono text-[13px] font-medium text-text"
        {...props}
      />
      <span className="self-stretch flex items-center flex-none px-[10px] bg-surface-2 border-l border-border text-[10.5px] font-mono text-text-faint whitespace-nowrap pointer-events-none">
        {unit}
      </span>
    </span>
  );
}
