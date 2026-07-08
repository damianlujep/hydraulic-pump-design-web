const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-[radial-gradient(130%_100%_at_50%_0%,var(--surface-2),var(--bg))] px-[22px] py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--grid)_1px,transparent_1px),linear-gradient(90deg,var(--grid)_1px,transparent_1px)] bg-[size:30px_30px] opacity-50"
      />
      {children}
    </div>
  );
};

export default AuthLayout;
