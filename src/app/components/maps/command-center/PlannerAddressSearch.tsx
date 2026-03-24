/**
 * PlannerAddressSearch — Address input, suggestions, results, and active origin display.
 *
 * Pure presentation component extracted from CoverageNavigationPlanner (Pass 27).
 * All state and orchestration remain in the parent shell.
 */

import { type FormEvent } from "react";
import { MapPin, Search } from "lucide-react";
import { cn } from "../../ui/utils";
import type { MapSurfaceTheme, MapSurfaceTone } from "../serviceCoverageMapTypes";
import type {
  NavigationAddressResult,
  NavigationAddressSuggestion,
} from "../../../types/navigation";

type PlannerAddressSearchProps = {
  tone: MapSurfaceTone;
  theme: MapSurfaceTheme;
  activeOriginLabel: string;
  selectedAddressResult: NavigationAddressResult | null;
  gpsTrackingEnabled: boolean;
  addressQuery: string;
  onAddressQueryChange: (value: string) => void;
  onSearchAddresses: () => void;
  addressResults: NavigationAddressResult[];
  addressSuggestions: NavigationAddressSuggestion[];
  isSearchingAddresses: boolean;
  addressError: string;
  onChooseAddressResult: (result: NavigationAddressResult) => void;
  onClearAddressResult: () => void;
};

export default function PlannerAddressSearch({
  tone,
  theme,
  activeOriginLabel,
  selectedAddressResult,
  gpsTrackingEnabled,
  addressQuery,
  onAddressQueryChange,
  onSearchAddresses,
  addressResults,
  addressSuggestions,
  isSearchingAddresses,
  addressError,
  onChooseAddressResult,
  onClearAddressResult,
}: PlannerAddressSearchProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchAddresses();
  };

  return (
    <>
      <div
        className={cn(
          "map-liquid-card map-ui-enter map-ui-enter-delay-1 flex items-center justify-between gap-2 p-3",
          theme.panelClassName
        )}
      >
        <div className="min-w-0 flex-1">
          <div className={theme.metricLabelClassName}>Your location</div>
          <div className={cn("mt-0.5 truncate text-sm font-semibold", theme.titleClassName)}>
            {selectedAddressResult?.primaryLabel || activeOriginLabel}
          </div>
        </div>
        <div className={cn("shrink-0 text-xs", theme.secondaryTextClassName)}>
          {gpsTrackingEnabled ? "GPS" : "Manual"}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className={cn(
          "map-liquid-card map-ui-enter map-ui-enter-delay-1 space-y-2 p-3",
          theme.panelClassName
        )}
      >
        <div>
          <label
            htmlFor="planner-address-search"
            className={cn("mb-1.5 block text-xs font-semibold", theme.titleClassName)}
          >
            Search house or store address
          </label>
          <div className="flex gap-1.5">
            <input
              id="planner-address-search"
              value={addressQuery}
              onChange={(event) => onAddressQueryChange(event.target.value)}
              placeholder="42 Broadway, New York..."
              className={cn(
                "h-9 flex-1 rounded-[0.875rem] border px-3 text-sm outline-none transition",
                tone === "light"
                  ? "border-white/80 bg-white/80 text-slate-900 placeholder:text-slate-400 focus:border-sky-300"
                  : "border-white/12 bg-slate-900/78 text-white placeholder:text-slate-400 focus:border-cyan-400/40"
              )}
            />
            <button
              type="submit"
              disabled={isSearchingAddresses}
              className={cn(
                theme.primaryButtonClassName,
                "!py-1.5 !px-3 !text-xs shrink-0 disabled:opacity-60"
              )}
            >
              <Search className="h-3.5 w-3.5" />
              {isSearchingAddresses ? "…" : "Search"}
            </button>
          </div>

          {addressSuggestions.length > 0 && !selectedAddressResult && !addressResults.length ? (
            <div className="map-ui-enter mt-1.5 space-y-0.5">
              {addressSuggestions.slice(0, 5).map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => {
                    onChooseAddressResult({
                      id: suggestion.id,
                      label: suggestion.subtitle || suggestion.title,
                      primaryLabel: suggestion.title,
                      secondaryLabel: suggestion.subtitle,
                      lat: suggestion.coordinate.lat,
                      lng: suggestion.coordinate.lng,
                      provider: suggestion.provider,
                    });
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-[0.75rem] px-2.5 py-1.5 text-left transition-colors",
                    tone === "light"
                      ? "hover:bg-sky-50 text-slate-800"
                      : "hover:bg-white/6 text-slate-200"
                  )}
                >
                  <MapPin className={cn("h-3.5 w-3.5 shrink-0", theme.secondaryTextClassName)} />
                  <div className="min-w-0 flex-1">
                    <div className={cn("truncate text-xs font-semibold", theme.titleClassName)}>
                      {suggestion.title}
                    </div>
                    {suggestion.subtitle ? (
                      <div className={cn("truncate text-[10px]", theme.secondaryTextClassName)}>
                        {suggestion.subtitle}
                      </div>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {selectedAddressResult ? (
          <div
            className={cn(
              "flex items-center justify-between gap-3 rounded-[1rem] px-3 py-2",
              theme.accentPanelClassName
            )}
          >
            <div>
              <div className={cn("text-sm font-semibold", theme.titleClassName)}>
                Manual origin selected
              </div>
              <div className={cn("text-xs", theme.secondaryTextClassName)}>
                {selectedAddressResult.secondaryLabel || selectedAddressResult.label}
              </div>
            </div>
            <button
              type="button"
              onClick={onClearAddressResult}
              className={cn(theme.secondaryButtonClassName, "!py-1 !px-2.5 !text-xs")}
            >
              Clear
            </button>
          </div>
        ) : null}

        {addressError ? (
          <div
            className={cn(
              "rounded-[1rem] border px-3 py-2 text-sm",
              tone === "light"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-amber-300/20 bg-amber-500/10 text-amber-200"
            )}
          >
            {addressError}
          </div>
        ) : null}

        {addressResults.length > 0 ? (
          <div className="space-y-1">
            {addressResults.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => onChooseAddressResult(result)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-[0.75rem] px-2.5 py-2 text-left transition-colors",
                  tone === "light"
                    ? "hover:bg-sky-50 text-slate-800"
                    : "hover:bg-white/6 text-slate-200"
                )}
              >
                <MapPin className={cn("h-3.5 w-3.5 shrink-0", theme.secondaryTextClassName)} />
                <div className="min-w-0 flex-1">
                  <div className={cn("truncate text-xs font-semibold", theme.titleClassName)}>
                    {result.primaryLabel}
                  </div>
                  <div className={cn("truncate text-[10px]", theme.secondaryTextClassName)}>
                    {result.secondaryLabel || result.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </form>
    </>
  );
}
