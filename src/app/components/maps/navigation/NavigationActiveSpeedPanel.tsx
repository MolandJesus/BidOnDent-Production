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
    <div className="pointer-events-none absolute bottom-[calc(max(env(safe-area-inset-bottom),0.75rem)_+_10rem)] right-3 z-[560] flex max-w-[min(220px,calc(100%-1.5rem))] flex-col items-end gap-2 sm:gap-2.5 sm:right-4 md:right-[5rem] md:max-w-[248px]">
      <div
        className={cn(
          "map-liquid-rail pointer-events-auto relative overflow-hidden rounded-[1.45rem] border p-2 sm:p-2.5 animate-in fade-in slide-in-from-right-3 duration-400 motion-reduce:animate-none",
          theme.panelStrongClassName
        )}
      >
        <div className="map-liquid-sheen pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative z-10 flex items-end gap-2 sm:gap-3">
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
      </div>

      {import.meta.env.DEV ? (
        <div
          className={cn(
            "map-liquid-panel map-ui-enter map-ui-enter-delay-1 pointer-events-auto hidden max-w-[248px] px-3.5 py-3 md:block",
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
      ) : null}
    </div>
  );
}
