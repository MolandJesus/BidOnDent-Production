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
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[400] flex flex-wrap items-end justify-between gap-2.5 px-3 pb-3 sm:gap-3 sm:px-4 sm:pb-4" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px) + 0.75rem, 0.75rem)" }}>
      {/* Branded info strip — compact single row */}
      <div
        className={cn(
          "pointer-events-auto inline-flex items-center gap-2 px-3 py-2 text-xs sm:gap-3 sm:px-4 sm:py-2.5 sm:text-sm",
          theme.panelStrongClassName
        )}
      >
        <span className={cn("font-bold tracking-wide uppercase", theme.titleClassName)} style={{ fontSize: "0.65rem", letterSpacing: "0.14em" }}>
          BidOnDent Maps
        </span>
        <span className={theme.secondaryTextClassName}>·</span>
        <span className={cn("font-medium", theme.bodyClassName)}>
          {regionCount} regions
        </span>
        <span className={theme.secondaryTextClassName}>·</span>
        <span className={cn("font-medium", theme.bodyClassName)}>
          {partnerShopCount} shops
        </span>
        <span className={cn("hidden sm:inline", theme.secondaryTextClassName)}>·</span>
        <span className={cn("hidden sm:inline font-medium", theme.bodyClassName)}>
          {overviewLabel || modeLabel}
        </span>
      </div>

      {/* DEV-only performance overlay */}
      {import.meta.env.DEV && typeof performanceOverBudgetCount === "number" ? (
        <div
          className={cn(
            "pointer-events-auto space-y-1 px-3 py-2 text-xs",
            theme.panelStrongClassName
          )}
        >
          <div className={cn("font-semibold", theme.titleClassName)}>
            {performanceLabel}
          </div>
          <div className={theme.secondaryTextClassName}>
            {`${performanceDetail} • Zoom ${lastZoomDurationMs ?? "--"}ms • Pan ${lastPanDurationMs ?? "--"}ms`}
          </div>
          <div className={theme.secondaryTextClassName}>
            {typeof performanceRecentOverBudgetCount === "number"
              ? `Recent over-budget: ${performanceRecentOverBudgetCount} • Total over-budget: ${performanceOverBudgetCount}`
              : `Total over-budget: ${performanceOverBudgetCount}`}
          </div>
          <div className={cn("flex items-center gap-3", theme.secondaryTextClassName)}>
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

      {radiusMiles ? (
        <div
          className={cn(
            "pointer-events-auto inline-flex items-center gap-2 px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm",
            theme.accentPanelClassName
          )}
        >
          <span className={cn("font-semibold", theme.titleClassName)}>
            {radiusMiles}-mi radius
          </span>
          {overviewLabel ? (
            <>
              <span className={theme.secondaryTextClassName}>·</span>
              <span className={cn("hidden sm:inline", theme.bodyClassName)}>Zoom for detail</span>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
