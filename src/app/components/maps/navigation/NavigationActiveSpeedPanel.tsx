import { cn } from "../../ui/utils";
import { getMapSurfaceTheme } from "../mapSurfaceTheme";
import type { MapSurfaceTone } from "../serviceCoverageMapTypes";
import CurrentSpeedBadge from "./CurrentSpeedBadge";
import SpeedLimitBadge from "./SpeedLimitBadge";

type NavigationActiveSpeedPanelProps = {
  tone: MapSurfaceTone;
  currentSpeedMph?: number | null;
  postedSpeedLimitMph?: number | null;
  roadName?: string | null;
  gpsAccuracyMeters?: number | null;
};

export default function NavigationActiveSpeedPanel({
  tone,
  currentSpeedMph,
  postedSpeedLimitMph,
  roadName,
  gpsAccuracyMeters,
}: NavigationActiveSpeedPanelProps) {
  const theme = getMapSurfaceTheme(tone, true);

  return (
    <div className="pointer-events-none absolute bottom-[18rem] right-4 z-[560] flex max-w-[calc(100%-2rem)] flex-col items-end gap-3 md:bottom-8 md:right-24">
      <div className="pointer-events-auto flex items-end gap-3">
        <CurrentSpeedBadge
          tone={tone}
          currentSpeedMph={currentSpeedMph}
          postedSpeedLimitMph={postedSpeedLimitMph}
        />
        <SpeedLimitBadge postedSpeedLimitMph={postedSpeedLimitMph} />
      </div>

      <div className={cn("pointer-events-auto max-w-[280px] px-4 py-3", theme.panelClassName)}>
        <div className={theme.metricLabelClassName}>Current road</div>
        <div className={cn("mt-1 text-sm font-semibold", theme.titleClassName)}>
          {roadName || "Looking up the nearest road"}
        </div>
        <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
          {gpsAccuracyMeters
            ? `GPS accuracy about +/-${Math.round(gpsAccuracyMeters)} m`
            : "Waiting for tighter on-device GPS accuracy"}
        </div>
      </div>
    </div>
  );
}
