import { AlertCircleIcon } from "@/components/icons";
import { cn } from "@/utils/cn";

type InputRowProps = {
  label: string;
  children: React.ReactNode;
  error?: string;
  labelColor?: "dim" | "faint";
};

export const InputRow = ({ label, children, error, labelColor = "dim" }: InputRowProps) => {
  if (error) {
    return (
      <label className="flex flex-col gap-[5px] p-[6px_10px] rounded-[7px] bg-danger-soft">
        <div className="flex items-center justify-between gap-[14px]">
          <span className="text-[12.5px] text-text-dim">{label}</span>
          {children}
        </div>
        <div className="flex items-center gap-[5px] text-[10.5px] font-semibold text-danger">
          <AlertCircleIcon size={12} />
          {error}
        </div>
      </label>
    );
  }
  return (
    <label className="flex items-center justify-between gap-[14px] p-[6px_10px] rounded-[7px] hover:bg-surface-2">
      <span className={cn("text-[12.5px]", labelColor === "faint" ? "text-text-faint" : "text-text-dim")}>{label}</span>
      {children}
    </label>
  );
};
