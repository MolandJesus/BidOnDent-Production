import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";

/**
 * Drives the camera on [center, zoom, revision] changes.
 * First call jumps; subsequent calls flyTo.
 */
export function MapLibreViewportController({
  center,
  zoom,
  revision,
}: {
  center: [number, number];
  zoom: number;
  revision: number;
}) {
  const { current: map } = useMap();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!map) return;
    if (!hasInitialized.current) {
      map.jumpTo({ center: [center[1], center[0]], zoom });
      hasInitialized.current = true;
      return;
    }
    map.flyTo({ center: [center[1], center[0]], zoom, duration: 1150 });
  }, [map, center, zoom, revision]);

  return null;
}

/**
 * Keeps the camera following a GPS position when enabled.
 * Debounces tiny movements (< 18 m).
 */
export function MapLibreFollowLocationController({
  enabled,
  currentPosition,
  minimumZoom = 15.5,
  revision = 0,
}: {
  enabled: boolean;
  currentPosition: [number, number] | null | undefined;
  minimumZoom?: number;
  revision?: number;
}) {
  const { current: map } = useMap();
  const lastPositionRef = useRef<[number, number] | null>(null);
  const lastRevisionRef = useRef(revision);

  useEffect(() => {
    if (!enabled || !currentPosition || !map) return;

    const shouldForce = revision !== lastRevisionRef.current;
    const last = lastPositionRef.current;

    if (!shouldForce && last) {
      const dlat = currentPosition[0] - last[0];
      const dlng = currentPosition[1] - last[1];
      const dist = Math.sqrt(dlat * dlat + dlng * dlng) * 111320;
      if (dist < 18) return;
    }

    map.flyTo({
      center: [currentPosition[1], currentPosition[0]],
      zoom: Math.max(map.getZoom(), minimumZoom),
      duration: 850,
    });

    lastPositionRef.current = currentPosition;
    lastRevisionRef.current = revision;
  }, [enabled, currentPosition, map, minimumZoom, revision]);

  return null;
}

/**
 * Fits the camera to a route bounding box when routeFitKey changes.
 * routeGeometry uses [lat, lng] convention (same as ServiceCoverageMap).
 */
export function MapLibreRouteFitController({
  routeGeometry,
  routeFitKey,
}: {
  routeGeometry: [number, number][];
  routeFitKey?: string | null;
}) {
  const { current: map } = useMap();

  useEffect(() => {
    if (!routeFitKey || routeGeometry.length < 2 || !map) return;

    let minLng = Infinity,
      maxLng = -Infinity,
      minLat = Infinity,
      maxLat = -Infinity;
    for (const [lat, lng] of routeGeometry) {
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
      { padding: 72, maxZoom: 14 }
    );
  }, [map, routeFitKey, routeGeometry]);

  return null;
}
