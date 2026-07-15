"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { roleLabel, userFullName } from "@/lib/auth/user-display";
import { AccountCard, DataRow } from "./AccountCard";

export const PersonalInfoCard = () => {
  const { user } = useAuth();

  return (
    <AccountCard title="Información personal">
      <DataRow label="Nombre completo" value={userFullName(user)} />
      <DataRow label="Cargo" value={roleLabel(user) || undefined} />
      <DataRow label="Correo" value={user?.email} mono />
      <DataRow label="Organización" value={user?.organizationName} />
    </AccountCard>
  );
};
