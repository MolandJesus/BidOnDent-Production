import { useCallback, type FormEvent } from "react";
import { AlertTriangle, Briefcase, Car, Shield } from "lucide-react";
import ShopDirectoryImmersiveMap from "./ShopDirectoryImmersiveMap";
import ShopDirectoryHybridStage from "./ShopDirectoryHybridStage";
import ShopDirectoryListBody from "./ShopDirectoryListBody";
import ShopDirectoryContextCards from "./ShopDirectoryContextCards";
import ShopDirectoryHero from "./ShopDirectoryHero";
import ShopDirectorySearchPanel from "./ShopDirectorySearchPanel";
import ShopDirectorySheets from "./ShopDirectorySheets";
import NavigationActiveManeuverCard from "../maps/navigation/NavigationActiveManeuverCard";
import NavigationDeviationPrompt from "../maps/navigation/NavigationDeviationPrompt";
import NavigationErrorBoundary from "../maps/NavigationErrorBoundary";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { DamageReport } from "../../services/supabase/types";
import { useShopDirectorySession } from "../../hooks/useShopDirectorySession";
import { useShopDirectoryNavigation } from "../../hooks/useShopDirectoryNavigation";
import { useShopDirectoryActions } from "../../hooks/useShopDirectoryActions";
import { useNotifications } from "../../features/notifications";

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
  onViewReportDetail?: (reportId: string) => void;
  onViewBids?: (reportId?: string) => void;
  mapReports?: DamageReport[];
  /** Pre-seed search from report context (e.g. zip or city). */
  initialSearchHint?: string;
  /** Center the map on these coordinates on first mount (e.g. from a report's location). */
  initialMapCenter?: import("../../types/mapDomain").Coordinates;
  /** Auto-open report drawer for this report ID on map mount. */
  focusReportId?: string;
};

