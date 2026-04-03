import type { CoveragePartnerShop } from "../../components/maps/serviceCoverageMapTypes";
import type {
  NavigationCoordinate,
  NavigationRouteOptions,
  NavigationRoutePreview,
  NavigationRouteStep,
} from "../../types/navigation";
import { isProviderCircuitOpen, runWithProviderHealth } from "./providerHealth";
import { type OsrmStep, buildStepInstruction } from "./routeEngineVoiceBuilder";

type RouteEngineArgs = {
  origin: NavigationCoordinate;
  destination: CoveragePartnerShop;
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
