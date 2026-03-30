import { useEffect, useRef } from "react";
import { Bookmark, Search } from "lucide-react";
import ShopDirectoryRoutePanel from "./ShopDirectoryRoutePanel";
import ShopDirectoryResultCard from "./ShopDirectoryResultCard";
import { getRoleCollectionActionLabels } from "../../services/intelligence/shopMapExperience";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { NavigationSessionStatus } from "../../features/navigation";
import type { useShopDirectorySession } from "../../hooks/useShopDirectorySession";
import {
  getShopRouteActionLabel,
  shouldUseShopNavigationAction,
} from "../../hooks/shopDirectorySessionUtils";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type ShopDirectoryListBodyProps = {
  session: ReturnType<typeof useShopDirectorySession>;
  routePanel: {
    routeSummary: { title: string; description: string };
    routeOptions: ReturnType<typeof useShopDirectorySession>["routeOptions"];
    selectedRoute: ReturnType<typeof useShopDirectorySession>["selectedRoute"];
    mode: "preview" | "guidance";
    hasArrived: boolean;
    isLoadingRoute: boolean;
    routeError: string;
    usingLiveRoutes: boolean;
    remainingEtaLabel: string | null;
    remainingDistanceLabel: string | null;
    currentStepIndex: number;
    nextInstruction: string | null;
    followingInstruction: string | null;
    navigationSessionStatus: NavigationSessionStatus;
  };
  userType: MarketUserType;
  primaryColor: string;
  compactCards: boolean;
  appearanceMode?: DashboardAppearanceMode;
  onStartNavigation?: (shop: ShopMapListing) => void;
  navigationSessionStatus: NavigationSessionStatus;
  navigationSessionDestinationId: string | null;
};

