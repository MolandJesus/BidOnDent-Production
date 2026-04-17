import { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { Coordinates, MapViewportBounds, Place } from "../../types/mapDomain";

export const LIGHT_TILE_LAYER = {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO',
  url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
};

export const DARK_TILE_LAYER = {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO',
  url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

export function getRoleLabel(userType: MarketUserType) {
  if (userType === "shop") return "Nearby shops";
  if (userType === "insurer") return "Partner shops";
  return "Find shops";
}

type MapLibreViewportManagerProps = {
  fitSignature: string;
  shops: ShopMapListing[];
  selectedShopId: number | null;
  selectedOrigin?: Place | null;
  initialCenter?: Coordinates;
  initialZoom?: number;
  preserveViewport?: boolean;
  onViewportChange: (center: Coordinates, zoom: number, bounds: MapViewportBounds) => void;
};

export default function MapLibreShopDirectoryViewportManager({
  fitSignature,
  shops,
  selectedShopId,
  selectedOrigin,
  initialCenter,
  initialZoom,
  preserveViewport,
  onViewportChange,
}: MapLibreViewportManagerProps) {
  const { current: mapRef } = useMap();
  const restoredInitialViewportRef = useRef(false);
  const initialViewportRef = useRef({ center: initialCenter, zoom: initialZoom });
  const prevSelectedShopIdRef = useRef<number | null>(null);
  const lastAppliedFitKeyRef = useRef<string | null>(null);

  // Invalidate size after layout shifts
  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;
    const timer = window.setTimeout(() => {
      try {
        const container = map.getContainer();
        if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
          map.resize();
        }
      } catch {
        // MapLibre resize can fail before container is fully laid out — safe to ignore
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [fitSignature, mapRef]);

  // Initial fit / restore viewport
  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const fitRunKey = `${fitSignature}|preserve:${preserveViewport ? "1" : "0"}`;

    const applyFit = () => {
      if (
        !restoredInitialViewportRef.current &&
        initialViewportRef.current.center &&
        typeof initialViewportRef.current.zoom === "number"
      ) {
        restoredInitialViewportRef.current = true;
        const { longitude: lng, latitude: lat } = initialViewportRef.current.center;
        if (!isFinite(lng) || !isFinite(lat)) return;
        map.jumpTo({
          center: [lng, lat],
          zoom: initialViewportRef.current.zoom,
        });
        return;
      }

      if (lastAppliedFitKeyRef.current === fitRunKey) return;

      if (preserveViewport && restoredInitialViewportRef.current) {
        lastAppliedFitKeyRef.current = fitRunKey;
        return;
      }

      const points: [number, number][] = [
        ...(selectedOrigin &&
        isFinite(selectedOrigin.longitude) &&
        isFinite(selectedOrigin.latitude)
          ? [[selectedOrigin.longitude, selectedOrigin.latitude] as [number, number]]
          : []),
        ...shops
          .filter(
            (shop) =>
              isFinite(shop.mapResult.coordinates.longitude) &&
              isFinite(shop.mapResult.coordinates.latitude)
          )
          .map(
            (shop) =>
              [shop.mapResult.coordinates.longitude, shop.mapResult.coordinates.latitude] as [
                number,
                number,
              ]
          ),
      ];

      if (points.length === 0) {
        lastAppliedFitKeyRef.current = fitRunKey;
        return;
      }

      if (points.length === 1) {
        lastAppliedFitKeyRef.current = fitRunKey;
        map.jumpTo({ center: points[0], zoom: 14 });
        return;
      }

      let minLng = Infinity,
        maxLng = -Infinity,
        minLat = Infinity,
        maxLat = -Infinity;
      for (const [lng, lat] of points) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
      if (!isFinite(minLng) || !isFinite(maxLng) || !isFinite(minLat) || !isFinite(maxLat)) {
        if (import.meta.env.DEV)
          console.warn("[ViewportManager] Invalid bounds, skipping fitBounds:", {
            minLng,
            maxLng,
            minLat,
            maxLat,
            pointCount: points.length,
          });
        lastAppliedFitKeyRef.current = fitRunKey;
        return;
      }
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 44, maxZoom: 15, animate: false }
      );
      lastAppliedFitKeyRef.current = fitRunKey;
    };

    // Defer viewport operations until map is loaded to avoid NaN in _calcMatrices
    if (map.loaded()) {
      applyFit();
    } else {
      map.once("load", applyFit);
      return () => {
        map.off("load", applyFit);
      };
    }
  }, [fitSignature, mapRef, preserveViewport, selectedOrigin, shops]);

  // Fly to selected shop
  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map || !selectedShopId) {
      prevSelectedShopIdRef.current = null;
      return;
    }

    if (selectedShopId === prevSelectedShopIdRef.current) return;
    prevSelectedShopIdRef.current = selectedShopId;

    const selectedShop = shops.find((shop) => shop.id === selectedShopId);
    if (
      !selectedShop ||
      !isFinite(selectedShop.mapResult.coordinates.longitude) ||
      !isFinite(selectedShop.mapResult.coordinates.latitude)
    )
      return;

    const doFly = () => {
      map.flyTo({
        center: [
          selectedShop.mapResult.coordinates.longitude,
          selectedShop.mapResult.coordinates.latitude,
        ],
        zoom: Math.max(map.getZoom(), 12),
        duration: 450,
      });
    };

    if (map.loaded()) {
      doFly();
    } else {
      map.once("load", doFly);
      return () => {
        map.off("load", doFly);
      };
    }
  }, [fitSignature, mapRef, selectedShopId, shops]);

  // Broadcast viewport changes
  const emitViewport = useCallback(() => {
    const map = mapRef?.getMap();
    if (!map) return;
    const center = map.getCenter();
    const bounds = map.getBounds();
    onViewportChange({ latitude: center.lat, longitude: center.lng }, map.getZoom(), {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    });
  }, [mapRef, onViewportChange]);

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;
    map.on("moveend", emitViewport);
    map.on("zoomend", emitViewport);
    return () => {
      map.off("moveend", emitViewport);
      map.off("zoomend", emitViewport);
    };
  }, [mapRef, emitViewport]);

  return null;
}
