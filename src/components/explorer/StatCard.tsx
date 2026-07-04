type StatCardProps = {
  label: string;
  value: string;
  accent?: boolean;
};

export function StatCard({ label, value, accent = false }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-card p-[15px_16px]">
      <div className="text-[11px] text-text-faint font-semibold tracking-[.03em] uppercase">{label}</div>
      <div className={`mt-[5px] text-[26px] font-bold font-mono tracking-[-.02em] ${accent ? "text-green" : ""}`}>
        {value}
      </div>
    </div>
  );
}
