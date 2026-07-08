export const safeRedirectPath = (redirect: string | null | undefined): string =>
  redirect?.startsWith("/") && !redirect.startsWith("//") && !redirect.startsWith("/login")
    ? redirect
    : "/";
