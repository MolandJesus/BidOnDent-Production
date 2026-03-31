import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useMemo, useState } from "react";
import {
  Map,
  Popup,
  FullscreenControl,
  GeolocateControl,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/maplibre";
import NavigationErrorBoundary from "../maps/NavigationErrorBoundary";
import ShopDirectoryMapPopup from "./ShopDirectoryMapPopup";

import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { NavigationSessionStatus } from "../../features/navigation";
import type { NavigationRouteStep } from "../../types/navigation";
import {
  getShopRouteActionLabel,
  shouldUseShopNavigationAction,
} from "../../hooks/shopDirectorySessionUtils";
import type {
  Coordinates,
  MapTheme,
  MapViewportBounds,
  Place,
  RouteOption,
  SavedPlace,
} from "../../types/mapDomain";
import { mapLibreStyles } from "../maps/mapLibreStyles";
import type { MapTileMode } from "../maps/serviceCoverageMapTypes";
import MapLibreReportLayer from "../maps/MapLibreReportLayer";
import MapLibreShopDirectoryViewportManager from "./MapLibreShopDirectoryViewportManager";
import ShopDirectoryMapLayers, {
  SHOP_LAYER,
  SHOP_CLUSTER_LAYER,
  SAVED_PLACES_LAYER,
} from "./ShopDirectoryMapLayers";
import { MapLibreFollowLocationController } from "../maps/mapLibreControllers";
import {
  MapPaneHeaderBadges,
  MapPaneBottomOverlay,
  MapPaneSearchPills,
} from "./ShopDirectoryMapPaneOverlays";
import {
  buildShopsGeoJson,
  buildRoutesGeoJson,
  buildOriginGeoJson,
  buildUserCoordsGeoJson,
  buildSavedPlacesGeoJson,
} from "./shopDirectoryGeoJson";
import { useShopMapInteraction } from "./useShopMapInteraction";
import {
  MapLoadingSkeleton,
  MapTilePicker,
  MapEmptyState,
  GeoErrorToast,
} from "./ShopDirectoryMapPaneInlineUI";

/* ── Props ──────────────────────────────────────────────────────────── */
type ShopDirectoryMapPaneProps = {
  shops: ShopMapListing[];
  routeOptions: RouteOption[];
  selectedRouteId?: string | null;
  selectedShopId: number | null;
  onSelectShop: (shopId: number | null) => void;
  selectedOrigin?: Place | null;
  savedPlaces: SavedPlace[];
  mapTheme: MapTheme;
  initialCenter?: Coordinates;
  initialZoom?: number;
  preserveViewport?: boolean;
  userType: MarketUserType;
  onViewportChange: (center: Coordinates, zoom: number, bounds: MapViewportBounds) => void;
  children?: React.ReactNode;
  suppressHeader?: boolean;
  searchWithinViewport?: boolean;
  onSearchInArea?: () => void;
  onClearAreaSearch?: () => void;
  userCoords?: Coordinates | null;
  userHeadingDegrees?: number | null;
  followCurrentPosition?: boolean;
  followCurrentPositionRevision?: number;
  onOpenShopDirections?: (shop: ShopMapListing) => void;
  onStartNavigation?: (shop: ShopMapListing) => void;
  navigationSessionStatus: NavigationSessionStatus;
  navigationSessionDestinationId: string | null;
  directionsActionLabel?: string;
  hasArrived?: boolean;
  remainingEtaLabel?: string | null;
  remainingDistanceLabel?: string | null;
  usingLiveRoutes?: boolean;
  routeError?: string;
  isLoadingRoute?: boolean;
  onViewReportDetail?: (reportId: string) => void;
  navigationSteps?: NavigationRouteStep[];
  currentStepIndex?: number;
  navigationMode?: "browse" | "route-preview" | "guidance";
};

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
  searchWithinViewport,
  onSearchInArea,
  onClearAreaSearch,
  userCoords,
  userHeadingDegrees,
  followCurrentPosition = false,
  followCurrentPositionRevision = 0,
  onOpenShopDirections,
  onStartNavigation,
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
  navigationSteps = [],
  currentStepIndex = 0,
  navigationMode = "browse",
}: ShopDirectoryMapPaneProps) {
  const [hasPanned, setHasPanned] = useState(false);
  const [showSavedPlaces, setShowSavedPlaces] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [reportCount, setReportCount] = useState<number | null>(null);
  const [tileMode, setTileMode] = useState<MapTileMode>(mapTheme === "dark" ? "night" : "roadmap");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  /* Map load timeout — show retry after 12s */
  useEffect(() => {
    if (mapLoaded) return;
    const timer = setTimeout(() => setMapLoadFailed(true), 12_000);
    return () => clearTimeout(timer);
  }, [mapLoaded]);

  /* Auto-dismiss geolocation error toast after 4s */
  useEffect(() => {
    if (!geoError) return;
    const timer = setTimeout(() => setGeoError(null), 4_000);
    return () => clearTimeout(timer);
  }, [geoError]);

  const {
    cursor,
    setCursor,
    shopPopup,
    setShopPopup,
    savedPlacePopup,
    setSavedPlacePopup,
    handleMapClick,
    handleMapMouseMove,
  } = useShopMapInteraction({ shops, selectedShopId, onSelectShop, navigationSessionStatus });

  // Sync tile mode when parent theme changes (unless user has explicitly picked satellite)
  useEffect(() => {
    setTileMode((prev) =>
      prev === "satellite" ? prev : mapTheme === "dark" ? "night" : "roadmap"
    );
  }, [mapTheme]);

  const selectedShop = shops.find((s) => s.id === selectedShopId) || shops[0] || null;
  const selectedRoute =
    routeOptions.find((r) => r.id === selectedRouteId) || routeOptions[0] || null;
  const selectedShopHasLiveNavigation = Boolean(
    selectedShop &&
      navigationSessionDestinationId === String(selectedShop.id) &&
      (navigationSessionStatus === "active" || navigationSessionStatus === "paused")
  );
  const canStartNavigationForSelectedShop = Boolean(
    selectedShop && selectedOrigin && selectedRoute && onStartNavigation
  );
  const canUseNavigationActionForSelectedShop = Boolean(
    selectedShop &&
      onStartNavigation &&
      shouldUseShopNavigationAction({
        shopId: selectedShop.id,
        routeReady: canStartNavigationForSelectedShop,
        navigationSessionStatus,
        navigationSessionDestinationId,
      })
  );
  const selectedShopActionLabel = selectedShop
    ? getShopRouteActionLabel({
        shopId: selectedShop.id,
        routeReady: canStartNavigationForSelectedShop,
        hasArrived,
        defaultLabel: directionsActionLabel || "Get Directions",
        navigationSessionStatus,
        navigationSessionDestinationId,
      })
    : directionsActionLabel || "Get Directions";
  const isDark = tileMode === "night" || tileMode === "satellite";
  const mapStyle = mapLibreStyles[tileMode];
  const fitSignature = [
    selectedOrigin?.placeId || selectedOrigin?.name || "no-origin",
    shops.map((s) => s.id).join(","),
  ].join(":");

  /* ── GeoJSON data (builders extracted to shopDirectoryGeoJson.ts) ── */
  const shopsGeoJson = useMemo(
    () => buildShopsGeoJson(shops, selectedShopId),
    [shops, selectedShopId]
  );
  const routesGeoJson = useMemo(
    () => buildRoutesGeoJson(routeOptions, selectedRoute, navigationMode, userCoords ?? null),
    [routeOptions, selectedRoute, navigationMode, userCoords]
  );
  const originGeoJson = useMemo(() => buildOriginGeoJson(selectedOrigin ?? null), [selectedOrigin]);
  const userCoordsGeoJson = useMemo(() => buildUserCoordsGeoJson(userCoords ?? null), [userCoords]);
  const savedPlacesGeoJson = useMemo(() => buildSavedPlacesGeoJson(savedPlaces), [savedPlaces]);

  /* ── Interaction ──────────────────────────────────────────────────── */
  const interactiveLayerIds = [SHOP_LAYER, SHOP_CLUSTER_LAYER, SAVED_PLACES_LAYER];

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div
      data-map-theme={mapTheme}
      role="region"
      aria-label="Shop directory map"
      className="shop-directory-map relative h-full min-h-[420px] w-full overflow-hidden"
    >
      {/* ── Header badges ── */}
      {!suppressHeader && (
        <MapPaneHeaderBadges
          isDark={isDark}
          userType={userType}
          selectedOrigin={selectedOrigin}
          shopCount={shops.length}
        />
      )}

      {/* ── MapLibre GL map ── */}
      <NavigationErrorBoundary>
        <Map
          id="shop-directory-map"
          initialViewState={{
            longitude: initialCenter?.longitude ?? -73.8654,
            latitude: initialCenter?.latitude ?? 41.0534,
            zoom: initialZoom ?? 11,
          }}
          maxBounds={[-180, -75, 180, 85]}
          minZoom={3}
          maxZoom={18}
          maxPitch={tileMode === "satellite" ? 60 : 0}
          mapStyle={mapStyle}
          style={{ width: "100%", height: "100%" }}
          cursor={cursor}
          interactiveLayerIds={interactiveLayerIds}
          onClick={handleMapClick}
          onMouseMove={handleMapMouseMove}
          onMouseLeave={() => setCursor("")}
          onLoad={() => {
            setMapLoaded(true);
            setMapLoadFailed(false);
          }}
          onError={() => setMapLoadFailed(true)}
          attributionControl={{ compact: true }}
        >
          {/* Standard map controls */}
          <FullscreenControl position="top-right" />
          <GeolocateControl
            position="bottom-right"
            trackUserLocation
            showUserHeading
            showAccuracyCircle={false}
            onError={(e) => {
              if (e?.code === 1) {
                setGeoError("Location access denied. Enable it in your browser settings.");
              } else {
                setGeoError("Unable to determine your location.");
              }
            }}
          />
          <NavigationControl position="bottom-right" showCompass={navigationMode === "guidance"} />
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
            onViewportChange={(center, zoom, bounds) => {
              setHasPanned(true);
              onViewportChange(center, zoom, bounds);
            }}
          />

          {/* Report markers (Supabase-fetched) */}
          <MapLibreReportLayer
            mapTheme={mapTheme}
            onViewReportDetail={onViewReportDetail}
            onReportCountChange={(count, loading) => setReportCount(loading ? null : count)}
            onFindShopsNear={() => {
              setHasPanned(true);
              onSearchInArea?.();
            }}
            visible={showReports}
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
          />

          <MapLibreFollowLocationController
            enabled={followCurrentPosition}
            currentPosition={
              userCoords ? ([userCoords.latitude, userCoords.longitude] as [number, number]) : null
            }
            revision={followCurrentPositionRevision}
            guidanceMode={navigationMode === "guidance"}
            bearing={userHeadingDegrees}
          />

          {/* ── Shop popup ── */}
          {shopPopup && (
            <ShopDirectoryMapPopup
              shopPopup={shopPopup}
              onClose={() => {
                setShopPopup(null);
                onSelectShop(null);
              }}
              mapTheme={mapTheme}
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
            />
          )}

          {/* ── Saved place popup ── */}
          {savedPlacePopup && (
            <Popup
              longitude={savedPlacePopup.lng}
              latitude={savedPlacePopup.lat}
              anchor="bottom"
              offset={12}
              closeOnClick={false}
              onClose={() => setSavedPlacePopup(null)}
            >
              <div className="min-w-[120px] space-y-0.5 p-1">
                <p
                  className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}
                >
                  {savedPlacePopup.label}
                </p>
                {savedPlacePopup.address && (
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {savedPlacePopup.address}
                  </p>
                )}
              </div>
            </Popup>
          )}
        </Map>
      </NavigationErrorBoundary>

      <MapLoadingSkeleton mapLoaded={mapLoaded} mapLoadFailed={mapLoadFailed} />

      <MapTilePicker isDark={isDark} tileMode={tileMode} setTileMode={setTileMode} />

      <MapEmptyState isDark={isDark} shopCount={shops.length} />

      {/* ── Bottom gradient overlay: selected shop card + legend ── */}
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
      />

      {/* Search area pills */}
      <MapPaneSearchPills
        isDark={isDark}
        hasPanned={hasPanned}
        searchWithinViewport={searchWithinViewport}
        onSearchInArea={onSearchInArea}
        onClearAreaSearch={onClearAreaSearch}
        onClearPan={() => setHasPanned(false)}
      />

      <GeoErrorToast geoError={geoError} />

      {/* Floating overlay children (route preview, intelligence, deviation prompt) */}
      {children}
    </div>
  );
}
