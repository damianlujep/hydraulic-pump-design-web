"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, EyeIcon, LockIcon, MailIcon, SpinnerIcon } from "@/components/icons";
import { useLogin } from "@/lib/api/auth";
import { isErrorResponse } from "@/lib/api/errors";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { cn } from "@/utils/cn";
import { loginSchema, type SignInFormData } from "./loginSchema";

const FIELD_BASE =
  "flex items-center bg-surface-3 border rounded-[9px] overflow-hidden transition-[border-color,box-shadow] duration-150";
const FIELD_VALID = "border-border focus-within:border-primary focus-within:shadow-[0_0_0_2px_var(--primary-ring)]";
const FIELD_INVALID = "border-danger shadow-[0_0_0_2px_var(--danger-ring)]";
const INPUT_CLASS =
  "flex-1 min-w-0 bg-transparent p-[11px_12px] text-[13.5px] text-text outline-none placeholder:text-text-faint";

const FieldError = ({ id, message }: { id?: string; message: string }) => (
  <div id={id} role="alert" className="mt-[6px] flex items-center gap-[5px] text-[11px] text-danger">
    <AlertCircleIcon size={12} className="flex-none" />
    {message}
  </div>
);

export const LoginForm = ({ redirect }: { redirect?: string }) => {
  const router = useRouter();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (data: SignInFormData) => {
    login.mutate(data, {
      onSuccess: () => {
        router.replace(safeRedirectPath(redirect));
      },
    });
  };

  const emailError = errors.email?.message;
  const passwordError = errors.password?.message;
  const retryAfterMessage = (error: unknown): string => {
    const seconds =
      typeof error === "object" && error !== null && "retryAfterSeconds" in error
        ? (error as { retryAfterSeconds?: unknown }).retryAfterSeconds
        : undefined;
    return typeof seconds === "number"
      ? `Demasiados intentos. Intenta de nuevo en ${Math.ceil(seconds / 60)} min.`
      : "Demasiados intentos. Intenta de nuevo más tarde.";
  };
  const serverError = login.error
    ? isErrorResponse(login.error)
      ? login.error.status === 401
        ? "Credenciales inválidas"
        : login.error.status === 429
          ? retryAfterMessage(login.error)
          : login.error.message
      : "No se pudo iniciar sesión"
    : null;

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
      <div className="mb-[14px]">
        <label htmlFor="login-email" className="mb-[6px] block text-[11.5px] font-semibold tracking-[.01em] text-text-dim">
          Correo electrónico
        </label>
        <div className={cn(FIELD_BASE, emailError ? FIELD_INVALID : FIELD_VALID)}>
          <MailIcon size={15} className="ml-3 flex-none text-text-faint" />
          <input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ingeniero@empresa.com"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "login-email-error" : undefined}
            className={INPUT_CLASS}
            {...register("email")}
          />
        </div>
        {emailError && <FieldError id="login-email-error" message={emailError} />}
      </div>

      <div className="mb-[14px]">
        <label htmlFor="login-password" className="mb-[6px] block text-[11.5px] font-semibold tracking-[.01em] text-text-dim">
          Contraseña
        </label>
        <div className={cn(FIELD_BASE, passwordError ? FIELD_INVALID : FIELD_VALID)}>
          <LockIcon size={15} className="ml-3 flex-none text-text-faint" />
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••••"
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "login-password-error" : undefined}
            className={INPUT_CLASS}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="flex cursor-pointer items-center self-stretch px-3 text-text-faint hover:text-text-dim"
          >
            <EyeIcon size={16} />
          </button>
        </div>
        {passwordError && <FieldError id="login-password-error" message={passwordError} />}
      </div>

      {serverError && <FieldError message={serverError} />}

      <button
        type="submit"
        disabled={login.isPending || login.isSuccess}
        className={cn(
          "mt-[6px] flex w-full cursor-pointer items-center justify-center gap-[9px] rounded-[10px] bg-primary p-3 text-sm font-semibold text-primary-fg shadow-[0_6px_18px_var(--primary-ring)] transition-colors hover:bg-primary-hover disabled:cursor-default",
          login.isPending && "opacity-70 shadow-none",
        )}
      >
        {login.isPending && <SpinnerIcon size={15} className="animate-spin-fast" />}
        {login.isPending ? "Verificando…" : login.isSuccess ? "Sesión iniciada" : "Iniciar sesión"}
      </button>
    </form>
  );
};
