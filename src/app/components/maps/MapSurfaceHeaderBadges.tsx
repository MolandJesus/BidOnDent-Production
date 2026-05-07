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
    <div className="pointer-events-auto flex flex-wrap items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-400 motion-reduce:animate-none">
      <div
        className={cn(
          "min-w-0 sm:min-w-[200px] px-2.5 py-2 sm:px-3.5 sm:py-2.5",
          theme.panelStrongClassName
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className={theme.eyebrowClassName}>BidOnDent Maps</span>
          {overviewBadge ? <span className={theme.softBadgeClassName}>{overviewBadge}</span> : null}
        </div>
        <div
          className={cn("mt-1 text-sm font-semibold sm:mt-1.5 sm:text-base", theme.titleClassName)}
        >
          Service Area
        </div>
        <div className={cn("mt-0.5 text-xs sm:text-xs", theme.bodyClassName)}>
          {activeFocusLabel}
        </div>
      </div>
    </div>
  );
}
