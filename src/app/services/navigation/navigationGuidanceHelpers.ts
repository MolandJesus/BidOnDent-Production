/**
 * navigationGuidanceHelpers — Pure helper functions for the navigation
 * guidance system (voice timing, GPS speed, maneuver thresholds, key builders).
 *
 * Extracted from useCoverageNavigationExperience.ts (Pass 29). Zero behavior change.
 */

import type { CoverageSearchTarget } from "../../components/maps/serviceCoverageMapTypes";
import type {
  NavigationCoordinate,
  NavigationRouteStep,
  NavigationVoiceMode,
} from "../../types/navigation";
import type { CoveragePartnerShop } from "../../components/maps/serviceCoverageMapTypes";
import { haversineMiles } from "../supabase/map";

const ROUTE_KEY_COORD_PRECISION = 6;
const MAX_REASONABLE_NAV_SPEED_MPH = 95;
const DEVICE_FALLBACK_SPEED_DISAGREEMENT_MPH = 24;
const MAX_ACCELERATION_MPH_PER_SECOND = 18;
const POOR_GPS_ACCURACY_METERS = 55;

function normalizeKeyPart(value: string | undefined) {
  return (value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function toKeyCoordinate(value: number) {
  return Number.isFinite(value) ? value.toFixed(ROUTE_KEY_COORD_PRECISION) : "0";
}

export function toCoverageSearchTarget(
  coordinate: NavigationCoordinate,
  label: string,
  source: CoverageSearchTarget["source"]
): CoverageSearchTarget {
  return {
    lat: coordinate.lat,
    lng: coordinate.lng,
    label,
    source,
  };
}

export function calculateFallbackSpeedMph(
  previousPosition: NavigationCoordinate | null,
  previousTimestamp: number | null,
  nextPosition: NavigationCoordinate,
  nextTimestamp: number
) {
  if (!previousPosition || !previousTimestamp) {
    return null;
  }

  const elapsedHours = (nextTimestamp - previousTimestamp) / (1000 * 60 * 60);

  if (elapsedHours <= 0) {
    return null;
  }

  return haversineMiles(previousPosition, nextPosition) / elapsedHours;
}

type ResolveReliableCurrentSpeedMphArgs = {
  speedFromDeviceMph: number | null;
  fallbackSpeedMph: number | null;
  previousSpeedMph: number | null;
  elapsedMs: number | null;
  gpsAccuracyMeters: number | null;
};

function sanitizeSpeedCandidate(speedMph: number | null | undefined) {
  if (typeof speedMph !== "number" || !Number.isFinite(speedMph) || speedMph < 0) {
    return null;
  }

  return Math.min(speedMph, MAX_REASONABLE_NAV_SPEED_MPH);
}

export function resolveReliableCurrentSpeedMph({
  speedFromDeviceMph,
  fallbackSpeedMph,
  previousSpeedMph,
  elapsedMs,
  gpsAccuracyMeters,
}: ResolveReliableCurrentSpeedMphArgs) {
  const deviceSpeed = sanitizeSpeedCandidate(speedFromDeviceMph);
  const fallbackSpeed = sanitizeSpeedCandidate(fallbackSpeedMph);
  const previousSpeed = sanitizeSpeedCandidate(previousSpeedMph);
  const hasPoorAccuracy =
    typeof gpsAccuracyMeters === "number" &&
    Number.isFinite(gpsAccuracyMeters) &&
    gpsAccuracyMeters > POOR_GPS_ACCURACY_METERS;

  let nextSpeed: number | null = null;

  if (deviceSpeed !== null && fallbackSpeed !== null) {
    if (previousSpeed !== null) {
      const deviceDelta = Math.abs(deviceSpeed - previousSpeed);
      const fallbackDelta = Math.abs(fallbackSpeed - previousSpeed);
      nextSpeed = deviceDelta <= fallbackDelta ? deviceSpeed : fallbackSpeed;

      if (
        Math.abs(deviceSpeed - fallbackSpeed) > DEVICE_FALLBACK_SPEED_DISAGREEMENT_MPH &&
        Math.min(deviceDelta, fallbackDelta) > DEVICE_FALLBACK_SPEED_DISAGREEMENT_MPH
      ) {
        nextSpeed = Math.min(deviceSpeed, fallbackSpeed);
      }
    } else {
      nextSpeed =
        Math.abs(deviceSpeed - fallbackSpeed) > DEVICE_FALLBACK_SPEED_DISAGREEMENT_MPH
          ? Math.min(deviceSpeed, fallbackSpeed)
          : deviceSpeed;
    }
  } else {
    nextSpeed = deviceSpeed ?? fallbackSpeed;
  }

  if (nextSpeed === null) {
    return null;
  }

  if (previousSpeed !== null && typeof elapsedMs === "number" && elapsedMs > 0) {
    const elapsedSeconds = elapsedMs / 1000;
    const maxAllowedIncrease = Math.max(12, elapsedSeconds * MAX_ACCELERATION_MPH_PER_SECOND);

    if (nextSpeed > previousSpeed + maxAllowedIncrease) {
      return hasPoorAccuracy ? previousSpeed : previousSpeed + maxAllowedIncrease;
    }
  }

  return nextSpeed;
}

export function shouldSpeakStep(step: NavigationRouteStep, voiceMode: NavigationVoiceMode) {
  if (voiceMode === "muted") {
    return false;
  }

  if (voiceMode === "full") {
    return true;
  }

  return step.maneuverType !== "continue" && step.maneuverType !== "depart";
}

export function getManeuverBaseSpeakDistanceMeters(step: NavigationRouteStep) {
  if (step.maneuverType === "arrive") {
    return 95;
  }

  if (step.maneuverType === "roundabout" || step.maneuverType === "off ramp") {
    return 180;
  }

  if (step.maneuverType === "turn" || step.maneuverType === "fork") {
    return 150;
  }

  if (step.maneuverType === "merge" || step.maneuverType === "on ramp") {
    return 170;
  }

  return 140;
}

export function getManeuverAdvanceDistanceMeters(step: NavigationRouteStep) {
  if (step.maneuverType === "arrive") {
    return 42;
  }

  if (step.maneuverType === "roundabout" || step.maneuverType === "off ramp") {
    return 34;
  }

  return 28;
}

export function getSpeedAdjustmentMeters(currentSpeedMph: number | null) {
  if (!currentSpeedMph || !Number.isFinite(currentSpeedMph)) {
    return 0;
  }

  if (currentSpeedMph >= 65) {
    return 72;
  }

  if (currentSpeedMph >= 45) {
    return 40;
  }

  if (currentSpeedMph >= 30) {
    return 20;
  }

  return 0;
}

export function getAccuracyAdjustmentMeters(gpsAccuracyMeters: number | null) {
  if (!gpsAccuracyMeters || !Number.isFinite(gpsAccuracyMeters)) {
    return 0;
  }

  return Math.max(0, Math.min(45, gpsAccuracyMeters * 0.25));
}

export function getArrivalCompletionDistanceMeters(gpsAccuracyMeters: number | null) {
  return 18 + getAccuracyAdjustmentMeters(gpsAccuracyMeters) * 0.35;
}

export function buildOriginKey(target: CoverageSearchTarget | null) {
  if (!target) {
    return null;
  }

  return `${target.source}:${toKeyCoordinate(target.lat)},${toKeyCoordinate(target.lng)}`;
}

export function buildDestinationKey(shop: CoveragePartnerShop | null) {
  if (!shop) {
    return null;
  }

  const destinationIdentity =
    normalizeKeyPart(shop.id) ||
    [shop.name, shop.addressLine, shop.countyLabel]
      .map(normalizeKeyPart)
      .filter(Boolean)
      .join("|") ||
    "unknown-shop";

  return `${destinationIdentity}:${toKeyCoordinate(shop.lat)},${toKeyCoordinate(shop.lng)}`;
}

/**
 * After a route refresh, find the index of the first step the user
 * has NOT yet reached. Falls back to index 1 (or 0) when no GPS
 * position is available or no proximity match is found.
 *
 * Extracted from useCoverageNavigationExperience (Pass 53).
 */
export function resolveStepIndexAfterRefresh(
  steps: NavigationRouteStep[],
  position: NavigationCoordinate | null
): number {
  if (!position || steps.length <= 1) return steps.length > 1 ? 1 : 0;

  let closestIdx = 0;
  let closestDist = Infinity;
  for (let i = 0; i < steps.length; i++) {
    const d = haversineMiles(position, steps[i].location);
    if (d < closestDist) {
      closestDist = d;
      closestIdx = i;
    }
  }

  const PASSED_THRESHOLD_MILES = 0.05;
  if (closestDist < PASSED_THRESHOLD_MILES && closestIdx < steps.length - 1) {
    return closestIdx + 1;
  }
  return Math.min(closestIdx, steps.length - 1);
}

/**
 * Carry forward spoken-step markers for maneuvers that survive a
 * route refresh (matched by coordinate proximity).
 *
 * Returns a new Set<string> of step IDs to mark as already-spoken.
 * Pure function — the caller is responsible for storing the result.
 *
 * Extracted from useCoverageNavigationExperience (Pass 53).
 */
export function computeCarriedSpokenSteps(
  newSteps: NavigationRouteStep[],
  oldSpoken: ReadonlySet<string>
): Set<string> {
  if (oldSpoken.size === 0) return new Set();

  const oldCoords: NavigationCoordinate[] = [];
  for (const id of oldSpoken) {
    const parts = id.split("-");
    const coordPart = parts.slice(2).join("-");
    const [lngStr, latStr] = coordPart.split(",");
    const lng = parseFloat(lngStr);
    const lat = parseFloat(latStr);
    if (!isNaN(lng) && !isNaN(lat)) {
      oldCoords.push({ lat, lng });
    }
  }

  const MATCH_THRESHOLD_MILES = 0.02;
  const carried = new Set<string>();
  for (const step of newSteps) {
    for (const coord of oldCoords) {
      if (haversineMiles(step.location, coord) < MATCH_THRESHOLD_MILES) {
        carried.add(step.id);
        break;
      }
    }
  }

  return carried;
}
