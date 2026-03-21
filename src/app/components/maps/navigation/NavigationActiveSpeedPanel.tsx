import { cn } from "../../ui/utils";
import { getMapSurfaceTheme } from "../mapSurfaceTheme";
import type { MapSurfaceTone } from "../serviceCoverageMapTypes";
import type { NavigationSpeedLimitConfidence } from "../../../types/navigation";
import CurrentSpeedBadge from "./CurrentSpeedBadge";
import SpeedLimitBadge from "./SpeedLimitBadge";

type NavigationActiveSpeedPanelProps = {
  tone: MapSurfaceTone;
  currentSpeedMph?: number | null;
  postedSpeedLimitMph?: number | null;
  postedSpeedLimitConfidence?: NavigationSpeedLimitConfidence | null;
  roadName?: string | null;
  gpsAccuracyMeters?: number | null;
  speedLimitMatchDistanceMeters?: number | null;
};

function describeSpeedLimitConfidence(
  confidence: NavigationSpeedLimitConfidence | null | undefined
) {
  if (confidence === "high") {
    return "High confidence from nearby tagged road";
  }

  if (confidence === "medium") {
    return "Moderate confidence from nearby road context";
  }

  return "Low confidence, verify posted signs";
}

export default function NavigationActiveSpeedPanel({
  tone,
  currentSpeedMph,
  postedSpeedLimitMph,
  postedSpeedLimitConfidence,
  roadName,
  gpsAccuracyMeters,
  speedLimitMatchDistanceMeters,
}: NavigationActiveSpeedPanelProps) {
  const theme = getMapSurfaceTheme(tone, true);
  const hasPostedLimit = Number.isFinite(postedSpeedLimitMph);
  const hasDistance = Number.isFinite(speedLimitMatchDistanceMeters);

  return (
    <div className="pointer-events-none absolute bottom-[18rem] right-4 z-[560] flex max-w-[calc(100%-2rem)] flex-col items-end gap-3 md:bottom-8 md:right-24">
      <div className="pointer-events-auto flex items-end gap-3">
        <CurrentSpeedBadge
          tone={tone}
          currentSpeedMph={currentSpeedMph}
          postedSpeedLimitMph={postedSpeedLimitMph}
        />
        <SpeedLimitBadge
          postedSpeedLimitMph={postedSpeedLimitMph}
          confidence={postedSpeedLimitConfidence}
        />
      </div>

      <div
        className={cn(
          "map-liquid-card map-ui-enter map-ui-enter-delay-1 pointer-events-auto max-w-[280px] px-4 py-3",
          theme.panelClassName
        )}
      >
        <div className={theme.metricLabelClassName}>Current road</div>
        <div className={cn("mt-1 text-sm font-semibold", theme.titleClassName)}>
          {roadName || "Looking up the nearest road"}
        </div>
        <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
          {gpsAccuracyMeters
            ? `GPS accuracy about +/-${Math.round(gpsAccuracyMeters)} m`
            : "Waiting for tighter on-device GPS accuracy"}
        </div>
        <div className={cn("mt-1 text-[11px] font-medium", theme.secondaryTextClassName)}>
          {hasPostedLimit
            ? hasDistance
              ? `${describeSpeedLimitConfidence(postedSpeedLimitConfidence)} (${Math.round(
                  Number(speedLimitMatchDistanceMeters)
                )} m)`
              : describeSpeedLimitConfidence(postedSpeedLimitConfidence)
            : "Speed limit confidence will appear when road data is available"}
        </div>
      </div>
    </div>
  );
}
