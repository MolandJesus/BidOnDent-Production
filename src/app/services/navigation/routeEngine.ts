import type { CoveragePartnerShop } from "../../components/maps/serviceCoverageMapTypes";
import type {
  NavigationCoordinate,
  NavigationRouteOptions,
  NavigationRoutePreview,
  NavigationRouteStep,
} from "../../types/navigation";
import { isProviderCircuitOpen, runWithProviderHealth } from "./providerHealth";
import {
  arrivalActionPhrases,
  arrivalApproachPhrases,
  continueActionPhrases,
  departureActionPhrases,
  distanceClosePhrases,
  distanceFarPhrases,
  distanceNearPhrases,
  distanceUrgentPhrases,
  endOfRoadActionPhrases,
  forkActionPhrases,
  keepActionPhrases,
  leadInPhrases,
  mergeActionPhrases,
  offRampActionPhrases,
  onRampActionPhrases,
  roadFallbacks,
  roundaboutExitPhrases,
  roundaboutNoExitPhrases,
  sharpTurnActionPhrases,
  slightTurnActionPhrases,
  straightContinuePhrases,
  turnActionPhrases,
  uTurnActionPhrases,
  urgencyLeadInPhrases,
} from "./routeVoicePhrases";

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
  return modifier ? modifier.replace(/-/g, " ") : "forward";
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function pickVariant(options: string[], hashSeed: number, offset = 0) {
  return options[(hashSeed + offset) % options.length];
}

function normalizeRoadName(roadName?: string) {
  if (roadName && roadName.trim().length > 0) {
    return roadName;
  }

  return null;
}

function selectDistancePhrase(distanceMeters: number, hashSeed: number) {
  if (distanceMeters < 30) {
    return pickVariant(distanceUrgentPhrases, hashSeed, 41);
  }

  if (distanceMeters < 60) {
    return pickVariant(distanceClosePhrases, hashSeed, 11);
  }

  if (distanceMeters < 250) {
    return pickVariant(distanceNearPhrases, hashSeed, 13);
  }

  return pickVariant(distanceFarPhrases, hashSeed, 17);
}

function fillTemplate(
  template: string,
  values: {
    modifier: string;
    roadName: string;
    exit?: number;
  }
) {
  return template
    .replace(/\{modifier\}/g, values.modifier)
    .replace(/\{road\}/g, values.roadName)
    .replace(/\{exit\}/g, values.exit ? String(values.exit) : "");
}

function normalizeInstructionText(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,.;:!?]){2,}/g, "$1")
    .trim();
}

function trimInstructionToWordLimit(text: string, maxWords: number) {
  const words = text.split(" ").filter(Boolean);

  if (words.length <= maxWords) {
    return text;
  }

  return `${words.slice(0, maxWords).join(" ")}.`;
}

function collapseTripleWordRepetition(text: string) {
  return text.replace(/\b(\w+)(?:\s+\1){2,}\b/gi, "$1");
}

