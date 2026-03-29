import { useState, type FormEvent } from "react";
import { ChevronDown, Bookmark, Layers3, MapPinOff, Search, SunMoon } from "lucide-react";
import type { ShopSortOption } from "../../services/auth/websiteIdentity";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { NavigationAddressResult, NavigationAddressSuggestion } from "../../types/navigation";
import { getRoleCollectionTitle } from "../../services/intelligence/shopMapExperience";
import type { MapTheme, MapViewMode, Place, SavedPlace } from "../../types/mapDomain";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import ShopDirectoryOriginSearch from "./ShopDirectoryOriginSearch";

const SORT_OPTIONS: Array<{ value: ShopSortOption; label: string }> = [
  { value: "smart-match", label: "Smart Match" },
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviews" },
  { value: "distance", label: "Nearest" },
];

const VIEW_MODE_OPTIONS: Array<{ value: MapViewMode; label: string }> = [
  { value: "hybrid", label: "Hybrid" },
  { value: "map", label: "Map" },
  { value: "list", label: "List" },
];

type ShopDirectorySearchPanelProps = {
  searchQuery: string;
  filterRating: number;
  sortBy: ShopSortOption;
  mapViewMode: MapViewMode;
  mapTheme: MapTheme;
  selectedOrigin: Place | null;
  savedPlaces: SavedPlace[];
  suggestedOrigins: Place[];
  originSearchQuery: string;
  originSearchResults: NavigationAddressResult[];
  originSuggestions: NavigationAddressSuggestion[];
  isSearchingOrigins?: boolean;
  originSearchError?: string;
  currentOriginIsSaved: boolean;
  primaryColor: string;
  secondaryColor: string;
  userType: MarketUserType;
  showMapPane: boolean;
  appearanceMode?: DashboardAppearanceMode;
  roleCollectionListings: Array<{ id: number; name: string }>;
  roleHighlights: {
    title: string;
    callouts: string[];
    secondaryActionLabel: string;
  };
  onSearchQueryChange: (query: string) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFilterRatingChange: (rating: number) => void;
  onSortChange: (sort: ShopSortOption) => void;
  onViewModeChange: (mode: MapViewMode) => void;
  onSelectOrigin: (origin: Place) => void;
  onOriginSearchQueryChange: (query: string) => void;
  onSearchOrigin: () => void | Promise<void>;
  onSelectOriginSearchResult: (result: NavigationAddressResult) => void;
  onSelectOriginSuggestion: (suggestion: NavigationAddressSuggestion) => void;
  onClearOrigin: () => void;
  onSaveOrigin: () => void;
  onToggleTheme: () => void;
  onOpenRelatedScreen?: () => void;
  onClearAreaSearch?: () => void;
  onUseMyLocation?: () => void;
  isLocating?: boolean;
  locationError?: string | null;
  searchWithinViewport?: boolean;
  RoleIcon: React.ElementType;
};

