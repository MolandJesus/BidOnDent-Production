import { cn } from "../ui/utils";

type ShopDirectoryHybridHeaderProps = {
  isLight: boolean;
  stageRoleLabel: string;
  sortLabel: string;
  mapToneLabel: string;
  shopCount: number;
};

export default function ShopDirectoryHybridHeader({
  isLight,
  stageRoleLabel,
  sortLabel,
  mapToneLabel,
  shopCount,
}: ShopDirectoryHybridHeaderProps) {
  const eyebrowClassName = isLight ? "text-blue-700/75" : "text-blue-200/70";
  const accentBadgeClassName = isLight
    ? "border-blue-200/80 bg-blue-50 text-blue-700"
    : "border-blue-400/30 bg-blue-500/15 text-blue-200";
  const badgeClassName = isLight
    ? "border-slate-200/80 bg-white/90 text-slate-600"
    : "border-white/[0.10] bg-white/[0.05] text-slate-300";
  const titleClassName = isLight ? "text-slate-950" : "text-white";
  const mutedClassName = isLight ? "text-slate-600" : "text-slate-300/80";

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center gap-2">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${eyebrowClassName}`}>
          Smart Shop Discovery
        </p>
        <span
          className={cn(
            "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold",
            accentBadgeClassName
          )}
        >
          {stageRoleLabel}
        </span>
        <span
          className={cn(
            "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold",
            badgeClassName
          )}
        >
          {shopCount} shops
        </span>
        <span
          className={cn(
            "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold",
            badgeClassName
          )}
        >
          {sortLabel}
        </span>
        <span
          className={cn(
            "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold",
            badgeClassName
          )}
        >
          {mapToneLabel}
        </span>
      </div>

      <h2
        className={`mt-3 max-w-3xl text-[1.85rem] font-semibold tracking-tight sm:text-[2rem] ${titleClassName}`}
      >
        Keep search controls and the live map inside one focused workspace.
      </h2>
      <p className={`mt-2.5 max-w-3xl text-sm leading-6 sm:text-[15px] ${mutedClassName}`}>
        Search, compare, and route without the old split sidebar. The map stays front and center,
        and the recommended shops move below for easier scanning.
      </p>
    </div>
  );
}
