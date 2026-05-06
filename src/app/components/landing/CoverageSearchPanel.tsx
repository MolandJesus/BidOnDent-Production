import type { FormEvent } from "react";
import { LocateFixed, Radar, Search, X } from "lucide-react";
import { cn } from "../ui/utils";
import { getMapSurfaceTheme } from "../maps/mapSurfaceTheme";
import type { MapSurfaceTone } from "../maps/serviceCoverageMapTypes";
import type { NavigationAddressResult, NavigationAddressSuggestion } from "../../types/navigation";

type CoverageSearchPanelProps = {
  tone: MapSurfaceTone;
  searchQuery: string;
  zipCode: string;
  radiusMiles: string;
  normalizedZip: string;
  hasCoverageSignal: boolean;
  /** Phase 2 honesty (2026-05-03 P2): true when the active origin sits more
   * than 60mi from any NY county center. Drives explicit out-of-region copy
   * for GPS/address origins instead of the misleading
   * "the nearest service area" fallback. */
  isOutsideServiceRegion?: boolean;
  coverageCounty?: string;
  activeOriginMode: "zip" | "geolocation" | "address";
  activeOriginLabel: string;
  geoMessage: string;
  isFindingLocation: boolean;
  isSearchingAddresses: boolean;
  canCenterMap: boolean;
  locationError?: string | null;
  locationPermissionState?: "granted" | "denied" | "prompt" | "unknown" | "unsupported";
  addressSuggestions: NavigationAddressSuggestion[];
  addressResults: NavigationAddressResult[];
  addressError: string;
  onZipCodeChange: (value: string) => void;
  onSearchSubmit: () => void;
  onChooseAddressResult: (result: NavigationAddressResult) => void;
  onClearAddressResult: () => void;
  onRadiusMilesChange: (value: string) => void;
  onCenterMap: () => void;
  onUseCurrentLocation: () => void;
  className?: string;
};

