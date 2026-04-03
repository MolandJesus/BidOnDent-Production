import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapTileMode } from "../maps/serviceCoverageMapTypes";
import type {
  Coordinates,
  MapTheme,
  MapViewportBounds,
  Place,
  RouteOption,
  SavedPlace,
} from "../../types/mapDomain";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { NavigationSessionStatus } from "../../features/navigation";
import { mapLibreStyles } from "../maps/mapLibreStyles";
import {
  getShopRouteActionLabel,
  shouldUseShopNavigationAction,
} from "../../hooks/shopDirectorySessionUtils";
import {
  buildShopsGeoJson,
  buildRoutesGeoJson,
  buildOriginGeoJson,
  buildUserCoordsGeoJson,
  buildSavedPlacesGeoJson,
} from "./shopDirectoryGeoJson";
import { useShopMapInteraction } from "./useShopMapInteraction";
import {
  SHOP_LAYER,
  SHOP_CLUSTER_LAYER,
  SAVED_PLACES_LAYER,
  ROUTE_SELECTED_LAYER,
  ROUTE_UNSELECTED_LAYER,
} from "./ShopDirectoryMapLayers";

type MapPaneStateConfig = {
  userType: MarketUserType;
  mapTheme: MapTheme;
  externalTileMode?: MapTileMode | null;
  shops: ShopMapListing[];
  selectedShopId: number | null;
  onSelectShop: (id: number | null) => void;
  routeOptions: RouteOption[];
  selectedRouteId?: string | null;
  selectedOrigin?: Place | null;
  savedPlaces: SavedPlace[];
  userCoords?: Coordinates | null;
  userHeadingDegrees?: number | null;
  navigationMode: "browse" | "route-preview" | "guidance";
  navigationSessionStatus: NavigationSessionStatus;
  navigationSessionDestinationId: string | null;
  hasArrived: boolean;
  directionsActionLabel?: string;
  onStartNavigation?: (shop: ShopMapListing) => void;
  onTileDarkChange?: (isDark: boolean) => void;
  onTileModeChange?: (mode: MapTileMode) => void;
  onViewportChange: (center: Coordinates, zoom: number, bounds: MapViewportBounds) => void;
  onFindShopsNear?: (coords: { lat: number; lng: number }) => void;
  onSearchInArea?: () => void;
  overlayDensity: "default" | "compact";
};

