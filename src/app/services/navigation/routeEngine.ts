import type { NavigationDestination } from "../../types/mapDomain";
import type {
  NavigationCoordinate,
  NavigationRouteOptions,
  NavigationRoutePreview,
  NavigationRouteStep,
} from "../../types/navigation";
import { isProviderCircuitOpen, runWithProviderHealth } from "./providerHealth";
import { type OsrmStep, buildStepInstruction } from "./routeEngineVoiceBuilder";

/**
 * Pass 203 (2026-05-09) KI-179 — sanity-check navigation-engine route output
 * against plausibility bands for a local body-shop trip. Mirrors the
 * `flagImplausibleRoute` helper shipped Pass 179 for the dashboard mini-map
 * `RouteOption` data path. The navigation engine consumes real OSRM
 * responses (not stubs), but coordinate corruption upstream — origin
 * defaulting to (0,0), a stale stub destination, etc. — could still cause
 * the engine to return absurd routes. This helper does NOT suppress; it
 * surfaces a structured flag + reasons so consumers can render a warn UI.
 *
 * Bands (chosen to match Pass 179 — same plausibility model):
 *   - distance > 100 mi
 *   - duration > 240 min (4 hours)
 *   - implied speed outside [10, 80] mph
 */
export function flagImplausibleNavigationRoute(input: {
  distanceMiles: number;
  durationMinutes: number;
}): { isImplausible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (input.distanceMiles > 100) {
    reasons.push(`distance ${input.distanceMiles.toFixed(1)}mi exceeds 100mi band`);
  }
  if (input.durationMinutes > 240) {
    reasons.push(`duration ${Math.round(input.durationMinutes)}min exceeds 240min band`);
  }
  if (input.distanceMiles > 0.1 && input.durationMinutes > 0) {
    const impliedMph = input.distanceMiles / (input.durationMinutes / 60);
    if (impliedMph < 10 || impliedMph > 80) {
      reasons.push(`implied speed ${impliedMph.toFixed(1)}mph outside [10,80] band`);
    }
  }
  return { isImplausible: reasons.length > 0, reasons };
}

type RouteEngineArgs = {
  origin: NavigationCoordinate;
  destination: NavigationDestination;
  signal?: AbortSignal;
};

type OsrmRouteResponse = {
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: Array<[number, number]>;
    };
    legs?: Array<{
      steps?: OsrmStep[];
    }>;
  }>;
};

function toRouteStep(step: OsrmStep, destinationName: string, index: number): NavigationRouteStep {
  return {
    id: `step-${index}-${step.maneuver.location.join(",")}`,
    instruction: buildStepInstruction(step, destinationName),
    distanceMeters: step.distance,
    durationSeconds: step.duration,
    roadName: step.name || undefined,
    maneuverType: step.maneuver.type,
    maneuverModifier: step.maneuver.modifier,
    location: {
      lat: step.maneuver.location[1],
      lng: step.maneuver.location[0],
    },
  };
}

export async function fetchNavigationRoutePreview({
  origin,
  destination,
  signal,
}: RouteEngineArgs): Promise<NavigationRoutePreview> {
  const options = await fetchNavigationRouteOptions({ origin, destination, signal });
  return options.primary;
}

function toRoutePreview(
  route: NonNullable<OsrmRouteResponse["routes"]>[number],
  destinationName: string,
  fetchedAt: string
): NavigationRoutePreview {
  const distanceMiles = route.distance / 1609.34;
  const durationMinutes = route.duration / 60;
  const sanityFlag = flagImplausibleNavigationRoute({ distanceMiles, durationMinutes });

  if (sanityFlag.isImplausible && import.meta.env.DEV) {
    console.warn(
      `[KI-179] implausible navigation-engine route to "${destinationName}": ${sanityFlag.reasons.join("; ")} ` +
        `| distance=${distanceMiles.toFixed(1)}mi duration=${Math.round(durationMinutes)}min`
    );
  }

  return {
    provider: "osrm-public",
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    geometry: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
    steps:
      route.legs?.flatMap((leg, legIndex) =>
        (leg.steps || []).map((step, stepIndex) =>
          toRouteStep(step, destinationName, legIndex * 1000 + stepIndex)
        )
      ) || [],
    fetchedAt,
    ...(sanityFlag.isImplausible
      ? { isImplausible: true, implausibleReasons: sanityFlag.reasons }
      : {}),
  };
}

export async function fetchNavigationRouteOptions({
  origin,
  destination,
  signal,
}: RouteEngineArgs): Promise<NavigationRouteOptions> {
  if (isProviderCircuitOpen("osrm-route")) {
    throw new Error("Route preview is temporarily unavailable — please try again in a moment.");
  }

  const response = await runWithProviderHealth("osrm-route", () =>
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true&alternatives=true`,
      {
        headers: {
          Accept: "application/json",
        },
        signal,
      }
    )
  );

  if (!response.ok) {
    throw new Error("Route preview is temporarily unavailable.");
  }

  const data = (await response.json()) as OsrmRouteResponse;
  const routes = data.routes || [];
  const route = routes[0];

  if (!route) {
    throw new Error("No drivable route was found for that origin and destination.");
  }

  const fetchedAt = new Date().toISOString();
  const previews = routes
    .slice(0, 3)
    .map((candidateRoute) => toRoutePreview(candidateRoute, destination.name, fetchedAt));

  return {
    primary: previews[0],
    alternatives: previews,
  };
}
