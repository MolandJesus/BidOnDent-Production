/**
 * Manages popup state, click/hover handlers, and keyboard interaction
 * for the ShopDirectoryMapPane.
 */
import { useCallback, useEffect, useState } from "react";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { NavigationSessionStatus } from "../../features/navigation";
import { SHOP_LAYER, SHOP_CLUSTER_LAYER, SAVED_PLACES_LAYER } from "./ShopDirectoryMapLayers";

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

  /* Escape key → deselect shop + close popups */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedShopId != null) {
          onSelectShop(null);
          setShopPopup(null);
        }
        setSavedPlacePopup(null);
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
          setSavedPlacePopup(null);
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
      if (feature.layer?.id === SAVED_PLACES_LAYER) {
        const coords = (feature.geometry as GeoJSON.Point).coordinates;
        setSavedPlacePopup({
          lng: coords[0],
          lat: coords[1],
          label: String(feature.properties?.label || "Saved Place"),
          address: feature.properties?.address ? String(feature.properties.address) : undefined,
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
        feature.layer?.id === SAVED_PLACES_LAYER
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
    handleMapClick,
    handleMapMouseMove,
  };
}
