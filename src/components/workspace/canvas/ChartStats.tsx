type Stat = {
  label: string;
  value: string;
  unit: string;
  color?: string;
};

export const ChartStats = ({ stats }: { stats: Stat[] }) => {
  return (
    <div className="flex gap-[18px] mt-2 pt-[10px] border-t border-border flex-wrap">
      {stats.map((s) => (
        <div key={s.label}>
          <div className="text-[10px] text-text-faint uppercase tracking-[.05em]">{s.label}</div>
          <div className="font-mono text-[13px] font-semibold" style={s.color ? { color: s.color } : undefined}>
            {s.value} <span className="text-[10px] text-text-faint">{s.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
