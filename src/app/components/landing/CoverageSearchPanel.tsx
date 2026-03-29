import type { FormEvent } from "react";
import { Expand, LocateFixed, Navigation, Radar, Search, X } from "lucide-react";
import { cn } from "../ui/utils";
import { getMapSurfaceTheme } from "../maps/mapSurfaceTheme";
import type { MapSurfaceTone } from "../maps/serviceCoverageMapTypes";
import type {
  NavigationAddressResult,
  NavigationAddressSuggestion,
} from "../../types/navigation";

type CoverageSearchPanelProps = {
  tone: MapSurfaceTone;
  searchQuery: string;
  zipCode: string;
  radiusMiles: string;
  normalizedZip: string;
  hasCoverageSignal: boolean;
  coverageCounty?: string;
  activeOriginMode: "zip" | "geolocation" | "address";
  activeOriginLabel: string;
  geoMessage: string;
  isFindingLocation: boolean;
  isSearchingAddresses: boolean;
  canCenterMap: boolean;
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
  onExpandMap: () => void;
};

export default function CoverageSearchPanel({
  tone,
  searchQuery,
  zipCode,
  radiusMiles,
  normalizedZip,
  hasCoverageSignal,
  coverageCounty,
  activeOriginMode,
  activeOriginLabel,
  geoMessage,
  isFindingLocation,
  isSearchingAddresses,
  canCenterMap,
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
  onExpandMap,
}: CoverageSearchPanelProps) {
  const theme = getMapSurfaceTheme(tone);
  const fieldClassName =
    tone === "light"
      ? "h-12 rounded-[1.25rem] border border-white/85 bg-white/82 px-4 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white"
      : "h-12 rounded-[1.25rem] border border-white/12 bg-slate-900/72 px-4 text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400/40 focus:bg-slate-900/88";
  const actionButtonClassName =
    "min-h-[44px] w-full justify-center px-3 text-xs sm:min-h-[42px] sm:text-[12px]";
  const showAddressMatches =
    normalizedZip.length === 0 && (addressSuggestions.length > 0 || addressResults.length > 0);
  const resultOptions = addressResults.length > 0 ? addressResults : [];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearchSubmit();
  }

  return (
    <div className={cn("mt-0 p-3 sm:p-5 overflow-hidden", theme.panelStrongClassName)}>
      {/* Search + radius command bar */}
      <form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="relative min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(event) => onZipCodeChange(event.target.value)}
            placeholder="Search ZIP, home, or store address"
            className={cn(fieldClassName, "w-full min-w-0 pl-11 text-base h-11 sm:h-12")}
          />
        </div>
        <div className="grid grid-cols-[auto_auto] gap-2 sm:contents">
          <select
            value={radiusMiles}
            onChange={(event) => onRadiusMilesChange(event.target.value)}
            className={cn(fieldClassName, "w-full sm:w-[110px] shrink-0 text-sm h-11 sm:h-12")}
          >
            <option value="10">10 mi</option>
            <option value="20">20 mi</option>
            <option value="25">25 mi</option>
            <option value="35">35 mi</option>
          </select>
          <button
            type="submit"
            className={cn(
              theme.secondaryButtonClassName,
              "min-h-[44px] justify-center px-4 text-xs sm:min-h-[48px] sm:min-w-[120px]"
            )}
          >
            <Search className="h-3.5 w-3.5" />
            {isSearchingAddresses ? "Searching..." : "Find"}
          </button>
        </div>
      </form>

      {showAddressMatches ? (
        <div className={cn("mt-2 overflow-hidden rounded-[1.2rem] border", theme.panelClassName)}>
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
                      tone === "light"
                        ? "hover:bg-sky-50/90"
                        : "hover:bg-white/[0.05]"
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
                      tone === "light"
                        ? "hover:bg-sky-50/90"
                        : "hover:bg-white/[0.05]"
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

      {/* Compact action row */}
      <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <button
          type="button"
          onClick={onUseCurrentLocation}
          className={cn(
            theme.secondaryButtonClassName,
            actionButtonClassName,
            "sm:min-w-[154px]"
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
            actionButtonClassName,
            "sm:min-w-[118px] disabled:translate-y-0 disabled:opacity-50"
          )}
        >
          <LocateFixed className="h-3.5 w-3.5" />
          Center
        </button>
        <button
          type="button"
          onClick={onExpandMap}
          className={cn(
            theme.primaryButtonClassName,
            actionButtonClassName,
            "col-span-2 sm:col-span-1 sm:min-w-[146px]"
          )}
        >
          <Expand className="h-3.5 w-3.5" />
          Full Map
        </button>
      </div>

      <div
        className={cn(
          "mt-2 rounded-[1.05rem] border px-3 py-2 text-[11px] sm:text-xs",
          theme.panelClassName
        )}
      >
        <span className="font-semibold tracking-[0.18em] uppercase">Origin</span>{" "}
        <span className={theme.secondaryTextClassName}>{activeOriginLabel || "Coverage overview"}</span>
        {activeOriginMode === "address" ? (
          <button
            type="button"
            onClick={onClearAddressResult}
            className={cn(
              "ml-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
              theme.softBadgeClassName
            )}
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        ) : null}
      </div>

      {activeOriginMode === "address" ? (
        <div
          className={cn(
            "mt-2.5 sm:mt-3 rounded-[1.35rem] border px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm leading-relaxed",
            tone === "light"
              ? "border-blue-200/80 bg-blue-50/90 text-blue-900"
              : "border-blue-400/20 bg-blue-500/10 text-blue-200"
          )}
        >
          Using {activeOriginLabel} as the route origin. Nearby partner shops and in-app turn-by-turn routing now follow this selected address.
        </div>
      ) : normalizedZip.length > 0 ? (
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

      {addressError && normalizedZip.length === 0 ? (
        <div
          className={cn(
            "mt-2.5 sm:mt-3 rounded-[1.2rem] border px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm",
            tone === "light"
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-amber-300/20 bg-amber-500/10 text-amber-200"
          )}
        >
          {addressError}
        </div>
      ) : geoMessage ? (
        <div
          className={cn(
            "mt-2.5 sm:mt-3 rounded-[1.2rem] border px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm",
            theme.accentPanelClassName
          )}
        >
          {geoMessage}
        </div>
      ) : null}

      {normalizedZip.length > 0 || activeOriginMode === "address" ? (
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
            Select a shop to preview live routes, review nearby shop details, and continue inside BidOnDent Maps.
          </span>
        </div>
      ) : null}
    </div>
  );
}
