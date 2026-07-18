"use client";

import { useState } from "react";
import { z } from "zod";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";
import { Modal } from "@/components/Modal";
import { AlertCircleIcon, SpinnerIcon, UserMinusIcon, UserPlusIcon, XIcon } from "@/components/icons";
import { useWorkspace } from "../state/WorkspaceContext";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useProjectMembers,
  useAddProjectMember,
  useRemoveProjectMember,
  type ProjectMemberResponse,
  type ProjectMemberRole,
} from "@/lib/api/projects";
import { isErrorResponse } from "@/lib/api/errors";
import { avatarGradientStyle, nameInitials, userInitials, userFullName } from "@/lib/auth/user-display";
import { useEscapeKey } from "@/hooks/useEscapeKey";

const emailSchema = z.string().email();

const memberErrorMessage = (err: unknown, fallback: string): string => {
  if (isErrorResponse(err)) {
    switch (err.code) {
      case "USER_NOT_FOUND":
        return "No existe un usuario con ese correo.";
      case "USER_NOT_IN_ORGANIZATION":
        return "El usuario no pertenece a tu organización.";
      case "CANNOT_SHARE_WITH_OWNER":
        return "Ese usuario ya es el propietario del proyecto.";
      default:
        return err.message;
    }
  }
  return fallback;
};

const SkeletonMemberRow = () => (
  <div className="flex items-center gap-[10px] px-[12px] py-[10px] border-t border-border">
    <Skeleton circle width={32} height={32} baseColor="var(--surface-2)" highlightColor="var(--surface-3)" />
    <div className="flex-1 min-w-0 flex flex-col gap-[5px]">
      <Skeleton width="55%" height={12} baseColor="var(--surface-2)" highlightColor="var(--surface-3)" />
      <Skeleton width="70%" height={11} baseColor="var(--surface-2)" highlightColor="var(--surface-3)" />
    </div>
    <Skeleton width={72} height={26} borderRadius={7} baseColor="var(--surface-2)" highlightColor="var(--surface-3)" />
  </div>
);

type Props = {
  onClose: () => void;
};

