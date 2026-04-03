/**
 * ImmersiveOriginPicker — Compact bottom-sheet origin picker for immersive map mode.
 * Shown when a shop is selected but no origin is set, so routes can't be fetched.
 * Provides: "My Location" button, suggested origin chips, and a minimal address search.
 */
import { useState } from "react";
import { MapPin, Navigation2, Search } from "lucide-react";
import type { NavigationAddressResult, NavigationAddressSuggestion } from "../../types/navigation";
import type { Place } from "../../types/mapDomain";

type ImmersiveOriginPickerProps = {
  isDark: boolean;
  shopName: string;
  suggestedOrigins: Place[];
  selectedOrigin: Place | null;
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
  onUseMyLocation?: () => void;
};

export default function ImmersiveOriginPicker({
  isDark,
  shopName,
  suggestedOrigins,
  selectedOrigin,
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
  onUseMyLocation,
}: ImmersiveOriginPickerProps) {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const originCandidates = originSearchResults.length > 0 ? originSearchResults : originSuggestions;
  const quickOrigins = suggestedOrigins.slice(0, 4);

  const panelBg = isDark
    ? "border-white/12 bg-slate-950/88 backdrop-blur-xl shadow-2xl"
    : "border-black/8 bg-white/92 backdrop-blur-xl shadow-2xl";
  const headingColor = isDark ? "text-white" : "text-slate-800";
  const subColor = isDark ? "text-slate-400" : "text-slate-500";
  const chipBase = isDark
    ? "border-white/12 bg-white/[0.06] text-slate-200 hover:bg-white/[0.10]"
    : "border-slate-200 bg-white text-slate-600 hover:bg-blue-50 shadow-sm";
  const chipActive = isDark
    ? "border-blue-400/60 bg-blue-500/20 text-white"
    : "border-blue-400 bg-blue-50 text-blue-700 shadow-sm";
  const inputStyle = isDark
    ? "border-white/12 bg-white/[0.06] text-white placeholder:text-slate-400/70 focus:border-blue-400/40"
    : "border-slate-200/80 bg-white/90 text-slate-800 placeholder:text-slate-400 focus:border-blue-400/60 shadow-sm";

  return (
    <div
      className={`pointer-events-auto absolute inset-x-0 bottom-0 z-[540] rounded-t-2xl border-t px-4 pb-[max(env(safe-area-inset-bottom,0.75rem),0.75rem)] pt-3 ${panelBg}`}
    >
      {/* Drag handle */}
      <div className="mb-3 flex justify-center sm:hidden">
        <div className={`h-1 w-10 rounded-full ${isDark ? "bg-white/20" : "bg-black/15"}`} />
      </div>

      {/* Heading */}
      <div className="mb-2.5">
        <p className={`text-sm font-semibold ${headingColor}`}>Set your starting point</p>
        <p className={`mt-0.5 text-xs ${subColor}`}>
          Choose an origin to get directions to {shopName}
        </p>
      </div>

      {/* My Location + Quick origins */}
      <div className="flex flex-wrap gap-1.5 pb-2">
        {onUseMyLocation && (
          <button
            className={`shrink-0 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
              locationError
                ? isDark
                  ? "border-amber-400/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                  : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-sm"
                : isDark
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                  : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm"
            }`}
            disabled={isLocating}
            onClick={onUseMyLocation}
            type="button"
          >
            <Navigation2 className={`h-3.5 w-3.5 ${isLocating ? "animate-pulse" : ""}`} />
            {isLocating ? "Locating..." : locationError ? "Ask Again" : "My Location"}
          </button>
        )}
        {quickOrigins.map((origin) => {
          const key = origin.placeId || origin.name;
          const isActive = (selectedOrigin?.placeId || selectedOrigin?.name) === key;
          return (
            <button
              key={key}
              className={`shrink-0 min-h-[44px] rounded-full border px-3 py-2 text-xs font-medium transition-colors ${isActive ? chipActive : chipBase}`}
              onClick={() => onSelectOrigin(origin)}
              type="button"
            >
              {origin.name}
            </button>
          );
        })}
      </div>

      {/* Expandable address search */}
      {!searchExpanded ? (
        <button
          className={`mt-1 flex min-h-[44px] w-full items-center gap-2 rounded-full border px-3 py-2.5 text-sm transition-colors ${
            isDark
              ? "border-white/12 bg-white/[0.04] text-slate-400 hover:bg-white/[0.06]"
              : "border-slate-200/80 bg-slate-50/80 text-slate-400 hover:bg-white shadow-sm"
          }`}
          onClick={() => setSearchExpanded(true)}
          type="button"
        >
          <Search className="h-3.5 w-3.5" />
          Search address, city, or ZIP...
        </button>
      ) : (
        <div className="mt-1 space-y-2">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <div className="relative min-w-0">
              <Search
                className={`pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${isDark ? "text-blue-200/50" : "text-blue-400"}`}
              />
              <input
                autoFocus
                className={`w-full min-w-0 rounded-full border py-2.5 pl-9 pr-3 text-sm outline-none transition-colors ${inputStyle}`}
                onChange={(event) => onOriginSearchQueryChange(event.target.value)}
                placeholder="Search any U.S. address, city, or ZIP..."
                type="text"
                value={originSearchQuery}
              />
            </div>
            <button
              className={`min-h-[36px] rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                isDark
                  ? "border-white/12 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 shadow-sm"
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
              className={`max-h-48 overflow-y-auto rounded-2xl border ${
                isDark
                  ? "border-white/10 bg-slate-950/72 backdrop-blur-md"
                  : "border-slate-200/80 bg-white/90 shadow-sm"
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
                      isDark
                        ? "border-white/[0.08] text-slate-100 hover:bg-white/[0.06]"
                        : "border-slate-200/70 text-slate-700 hover:bg-blue-50"
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
                          className={`block truncate text-xs ${isDark ? "text-slate-400/70" : "text-slate-500"}`}
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
        </div>
      )}

      {/* Error messaging */}
      {(locationError || originSearchError) && (
        <p className={`mt-2 text-xs ${isDark ? "text-red-400/80" : "text-red-500"}`}>
          {locationError || originSearchError}
        </p>
      )}
    </div>
  );
}
