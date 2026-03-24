import { Bookmark, Search } from "lucide-react";
import ShopDirectoryRoutePanel from "./ShopDirectoryRoutePanel";
import ShopDirectoryResultCard from "./ShopDirectoryResultCard";
import { getRoleCollectionActionLabels } from "../../services/intelligence/shopMapExperience";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { useShopDirectorySession } from "../../hooks/useShopDirectorySession";

type ShopDirectoryListBodyProps = {
  session: ReturnType<typeof useShopDirectorySession>;
  userType: MarketUserType;
  primaryColor: string;
  compactCards: boolean;
};

export default function ShopDirectoryListBody({
  session,
  userType,
  primaryColor,
  compactCards,
}: ShopDirectoryListBodyProps) {
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
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Bookmark className="h-4 w-4" />
            {session.roleCollectionTitle}
          </div>
          <div className="mt-3 space-y-3">
            {session.roleCollectionListings.map((shop) => (
              <button
                key={`collection-${shop.id}`}
                className="w-full bd-glass-card px-4 py-3 text-left transition-colors hover:border-slate-300"
                onClick={() => session.setSelectedShopId(shop.id)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{shop.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {shop.mapDistanceLabel} • {shop.averagePriceLabel} avg ticket
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-950 px-3 py-2 text-center text-white">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/65">Fit</p>
                    <p className="text-sm font-semibold">{shop.recommendationScore}%</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {session.savedPlaces.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Bookmark className="h-4 w-4" />
            Saved places
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {session.savedPlaces.map((place) => (
              <button
                key={place.id}
                className="rounded-2xl border border-slate-200/60 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition-colors hover:bg-white/40"
                onClick={() => session.handleSelectOrigin(place)}
                type="button"
              >
                <span className="block font-medium text-slate-900">{place.label}</span>
                <span className="block text-xs text-slate-500">{place.address}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {session.recentSearches.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Search className="h-4 w-4" />
            Recent searches
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {session.recentSearches.map((search) => (
              <button
                key={`${search.query}-${search.timestamp}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
                onClick={() => {
                  session.setSearchQuery(search.query);
                  session.setSelectedOrigin(search.origin || null);
                }}
                type="button"
              >
                <span className="font-medium text-slate-900">{search.query}</span>
                {search.origin && (
                  <span className="ml-2 text-xs text-slate-500">@ {search.origin.name}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Recommended shops
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-950">
            {session.mapListings.length} result{session.mapListings.length === 1 ? "" : "s"}
          </p>
        </div>
        {session.selectedShop && (
          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/65">Focused shop</p>
            <p className="text-sm font-semibold">{session.selectedShop.name}</p>
          </div>
        )}
      </div>

      {session.mapListings.length === 0 && (
        <div className="mt-4 rounded-[26px] border border-dashed border-slate-300 bg-slate-50 p-4 sm:p-6">
          <p className="text-lg font-semibold text-slate-900">No shops matched that filter</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
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
