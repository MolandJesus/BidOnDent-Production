/**
 * Manages popup state, click/hover handlers, and keyboard interaction
 * for the ShopDirectoryMapPane.
 */
import { useCallback, useEffect, useState } from "react";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { NavigationSessionStatus } from "../../features/navigation";
import {
  SHOP_LAYER,
  SHOP_CLUSTER_LAYER,
  SAVED_PLACES_LAYER,
  ROUTE_SELECTED_LAYER,
  ROUTE_UNSELECTED_LAYER,
} from "./ShopDirectoryMapLayers";

export type ShopPopup = {
  lng: number;
  lat: number;
  shop: ShopMapListing;
};

export type SavedPlacePopup = {
  lng: number;
  lat: number;
  label: string;
  address?: string;
};

export type RoutePopup = {
  lng: number;
  lat: number;
  label: string;
  distance: string;
  duration: number;
  traffic: string;
};

type UseShopMapInteractionOpts = {
  shops: ShopMapListing[];
  selectedShopId: number | null;
  onSelectShop: (shopId: number | null) => void;
  navigationSessionStatus: NavigationSessionStatus;
};

export function useShopMapInteraction({
  shops,
  selectedShopId,
  onSelectShop,
  navigationSessionStatus,
}: UseShopMapInteractionOpts) {
  const [cursor, setCursor] = useState("");
  const [shopPopup, setShopPopup] = useState<ShopPopup | null>(null);
  const [savedPlacePopup, setSavedPlacePopup] = useState<SavedPlacePopup | null>(null);
  const [routePopup, setRoutePopup] = useState<RoutePopup | null>(null);

  /* Escape key → deselect shop + close popups */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedShopId != null) {
          onSelectShop(null);
          setShopPopup(null);
        }
        setSavedPlacePopup(null);
        setRoutePopup(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedShopId, onSelectShop]);

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
      if (current?.shop.id === selected.id) return current;
      return {
        lng: selected.mapResult.coordinates.longitude,
        lat: selected.mapResult.coordinates.latitude,
        shop: selected,
      };
    });
  }, [selectedShopId, shops]);

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) {
        setShopPopup(null);
        setSavedPlacePopup(null);
        setRoutePopup(null);
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
            // Pass 95: tighten cluster-expand fly to match Pass 89 premium feel
            e.target.flyTo({
              center: [coords[0], coords[1]],
              zoom: Math.min(zoom, 17),
              duration: 850,
              curve: 1.4,
            });
          });
        }
        return;
      }
      if (feature.layer?.id === SHOP_LAYER) {
        const shopId = feature.properties?.id;
        if (shopId != null) {
          setSavedPlacePopup(null);
          onSelectShop(Number(shopId));
          const shop = shops.find((s) => s.id === Number(shopId));
          if (shop) {
            setShopPopup({
              lng: shop.mapResult.coordinates.longitude,
              lat: shop.mapResult.coordinates.latitude,
              shop,
            });
            // Pass 171 (2026-05-07) — Phase 7 map-program-feel #16: smooth
            // pan-to-pin on click + upper-third offset so the popup/sheet
            // doesn't cover the pin. Audit AI's premium-map spec: "Apple
            // Maps and Google Maps both ease the camera to the upper-third
            // of viewport when a pin is selected." Negative y offset moves
            // the visual center DOWN, which moves the pin UP visually.
            // Reduce-motion: MapLibre's flyTo internally gates duration via
            // window prefers-reduced-motion (TransformAnimation hooks),
            // verified across Pass 89/95/166.
            e.target.flyTo({
              center: [shop.mapResult.coordinates.longitude, shop.mapResult.coordinates.latitude],
              offset: [0, -Math.floor(e.target.getCanvas().height / 6)],
              duration: 600,
              curve: 1.4,
            });
          }
        }
      }
      if (feature.layer?.id === SAVED_PLACES_LAYER) {
        const coords = (feature.geometry as GeoJSON.Point).coordinates;
        setSavedPlacePopup({
          lng: coords[0],
          lat: coords[1],
          label: String(feature.properties?.label || "Saved Place"),
          address: feature.properties?.address ? String(feature.properties.address) : undefined,
        });
      }
      if (
        feature.layer?.id === ROUTE_SELECTED_LAYER ||
        feature.layer?.id === ROUTE_UNSELECTED_LAYER
      ) {
        setRoutePopup({
          lng: e.lngLat.lng,
          lat: e.lngLat.lat,
          label: String(feature.properties?.label || "Route"),
          distance: String(feature.properties?.totalDistanceLabel || ""),
          duration: Number(feature.properties?.estimatedDurationMinutes || 0),
          traffic: String(feature.properties?.trafficLabel || ""),
        });
      }
    },
    [onSelectShop, shops, navigationSessionStatus]
  );

  const handleMapMouseMove = useCallback((e: MapLayerMouseEvent) => {
    const isHoveringInteractive = e.features?.some(
      (feature) =>
        feature.layer?.id === SHOP_LAYER ||
        feature.layer?.id === SHOP_CLUSTER_LAYER ||
        feature.layer?.id === SAVED_PLACES_LAYER ||
        feature.layer?.id === ROUTE_SELECTED_LAYER ||
        feature.layer?.id === ROUTE_UNSELECTED_LAYER
    );
    setCursor(isHoveringInteractive ? "pointer" : "");
  }, []);

  return {
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
  };
}
