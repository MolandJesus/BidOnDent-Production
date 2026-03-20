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
};

export default function MapSurfaceStatusBar({
  tone,
  regionCount,
  partnerShopCount,
  modeLabel,
  radiusMiles,
  overviewLabel,
}: MapSurfaceStatusBarProps) {
  const theme = getMapSurfaceTheme(tone);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[400] flex flex-wrap items-end justify-between gap-3 p-4">
      <div className={cn("pointer-events-auto flex flex-wrap items-center gap-4 px-4 py-3", theme.panelStrongClassName)}>
        <div>
          <div className={theme.metricLabelClassName}>Regions</div>
          <div className={cn("text-sm font-semibold", theme.titleClassName)}>{regionCount} NY regions</div>
        </div>
        <div>
          <div className={theme.metricLabelClassName}>Partners</div>
          <div className={cn("text-sm font-semibold", theme.titleClassName)}>{partnerShopCount} live shops</div>
        </div>
        <div>
          <div className={theme.metricLabelClassName}>Map mode</div>
          <div className={cn("text-sm font-semibold", theme.titleClassName)}>{overviewLabel || modeLabel}</div>
        </div>
      </div>

      {radiusMiles ? (
        <div className={cn("pointer-events-auto inline-flex flex-wrap items-center gap-2 px-4 py-3", theme.accentPanelClassName)}>
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
