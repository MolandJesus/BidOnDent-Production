import { Expand, LocateFixed, Map as MapIcon, MoonStar, Satellite, ScanSearch } from "lucide-react";
import { cn } from "../ui/utils";
import { getMapSurfaceTheme } from "./mapSurfaceTheme";
import type { MapSurfaceTone, MapTileMode } from "./serviceCoverageMapTypes";

type MapSurfaceControlsProps = {
  tone: MapSurfaceTone;
  tileMode: MapTileMode;
  canCenter: boolean;
  onTileModeChange: (mode: MapTileMode) => void;
  onCenterActive: () => void;
  onResetView: () => void;
  onExpand?: () => void;
};

export default function MapSurfaceControls({
  tone,
  tileMode,
  canCenter,
  onTileModeChange,
  onCenterActive,
  onResetView,
  onExpand,
}: MapSurfaceControlsProps) {
  const theme = getMapSurfaceTheme(tone);

  return (
    <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
      <div className={theme.segmentedClassName}>
        <button
          type="button"
          onClick={() => onTileModeChange("roadmap")}
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold transition sm:h-10 sm:gap-2 sm:px-4 sm:text-sm",
            tileMode === "roadmap" ? theme.activeSegmentClassName : theme.inactiveSegmentClassName
          )}
        >
          <MapIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Map</span>
        </button>
        <button
          type="button"
          onClick={() => onTileModeChange("night")}
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold transition sm:h-10 sm:gap-2 sm:px-4 sm:text-sm",
            tileMode === "night" ? theme.activeSegmentClassName : theme.inactiveSegmentClassName
          )}
        >
          <MoonStar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Night</span>
        </button>
        <button
          type="button"
          onClick={() => onTileModeChange("satellite")}
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold transition sm:h-10 sm:gap-2 sm:px-4 sm:text-sm",
            tileMode === "satellite" ? theme.activeSegmentClassName : theme.inactiveSegmentClassName
          )}
        >
          <Satellite className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Satellite</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onCenterActive}
        disabled={!canCenter}
        className={cn(
          theme.secondaryButtonClassName,
          "disabled:translate-y-0 disabled:opacity-50 !h-8 !px-2.5 !text-xs sm:!h-auto sm:!px-4 sm:!text-sm"
        )}
      >
        <LocateFixed className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Focus</span>
      </button>

      <button
        type="button"
        onClick={onResetView}
        className={cn(
          theme.secondaryButtonClassName,
          "!h-8 !px-2.5 !text-xs sm:!h-auto sm:!px-4 sm:!text-sm"
        )}
      >
        <ScanSearch className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Overview</span>
      </button>

      {onExpand ? (
        <button
          type="button"
          onClick={onExpand}
          className={cn(
            theme.primaryButtonClassName,
            "!h-8 !px-2.5 !text-xs sm:!h-auto sm:!px-4 sm:!text-sm"
          )}
        >
          <Expand className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Expand
        </button>
      ) : null}
    </div>
  );
}
