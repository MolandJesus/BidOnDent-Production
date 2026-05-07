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

  // Bucket 5.8 (KI-074 partial): premium capsule rail wrapping all map
  // surface controls so they read as one premium glass control unit
  // instead of disconnected pills. Per-mode tuning: dark navy + cool
  // blue ring + black drop + bronze atmospheric halo; light cream-tint
  // + bronze ring + cool-shadow + bronze atmospheric halo.
  const capsuleRailClassName =
    tone === "light"
      ? "pointer-events-auto inline-flex flex-wrap items-center justify-end gap-1.5 rounded-full bg-[rgba(252,238,204,0.62)] backdrop-blur-md ring-1 ring-[rgba(140,82,22,0.28)] shadow-[0_8px_24px_rgba(15,30,60,0.16),0_0_30px_rgba(196,130,45,0.10)] px-1.5 py-1.5 sm:gap-2"
      : "pointer-events-auto inline-flex flex-wrap items-center justify-end gap-1.5 rounded-full bg-[rgba(10,22,45,0.72)] backdrop-blur-md ring-1 ring-[rgba(96,165,250,0.20)] shadow-[0_8px_24px_rgba(2,6,23,0.40),0_0_30px_rgba(196,130,45,0.12)] px-1.5 py-1.5 sm:gap-2";

  return (
    <div className={capsuleRailClassName}>
      <div className={theme.segmentedClassName}>
        <button
          type="button"
          onClick={() => onTileModeChange("roadmap")}
          aria-pressed={tileMode === "roadmap"}
          aria-label="Map tile mode: Map"
          className={cn(
            "inline-flex h-10 items-center gap-1 rounded-full px-2.5 text-xs font-semibold transition sm:gap-2 sm:px-4 sm:text-sm",
            tileMode === "roadmap" ? theme.activeSegmentClassName : theme.inactiveSegmentClassName
          )}
        >
          <MapIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {/* Pass 73 (2026-05-07) — KI-124 #8: tile-mode label is now always
              visible (was hidden on mobile). */}
          <span>Map</span>
        </button>
        <button
          type="button"
          onClick={() => onTileModeChange("night")}
          aria-pressed={tileMode === "night"}
          aria-label="Map tile mode: Night"
          className={cn(
            "inline-flex h-10 items-center gap-1 rounded-full px-2.5 text-xs font-semibold transition sm:gap-2 sm:px-4 sm:text-sm",
            tileMode === "night" ? theme.activeSegmentClassName : theme.inactiveSegmentClassName
          )}
        >
          <MoonStar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Night</span>
        </button>
        <button
          type="button"
          onClick={() => onTileModeChange("satellite")}
          aria-pressed={tileMode === "satellite"}
          aria-label="Map tile mode: Satellite"
          className={cn(
            "inline-flex h-10 items-center gap-1 rounded-full px-2.5 text-xs font-semibold transition sm:gap-2 sm:px-4 sm:text-sm",
            tileMode === "satellite" ? theme.activeSegmentClassName : theme.inactiveSegmentClassName
          )}
        >
          <Satellite className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Satellite</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onCenterActive}
        disabled={!canCenter}
        className={cn(
          theme.secondaryButtonClassName,
          "disabled:translate-y-0 disabled:opacity-50 !h-10 !px-2.5 !text-xs sm:!h-auto sm:!px-4 sm:!text-sm"
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
          "!h-10 !px-2.5 !text-xs sm:!h-auto sm:!px-4 sm:!text-sm"
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
            "!h-10 !px-2.5 !text-xs sm:!h-auto sm:!px-4 sm:!text-sm"
          )}
        >
          <Expand className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Expand
        </button>
      ) : null}
    </div>
  );
}
