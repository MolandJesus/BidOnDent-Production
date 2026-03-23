/**
 * Deviation Detection — Detection Helpers
 *
 * Pure, deterministic functions that compare two consecutive navigation
 * snapshots and return any deviation events that occurred between them.
 *
 * Each detector returns its specific discriminated union variant,
 * ensuring typed metadata without casts.
 *
 * No side-effects, no UI, no external state — just signal detection.
 */

import type {
  DeviationEvent,
  DeviationSeverity,
  DelayIncreaseEvent,
  NavigationSnapshot,
  OffRouteEvent,
  RouteChangeEvent,
  StoppedEvent,
} from "./deviationTypes";
import { OFF_ROUTE_THRESHOLD_MILES, STOPPED_SPEED_THRESHOLD_MPH } from "./deviationTypes";

/**
 * Compare two consecutive navigation snapshots and detect deviations.
 * Includes GPS jitter filtering: ignores tiny position changes that
 * don't represent real movement.
 *
 * @param previous - The earlier snapshot (may be null on first call).
 * @param current  - The snapshot just captured.
 * @returns Array of deviation events detected in this transition.
 */
export function detectDeviations(
  previous: NavigationSnapshot | null,
  current: NavigationSnapshot
): DeviationEvent[] {
  // GPS jitter guard: if position barely changed, skip stopped check
  const jitter = isGpsJitter(previous, current);

  const events: DeviationEvent[] = [];

  if (previous) {
    const routeChange = detectRouteChange(previous, current);
    if (routeChange) events.push(routeChange);

    const delayIncrease = detectDelayIncrease(previous, current);
    if (delayIncrease) events.push(delayIncrease);
  }

  if (!jitter) {
    const stopped = detectStopped(current);
    if (stopped) events.push(stopped);
  }

  const offRoute = detectOffRoute(current);
  if (offRoute) events.push(offRoute);

  return events;
}

// ─── GPS Jitter Guard ───────────────────────────────────────────────

/** Meters threshold — position changes smaller than this are jitter. */
const GPS_JITTER_METERS = 8;

function isGpsJitter(previous: NavigationSnapshot | null, current: NavigationSnapshot): boolean {
  if (!previous?.currentPosition || !current.currentPosition) return false;
  const distMiles = haversineDistanceMiles(previous.currentPosition, current.currentPosition);
  return distMiles * 1609.344 < GPS_JITTER_METERS;
}

// ─── Individual Detectors ───────────────────────────────────────────

function detectRouteChange(
  previous: NavigationSnapshot,
  current: NavigationSnapshot
): RouteChangeEvent | null {
  if (!previous.routeId || !current.routeId) return null;
  if (previous.routeId === current.routeId) return null;

  const now = new Date().toISOString();
  return {
    id: `${now}-route_change`,
    type: "route_change",
    severity: "medium",
    timestamp: now,
    description: `Route changed from "${previous.routeId}" to "${current.routeId}".`,
    metadata: {
      previousRouteId: previous.routeId,
      currentRouteId: current.routeId,
    },
  };
}

function detectStopped(current: NavigationSnapshot): StoppedEvent | null {
  if (current.currentSpeedMph === null) return null;
  if (current.currentSpeedMph > STOPPED_SPEED_THRESHOLD_MPH) return null;

  const now = new Date().toISOString();
  return {
    id: `${now}-stopped`,
    type: "stopped",
    severity: "low",
    timestamp: now,
    description: `User appears stopped (speed: ${current.currentSpeedMph.toFixed(1)} mph).`,
    metadata: {
      speedMph: current.currentSpeedMph,
      position: current.currentPosition,
    },
  };
}

function detectDelayIncrease(
  previous: NavigationSnapshot,
  current: NavigationSnapshot
): DelayIncreaseEvent | null {
  if (previous.estimatedDurationMinutes === null) return null;
  if (current.estimatedDurationMinutes === null) return null;
  if (!previous.routeId || !current.routeId) return null;
  if (previous.routeId !== current.routeId) return null;

  const increase = current.estimatedDurationMinutes - previous.estimatedDurationMinutes;
  const thresholdMinutes = Math.max(previous.estimatedDurationMinutes * 0.2, 3);

  if (increase < thresholdMinutes) return null;

  const severity: DeviationSeverity = increase > 10 ? "high" : "medium";
  const now = new Date().toISOString();

  return {
    id: `${now}-delay_increase`,
    type: "delay_increase",
    severity,
    timestamp: now,
    description: `ETA increased by ${Math.round(increase)} min on route "${current.routeId}".`,
    metadata: {
      previousDuration: previous.estimatedDurationMinutes,
      currentDuration: current.estimatedDurationMinutes,
      increaseMinutes: Math.round(increase),
      routeId: current.routeId,
    },
  };
}

function detectOffRoute(current: NavigationSnapshot): OffRouteEvent | null {
  if (!current.currentPosition) return null;
  if (current.routePolyline.length === 0) return null;

  const distanceMiles = minDistanceToPolylineMiles(current.currentPosition, current.routePolyline);

  if (distanceMiles < OFF_ROUTE_THRESHOLD_MILES) return null;

  const severity: DeviationSeverity = distanceMiles > 1 ? "high" : "medium";
  const now = new Date().toISOString();

  return {
    id: `${now}-off_route`,
    type: "off_route",
    severity,
    timestamp: now,
    description: `User is ${distanceMiles.toFixed(2)} mi from the nearest route segment.`,
    metadata: {
      distanceMiles,
      position: current.currentPosition,
    },
  };
}

/**
 * Haversine distance between two lat/lng points, in miles.
 */
function haversineDistanceMiles(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const EARTH_RADIUS_MILES = 3958.8;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const h =
    sinLat * sinLat + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLng * sinLng;

  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

/**
 * Minimum distance from a point to any segment in a polyline, in miles.
 */
function minDistanceToPolylineMiles(
  point: { latitude: number; longitude: number },
  polyline: Array<{ latitude: number; longitude: number }>
): number {
  if (polyline.length === 0) return Infinity;
  if (polyline.length === 1) return haversineDistanceMiles(point, polyline[0]);

  let min = Infinity;
  for (const vertex of polyline) {
    const d = haversineDistanceMiles(point, vertex);
    if (d < min) min = d;
  }

  return min;
}