export default function CoverageSearchPanel({
  tone,
  searchQuery,
  radiusMiles,
  normalizedZip,
  hasCoverageSignal,
  isOutsideServiceRegion = false,
  coverageCounty,
  activeOriginMode,
  activeOriginLabel,
  geoMessage,
  isFindingLocation,
  isSearchingAddresses,
  canCenterMap,
  locationError,
  locationPermissionState,
  addressSuggestions,
  addressResults,
  addressError,
  onZipCodeChange,
  onSearchSubmit,
  onChooseAddressResult,
  onClearAddressResult,
  onRadiusMilesChange,
  onCenterMap,
  onUseCurrentLocation,
  className,
}: CoverageSearchPanelProps) {
  const theme = getMapSurfaceTheme(tone);
  const fieldClassName =
    tone === "light"
      ? "h-11 rounded-[1.1rem] border border-sky-200/80 bg-blue-50/85 px-4 text-slate-900 shadow-[inset_0_1px_0_rgba(252,240,208,0.55)] outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-sky-50/95"
      : "h-11 rounded-[1.1rem] border border-white/12 bg-slate-900/72 px-4 text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400/40 focus:bg-slate-900/88";
  const actionButtonClassName =
    "!min-h-[44px] w-full justify-center !gap-1.5 !px-3.5 !py-2 text-[11px] leading-tight sm:text-xs";
  const showAddressMatches =
    normalizedZip.length === 0 && (addressSuggestions.length > 0 || addressResults.length > 0);
  const resultOptions = addressResults.length > 0 ? addressResults : [];
  const originModeLabel =
    activeOriginMode === "geolocation"
      ? "Live GPS"
      : activeOriginMode === "address"
        ? "Manual address"
        : normalizedZip.length >= 5
          ? "ZIP search"
          : "Regional view";
  /*
   * Phase 2 honesty (2026-05-03 P2): origin badge color follows the live
   * origin state. Out-of-region GPS/address origins switch to amber so the
   * visual cue matches the "outside our NY service region" copy below —
   * green-emerald on an out-of-region origin read as a successful match.
   */
  const originBadgeClassName =
    isOutsideServiceRegion && activeOriginMode !== "zip"
      ? tone === "light"
        ? "border-amber-200/80 bg-amber-50 text-amber-800"
        : "border-amber-400/25 bg-amber-500/15 text-amber-200"
      : activeOriginMode === "geolocation"
        ? tone === "light"
          ? "border-emerald-200/80 bg-emerald-50 text-emerald-800"
          : "border-emerald-400/25 bg-emerald-500/15 text-emerald-200"
        : activeOriginMode === "address"
          ? tone === "light"
            ? "border-sky-200/80 bg-sky-50 text-sky-800"
            : "border-sky-400/25 bg-sky-500/15 text-sky-200"
          : theme.softBadgeClassName;
  /*
   * Phase 2 honesty (2026-05-03 P2): GPS/address origins now route through
   * `isOutsideServiceRegion` so a user who taps "My Location" from outside NY
   * (Atlanta, etc.) sees explicit out-of-region copy instead of the prior
   * "the nearest service area" fallback — which implied a service area
   * existed near them when our soft-launch coverage is NY counties only.
   */
  const originSummary =
    activeOriginMode === "address"
      ? isOutsideServiceRegion
        ? `${activeOriginLabel} sits outside our current NY service region. Try a NY ZIP or address, or browse the regions above.`
        : `Routes and recommendations now follow ${activeOriginLabel}.`
      : activeOriginMode === "geolocation"
        ? isOutsideServiceRegion
          ? "Your live location is outside our current NY service region. Use a NY ZIP or address to see partner shops, or browse the regions above."
          : geoMessage ||
            "Using your live location to focus the map on the nearest NY partner shops."
        : normalizedZip.length > 0
          ? hasCoverageSignal
            ? `${normalizedZip} lands inside ${coverageCounty || "our NY service area"}. Partner shops will list here as they come online.`
            : `${normalizedZip} sits outside our current NY service region — we're focused on NY counties for now.`
          : "Start with a ZIP, full address, or live location to focus the map.";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearchSubmit();
  }

  return (
    <div className={cn("overflow-hidden p-3.5 sm:p-4", theme.panelClassName, className)}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <div className={theme.metricLabelClassName}>Coverage search</div>
            <div className={cn("mt-1 text-base font-semibold sm:text-lg", theme.titleClassName)}>
              ZIP, address, or live GPS
            </div>
            <p className={cn("mt-1 text-sm leading-6", theme.secondaryTextClassName)}>
              Focus the map quickly and keep the nearby shop list in sync.
            </p>
          </div>

          <div className="flex flex-wrap items-start content-start self-start gap-2 lg:max-w-[19rem] lg:justify-end">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                theme.softBadgeClassName
              )}
            >
              {radiusMiles} mi radius
            </span>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                originBadgeClassName
              )}
            >
              {originModeLabel}
            </span>
            {hasCoverageSignal && coverageCounty ? (
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold",
                  theme.softBadgeClassName
                )}
              >
                {coverageCounty}
              </span>
            ) : null}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative min-w-0 lg:flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => onZipCodeChange(event.target.value)}
              placeholder="Search ZIP, address, or place"
              enterKeyHint="search"
              className={cn(fieldClassName, "w-full min-w-0 pl-11 text-base")}
            />
          </div>
          <select
            value={radiusMiles}
            onChange={(event) => onRadiusMilesChange(event.target.value)}
            className={cn(fieldClassName, "w-full shrink-0 text-sm lg:w-[118px]")}
          >
            <option value="10">10 mi</option>
            <option value="20">20 mi</option>
            <option value="25">25 mi</option>
            <option value="35">35 mi</option>
          </select>
          <button
            type="submit"
            className={cn(
              theme.primaryButtonClassName,
              "min-h-[44px] w-full justify-center px-4 text-sm lg:w-auto lg:min-w-[126px]"
            )}
          >
            <Search className="h-3.5 w-3.5" />
            {isSearchingAddresses ? "Searching..." : "Find Shops"}
          </button>
        </form>

        {showAddressMatches ? (
          <div className={cn("overflow-hidden rounded-[1.25rem] border", theme.panelClassName)}>
            <div className="max-h-56 overflow-y-auto py-1.5">
              {addressSuggestions.length > 0 && resultOptions.length === 0
                ? addressSuggestions.slice(0, 5).map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() =>
                        onChooseAddressResult({
                          id: suggestion.id,
                          label: suggestion.subtitle || suggestion.title,
                          primaryLabel: suggestion.title,
                          secondaryLabel: suggestion.subtitle,
                          lat: suggestion.coordinate.lat,
                          lng: suggestion.coordinate.lng,
                          provider: suggestion.provider,
                        })
                      }
                      className={cn(
                        "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors",
                        tone === "light" ? "hover:bg-sky-50/90" : "hover:bg-white/[0.05]"
                      )}
                    >
                      <Search className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <div className={cn("truncate text-sm font-semibold", theme.titleClassName)}>
                          {suggestion.title}
                        </div>
                        {suggestion.subtitle ? (
                          <div className={cn("truncate text-xs", theme.secondaryTextClassName)}>
                            {suggestion.subtitle}
                          </div>
                        ) : null}
                      </div>
                    </button>
                  ))
                : resultOptions.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => onChooseAddressResult(result)}
                      className={cn(
                        "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors",
                        tone === "light" ? "hover:bg-sky-50/90" : "hover:bg-white/[0.05]"
                      )}
                    >
                      <Search className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <div className={cn("truncate text-sm font-semibold", theme.titleClassName)}>
                          {result.primaryLabel}
                        </div>
                        <div className={cn("truncate text-xs", theme.secondaryTextClassName)}>
                          {result.secondaryLabel || result.label}
                        </div>
                      </div>
                    </button>
                  ))}
            </div>
          </div>
        ) : null}

        <div className="grid gap-2.5 xl:items-start xl:grid-cols-[minmax(0,1fr)_minmax(220px,248px)]">
          <div className={cn("rounded-[1.25rem] border p-3.5 sm:p-4", theme.panelClassName)}>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className={theme.metricLabelClassName}>Active origin</div>
                <div className={cn("mt-1 text-base font-semibold", theme.titleClassName)}>
                  {activeOriginLabel || "Coverage overview"}
                </div>
                <p className={cn("mt-1 text-sm leading-6", theme.secondaryTextClassName)}>
                  {originSummary}
                </p>
              </div>

              {activeOriginMode === "address" ? (
                <button
                  type="button"
                  onClick={onClearAddressResult}
                  className={cn(
                    theme.secondaryButtonClassName,
                    "!min-h-[44px] !px-3 !py-1.5 !text-xs"
                  )}
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              ) : (
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                    originBadgeClassName
                  )}
                >
                  {originModeLabel}
                </span>
              )}
            </div>
          </div>

          <div className="grid auto-rows-max content-start grid-cols-2 gap-2 self-start xl:grid-cols-1">
            <button
              type="button"
              onClick={onUseCurrentLocation}
              className={cn(
                theme.secondaryButtonClassName,
                actionButtonClassName,
                locationError &&
                  (tone === "light"
                    ? "border-amber-300/60 bg-amber-100/80 text-amber-800 hover:bg-amber-200/80"
                    : "border-amber-400/30 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25")
              )}
            >
              <Radar className="h-3.5 w-3.5" />
              {isFindingLocation ? "Finding..." : locationError ? "Ask Again" : "My Location"}
            </button>
            <button
              type="button"
              onClick={onCenterMap}
              disabled={!canCenterMap}
              className={cn(
                theme.secondaryButtonClassName,
                actionButtonClassName,
                "disabled:translate-y-0 disabled:opacity-50"
              )}
            >
              <LocateFixed className="h-3.5 w-3.5" />
              Center Map
            </button>
          </div>
        </div>

        {addressError && normalizedZip.length === 0 ? (
          <div
            className={cn(
              "rounded-[1.2rem] border px-3.5 py-3 text-sm",
              tone === "light"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-amber-300/20 bg-amber-500/10 text-amber-200"
            )}
          >
            {addressError}
          </div>
        ) : locationError ? (
          <div
            className={cn(
              "rounded-[1.2rem] border px-3.5 py-3 text-sm",
              tone === "light"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-amber-300/20 bg-amber-500/10 text-amber-200"
            )}
          >
            <p>{locationError}</p>
            {locationPermissionState === "denied" ? (
              <button
                type="button"
                onClick={onUseCurrentLocation}
                className={cn(
                  "mt-2 text-xs font-medium underline transition-colors",
                  tone === "light"
                    ? "text-amber-700 hover:text-amber-900"
                    : "text-amber-300 hover:text-amber-100"
                )}
              >
                Ask for location again
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
