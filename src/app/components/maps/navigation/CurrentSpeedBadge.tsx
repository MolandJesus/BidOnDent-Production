import { Gauge, TriangleAlert } from "lucide-react";
import { cn } from "../../ui/utils";
import type { MapSurfaceTone } from "../serviceCoverageMapTypes";

type CurrentSpeedBadgeProps = {
  tone: MapSurfaceTone;
  currentSpeedMph?: number | null;
  postedSpeedLimitMph?: number | null;
};

export default function CurrentSpeedBadge({
  tone,
  currentSpeedMph,
  postedSpeedLimitMph,
}: CurrentSpeedBadgeProps) {
  const hasCurrentSpeed = Number.isFinite(currentSpeedMph);
  const hasPostedLimit = Number.isFinite(postedSpeedLimitMph);
  const speedValue = hasCurrentSpeed ? Math.round(Number(currentSpeedMph)) : null;
  const postedValue = hasPostedLimit ? Math.round(Number(postedSpeedLimitMph)) : null;
  const overage =
    hasCurrentSpeed && hasPostedLimit && speedValue !== null && postedValue !== null
      ? speedValue - postedValue
      : null;
  const isSevereWarning = typeof overage === "number" && overage >= 15;
  const isOverLimit = typeof overage === "number" && overage > 0;

  return (
    <div
      className={cn(
        "map-ui-enter min-w-[88px] rounded-[1.25rem] border px-3 py-2 shadow-[0_22px_52px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.36)] backdrop-blur-2xl transition-colors sm:min-w-[112px] sm:rounded-[1.5rem] sm:px-4 sm:py-3",
        isSevereWarning
          ? "border-rose-500 bg-rose-500 text-white"
          : isOverLimit
            ? tone === "light"
              ? "border-amber-300 bg-amber-50/95 text-amber-950"
              : "border-amber-300/50 bg-amber-500/18 text-amber-50"
            : tone === "light"
              ? "border-white/85 bg-white/92 text-slate-950"
              : "border-white/12 bg-slate-950/82 text-white"
      )}
    >
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] sm:gap-2 sm:text-[11px]">
          <Gauge className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span>Speed</span>
        </div>
        {isSevereWarning ? <TriangleAlert className="h-4 w-4" /> : null}
      </div>

      <div className="mt-1.5 flex items-end gap-1 sm:mt-2">
        <span className="text-2xl font-bold leading-none sm:text-3xl">
          {speedValue !== null ? speedValue : "--"}
        </span>
        <span className="pb-0.5 text-xs font-semibold uppercase tracking-[0.18em]">mph</span>
      </div>

      <div
        className={cn(
          "mt-1 text-xs font-medium",
          isSevereWarning ? "text-white/90" : tone === "light" ? "text-slate-500" : "text-slate-300"
        )}
      >
        {isSevereWarning
          ? "15+ over limit"
          : isOverLimit
            ? "Over posted limit"
            : "Current road speed"}
      </div>
    </div>
  );
}