function buildGuardrailFallbackInstruction(step: OsrmStep, destinationName: string) {
  const maneuverType = step.maneuver.type || "continue";
  const roadName = normalizeRoadName(step.name) || "the current road";
  const modifier = titleizeModifier(step.maneuver.modifier);

  if (maneuverType === "arrive") {
    return `Arrive at ${destinationName}.`;
  }

  if (maneuverType === "roundabout" || maneuverType === "rotary") {
    if (step.maneuver.exit) {
      return `Enter the roundabout and take exit ${step.maneuver.exit}.`;
    }

    return "Enter and continue through the roundabout.";
  }

  if (maneuverType === "turn") {
    return `Turn ${modifier} onto ${roadName}.`;
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

  if (maneuverType === "use lane") {
    return `Use the ${modifier} lane on ${roadName}.`;
  }

  if (step.maneuver.modifier === "uturn") {
    return `Make a U-turn when safe.`;
  }

  return `Continue on ${roadName}.`;
}

function applyInstructionQualityGuardrails(
  rawInstruction: string,
  step: OsrmStep,
  destinationName: string
) {
  const cleaned = normalizeInstructionText(collapseTripleWordRepetition(rawInstruction));
  const concise = trimInstructionToWordLimit(cleaned, 22);
  const withPunctuation = /[.!?]$/.test(concise) ? concise : `${concise}.`;

  if (withPunctuation.length < 8 || /\bundefined\b|\bnull\b/i.test(withPunctuation)) {
    return buildGuardrailFallbackInstruction(step, destinationName);
  }

  return withPunctuation;
}

function buildActionPhrase(step: OsrmStep, destinationName: string, hashSeed: number) {
  const maneuverType = step.maneuver.type || "continue";
  const modifier = titleizeModifier(step.maneuver.modifier);
  const roadName = normalizeRoadName(step.name) || pickVariant(roadFallbacks, hashSeed, 23);
  const values = {
    modifier,
    roadName,
    exit: step.maneuver.exit,
  };

  if (maneuverType === "depart") {
    return `${fillTemplate(pickVariant(departureActionPhrases, hashSeed, 3), values)} ${roadName}`;
  }

  if (maneuverType === "arrive") {
    return `${pickVariant(arrivalActionPhrases, hashSeed, 5)} ${destinationName}`;
  }

  if (maneuverType === "roundabout" || maneuverType === "rotary") {
    const template = step.maneuver.exit
      ? pickVariant(roundaboutExitPhrases, hashSeed, 7)
      : pickVariant(roundaboutNoExitPhrases, hashSeed, 9);
    return fillTemplate(template, values);
  }

  if (maneuverType === "merge") {
    return fillTemplate(pickVariant(mergeActionPhrases, hashSeed, 15), values);
  }

  if (maneuverType === "on ramp") {
    return fillTemplate(pickVariant(onRampActionPhrases, hashSeed, 19), values);
  }

  if (maneuverType === "off ramp") {
    return fillTemplate(pickVariant(offRampActionPhrases, hashSeed, 21), values);
  }

  if (maneuverType === "fork") {
    return fillTemplate(pickVariant(forkActionPhrases, hashSeed, 25), values);
  }

  if (maneuverType === "new name") {
    return `${pickVariant(continueActionPhrases, hashSeed, 27)} ${roadName}`;
  }

  if (maneuverType === "end of road") {
    return fillTemplate(pickVariant(endOfRoadActionPhrases, hashSeed, 31), values);
  }

  if (maneuverType === "continue") {
    if (step.maneuver.modifier === "straight" || step.maneuver.modifier === "uturn") {
      if (step.maneuver.modifier === "uturn") {
        return pickVariant(uTurnActionPhrases, hashSeed, 43);
      }

      return `${pickVariant(straightContinuePhrases, hashSeed, 37)} ${roadName}`;
    }

    return `${pickVariant(continueActionPhrases, hashSeed, 33)} ${roadName}`;
  }

  if (maneuverType === "turn") {
    if (step.maneuver.modifier === "uturn") {
      return pickVariant(uTurnActionPhrases, hashSeed, 43);
    }

    if (step.maneuver.modifier === "sharp left" || step.maneuver.modifier === "sharp right") {
      return fillTemplate(pickVariant(sharpTurnActionPhrases, hashSeed, 45), values);
    }

    if (step.maneuver.modifier === "slight left" || step.maneuver.modifier === "slight right") {
      return fillTemplate(pickVariant(slightTurnActionPhrases, hashSeed, 47), values);
    }

    if (step.maneuver.modifier === "straight") {
      return `${pickVariant(straightContinuePhrases, hashSeed, 37)} ${roadName}`;
    }

    return fillTemplate(pickVariant(turnActionPhrases, hashSeed, 35), values);
  }

  if (maneuverType === "use lane") {
    return fillTemplate(pickVariant(keepActionPhrases, hashSeed, 49), values);
  }

  return `proceed ${modifier} on ${roadName}`;
}

function buildStepInstruction(step: OsrmStep, destinationName: string) {
  const maneuverType = step.maneuver.type || "continue";
  const hashSeed = hashString(
    [
      maneuverType,
      step.maneuver.modifier || "",
      step.name || "",
      step.distance.toFixed(0),
      step.duration.toFixed(0),
      step.maneuver.location.join(","),
      destinationName,
    ].join("|")
  );
  const isUrgent = step.distance < 30 && maneuverType !== "depart" && maneuverType !== "arrive";
  const leadIn = isUrgent
    ? pickVariant(urgencyLeadInPhrases, hashSeed, 2)
    : pickVariant(leadInPhrases, hashSeed, 1);
  const distanceCue = selectDistancePhrase(step.distance, hashSeed);
  const actionPhrase = buildActionPhrase(step, destinationName, hashSeed);

  if (maneuverType === "arrive") {
    const useApproach = step.distance > 50;
    if (useApproach) {
      const approachPhrase = pickVariant(arrivalApproachPhrases, hashSeed, 51);
      return applyInstructionQualityGuardrails(
        `${approachPhrase} ${destinationName}.`,
        step,
        destinationName
      );
    }

    return applyInstructionQualityGuardrails(`${leadIn} ${actionPhrase}.`, step, destinationName);
  }

  return applyInstructionQualityGuardrails(
    `${leadIn} ${actionPhrase} ${distanceCue}.`,
    step,
    destinationName
  );
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
