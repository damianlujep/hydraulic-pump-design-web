import { PumpIcon } from "@/components/icons";
import { LoginForm } from "@/components/auth/LoginForm";

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) => {
  const { redirect } = await searchParams;
  return (
    <div className="relative w-full max-w-[372px] rounded-2xl border border-border bg-surface p-[34px_34px_28px] shadow-app">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-[14px] flex h-11 w-11 items-center justify-center rounded-[11px] bg-primary text-primary-fg shadow-[0_6px_18px_var(--primary-ring)]">
          <PumpIcon size={22} />
        </span>
        <h1 className="text-lg font-semibold tracking-[-.01em]">Iniciar sesión</h1>
        <p className="mt-1 text-xs text-text-faint">HydraPump Design Suite</p>
      </div>
      <LoginForm redirect={redirect} />
    </div>
  );
};

export default LoginPage;
