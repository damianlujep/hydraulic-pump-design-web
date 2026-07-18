import type { User, UserRole } from "@/interfaces/user";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Administrador",
  ADMIN: "Administrador",
  MEMBER: "Miembro",
};

export const avatarGradientStyle = {
  background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
};

export const roleLabel = (user: User | null): string =>
  user?.role != null ? ROLE_LABELS[user.role] : "";

export const nameInitials = (name: string | undefined): string => {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase() || "?";
};

export const userInitials = (user: User | null): string =>
  user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "?"
    : "?";

export const userFullName = (user: User | null): string =>
  user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Usuario" : "Usuario";
