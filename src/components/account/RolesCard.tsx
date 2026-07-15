"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { roleLabel } from "@/lib/auth/user-display";
import { PERMISSIONS } from "@/lib/auth/rolePermissions";
import { CheckThinIcon, XIcon } from "@/components/icons";
import { cn } from "@/utils/cn";
import { AccountCard, DataRow } from "./AccountCard";

export const RolesCard = () => {
  const { user } = useAuth();
  const role = user?.role ?? null;

  const rolePillLabel = roleLabel(user) || "—";

  return (
    <AccountCard
      title="Roles y permisos"
      headerRight={
        <span className="rounded-full border border-primary-ring bg-primary-soft px-[10px] py-[3px] text-[11px] font-bold text-primary-hover">
          {rolePillLabel}
        </span>
      }
    >
      <DataRow label="Organización" value={user?.organizationName} />
      <div className="grid grid-cols-1 gap-x-6 pb-[14px] pt-[14px] sm:grid-cols-2">
        {PERMISSIONS.map((perm) => {
          const allowed = role ? perm.allowed[role] : false;
          return (
            <div key={perm.label} className="flex items-center gap-[10px] py-[7px]">
              <span
                className={cn(
                  "flex h-[19px] w-[19px] flex-none items-center justify-center rounded-[6px]",
                  allowed ? "bg-green-soft text-green" : "bg-surface-3 text-text-faint",
                )}
              >
                {allowed ? <CheckThinIcon size={11} /> : <XIcon size={11} />}
              </span>
              <span className={cn("text-[12.5px]", allowed ? "text-text" : "text-text-dim")}>
                {perm.label}
              </span>
            </div>
          );
        })}
      </div>
    </AccountCard>
  );
};
