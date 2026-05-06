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
    ? "border-[rgba(140,82,22,0.24)] bg-[linear-gradient(180deg,rgba(247,232,194,0.84),rgba(232,238,248,0.76))] text-slate-600 shadow-[inset_0_1px_0_rgba(252,240,208,0.78),0_4px_14px_rgba(15,23,42,0.08)]"
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

      {/* Phase 7 honesty (2026-05-03 P7): title + subtitle now mention NY
          explicitly so out-of-state GPS users (e.g. Atlanta in current
          owner screenshots) understand the search is bounded to our
          soft-launch counties — Rockland, Dutchess, Westchester, Nassau,
          Orange, Putnam — not a national marketplace. */}
      <h2
        className={`mt-3 max-w-3xl text-[2rem] font-semibold tracking-tight leading-[1.06] sm:text-[2.25rem] ${titleClassName}`}
      >
        Search our NY partner network
      </h2>
      <p className={`mt-3 max-w-[46rem] text-sm leading-6 sm:text-[15px] ${mutedClassName}`}>
        Enter a NY ZIP, address, or live location to focus the map. We're currently live across
        Rockland, Dutchess, Westchester, Nassau, Orange, and Putnam — partner shops listed below as
        they come online.
      </p>
    </div>
  );
}
