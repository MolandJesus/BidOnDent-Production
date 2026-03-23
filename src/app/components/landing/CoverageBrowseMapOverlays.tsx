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
  return (
    <div className={className}>
      {/* ── Top floating overlay: maneuver + quick actions ── */}
      <div className="pointer-events-none absolute inset-x-3 top-4 z-[620] flex items-start justify-between gap-4 md:inset-x-6 md:top-8">
        <div className="pointer-events-auto flex max-w-[320px] flex-col gap-2">
          <div
            className={cn(
              "map-liquid-card map-glass-float map-ui-enter map-ui-enter-delay-1 rounded-[1.25rem] border px-3 py-2.5 backdrop-blur-2xl",
              theme.panelStrongClassName
            )}
          >
            <div className={theme.metricLabelClassName}>Next maneuver</div>
            <div className={cn("mt-1 text-base font-semibold leading-tight", theme.titleClassName)}>
              {nextInstruction || "Start route from selected origin"}
            </div>
            <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
              {selectedShop ? `Destination: ${selectedShop.name}` : "Pick a partner shop to begin."}
            </div>
          </div>

          <div
            className={cn(
              "map-liquid-card map-ui-enter map-ui-enter-delay-2 rounded-[1.1rem] border px-2.5 py-2.5 backdrop-blur-3xl",
              theme.panelClassName
            )}
          >
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => onSidebarViewChange("search")}
                className={cn(theme.secondaryButtonClassName, "!py-1 !px-2 !text-[10px] !gap-1")}
                aria-label="Search panel"
              >
                <Search className="h-3 w-3" />
                Search
              </button>
              <button
                type="button"
                onClick={() => onSidebarViewChange("explore")}
                className={cn(theme.secondaryButtonClassName, "!py-1 !px-2 !text-[10px] !gap-1")}
                aria-label="Explore panel"
              >
                <Compass className="h-3 w-3" />
                Explore
              </button>
              <button
                type="button"
                onClick={() => onSidebarViewChange("saved")}
                className={cn(theme.secondaryButtonClassName, "!py-1 !px-2 !text-[10px] !gap-1")}
                aria-label="Saved panel"
              >
                <Star className="h-3 w-3" />
                Saved
              </button>
              <button
                type="button"
                onClick={() => onSidebarViewChange("shops")}
                className={cn(theme.secondaryButtonClassName, "!py-1 !px-2 !text-[10px] !gap-1")}
                aria-label="Shops panel"
              >
                <MapPinned className="h-3 w-3" />
                Shops
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => onTileModeChange("roadmap")}
                className={cn(
                  theme.secondaryButtonClassName,
                  "!py-1 !px-2 !text-[10px]",
                  tileMode === "roadmap" ? "!bg-sky-500/80 !text-white !border-sky-400/50" : null
                )}
                aria-label="Roadmap tile"
              >
                Map
              </button>
              <button
                type="button"
                onClick={() => onTileModeChange("satellite")}
                className={cn(
                  theme.secondaryButtonClassName,
                  "!py-1 !px-2 !text-[10px]",
                  tileMode === "satellite" ? "!bg-sky-500/80 !text-white !border-sky-400/50" : null
                )}
                aria-label="Satellite tile"
              >
                Sat
              </button>
              <button
                type="button"
                onClick={() => onTileModeChange("night")}
                className={cn(
                  theme.secondaryButtonClassName,
                  "!py-1 !px-2 !text-[10px]",
                  tileMode === "night" ? "!bg-sky-500/80 !text-white !border-sky-400/50" : null
                )}
                aria-label="Night tile"
              >
                Night
              </button>
              <button
                type="button"
                onClick={onCenterMap}
                className={cn(theme.secondaryButtonClassName, "!py-1 !px-2 !text-[10px] !gap-1")}
                aria-label="Center map"
              >
                <Crosshair className="h-3 w-3" />
                Center
              </button>
              <button
                type="button"
                onClick={onResetMap}
                className={cn(theme.secondaryButtonClassName, "!py-1 !px-2 !text-[10px] !gap-1")}
                aria-label="Reset map"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto map-ui-enter map-ui-enter-delay-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => onSidebarViewChange("search")}
            className={cn(theme.iconButtonClassName, "h-9 w-9")}
            aria-label="Navigation controls"
          >
            <Compass className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onSidebarViewChange("search")}
            className={cn(theme.iconButtonClassName, "h-9 w-9")}
            aria-label="Voice controls"
          >
            <Volume2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onSidebarViewChange("explore")}
            className={cn(theme.iconButtonClassName, "h-9 w-9")}
            aria-label="Share ETA and incidents"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onSidebarViewChange("shops")}
            className={cn(theme.iconButtonClassName, "h-9 w-9")}
            aria-label="Report issue"
          >
            <AlertTriangle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Bottom floating overlay: route stats + actions ── */}
      <div className="pointer-events-none absolute inset-x-3 bottom-4 z-[620] flex justify-center md:inset-x-6 md:bottom-8">
        <div
          className={cn(
            "map-liquid-card map-ui-enter pointer-events-auto w-full max-w-[680px] rounded-[1.5rem] border px-4 py-3 backdrop-blur-2xl",
            theme.panelStrongClassName
          )}
        >
          <div className="grid grid-cols-3 gap-2 text-center">
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

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onSidebarViewChange("explore")}
              className={cn(theme.secondaryButtonClassName, "!py-1.5 !px-3 !text-xs")}
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
                "!py-1.5 !px-4 !text-xs disabled:opacity-50"
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
