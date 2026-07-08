import type { components } from "@/lib/api/schema";

export type User = components["schemas"]["UserResponse"];
export type UserRole = NonNullable<User["role"]>;
