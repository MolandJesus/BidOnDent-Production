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
    <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
      <div className={theme.segmentedClassName}>
        <button
          type="button"
          onClick={() => onTileModeChange("roadmap")}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition",
            tileMode === "roadmap" ? theme.activeSegmentClassName : theme.inactiveSegmentClassName
          )}
        >
          <MapIcon className="h-4 w-4" />
          Map
        </button>
        <button
          type="button"
          onClick={() => onTileModeChange("night")}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition",
            tileMode === "night" ? theme.activeSegmentClassName : theme.inactiveSegmentClassName
          )}
        >
          <MoonStar className="h-4 w-4" />
          Night
        </button>
        <button
          type="button"
          onClick={() => onTileModeChange("satellite")}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition",
            tileMode === "satellite" ? theme.activeSegmentClassName : theme.inactiveSegmentClassName
          )}
        >
          <Satellite className="h-4 w-4" />
          Satellite
        </button>
      </div>

      <button
        type="button"
        onClick={onCenterActive}
        disabled={!canCenter}
        className={cn(theme.secondaryButtonClassName, "disabled:translate-y-0 disabled:opacity-50")}
      >
        <LocateFixed className="h-4 w-4" />
        Focus
      </button>

      <button type="button" onClick={onResetView} className={theme.secondaryButtonClassName}>
        <ScanSearch className="h-4 w-4" />
        Overview
      </button>

      {onExpand ? (
        <button type="button" onClick={onExpand} className={theme.primaryButtonClassName}>
          <Expand className="h-4 w-4" />
          Expand
        </button>
      ) : null}
    </div>
  );
}
