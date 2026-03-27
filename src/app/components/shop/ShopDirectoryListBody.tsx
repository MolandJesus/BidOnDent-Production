import { Bookmark, Search } from "lucide-react";
import ShopDirectoryRoutePanel from "./ShopDirectoryRoutePanel";
import ShopDirectoryResultCard from "./ShopDirectoryResultCard";
import { getRoleCollectionActionLabels } from "../../services/intelligence/shopMapExperience";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { useShopDirectorySession } from "../../hooks/useShopDirectorySession";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type ShopDirectoryListBodyProps = {
  session: ReturnType<typeof useShopDirectorySession>;
  userType: MarketUserType;
  primaryColor: string;
  compactCards: boolean;
  appearanceMode?: DashboardAppearanceMode;
};

export default function ShopDirectoryListBody({
  session,
  userType,
  primaryColor,
  compactCards,
  appearanceMode = "map-dark",
}: ShopDirectoryListBodyProps) {
  const isLight = appearanceMode === "light";
  const sectionLabelClass = `flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
    isLight ? "text-blue-600/70" : "text-blue-200/50"
  }`;
  return (
    <div className="min-h-0 flex-1 p-5 lg:overflow-y-auto">
      {/* Route panel: in sidebar on list mode only (floating overlay on map modes) */}
      {!session.showMapPane && (
        <ShopDirectoryRoutePanel
          onSelectRoute={session.setSelectedRouteId}
          routeOptions={session.routeOptions}
          routeSummary={session.routeSummary}
          selectedOrigin={session.selectedOrigin}
          selectedRoute={session.selectedRoute}
          selectedShop={session.selectedShop}
        />
      )}

      {session.roleCollectionListings.length > 0 && (
        <div className="mb-5">
          <div className={sectionLabelClass}>
            <Bookmark className="h-4 w-4" />
            {session.roleCollectionTitle}
          </div>
          <div className="mt-3 space-y-3">
            {session.roleCollectionListings.map((shop) => (
              <button
                key={`collection-${shop.id}`}
                className={`w-full ${
                  isLight
                    ? "bg-white/80 border border-slate-200/60 rounded-2xl hover:border-blue-300/60"
                    : "bd-glass-card hover:border-white/[0.20]"
                } px-4 py-3 text-left transition-colors`}
                onClick={() => session.setSelectedShopId(shop.id)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                      {shop.name}
                    </p>
                    <p
                      className={`mt-1 text-sm ${isLight ? "text-slate-500" : "text-slate-400/70"}`}
                    >
                      {shop.mapDistanceLabel} • {shop.averagePriceLabel} avg ticket
                    </p>
                  </div>
                  <div
                    className={`rounded-2xl border px-3 py-2 text-center ${
                      isLight ? "border-blue-200 bg-blue-50" : "border-blue-400/30 bg-blue-500/20"
                    }`}
                  >
                    <p
                      className={`text-[11px] uppercase tracking-[0.16em] ${
                        isLight ? "text-blue-600/70" : "text-blue-200/60"
                      }`}
                    >
                      Fit
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        isLight ? "text-blue-700" : "text-slate-100"
                      }`}
                    >
                      {shop.recommendationScore}%
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {session.savedPlaces.length > 0 && (
        <div className="mb-5">
          <div className={sectionLabelClass}>
            <Bookmark className="h-4 w-4" />
            Saved places
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {session.savedPlaces.map((place) => (
              <button
                key={place.id}
                className={`rounded-2xl border px-3 py-2 text-left text-sm transition-colors ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                    : "border-white/[0.10] bg-white/[0.05] text-slate-100 hover:bg-white/[0.10]"
                }`}
                onClick={() => session.handleSelectOrigin(place)}
                type="button"
              >
                <span className="block font-medium">{place.label}</span>
                <span
                  className={`block text-xs ${isLight ? "text-slate-500" : "text-slate-400/70"}`}
                >
                  {place.address}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {session.recentSearches.length > 0 && (
        <div className="mb-5">
          <div className={sectionLabelClass}>
            <Search className="h-4 w-4" />
            Recent searches
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {session.recentSearches.map((search) => (
              <button
                key={`${search.query}-${search.timestamp}`}
                className={`rounded-2xl border px-3 py-2 text-sm transition-colors ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                    : "border-white/[0.10] bg-white/[0.05] text-slate-100 hover:border-white/[0.20] hover:bg-white/[0.08]"
                }`}
                onClick={() => {
                  session.setSearchQuery(search.query);
                  session.setSelectedOrigin(search.origin || null);
                }}
                type="button"
              >
                <span className="font-medium">{search.query}</span>
                {search.origin && (
                  <span
                    className={`ml-2 text-xs ${isLight ? "text-slate-500" : "text-slate-400/70"}`}
                  >
                    @ {search.origin.name}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end justify-between gap-3">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.18em] ${
              isLight ? "text-blue-600/70" : "text-blue-200/50"
            }`}
          >
            Recommended shops
          </p>
          <p
            className={`mt-1 text-xl font-semibold ${
              isLight ? "text-slate-900" : "text-slate-100"
            }`}
          >
            {session.mapListings.length} result{session.mapListings.length === 1 ? "" : "s"}
          </p>
        </div>
        {session.selectedShop && (
          <div
            className={`rounded-2xl border px-4 py-3 ${
              isLight ? "border-blue-200 bg-blue-50" : "border-blue-400/30 bg-blue-500/20"
            }`}
          >
            <p
              className={`text-[11px] uppercase tracking-[0.18em] ${
                isLight ? "text-blue-600/70" : "text-blue-200/60"
              }`}
            >
              Focused shop
            </p>
            <p className={`text-sm font-semibold ${isLight ? "text-blue-800" : "text-slate-100"}`}>
              {session.selectedShop.name}
            </p>
          </div>
        )}
      </div>

      {session.mapListings.length === 0 && (
        <div
          className={`mt-4 ${
            isLight ? "bg-white/80 border border-slate-200/60 rounded-2xl" : "bd-glass-card"
          } p-4 sm:p-6`}
        >
          <p className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            No shops matched that filter
          </p>
          <p
            className={`mt-2 text-sm leading-6 ${isLight ? "text-slate-600" : "text-slate-300/80"}`}
          >
            Try broadening the search, switching back to Smart Match, or removing the 4.5+ filter to
            reopen the full recommendation set.
          </p>
        </div>
      )}

      <div className="mt-4 space-y-4">
        {session.mapListings.map((shop) => {
          const roleCollectionAction = getRoleCollectionActionLabels(
            userType,
            session.roleCollectionIds.includes(shop.id)
          );

          return (
            <ShopDirectoryResultCard
              appearanceMode={appearanceMode}
              compact={compactCards}
              directionsActionLabel={session.directionsActionLabel}
              isSelected={session.selectedShopId === shop.id}
              key={shop.id}
              onDirectionsAction={() => session.handleOpenShopDirections(shop)}
              onPrimaryAction={() => session.handleToggleRoleCollection(shop.id)}
              onSecondaryAction={() => session.setSelectedShopId(shop.id)}
              primaryActionLabel={roleCollectionAction.primary}
              primaryColor={primaryColor}
              secondaryActionLabel={session.roleHighlights.secondaryActionLabel}
              shop={shop}
            />
          );
        })}
      </div>
    </div>
  );
}
