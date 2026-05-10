// Must run before any Map instantiation — patches resize crash
import "../../utils/maplibreResizePatch";

import "maplibre-gl/dist/maplibre-gl.css";

import { Map, GeolocateControl, NavigationControl, ScaleControl } from "react-map-gl/maplibre";
import { Source, Layer } from "react-map-gl/maplibre";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { markEngineMount, markEngineDispose } from "../../utils/perfMarks";

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
  useEffect(() => {
    markEngineMount("e2:shop-directory");
    return () => markEngineDispose("e2:shop-directory");
  }, []);

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

  /* ── Pass 93: Tile-mode cross-fade (owner real-map directive) ──────
   * Switching night ↔ satellite ↔ roadmap previously swapped the MapLibre
   * style instantly — visually jarring. We now flash a brief tinted overlay
   * over the canvas (250ms fade-in, 350ms fade-out) so the swap reads as a
   * smooth dissolve rather than a hard cut. The overlay's tint matches the
   * destination tileMode so the eye lands gently on the new palette.
   * Reduce-motion users skip the overlay entirely. */
  const [tileFadeKey, setTileFadeKey] = useState(0);
  const prevTileModeRef = useRef(tileMode);
  useEffect(() => {
    if (prevTileModeRef.current === tileMode) return;
    prevTileModeRef.current = tileMode;
    const reduceMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    setTileFadeKey((k) => k + 1);
  }, [tileMode]);

  const tileFadeTint =
    tileMode === "night"
      ? "rgba(10, 26, 56, 0.65)"
      : tileMode === "satellite"
        ? "rgba(12, 20, 32, 0.55)"
        : "rgba(232, 238, 248, 0.55)";

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
      {/* Pass 100 — KI-112 F6: extend landing-side bd-liquid-gold-flow sheen to
          the map surface frame so the marketplace activity ribbon reads kin
          to the landing surfaces. Very subtle opacity (0.18 dark / 0.10 light)
          so the map remains the dominant signal. Reduce-motion users get
          static (animation suppressed by the existing @media block in
          theme.css §bd-liquid-gold-flow). */}
      <div
        aria-hidden="true"
        className={`bd-liquid-gold-flow ${isDark ? "bd-liquid-gold-flow--dark" : "bd-liquid-gold-flow--light"} pointer-events-none absolute inset-0 z-[205]`}
        style={{ opacity: isDark ? 0.18 : 0.1 }}
      />
      {/* Pass 93: tile-mode cross-fade overlay (key forces remount per swap) */}
      {tileFadeKey > 0 && (
        <div
          key={tileFadeKey}
          aria-hidden="true"
          className="bd-tile-fade pointer-events-none absolute inset-0 z-[210]"
          style={{ backgroundColor: tileFadeTint }}
        />
      )}
      {/* ── Header badges ──
          Pass 197 (KI-168 sub-pass 2): gated on `mapLoaded && !mapLoadFailed`
          + wrapped in `map-ui-enter` so the top-left "live shop card" the audit
          flagged fades in atomically with the bottom overlay (Pass 194) and
          tile picker (Pass 196). Closes the third + final transition-state
          overlay named in the Pass 192 inventory. */}
      {!suppressHeader && mapLoaded && !mapLoadFailed && (
        <div className="map-ui-enter">
          <MapPaneHeaderBadges
            isDark={isDark}
            userType={userType}
            selectedOrigin={selectedOrigin}
            shopCount={shops.length}
          />
        </div>
      )}

      {onExpandMap && mapLoaded && !mapLoadFailed ? (
        <div className="pointer-events-none absolute right-3 top-3 z-[520] map-ui-enter animate-in fade-in zoom-in-95 duration-300 motion-reduce:animate-none">
          <button
            type="button"
            onClick={onExpandMap}
            aria-label="Expand map"
            title="Expand map"
            className={`pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border shadow-[0_14px_28px_rgba(15,23,42,0.22)] backdrop-blur-xl transition-all hover:scale-[1.03] active:scale-[0.97] ${
              isDark
                ? "border-blue-300/18 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(15,23,42,0.78))] text-slate-100 hover:bg-[linear-gradient(180deg,rgba(21,33,58,0.92),rgba(15,23,42,0.84))]"
                : "border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(247,232,194,0.92),rgba(232,238,248,0.88))] text-slate-700 shadow-[inset_0_1px_0_rgba(252,240,208,0.78)] hover:text-slate-900"
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
            onIdle={handleMapLoad}
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

      {/* Pass 196 (KI-168 sub-pass 3): gate tile picker on `mapLoaded && !mapLoadFailed`
          so it doesn't render at full opacity while the loading skeleton blurs the
          rest of the chrome — same pattern as Pass 194 (sub-pass 1) on the bottom
          overlay. Wrapped in `map-ui-enter` (420ms cubic-bezier; reduced-motion
          guard at theme.css:700-707) for the soft cross-fade once tiles are ready. */}
      {!isGuidanceActive && !suppressTilePicker && mapLoaded && !mapLoadFailed && (
        <div className="map-ui-enter">
          <MapTilePicker
            compact={isCompactOverlay}
            isDark={isDark}
            tileMode={tileMode}
            setTileMode={setTileMode}
          />
        </div>
      )}

      <MapEmptyState isDark={isDark} shopCount={shops.length} />

      {/* ── Bottom gradient overlay: selected shop card + legend ──
          Pass 194 (KI-168 sub-pass 1): gated on `mapLoaded && !mapLoadFailed`
          so the ROUTE box + legend don't bleed through during the pre-hydrated
          window. Wrapped in `map-ui-enter` (420ms cubic-bezier with built-in
          `prefers-reduced-motion: reduce` guard at theme.css:700-707) so the
          chrome cross-fades in once tiles are ready instead of popping. */}
      {!suppressBottomCard && mapLoaded && !mapLoadFailed && (
        <div className="map-ui-enter">
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
        </div>
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

      <GeoErrorToast geoError={geoError} isDark={isDark} />

      {/* Floating overlay children (route preview, intelligence, deviation prompt) */}
      {children}
    </div>
  );
}