export default function ShopDirectoryListBody({
  session,
  routePanel,
  userType,
  primaryColor,
  compactCards,
  appearanceMode = "map-dark",
  onStartNavigation,
  navigationSessionStatus,
  navigationSessionDestinationId,
}: ShopDirectoryListBodyProps) {
  const isLight = appearanceMode === "light";
  const sectionLabelClass = `flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
    isLight ? "text-blue-600/70" : "text-blue-200/50"
  }`;

  /* Auto-scroll sidebar to selected shop when marker tapped on map */
  const selectedRef = useRef<HTMLDivElement>(null);
  const prevSelectedId = useRef<number | null>(null);
  useEffect(() => {
    if (
      session.selectedShopId != null &&
      session.selectedShopId !== prevSelectedId.current &&
      selectedRef.current
    ) {
      selectedRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    prevSelectedId.current = session.selectedShopId;
  }, [session.selectedShopId]);

  return (
    <div
      className={`min-h-0 flex-1 p-3 sm:p-4 lg:p-5 lg:overflow-y-auto ${session.showMapPane ? "pb-[calc(env(safe-area-inset-bottom)+6.5rem)] sm:pb-6" : ""}`}
    >
      {/* Route panel: in sidebar on list mode only (floating overlay on map modes) */}
      {!session.showMapPane && (
        <ShopDirectoryRoutePanel
          appearanceMode={appearanceMode}
          currentStepIndex={routePanel.currentStepIndex}
          followingInstruction={routePanel.followingInstruction}
          hasArrived={routePanel.hasArrived}
          isLoadingRoute={routePanel.isLoadingRoute}
          mode={routePanel.mode}
          navigationSessionStatus={routePanel.navigationSessionStatus}
          nextInstruction={routePanel.nextInstruction}
          onSelectRoute={session.setSelectedRouteId}
          remainingDistanceLabel={routePanel.remainingDistanceLabel}
          remainingEtaLabel={routePanel.remainingEtaLabel}
          routeError={routePanel.routeError}
          routeOptions={routePanel.routeOptions}
          routeSummary={routePanel.routeSummary}
          selectedOrigin={session.selectedOrigin}
          selectedRoute={routePanel.selectedRoute}
          selectedShop={session.selectedShop}
          usingLiveRoutes={routePanel.usingLiveRoutes}
        />
      )}

      {session.roleCollectionListings.length > 0 && (
        <div className="mb-3">
          <div className={sectionLabelClass}>
            <Bookmark className="h-3.5 w-3.5" />
            {session.roleCollectionTitle}
          </div>
          <div className="mt-2 space-y-2">
            {session.roleCollectionListings.slice(0, 3).map((shop) => (
              <button
                key={`collection-${shop.id}`}
                className={`w-full ${
                  isLight
                    ? "bg-white/80 border border-slate-200/60 rounded-xl hover:border-blue-300/60"
                    : "bd-glass-card hover:border-white/[0.20]"
                } px-3 py-2 text-left transition-colors`}
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
        <div className="mb-3">
          <div className={sectionLabelClass}>
            <Bookmark className="h-3.5 w-3.5" />
            Saved places
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {session.savedPlaces.slice(0, 3).map((place) => (
              <button
                key={place.id}
                className={`rounded-xl sm:rounded-2xl border px-2.5 py-1.5 sm:px-3 sm:py-2 text-left text-xs sm:text-sm transition-colors ${
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
        <div className="mb-3">
          <div className={sectionLabelClass}>
            <Search className="h-3.5 w-3.5" />
            Recent searches
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {session.recentSearches.slice(0, 3).map((search) => (
              <button
                key={`${search.query}-${search.timestamp}`}
                className={`rounded-xl sm:rounded-2xl border px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm transition-colors ${
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

      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end sm:gap-3">
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
            className={`rounded-xl sm:rounded-2xl border px-3 py-2 sm:px-4 sm:py-3 ${
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
            No shops matched
          </p>
          <p
            className={`mt-2 text-sm leading-6 ${isLight ? "text-slate-600" : "text-slate-300/80"}`}
          >
            Try broadening the search, switching to Smart Match, or removing the 4.5+ filter.
          </p>
        </div>
      )}

      <div className="mt-3 space-y-3">
        {session.mapListings.map((shop) => {
          const roleCollectionAction = getRoleCollectionActionLabels(
            userType,
            session.roleCollectionIds.includes(shop.id)
          );
          const shopOwnsSessionDestination = navigationSessionDestinationId === String(shop.id);
          const hasArrivedForShop = routePanel.hasArrived && session.selectedShopId === shop.id;
          const routeReadyForShop = Boolean(
            onStartNavigation &&
              session.selectedOrigin &&
              session.selectedRoute &&
              session.selectedShopId === shop.id
          );
          const routeStatusLabel = hasArrivedForShop
            ? "Arrived"
            : shopOwnsSessionDestination && navigationSessionStatus === "paused"
              ? "Paused route"
              : shopOwnsSessionDestination && navigationSessionStatus === "active"
                ? "Live guidance"
                : null;
          const routeStatusTone = hasArrivedForShop
            ? ("arrived" as const)
            : navigationSessionStatus === "paused"
              ? ("paused" as const)
              : ("live" as const);
          const shouldUseNavigationAction = Boolean(
            onStartNavigation &&
              shouldUseShopNavigationAction({
                shopId: shop.id,
                routeReady: routeReadyForShop,
                navigationSessionStatus,
                navigationSessionDestinationId,
              })
          );
          const directionsActionLabel = getShopRouteActionLabel({
            shopId: shop.id,
            routeReady: routeReadyForShop,
            hasArrived: hasArrivedForShop,
            defaultLabel: session.directionsActionLabel,
            navigationSessionStatus,
            navigationSessionDestinationId,
          });

          return (
            <div key={shop.id} ref={session.selectedShopId === shop.id ? selectedRef : undefined}>
              <ShopDirectoryResultCard
                appearanceMode={appearanceMode}
                compact={compactCards}
                directionsActionLabel={directionsActionLabel}
                isSelected={session.selectedShopId === shop.id}
                onDirectionsAction={() =>
                  shouldUseNavigationAction && onStartNavigation
                    ? onStartNavigation(shop)
                    : session.handleOpenShopDirections(shop)
                }
                onPrimaryAction={() => session.handleToggleRoleCollection(shop.id)}
                onSecondaryAction={() => session.setSelectedShopId(shop.id)}
                primaryActionLabel={roleCollectionAction.primary}
                primaryColor={primaryColor}
                routeStatusLabel={routeStatusLabel}
                routeStatusTone={routeStatusTone}
                secondaryActionLabel={session.roleHighlights.secondaryActionLabel}
                shop={shop}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
