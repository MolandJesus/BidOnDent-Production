// computeNavigationMetrics.ts
// Helper for computing distance and ETA for navigation overlays

import type { Coordinates } from "../../types/mapDomain";

const EARTH_RADIUS_MILES = 3958.8;

export function haversineDistanceMiles(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_MILES * c;
}

export function formatDistance(miles: number): string {
  if (miles < 0.2) {
    // Convert to feet (1 mile = 5280 ft)
    const feet = Math.round(miles * 5280);
    return `${feet} ft`;
  }
  return `${miles.toFixed(1)} mi`;
}

export function computeETA(distanceMiles: number, averageSpeedMph = 35): string {
  if (!distanceMiles || distanceMiles <= 0) return "";
  const minutes = Math.round((distanceMiles / averageSpeedMph) * 60);
  return `${minutes} min`;
}