export function useMapPaneState(config: MapPaneStateConfig) {
  const {
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
    onFindShopsNear,
    onSearchInArea,
    overlayDensity,
  } = config;

  const [hasPanned, setHasPanned] = useState(false);
  const [showSavedPlaces, setShowSavedPlaces] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [reportStatusFilter, setReportStatusFilter] = useState(
    userType === "shop" ? "pending" : "all"
  );
  const [showRoutes, setShowRoutes] = useState(true);
  const [reportCount, setReportCount] = useState<number | null>(null);
  const [tileMode, setTileMode] = useState<MapTileMode>(
    mapTheme === "dark"
      ? "night"
      : mapTheme === "auto" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "night"
        : "roadmap"
  );
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);
  const [mapRenderNonce, setMapRenderNonce] = useState(0);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [containerReady, setContainerReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Gate: only mount <Map> once the container has measured non-zero dimensions.
     This prevents MapLibre's constructor from calling _resizeInternal() on a
     zero-sized container, which corrupts the transform matrix permanently.
     We use requestAnimationFrame to ensure the browser has actually painted. */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;
    const check = () => {
      if (cancelled) return;
      if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        requestAnimationFrame(() => {
          if (!cancelled) setContainerReady(true);
        });
        return;
      }
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            ro.disconnect();
            if (!cancelled) setContainerReady(true);
            return;
          }
        }
      });
      ro.observe(el);
      cleanupRo = ro;
    };
    let cleanupRo: ResizeObserver | null = null;
    check();
    return () => {
      cancelled = true;
      cleanupRo?.disconnect();
    };
  }, [mapRenderNonce]);

  useEffect(() => {
    if (mapLoaded) return;
    const timer = setTimeout(() => setMapLoadFailed(true), 12_000);
    return () => clearTimeout(timer);
  }, [mapLoaded]);

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
    routePopup,
    setRoutePopup,
    handleMapClick,
    handleMapMouseMove,
  } = useShopMapInteraction({ shops, selectedShopId, onSelectShop, navigationSessionStatus });

  useEffect(() => {
    if (mapTheme === "auto") {
      const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
      const resolve = () =>
        setTileMode((prev) => (prev === "satellite" ? prev : mql?.matches ? "night" : "roadmap"));
      resolve();
      mql?.addEventListener("change", resolve);
      return () => mql?.removeEventListener("change", resolve);
    }
    setTileMode((prev) =>
      prev === "satellite" ? prev : mapTheme === "dark" ? "night" : "roadmap"
    );
  }, [mapTheme]);

  useEffect(() => {
    if (externalTileMode != null) {
      setTileMode(externalTileMode);
    }
  }, [externalTileMode]);

  const isGuidanceActive = navigationMode === "guidance";
  useEffect(() => {
    if (isGuidanceActive) {
      setShopPopup(null);
      setSavedPlacePopup(null);
      setRoutePopup(null);
    }
  }, [isGuidanceActive, setShopPopup, setSavedPlacePopup, setRoutePopup]);

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
  const isNight = tileMode === "night";
  const isSatellite = tileMode === "satellite";
  const isDark = isNight || isSatellite;
  const effectiveMapTheme: MapTheme = isDark ? "dark" : "light";
  const isCompactOverlay = overlayDensity === "compact";

  useEffect(() => {
    onTileDarkChange?.(isDark);
  }, [isDark, onTileDarkChange]);
  useEffect(() => {
    onTileModeChange?.(tileMode);
  }, [tileMode, onTileModeChange]);

  const mapStyle = mapLibreStyles[tileMode];
  const fitSignature = [
    selectedOrigin?.placeId || selectedOrigin?.name || "no-origin",
    shops.map((s) => s.id).join(","),
    navigationMode || "browse",
  ].join(":");

  const shopsGeoJson = useMemo(
    () => buildShopsGeoJson(shops, selectedShopId),
    [shops, selectedShopId]
  );
  const routesGeoJson = useMemo(
    () => buildRoutesGeoJson(routeOptions, selectedRoute, navigationMode, userCoords ?? null),
    [routeOptions, selectedRoute, navigationMode, userCoords]
  );
  const originGeoJson = useMemo(() => buildOriginGeoJson(selectedOrigin ?? null), [selectedOrigin]);
  const userCoordsGeoJson = useMemo(
    () => buildUserCoordsGeoJson(userCoords ?? null, userHeadingDegrees),
    [userCoords, userHeadingDegrees]
  );
  const savedPlacesGeoJson = useMemo(() => buildSavedPlacesGeoJson(savedPlaces), [savedPlaces]);

  const interactiveLayerIds = [
    SHOP_LAYER,
    SHOP_CLUSTER_LAYER,
    SAVED_PLACES_LAYER,
    ROUTE_SELECTED_LAYER,
    ROUTE_UNSELECTED_LAYER,
  ];

  function handleRetryMap() {
    setMapLoaded(false);
    setMapLoadFailed(false);
    setContainerReady(false);
    setMapRenderNonce((current) => current + 1);
  }

  const handleViewportBroadcast = useCallback(
    (center: Coordinates, zoom: number, bounds: MapViewportBounds) => {
      setHasPanned((current) => (current ? current : true));
      onViewportChange(center, zoom, bounds);
    },
    [onViewportChange]
  );

  const handleReportCountChange = useCallback((count: number, loading: boolean) => {
    const nextValue = loading ? null : count;
    setReportCount((current) => (current === nextValue ? current : nextValue));
  }, []);

  const handleFindShopsNear = useCallback(
    (coords: { lat: number; lng: number }) => {
      setHasPanned((current) => (current ? current : true));
      if (onFindShopsNear) {
        onFindShopsNear(coords);
      } else {
        onSearchInArea?.();
      }
    },
    [onFindShopsNear, onSearchInArea]
  );

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
    setMapLoadFailed(false);
  }, []);

  const handleMapLoadError = useCallback(() => {
    setMapLoadFailed(true);
  }, []);

  return {
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
  };
}
