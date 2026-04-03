import "maplibre-gl/dist/maplibre-gl.css";

import {
  Map,
  FullscreenControl,
  GeolocateControl,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/maplibre";
import NavigationErrorBoundary from "../maps/NavigationErrorBoundary";
import ShopDirectoryMapPopup from "./ShopDirectoryMapPopup";
import MapLibreReportLayer from "../maps/MapLibreReportLayer";
import MapLibreShopDirectoryViewportManager from "./MapLibreShopDirectoryViewportManager";
import ShopDirectoryMapLayers from "./ShopDirectoryMapLayers";
import {
  MapLibreFollowLocationController,
  MapLibreArrivalCameraEffect,
} from "../maps/mapLibreControllers";
import {
  MapPaneHeaderBadges,
  MapPaneBottomOverlay,
  MapPaneSearchPills,
} from "./ShopDirectoryMapPaneOverlays";
import {
  MapLoadingSkeleton,
  MapTilePicker,
  MapEmptyState,
  GeoErrorToast,
} from "./ShopDirectoryMapPaneInlineUI";
import { useMapPaneState } from "./useMapPaneState";
import MapPaneAtmosphereOverlays from "./MapPaneAtmosphereOverlays";
import MapPaneInfoPopups from "./MapPaneInfoPopups";

import type { ShopDirectoryMapPaneProps } from "./shopDirectoryMapPaneTypes";

export default function MapLibreShopDirectoryMapPane({
  shops,
  routeOptions,
  selectedRouteId,
  selectedShopId,
  onSelectShop,
  selectedOrigin,
  savedPlaces,
  mapTheme,
  initialCenter,
  initialZoom,
  preserveViewport,
  userType,
  onViewportChange,
  children,
  suppressHeader,
  suppressTilePicker = false,
  externalTileMode,
  searchWithinViewport,
  onSearchInArea,
  onClearAreaSearch,
  onFindShopsNear: onFindShopsNearProp,
  userCoords,
  userHeadingDegrees,
  followCurrentPosition = false,
  followCurrentPositionRevision = 0,
  onOpenShopDirections,
  onStartNavigation,
  onViewDetails,
  onRequestEstimate,
  navigationSessionStatus,
  navigationSessionDestinationId,
  directionsActionLabel,
  hasArrived = false,
  remainingEtaLabel,
  remainingDistanceLabel,
  usingLiveRoutes = false,
  routeError = "",
  isLoadingRoute = false,
  onViewReportDetail,
  onPlaceBid,
  onViewBids,
  initialReports,
  focusReportId,
  navigationSteps = [],
  currentStepIndex = 0,
  navigationMode = "browse",
  isOffRoute = false,
  onSwitchToListMode,
  suppressBottomCard = false,
  suppressShopPopup = false,
  onTileDarkChange,
  onTileModeChange,
  overlayDensity = "default",
}: ShopDirectoryMapPaneProps) {
  const {
    containerRef,
    containerReady,
    mapLoaded,
    mapLoadFailed,
    mapRenderNonce,
    geoError,
    setGeoError,
    tileMode,
    setTileMode,
    hasPanned,
    setHasPanned,
    showSavedPlaces,
    setShowSavedPlaces,
    showReports,
    setShowReports,
    showRoutes,
    setShowRoutes,
    reportStatusFilter,
    setReportStatusFilter,
    reportCount,
    cursor,
    setCursor,
    shopPopup,
    setShopPopup,
    savedPlacePopup,
    setSavedPlacePopup,
    routePopup,
    setRoutePopup,
    handleMapClick,
    handleMapMouseMove,
    selectedShop,
    selectedRoute,
    isNight,
    isSatellite,
    isDark,
    effectiveMapTheme,
    isCompactOverlay,
    isGuidanceActive,
    selectedShopHasLiveNavigation,
    canUseNavigationActionForSelectedShop,
    selectedShopActionLabel,
    mapStyle,
    fitSignature,
    shopsGeoJson,
    routesGeoJson,
    originGeoJson,
    userCoordsGeoJson,
    savedPlacesGeoJson,
    interactiveLayerIds,
    handleRetryMap,
    handleViewportBroadcast,
    handleReportCountChange,
    handleFindShopsNear,
    handleMapLoad,
    handleMapLoadError,
  } = useMapPaneState({
    userType,
    mapTheme,
    externalTileMode,
    shops,
    selectedShopId,
    onSelectShop,
    routeOptions,
    selectedRouteId,
    selectedOrigin,
    savedPlaces,
    userCoords,
    userHeadingDegrees,
    navigationMode,
    navigationSessionStatus,
    navigationSessionDestinationId,
    hasArrived,
    directionsActionLabel,
    onStartNavigation,
    onTileDarkChange,
    onTileModeChange,
    onViewportChange,
    onFindShopsNear: onFindShopsNearProp,
    onSearchInArea,
    overlayDensity,
  });

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      data-map-theme={effectiveMapTheme}
      role="region"
      aria-label="Shop directory map"
      className="shop-directory-map @container relative h-full min-h-[420px] w-full overflow-hidden"
      style={
        isNight
          ? { backgroundColor: "#0a1a38" }
          : isSatellite
            ? { backgroundColor: "#0c1420" }
            : undefined
      }
    >
      <MapPaneAtmosphereOverlays isNight={isNight} isSatellite={isSatellite} />
      {/* ── Header badges ── */}
      {!suppressHeader && (
        <MapPaneHeaderBadges
          isDark={isDark}
          userType={userType}
          selectedOrigin={selectedOrigin}
          shopCount={shops.length}
        />
      )}

      {/* ── MapLibre GL map (gated on container dimensions) ── */}
      {containerReady && (
        <NavigationErrorBoundary>
          <Map
            key={mapRenderNonce}
            id="shop-directory-map"
            initialViewState={{
              longitude: initialCenter?.longitude ?? -73.8654,
              latitude: initialCenter?.latitude ?? 41.0534,
              zoom: initialZoom ?? 11,
            }}
            minZoom={navigationMode === "guidance" ? 12 : 3}
            maxZoom={19}
            maxPitch={tileMode === "satellite" || navigationMode === "guidance" ? 65 : 0}
            mapStyle={mapStyle}
            style={{ width: "100%", height: "100%" }}
            cursor={cursor}
            interactiveLayerIds={interactiveLayerIds}
            onClick={handleMapClick}
            onMouseMove={handleMapMouseMove}
            onMouseLeave={() => setCursor("")}
            onLoad={handleMapLoad}
            onError={handleMapLoadError}
            attributionControl={{ compact: true }}
          >
            {/* Standard map controls */}
            <FullscreenControl position="top-right" />
            <GeolocateControl
              position="bottom-right"
              trackUserLocation
              showAccuracyCircle={false}
              onError={(e) => {
                if (e?.code === 1) {
                  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
                  setGeoError(
                    isIos
                      ? "Location denied. Open Settings → Privacy → Location Services."
                      : "Location denied. Check browser location permissions."
                  );
                } else {
                  setGeoError("Unable to determine your location.");
                }
              }}
            />
            <NavigationControl
              position="bottom-right"
              showCompass={navigationMode === "guidance"}
            />
            <ScaleControl position="bottom-left" maxWidth={120} unit="imperial" />

            {/* Viewport management (fit, fly, broadcast) */}
            <MapLibreShopDirectoryViewportManager
              fitSignature={fitSignature}
              shops={shops}
              selectedShopId={selectedShopId}
              selectedOrigin={selectedOrigin}
              initialCenter={initialCenter}
              initialZoom={initialZoom}
              preserveViewport={preserveViewport}
              onViewportChange={handleViewportBroadcast}
            />

            {/* Report markers (Supabase-fetched) */}
            <MapLibreReportLayer
              mapTheme={effectiveMapTheme}
              onViewReportDetail={onViewReportDetail}
              onReportCountChange={handleReportCountChange}
              onFindShopsNear={handleFindShopsNear}
              onPlaceBid={onPlaceBid}
              onViewBids={onViewBids}
              initialReports={initialReports}
              visible={showReports}
              statusFilter={reportStatusFilter}
              userType={userType}
              focusReportId={focusReportId}
            />

            <ShopDirectoryMapLayers
              isDark={isDark}
              hasRoutes={routeOptions.length > 0}
              routesGeoJson={routesGeoJson}
              originGeoJson={originGeoJson}
              userCoordsGeoJson={userCoordsGeoJson}
              savedPlacesGeoJson={savedPlacesGeoJson}
              shopsGeoJson={shopsGeoJson}
              showSavedPlaces={showSavedPlaces}
              showRoutes={showRoutes}
              navigationSteps={navigationSteps}
              currentStepIndex={currentStepIndex}
              isGuidanceActive={navigationMode === "guidance"}
              isOffRoute={isOffRoute}
              userHeadingDegrees={userHeadingDegrees}
            />

            <MapLibreFollowLocationController
              enabled={followCurrentPosition}
              currentPosition={
                userCoords
                  ? ([userCoords.latitude, userCoords.longitude] as [number, number])
                  : null
              }
              revision={followCurrentPositionRevision}
              guidanceMode={navigationMode === "guidance"}
              bearing={userHeadingDegrees}
            />

            <MapLibreArrivalCameraEffect
              hasArrived={hasArrived}
              destination={
                selectedShop
                  ? ([
                      selectedShop.mapResult.coordinates.latitude,
                      selectedShop.mapResult.coordinates.longitude,
                    ] as [number, number])
                  : null
              }
            />

            {/* ── Shop popup (suppressed when side panel is active) ── */}
            {shopPopup && !suppressShopPopup && (
              <ShopDirectoryMapPopup
                shopPopup={shopPopup}
                onClose={() => {
                  setShopPopup(null);
                  onSelectShop(null);
                }}
                mapTheme={effectiveMapTheme}
                selectedShop={selectedShop}
                selectedOrigin={selectedOrigin}
                selectedRoute={selectedRoute}
                navigationSessionStatus={navigationSessionStatus}
                navigationSessionDestinationId={navigationSessionDestinationId}
                directionsActionLabel={directionsActionLabel}
                hasArrived={hasArrived}
                remainingEtaLabel={remainingEtaLabel}
                remainingDistanceLabel={remainingDistanceLabel}
                usingLiveRoutes={usingLiveRoutes}
                routeError={routeError}
                isLoadingRoute={isLoadingRoute}
                onOpenShopDirections={onOpenShopDirections}
                onStartNavigation={onStartNavigation}
                onViewDetails={onViewDetails}
                onRequestEstimate={onRequestEstimate}
                compact={isCompactOverlay}
              />
            )}

            <MapPaneInfoPopups
              isDark={isDark}
              savedPlacePopup={savedPlacePopup}
              onCloseSavedPlace={() => setSavedPlacePopup(null)}
              routePopup={routePopup}
              onCloseRoute={() => setRoutePopup(null)}
            />
          </Map>
        </NavigationErrorBoundary>
      )}

      <MapLoadingSkeleton
        mapLoaded={mapLoaded}
        mapLoadFailed={mapLoadFailed}
        isDark={isDark}
        onRetryMap={handleRetryMap}
        onSwitchToListMode={onSwitchToListMode}
      />

      {!isGuidanceActive && !suppressTilePicker && (
        <MapTilePicker
          compact={isCompactOverlay}
          isDark={isDark}
          tileMode={tileMode}
          setTileMode={setTileMode}
        />
      )}

      <MapEmptyState isDark={isDark} shopCount={shops.length} />

      {/* ── Bottom gradient overlay: selected shop card + legend ── */}
      {!suppressBottomCard && (
        <MapPaneBottomOverlay
          isDark={isDark}
          selectedShop={selectedShop}
          selectedRoute={selectedRoute}
          hasArrived={hasArrived}
          onOpenShopDirections={onOpenShopDirections}
          onStartNavigation={onStartNavigation}
          canStartNavigation={canUseNavigationActionForSelectedShop}
          directionsActionLabel={selectedShopActionLabel}
          hasLiveNavigation={selectedShopHasLiveNavigation}
          isLoadingRoute={isLoadingRoute}
          navigationSessionStatus={navigationSessionStatus}
          remainingDistanceLabel={remainingDistanceLabel}
          remainingEtaLabel={remainingEtaLabel}
          routeError={routeError}
          usingLiveRoutes={usingLiveRoutes}
          compact={Boolean(children && selectedRoute)}
          showSavedPlaces={showSavedPlaces}
          onToggleSavedPlaces={() => setShowSavedPlaces((v) => !v)}
          showReports={showReports}
          onToggleReports={() => setShowReports((v) => !v)}
          reportCount={reportCount}
          showRoutes={showRoutes}
          onToggleRoutes={() => setShowRoutes((v) => !v)}
          reportStatusFilter={reportStatusFilter}
          onReportStatusFilterChange={setReportStatusFilter}
          density={overlayDensity}
        />
      )}

      {/* Search area pills — hidden during guidance */}
      {!isGuidanceActive && (
        <MapPaneSearchPills
          isDark={isDark}
          hasPanned={hasPanned}
          searchWithinViewport={searchWithinViewport}
          onSearchInArea={onSearchInArea}
          onClearAreaSearch={onClearAreaSearch}
          onClearPan={() => setHasPanned(false)}
          density={overlayDensity}
        />
      )}

      <GeoErrorToast geoError={geoError} />

      {/* Floating overlay children (route preview, intelligence, deviation prompt) */}
      {children}
    </div>
  );
}
