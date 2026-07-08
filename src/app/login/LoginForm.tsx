"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PumpIcon } from "@/components/icons";
import { useLogin } from "@/lib/api/auth";
import { isErrorResponse } from "@/lib/api/errors";

const INPUT_CLASS =
  "w-full p-[11px_13px] bg-surface-2 border border-border rounded-[9px] text-[13.5px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)]";

export const LoginForm = ({ redirect }: { redirect?: string }) => {
  const router = useRouter();
  const login = useLogin();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const fd = new FormData(e.currentTarget);
    login.mutate(
      { email: String(fd.get("email") ?? ""), password: String(fd.get("password") ?? "") },
      {
        onSuccess: () => {
          const target = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";
          router.replace(target);
        },
        onError: (err) => {
          if (isErrorResponse(err) && err.status === 401) {
            setErrorMessage("Credenciales inválidas");
          } else if (isErrorResponse(err)) {
            setErrorMessage(err.message);
          } else {
            setErrorMessage("No se pudo iniciar sesión");
          }
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[380px] bg-surface border border-border rounded-card shadow-app p-[28px_26px]">
        <div className="flex items-center gap-[11px] mb-7">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-primary flex items-center justify-center text-primary-fg shadow-[0_3px_10px_var(--primary-ring)]">
            <PumpIcon size={18} />
          </div>
          <div>
            <div className="text-[13.5px] font-bold tracking-[-.01em]">HydraPump</div>
            <div className="text-[10px] text-text-faint font-mono tracking-[.06em]">DESIGN SUITE · v4.2</div>
          </div>
        </div>

        <h1 className="text-lg font-bold tracking-[-.01em] mb-1">Iniciar Sesión</h1>
        <p className="text-[12.5px] text-text-dim mb-6">Ingresa tus credenciales para continuar</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-[6px]">
            <label className="text-[11.5px] font-semibold text-text-dim">Correo electrónico</label>
            <input type="email" name="email" required className={INPUT_CLASS} />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className="text-[11.5px] font-semibold text-text-dim">Contraseña</label>
            <input type="password" name="password" required className={INPUT_CLASS} />
          </div>

          {errorMessage && <div className="text-danger text-[12px]">{errorMessage}</div>}

          <button
            type="submit"
            disabled={login.isPending}
            className="mt-1 w-full p-3 rounded-[10px] bg-primary text-primary-fg text-sm font-bold tracking-[.02em] cursor-pointer shadow-[0_6px_18px_var(--primary-ring)] hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {login.isPending ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};
