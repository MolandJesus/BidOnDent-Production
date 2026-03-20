import type { CoveragePartnerShop } from "../../components/maps/serviceCoverageMapTypes";
import type { NavigationCoordinate, NavigationRoutePreview, NavigationRouteStep } from "../../types/navigation";

type RouteEngineArgs = {
  origin: NavigationCoordinate;
  destination: CoveragePartnerShop;
  signal?: AbortSignal;
};

type OsrmStep = {
  distance: number;
  duration: number;
  name: string;
  maneuver: {
    type?: string;
    modifier?: string;
    exit?: number;
    location: [number, number];
  };
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

function titleizeModifier(modifier?: string) {
  return modifier ? modifier.replaceAll("-", " ") : "forward";
}

function buildStepInstruction(step: OsrmStep, destinationName: string) {
  const maneuverType = step.maneuver.type || "continue";
  const modifier = titleizeModifier(step.maneuver.modifier);
  const roadName = step.name || "the current road";

  if (maneuverType === "depart") {
    return `Head out on ${roadName}.`;
  }

  if (maneuverType === "arrive") {
    return `Arrive at ${destinationName}.`;
  }

  if (maneuverType === "roundabout") {
    return step.maneuver.exit
      ? `Take the roundabout and use exit ${step.maneuver.exit}.`
      : "Take the roundabout.";
  }

  if (maneuverType === "merge") {
    return `Merge ${modifier} onto ${roadName}.`;
  }

  if (maneuverType === "on ramp") {
    return `Take the on-ramp ${modifier} toward ${roadName}.`;
  }

  if (maneuverType === "off ramp") {
    return `Take the off-ramp ${modifier} toward ${roadName}.`;
  }

  if (maneuverType === "fork") {
    return `Keep ${modifier} toward ${roadName}.`;
  }

  if (maneuverType === "new name") {
    return `Continue onto ${roadName}.`;
  }

  if (maneuverType === "end of road") {
    return `At the end of the road, turn ${modifier}.`;
  }

  if (maneuverType === "continue") {
    return `Continue on ${roadName}.`;
  }

  if (maneuverType === "turn") {
    return `Turn ${modifier} onto ${roadName}.`;
  }

  return `Proceed ${modifier} on ${roadName}.`;
}

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
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`,
    {
      headers: {
        Accept: "application/json",
      },
      signal,
    }
  );

  if (!response.ok) {
    throw new Error("Route preview is temporarily unavailable.");
  }

  const data = (await response.json()) as OsrmRouteResponse;
  const route = data.routes?.[0];

  if (!route) {
    throw new Error("No drivable route was found for that origin and destination.");
  }

  return {
    provider: "osrm-demo",
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    geometry: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
    steps:
      route.legs?.flatMap((leg) =>
        (leg.steps || []).map((step, index) => toRouteStep(step, destination.name, index))
      ) || [],
    fetchedAt: new Date().toISOString(),
  };
}
