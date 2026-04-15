// Must run before any Map instantiation — patches resize crash
import "../../utils/maplibreResizePatch";

import "maplibre-gl/dist/maplibre-gl.css";

import { Map, GeolocateControl, NavigationControl, ScaleControl } from "react-map-gl/maplibre";
import { Source, Layer } from "react-map-gl/maplibre";
import { useMemo } from "react";
import { Expand } from "lucide-react";
import { usePublicServiceAreas } from "../../hooks/usePublicServiceAreas";
import { circleToPolygon } from "../../utils/geoCircle";
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
  onExpandMap,
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

  /* ── Service area circles ─────────────────────────────────────── */
  const { areas: publicServiceAreas } = usePublicServiceAreas();
  const serviceAreaGeoJson = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: publicServiceAreas
        .filter(
          (a) => a.center_latitude != null && a.center_longitude != null && a.radius_miles != null
        )
        .map((a) => circleToPolygon(a.center_latitude!, a.center_longitude!, a.radius_miles!)),
    }),
    [publicServiceAreas]
  );

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

      {onExpandMap ? (
        <div className="pointer-events-none absolute right-3 top-3 z-[520]">
          <button
            type="button"
            onClick={onExpandMap}
            aria-label="Expand map"
            title="Expand map"
            className={`pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border shadow-[0_14px_28px_rgba(15,23,42,0.22)] backdrop-blur-xl transition-all hover:scale-[1.03] active:scale-[0.97] ${
              isDark
                ? "border-blue-300/18 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(15,23,42,0.78))] text-slate-100 hover:bg-[linear-gradient(180deg,rgba(21,33,58,0.92),rgba(15,23,42,0.84))]"
                : "border-slate-200/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,245,249,0.88))] text-slate-700 hover:text-slate-900"
            }`}
          >
            <Expand className="h-4 w-4" />
          </button>
        </div>
      ) : null}

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

            {/* ── Service area coverage circles ── */}
            {publicServiceAreas.length > 0 && (
              <Source id="shop-dir-service-areas" type="geojson" data={serviceAreaGeoJson}>
                <Layer
                  id="shop-dir-service-area-fill"
                  type="fill"
                  paint={{ "fill-color": "#2563eb", "fill-opacity": 0.08 }}
                />
                <Layer
                  id="shop-dir-service-area-border"
                  type="line"
                  paint={{
                    "line-color": "#3b82f6",
                    "line-width": 1.5,
                    "line-opacity": 0.45,
                    "line-dasharray": [3, 2],
                  }}
                />
              </Source>
            )}

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
