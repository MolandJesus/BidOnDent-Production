import { useEffect, type FormEvent } from "react";
import { Briefcase, Car, Shield } from "lucide-react";
import ShopDirectoryMapPane from "./MapLibreShopDirectoryMapPane";
import ShopDirectoryMapOverlays from "./ShopDirectoryMapOverlays";
import ShopDirectoryImmersiveMap from "./ShopDirectoryImmersiveMap";
import ShopDirectoryListBody from "./ShopDirectoryListBody";
import ShopDirectoryContextCards from "./ShopDirectoryContextCards";
import ShopDirectoryHero from "./ShopDirectoryHero";
import ShopDirectorySearchPanel from "./ShopDirectorySearchPanel";
import NavigationDeviationPrompt from "../maps/navigation/NavigationDeviationPrompt";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import { getDefaultMapCenter } from "../../services/intelligence/shopMapExperience";
import {
  useNavigationIntelligence,
  useNavigationReroute,
  useNavigationSession,
  useNavigationToastBridge,
  useNavigationVoiceAlerts,
} from "../../features/navigation";
import type { NavigationSnapshot } from "../../features/navigation";
import { loadNavigationGuidanceSettings } from "../../services/navigation/navigationPreferences";
import { useNotifications } from "../../features/notifications";
import { useShopDirectorySession } from "../../hooks/useShopDirectorySession";

type ShopDirectoryScreenProps = {
  onBack: () => void;
  onOpenRelatedScreen?: () => void;
  appearanceMode?: DashboardAppearanceMode;
  primaryColor?: string;
  secondaryColor?: string;
  identity?: WebsiteIdentity | null;
  userType?: MarketUserType;
  userInfo?: {
    name?: string;
    email?: string;
  };
  vehicles?: Array<{ make?: string; model?: string; year?: string | number }>;
  reports?: Array<{
    damageArea?: string;
    damageAreas?: string[];
    damageType?: string;
    description?: string;
  }>;
};

function getRoleIcon(userType: MarketUserType) {
  if (userType === "shop") {
    return Briefcase;
  }

  if (userType === "insurer") {
    return Shield;
  }

  return Car;
}

function getRoleAccent(userType: MarketUserType, isLight: boolean) {
  if (userType === "shop") {
    return isLight
      ? "bg-amber-50 text-amber-700 border-amber-300/60"
      : "bg-amber-400/15 text-amber-300 border-amber-400/30";
  }

  if (userType === "insurer") {
    return isLight
      ? "bg-emerald-50 text-emerald-700 border-emerald-300/60"
      : "bg-emerald-400/15 text-emerald-300 border-emerald-400/30";
  }

  return isLight
    ? "bg-blue-50 text-blue-700 border-blue-300/60"
    : "bg-blue-400/15 text-blue-200 border-blue-400/30";
}

