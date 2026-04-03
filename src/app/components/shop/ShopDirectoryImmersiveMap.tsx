import type { FormEvent } from "react";
import { useState } from "react";
import ShopDirectoryMapInfoPanel from "./ShopDirectoryMapInfoPanel";
import ImmersiveOriginPicker from "./ImmersiveOriginPicker";
import ImmersiveMapTopBar from "./ImmersiveMapTopBar";
import ImmersiveMapResultsDrawer, { type DrawerSnap } from "./ImmersiveMapResultsDrawer";
import ImmersiveMapViewport from "./ImmersiveMapViewport";
import type { MapTileMode } from "../maps/serviceCoverageMapTypes";
import type { MapTheme } from "../../types/mapDomain";
import type { ShopDirectoryImmersiveMapProps } from "./shopDirectoryImmersiveMapTypes";

export default function ShopDirectoryImmersiveMap({
  mapListings,
  routeOptions,
  selectedRoute,
  selectedRouteId,
  selectedShopId,
  selectedShop,
  selectedOrigin,
  savedPlaces,
  routeSummary,
  mapTheme,
  isMapDark,
  mapCenter,
  mapZoom,
  userType,
  roleHighlights,
  roleCollectionIds,
  primaryColor,
  directionsActionLabel,
  searchQuery,
  navigationSessionStatus,
  navigationSessionDestinationId,
  sessionActiveSeconds,
  hasArrived = false,
  remainingEtaLabel,
  remainingDistanceLabel,
  usingLiveRoutes = false,
  routeError = "",
  isLoadingRoute = false,
  guidanceOverlay,
  followCurrentPosition = false,
  followCurrentPositionRevision = 0,
  deviationPrompt,
  isOffRoute = false,
  navigationMode,
  routeSteps = [],
  currentStepIndex = 0,
  nextInstruction,
  currentSpeedMph,
  speedLimitMph,
  gpsStatus,
  gpsError,
  followingInstruction,
  voiceMode = "alerts-only",
  voiceVolumePreset = "normal",
  preferredVoiceLabel = null,
  voiceGuidanceSupported = true,
  onVoiceModeChange,
  onVoiceVolumePresetChange,
  gpsTrackingEnabled = true,
  speedLimitMonitorEnabled = true,
  autoRerouteEnabled = true,
  onToggleGpsTracking,
  onToggleSpeedLimitMonitor,
  onToggleAutoReroute,
  onRetryGps,
  onRetryRoute,
  searchWithinViewport = false,
  onSearchInArea,
  onClearAreaSearch,
  onFindShopsNear,
  onSearchQueryChange,
  onSearchSubmit,
  onSelectShop,
  onSelectRoute,
  onToggleRoleCollection,
  onOpenShopDirections,
  onStartNavigation,
  onViewDetails,
  onRequestEstimate,
  onPauseNavigation,
  onResumeNavigation,
  onEndNavigation,
  onRecenterNavigation,
  onSetMapCenter,
  onSetMapZoom,
  onSetMapViewportBounds,
  onToggleTheme: _onToggleTheme,
  onSwitchMode,
  onBack,
  userCoords,
  userHeadingDegrees,
  onViewReportDetail,
  onPlaceBid,
  onViewBids,
  initialReports,
  suggestedOrigins = [],
  originSearchQuery = "",
  originSearchResults = [],
  originSuggestions = [],
  isSearchingOrigins = false,
  originSearchError,
  locationError,
  isLocating = false,
  onSelectOrigin,
  onOriginSearchQueryChange,
  onSearchOrigin,
  onSelectOriginSearchResult,
  onSelectOriginSuggestion,
  onUseMyLocation,
  sortBy = "smart-match",
  onSortChange,
}: ShopDirectoryImmersiveMapProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSnap, setDrawerSnap] = useState<DrawerSnap>("half");
  const [tileDarkOverride, setTileDarkOverride] = useState<boolean | null>(null);
  const [tileModeOverride, setTileModeOverride] = useState<MapTileMode | null>(null);
  const isDark = tileDarkOverride ?? isMapDark ?? mapTheme === "dark";
  const isSatellite = tileModeOverride === "satellite";
  const isNight = tileModeOverride === "night" || (!tileModeOverride && isDark);
  const activeTileMode: MapTileMode = tileModeOverride ?? (isDark ? "night" : "roadmap");
  const effectiveMapTheme: MapTheme = isDark ? "dark" : "light";
  const isGuidanceMode = navigationMode === "guidance";

  return (
    <div
      className={`fixed inset-0 z-[60] ${isDark ? "bg-slate-950" : "bg-slate-100"}`}
      style={
        isNight
          ? { background: "linear-gradient(180deg, #0a1a38 0%, #0d2244 40%, #091832 100%)" }
          : isSatellite
            ? { background: "#0c1420" }
            : undefined
      }
    >
      {/* Ambient glow layers (night mode) */}
      {isNight && (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background: [
                "radial-gradient(ellipse 75% 55% at 15% 10%, rgba(59,130,246,0.14), transparent)",
                "radial-gradient(ellipse 55% 55% at 85% 90%, rgba(37,99,235,0.08), transparent)",
                "radial-gradient(ellipse 65% 40% at 50% 95%, rgba(30,58,138,0.06), transparent)",
              ].join(", "),
            }}
          />
          <div className="pointer-events-none absolute -top-20 right-[10%] z-[1] h-[28rem] w-[28rem] rounded-full bg-blue-500/[0.10] blur-[140px]" />
          <div className="pointer-events-none absolute -bottom-16 left-[8%] z-[1] h-[32rem] w-[32rem] rounded-full bg-indigo-500/[0.05] blur-[160px]" />
        </>
      )}
      {isSatellite && (
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: [
              "radial-gradient(ellipse 70% 50% at 20% 15%, rgba(59,130,246,0.06), transparent)",
              "radial-gradient(ellipse 50% 50% at 80% 85%, rgba(37,99,235,0.04), transparent)",
            ].join(", "),
          }}
        />
      )}

      <ImmersiveMapViewport
        isDark={isDark}
        isNight={isNight}
        isSatellite={isSatellite}
        effectiveMapTheme={effectiveMapTheme}
        isGuidanceMode={isGuidanceMode}
        mapCenter={mapCenter}
        mapZoom={mapZoom}
        mapTheme={mapTheme}
        mapListings={mapListings}
        routeOptions={routeOptions}
        selectedRoute={selectedRoute}
        selectedRouteId={selectedRouteId}
        selectedShopId={selectedShopId}
        selectedShop={selectedShop}
        selectedOrigin={selectedOrigin}
        savedPlaces={savedPlaces}
        routeSummary={routeSummary}
        userType={userType}
        roleHighlights={roleHighlights}
        directionsActionLabel={directionsActionLabel}
        navigationSessionStatus={navigationSessionStatus}
        navigationSessionDestinationId={navigationSessionDestinationId}
        sessionActiveSeconds={sessionActiveSeconds}
        hasArrived={hasArrived}
        remainingEtaLabel={remainingEtaLabel}
        remainingDistanceLabel={remainingDistanceLabel}
        usingLiveRoutes={usingLiveRoutes}
        routeError={routeError}
        isLoadingRoute={isLoadingRoute}
        guidanceOverlay={guidanceOverlay}
        followCurrentPosition={followCurrentPosition}
        followCurrentPositionRevision={followCurrentPositionRevision}
        deviationPrompt={deviationPrompt}
        isOffRoute={isOffRoute}
        navigationMode={navigationMode}
        routeSteps={routeSteps}
        currentStepIndex={currentStepIndex}
        nextInstruction={nextInstruction}
        currentSpeedMph={currentSpeedMph}
        speedLimitMph={speedLimitMph}
        gpsStatus={gpsStatus}
        gpsError={gpsError}
        followingInstruction={followingInstruction}
        voiceMode={voiceMode}
        voiceVolumePreset={voiceVolumePreset}
        preferredVoiceLabel={preferredVoiceLabel}
        voiceGuidanceSupported={voiceGuidanceSupported}
        onVoiceModeChange={onVoiceModeChange}
        onVoiceVolumePresetChange={onVoiceVolumePresetChange}
        gpsTrackingEnabled={gpsTrackingEnabled}
        speedLimitMonitorEnabled={speedLimitMonitorEnabled}
        autoRerouteEnabled={autoRerouteEnabled}
        onToggleGpsTracking={onToggleGpsTracking}
        onToggleSpeedLimitMonitor={onToggleSpeedLimitMonitor}
        onToggleAutoReroute={onToggleAutoReroute}
        onRetryGps={onRetryGps}
        onRetryRoute={onRetryRoute}
        searchWithinViewport={searchWithinViewport}
        onSearchInArea={onSearchInArea}
        onClearAreaSearch={onClearAreaSearch}
        onFindShopsNear={onFindShopsNear}
        onSelectShop={onSelectShop}
        onSelectRoute={onSelectRoute}
        onOpenShopDirections={onOpenShopDirections}
        onStartNavigation={onStartNavigation}
        onViewDetails={onViewDetails}
        onRequestEstimate={onRequestEstimate}
        onPauseNavigation={onPauseNavigation}
        onResumeNavigation={onResumeNavigation}
        onEndNavigation={onEndNavigation}
        onRecenterNavigation={onRecenterNavigation}
        onSetMapCenter={onSetMapCenter}
        onSetMapZoom={onSetMapZoom}
        onSetMapViewportBounds={onSetMapViewportBounds}
        userCoords={userCoords}
        userHeadingDegrees={userHeadingDegrees}
        onViewReportDetail={onViewReportDetail}
        onPlaceBid={onPlaceBid}
        onViewBids={onViewBids}
        initialReports={initialReports}
        tileModeOverride={tileModeOverride}
        onTileDarkChange={setTileDarkOverride}
        onTileModeChange={setTileModeOverride}
      />

      {/* Origin picker — shown when shop selected but no origin set */}
      {selectedShop &&
        !selectedOrigin &&
        !isGuidanceMode &&
        onSelectOrigin &&
        onOriginSearchQueryChange &&
        onSearchOrigin &&
        onSelectOriginSearchResult &&
        onSelectOriginSuggestion && (
          <ImmersiveOriginPicker
            isDark={isDark}
            shopName={selectedShop.name}
            suggestedOrigins={suggestedOrigins}
            selectedOrigin={selectedOrigin}
            originSearchQuery={originSearchQuery}
            originSearchResults={originSearchResults}
            originSuggestions={originSuggestions}
            isSearchingOrigins={isSearchingOrigins}
            originSearchError={originSearchError}
            locationError={locationError}
            isLocating={isLocating}
            onSelectOrigin={onSelectOrigin}
            onOriginSearchQueryChange={onOriginSearchQueryChange}
            onSearchOrigin={onSearchOrigin}
            onSelectOriginSearchResult={onSelectOriginSearchResult}
            onSelectOriginSuggestion={onSelectOriginSuggestion}
            onUseMyLocation={onUseMyLocation}
          />
        )}

      {/* Shop info panel */}
      {!isGuidanceMode && (
        <ShopDirectoryMapInfoPanel
          shop={selectedShopId != null ? selectedShop : null}
          mapTheme={effectiveMapTheme}
          selectedRoute={selectedRoute}
          selectedOrigin={selectedOrigin}
          navigationSessionStatus={navigationSessionStatus}
          navigationSessionDestinationId={navigationSessionDestinationId}
          directionsActionLabel={directionsActionLabel}
          hasArrived={hasArrived}
          remainingEtaLabel={remainingEtaLabel}
          remainingDistanceLabel={remainingDistanceLabel}
          onOpenShopDirections={onOpenShopDirections}
          onStartNavigation={onStartNavigation}
          onViewDetails={onViewDetails}
          onRequestEstimate={onRequestEstimate}
          hideDirectionsCta={Boolean(selectedOrigin && selectedRoute && selectedShop)}
        />
      )}

      <ImmersiveMapTopBar
        isDark={isDark}
        isGuidanceMode={isGuidanceMode}
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        onSearchSubmit={onSearchSubmit}
        drawerOpen={drawerOpen}
        onToggleDrawer={() => {
          setDrawerOpen((v) => !v);
          if (!drawerOpen) setDrawerSnap("half");
        }}
        shopCount={mapListings.length}
        onSwitchToSplit={() => onSwitchMode("hybrid")}
        activeTileMode={activeTileMode}
        onCycleTileMode={() => {
          const next: MapTileMode =
            activeTileMode === "roadmap"
              ? "night"
              : activeTileMode === "night"
                ? "satellite"
                : "roadmap";
          setTileModeOverride(next);
        }}
        onBack={onBack}
      />

      <ImmersiveMapResultsDrawer
        isDark={isDark}
        open={drawerOpen}
        snap={drawerSnap}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerSnap("half");
        }}
        onSnapChange={setDrawerSnap}
        mapListings={mapListings}
        selectedShopId={selectedShopId}
        selectedOrigin={selectedOrigin}
        selectedRoute={selectedRoute}
        navigationSessionStatus={navigationSessionStatus}
        navigationSessionDestinationId={navigationSessionDestinationId}
        directionsActionLabel={directionsActionLabel}
        hasArrived={hasArrived}
        userType={userType}
        roleHighlights={roleHighlights}
        roleCollectionIds={roleCollectionIds}
        primaryColor={primaryColor}
        sortBy={sortBy}
        onSortChange={onSortChange}
        onSelectShop={onSelectShop}
        onToggleRoleCollection={onToggleRoleCollection}
        onOpenShopDirections={onOpenShopDirections}
        onStartNavigation={onStartNavigation}
        onViewDetails={onViewDetails}
        onRequestEstimate={onRequestEstimate}
      />
    </div>
  );
}
