import { useEffect, type FormEvent } from "react";
import { Briefcase, Car, Shield } from "lucide-react";
import ShopDirectoryMapPane from "./ShopDirectoryMapPane";
import ShopDirectoryMapOverlays from "./ShopDirectoryMapOverlays";
import ShopDirectoryImmersiveMap from "./ShopDirectoryImmersiveMap";
import ShopDirectoryListBody from "./ShopDirectoryListBody";
import ShopDirectoryContextCards from "./ShopDirectoryContextCards";
import ShopDirectoryHero from "./ShopDirectoryHero";
import ShopDirectorySearchPanel from "./ShopDirectorySearchPanel";
import NavigationDeviationPrompt from "../maps/navigation/NavigationDeviationPrompt";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import {
  getDefaultMapCenter,
} from "../../services/intelligence/shopMapExperience";
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

function getRoleAccent(userType: MarketUserType) {
  if (userType === "shop") {
    return "bg-amber-400/15 text-amber-300 border-amber-400/30";
  }

  if (userType === "insurer") {
    return "bg-emerald-400/15 text-emerald-300 border-emerald-400/30";
  }

  return "bg-blue-400/15 text-blue-200 border-blue-400/30";
}

export default function ShopDirectoryScreen({
  onBack,
  onOpenRelatedScreen,
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
  const accentClasses = getRoleAccent(userType);
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
    const snapshot: NavigationSnapshot = {
      routeId: session.selectedRoute?.id ?? null,
      estimatedDurationMinutes: session.selectedRoute?.estimatedDurationMinutes ?? null,
      currentPosition: null,
      currentSpeedMph: null,
      routePolyline: session.selectedRoute?.polyline ?? [],
      capturedAt: new Date().toISOString(),
    };

    intelligence.evaluate(snapshot);
  }, [session.selectedRoute?.id, session.selectedRoute?.estimatedDurationMinutes]);

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
          coordinate: { lat: selectedShop.mapResult.coordinates.latitude, lng: selectedShop.mapResult.coordinates.longitude },
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
        userType={userType}
      />
    );
  }

  /* ── List / Hybrid mode layout ─────────────────────────── */
  return (
    <div className={session.showMapPane ? "pb-4" : "space-y-6 pb-20"}>
      <ShopDirectoryHero
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
        userType={userType}
      />

      {/* Deviation prompt: only rendered outside map on list mode */}
      {!session.showMapPane && deviationPromptNode}

      <section className="overflow-hidden rounded-none border-0 shadow-none md:rounded-[32px] md:border md:border-white/[0.08] bg-transparent md:shadow-none">
        <div className={`min-w-0 ${session.showMapPane ? `lg:grid ${mapShellLayoutClass}` : ""}`}>
          <aside
            className={`${session.showMapPane ? "lg:border-r" : ""} min-h-0 border-white/[0.08] bg-transparent`}
          >
            <div className="flex h-full flex-col">
              <ShopDirectorySearchPanel
                RoleIcon={RoleIcon}
                currentOriginIsSaved={session.currentOriginIsSaved}
                filterRating={session.filterRating}
                mapTheme={session.mapTheme}
                mapViewMode={session.mapViewMode}
                onClearOrigin={() => session.setSelectedOrigin(null)}
                onFilterRatingChange={session.setFilterRating}
                onOpenRelatedScreen={onOpenRelatedScreen}
                onSaveOrigin={session.handleSaveOrigin}
                onSearchQueryChange={session.setSearchQuery}
                onSearchSubmit={session.handleSearchSubmit}
                onSelectOrigin={session.handleSelectOrigin}
                onSortChange={session.setSortBy}
                onToggleTheme={session.handleToggleTheme}
                onViewModeChange={session.setMapViewMode}
                primaryColor={primaryColor}
                roleCollectionListings={session.roleCollectionListings}
                roleHighlights={session.roleHighlights}
                savedPlaces={session.savedPlaces}
                searchQuery={session.searchQuery}
                secondaryColor={secondaryColor}
                selectedOrigin={session.selectedOrigin}
                showMapPane={session.showMapPane}
                sortBy={session.sortBy}
                suggestedOrigins={session.suggestedOrigins}
                userType={userType}
              />

              <ShopDirectoryListBody
                session={session}
                userType={userType}
                primaryColor={primaryColor}
                compactCards={compactCards}
              />

            </div>
          </aside>

          {session.showMapPane && (
            <div className="min-h-[460px] border-t border-slate-200 lg:min-h-[820px] lg:border-t-0">
              <ShopDirectoryMapPane
                initialCenter={session.mapCenter || getDefaultMapCenter()}
                initialZoom={session.mapZoom}
                mapTheme={session.mapTheme}
                onSelectShop={session.setSelectedShopId}
                onViewportChange={(center, zoom) => {
                  session.setMapCenter(center);
                  session.setMapZoom(zoom);
                }}
                routeOptions={session.routeOptions}
                savedPlaces={session.savedPlaces}
                selectedOrigin={session.selectedOrigin}
                selectedRouteId={session.selectedRoute?.id}
                selectedShopId={session.selectedShopId}
                shops={session.mapListings}
                userType={userType}
              >
                <ShopDirectoryMapOverlays
                  deviationPrompt={deviationPromptNode}
                  intelligenceCallouts={session.roleHighlights.callouts}
                  intelligenceTitle={session.roleHighlights.title}
                  onSelectRoute={session.setSelectedRouteId}
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
          connectedCarrierNames={session.connectedCarrierNames}
          reportCount={reports.length}
          userInfo={userInfo}
          userType={userType}
        />
      )}
    </div>
  );
}
