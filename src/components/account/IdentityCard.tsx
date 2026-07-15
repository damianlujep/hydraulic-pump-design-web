"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { avatarGradientStyle, roleLabel, userFullName, userInitials } from "@/lib/auth/user-display";

export const IdentityCard = () => {
  const { user } = useAuth();

  const initials = userInitials(user);
  const fullName = userFullName(user);
  const role = roleLabel(user);

  return (
    <div
      className="flex w-full items-center gap-[20px] rounded-[14px] p-[24px_20px]"
      style={{
        background: "linear-gradient(120deg, var(--primary-soft), transparent 62%), var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <span
        className="flex h-[64px] w-[64px] flex-none items-center justify-center rounded-full text-[22px] font-bold text-primary-fg"
        style={avatarGradientStyle}
      >
        {initials}
      </span>
      <div className="min-w-0">
        <div className="text-[20px] font-bold tracking-[-0.02em] text-text">{fullName}</div>
        <div className="mt-[2px] text-[13px] text-text-dim">
          {role} · {user?.organizationName ?? "—"}
        </div>
        <div className="mt-[3px] font-mono text-[12px] text-text-faint">{user?.email ?? "—"}</div>
      </div>
    </div>
  );
};
