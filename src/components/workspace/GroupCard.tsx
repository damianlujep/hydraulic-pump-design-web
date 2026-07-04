type GroupCardProps = {
  title: string;
  badge?: React.ReactNode;
  bullet?: boolean;
  children: React.ReactNode;
};

export function GroupCard({ title, badge, bullet = false, children }: GroupCardProps) {
  return (
    <div className="rounded-[11px] border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between gap-2 p-[10px_14px] bg-surface-2 border-b border-border">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[.07em] font-semibold text-text-dim">
          {bullet && <span className="w-[6px] h-[6px] rounded-[2px] bg-primary" />}
          {title}
        </div>
        {badge}
      </div>
      <div className="p-[6px]">{children}</div>
    </div>
  );
}