export default function ShopDirectoryScreen({
  onBack,
  onOpenRelatedScreen,
  appearanceMode = "map-dark",
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9",
  identity,
  userType = "customer",
  userInfo,
  vehicles = [],
  reports = [],
}: ShopDirectoryScreenProps) {
  const session = useShopDirectorySession({ identity, userType, vehicles, reports });
  const intelligence = useNavigationIntelligence();
  const navSession = useNavigationSession(identity?.providerUserId ?? undefined);
  const reroute = useNavigationReroute(intelligence.latestEvent);
  const voiceSettings = loadNavigationGuidanceSettings();
  useNavigationVoiceAlerts(intelligence.latestEvent, reroute.state.status, voiceSettings);
  const notifications = useNotifications();
  useNavigationToastBridge(
    navSession.session,
    intelligence.latestEvent,
    notifications,
    navSession.restoredFromCloud,
    navSession.syncError
  );

  const RoleIcon = getRoleIcon(userType);
  const isLight = appearanceMode === "light";
  const accentClasses = getRoleAccent(userType, isLight);
  const compactCards = session.mapViewMode === "map";

  const navigationMode: "browse" | "route-preview" | "guidance" = intelligence.latestEvent
    ? "guidance"
    : session.selectedRoute
      ? "route-preview"
      : "browse";

  const mapShellLayoutClass = session.showMapPane
    ? session.mapViewMode === "map"
      ? "lg:grid-cols-[minmax(320px,360px)_minmax(0,1fr)]"
      : "lg:grid-cols-[clamp(340px,31vw,420px)_minmax(0,1fr)]"
    : "";

  useEffect(() => {
    const livePosition = session.userGeolocation.coords
      ? {
          latitude: session.userGeolocation.coords.latitude,
          longitude: session.userGeolocation.coords.longitude,
        }
      : null;

    const snapshot: NavigationSnapshot = {
      routeId: session.selectedRoute?.id ?? null,
      estimatedDurationMinutes: session.selectedRoute?.estimatedDurationMinutes ?? null,
      currentPosition: livePosition,
      currentSpeedMph: null,
      routePolyline: session.selectedRoute?.polyline ?? [],
      capturedAt: new Date().toISOString(),
    };

    intelligence.evaluate(snapshot);
  }, [
    session.selectedRoute?.id,
    session.selectedRoute?.estimatedDurationMinutes,
    session.userGeolocation.coords,
  ]);

  /* ── Sync navigation session lifecycle with shop directory state ── */
  useEffect(() => {
    const { selectedShop, selectedOrigin, selectedRoute } = session;
    const { status } = navSession.session;

    // When a shop + route are selected, start planning (if idle)
    if (selectedShop && selectedRoute && status === "idle") {
      navSession.startPlanning(
        selectedOrigin
          ? {
              id: selectedOrigin.placeId ?? "origin",
              label: selectedOrigin.name,
              address: selectedOrigin.address,
              coordinate: { lat: selectedOrigin.latitude, lng: selectedOrigin.longitude },
            }
          : null,
        {
          id: String(selectedShop.id),
          label: selectedShop.name,
          address: selectedShop.mapResult.address,
          coordinate: {
            lat: selectedShop.mapResult.coordinates.latitude,
            lng: selectedShop.mapResult.coordinates.longitude,
          },
        }
      );
    }

    // Lock in the route during planning
    if (selectedRoute && status === "planning") {
      navSession.selectRoute(selectedRoute.id);
    }

    // If the route is cleared while in a session, end it
    if (!selectedRoute && (status === "active" || status === "paused")) {
      navSession.end();
    }
  }, [session.selectedShop?.id, session.selectedOrigin?.placeId, session.selectedRoute?.id]);

  const deviationPromptNode = intelligence.latestEvent ? (
    <NavigationDeviationPrompt
      event={intelligence.latestEvent}
      mapTheme={session.mapTheme}
      onReviewRoute={
        reroute.isEligible
          ? () => {
              const request = reroute.requestReroute(session.selectedRouteId);
              if (request) {
                const alternateRoute = session.routeOptions.find(
                  (r) => r.id !== session.selectedRouteId
                );
                if (alternateRoute) {
                  session.setSelectedRouteId(alternateRoute.id);
                }
                reroute.confirmReroute();
              }
            }
          : undefined
      }
    />
  ) : undefined;

  /* ── Immersive full-viewport map mode ───────────────────── */
  if (session.isImmersive) {
    return (
      <ShopDirectoryImmersiveMap
        deviationPrompt={deviationPromptNode}
        directionsActionLabel={session.directionsActionLabel}
        mapCenter={session.mapCenter ?? null}
        mapListings={session.mapListings}
        mapTheme={session.mapTheme}
        mapZoom={session.mapZoom ?? 9}
        navigationMode={navigationMode}
        onBack={onBack}
        onOpenShopDirections={session.handleOpenShopDirections}
        onSearchQueryChange={session.setSearchQuery}
        onSearchSubmit={session.handleSearchSubmit as (event: FormEvent) => void}
        onSelectRoute={session.setSelectedRouteId}
        onSelectShop={session.setSelectedShopId}
        onSetMapCenter={session.setMapCenter}
        onSetMapZoom={session.setMapZoom}
        onSetMapViewportBounds={session.setMapViewportBounds}
        onSwitchMode={session.setMapViewMode}
        onToggleRoleCollection={session.handleToggleRoleCollection}
        onToggleTheme={session.handleToggleTheme}
        primaryColor={primaryColor}
        roleCollectionIds={session.roleCollectionIds}
        roleHighlights={session.roleHighlights}
        routeOptions={session.routeOptions}
        routeSummary={session.routeSummary}
        savedPlaces={session.savedPlaces}
        searchQuery={session.searchQuery}
        selectedOrigin={session.selectedOrigin}
        selectedRoute={session.selectedRoute}
        selectedRouteId={session.selectedRouteId}
        selectedShop={session.selectedShop}
        selectedShopId={session.selectedShopId}
        userCoords={session.userGeolocation.coords}
        userType={userType}
      />
    );
  }

  /* ── List / Hybrid mode layout ─────────────────────────── */
  return (
    <div className={session.showMapPane ? "pb-4" : "space-y-6 pb-20"}>
      <ShopDirectoryHero
        appearanceMode={appearanceMode}
        RoleIcon={RoleIcon}
        accentClasses={accentClasses}
        connectedCarrierNames={session.connectedCarrierNames}
        contextChips={session.contextChips}
        identity={identity}
        mapListingsCount={session.mapListings.length}
        onBack={onBack}
        onToggleIntelligence={() => session.setSessionIntelligenceOpen((c) => !c)}
        roleHighlights={session.roleHighlights}
        sessionIntelligenceOpen={session.sessionIntelligenceOpen}
        showMapPane={session.showMapPane}
        summary={session.summary}
      />

      {/* Deviation prompt: only rendered outside map on list mode */}
      {!session.showMapPane && deviationPromptNode}

      <section
        className={`overflow-hidden rounded-none border-0 shadow-none md:rounded-2xl md:border md:shadow-none bg-transparent ${isLight ? "md:border-slate-200/60" : "md:border-white/[0.08]"}`}
      >
        <div
          className={`min-w-0 ${session.showMapPane ? `lg:grid lg:items-stretch ${mapShellLayoutClass}` : ""}`}
        >
          <aside
            className={`${session.showMapPane ? "lg:border-r lg:overflow-y-auto lg:max-h-[calc(100vh-140px)]" : ""} min-h-0 ${isLight ? "border-slate-200/60" : "border-white/[0.08]"} bg-transparent`}
          >
            <div className="flex h-full flex-col">
              <ShopDirectorySearchPanel
                appearanceMode={appearanceMode}
                RoleIcon={RoleIcon}
                currentOriginIsSaved={session.currentOriginIsSaved}
                filterRating={session.filterRating}
                isLocating={session.userGeolocation.isLocating}
                locationError={session.userGeolocation.error}
                mapTheme={session.mapTheme}
                mapViewMode={session.mapViewMode}
                onClearAreaSearch={session.handleClearAreaSearch}
                onClearOrigin={() => session.setSelectedOrigin(null)}
                onFilterRatingChange={session.setFilterRating}
                onOpenRelatedScreen={onOpenRelatedScreen}
                onSaveOrigin={session.handleSaveOrigin}
                onSearchQueryChange={session.setSearchQuery}
                onSearchSubmit={session.handleSearchSubmit}
                onSelectOrigin={session.handleSelectOrigin}
                onSortChange={session.setSortBy}
                onToggleTheme={session.handleToggleTheme}
                onUseMyLocation={session.handleUseMyLocation}
                onViewModeChange={session.setMapViewMode}
                primaryColor={primaryColor}
                roleCollectionListings={session.roleCollectionListings}
                roleHighlights={session.roleHighlights}
                savedPlaces={session.savedPlaces}
                searchQuery={session.searchQuery}
                searchWithinViewport={session.searchWithinViewport}
                secondaryColor={secondaryColor}
                selectedOrigin={session.selectedOrigin}
                showMapPane={session.showMapPane}
                sortBy={session.sortBy}
                suggestedOrigins={session.suggestedOrigins}
                userType={userType}
              />

              <ShopDirectoryListBody
                appearanceMode={appearanceMode}
                session={session}
                userType={userType}
                primaryColor={primaryColor}
                compactCards={compactCards}
              />
            </div>
          </aside>

          {session.showMapPane && (
            <div
              className={`h-[calc(100vh-280px)] min-h-[400px] max-h-[600px] border-t lg:h-[calc(100vh-140px)] lg:max-h-none lg:border-t-0 lg:sticky lg:top-0 ${isLight ? "border-slate-200/40" : "border-white/10"}`}
            >
              <ShopDirectoryMapPane
                initialCenter={session.mapCenter || getDefaultMapCenter()}
                initialZoom={session.mapZoom}
                mapTheme={session.mapTheme}
                onClearAreaSearch={session.handleClearAreaSearch}
                onSearchInArea={session.handleSearchInArea}
                onSelectShop={session.setSelectedShopId}
                onViewportChange={(center, zoom, bounds) => {
                  session.setMapCenter(center);
                  session.setMapZoom(zoom);
                  session.setMapViewportBounds(bounds);
                }}
                routeOptions={session.routeOptions}
                savedPlaces={session.savedPlaces}
                preserveViewport={session.searchWithinViewport}
                searchWithinViewport={session.searchWithinViewport}
                selectedOrigin={session.selectedOrigin}
                selectedRouteId={session.selectedRoute?.id}
                selectedShopId={session.selectedShopId}
                shops={session.mapListings}
                suppressHeader
                userCoords={session.userGeolocation.coords}
                userType={userType}
                onOpenShopDirections={session.handleOpenShopDirections}
                directionsActionLabel={session.directionsActionLabel}
              >
                <ShopDirectoryMapOverlays
                  deviationPrompt={deviationPromptNode}
                  directionsLabel={session.directionsActionLabel}
                  intelligenceCallouts={session.roleHighlights.callouts}
                  intelligenceTitle={session.roleHighlights.title}
                  mapTheme={session.mapTheme}
                  navigationMode={navigationMode}
                  onSelectRoute={session.setSelectedRouteId}
                  onStartNavigation={
                    session.selectedShop
                      ? () => session.handleOpenShopDirections(session.selectedShop!)
                      : undefined
                  }
                  routeOptions={session.routeOptions}
                  routeSummary={session.routeSummary}
                  selectedOrigin={session.selectedOrigin}
                  selectedRoute={session.selectedRoute}
                  selectedShop={session.selectedShop}
                  userId={identity?.providerUserId ?? undefined}
                />
              </ShopDirectoryMapPane>
            </div>
          )}
        </div>
      </section>

      {/* Context cards: only on list mode (map mode maximizes map real estate) */}
      {!session.showMapPane && (
        <ShopDirectoryContextCards
          appearanceMode={appearanceMode}
          connectedCarrierNames={session.connectedCarrierNames}
          reportCount={reports.length}
          userInfo={userInfo}
          userType={userType}
        />
      )}
    </div>
  );
}
