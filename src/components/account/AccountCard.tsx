import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type DataRowProps = {
  label: string;
  value?: string | null;
  mono?: boolean;
};

export const DataRow = ({ label, value, mono }: DataRowProps) => (
  <div className="flex items-start justify-between gap-4 border-b border-border py-[11px] last:border-b-0">
    <span className="flex-none text-xs text-text-faint">{label}</span>
    <span className={cn("text-right text-[13px] font-medium text-text", mono && "font-mono text-xs")}>
      {value ?? "—"}
    </span>
  </div>
);

type AccountCardProps = {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
};

export const AccountCard = ({ title, headerRight, children }: AccountCardProps) => (
  <div className="rounded-card border border-border bg-surface">
    <div className="flex items-center justify-between border-b border-border p-[13px_18px]">
      <span className="text-[13px] font-bold text-text">{title}</span>
      {headerRight}
    </div>
    <div className="px-[18px]">{children}</div>
  </div>
);