function getRoleIcon(userType: MarketUserType) {
  if (userType === "shop") return Briefcase;
  if (userType === "insurer") return Shield;
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
  onViewReportDetail,
  onViewBids,
  mapReports,
  initialSearchHint,
  initialMapCenter,
  focusReportId,
}: ShopDirectoryScreenProps) {
  const session = useShopDirectorySession({
    identity,
    userType,
    vehicles,
    reports,
    initialSearchHint,
    initialMapCenter,
  });
  const nav = useShopDirectoryNavigation({ session, identity, userType });
  const actions = useShopDirectoryActions({ identity, mapListings: session.mapListings });
  const notifications = useNotifications();

  const handleToggleSaveShop = useCallback(
    (shop: import("../../services/intelligence/shopMapExperience").ShopMapListing) =>
      session.handleToggleRoleCollection(shop.id),
    [session.handleToggleRoleCollection]
  );
  const isDetailShopSaved = actions.detailShop
    ? session.roleCollectionIds.includes(actions.detailShop.id)
    : false;

  /* ── Navigation-guarded shop selection ── */
  const handleSelectShop = useCallback(
    (shopId: number | null) => {
      const isNavigating =
        nav.navigationSessionStatus === "active" || nav.navigationSessionStatus === "paused";
      if (isNavigating && shopId == null) return;

      const isSwitchingShop =
        shopId != null && session.selectedShopId != null && shopId !== session.selectedShopId;
      if (isNavigating && isSwitchingShop) {
        nav.onEndNavigation?.();
        notifications.showToast({
          message: "Navigation ended — switched to new shop",
          variant: "info",
          durationMs: 3000,
          deepLink: null,
        });
      }
      session.setSelectedShopId(shopId);
    },
    [
      nav.navigationSessionStatus,
      nav.onEndNavigation,
      session.selectedShopId,
      session.setSelectedShopId,
      notifications,
    ]
  );

  const onPlaceBidForShop = userType === "shop" ? actions.handlePlaceBid : undefined;
  const onViewBidsForCustomer: ((reportId: string) => void) | undefined =
    userType === "customer" && onViewBids ? (reportId: string) => onViewBids(reportId) : undefined;

  const RoleIcon = getRoleIcon(userType);
  const isLight = appearanceMode === "light";
  const accentClasses = getRoleAccent(userType, isLight);
  const compactCards = session.mapViewMode === "map";

  const renderGuidanceOverlay = (containerClassName: string) =>
    nav.liveNavigationForSelectedShop && nav.routePreview ? (
      <NavigationActiveManeuverCard
        containerClassName={containerClassName}
        followingStep={nav.followingStep}
        nextStep={nav.nextStep}
        tone={session.resolvedMapTheme}
      />
    ) : null;

  const deviationPromptNode = nav.deviationEvent ? (
    <NavigationDeviationPrompt
      event={nav.deviationEvent}
      mapTheme={session.resolvedMapTheme}
      onReviewRoute={nav.handleReviewRoute}
    />
  ) : undefined;

  const isOffRoute = nav.deviationEvent?.type === "off_route";

  const handleFindShopsNear = useCallback(
    (coords: { lat: number; lng: number }) => {
      session.setSelectedOrigin({
        name: "Report Location",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        latitude: coords.lat,
        longitude: coords.lng,
        placeId: `report-location-${coords.lat.toFixed(4)}-${coords.lng.toFixed(4)}`,
      });
    },
    [session.setSelectedOrigin]
  );

  /* ── Immersive full-viewport map mode ───────────────────── */
  if (session.isImmersive) {
    return (
      <>
        <NavigationErrorBoundary>
          <ShopDirectoryImmersiveMap
            deviationPrompt={deviationPromptNode}
            directionsActionLabel={session.directionsActionLabel}
            followCurrentPosition={nav.liveNavigationForSelectedShop}
            followCurrentPositionRevision={nav.followCurrentPositionRevision}
            guidanceOverlay={renderGuidanceOverlay("top-20 sm:top-24")}
            isMapDark={session.isMapDark}
            isOffRoute={isOffRoute}
            mapCenter={session.mapCenter ?? null}
            mapListings={session.mapListings}
            mapTheme={session.resolvedMapTheme}
            mapZoom={session.mapZoom ?? 9}
            navigationMode={nav.navigationMode}
            navigationSessionDestinationId={nav.navigationSessionDestinationId}
            navigationSessionStatus={nav.navigationSessionStatus}
            onBack={onBack}
            onEndNavigation={nav.onEndNavigation}
            onOpenShopDirections={session.handleOpenShopDirections}
            onPauseNavigation={nav.onPauseNavigation}
            onViewDetails={actions.handleViewShopDetails}
            onRequestEstimate={userType === "customer" ? actions.handleRequestEstimate : undefined}
            onRecenterNavigation={nav.onRecenterNavigation}
            onResumeNavigation={nav.onResumeNavigation}
            onStartNavigation={nav.handleStartInAppNavigation}
            onSearchQueryChange={session.setSearchQuery}
            onSearchSubmit={session.handleSearchSubmit as (event: FormEvent) => void}
            onSelectRoute={session.setSelectedRouteId}
            onSelectShop={handleSelectShop}
            onSetMapCenter={session.setMapCenter}
            onSetMapZoom={session.setMapZoom}
            onSetMapViewportBounds={session.setMapViewportBounds}
            onSwitchMode={session.setMapViewMode}
            onToggleRoleCollection={session.handleToggleRoleCollection}
            onToggleTheme={session.handleToggleTheme}
            primaryColor={primaryColor}
            hasArrived={nav.hasArrivedForSelectedShop}
            isLoadingRoute={nav.routePanel.isLoadingRoute}
            remainingDistanceLabel={nav.liveRemainingDistanceLabel}
            remainingEtaLabel={nav.liveRemainingEtaLabel}
            roleCollectionIds={session.roleCollectionIds}
            roleHighlights={session.roleHighlights}
            routeError={nav.routePanel.routeError}
            routeOptions={nav.mapRouteOptions}
            routeSummary={nav.mapRouteSummary}
            routeSteps={nav.routeSteps}
            sessionActiveSeconds={nav.sessionActiveSeconds}
            savedPlaces={session.savedPlaces}
            searchQuery={session.searchQuery}
            selectedOrigin={session.selectedOrigin}
            selectedRoute={nav.mapSelectedRoute}
            selectedRouteId={session.selectedRouteId}
            selectedShop={session.selectedShop}
            selectedShopId={session.selectedShopId}
            currentStepIndex={nav.currentStepIndex}
            usingLiveRoutes={nav.routePanel.usingLiveRoutes}
            userCoords={nav.shopMapUserCoords}
            userHeadingDegrees={nav.userHeadingDegrees}
            userType={userType}
            onViewReportDetail={onViewReportDetail}
            onPlaceBid={onPlaceBidForShop}
            onViewBids={onViewBidsForCustomer}
            initialReports={mapReports}
            nextInstruction={nav.routePanel.nextInstruction}
            followingInstruction={nav.routePanel.followingInstruction}
            currentSpeedMph={nav.currentSpeedMph}
            gpsStatus={nav.gpsStatus}
            gpsError={nav.gpsError}
            speedLimitMph={nav.speedLimitMph}
            voiceMode={nav.voiceMode}
            voiceVolumePreset={nav.voiceVolumePreset}
            preferredVoiceLabel={nav.preferredVoiceLabel}
            voiceGuidanceSupported={nav.voiceGuidanceSupported}
            onVoiceModeChange={nav.onVoiceModeChange}
            onVoiceVolumePresetChange={nav.onVoiceVolumePresetChange}
            gpsTrackingEnabled={nav.gpsTrackingEnabled}
            speedLimitMonitorEnabled={nav.speedLimitMonitorEnabled}
            autoRerouteEnabled={nav.autoRerouteEnabled}
            onToggleGpsTracking={nav.onToggleGpsTracking}
            onToggleSpeedLimitMonitor={nav.onToggleSpeedLimitMonitor}
            onToggleAutoReroute={nav.onToggleAutoReroute}
            onRetryGps={nav.onRetryGps}
            onRetryRoute={nav.onRetryRoute}
            searchWithinViewport={session.searchWithinViewport}
            onSearchInArea={session.handleSearchInArea}
            onClearAreaSearch={session.handleClearAreaSearch}
            onFindShopsNear={handleFindShopsNear}
            suggestedOrigins={session.suggestedOrigins}
            originSearchQuery={session.originSearchQuery}
            originSearchResults={session.originSearchResults}
            originSuggestions={session.originSuggestions}
            isSearchingOrigins={session.isSearchingOrigins}
            originSearchError={session.originSearchError}
            locationError={session.userGeolocation.error}
            isLocating={session.userGeolocation.isLocating}
            onSelectOrigin={session.handleSelectOrigin}
            onOriginSearchQueryChange={session.handleOriginSearchQueryChange}
            onSearchOrigin={session.handleSearchOrigin}
            onSelectOriginSearchResult={session.handleSelectOriginSearchResult}
            onSelectOriginSuggestion={session.handleSelectOriginSuggestion}
            onUseMyLocation={session.handleUseMyLocation}
            sortBy={session.sortBy}
            onSortChange={session.setSortBy}
          />
        </NavigationErrorBoundary>
        <ShopDirectorySheets
          actions={actions}
          isDark={session.isMapDark}
          isDetailShopSaved={isDetailShopSaved}
          onGetDirections={session.handleOpenShopDirections}
          onRequestEstimate={userType === "customer" ? actions.handleRequestEstimate : undefined}
          onToggleSave={handleToggleSaveShop}
        />
      </>
    );
  }

  /* ── Hybrid stage layout ─────────────────────────── */
  if (session.showMapPane) {
    return (
      <ShopDirectoryHybridStage
        appearanceMode={appearanceMode}
        identity={identity}
        userType={userType}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        session={session}
        nav={nav}
        actions={actions}
        onBack={onBack}
        onOpenRelatedScreen={onOpenRelatedScreen}
        onViewReportDetail={onViewReportDetail}
        onViewBids={onViewBids}
        mapReports={mapReports}
        focusReportId={focusReportId}
        RoleIcon={RoleIcon}
        accentClasses={accentClasses}
        compactCards={compactCards}
        handleSelectShop={handleSelectShop}
        handleToggleSaveShop={handleToggleSaveShop}
        isDetailShopSaved={isDetailShopSaved}
        onPlaceBidForShop={onPlaceBidForShop}
        onViewBidsForCustomer={onViewBidsForCustomer}
        handleFindShopsNear={handleFindShopsNear}
        deviationPromptNode={deviationPromptNode}
        isOffRoute={isOffRoute}
      />
    );
  }

  /* ── List-only mode layout ─────────────────────────── */
  return (
    <div className="space-y-6 pb-20">
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

      {session.usingDemoFallback && (
        <div
          className={`mx-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
            isLight
              ? "border-amber-300/60 bg-amber-50 text-amber-700"
              : "border-amber-400/30 bg-amber-400/10 text-amber-300"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            Showing example shop locations. Verified partner shops will appear once your account is
            connected.
          </span>
        </div>
      )}

      {!session.usingDemoFallback && session.coverageFetchError && (
        <div
          className={`mx-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
            isLight
              ? "border-rose-300/60 bg-rose-50 text-rose-700"
              : "border-rose-400/30 bg-rose-400/10 text-rose-200"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            Live partner-shop data is temporarily unavailable. Check network or backend status and
            retry.
          </span>
        </div>
      )}

      {deviationPromptNode}

      <section
        className={`overflow-hidden rounded-none border-0 bg-transparent shadow-none md:rounded-2xl md:border ${isLight ? "md:border-slate-200/60" : "md:border-white/[0.08]"}`}
      >
        <div className="min-w-0">
          <aside
            className={`min-h-0 bg-transparent ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}
          >
            <div className="flex h-full flex-col">
              <ShopDirectorySearchPanel
                appearanceMode={appearanceMode}
                RoleIcon={RoleIcon}
                currentOriginIsSaved={session.currentOriginIsSaved}
                filterRating={session.filterRating}
                isLocating={session.userGeolocation.isLocating}
                isSearchingOrigins={session.isSearchingOrigins}
                locationError={session.userGeolocation.error}
                mapTheme={session.mapTheme}
                mapViewMode={session.mapViewMode}
                onClearAreaSearch={session.handleClearAreaSearch}
                onClearOrigin={session.handleClearOrigin}
                onFilterRatingChange={session.setFilterRating}
                onOriginSearchQueryChange={session.handleOriginSearchQueryChange}
                onOpenRelatedScreen={onOpenRelatedScreen}
                onSearchOrigin={session.handleSearchOrigin}
                onSaveOrigin={session.handleSaveOrigin}
                onSearchQueryChange={session.setSearchQuery}
                onSearchSubmit={session.handleSearchSubmit}
                onSelectOrigin={session.handleSelectOrigin}
                onSelectOriginSearchResult={session.handleSelectOriginSearchResult}
                onSelectOriginSuggestion={session.handleSelectOriginSuggestion}
                onSortChange={session.setSortBy}
                onToggleTheme={session.handleToggleTheme}
                onUseMyLocation={session.handleUseMyLocation}
                onViewModeChange={session.setMapViewMode}
                originSearchError={session.originSearchError}
                originSearchQuery={session.originSearchQuery}
                originSearchResults={session.originSearchResults}
                originSuggestions={session.originSuggestions}
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
                onStartNavigation={nav.handleStartInAppNavigation}
                onViewDetails={actions.handleViewShopDetails}
                onRequestEstimate={
                  userType === "customer" ? actions.handleRequestEstimate : undefined
                }
                navigationSessionDestinationId={nav.navigationSessionDestinationId}
                navigationSessionStatus={nav.navigationSessionStatus}
                routePanel={nav.routePanel}
                session={session}
                userType={userType}
                primaryColor={primaryColor}
                compactCards={compactCards}
              />
            </div>
          </aside>
        </div>
      </section>

      <ShopDirectoryContextCards
        appearanceMode={appearanceMode}
        connectedCarrierNames={session.connectedCarrierNames}
        reportCount={reports.length}
        userInfo={userInfo}
        userType={userType}
      />

      <ShopDirectorySheets
        actions={actions}
        isDark={appearanceMode !== "light"}
        isDetailShopSaved={isDetailShopSaved}
        onGetDirections={session.handleOpenShopDirections}
        onRequestEstimate={userType === "customer" ? actions.handleRequestEstimate : undefined}
        onToggleSave={handleToggleSaveShop}
      />
    </div>
  );
}
