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
 * In guidance mode, uses a higher zoom and tighter debounce for turn-by-turn.
 * Debounces tiny movements (< threshold m).
 */
export function MapLibreFollowLocationController({
  enabled,
  currentPosition,
  minimumZoom = 15.5,
  revision = 0,
  guidanceMode = false,
  bearing,
}: {
  enabled: boolean;
  currentPosition: [number, number] | null | undefined;
  minimumZoom?: number;
  revision?: number;
  guidanceMode?: boolean;
  /** Compass bearing (0-360°) for map heading rotation during guidance. */
  bearing?: number | null;
}) {
  const { current: map } = useMap();
  const lastPositionRef = useRef<[number, number] | null>(null);
  const lastRevisionRef = useRef(revision);
  const wasGuidanceModeRef = useRef(guidanceMode);

  const effectiveMinZoom = guidanceMode ? Math.max(minimumZoom, 16.5) : minimumZoom;
  const debounceMeters = guidanceMode ? 8 : 18;
  const flyDuration = guidanceMode ? 600 : 850;

  // Reset bearing/pitch immediately when leaving guidance mode
  useEffect(() => {
    if (wasGuidanceModeRef.current && !guidanceMode && map) {
      map.flyTo({ bearing: 0, pitch: 0, duration: 800 });
    }
    wasGuidanceModeRef.current = guidanceMode;
  }, [guidanceMode, map]);

  useEffect(() => {
    if (!enabled || !currentPosition || !map) return;

    const shouldForce = revision !== lastRevisionRef.current;
    const last = lastPositionRef.current;

    if (!shouldForce && last) {
      const deltaLat = currentPosition[0] - last[0];
      const deltaLng = currentPosition[1] - last[1];
      const dist = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng) * 111320;
      if (dist < debounceMeters) return;
    }

    const flyOptions: Parameters<typeof map.flyTo>[0] = {
      center: [currentPosition[1], currentPosition[0]],
      zoom: Math.max(map.getZoom(), effectiveMinZoom),
      duration: flyDuration,
    };

    // Apply bearing rotation in guidance mode
    if (guidanceMode && typeof bearing === "number" && Number.isFinite(bearing)) {
      flyOptions.bearing = bearing;
      flyOptions.pitch = 45;
    } else if (!guidanceMode) {
      // Reset to north-up when leaving guidance
      flyOptions.bearing = 0;
      flyOptions.pitch = 0;
    }

    map.flyTo(flyOptions);

    lastPositionRef.current = currentPosition;
    lastRevisionRef.current = revision;
  }, [
    enabled,
    currentPosition,
    map,
    effectiveMinZoom,
    revision,
    debounceMeters,
    flyDuration,
    bearing,
    guidanceMode,
  ]);

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
