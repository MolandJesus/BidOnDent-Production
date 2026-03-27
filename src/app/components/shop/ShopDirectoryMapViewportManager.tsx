import { useEffect, useRef } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { latLngBounds } from "leaflet";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { Coordinates, MapViewportBounds, Place } from "../../types/mapDomain";

function getViewportBounds(map: ReturnType<typeof useMap>) {
  const bounds = map.getBounds();

  return {
    east: bounds.getEast(),
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    west: bounds.getWest(),
  } satisfies MapViewportBounds;
}

export const LIGHT_TILE_LAYER = {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
};

export const DARK_TILE_LAYER = {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO',
  url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

export function getRoleLabel(userType: MarketUserType) {
  if (userType === "shop") {
    return "Competitive intelligence";
  }

  if (userType === "insurer") {
    return "Network recruitment";
  }

  return "Repair routing";
}

type MapViewportManagerProps = {
  fitSignature: string;
  shops: ShopMapListing[];
  selectedShopId: number | null;
  selectedOrigin?: Place | null;
  initialCenter?: Coordinates;
  initialZoom?: number;
  preserveViewport?: boolean;
  onViewportChange: (center: Coordinates, zoom: number, bounds: MapViewportBounds) => void;
};

export default function MapViewportManager({
  fitSignature,
  shops,
  selectedShopId,
  selectedOrigin,
  initialCenter,
  initialZoom,
  preserveViewport,
  onViewportChange,
}: MapViewportManagerProps) {
  const map = useMap();
  const restoredInitialViewportRef = useRef(false);
  const initialViewportRef = useRef({
    center: initialCenter,
    zoom: initialZoom,
  });
  const prevSelectedShopIdRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 120);

    return () => window.clearTimeout(timer);
  }, [fitSignature, map]);

  useEffect(() => {
    if (
      !restoredInitialViewportRef.current &&
      initialViewportRef.current.center &&
      typeof initialViewportRef.current.zoom === "number"
    ) {
      restoredInitialViewportRef.current = true;
      map.setView(
        [initialViewportRef.current.center.latitude, initialViewportRef.current.center.longitude],
        initialViewportRef.current.zoom,
        { animate: false }
      );
      return;
    }

    if (preserveViewport && restoredInitialViewportRef.current) {
      return;
    }

    const points = [
      ...(selectedOrigin
        ? [[selectedOrigin.latitude, selectedOrigin.longitude] as [number, number]]
        : []),
      ...shops.map(
        (shop) =>
          [shop.mapResult.coordinates.latitude, shop.mapResult.coordinates.longitude] as [
            number,
            number,
          ]
      ),
    ];

    if (points.length === 0) {
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 12, { animate: false });
      return;
    }

    map.fitBounds(latLngBounds(points), {
      animate: false,
      maxZoom: 12,
      padding: [44, 44],
    });
  }, [fitSignature, map, preserveViewport]);

  useEffect(() => {
    if (!selectedShopId) {
      prevSelectedShopIdRef.current = null;
      return;
    }

    // Only fly when the selected shop actually changes — not on every fitSignature
    // change (which fires when viewport filter updates the visible shop list).
    if (selectedShopId === prevSelectedShopIdRef.current) {
      return;
    }
    prevSelectedShopIdRef.current = selectedShopId;

    const selectedShop = shops.find((shop) => shop.id === selectedShopId);
    if (!selectedShop) {
      return;
    }

    map.flyTo(
      [selectedShop.mapResult.coordinates.latitude, selectedShop.mapResult.coordinates.longitude],
      Math.max(map.getZoom(), 12),
      { duration: 0.45 }
    );
  }, [fitSignature, map, selectedShopId, shops]);

  useMapEvents({
    moveend() {
      const center = map.getCenter();
      onViewportChange(
        {
          latitude: center.lat,
          longitude: center.lng,
        },
        map.getZoom(),
        getViewportBounds(map)
      );
    },
    zoomend() {
      const center = map.getCenter();
      onViewportChange(
        {
          latitude: center.lat,
          longitude: center.lng,
        },
        map.getZoom(),
        getViewportBounds(map)
      );
    },
  });

  return null;
}
