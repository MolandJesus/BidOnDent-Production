import type { FormEvent } from "react";
import { Bookmark, Layers3, MapPin, MapPinOff, Plus, Search, SunMoon } from "lucide-react";
import type { ShopSortOption } from "../../services/auth/websiteIdentity";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import { getRoleCollectionTitle } from "../../services/intelligence/shopMapExperience";
import type { MapTheme, MapViewMode, Place, SavedPlace } from "../../types/mapDomain";

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
  searchWithinViewport,
  RoleIcon,
}: ShopDirectorySearchPanelProps) {
  const roleCollectionTitle = getRoleCollectionTitle(userType);
  const relatedScreenLabel =
    userType === "shop"
      ? "Competitor Analysis"
      : userType === "insurer"
        ? "Partner Shops"
        : "Saved Shops";

  return (
    <div className="bd-glass-panel p-5">
      <form className="space-y-4" onSubmit={onSearchSubmit}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-200/50" />
          <input
            className="w-full rounded-[22px] border border-white/[0.12] bg-white/[0.06] py-3 pl-10 pr-28 text-slate-100 outline-none transition-colors placeholder:text-slate-400/70 focus:border-blue-400/40 focus:bg-white/[0.08] bd-glass-control"
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search shop, insurer program, hail, EV, ADAS, luxury..."
            type="text"
            value={searchQuery}
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bd-glass-control px-4 py-2 text-sm font-medium text-white"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
            type="submit"
          >
            Update
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200/50">
                <MapPin className="h-4 w-4" />
                Origin
              </div>
              {selectedOrigin && (
                <button
                  className="text-xs font-medium bd-glass-control px-3 py-2 text-slate-300"
                  onClick={onClearOrigin}
                  type="button"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestedOrigins.map((origin) => {
                const isActive =
                  (selectedOrigin?.placeId || selectedOrigin?.name) ===
                  (origin.placeId || origin.name);

                return (
                  <button
                    key={origin.placeId || origin.name}
                    className={`bd-glass-control px-3 py-1.5 text-sm ${
                      isActive
                        ? "border-blue-400/60 bg-blue-500/20 text-white"
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

            <div className="flex flex-wrap gap-2">
              <button
                className={`inline-flex items-center gap-2 bd-glass-control px-3 py-2 text-sm font-medium ${
                  selectedOrigin
                    ? "text-slate-200"
                    : "cursor-not-allowed bg-white/[0.02] text-slate-500"
                }`}
                disabled={!selectedOrigin}
                onClick={onSaveOrigin}
                type="button"
              >
                <Plus className="h-4 w-4" />
                {currentOriginIsSaved ? "Origin saved" : "Save origin"}
              </button>
              {selectedOrigin && (
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-slate-300/80">
                  {selectedOrigin.address}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200/50">
              <Layers3 className="h-4 w-4" />
              View & Sort
            </div>

            <div className="flex flex-wrap gap-2">
              {VIEW_MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`bd-glass-control px-3 py-1.5 text-sm ${
                    mapViewMode === option.value
                      ? "border-blue-400/60 bg-blue-500/20 text-white"
                      : "border-white/[0.10] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
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
                className="rounded-2xl border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-sm text-slate-200 outline-none bd-glass-control"
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
                className={`bd-glass-control px-3 py-2 text-sm font-medium ${
                  filterRating === 4.5
                    ? "border-amber-400/40 bg-amber-400/15 text-amber-300"
                    : "border-white/[0.10] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                }`}
                onClick={() => onFilterRatingChange(filterRating === 4.5 ? 0 : 4.5)}
                type="button"
              >
                4.5+ only
              </button>

              <button
                className="inline-flex items-center gap-2 bd-glass-control px-3 py-2 text-sm font-medium text-slate-300"
                onClick={onToggleTheme}
                type="button"
              >
                <SunMoon className="h-4 w-4" />
                {mapTheme === "light" ? "Dark tiles" : "Light tiles"}
              </button>

              {searchWithinViewport && onClearAreaSearch && (
                <button
                  className="inline-flex items-center gap-2 bd-glass-control border-blue-400/40 bg-blue-500/15 px-3 py-2 text-sm font-medium text-blue-200 hover:bg-blue-500/25"
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
        <div className="mt-4 bd-glass-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200/50">
            <RoleIcon className="h-4 w-4" />
            Role-specific panel
          </div>
          <p className="mt-2 text-lg font-semibold text-slate-100">{roleHighlights.title}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
            <Bookmark className="h-3.5 w-3.5" />
            {roleCollectionListings.length} in {roleCollectionTitle.toLowerCase()}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {roleHighlights.callouts.map((callout) => (
              <div
                key={callout}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.05] px-3 py-2 text-sm leading-6 text-slate-300/80"
              >
                {callout}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-blue-200/40">
            This collection also feeds the related role screen outside the map shell so saved state
            carries through the broader dashboard.
          </p>
          {onOpenRelatedScreen && (
            <button
              className="mt-4 rounded-2xl border border-white/[0.10] bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.08]"
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
