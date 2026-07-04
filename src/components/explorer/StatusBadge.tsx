import { CloudSyncIcon, LockIcon } from "@/components/icons";

export function StatusBadge({ isCloud }: { isCloud: boolean }) {
  if (isCloud) {
    return (
      <span className="inline-flex items-center gap-[6px] px-[10px] py-1 rounded-full bg-green-soft text-green text-[11.5px] font-semibold">
        <CloudSyncIcon size={13} />
        Sincronizado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-[6px] px-[10px] py-1 rounded-full bg-amber-soft text-amber text-[11.5px] font-semibold">
      <LockIcon size={13} />
      Caché local
    </span>
  );
}
