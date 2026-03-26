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
      <div
        className={cn(
          "min-w-0 sm:min-w-[240px] px-2.5 py-2 sm:px-4 sm:py-3",
          theme.panelStrongClassName
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className={theme.eyebrowClassName}>BidOnDent Maps</span>
          {overviewBadge ? <span className={theme.softBadgeClassName}>{overviewBadge}</span> : null}
        </div>
        <div className={cn("mt-1 text-sm font-semibold sm:mt-3 sm:text-lg", theme.titleClassName)}>
          Service Area
        </div>
        <div className={cn("mt-0.5 text-xs sm:mt-1 sm:text-sm", theme.bodyClassName)}>
          {activeFocusLabel}
        </div>
      </div>
    </div>
  );
}
