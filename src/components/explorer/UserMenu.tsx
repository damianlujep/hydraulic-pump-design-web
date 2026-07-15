"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import {
  BellIcon,
  ChevronDownIcon,
  HelpCircleIcon,
  KeyboardIcon,
  LogoutIcon,
  SettingsIcon,
  UserIcon,
} from "@/components/icons";
import { useLogout } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/auth-context";
import { avatarGradientStyle, roleLabel, userInitials, userFullName } from "@/lib/auth/user-display";
import { cn } from "@/utils/cn";

const itemClass =
  "group flex w-full items-center gap-[11px] rounded-[9px] px-[11px] py-[9px] text-left text-[12.5px] font-medium text-text-dim transition-colors hover:bg-surface-2 hover:text-text [&_svg]:flex-none [&_svg]:text-text-faint hover:[&_svg]:text-text-dim";

const sectionLabelClass =
  "px-[11px] pb-1 pt-[9px] text-[9.5px] font-semibold uppercase tracking-[0.11em] text-text-faint";

const Avatar = ({ initials, size, fontSize }: { initials: string; size: number; fontSize: number }) => (
  <span
    className="rounded-full flex items-center justify-center text-primary-fg font-bold flex-none"
    style={{ ...avatarGradientStyle, width: size, height: size, fontSize }}
  >
    {initials}
  </span>
);

type UserMenuProps = {
  /** "full" (avatar+name+role+chevron) for wide headers, "compact" (avatar+chevron) for mobile. */
  variant?: "full" | "compact";
};

export const UserMenu = ({ variant = "full" }: UserMenuProps) => {
  const { user } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEscapeKey(() => {
    setOpen(false);
    setConfirmOpen(false);
  }, open || confirmOpen);

  const initials = userInitials(user);
  const fullName = userFullName(user);
  const subtitle = user ? (user.organizationName ?? roleLabel(user)) : "";

  const closeMenu = () => setOpen(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex cursor-pointer items-center gap-[10px] rounded-[11px] border py-[5px] pl-[5px] transition-colors",
          variant === "compact" ? "pr-[9px]" : "pr-2",
          open ? "border-border bg-surface-2" : "border-transparent bg-transparent hover:border-border hover:bg-surface-2",
        )}
      >
        {variant === "compact" ? (
          <Avatar initials={initials} size={32} fontSize={12} />
        ) : (
          <>
            <Avatar initials={initials} size={34} fontSize={12.5} />
            <span className="text-left leading-[1.25]">
              <span className="block text-[12.5px] font-semibold text-text">{fullName}</span>
              <span className="block text-[10.5px] text-text-faint">{subtitle}</span>
            </span>
          </>
        )}
        <ChevronDownIcon
          size={14}
          className={cn("text-text-faint transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+9px)] z-[90] w-[270px] rounded-[14px] border border-border bg-surface p-[6px] shadow-app animate-menu-pop"
        >
          <div className="flex items-center gap-[12px] rounded-[10px] bg-surface-2 p-[12px]">
            <Avatar initials={initials} size={42} fontSize={15} />
            <div className="min-w-0 leading-[1.3]">
              <div className="text-[13px] font-bold text-text">{fullName}</div>
              <div className="text-[11px] text-text-dim">{subtitle}</div>
              <div className="mt-[2px] font-mono text-[10.5px] text-text-faint">{user?.email}</div>
            </div>
          </div>

          <div className={sectionLabelClass}>Cuenta</div>
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              closeMenu();
              router.push("/account");
            }}
          >
            <UserIcon size={16} />
            Mi perfil
          </button>
          <button type="button" className={itemClass} onClick={closeMenu}>
            <SettingsIcon size={16} />
            Configuración de cuenta
          </button>
          <button type="button" className={itemClass} onClick={closeMenu}>
            <BellIcon size={16} />
            Preferencias de notificación
          </button>

          <div className={sectionLabelClass}>Sistema</div>
          <button type="button" className={itemClass} onClick={closeMenu}>
            <HelpCircleIcon size={16} />
            Ayuda y soporte
          </button>
          <button type="button" className={itemClass} onClick={closeMenu}>
            <KeyboardIcon size={16} />
            Atajos de teclado
            <span className="ml-auto rounded-[5px] border border-border px-[5px] py-px font-mono text-[10px] text-text-faint">
              ⌘K
            </span>
          </button>

          <div className="mx-[8px] my-[5px] h-px bg-border" />

          <button
            type="button"
            className="group flex w-full items-center gap-[11px] rounded-[9px] px-[11px] py-[9px] text-left text-[12.5px] font-medium text-danger transition-colors hover:bg-danger-soft [&_svg]:flex-none [&_svg]:text-danger"
            onClick={() => {
              setOpen(false);
              setConfirmOpen(true);
            }}
          >
            <LogoutIcon size={16} />
            Cerrar sesión
          </button>
        </div>
      )}

      {open && <div className="fixed inset-0 z-[80]" onClick={closeMenu} />}

      {confirmOpen && (
        <Modal onClose={() => setConfirmOpen(false)} maxWidthPx={400} zIndex={100}>
          <div className="px-[22px] pb-[18px] pt-[22px]" role="alertdialog" aria-labelledby="logout-title">
            <div className="flex items-start gap-[14px]">
              <div className="flex h-[44px] w-[44px] flex-none items-center justify-center rounded-[12px] border border-danger-ring bg-danger-soft text-danger">
                <LogoutIcon size={22} />
              </div>
              <div className="min-w-0">
                <h2 id="logout-title" className="m-0 text-[16px] font-bold tracking-[-0.01em] text-text">
                  ¿Cerrar sesión?
                </h2>
                <p className="mb-5 mt-3 text-[12.5px] leading-[1.55] text-text-dim">
                  Se cerrará la sesión de <strong className="text-text">{fullName}</strong>. Los cálculos sin
                  guardar se conservan en la nube, pero deberás volver a iniciar sesión para continuar.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-[10px]">
              <button
                type="button"
                className="cursor-pointer rounded-[9px] border border-border bg-surface-2 px-4 py-[9px] text-[12.5px] font-semibold text-text transition-colors hover:border-border-strong"
                onClick={() => setConfirmOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-2 rounded-[9px] border border-danger bg-danger px-4 py-[9px] text-[12.5px] font-bold text-white shadow-[0_5px_16px_var(--danger-ring)] transition-colors hover:border-danger-hover hover:bg-danger-hover"
                onClick={() => {
                  setConfirmOpen(false);
                  logout.mutate();
                }}
              >
                <LogoutIcon size={15} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
