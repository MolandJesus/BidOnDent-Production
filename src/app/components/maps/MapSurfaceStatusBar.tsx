import { cn } from "../ui/utils";
import { getMapSurfaceTheme } from "./mapSurfaceTheme";
import type { MapSurfaceTone } from "./serviceCoverageMapTypes";

type MapSurfaceStatusBarProps = {
  tone: MapSurfaceTone;
  regionCount: number;
  partnerShopCount: number;
  modeLabel: string;
  radiusMiles?: string | null;
  overviewLabel?: string | null;
  performanceOverBudgetCount?: number;
  performanceRecentOverBudgetCount?: number;
  performanceRecentSampleCount?: number;
  performanceSampleCount?: number;
  performanceRecentStatus?: "idle" | "healthy" | "watch" | "degraded";
  performanceLatestSampleAt?: string | null;
  performanceLatestSampleAgeMs?: number | null;
  lastZoomDurationMs?: number | null;
  lastPanDurationMs?: number | null;
  onResetPerformance?: () => void;
};

function formatSampleAgeLabel(ageMs: number | null | undefined) {
  if (typeof ageMs !== "number" || ageMs < 0 || !Number.isFinite(ageMs)) {
    return null;
  }

  if (ageMs < 30_000) {
    return "just now";
  }

  if (ageMs < 60 * 60 * 1000) {
    return `${Math.max(1, Math.round(ageMs / 60_000))}m ago`;
  }

  if (ageMs < 24 * 60 * 60 * 1000) {
    return `${Math.max(1, Math.round(ageMs / (60 * 60 * 1000)))}h ago`;
  }

  return `${Math.max(1, Math.round(ageMs / (24 * 60 * 60 * 1000)))}d ago`;
}

export default function MapSurfaceStatusBar({
  tone,
  regionCount,
  partnerShopCount,
  modeLabel,
  radiusMiles,
  overviewLabel,
  performanceOverBudgetCount,
  performanceRecentOverBudgetCount,
  performanceRecentSampleCount,
  performanceSampleCount,
  performanceRecentStatus,
  performanceLatestSampleAt,
  performanceLatestSampleAgeMs,
  lastZoomDurationMs,
  lastPanDurationMs,
  onResetPerformance,
}: MapSurfaceStatusBarProps) {
  const theme = getMapSurfaceTheme(tone);
  const performanceLabel =
    performanceRecentStatus === "degraded"
      ? "Degraded"
      : performanceRecentStatus === "watch"
        ? "Watch"
        : performanceRecentStatus === "healthy"
          ? "Healthy"
          : "Awaiting samples";
  const performanceDetail =
    typeof performanceRecentSampleCount === "number" && performanceRecentSampleCount > 0
      ? `${performanceRecentSampleCount} recent samples`
      : typeof performanceSampleCount === "number" && performanceSampleCount > 0
        ? `No recent samples • ${performanceSampleCount} stored`
        : "Interact with the map to measure latency";
  const performanceLatestDate = performanceLatestSampleAt
    ? new Date(performanceLatestSampleAt)
    : null;
  const performanceLatestLabel =
    performanceLatestDate && !Number.isNaN(performanceLatestDate.getTime())
      ? performanceLatestDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;
  const performanceLatestAgeLabel = formatSampleAgeLabel(performanceLatestSampleAgeMs);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[400] flex flex-wrap items-end justify-between gap-3 p-4">
      <div
        className={cn(
          "pointer-events-auto flex flex-wrap items-center gap-4 px-4 py-3",
          theme.panelStrongClassName
        )}
      >
        <div>
          <div className={theme.metricLabelClassName}>Regions</div>
          <div className={cn("text-sm font-semibold", theme.titleClassName)}>
            {regionCount} NY regions
          </div>
        </div>
        <div>
          <div className={theme.metricLabelClassName}>Partners</div>
          <div className={cn("text-sm font-semibold", theme.titleClassName)}>
            {partnerShopCount} live shops
          </div>
        </div>
        <div>
          <div className={theme.metricLabelClassName}>Map mode</div>
          <div className={cn("text-sm font-semibold", theme.titleClassName)}>
            {overviewLabel || modeLabel}
          </div>
        </div>
        {typeof performanceOverBudgetCount === "number" ? (
          <div className="space-y-1.5">
            <div className={theme.metricLabelClassName}>Performance</div>
            <div className={cn("text-sm font-semibold", theme.titleClassName)}>
              {performanceLabel}
            </div>
            <div className={cn("text-xs", theme.secondaryTextClassName)}>
              {`${performanceDetail} • Zoom ${lastZoomDurationMs ?? "--"}ms • Pan ${lastPanDurationMs ?? "--"}ms`}
            </div>
            <div className={cn("text-xs", theme.secondaryTextClassName)}>
              {typeof performanceRecentOverBudgetCount === "number"
                ? `Recent over-budget: ${performanceRecentOverBudgetCount} • Total over-budget: ${performanceOverBudgetCount}`
                : `Total over-budget: ${performanceOverBudgetCount}`}
            </div>
            <div className={cn("flex items-center gap-3 text-xs", theme.secondaryTextClassName)}>
              <span>
                {performanceLatestLabel
                  ? `Last sample: ${performanceLatestLabel}${performanceLatestAgeLabel ? ` (${performanceLatestAgeLabel})` : ""}`
                  : "Last sample: --"}
              </span>
              {onResetPerformance ? (
                <button
                  type="button"
                  onClick={onResetPerformance}
                  className={theme.tertiaryButtonClassName}
                >
                  Reset
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {radiusMiles ? (
        <div
          className={cn(
            "pointer-events-auto inline-flex flex-wrap items-center gap-2 px-4 py-3",
            theme.accentPanelClassName
          )}
        >
          <span className={cn("text-sm font-semibold", theme.titleClassName)}>
            {radiusMiles}-mile live search radius
          </span>
          {overviewLabel ? (
            <>
              <span className={theme.secondaryTextClassName}>•</span>
              <span className={cn("text-sm", theme.bodyClassName)}>Zoom in for partner detail</span>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
