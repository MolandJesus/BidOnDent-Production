import { Expand, LocateFixed, Navigation, Radar, Search } from "lucide-react";
import { cn } from "../ui/utils";
import { getMapSurfaceTheme } from "../maps/mapSurfaceTheme";
import type { MapSurfaceTone } from "../maps/serviceCoverageMapTypes";

type CoverageSearchPanelProps = {
  tone: MapSurfaceTone;
  zipCode: string;
  radiusMiles: string;
  normalizedZip: string;
  hasCoverageSignal: boolean;
  coverageCounty?: string;
  activeOriginMode: "zip" | "geolocation";
  currentLocationLabel?: string | null;
  geoMessage: string;
  isFindingLocation: boolean;
  canCenterMap: boolean;
  onZipCodeChange: (value: string) => void;
  onRadiusMilesChange: (value: string) => void;
  onCenterMap: () => void;
  onUseCurrentLocation: () => void;
  onExpandMap: () => void;
};

export default function CoverageSearchPanel({
  tone,
  zipCode,
  radiusMiles,
  normalizedZip,
  hasCoverageSignal,
  coverageCounty,
  activeOriginMode,
  currentLocationLabel,
  geoMessage,
  isFindingLocation,
  canCenterMap,
  onZipCodeChange,
  onRadiusMilesChange,
  onCenterMap,
  onUseCurrentLocation,
  onExpandMap,
}: CoverageSearchPanelProps) {
  const theme = getMapSurfaceTheme(tone);
  const fieldClassName =
    tone === "light"
      ? "h-12 rounded-[1.25rem] border border-white/85 bg-white/82 px-4 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white"
      : "h-12 rounded-[1.25rem] border border-white/12 bg-slate-900/72 px-4 text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400/40 focus:bg-slate-900/88";
  const summaryPillClassName =
    tone === "light"
      ? "rounded-full border border-white/80 bg-white/76 px-3 py-1.5 text-xs font-medium text-slate-600"
      : "rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-medium text-slate-300";

  return (
    <div className={cn("mt-0 p-3 sm:p-5", theme.panelStrongClassName)}>
      {/* Apple Maps-style search bar — prominent, single row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            value={zipCode}
            onChange={(event) => onZipCodeChange(event.target.value)}
            placeholder="Search by ZIP code"
            className={cn(fieldClassName, "pl-11 text-base h-11 sm:h-12")}
          />
        </div>
        <select
          value={radiusMiles}
          onChange={(event) => onRadiusMilesChange(event.target.value)}
          className={cn(fieldClassName, "w-[90px] sm:w-[110px] shrink-0 text-sm h-11 sm:h-12")}
        >
          <option value="10">10 mi</option>
          <option value="20">20 mi</option>
          <option value="25">25 mi</option>
          <option value="35">35 mi</option>
        </select>
      </div>

      {/* Compact action row */}
      <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onUseCurrentLocation}
          className={cn(
            theme.secondaryButtonClassName,
            "min-h-[36px] sm:min-h-[40px] text-xs px-2.5 sm:px-3 justify-center"
          )}
        >
          <Radar className="h-3.5 w-3.5" />
          {isFindingLocation ? "Finding..." : "My Location"}
        </button>
        <button
          type="button"
          onClick={onCenterMap}
          disabled={!canCenterMap}
          className={cn(
            theme.secondaryButtonClassName,
            "min-h-[36px] sm:min-h-[40px] text-xs px-2.5 sm:px-3 justify-center disabled:translate-y-0 disabled:opacity-50"
          )}
        >
          <LocateFixed className="h-3.5 w-3.5" />
          Center
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onExpandMap}
          className={cn(
            theme.primaryButtonClassName,
            "min-h-[36px] sm:min-h-[40px] text-xs px-3 sm:px-4 justify-center"
          )}
        >
          <Expand className="h-3.5 w-3.5" />
          Full Map
        </button>
      </div>

      {/* Active mode summary */}
      <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className={summaryPillClassName}>
          {activeOriginMode === "geolocation"
            ? currentLocationLabel || "Using your location"
            : "Search by ZIP"}
        </span>
        <span className={summaryPillClassName}>{radiusMiles}-mile radius</span>
      </div>

      {normalizedZip.length > 0 ? (
        <div
          className={cn(
            "mt-2.5 sm:mt-3 rounded-[1.35rem] border px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm leading-relaxed",
            hasCoverageSignal
              ? tone === "light"
                ? "border-blue-200/80 bg-blue-50/90 text-blue-900"
                : "border-blue-400/20 bg-blue-500/10 text-blue-200"
              : tone === "light"
                ? "border-slate-200/80 bg-slate-50/90 text-slate-700"
                : "border-slate-400/20 bg-slate-500/10 text-slate-300"
          )}
        >
          {hasCoverageSignal
            ? `${normalizedZip} is in or near ${coverageCounty || "active coverage"}. Partner assignment is available in the selected radius.`
            : `We are still expanding coverage. ${normalizedZip} may need manual partner assignment.`}
        </div>
      ) : null}

      {geoMessage ? (
        <div
          className={cn(
            "mt-2.5 sm:mt-3 rounded-[1.2rem] border px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm",
            theme.accentPanelClassName
          )}
        >
          {geoMessage}
        </div>
      ) : null}

      <div
        className={cn(
          "mt-2.5 sm:mt-3 flex items-center gap-2 rounded-[1.2rem] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm",
          theme.panelClassName
        )}
      >
        <Navigation
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            tone === "light" ? "text-sky-600" : "text-cyan-300"
          )}
        />
        <span className={theme.secondaryTextClassName}>
          Select a shop to preview routes and launch directions in your preferred maps app.
        </span>
      </div>
    </div>
  );
}
