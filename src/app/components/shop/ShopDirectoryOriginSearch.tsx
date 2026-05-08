import { MapPin, Navigation2, Plus, Search } from "lucide-react";

import type { NavigationAddressResult, NavigationAddressSuggestion } from "../../types/navigation";
import type { Place } from "../../types/mapDomain";

type ShopDirectoryOriginSearchProps = {
  isLight: boolean;
  selectedOrigin: Place | null;
  suggestedOrigins: Place[];
  currentOriginIsSaved: boolean;
  originSearchQuery: string;
  originSearchResults: NavigationAddressResult[];
  originSuggestions: NavigationAddressSuggestion[];
  isSearchingOrigins?: boolean;
  originSearchError?: string;
  locationError?: string | null;
  isLocating?: boolean;
  onSelectOrigin: (origin: Place) => void;
  onOriginSearchQueryChange: (query: string) => void;
  onSearchOrigin: () => void | Promise<void>;
  onSelectOriginSearchResult: (result: NavigationAddressResult) => void;
  onSelectOriginSuggestion: (suggestion: NavigationAddressSuggestion) => void;
  onClearOrigin: () => void;
  onSaveOrigin: () => void;
  onUseMyLocation?: () => void;
};

export default function ShopDirectoryOriginSearch({
  isLight,
  selectedOrigin,
  suggestedOrigins,
  currentOriginIsSaved,
  originSearchQuery,
  originSearchResults,
  originSuggestions,
  isSearchingOrigins = false,
  originSearchError,
  locationError,
  isLocating = false,
  onSelectOrigin,
  onOriginSearchQueryChange,
  onSearchOrigin,
  onSelectOriginSearchResult,
  onSelectOriginSuggestion,
  onClearOrigin,
  onSaveOrigin,
  onUseMyLocation,
}: ShopDirectoryOriginSearchProps) {
  const originCandidates = originSearchResults.length > 0 ? originSearchResults : originSuggestions;
  const quickSuggestedOrigins = suggestedOrigins.slice(0, 4);
  const selectedOriginKey = selectedOrigin?.placeId || selectedOrigin?.name || "";
  const selectedAlreadyVisible = quickSuggestedOrigins.some(
    (origin) => (origin.placeId || origin.name) === selectedOriginKey
  );
  // KI-167: the user-geolocation origin is already shown via the dedicated
  // "My Location" button above this row, so don't append it again as a chip.
  const selectedIsUserGeolocation = selectedOrigin?.placeId === "user-geolocation";
  const visibleSuggestedOrigins =
    selectedOrigin && !selectedAlreadyVisible && !selectedIsUserGeolocation
      ? [...quickSuggestedOrigins, selectedOrigin]
      : quickSuggestedOrigins;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div
          className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${
            isLight ? "text-blue-600/70" : "text-blue-200/50"
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          Origin
        </div>
        {selectedOrigin && (
          <button
            className={`min-h-[44px] rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
              isLight
                ? "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={onClearOrigin}
            type="button"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <div className="relative min-w-0">
          <Search
            className={`pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${
              isLight ? "text-blue-400" : "text-blue-200/50"
            }`}
          />
          <input
            className={`w-full min-w-0 rounded-full border py-2.5 pl-9 pr-3 text-sm outline-none transition-colors ${
              isLight
                ? "border-[rgba(140,82,22,0.26)] bg-[linear-gradient(180deg,rgba(232,238,248,0.88),rgba(247,232,194,0.82))] text-slate-800 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(252,240,208,0.78)] focus:border-blue-500/60"
                : "bd-glass-control border-white/[0.12] bg-white/[0.06] text-slate-100 placeholder:text-slate-400/70 focus:border-blue-400/40 focus:bg-white/[0.08]"
            }`}
            onChange={(event) => onOriginSearchQueryChange(event.target.value)}
            placeholder="Search any U.S. address, city, or ZIP..."
            type="text"
            value={originSearchQuery}
          />
        </div>
        <button
          className={`min-h-[44px] rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors ${
            isLight
              ? "border-[rgba(140,82,22,0.26)] bg-[linear-gradient(180deg,rgba(247,232,194,0.84),rgba(232,238,248,0.78))] text-slate-700 shadow-[inset_0_1px_0_rgba(252,240,208,0.78)] hover:border-blue-300 hover:bg-[linear-gradient(180deg,rgba(232,238,248,0.92),rgba(219,234,254,0.86))]"
              : "border-white/[0.10] bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
          }`}
          onClick={() => {
            void onSearchOrigin();
          }}
          type="button"
        >
          {isSearchingOrigins ? "Finding..." : "Find"}
        </button>
      </div>

      {originCandidates.length > 0 && originSearchQuery.trim().length >= 2 && (
        <div
          className={`overflow-hidden rounded-2xl border ${
            isLight
              ? "border-[rgba(140,82,22,0.26)] bg-[linear-gradient(180deg,rgba(247,232,194,0.88),rgba(232,238,248,0.82))] shadow-[inset_0_1px_0_rgba(252,240,208,0.78),0_8px_20px_rgba(15,23,42,0.10)]"
              : "border-white/[0.10] bg-slate-950/72 backdrop-blur-md"
          }`}
        >
          {originCandidates.slice(0, 5).map((candidate) => {
            const isResult = "primaryLabel" in candidate;
            const title = isResult ? candidate.primaryLabel : candidate.title;
            const subtitle = isResult ? candidate.secondaryLabel : candidate.subtitle;

            return (
              <button
                key={candidate.id}
                className={`flex min-h-[44px] w-full items-start gap-2 border-b px-3 py-2 text-left text-sm transition-colors last:border-b-0 ${
                  isLight
                    ? "border-slate-200/70 text-slate-700 hover:bg-blue-50"
                    : "border-white/[0.08] text-slate-100 hover:bg-white/[0.06]"
                }`}
                onClick={() =>
                  isResult
                    ? onSelectOriginSearchResult(candidate)
                    : onSelectOriginSuggestion(candidate)
                }
                type="button"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{title}</span>
                  {subtitle ? (
                    <span
                      className={`block truncate text-xs ${isLight ? "text-slate-500" : "text-slate-400/70"}`}
                    >
                      {subtitle}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 pb-1">
        {onUseMyLocation && (
          <button
            className={`shrink-0 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              locationError
                ? isLight
                  ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-sm"
                  : "border-amber-400/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                : selectedOrigin?.placeId === "user-geolocation"
                  ? isLight
                    ? "border-blue-400 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-blue-400/60 bg-blue-500/20 text-white"
                  : isLight
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm"
                    : "border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
            }`}
            disabled={isLocating}
            onClick={onUseMyLocation}
            type="button"
          >
            <Navigation2
              className={`h-3 w-3 ${isLocating ? "animate-pulse motion-reduce:animate-none" : ""}`}
            />
            {isLocating ? "Locating..." : locationError ? "Ask Again" : "My Location"}
          </button>
        )}
        {visibleSuggestedOrigins.map((origin) => {
          const isActive =
            (selectedOrigin?.placeId || selectedOrigin?.name) === (origin.placeId || origin.name);

          return (
            <button
              key={origin.placeId || origin.name}
              className={`shrink-0 min-h-[44px] rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? isLight
                    ? "border-blue-400 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-blue-400/60 bg-blue-500/20 text-white"
                  : isLight
                    ? "border-[rgba(140,82,22,0.26)] bg-[linear-gradient(180deg,rgba(247,232,194,0.84),rgba(232,238,248,0.78))] text-slate-600 shadow-[inset_0_1px_0_rgba(252,240,208,0.78)] hover:border-blue-300 hover:bg-[linear-gradient(180deg,rgba(232,238,248,0.92),rgba(219,234,254,0.86))]"
                    : "border-white/[0.10] bg-white/[0.04] text-slate-300 hover:border-blue-400/30 hover:bg-white/[0.08]"
              }`}
              onClick={() => onSelectOrigin(origin)}
              type="button"
            >
              {origin.name}
            </button>
          );
        })}
      </div>

      {(locationError || originSearchError) && (
        <div className="space-y-1">
          <p className={`text-xs ${isLight ? "text-red-500" : "text-red-400/80"}`}>
            {locationError || originSearchError}
          </p>
          {locationError && onUseMyLocation && (
            <button
              className={`text-[11px] font-medium underline underline-offset-2 ${
                isLight ? "text-amber-700" : "text-amber-300"
              }`}
              onClick={onUseMyLocation}
              type="button"
            >
              Ask for location again
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors ${
            selectedOrigin
              ? isLight
                ? "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 shadow-sm"
                : "border-white/[0.10] text-slate-200 hover:bg-white/[0.06]"
              : isLight
                ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                : "cursor-not-allowed border-white/[0.05] bg-white/[0.02] text-slate-500"
          }`}
          disabled={!selectedOrigin}
          onClick={onSaveOrigin}
          type="button"
        >
          <Plus className="h-3 w-3" />
          {currentOriginIsSaved ? "Saved" : "Save"}
        </button>
        {selectedOrigin && (
          <span
            className={`truncate max-w-[180px] sm:max-w-xs text-xs ${
              isLight ? "text-slate-500" : "text-slate-400/70"
            }`}
            title={selectedOrigin.address}
          >
            {selectedOrigin.address}
          </span>
        )}
      </div>
    </div>
  );
}
