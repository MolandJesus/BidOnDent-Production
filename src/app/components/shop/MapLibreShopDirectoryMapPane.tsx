import "maplibre-gl/dist/maplibre-gl.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Map, FullscreenControl, GeolocateControl, NavigationControl, ScaleControl } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
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
import MapLibreReportLayer from "../maps/MapLibreReportLayer";
import MapLibreShopDirectoryViewportManager from "./MapLibreShopDirectoryViewportManager";
import ShopDirectoryMapLayers, { SHOP_LAYER, SHOP_CLUSTER_LAYER } from "./ShopDirectoryMapLayers";
import { MapLibreFollowLocationController } from "../maps/mapLibreControllers";
import {
  MapPaneHeaderBadges,
  MapPaneBottomOverlay,
  MapPaneSearchPills,
} from "./ShopDirectoryMapPaneOverlays";

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
  const [cursor, setCursor] = useState("");
  const [showSavedPlaces, setShowSavedPlaces] = useState(true);
  const [shopPopup, setShopPopup] = useState<{
    lng: number;
    lat: number;
    shop: ShopMapListing;
  } | null>(null);

  /* Keep popup aligned with selected shop, regardless of map/list origin */
  useEffect(() => {
    if (selectedShopId == null) {
      setShopPopup(null);
      return;
    }

    const selected = shops.find((shop) => shop.id === selectedShopId);
    if (!selected) {
      setShopPopup(null);
      return;
    }

    setShopPopup((current) => {
      if (current?.shop.id === selected.id) {
        return current;
      }

      return {
        lng: selected.mapResult.coordinates.longitude,
        lat: selected.mapResult.coordinates.latitude,
        shop: selected,
      };
    });
  }, [selectedShopId, shops]);

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
  const isDark = mapTheme === "dark";
  const mapStyle = isDark ? mapLibreStyles.night : mapLibreStyles.roadmap;
  const fitSignature = [
    selectedOrigin?.placeId || selectedOrigin?.name || "no-origin",
    shops.map((s) => s.id).join(","),
  ].join(":");

  /* ── GeoJSON data ─────────────────────────────────────────────────── */
  const shopsGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: shops.map((shop) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [shop.mapResult.coordinates.longitude, shop.mapResult.coordinates.latitude],
        },
        properties: {
          id: shop.id,
          name: shop.name,
          address: `${shop.mapResult.address}, ${shop.mapResult.city}`,
          recommendationScore: shop.recommendationScore,
          insuranceCompatibilityScore: shop.insuranceCompatibilityScore,
          isSelected: shop.id === selectedShopId ? 1 : 0,
          topPick: shop.topPick ? 1 : 0,
        },
      })),
    }),
    [shops, selectedShopId]
  );

  const routesGeoJson = useMemo(() => {
    const isGuidance = navigationMode === "guidance";
    const features = routeOptions.flatMap((route) => {
      const coords = route.polyline.map((p) => [p.longitude, p.latitude] as [number, number]);
      const isSelected = route.id === selectedRoute?.id;
      const baseProps = {
        id: route.id,
        accentColor: route.accentColor,
        isSelected: isSelected ? 1 : 0,
        label: route.label,
        totalDistanceLabel: route.totalDistanceLabel,
        estimatedDurationMinutes: route.estimatedDurationMinutes,
        trafficLabel: route.trafficLabel,
        isGuidanceActive: isGuidance && isSelected ? 1 : 0,
        isTravelled: 0,
      };

      // During guidance, split selected route into travelled + remaining
      if (isGuidance && isSelected && userCoords && coords.length > 1) {
        const userLng = userCoords.longitude;
        const userLat = userCoords.latitude;
        let closestIdx = 0;
        let closestDist = Infinity;
        for (let i = 0; i < coords.length; i++) {
          const dx = coords[i][0] - userLng;
          const dy = coords[i][1] - userLat;
          const d = dx * dx + dy * dy;
          if (d < closestDist) {
            closestDist = d;
            closestIdx = i;
          }
        }

        const travelledCoords = coords.slice(0, closestIdx + 1);
        const remainingCoords = coords.slice(closestIdx);

        const result: Array<GeoJSON.Feature<GeoJSON.LineString>> = [];
        if (travelledCoords.length >= 2) {
          result.push({
            type: "Feature",
            geometry: { type: "LineString", coordinates: travelledCoords },
            properties: { ...baseProps, isTravelled: 1 },
          });
        }
        if (remainingCoords.length >= 2) {
          result.push({
            type: "Feature",
            geometry: { type: "LineString", coordinates: remainingCoords },
            properties: { ...baseProps, isTravelled: 0 },
          });
        }
        return result.length > 0
          ? result
          : [
              {
                type: "Feature" as const,
                geometry: { type: "LineString" as const, coordinates: coords },
                properties: baseProps,
              },
            ];
      }

      return [
        {
          type: "Feature" as const,
          geometry: { type: "LineString" as const, coordinates: coords },
          properties: baseProps,
        },
      ];
    });

    return { type: "FeatureCollection" as const, features };
  }, [routeOptions, selectedRoute, navigationMode, userCoords]);

  const originGeoJson = useMemo(() => {
    if (!selectedOrigin) return null;
    return {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [selectedOrigin.longitude, selectedOrigin.latitude],
      },
      properties: { name: selectedOrigin.name, address: selectedOrigin.address },
    };
  }, [selectedOrigin]);

  const userCoordsGeoJson = useMemo(() => {
    if (!userCoords) return null;
    return {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [userCoords.longitude, userCoords.latitude],
      },
      properties: {},
    };
  }, [userCoords]);

  const savedPlacesGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: savedPlaces.map((place) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [place.longitude, place.latitude],
        },
        properties: { id: place.id, label: place.label, address: place.address },
      })),
    }),
    [savedPlaces]
  );

  /* ── Interaction ──────────────────────────────────────────────────── */
  const interactiveLayerIds = [SHOP_LAYER, SHOP_CLUSTER_LAYER];

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) {
        setShopPopup(null);
        // Deselect shop on empty map tap — only when not actively navigating
        if (navigationSessionStatus === "idle" || navigationSessionStatus === "ended") {
          onSelectShop(null);
        }
        return;
      }
      // Cluster click → zoom to expand
      if (feature.layer?.id === SHOP_CLUSTER_LAYER) {
        const clusterId = feature.properties?.cluster_id;
        const mapInstance = (
          e.target as unknown as {
            getSource: (id: string) =>
              | {
                  getClusterExpansionZoom: (
                    id: number,
                    cb: (err: unknown, zoom: number) => void
                  ) => void;
                }
              | undefined;
          }
        ).getSource("shops-source");
        if (mapInstance && clusterId != null) {
          mapInstance.getClusterExpansionZoom(Number(clusterId), (_err, zoom) => {
            const coords = (feature.geometry as GeoJSON.Point).coordinates;
            e.target.flyTo({ center: [coords[0], coords[1]], zoom: Math.min(zoom, 17) });
          });
        }
        return;
      }
      if (feature.layer?.id === SHOP_LAYER) {
        const shopId = feature.properties?.id;
        if (shopId != null) {
          onSelectShop(Number(shopId));
          const shop = shops.find((s) => s.id === Number(shopId));
          if (shop) {
            setShopPopup({
              lng: shop.mapResult.coordinates.longitude,
              lat: shop.mapResult.coordinates.latitude,
              shop,
            });
          }
        }
      }
    },
    [onSelectShop, shops, navigationSessionStatus]
  );

  const handleMapMouseMove = useCallback((e: MapLayerMouseEvent) => {
    const isHoveringInteractive = e.features?.some(
      (feature) => feature.layer?.id === SHOP_LAYER || feature.layer?.id === SHOP_CLUSTER_LAYER
    );
    setCursor(isHoveringInteractive ? "pointer" : "");
  }, []);

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div
      data-map-theme={mapTheme}
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
          mapStyle={mapStyle}
          style={{ width: "100%", height: "100%" }}
          cursor={cursor}
          interactiveLayerIds={interactiveLayerIds}
          onClick={handleMapClick}
          onMouseMove={handleMapMouseMove}
          onMouseLeave={() => setCursor("")}
          attributionControl={{ compact: true }}
        >
          {/* Standard map controls */}
          <FullscreenControl position="top-right" />
          <GeolocateControl position="bottom-right" trackUserLocation showAccuracyCircle={false} />
          <NavigationControl position="bottom-right" showCompass={false} />
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
          <MapLibreReportLayer mapTheme={mapTheme} onViewReportDetail={onViewReportDetail} />

          <ShopDirectoryMapLayers
            isDark={isDark}
            hasRoutes={routeOptions.length > 0}
            routesGeoJson={routesGeoJson}
            originGeoJson={originGeoJson}
            userCoordsGeoJson={userCoordsGeoJson}
            savedPlacesGeoJson={savedPlacesGeoJson}
            shopsGeoJson={shopsGeoJson}
            showSavedPlaces={showSavedPlaces}
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
              onClose={() => setShopPopup(null)}
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
        </Map>
      </NavigationErrorBoundary>

      {/* ── Empty state overlay ── */}
      {shops.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[450] flex items-center justify-center">
          <div
            className={`pointer-events-auto rounded-2xl border px-5 py-4 text-center shadow-xl backdrop-blur-md ${
              isDark
                ? "border-white/20 bg-slate-950/80 text-white"
                : "border-black/8 bg-white/88 text-slate-700"
            }`}
          >
            <p className="text-sm font-semibold">No shops in this area</p>
            <p className={`mt-1 text-xs ${isDark ? "text-white/60" : "text-slate-400"}`}>
              Try a different location or broaden your filters
            </p>
          </div>
        </div>
      )}

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

      {/* Floating overlay children (route preview, intelligence, deviation prompt) */}
      {children}
    </div>
  );
}
