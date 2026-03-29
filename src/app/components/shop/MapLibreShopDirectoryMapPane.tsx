import "maplibre-gl/dist/maplibre-gl.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Map } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import NavigationErrorBoundary from "../maps/NavigationErrorBoundary";
import ShopDirectoryMapPopup from "./ShopDirectoryMapPopup";

import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { NavigationSessionStatus } from "../../features/navigation";
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
import ShopDirectoryMapLayers, { SHOP_LAYER } from "./ShopDirectoryMapLayers";
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
}: ShopDirectoryMapPaneProps) {
  const [hasPanned, setHasPanned] = useState(false);
  const [cursor, setCursor] = useState("");
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

  const routesGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: routeOptions.map((route) => ({
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: route.polyline.map((p) => [p.longitude, p.latitude]),
        },
        properties: {
          id: route.id,
          accentColor: route.accentColor,
          isSelected: route.id === selectedRoute?.id ? 1 : 0,
          label: route.label,
          totalDistanceLabel: route.totalDistanceLabel,
          estimatedDurationMinutes: route.estimatedDurationMinutes,
          trafficLabel: route.trafficLabel,
        },
      })),
    }),
    [routeOptions, selectedRoute]
  );

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
  const interactiveLayerIds = [SHOP_LAYER];

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
    const isHoveringShop = e.features?.some((feature) => feature.layer?.id === SHOP_LAYER);
    setCursor(isHoveringShop ? "pointer" : "");
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
          <MapLibreReportLayer mapTheme={mapTheme} />

          <ShopDirectoryMapLayers
            isDark={isDark}
            hasRoutes={routeOptions.length > 0}
            routesGeoJson={routesGeoJson}
            originGeoJson={originGeoJson}
            userCoordsGeoJson={userCoordsGeoJson}
            savedPlacesGeoJson={savedPlacesGeoJson}
            shopsGeoJson={shopsGeoJson}
          />

          <MapLibreFollowLocationController
            enabled={followCurrentPosition}
            currentPosition={
              userCoords ? ([userCoords.latitude, userCoords.longitude] as [number, number]) : null
            }
            revision={followCurrentPositionRevision}
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
