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
        "map-ui-enter min-w-[112px] rounded-[1.6rem] border px-4 py-3 shadow-[0_22px_52px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.36)] backdrop-blur-2xl transition-colors",
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
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]">
          <Gauge className="h-3.5 w-3.5" />
          <span>Speed</span>
        </div>
        {isSevereWarning ? <TriangleAlert className="h-4 w-4" /> : null}
      </div>

      <div className="mt-2 flex items-end gap-1">
        <span className="text-3xl font-bold leading-none">
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
