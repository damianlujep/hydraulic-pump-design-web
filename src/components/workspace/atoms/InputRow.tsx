import { AlertCircleIcon } from "@/components/icons";
import { cn } from "@/utils/cn";

type InputRowProps = {
  label: string;
  children: React.ReactNode;
  error?: string;
  labelColor?: "dim" | "faint";
};

export const InputRow = ({ label, children, error, labelColor = "dim" }: InputRowProps) => {
  // Both states render the same element tree (label > row-div > span + children) so toggling
  // `error` only adds/removes a trailing sibling — it never changes the input's ancestor chain,
  // which would otherwise make React unmount/remount the input and drop focus mid-type.
  return (
    <label
      className={cn(
        "flex flex-col gap-[5px] p-[6px_10px] rounded-[7px]",
        error ? "bg-danger-soft" : "hover:bg-surface-2",
      )}
    >
      <div className="flex items-center justify-between gap-[14px]">
        <span className={cn("text-[12.5px]", labelColor === "faint" ? "text-text-faint" : "text-text-dim")}>{label}</span>
        {children}
      </div>
      {error && (
        <div className="flex items-center gap-[5px] text-[10.5px] font-semibold text-danger">
          <AlertCircleIcon size={12} />
          {error}
        </div>
      )}
    </label>
  );
};
