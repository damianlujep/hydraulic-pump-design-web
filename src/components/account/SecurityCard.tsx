"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { LockIcon, PencilIcon } from "@/components/icons";
import { AccountCard } from "./AccountCard";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

export const SecurityCard = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <AccountCard title="Seguridad">
      <div className="flex items-center gap-[12px] py-[11px]">
        <div className="flex h-[36px] w-[36px] flex-none items-center justify-center rounded-[9px] bg-surface-3 text-text-faint">
          <LockIcon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-text">Contraseña</div>
          <div className="mt-[1px] font-mono text-[12px] text-text-faint">••••••••••</div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={user?.id == null}
          className="inline-flex cursor-pointer items-center gap-[7px] rounded-[9px] border border-border bg-surface-2 px-[12px] py-[7px] text-[12px] font-semibold text-text hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          <PencilIcon size={13} />
          Cambiar
        </button>
      </div>
      {open && user?.id != null && (
        <ChangePasswordDialog userId={user.id} onClose={() => setOpen(false)} />
      )}
    </AccountCard>
  );
};
