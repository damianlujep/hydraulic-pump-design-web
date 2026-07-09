import Skeleton from "react-loading-skeleton";

const BASE = "var(--surface-2)";
const HIGHLIGHT = "var(--surface-3)";

export const WorkspaceSkeleton = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="h-[58px] flex-none flex items-center gap-[15px] px-[22px] bg-surface border-b border-border">
        <Skeleton width={170} height={32} borderRadius={9} baseColor={BASE} highlightColor={HIGHLIGHT} />
        <Skeleton width={220} height={32} borderRadius={9} baseColor={BASE} highlightColor={HIGHLIGHT} />
      </div>
      <div className="flex items-center gap-[9px] p-[11px_22px] bg-surface border-b border-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} width={110} height={30} borderRadius={999} baseColor={BASE} highlightColor={HIGHLIGHT} />
        ))}
      </div>
      <div className="flex-1 flex min-h-0">
        <section className="w-[45%] flex-none overflow-y-auto p-[18px_20px_24px] flex flex-col gap-[14px] border-r border-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={110} borderRadius={11} baseColor={BASE} highlightColor={HIGHLIGHT} />
          ))}
        </section>
        <section className="flex-1 min-w-0 overflow-y-auto p-[18px_20px_24px] flex flex-col gap-4 bg-surface-2">
          <Skeleton height={340} borderRadius={12} baseColor={BASE} highlightColor={HIGHLIGHT} />
        </section>
      </div>
    </div>
  );
};
