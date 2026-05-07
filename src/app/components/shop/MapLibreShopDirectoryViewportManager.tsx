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

      // Pass 89 (2026-05-07) — owner directive: "less lessmotion rules for
      // map-specific interfaces ... real map program feel". Replace the
      // hard-coded `jumpTo` (single point) and `animate: false` (multi-point
      // fit) with animated camera moves so origin/shop changes glide instead
      // of snap. Apple/Google Maps both animate the fit-to-results transition.
      // This is the single most visible "feels like a real map" gap on landing.
      //
      // Accessibility note: we deliberately do NOT pass `essential: true`.
      // MapLibre auto-shortens / skips these animations when the OS reports
      // `prefers-reduced-motion: reduce`, so users with vestibular conditions
      // continue to get safe behavior. LAW §3 reduce-motion contract preserved
      // at the OS layer; LAW §1 spatial-continuity intent satisfied for the
      // 99%+ of users who have not opted out.
      if (points.length === 1) {
        lastAppliedFitKeyRef.current = fitRunKey;
        map.flyTo({ center: points[0], zoom: 14, duration: 900, curve: 1.4 });
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
        { padding: 44, maxZoom: 15, duration: 900, curve: 1.4 }
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
      // Pass 98 (2026-05-07) — owner real-map directive: selected-shop fly
      // was a flat 450ms snap that often left the pin under-zoomed and
      // off-rhythm with the rest of the map. Match the Pass 89 camera
      // language (curve 1.4 family, ~850ms) and guarantee a closer focal
      // zoom (14) so the breathing pulse from Pass 91 is clearly visible.
      // No `essential: true` → OS reduce-motion still honored (LAW §3).
      map.flyTo({
        center: [
          selectedShop.mapResult.coordinates.longitude,
          selectedShop.mapResult.coordinates.latitude,
        ],
        zoom: Math.max(map.getZoom(), 14),
        duration: 850,
        curve: 1.3,
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
