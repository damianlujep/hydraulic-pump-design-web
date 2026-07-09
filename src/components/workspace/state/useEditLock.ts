"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { acquireProjectLock, heartbeatProjectLock, releaseProjectLock } from "@/lib/api/projects";
import type { LockStatusResponse } from "@/lib/api/projects";
import type { LockView } from "@/interfaces/workspace";

const isLockStatusResponse = (body: unknown): body is LockStatusResponse => {
  return typeof body === "object" && body !== null && "held" in body;
};

const HEARTBEAT_MIN_MS = 15_000;
const HEARTBEAT_RETRY_MS = 5_000;

type LockTimers = { heartbeat: ReturnType<typeof setTimeout> | null; retry: ReturnType<typeof setTimeout> | null };
type HoldsLockRef = { current: boolean };

const clearLockTimers = (timers: LockTimers) => {
  if (timers.heartbeat) clearTimeout(timers.heartbeat);
  if (timers.retry) clearTimeout(timers.retry);
};

const heartbeatDelay = (lockedUntil?: string): number => {
  const untilMs = lockedUntil ? new Date(lockedUntil).getTime() : Date.now() + 30_000;
  return Math.max((untilMs - Date.now()) / 2, HEARTBEAT_MIN_MS);
};

const scheduleHeartbeat = (
  timers: LockTimers,
  projectId: number,
  lockedUntil: string | undefined,
  onUpdate: (lock: LockView) => void,
  holdsLock: HoldsLockRef,
) => {
  if (timers.heartbeat) clearTimeout(timers.heartbeat);
  timers.heartbeat = setTimeout(
    () => void runHeartbeat(timers, projectId, onUpdate, holdsLock),
    heartbeatDelay(lockedUntil),
  );
};

const runHeartbeat = async (
  timers: LockTimers,
  projectId: number,
  onUpdate: (lock: LockView) => void,
  holdsLock: HoldsLockRef,
) => {
  const { ok, body } = await heartbeatProjectLock(projectId);
  if (ok && isLockStatusResponse(body) && body.mine) {
    onUpdate({ status: "mine", lockedUntil: body.lockedUntil });
    scheduleHeartbeat(timers, projectId, body.lockedUntil, onUpdate, holdsLock);
    return;
  }
  timers.retry = setTimeout(() => {
    void (async () => {
      const retry = await heartbeatProjectLock(projectId);
      if (retry.ok && isLockStatusResponse(retry.body) && retry.body.mine) {
        onUpdate({ status: "mine", lockedUntil: retry.body.lockedUntil });
        scheduleHeartbeat(timers, projectId, retry.body.lockedUntil, onUpdate, holdsLock);
        return;
      }
      holdsLock.current = false;
      onUpdate({ status: "error" });
      toast.error("Se perdió el bloqueo de edición — modo solo lectura");
    })();
  }, HEARTBEAT_RETRY_MS);
};

const acquireLock = async (
  timers: LockTimers,
  projectId: number,
  onUpdate: (lock: LockView) => void,
  holdsLock: HoldsLockRef,
) => {
  onUpdate({ status: "acquiring" });
  const { ok, body } = await acquireProjectLock(projectId);
  if (ok && isLockStatusResponse(body) && body.mine) {
    holdsLock.current = true;
    onUpdate({ status: "mine", lockedUntil: body.lockedUntil });
    scheduleHeartbeat(timers, projectId, body.lockedUntil, onUpdate, holdsLock);
    return;
  }
  if (isLockStatusResponse(body) && body.held && body.lockedByName) {
    onUpdate({ status: "held-by-other", holderName: body.lockedByName, lockedUntil: body.lockedUntil });
    return;
  }
  onUpdate({ status: "error" });
};

export const useEditLock = (projectId: number, enabled: boolean) => {
  const [lock, setLock] = useState<LockView>(() => (enabled ? { status: "acquiring" } : { status: "no-permission" }));
  const timersRef = useRef<LockTimers>({ heartbeat: null, retry: null });
  const holdsLockRef = useRef(false);

  useEffect(() => {
    // The lazy initial state above already reflects `no-permission` for a disabled mount;
    // `enabled` is derived from project data that doesn't change without a full remount.
    if (!enabled) return;
    const timers = timersRef.current;
    void acquireLock(timers, projectId, setLock, holdsLockRef);
    return () => {
      clearLockTimers(timers);
      if (holdsLockRef.current) releaseProjectLock(projectId);
      holdsLockRef.current = false;
    };
  }, [projectId, enabled]);

  return {
    lock,
    retry: () => void acquireLock(timersRef.current, projectId, setLock, holdsLockRef),
  };
};
