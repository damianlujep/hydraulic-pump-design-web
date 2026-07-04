import { LineChartIcon, PencilIcon } from "@/components/icons";

type EmptyPanelProps = {
  title: string;
  message: string;
  cta: string;
  onCta?: () => void;
};

export function EmptyPanel({ title, message, cta, onCta }: EmptyPanelProps) {
  return (
    <div
      className="h-[300px] flex flex-col items-center justify-center gap-[13px] rounded-[10px] border-[1.5px] border-dashed border-border"
      style={{ background: "repeating-linear-gradient(45deg, var(--surface) 0 9px, var(--surface-2) 9px 10px)" }}
    >
      <div className="w-12 h-12 rounded-[13px] bg-surface border border-border flex items-center justify-center text-text-faint">
        <LineChartIcon size={22} />
      </div>
      <div className="text-center max-w-[300px]">
        <div className="text-[13.5px] font-semibold text-text-dim">{title}</div>
        <div className="mt-1 text-[11.5px] text-text-faint leading-[1.45]">{message}</div>
      </div>
      <button
        onClick={onCta}
        className="inline-flex items-center gap-[7px] px-[15px] py-[8px] rounded-[9px] bg-primary text-primary-fg text-[12px] font-semibold shadow-[0_4px_12px_var(--primary-ring)] cursor-pointer hover:bg-primary-hover"
      >
        <PencilIcon size={14} />
        {cta}
      </button>
    </div>
  );
}
