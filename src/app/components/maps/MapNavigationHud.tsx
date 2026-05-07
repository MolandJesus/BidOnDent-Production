import { MapPinned, Volume2, VolumeX } from "lucide-react";
import { cn } from "../ui/utils";
import { getMapSurfaceTheme } from "./mapSurfaceTheme";
import type { MapSurfaceTone } from "./serviceCoverageMapTypes";
import type { NavigationSpeedLimitConfidence, NavigationVoiceMode } from "../../types/navigation";
import CurrentSpeedBadge from "./navigation/CurrentSpeedBadge";
import SpeedLimitBadge from "./navigation/SpeedLimitBadge";

type MapNavigationHudProps = {
  tone: MapSurfaceTone;
  currentSpeedMph?: number | null;
  postedSpeedLimitMph?: number | null;
  postedSpeedLimitConfidence?: NavigationSpeedLimitConfidence | null;
  speedLimitMatchDistanceMeters?: number | null;
  nearestRoadName?: string | null;
  gpsAccuracyMeters?: number | null;
  nextInstruction?: string | null;
  voiceMode?: NavigationVoiceMode;
};

function voiceModeLabel(voiceMode: NavigationVoiceMode) {
  if (voiceMode === "muted") {
    return "Muted";
  }

  if (voiceMode === "alerts-only") {
    return "Important";
  }

  return "Full voice";
}

export default function MapNavigationHud({
  tone,
  currentSpeedMph,
  postedSpeedLimitMph,
  postedSpeedLimitConfidence,
  speedLimitMatchDistanceMeters,
  nearestRoadName,
  gpsAccuracyMeters,
  nextInstruction,
  voiceMode = "alerts-only",
}: MapNavigationHudProps) {
  if (
    !nextInstruction &&
    !Number.isFinite(currentSpeedMph) &&
    !Number.isFinite(postedSpeedLimitMph) &&
    !nearestRoadName &&
    !gpsAccuracyMeters
  ) {
    return null;
  }

  const theme = getMapSurfaceTheme(tone);
  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-20 z-[430] flex justify-end sm:inset-x-auto sm:right-4 animate-in fade-in slide-in-from-right-3 duration-400 motion-reduce:animate-none">
      <div className={cn("w-full max-w-[320px] p-4 sm:w-[320px]", theme.panelStrongClassName)}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className={theme.metricLabelClassName}>Live Navigation</div>
            <div className={cn("mt-1 text-sm font-semibold", theme.titleClassName)}>
              {nearestRoadName || "GPS route session"}
            </div>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
              theme.panelClassName
            )}
          >
            {voiceMode === "muted" ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
            <span className={cn("text-xs font-semibold", theme.bodyClassName)}>
              {voiceModeLabel(voiceMode)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <CurrentSpeedBadge
            tone={tone}
            currentSpeedMph={currentSpeedMph}
            postedSpeedLimitMph={postedSpeedLimitMph}
          />
          <div className="flex flex-1 flex-col items-center gap-2">
            <SpeedLimitBadge
              postedSpeedLimitMph={postedSpeedLimitMph}
              confidence={postedSpeedLimitConfidence}
            />
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
                theme.panelClassName
              )}
            >
              <MapPinned className="h-3.5 w-3.5" />
              <span className={cn("text-xs font-medium", theme.secondaryTextClassName)}>
                {gpsAccuracyMeters
                  ? `GPS ±${Math.round(gpsAccuracyMeters)} m`
                  : "Waiting for road data"}
                {Number.isFinite(speedLimitMatchDistanceMeters)
                  ? ` • road tag ${Math.round(Number(speedLimitMatchDistanceMeters))} m`
                  : ""}
              </span>
            </div>
          </div>
        </div>

        {nextInstruction ? (
          <div className={cn("mt-4 p-3", theme.accentPanelClassName)}>
            <div className={theme.metricLabelClassName}>Next maneuver</div>
            <div className={cn("mt-2 text-sm font-semibold leading-6", theme.titleClassName)}>
              {nextInstruction}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
