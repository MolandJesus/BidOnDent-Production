import { Expand, LocateFixed, Navigation, Radar } from "lucide-react";
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
      ? "h-12 rounded-[1.1rem] border border-white/85 bg-white/82 px-4 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white"
      : "h-12 rounded-[1.1rem] border border-white/12 bg-slate-900/72 px-4 text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400/40 focus:bg-slate-900/88";
  const summaryPillClassName =
    tone === "light"
      ? "rounded-full border border-white/80 bg-white/76 px-3 py-1.5 text-xs font-medium text-slate-600"
      : "rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-medium text-slate-300";

  return (
    <div className={cn("mt-8 p-5 sm:p-6", theme.panelStrongClassName)}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={theme.eyebrowClassName}>Find Nearby Shops</span>
            <span className={theme.softBadgeClassName}>Search stays on your device</span>
          </div>
          <h4 className={cn("mt-4 text-2xl font-semibold", theme.titleClassName)}>
            Find the best body shop near you
          </h4>
          <p className={cn("mt-2 text-sm leading-6", theme.bodyClassName)}>
            Search by ZIP or use your live location to discover trusted repair shops nearby, then
            get directions through your preferred navigation app.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={summaryPillClassName}>
            {activeOriginMode === "geolocation"
              ? currentLocationLabel || "Using your location"
              : "Search by ZIP"}
          </span>
          <span className={summaryPillClassName}>{radiusMiles}-mile radius</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_140px]">
        <label className="block">
          <span className={cn("mb-2 block text-sm font-semibold", theme.titleClassName)}>
            ZIP code
          </span>
          <input
            value={zipCode}
            onChange={(event) => onZipCodeChange(event.target.value)}
            placeholder="Enter a New York ZIP code"
            className={fieldClassName}
          />
        </label>

        <label className="block">
          <span className={cn("mb-2 block text-sm font-semibold", theme.titleClassName)}>
            Radius
          </span>
          <select
            value={radiusMiles}
            onChange={(event) => onRadiusMilesChange(event.target.value)}
            className={fieldClassName}
          >
            <option value="10">10 miles</option>
            <option value="20">20 miles</option>
            <option value="25">25 miles</option>
            <option value="35">35 miles</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onExpandMap}
          className={cn(
            theme.primaryButtonClassName,
            "min-h-[44px] justify-center"
          )}
        >
          <Expand className="h-4 w-4" />
          Open Full Map
        </button>
        <button
          type="button"
          onClick={onCenterMap}
          disabled={!canCenterMap}
          className={cn(
            theme.secondaryButtonClassName,
            "min-h-[44px] justify-center disabled:translate-y-0 disabled:opacity-50"
          )}
        >
          <LocateFixed className="h-4 w-4" />
          Center
        </button>
        <button
          type="button"
          onClick={onUseCurrentLocation}
          className={cn(theme.secondaryButtonClassName, "min-h-[44px] justify-center")}
        >
          <Radar className="h-4 w-4" />
          {isFindingLocation ? "Finding..." : "My Location"}
        </button>
      </div>

      {normalizedZip.length > 0 ? (
        <div
          className={cn(
            "mt-4 rounded-[1.35rem] border px-4 py-3 text-sm",
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
            "mt-3 rounded-[1.2rem] border px-4 py-3 text-sm",
            theme.accentPanelClassName
          )}
        >
          {geoMessage}
        </div>
      ) : null}

      <div
        className={cn(
          "mt-3 flex items-center gap-2.5 rounded-[1.2rem] px-4 py-2.5 text-sm",
          theme.panelClassName
        )}
      >
        <Navigation
          className={cn("h-3.5 w-3.5 shrink-0", tone === "light" ? "text-sky-600" : "text-cyan-300")}
        />
        <span className={theme.secondaryTextClassName}>
          Select a shop to preview routes and launch directions in your preferred maps app.
        </span>
      </div>
    </div>
  );
}
