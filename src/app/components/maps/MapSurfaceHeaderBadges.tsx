import { cn } from "../ui/utils";
import { getMapSurfaceTheme } from "./mapSurfaceTheme";
import type { MapSurfaceTone } from "./serviceCoverageMapTypes";

type MapSurfaceHeaderBadgesProps = {
  tone: MapSurfaceTone;
  activeFocusLabel: string;
  overviewBadge?: string | null;
};

export default function MapSurfaceHeaderBadges({
  tone,
  activeFocusLabel,
  overviewBadge,
}: MapSurfaceHeaderBadgesProps) {
  const theme = getMapSurfaceTheme(tone);

  return (
    <div className="pointer-events-auto flex flex-wrap items-start gap-2">
      <div className={cn("min-w-[240px] px-4 py-3", theme.panelStrongClassName)}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={theme.eyebrowClassName}>BidOnDent Maps</span>
          {overviewBadge ? <span className={theme.softBadgeClassName}>{overviewBadge}</span> : null}
        </div>
        <div className={cn("mt-3 text-lg font-semibold", theme.titleClassName)}>Service Area</div>
        <div className={cn("mt-1 text-sm", theme.bodyClassName)}>{activeFocusLabel}</div>
      </div>
    </div>
  );
}
