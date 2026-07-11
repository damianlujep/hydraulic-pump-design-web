import { cn } from "@/utils/cn";

type StatCardProps = {
  label: string;
  value: string;
  accent?: boolean;
  hint?: string;
};

export const StatCard = ({ label, value, accent = false, hint }: StatCardProps) => {
  return (
    <div className="bg-surface border border-border rounded-card p-[15px_16px]" title={hint}>
      <div className="text-[11px] text-text-faint font-semibold tracking-[.03em] uppercase">{label}</div>
      <div className={cn("mt-[5px] text-[26px] font-bold font-mono tracking-[-.02em]", accent && "text-green")}>
        {value}
      </div>
    </div>
  );
};
