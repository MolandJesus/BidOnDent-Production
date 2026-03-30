import { type FormEvent } from "react";
import { AlertTriangle, Briefcase, Car, Shield } from "lucide-react";
import ShopDirectoryMapPane from "./MapLibreShopDirectoryMapPane";
import ShopDirectoryMapOverlays from "./ShopDirectoryMapOverlays";
import ShopDirectoryImmersiveMap from "./ShopDirectoryImmersiveMap";
import ShopDirectoryListBody from "./ShopDirectoryListBody";
import ShopDirectoryContextCards from "./ShopDirectoryContextCards";
import ShopDirectoryHero from "./ShopDirectoryHero";
import ShopDirectorySearchPanel from "./ShopDirectorySearchPanel";
import NavigationActiveManeuverCard from "../maps/navigation/NavigationActiveManeuverCard";
import NavigationDeviationPrompt from "../maps/navigation/NavigationDeviationPrompt";
import NavigationErrorBoundary from "../maps/NavigationErrorBoundary";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import { getDefaultMapCenter } from "../../services/intelligence/shopMapExperience";
import { useShopDirectorySession } from "../../hooks/useShopDirectorySession";
import { useShopDirectoryNavigation } from "../../hooks/useShopDirectoryNavigation";

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
  onViewReportDetail,
}: ShopDirectoryScreenProps) {
  const session = useShopDirectorySession({ identity, userType, vehicles, reports });
  const nav = useShopDirectoryNavigation({ session, identity, userType });

  const RoleIcon = getRoleIcon(userType);
  const isLight = appearanceMode === "light";
  const accentClasses = getRoleAccent(userType, isLight);
  const compactCards = session.mapViewMode === "map";

  const mapShellLayoutClass = session.showMapPane
    ? session.mapViewMode === "map"
      ? "min-[960px]:grid-cols-[minmax(300px,340px)_minmax(0,1fr)] lg:grid-cols-[minmax(320px,360px)_minmax(0,1fr)]"
      : "min-[960px]:grid-cols-[clamp(320px,33vw,390px)_minmax(0,1fr)] lg:grid-cols-[clamp(340px,31vw,420px)_minmax(0,1fr)]"
    : "";

  const renderGuidanceOverlay = (containerClassName: string) =>
    nav.liveNavigationForSelectedShop && nav.routePreview ? (
      <NavigationActiveManeuverCard
        containerClassName={containerClassName}
        followingStep={nav.followingStep}
        nextStep={nav.nextStep}
        tone={session.mapTheme}
      />
    ) : null;

  const deviationPromptNode = nav.deviationEvent ? (
    <NavigationDeviationPrompt
      event={nav.deviationEvent}
      mapTheme={session.mapTheme}
      onReviewRoute={nav.handleReviewRoute}
    />
  ) : undefined;
  /* ── Immersive full-viewport map mode ───────────────────── */
  if (session.isImmersive) {
    return (
      <NavigationErrorBoundary>
        <ShopDirectoryImmersiveMap
          deviationPrompt={deviationPromptNode}
          directionsActionLabel={session.directionsActionLabel}
          followCurrentPosition={nav.liveNavigationForSelectedShop}
          followCurrentPositionRevision={nav.followCurrentPositionRevision}
          guidanceOverlay={renderGuidanceOverlay("top-20 sm:top-24")}
          mapCenter={session.mapCenter ?? null}
          mapListings={session.mapListings}
          mapTheme={session.mapTheme}
          mapZoom={session.mapZoom ?? 9}
          navigationMode={nav.navigationMode}
          navigationSessionDestinationId={nav.navigationSessionDestinationId}
          navigationSessionStatus={nav.navigationSessionStatus}
          onBack={onBack}
          onEndNavigation={nav.onEndNavigation}
          onOpenShopDirections={session.handleOpenShopDirections}
          onPauseNavigation={nav.onPauseNavigation}
          onRecenterNavigation={nav.onRecenterNavigation}
          onResumeNavigation={nav.onResumeNavigation}
          onStartNavigation={nav.handleStartInAppNavigation}
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
          onRetryGps={nav.onRetryGps}
          onRetryRoute={nav.onRetryRoute}
          searchWithinViewport={session.searchWithinViewport}
          onSearchInArea={session.handleSearchInArea}
          onClearAreaSearch={session.handleClearAreaSearch}
        />
      </NavigationErrorBoundary>
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

      {/* Demo fallback indicator */}
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

      {/* Deviation prompt: only rendered outside map on list mode */}
      {!session.showMapPane && deviationPromptNode}

      <section
        className={`overflow-hidden rounded-none border-0 shadow-none md:rounded-2xl md:border md:shadow-none bg-transparent ${isLight ? "md:border-slate-200/60" : "md:border-white/[0.08]"}`}
      >
        <div
          className={`min-w-0 ${session.showMapPane ? `flex flex-col min-[960px]:grid min-[960px]:items-stretch ${mapShellLayoutClass}` : ""}`}
        >
          <aside
            className={`${session.showMapPane ? "min-[960px]:order-1 min-[960px]:border-r min-[960px]:overflow-y-auto min-[960px]:max-h-[calc(100vh-140px)]" : ""} min-h-0 ${isLight ? "border-slate-200/60" : "border-white/[0.08]"} bg-transparent`}
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

          {session.showMapPane && (
            <div
              className={`-order-1 min-[960px]:order-2 h-[48dvh] min-h-[300px] max-h-[560px] sm:h-[52dvh] md:h-[56dvh] min-[960px]:h-[calc(100vh-140px)] min-[960px]:max-h-none min-[960px]:sticky min-[960px]:top-0`}
            >
              <NavigationErrorBoundary>
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
                  routeOptions={nav.mapRouteOptions}
                  savedPlaces={session.savedPlaces}
                  preserveViewport={session.searchWithinViewport}
                  searchWithinViewport={session.searchWithinViewport}
                  selectedOrigin={session.selectedOrigin}
                  selectedRouteId={nav.mapSelectedRoute?.id ?? session.selectedRouteId}
                  selectedShopId={session.selectedShopId}
                  shops={session.mapListings}
                  suppressHeader
                  userCoords={nav.shopMapUserCoords}
                  userHeadingDegrees={nav.userHeadingDegrees}
                  userType={userType}
                  followCurrentPosition={nav.liveNavigationForSelectedShop}
                  followCurrentPositionRevision={nav.followCurrentPositionRevision}
                  onOpenShopDirections={session.handleOpenShopDirections}
                  onStartNavigation={nav.handleStartInAppNavigation}
                  navigationSessionDestinationId={nav.navigationSessionDestinationId}
                  navigationSessionStatus={nav.navigationSessionStatus}
                  directionsActionLabel={session.directionsActionLabel}
                  hasArrived={nav.hasArrivedForSelectedShop}
                  isLoadingRoute={nav.routePanel.isLoadingRoute}
                  remainingDistanceLabel={nav.liveRemainingDistanceLabel}
                  remainingEtaLabel={nav.liveRemainingEtaLabel}
                  routeError={nav.routePanel.routeError}
                  usingLiveRoutes={nav.routePanel.usingLiveRoutes}
                  onViewReportDetail={onViewReportDetail}
                  navigationSteps={nav.routeSteps}
                  currentStepIndex={nav.currentStepIndex}
                  navigationMode={nav.navigationMode}
                >
                  <>
                    <ShopDirectoryMapOverlays
                      deviationPrompt={deviationPromptNode}
                      directionsLabel={nav.selectedShopNavigationActionLabel}
                      intelligenceCallouts={session.roleHighlights.callouts}
                      intelligenceTitle={session.roleHighlights.title}
                      mapTheme={session.mapTheme}
                      navigationMode={nav.navigationMode}
                      onEndNavigation={nav.onEndNavigation}
                      onDismissRoutePreview={() => session.setSelectedShopId(null)}
                      onPauseNavigation={nav.onPauseNavigation}
                      onRecenterNavigation={nav.onRecenterNavigation}
                      onResumeNavigation={nav.onResumeNavigation}
                      onSelectRoute={session.setSelectedRouteId}
                      onStartNavigation={
                        session.selectedShop
                          ? () => nav.handleStartInAppNavigation(session.selectedShop)
                          : undefined
                      }
                      remainingDistanceLabel={nav.liveRemainingDistanceLabel}
                      remainingEtaLabel={nav.liveRemainingEtaLabel}
                      routeError={nav.routePanel.routeError}
                      routeOptions={nav.mapRouteOptions}
                      routeSummary={nav.mapRouteSummary}
                      hasArrived={nav.hasArrivedForSelectedShop}
                      sessionActiveSeconds={nav.sessionActiveSeconds}
                      sessionDestinationId={nav.navigationSessionDestinationId}
                      sessionDestinationLabel={nav.sessionDestinationLabel}
                      sessionStatus={nav.navigationSessionStatus}
                      isLoadingRoute={nav.routePanel.isLoadingRoute}
                      selectedOrigin={session.selectedOrigin}
                      selectedRoute={nav.mapSelectedRoute}
                      selectedShop={session.selectedShop}
                      usingLiveRoutes={nav.routePanel.usingLiveRoutes}
                      nextInstruction={nav.routePanel.nextInstruction}
                      followingInstruction={nav.routePanel.followingInstruction}
                      currentSpeedMph={nav.currentSpeedMph}
                      gpsStatus={nav.gpsStatus}
                      gpsError={nav.gpsError}
                      speedLimitMph={nav.speedLimitMph}
                      onRetryGps={nav.onRetryGps}
                      onRetryRoute={nav.onRetryRoute}
                    />
                    {renderGuidanceOverlay("top-4 sm:top-5")}
                  </>
                </ShopDirectoryMapPane>
              </NavigationErrorBoundary>
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