export default function ShopDirectorySearchPanel({
  searchQuery,
  filterRating,
  sortBy,
  mapViewMode,
  mapTheme,
  selectedOrigin,
  savedPlaces,
  suggestedOrigins,
  originSearchQuery,
  originSearchResults,
  originSuggestions,
  isSearchingOrigins = false,
  originSearchError,
  currentOriginIsSaved,
  primaryColor,
  secondaryColor,
  userType,
  showMapPane,
  appearanceMode = "map-dark",
  roleCollectionListings,
  roleHighlights,
  onSearchQueryChange,
  onSearchSubmit,
  onFilterRatingChange,
  onSortChange,
  onViewModeChange,
  onSelectOrigin,
  onOriginSearchQueryChange,
  onSearchOrigin,
  onSelectOriginSearchResult,
  onSelectOriginSuggestion,
  onClearOrigin,
  onSaveOrigin,
  onToggleTheme,
  onOpenRelatedScreen,
  onClearAreaSearch,
  onUseMyLocation,
  isLocating,
  locationError,
  searchWithinViewport,
  RoleIcon,
}: ShopDirectorySearchPanelProps) {
  const isLight = appearanceMode === "light";
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(() => !showMapPane);
  const roleCollectionTitle = getRoleCollectionTitle(userType);
  const relatedScreenLabel =
    userType === "shop"
      ? "Competitor Analysis"
      : userType === "insurer"
        ? "Partner Shops"
        : "Saved Shops";
  const mobileFilterSummary = [
    VIEW_MODE_OPTIONS.find((option) => option.value === mapViewMode)?.label || "Hybrid",
    SORT_OPTIONS.find((option) => option.value === sortBy)?.label || "Smart Match",
    filterRating === 4.5 ? "4.5+" : "All ratings",
    `Tiles: ${mapTheme === "light" ? "Dark" : "Light"}`,
  ].join(" · ");

  return (
    <div
      className={
        isLight
          ? "bg-white/95 border-b border-slate-200/60 px-4 py-3 sm:p-5"
          : "bd-glass-panel px-4 py-3 sm:p-5"
      }
    >
      <form className="space-y-3" onSubmit={onSearchSubmit}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <div className="relative min-w-0">
            <Search
              className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                isLight ? "text-blue-400" : "text-blue-200/50"
              }`}
            />
            <input
              className={`w-full min-w-0 rounded-full border py-2.5 pl-9 pr-3 text-sm outline-none transition-colors ${
                isLight
                  ? "border-slate-200/80 bg-white/80 text-slate-800 placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white shadow-sm"
                  : "bd-glass-control border-white/[0.12] bg-white/[0.06] text-slate-100 placeholder:text-slate-400/70 focus:border-blue-400/40 focus:bg-white/[0.08]"
              }`}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search shop, program, hail, EV, ADAS…"
              type="text"
              value={searchQuery}
            />
          </div>
          <button
            className="min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
            }}
            type="submit"
          >
            Update
          </button>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          <div className="space-y-2">
            <ShopDirectoryOriginSearch
              currentOriginIsSaved={currentOriginIsSaved}
              isLight={isLight}
              isLocating={isLocating}
              isSearchingOrigins={isSearchingOrigins}
              locationError={locationError}
              onClearOrigin={onClearOrigin}
              onOriginSearchQueryChange={onOriginSearchQueryChange}
              onSaveOrigin={onSaveOrigin}
              onSearchOrigin={onSearchOrigin}
              onSelectOrigin={onSelectOrigin}
              onSelectOriginSearchResult={onSelectOriginSearchResult}
              onSelectOriginSuggestion={onSelectOriginSuggestion}
              onUseMyLocation={onUseMyLocation}
              originSearchError={originSearchError}
              originSearchQuery={originSearchQuery}
              originSearchResults={originSearchResults}
              originSuggestions={originSuggestions}
              selectedOrigin={selectedOrigin}
              suggestedOrigins={suggestedOrigins}
            />
          </div>

          <div className="space-y-2">
            <div
              className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                isLight ? "text-blue-600/70" : "text-blue-200/50"
              }`}
            >
              <Layers3 className="h-3.5 w-3.5" />
              View & Sort
            </div>

            <div className="flex flex-wrap gap-1.5">
              {VIEW_MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`min-h-[44px] rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                    mapViewMode === option.value
                      ? isLight
                        ? "border-blue-400 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-blue-400/60 bg-blue-500/20 text-white"
                      : isLight
                        ? "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 shadow-sm"
                        : "border-white/[0.10] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                  }`}
                  onClick={() => onViewModeChange(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen((current) => !current)}
              className={`sm:hidden flex min-h-[44px] w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-sm transition-colors ${
                isLight
                  ? "border-slate-200 bg-white text-slate-700 shadow-sm"
                  : "border-white/[0.10] bg-white/[0.04] text-slate-200"
              }`}
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">
                  Sort & filters
                </span>
                <span className="mt-0.5 block truncate text-sm">{mobileFilterSummary}</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ${mobileFiltersOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div className={mobileFiltersOpen ? "space-y-2" : "hidden space-y-2 sm:block"}>
              <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-1.5">
                <select
                  className={`col-span-2 min-h-[44px] rounded-full border px-3 py-2 text-sm outline-none sm:col-span-1 ${
                    isLight
                      ? "border-slate-200/80 bg-white text-slate-800 shadow-sm"
                      : "border-white/[0.12] bg-white/[0.06] text-slate-200"
                  }`}
                  onChange={(event) => onSortChange(event.target.value as ShopSortOption)}
                  value={sortBy}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  className={`min-h-[44px] rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                    filterRating === 4.5
                      ? isLight
                        ? "border-amber-400/60 bg-amber-50 text-amber-700 shadow-sm"
                        : "border-amber-400/40 bg-amber-400/15 text-amber-300"
                      : isLight
                        ? "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 shadow-sm"
                        : "border-white/[0.10] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                  }`}
                  onClick={() => onFilterRatingChange(filterRating === 4.5 ? 0 : 4.5)}
                  type="button"
                >
                  4.5+ only
                </button>

                <button
                  className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                    isLight
                      ? "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 shadow-sm"
                      : "border-white/[0.10] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                  }`}
                  onClick={onToggleTheme}
                  type="button"
                >
                  <SunMoon className="h-3 w-3" />
                  Tiles: {mapTheme === "light" ? "Dark" : "Light"}
                </button>

                {searchWithinViewport && onClearAreaSearch && (
                  <button
                    className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                      isLight
                        ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "border-blue-400/40 bg-blue-500/15 text-blue-200 hover:bg-blue-500/25"
                    }`}
                    onClick={onClearAreaSearch}
                    type="button"
                  >
                    <MapPinOff className="h-3 w-3" />
                    Area active
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Role panel: only in sidebar on list mode (shown in map overlay otherwise) */}
      {!showMapPane && (
        <div
          className={`mt-3 ${
            isLight ? "bg-white/80 border border-slate-200/60 rounded-2xl" : "bd-glass-card"
          } p-3 sm:p-4`}
        >
          <div
            className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${
              isLight ? "text-blue-600/70" : "text-blue-200/50"
            }`}
          >
            <RoleIcon className="h-3.5 w-3.5" />
            Role panel
          </div>
          <p
            className={`mt-1.5 text-base font-semibold leading-tight ${
              isLight ? "text-slate-900" : "text-slate-100"
            }`}
          >
            {roleHighlights.title}
          </p>
          <div
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
              isLight
                ? "border-slate-200 bg-white text-slate-700"
                : "border-white/[0.10] bg-white/[0.06] text-slate-300"
            }`}
          >
            <Bookmark className="h-3 w-3" />
            {roleCollectionListings.length} in {roleCollectionTitle.toLowerCase()}
          </div>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {roleHighlights.callouts.map((callout) => (
              <div
                key={callout}
                className={`rounded-xl border px-3 py-2 text-xs leading-5 ${
                  isLight
                    ? "border-slate-200/60 bg-slate-50 text-slate-600"
                    : "border-white/[0.06] bg-white/[0.05] text-slate-300/80"
                }`}
              >
                {callout}
              </div>
            ))}
          </div>
          <p
            className={`mt-2 text-[11px] leading-4 ${isLight ? "text-slate-400" : "text-blue-200/40"}`}
          >
            This collection also feeds the related role screen outside the map shell so saved state
            carries through the broader dashboard.
          </p>
          {onOpenRelatedScreen && (
            <button
              className={`mt-3 min-h-[44px] rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                  : "border-white/[0.10] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
              }`}
              onClick={onOpenRelatedScreen}
              type="button"
            >
              Open {relatedScreenLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
