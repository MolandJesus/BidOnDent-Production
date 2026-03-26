/**
 * CoverageBrowseMapOverlays — Floating HUD for browse-mode map
 *
 * Extracted from CoverageBrowseExperience (Pass 23).
 * Renders the top maneuver/action card and bottom route-stats HUD
 * that float above the map in the browse experience.
 */

import {
  AlertTriangle,
  Compass,
  Crosshair,
  MapPinned,
  MessageCircle,
  RotateCcw,
  Search,
  Star,
  Volume2,
} from "lucide-react";
import type { MapSurfaceTheme, MapTileMode } from "../maps/serviceCoverageMapTypes";
import type { CoveragePartnerShop } from "../maps/serviceCoverageMapTypes";
import { cn } from "../ui/utils";

type SidebarView = "search" | "explore" | "saved" | "shops";

type CoverageBrowseMapOverlaysProps = {
  className?: string;
  theme: MapSurfaceTheme;
  tileMode: MapTileMode;
  nextInstruction: string | null;
  selectedShop: CoveragePartnerShop | null;
  arrivalLabel: string;
  routeMinutes: number | null;
  routeMiles: string | null;
  canStartNavigation: boolean;
  onSidebarViewChange: (view: SidebarView) => void;
  onTileModeChange: (mode: MapTileMode) => void;
  onCenterMap: () => void;
  onResetMap: () => void;
  onStartNavigation: () => void;
};