export const ShareProjectDialog = ({ onClose }: Props) => {
  const { projectId, projectName } = useWorkspace();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ProjectMemberRole>("VIEWER");
  const [addError, setAddError] = useState<string | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<{ userId: number; name: string } | null>(null);

  const members = useProjectMembers(projectId);
  // Two instances of the same mutation so the form button's pending state and the
  // row selects' pending state never cross.
  const addMutation = useAddProjectMember(projectId);
  const rowMutation = useAddProjectMember(projectId);
  const removeMutation = useRemoveProjectMember(projectId);

  useEscapeKey(() => (pendingRevoke ? setPendingRevoke(null) : onClose()));

  const handleAdd = async () => {
    if (!emailSchema.safeParse(email).success) {
      setAddError("Ingresa un correo válido.");
      return;
    }
    setAddError(null);
    try {
      await addMutation.mutateAsync({ email, role });
      setEmail("");
    } catch (err: unknown) {
      setAddError(memberErrorMessage(err, "No se pudo compartir el proyecto."));
    }
  };

  const handleRoleChange = (member: ProjectMemberResponse, newRole: ProjectMemberRole) => {
    if (member.userId == null || !member.email) return;
    const name = member.name ?? member.email;
    rowMutation.mutate(
      { email: member.email, role: newRole },
      {
        onSuccess: () =>
          toast.success(`${name} ahora ${newRole === "EDITOR" ? "puede editar" : "puede ver"} el proyecto`),
        onError: (err) => toast.error(memberErrorMessage(err, "No se pudo actualizar el rol.")),
      },
    );
  };

  const confirmRevoke = () => {
    if (!pendingRevoke) return;
    const { userId, name } = pendingRevoke;
    removeMutation.mutate(userId, {
      onSuccess: () => toast.success(`Se quitó el acceso de ${name}`),
      onError: (err) => toast.error(memberErrorMessage(err, "No se pudo quitar el acceso.")),
    });
    setPendingRevoke(null);
  };

  return (
    <Modal maxWidthPx={520} zIndex={70} onClose={onClose}>
      {/* Header */}
      <div className="flex items-start gap-[16px] p-[20px_20px_16px] flex-none">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-primary-soft border border-primary-ring flex items-center justify-center text-primary flex-none">
          <UserPlusIcon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-text">Compartir proyecto</div>
          <div className="text-[12.5px] text-text-dim mt-[3px] leading-[1.4]">
            Da acceso a &ldquo;{projectName}&rdquo; a miembros de tu organización.
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-text-faint hover:text-text flex-none mt-[-2px] cursor-pointer"
        >
          <XIcon size={18} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-[4px_20px_20px]">
        {/* Add member form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleAdd();
          }}
          noValidate
        >
          <div className="flex items-center gap-[8px]">
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="correo@empresa.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (addError) setAddError(null);
              }}
              className="flex-1 min-w-0 bg-surface-3 border border-border rounded-[8px] px-[12px] py-[9px] text-[13px] text-text outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)]"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as ProjectMemberRole)}
              className="flex-none bg-surface-3 border border-border rounded-[8px] px-[10px] py-[9px] text-[12.5px] text-text outline-none cursor-pointer hover:border-border-strong focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)] transition-[border-color,box-shadow] duration-150"
            >
              <option value="VIEWER">Puede ver</option>
              <option value="EDITOR">Puede editar</option>
            </select>
            <button
              type="submit"
              disabled={!email.trim() || addMutation.isPending}
              className="flex-none inline-flex items-center gap-[6px] px-4 py-[9px] rounded-[9px] bg-primary text-primary-fg text-[12.5px] font-bold shadow-[0_5px_16px_var(--primary-ring)] hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addMutation.isPending ? (
                <>
                  <SpinnerIcon size={13} className="animate-spin-fast" />
                  Compartiendo…
                </>
              ) : (
                "Compartir"
              )}
            </button>
          </div>
          {addError && (
            <div role="alert" className="flex items-center gap-[5px] text-[11.5px] text-danger mt-[6px]">
              <AlertCircleIcon size={12} className="flex-none" />
              {addError}
            </div>
          )}
        </form>

        {/* Personas con acceso */}
        <div className="mt-[18px]">
          <div className="text-[10.5px] uppercase tracking-[.06em] text-text-faint font-semibold mb-[10px]">
            Personas con acceso
          </div>

          <div className="border border-border rounded-[10px] overflow-hidden">
            {/* Owner row */}
            <div className="flex items-center gap-[10px] px-[12px] py-[10px]">
              <div
                className="w-[32px] h-[32px] rounded-full flex items-center justify-center flex-none text-[12px] font-bold text-primary-fg"
                style={avatarGradientStyle}
              >
                {userInitials(user)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-text truncate">{userFullName(user)}</div>
                <div className="text-[11.5px] text-text-dim font-mono truncate">{user?.email ?? ""}</div>
              </div>
              <span className="text-[11px] font-semibold text-text-dim bg-surface-3 border border-border rounded-full px-2 py-[2px] flex-none whitespace-nowrap">
                Propietario
              </span>
            </div>

            {/* Loading skeleton */}
            {members.isPending && (
              <>
                <SkeletonMemberRow />
                <SkeletonMemberRow />
              </>
            )}

            {/* Error state */}
            {members.isError && (
              <div className="border-t border-border px-[12px] py-[10px] flex items-center justify-between gap-3">
                <span className="text-[12.5px] text-danger">No se pudieron cargar los miembros.</span>
                <button
                  type="button"
                  onClick={() => void members.refetch()}
                  className="flex-none text-[12.5px] text-primary cursor-pointer hover:underline"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Empty state */}
            {!members.isPending && !members.isError && members.data?.length === 0 && (
              <div className="border-t border-border px-[12px] py-[10px]">
                <p className="m-0 text-[12.5px] text-text-faint">
                  Aún no has compartido este proyecto con nadie.
                </p>
              </div>
            )}

            {/* Member rows */}
            {members.data?.map((row) => {
              const isPending =
                (rowMutation.isPending && rowMutation.variables?.email === row.email) ||
                (removeMutation.isPending && removeMutation.variables === row.userId);
              const displayName = row.name ?? row.email ?? "Usuario";
              return (
                <div
                  key={row.userId ?? row.email}
                  className="flex items-center gap-[10px] px-[12px] py-[10px] border-t border-border"
                >
                  <div className="w-[32px] h-[32px] rounded-full bg-surface-3 border border-border flex items-center justify-center flex-none text-[12px] font-bold text-text-dim">
                    {nameInitials(row.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-text truncate">{displayName}</div>
                    {row.email && (
                      <div className="text-[11.5px] text-text-dim font-mono truncate">{row.email}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-[8px] flex-none">
                    <select
                      value={row.role ?? "VIEWER"}
                      onChange={(e) => handleRoleChange(row, e.target.value as ProjectMemberRole)}
                      disabled={isPending}
                      className="bg-surface-3 border border-border rounded-[7px] px-[8px] py-[5px] text-[12px] text-text outline-none cursor-pointer hover:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="VIEWER">Puede ver</option>
                      <option value="EDITOR">Puede editar</option>
                    </select>
                    {isPending ? (
                      <SpinnerIcon size={14} className="animate-spin-fast text-text-faint" />
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          row.userId != null && setPendingRevoke({ userId: row.userId, name: displayName })
                        }
                        title={`Quitar acceso a ${displayName}`}
                        aria-label={`Quitar acceso a ${displayName}`}
                        className="text-text-faint hover:text-danger cursor-pointer"
                      >
                        <XIcon size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footnote */}
        <p className="mt-[12px] mb-0 text-[11.5px] text-text-faint leading-[1.5]">
          Los cambios se aplican al instante. No se enviará ningún correo — el proyecto aparecerá en
          «Compartidos conmigo» del usuario.
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end border-t border-border bg-surface-2 p-[12px_20px] flex-none">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-[9px] border border-border bg-surface-2 px-4 py-[9px] text-[12.5px] font-semibold text-text hover:border-border-strong"
        >
          Listo
        </button>
      </div>

      {pendingRevoke && (
        <Modal onClose={() => setPendingRevoke(null)} maxWidthPx={400} zIndex={100}>
          <div className="px-[22px] pb-[18px] pt-[22px]" role="alertdialog" aria-labelledby="revoke-member-title">
            <div className="flex items-start gap-[14px]">
              <div className="flex h-[44px] w-[44px] flex-none items-center justify-center rounded-[12px] border border-danger-ring bg-danger-soft text-danger">
                <UserMinusIcon size={20} />
              </div>
              <div className="min-w-0">
                <h2 id="revoke-member-title" className="m-0 text-[16px] font-bold tracking-[-0.01em] text-text">
                  ¿Quitar el acceso?
                </h2>
                <p className="mb-5 mt-3 text-[12.5px] leading-[1.55] text-text-dim">
                  <strong className="text-text">{pendingRevoke.name}</strong> perderá el acceso a este proyecto
                  de inmediato. Podrás volver a compartirlo cuando quieras.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-[10px]">
              <button
                type="button"
                className="cursor-pointer rounded-[9px] border border-border bg-surface-2 px-4 py-[9px] text-[12.5px] font-semibold text-text transition-colors hover:border-border-strong"
                onClick={() => setPendingRevoke(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-2 rounded-[9px] border border-danger bg-danger px-4 py-[9px] text-[12.5px] font-bold text-white shadow-[0_5px_16px_var(--danger-ring)] transition-colors hover:border-danger-hover hover:bg-danger-hover"
                onClick={confirmRevoke}
              >
                <UserMinusIcon size={15} />
                Quitar acceso
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
};
