"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/Modal";
import {
  AlertCircleIcon,
  CheckIcon,
  CheckThinIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  ShieldIcon,
  SpinnerIcon,
  XIcon,
} from "@/components/icons";
import { useChangePassword } from "@/lib/api/users";
import { isErrorResponse } from "@/lib/api/errors";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { cn } from "@/utils/cn";
import { changePasswordSchema, type ChangePasswordFormValues } from "./changePasswordSchema";
import { computePasswordStrength } from "./passwordStrength";

type PasswordFieldKey = "current" | "new" | "confirm";

type PasswordFieldProps = {
  label: string;
  registration: UseFormRegisterReturn;
  show: boolean;
  onToggleShow: () => void;
  error?: boolean;
  errorText?: string;
  autoComplete?: string;
};

const PasswordField = ({ label, registration, show, onToggleShow, error, errorText, autoComplete }: PasswordFieldProps) => (
  <div className="flex flex-col gap-[6px]">
    <label className="text-[12px] font-semibold text-text-dim">{label}</label>
    <div
      className={cn(
        "flex items-center bg-surface-3 border rounded-[8px] max-md:rounded-[11px] max-md:min-h-[50px] transition-[border-color,box-shadow] duration-150",
        error
          ? "border-danger shadow-[0_0_0_2px_var(--danger-ring)]"
          : "border-border focus-within:border-primary focus-within:shadow-[0_0_0_2px_var(--primary-ring)]",
      )}
    >
      <input
        {...registration}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        inputMode="text"
        className="flex-1 bg-transparent px-[12px] py-[10px] font-mono text-[13px] max-md:text-[15px] text-text outline-none"
      />
      <button
        type="button"
        onClick={onToggleShow}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="flex-none self-stretch flex items-center px-[10px] text-text-faint hover:text-text-dim cursor-pointer"
      >
        {show ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
      </button>
    </div>
    {errorText && (
      <div role="alert" className="flex items-center gap-[5px] text-[11.5px] text-danger">
        <AlertCircleIcon size={12} className="flex-none" />
        {errorText}
      </div>
    )}
  </div>
);

type Props = {
  userId: number;
  onClose: () => void;
};

export const ChangePasswordDialog = ({ userId, onClose }: Props) => {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
  });

  const [visible, setVisible] = useState<Record<PasswordFieldKey, boolean>>({
    current: false,
    new: false,
    confirm: false,
  });
  const toggleVisible = (key: PasswordFieldKey) =>
    setVisible((v) => ({ ...v, [key]: !v[key] }));

  const mutation = useChangePassword(userId);

  const [newPassword, confirmPassword] = form.watch(["newPassword", "confirmPassword"]);
  const strength = computePasswordStrength(newPassword ?? "");
  const confirmEntered = (confirmPassword?.length ?? 0) > 0;
  const passwordsEqual = confirmEntered && newPassword === confirmPassword;
  const mismatch = confirmEntered && !passwordsEqual;

  const { errors, touchedFields } = form.formState;
  const currentPwError = touchedFields.currentPassword ? errors.currentPassword?.message : undefined;

  useEscapeKey(onClose);

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await mutation.mutateAsync({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success("Contraseña actualizada");
      onClose();
    } catch (err: unknown) {
      if (isErrorResponse(err) && err.code === "INVALID_CURRENT_PASSWORD") {
        form.setError("currentPassword", {
          type: "server",
          message: "La contraseña actual es incorrecta.",
        });
      } else {
        toast.error(isErrorResponse(err) ? err.message : "Error al actualizar la contraseña.");
      }
    }
  };

  const requirements = [
    { ok: strength.reqLen, text: "Mínimo 8 caracteres" },
    { ok: strength.reqUp, text: "Una mayúscula" },
    { ok: strength.reqNum, text: "Un número" },
    { ok: strength.reqSym, text: "Un símbolo" },
  ];

  return (
    <Modal maxWidthPx={470} zIndex={70} sheetBelowMd>
      {/* Mobile sheet chrome */}
      <div className="md:hidden flex-none flex flex-col">
        <div className="mx-auto mt-3 mb-2 w-10 h-1 rounded-full bg-border" />
        <div className="flex items-center px-4 pb-3">
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] text-text-faint hover:text-text cursor-pointer"
          >
            Cancelar
          </button>
          <span className="flex-1 text-center text-[14px] font-bold text-text">
            Cambiar contraseña
          </span>
          <span className="w-[56px]" />
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden md:flex items-start gap-[16px] p-[20px_20px_16px]">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-primary-soft border border-primary-ring flex items-center justify-center text-primary flex-none">
          <LockIcon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-text">Cambiar contraseña</div>
          <div className="text-[12.5px] text-text-dim mt-[3px] leading-[1.4]">
            Elige una contraseña nueva y robusta que no hayas usado antes.
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-text-faint hover:text-text flex-none mt-[-2px] cursor-pointer"
        >
          <XIcon size={18} />
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        noValidate
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="flex-1 overflow-y-auto p-[4px_20px_20px]">
          <div className="flex flex-col gap-[16px]">
            {/* Current password */}
            <PasswordField
              label="Contraseña actual"
              registration={form.register("currentPassword")}
              show={visible.current}
              onToggleShow={() => toggleVisible("current")}
              error={!!currentPwError}
              errorText={currentPwError}
              autoComplete="current-password"
            />

            {/* New password + strength meter */}
            <div className="flex flex-col gap-[8px]">
              <PasswordField
                label="Nueva contraseña"
                registration={form.register("newPassword")}
                show={visible.new}
                onToggleShow={() => toggleVisible("new")}
                autoComplete="new-password"
              />

              <div className="h-[5px] w-full bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width,background] duration-200"
                  style={{ width: `${strength.fillPercent}%`, background: strength.colorVar }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-text-faint">Seguridad de la contraseña</span>
                {strength.label && (
                  <span className="text-[11px] font-semibold" style={{ color: strength.colorVar }}>
                    {strength.label}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-[6px]">
                {requirements.map(({ ok, text }) => (
                  <div key={text} className="flex items-center gap-[6px]">
                    <span
                      className={cn(
                        "w-[14px] h-[14px] rounded-full flex-none flex items-center justify-center",
                        ok ? "bg-green text-green-fg" : "bg-surface-3 text-text-faint",
                      )}
                    >
                      {ok && <CheckIcon size={9} />}
                    </span>
                    <span className={cn("text-[11.5px]", ok ? "text-green" : "text-text-faint")}>
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-[6px]">
              <PasswordField
                label="Confirmar nueva contraseña"
                registration={form.register("confirmPassword")}
                show={visible.confirm}
                onToggleShow={() => toggleVisible("confirm")}
                error={mismatch}
                autoComplete="new-password"
              />
              {(passwordsEqual || mismatch) && (
                <div
                  className={cn(
                    "flex items-center gap-[5px] text-[11.5px]",
                    passwordsEqual ? "text-green" : "text-danger",
                  )}
                >
                  {passwordsEqual ? <CheckThinIcon size={13} /> : <AlertCircleIcon size={13} />}
                  {passwordsEqual ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
                </div>
              )}
            </div>

            {/* Security note */}
            <div className="flex items-start gap-[10px] rounded-[10px] bg-tint-blue p-[12px]">
              <ShieldIcon size={16} className="flex-none text-data-blue mt-[1px]" />
              <p className="m-0 text-[12px] leading-[1.5] text-text-dim">
                Al actualizar tu contraseña se cerrarán todas las demás sesiones activas por seguridad.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop footer */}
        <div className="hidden md:flex items-center justify-end gap-[10px] border-t border-border bg-surface-2 p-[12px_20px] flex-none">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-[9px] border border-border bg-surface-2 px-4 py-[9px] text-[12.5px] font-semibold text-text hover:border-border-strong"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!form.formState.isValid || mutation.isPending}
            className="inline-flex cursor-pointer items-center gap-2 rounded-[9px] bg-primary px-4 py-[9px] text-[12.5px] font-bold text-primary-fg shadow-[0_5px_16px_var(--primary-ring)] hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? (
              <>
                <SpinnerIcon size={14} className="animate-spin-fast" />
                Actualizando…
              </>
            ) : (
              "Actualizar contraseña"
            )}
          </button>
        </div>

        {/* Mobile footer */}
        <div className="md:hidden flex-none p-[12px_16px_24px]">
          <button
            type="submit"
            disabled={!form.formState.isValid || mutation.isPending}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[11px] bg-primary py-[14px] text-[14px] font-bold text-primary-fg shadow-[0_5px_16px_var(--primary-ring)] hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? (
              <>
                <SpinnerIcon size={16} className="animate-spin-fast" />
                Actualizando…
              </>
            ) : (
              "Actualizar contraseña"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
