import type { UserRole } from "@/interfaces/user";

export type Permission = {
  label: string;
  allowed: Record<UserRole, boolean>;
};

export const PERMISSIONS: Permission[] = [
  {
    label: "Crear y editar proyectos",
    allowed: { SUPER_ADMIN: false, ADMIN: true, MEMBER: true },
  },
  {
    label: "Ejecutar cálculos (IPR)",
    allowed: { SUPER_ADMIN: false, ADMIN: true, MEMBER: true },
  },
  {
    label: "Gestionar usuarios de la organización",
    allowed: { SUPER_ADMIN: true, ADMIN: true, MEMBER: false },
  },
  {
    label: "Administrar organizaciones",
    allowed: { SUPER_ADMIN: true, ADMIN: false, MEMBER: false },
  },
];
