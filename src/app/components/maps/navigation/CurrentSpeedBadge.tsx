import { Gauge, TriangleAlert } from "lucide-react";
import { cn } from "../../ui/utils";
import type { MapSurfaceTone } from "../serviceCoverageMapTypes";

type CurrentSpeedBadgeProps = {
  tone: MapSurfaceTone;
  currentSpeedMph?: number | null;
  postedSpeedLimitMph?: number | null;
};

/** Speed readings above this threshold are treated as GPS noise and shown as "—". */
const GPS_SPEED_SANITY_CAP_MPH = 120;

export default function CurrentSpeedBadge({
  tone,
  currentSpeedMph,
  postedSpeedLimitMph,
}: CurrentSpeedBadgeProps) {
  const hasCurrentSpeed = Number.isFinite(currentSpeedMph);
  const hasPostedLimit = Number.isFinite(postedSpeedLimitMph);
  const rawSpeed = hasCurrentSpeed ? Math.round(Number(currentSpeedMph)) : null;
  const isGpsNoise = rawSpeed !== null && rawSpeed > GPS_SPEED_SANITY_CAP_MPH;
  const speedValue = isGpsNoise ? null : rawSpeed;
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
        "map-ui-enter min-w-[88px] rounded-[1.25rem] border px-3 py-2 backdrop-blur-2xl transition-colors sm:min-w-[112px] sm:rounded-[1.5rem] sm:px-4 sm:py-3",
        isSevereWarning
          ? "border-rose-500 bg-rose-500 text-white shadow-[0_22px_52px_rgba(244,63,94,0.30),inset_0_1px_0_rgba(255,255,255,0.18)]"
          : isOverLimit
            ? tone === "light"
              ? "border-amber-300 bg-amber-50/95 text-amber-950 shadow-[0_22px_52px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(252,240,208,0.42)]"
              : "border-amber-300/50 bg-amber-500/18 text-amber-50 shadow-[inset_0_1px_0_rgba(196,144,65,0.24),inset_0_-1px_0_rgba(140,82,22,0.20),0_0_0_1px_rgba(96,165,250,0.18),0_22px_52px_rgba(2,6,23,0.40),0_0_44px_rgba(196,130,45,0.16)]"
            : tone === "light"
              ? "border-[rgba(140,82,22,0.32)] bg-[linear-gradient(180deg,rgba(247,232,194,0.86),rgba(232,238,248,0.84))] text-slate-950 shadow-[0_22px_52px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(252,240,208,0.78)]"
              : "border-[rgba(96,165,250,0.20)] bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(8,16,33,0.80))] text-white shadow-[inset_0_1px_0_rgba(196,144,65,0.22),inset_0_-1px_0_rgba(140,82,22,0.20),0_0_0_1px_rgba(96,165,250,0.16),0_22px_52px_rgba(2,6,23,0.42),0_0_44px_rgba(196,130,45,0.14)]"
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
