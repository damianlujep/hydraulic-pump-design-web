let refreshPromise: Promise<number> | null = null;

const refreshSession = async (): Promise<number> => {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    return res.status;
  } catch {
    return 0;
  }
};

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;
  const redirect = window.location.pathname + window.location.search;
  window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`;
};

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const res = await fetch(input, init);
  if (res.status !== 401) return res;

  refreshPromise ??= refreshSession().finally(() => {
    refreshPromise = null;
  });
  const status = await refreshPromise;

  if (status === 200) return fetch(input, init);
  if (status === 401) {
    redirectToLogin();
    return new Promise<Response>(() => undefined);
  }
  return res;
};
