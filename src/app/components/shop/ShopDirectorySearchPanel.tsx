import type { FormEvent } from "react";
import {
  Bookmark,
  Layers3,
  MapPin,
  MapPinOff,
  Navigation2,
  Plus,
  Search,
  SunMoon,
} from "lucide-react";
import type { ShopSortOption } from "../../services/auth/websiteIdentity";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import { getRoleCollectionTitle } from "../../services/intelligence/shopMapExperience";
import type { MapTheme, MapViewMode, Place, SavedPlace } from "../../types/mapDomain";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

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
  const roleCollectionTitle = getRoleCollectionTitle(userType);
  const relatedScreenLabel =
    userType === "shop"
      ? "Competitor Analysis"
      : userType === "insurer"
        ? "Partner Shops"
        : "Saved Shops";

  return (
    <div
      className={isLight ? "bg-white/95 border-b border-slate-200/60 p-5" : "bd-glass-panel p-5"}
    >
      <form className="space-y-4" onSubmit={onSearchSubmit}>
        <div className="relative">
          <Search
            className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${
              isLight ? "text-blue-400" : "text-blue-200/50"
            }`}
          />
          <input
            className={`w-full rounded-[22px] border py-3 pl-10 pr-28 outline-none transition-colors ${
              isLight
                ? "border-slate-200/80 bg-white/80 text-slate-800 placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white shadow-sm"
                : "bd-glass-control border-white/[0.12] bg-white/[0.06] text-slate-100 placeholder:text-slate-400/70 focus:border-blue-400/40 focus:bg-white/[0.08]"
            }`}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search shop, insurer program, hail, EV, ADAS, luxury..."
            type="text"
            value={searchQuery}
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-2xl px-4 py-2 text-sm font-medium text-white"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
            }}
            type="submit"
          >
            Update
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div
                className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                  isLight ? "text-blue-600/70" : "text-blue-200/50"
                }`}
              >
                <MapPin className="h-4 w-4" />
                Origin
              </div>
              {selectedOrigin && (
                <button
                  className={`text-xs font-medium rounded-full px-3 py-2 transition-colors ${
                    isLight
                      ? "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                      : "bd-glass-control text-slate-300"
                  }`}
                  onClick={onClearOrigin}
                  type="button"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {onUseMyLocation && (
                <button
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedOrigin?.placeId === "user-geolocation"
                      ? isLight
                        ? "border-blue-400 bg-blue-50 text-blue-700 shadow-sm"
                        : "bd-glass-control border-blue-400/60 bg-blue-500/20 text-white"
                      : isLight
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm"
                        : "bd-glass-control border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                  }`}
                  disabled={isLocating}
                  onClick={onUseMyLocation}
                  type="button"
                >
                  <Navigation2 className={`h-3.5 w-3.5 ${isLocating ? "animate-pulse" : ""}`} />
                  {isLocating ? "Locating…" : "My Location"}
                </button>
              )}
              {suggestedOrigins.map((origin) => {
                const isActive =
                  (selectedOrigin?.placeId || selectedOrigin?.name) ===
                  (origin.placeId || origin.name);

                return (
                  <button
                    key={origin.placeId || origin.name}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? isLight
                          ? "border-blue-400 bg-blue-50 text-blue-700 shadow-sm"
                          : "bd-glass-control border-blue-400/60 bg-blue-500/20 text-white"
                        : isLight
                          ? "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 shadow-sm"
                          : "bd-glass-control border-white/[0.10] bg-white/[0.04] text-slate-300 hover:border-blue-400/30 hover:bg-white/[0.08]"
                    }`}
                    onClick={() => onSelectOrigin(origin)}
                    type="button"
                  >
                    {origin.name}
                  </button>
                );
              })}
            </div>

            {locationError && (
              <p className={`text-xs ${isLight ? "text-red-500" : "text-red-400/80"}`}>
                {locationError}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                  selectedOrigin
                    ? isLight
                      ? "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 shadow-sm"
                      : "bd-glass-control text-slate-200"
                    : isLight
                      ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                      : "cursor-not-allowed bd-glass-control bg-white/[0.02] text-slate-500"
                }`}
                disabled={!selectedOrigin}
                onClick={onSaveOrigin}
                type="button"
              >
                <Plus className="h-4 w-4" />
                {currentOriginIsSaved ? "Origin saved" : "Save origin"}
              </button>
              {selectedOrigin && (
                <div
                  className={`rounded-2xl border px-3 py-2 text-sm ${
                    isLight
                      ? "border-slate-200/80 bg-slate-50 text-slate-600"
                      : "border-white/[0.08] bg-white/[0.05] text-slate-300/80"
                  }`}
                >
                  {selectedOrigin.address}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                isLight ? "text-blue-600/70" : "text-blue-200/50"
              }`}
            >
              <Layers3 className="h-4 w-4" />
              View & Sort
            </div>

            <div className="flex flex-wrap gap-2">
              {VIEW_MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    mapViewMode === option.value
                      ? isLight
                        ? "border-blue-400 bg-blue-50 text-blue-700 shadow-sm"
                        : "bd-glass-control border-blue-400/60 bg-blue-500/20 text-white"
                      : isLight
                        ? "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 shadow-sm"
                        : "bd-glass-control border-white/[0.10] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                  }`}
                  onClick={() => onViewModeChange(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                className={`rounded-2xl border px-3 py-2 text-sm outline-none ${
                  isLight
                    ? "border-slate-200/80 bg-white text-slate-800 shadow-sm"
                    : "bd-glass-control border-white/[0.12] bg-white/[0.06] text-slate-200"
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
                className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                  filterRating === 4.5
                    ? isLight
                      ? "border-amber-400/60 bg-amber-50 text-amber-700 shadow-sm"
                      : "bd-glass-control border-amber-400/40 bg-amber-400/15 text-amber-300"
                    : isLight
                      ? "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 shadow-sm"
                      : "bd-glass-control border-white/[0.10] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                }`}
                onClick={() => onFilterRatingChange(filterRating === 4.5 ? 0 : 4.5)}
                type="button"
              >
                4.5+ only
              </button>

              <button
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 shadow-sm"
                    : "bd-glass-control text-slate-300"
                }`}
                onClick={onToggleTheme}
                type="button"
              >
                <SunMoon className="h-4 w-4" />
                {mapTheme === "light" ? "Dark tiles" : "Light tiles"}
              </button>

              {searchWithinViewport && onClearAreaSearch && (
                <button
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                    isLight
                      ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : "bd-glass-control border-blue-400/40 bg-blue-500/15 text-blue-200 hover:bg-blue-500/25"
                  }`}
                  onClick={onClearAreaSearch}
                  type="button"
                >
                  <MapPinOff className="h-4 w-4" />
                  Map area active — clear
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Role panel: only in sidebar on list mode (shown in map overlay otherwise) */}
      {!showMapPane && (
        <div
          className={`mt-4 ${
            isLight ? "bg-white/80 border border-slate-200/60 rounded-2xl" : "bd-glass-card"
          } p-4`}
        >
          <div
            className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
              isLight ? "text-blue-600/70" : "text-blue-200/50"
            }`}
          >
            <RoleIcon className="h-4 w-4" />
            Role-specific panel
          </div>
          <p
            className={`mt-2 text-lg font-semibold ${
              isLight ? "text-slate-900" : "text-slate-100"
            }`}
          >
            {roleHighlights.title}
          </p>
          <div
            className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${
              isLight
                ? "border-slate-200 bg-white text-slate-700"
                : "border-white/[0.10] bg-white/[0.06] text-slate-300"
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            {roleCollectionListings.length} in {roleCollectionTitle.toLowerCase()}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {roleHighlights.callouts.map((callout) => (
              <div
                key={callout}
                className={`rounded-2xl border px-3 py-2 text-sm leading-6 ${
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
            className={`mt-3 text-xs leading-5 ${isLight ? "text-slate-400" : "text-blue-200/40"}`}
          >
            This collection also feeds the related role screen outside the map shell so saved state
            carries through the broader dashboard.
          </p>
          {onOpenRelatedScreen && (
            <button
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
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