export default function CoverageBrowseMapOverlays({
  className,
  theme,
  tileMode,
  nextInstruction,
  selectedShop,
  arrivalLabel,
  routeMinutes,
  routeMiles,
  canStartNavigation,
  onSidebarViewChange,
  onTileModeChange,
  onCenterMap,
  onResetMap,
  onStartNavigation,
}: CoverageBrowseMapOverlaysProps) {
  const tileButtons: Array<{ mode: MapTileMode; label: string }> = [
    { mode: "roadmap", label: "Map" },
    { mode: "satellite", label: "Satellite" },
    { mode: "night", label: "Night" },
  ];

  return (
    <div className={className}>
      <div className="pointer-events-none absolute inset-x-4 top-5 z-[620] flex items-start justify-between gap-4 xl:inset-x-6 xl:top-6 2xl:inset-x-8">
        <div className="pointer-events-auto flex max-w-[380px] flex-col gap-3">
          <div
            className={cn(
              "map-liquid-card map-glass-float map-ui-enter map-ui-enter-delay-1 overflow-hidden rounded-[1.5rem] border px-4 py-3 backdrop-blur-3xl",
              theme.panelStrongClassName
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className={theme.metricLabelClassName}>Next maneuver</div>
                <div
                  className={cn("mt-1 text-base font-semibold leading-tight", theme.titleClassName)}
                >
                  {nextInstruction || "Start route from the selected origin"}
                </div>
              </div>
              <span className={cn("shrink-0", theme.softBadgeClassName)}>
                {selectedShop ? "Route ready" : "Select shop"}
              </span>
            </div>

            <div className={cn("mt-2 text-sm", theme.secondaryTextClassName)}>
              {selectedShop
                ? `Destination: ${selectedShop.name}`
                : "Pick a partner shop to preview real-world travel time and launch directions."}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSidebarViewChange("shops")}
                className={theme.compactButtonClassName}
              >
                <MapPinned className="h-3.5 w-3.5" />
                Shops
              </button>
              <button
                type="button"
                onClick={() => onSidebarViewChange("explore")}
                className={theme.compactButtonClassName}
              >
                <Compass className="h-3.5 w-3.5" />
                Explore
              </button>
              <button
                type="button"
                onClick={onStartNavigation}
                disabled={!canStartNavigation}
                className={cn(
                  theme.primaryButtonClassName,
                  "min-h-[40px] px-4 py-2 text-xs disabled:opacity-50"
                )}
              >
                <Compass className="h-3.5 w-3.5" />
                Start Route
              </button>
            </div>
          </div>

          <div
            className={cn(
              "map-liquid-card map-ui-enter map-ui-enter-delay-2 rounded-[1.5rem] border px-3 py-3 backdrop-blur-3xl",
              theme.panelClassName
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className={theme.metricLabelClassName}>Browse tools</div>
                <div className={cn("mt-1 text-sm font-semibold", theme.titleClassName)}>
                  Search, save, and change the map view without leaving the map.
                </div>
              </div>
              <div className={cn("hidden xl:flex", theme.segmentedClassName)}>
                {tileButtons.map((tile) => (
                  <button
                    key={tile.mode}
                    type="button"
                    onClick={() => onTileModeChange(tile.mode)}
                    className={
                      tileMode === tile.mode
                        ? theme.compactActiveButtonClassName
                        : theme.compactButtonClassName
                    }
                    aria-label={`${tile.label} tile`}
                  >
                    {tile.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSidebarViewChange("search")}
                className={theme.compactButtonClassName}
                aria-label="Search panel"
              >
                <Search className="h-3.5 w-3.5" />
                Search
              </button>
              <button
                type="button"
                onClick={() => onSidebarViewChange("saved")}
                className={theme.compactButtonClassName}
                aria-label="Saved panel"
              >
                <Star className="h-3.5 w-3.5" />
                Saved
              </button>
              <button
                type="button"
                onClick={onCenterMap}
                className={theme.compactButtonClassName}
                aria-label="Center map"
              >
                <Crosshair className="h-3.5 w-3.5" />
                Recenter
              </button>
              <button
                type="button"
                onClick={onResetMap}
                className={theme.compactButtonClassName}
                aria-label="Reset map"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto map-ui-enter map-ui-enter-delay-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onSidebarViewChange("search")}
            className={theme.compactIconButtonClassName}
            aria-label="Open search tools"
          >
            <Compass className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onTileModeChange(tileMode === "night" ? "roadmap" : "night")}
            className={theme.compactIconButtonClassName}
            aria-label="Toggle night view"
          >
            <Volume2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onSidebarViewChange("explore")}
            className={theme.compactIconButtonClassName}
            aria-label="Share ETA and incidents"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onSidebarViewChange("shops")}
            className={theme.compactIconButtonClassName}
            aria-label="Report issue"
          >
            <AlertTriangle className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-5 z-[620] flex justify-center xl:inset-x-6 xl:bottom-6 2xl:inset-x-8">
        <div
          className={cn(
            "map-liquid-card map-ui-enter pointer-events-auto w-full max-w-[760px] rounded-[1.5rem] border px-5 py-4 backdrop-blur-3xl",
            theme.panelStrongClassName
          )}
        >
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className={cn("text-xl font-semibold tabular-nums", theme.titleClassName)}>
                {arrivalLabel}
              </div>
              <div className={cn("text-xs", theme.secondaryTextClassName)}>arrival</div>
            </div>
            <div>
              <div className={cn("text-xl font-semibold tabular-nums", theme.titleClassName)}>
                {routeMinutes ? `${routeMinutes}` : "--"}
              </div>
              <div className={cn("text-xs", theme.secondaryTextClassName)}>min</div>
            </div>
            <div>
              <div className={cn("text-xl font-semibold tabular-nums", theme.titleClassName)}>
                {routeMiles ? `${routeMiles}` : "--"}
              </div>
              <div className={cn("text-xs", theme.secondaryTextClassName)}>mi</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onSidebarViewChange("explore")}
              className={theme.compactButtonClassName}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Share ETA
            </button>
            <button
              type="button"
              onClick={onStartNavigation}
              disabled={!canStartNavigation}
              className={cn(
                theme.primaryButtonClassName,
                "min-h-[40px] px-5 py-2 text-xs disabled:opacity-50"
              )}
            >
              <Compass className="h-3.5 w-3.5" />
              Start Route
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
