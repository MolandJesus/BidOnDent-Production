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
  if (userType === "shop") return "Competitive intelligence";
  if (userType === "insurer") return "Network recruitment";
  return "Repair routing";
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

  // Invalidate size after layout shifts
  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;
    const timer = window.setTimeout(() => map.resize(), 120);
    return () => window.clearTimeout(timer);
  }, [fitSignature, mapRef]);

  // Initial fit / restore viewport
  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    if (
      !restoredInitialViewportRef.current &&
      initialViewportRef.current.center &&
      typeof initialViewportRef.current.zoom === "number"
    ) {
      restoredInitialViewportRef.current = true;
      map.jumpTo({
        center: [
          initialViewportRef.current.center.longitude,
          initialViewportRef.current.center.latitude,
        ],
        zoom: initialViewportRef.current.zoom,
      });
      return;
    }

    if (preserveViewport && restoredInitialViewportRef.current) return;

    const points: [number, number][] = [
      ...(selectedOrigin
        ? [[selectedOrigin.longitude, selectedOrigin.latitude] as [number, number]]
        : []),
      ...shops.map(
        (shop) =>
          [shop.mapResult.coordinates.longitude, shop.mapResult.coordinates.latitude] as [
            number,
            number,
          ]
      ),
    ];

    if (points.length === 0) return;

    if (points.length === 1) {
      map.jumpTo({ center: points[0], zoom: 12 });
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
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 44, maxZoom: 12, animate: false }
    );
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
    if (!selectedShop) return;

    map.flyTo({
      center: [
        selectedShop.mapResult.coordinates.longitude,
        selectedShop.mapResult.coordinates.latitude,
      ],
      zoom: Math.max(map.getZoom(), 12),
      duration: 450,
    });
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
