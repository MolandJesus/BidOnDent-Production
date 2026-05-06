/**
 * CoverageBrowseMapOverlays — Floating HUD for browse-mode map
 *
 * Extracted from CoverageBrowseExperience (Pass 23).
 * Renders the top maneuver/action card and bottom route-stats HUD
 * that float above the map in the browse experience.
 */

import {
  Compass,
  Crosshair,
  Layers,
  MapPinned,
  MessageCircle,
  Moon,
  RotateCcw,
  Search,
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
  const hasRoute = routeMinutes !== null || routeMiles !== null;

  return (
    <div className={className}>
      {/* Top row: destination card (mobile/tablet only — sidebar covers xl) + right icon rail */}
      <div className="pointer-events-none absolute inset-x-3 top-4 z-[620] flex items-start justify-between gap-3 sm:inset-x-4 sm:top-5 xl:inset-x-6 xl:top-[4.5rem] 2xl:inset-x-8">
        {/* Destination / next-maneuver card — hidden on xl where sidebar shows this, only when shop selected */}
        {selectedShop && (
          <div className="pointer-events-auto xl:hidden flex max-w-[320px] flex-col gap-2.5 sm:max-w-[380px] sm:gap-3">
            <div
              className={cn(
                "map-liquid-card map-glass-float map-ui-enter map-ui-enter-delay-1 overflow-hidden rounded-[1.25rem] border px-3.5 py-2.5 backdrop-blur-3xl sm:rounded-[1.5rem] sm:px-4 sm:py-3",
                theme.panelStrongClassName
              )}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div>
                  <div className={theme.metricLabelClassName}>Destination</div>
                  <div
                    className={cn(
                      "mt-0.5 text-sm font-semibold leading-tight sm:mt-1 sm:text-base",
                      theme.titleClassName
                    )}
                  >
                    {selectedShop.name}
                  </div>
                </div>
                <span className={cn("shrink-0 text-[10px] sm:text-xs", theme.softBadgeClassName)}>
                  Route ready
                </span>
              </div>

              {nextInstruction && (
                <div
                  className={cn("mt-1.5 text-xs sm:mt-2 sm:text-sm", theme.secondaryTextClassName)}
                >
                  {nextInstruction}
                </div>
              )}

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
                <button
                  type="button"
                  onClick={() => onSidebarViewChange("shops")}
                  className={theme.compactButtonClassName}
                >
                  <MapPinned className="h-3.5 w-3.5" />
                  Shops
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right icon rail — map utility shortcuts */}
        <div className="pointer-events-auto map-ui-enter map-ui-enter-delay-3 ml-auto">
          <div
            className={cn(
              "map-liquid-rail relative flex flex-col gap-1.5 overflow-hidden rounded-[1.45rem] border p-1.5 sm:gap-2 sm:rounded-[1.65rem] sm:p-2",
              theme.panelStrongClassName
            )}
          >
            <div className="map-liquid-sheen pointer-events-none absolute inset-0 opacity-65" />
            <button
              type="button"
              onClick={() => onSidebarViewChange("search")}
              className={cn(theme.compactIconButtonClassName, "relative z-10")}
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const next =
                  tileMode === "roadmap" ? "night" : tileMode === "night" ? "satellite" : "roadmap";
                onTileModeChange(next);
              }}
              className={cn(theme.compactIconButtonClassName, "relative z-10")}
              aria-label={
                tileMode === "roadmap"
                  ? "Switch to night map"
                  : tileMode === "night"
                    ? "Switch to satellite"
                    : "Switch to roadmap"
              }
            >
              {tileMode === "satellite" ? (
                <Layers className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onCenterMap}
              className={cn(theme.compactIconButtonClassName, "relative z-10 hidden xl:flex")}
              aria-label="Center map"
            >
              <Crosshair className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onResetMap}
              className={cn(theme.compactIconButtonClassName, "relative z-10 hidden xl:flex")}
              aria-label="Reset map view"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom ETA bar — only when a route is loaded */}
      {hasRoute && (
        <div className="pointer-events-none absolute inset-x-3 bottom-4 z-[620] flex justify-center sm:inset-x-4 xl:inset-x-6 xl:bottom-6 2xl:inset-x-8">
          <div
            className={cn(
              // Pass 12 #3 — bottom strip absorbed into canonical bd-glass-card--map
              // surface so the landing Coverage ETA card matches the dashboard
              // ShopDirectory route preview surface (Pass 12 #4) under one
              // grammar instead of the legacy white-heavy map-liquid-card.
              "bd-glass-card--map map-ui-enter pointer-events-auto w-full max-w-[680px] rounded-[1.25rem] px-4 py-3 sm:rounded-[1.5rem] sm:px-5 sm:py-3.5"
            )}
          >
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div
                  className={cn(
                    "text-lg font-semibold tabular-nums sm:text-xl",
                    theme.titleClassName
                  )}
                >
                  {arrivalLabel}
                </div>
                <div className={cn("text-[10px] sm:text-xs", theme.secondaryTextClassName)}>
                  arrival
                </div>
              </div>
              <div>
                <div
                  className={cn(
                    "text-lg font-semibold tabular-nums sm:text-xl",
                    theme.titleClassName
                  )}
                >
                  {routeMinutes ?? "--"}
                </div>
                <div className={cn("text-[10px] sm:text-xs", theme.secondaryTextClassName)}>
                  min
                </div>
              </div>
              <div>
                <div
                  className={cn(
                    "text-lg font-semibold tabular-nums sm:text-xl",
                    theme.titleClassName
                  )}
                >
                  {routeMiles ?? "--"}
                </div>
                <div className={cn("text-[10px] sm:text-xs", theme.secondaryTextClassName)}>mi</div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
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
                  "min-h-[44px] px-5 py-2 text-xs disabled:opacity-50"
                )}
              >
                <Compass className="h-3.5 w-3.5" />
                Start Route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
