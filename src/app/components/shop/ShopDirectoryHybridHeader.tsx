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
    ? "border-sky-200/72 bg-[linear-gradient(180deg,rgba(239,246,255,0.94),rgba(219,234,254,0.86))] text-blue-700 shadow-[0_6px_16px_rgba(37,99,235,0.10)]"
    : "border-blue-400/30 bg-blue-500/15 text-blue-200";
  const badgeClassName = isLight
    ? "border-white/74 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(241,245,249,0.76))] text-slate-600 shadow-[0_4px_14px_rgba(15,23,42,0.06)]"
    : "border-white/[0.10] bg-white/[0.05] text-slate-300";
  const titleClassName = isLight ? "text-slate-950" : "text-white";
  const mutedClassName = isLight ? "text-slate-600" : "text-slate-300/80";

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center gap-2.5">
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
        className={`mt-3 max-w-3xl text-[2rem] font-semibold tracking-tight leading-[1.06] sm:text-[2.25rem] ${titleClassName}`}
      >
        Search partner coverage near you
      </h2>
      <p className={`mt-3 max-w-[46rem] text-sm leading-6 sm:text-[15px] ${mutedClassName}`}>
        Enter a ZIP, address, or live location to focus the map, then compare the strongest nearby
        repair options below.
      </p>
    </div>
  );
}
