import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/api/server-client";
import type { User, UserRole } from "@/interfaces/user";

export const requireUser = async (): Promise<User> => {
  let user: User | null = null;
  try {
    const client = await createServerClient();
    const { data, response } = await client.GET("/api/v1/auth/me");
    if (response.ok && data) user = data;
  } catch {
    user = null;
  }
  if (!user) redirect("/login");
  return user;
};

export const requireRole = async (...roles: UserRole[]): Promise<User> => {
  const user = await requireUser();
  if (!user.role || !roles.includes(user.role)) redirect("/");
  return user;
};
