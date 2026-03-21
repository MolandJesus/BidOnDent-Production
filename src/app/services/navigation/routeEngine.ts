import type { CoveragePartnerShop } from "../../components/maps/serviceCoverageMapTypes";
import type {
  NavigationCoordinate,
  NavigationRouteOptions,
  NavigationRoutePreview,
  NavigationRouteStep,
} from "../../types/navigation";
import { runWithProviderHealth } from "./providerHealth";

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

const leadInPhrases = [
  "Heads up,",
  "Coming up,",
  "Next move,",
  "Route update,",
  "Navigation cue,",
  "Plan ahead,",
  "Stay with this lane,",
  "Keep this flow,",
  "Watch for this,",
  "Note ahead,",
  "Next turn,",
  "Route says,",
  "Get ready,",
  "Preparing for the next step,",
  "Guidance update,",
  "On your navigate,",
  "Road ahead,",
  "Routing note,",
  "Steady pace,",
  "Stay alert,",
];

const urgencyLeadInPhrases = [
  "Now,",
  "Immediately,",
  "Sharp attention,",
  "Act now,",
  "Right here,",
  "Move now,",
  "Turn now,",
  "This is it,",
  "Your turn is here,",
  "Execute now,",
  "Turn immediately,",
  "This is your turn,",
];

const distanceUrgentPhrases = [
  "now",
  "right now",
  "immediately",
  "at this moment",
  "right here",
  "this instant",
  "on this spot",
  "act fast",
  "this is it",
  "take it now",
];

const distanceClosePhrases = [
  "right away",
  "in just a moment",
  "very soon",
  "almost immediately",
  "in a beat",
  "coming up now",
  "in a short distance",
  "just ahead",
  "moments away",
  "coming into view",
  "in a brief stretch",
  "very shortly",
  "around the corner",
  "in seconds",
];

const distanceNearPhrases = [
  "soon",
  "in a short stretch",
  "up ahead",
  "in the next block",
  "after this short segment",
  "just ahead",
  "in a moment",
  "before long",
  "in a short while",
  "within the block",
  "in the near distance",
  "after a little ways",
  "a short way ahead",
  "coming up shortly",
];

const distanceFarPhrases = [
  "after a longer stretch",
  "once you continue ahead",
  "further up the route",
  "after you stay on this road",
  "once you pass the next segment",
  "after this run",
  "in a while",
  "after a good stretch",
  "further along",
  "once you've covered more ground",
  "when you've gone a bit further",
  "after traveling a ways",
  "after a longer drive",
  "well ahead of you",
];

const departureActionPhrases = [
  "head out on",
  "start by taking",
  "begin on",
  "roll out onto",
  "set off via",
  "kick off the route on",
  "leave here on",
  "begin your drive on",
  "depart via",
  "start your journey on",
  "head north on",
  "launch the route on",
  "let's get going on",
  "your route begins on",
  "pull out onto",
  "the route starts on",
  "first leg is",
  "starting road is",
];

const arrivalActionPhrases = [
  "you are arriving at",
  "you have reached",
  "destination is here:",
  "arrive at",
  "this is your stop:",
  "you are now at",
  "you made it to",
  "final destination:",
  "you have arrived at",
  "welcome to",
  "journey ends at",
  "your stop is",
  "you are at your destination,",
  "arrival confirmed at",
  "the route end is",
  "you have reached your target:",
  "drop-off point:",
  "end of navigation at",
];

const arrivalApproachPhrases = [
  "approaching your destination,",
  "coming up on your destination,",
  "destination is close now,",
  "within range of your stop,",
  "nearly there,",
  "your stop is just ahead,",
  "almost at destination,",
  "final approach to your stop,",
  "getting very close to the destination,",
  "arrival is near at",
  "almost at your destination,",
  "you are closing in on",
];

const continueActionPhrases = [
  "continue on",
  "stay on",
  "keep following",
  "proceed along",
  "remain on",
  "keep moving on",
  "hold your line on",
  "carry on via",
  "stay the course on",
  "keep straight on",
  "press forward on",
  "cruise ahead on",
  "maintain your direction on",
  "track forward on",
  "keep your heading on",
  "advance along",
  "settle in on",
  "drive ahead on",
];

const straightContinuePhrases = [
  "go straight on",
  "continue straight on",
  "drive straight ahead on",
  "proceed straight along",
  "keep heading straight on",
  "stay straight on",
  "maintain direction, straight on",
  "forward on",
  "head straight along",
  "arrow-straight on",
  "no turns, straight on",
  "hold it straight on",
];

const turnActionPhrases = [
  "turn {modifier} onto",
  "make a {modifier} turn onto",
  "take a {modifier} onto",
  "go {modifier} onto",
  "swing {modifier} onto",
  "transition {modifier} onto",
  "move {modifier} onto",
  "angle {modifier} onto",
  "hook {modifier} onto",
  "bear {modifier} onto",
  "twist {modifier} onto",
  "cut {modifier} onto",
  "{modifier} turn onto",
  "bend {modifier} onto",
  "point {modifier} and get onto",
  "take the {modifier} turn onto",
  "make your {modifier} onto",
  "rotate {modifier} onto",
];

const sharpTurnActionPhrases = [
  "take a sharp {modifier} turn onto",
  "make a tight {modifier} onto",
  "execute a hard {modifier} onto",
  "take the sharp {modifier} onto",
  "hard {modifier} onto",
  "sharp {modifier} — turn onto",
  "tight corner {modifier} onto",
  "very sharp {modifier} here — onto",
];

const slightTurnActionPhrases = [
  "bear slightly {modifier} onto",
  "veer slightly {modifier} onto",
  "ease slightly {modifier} onto",
  "drift slightly {modifier} onto",
  "angle slightly {modifier} onto",
  "gentle {modifier} curve onto",
  "soft {modifier} turn onto",
  "light {modifier} here onto",
];

const uTurnActionPhrases = [
  "make a U-turn when it is safe",
  "perform a U-turn ahead",
  "take a U-turn",
  "turn around at the next opportunity",
  "execute a U-turn here",
  "reverse direction — U-turn",
  "U-turn recommended at the next safe spot",
  "turn back the way you came",
  "do a U-turn up ahead",
  "legal U-turn ahead",
  "flip your direction via U-turn",
  "make a full turnaround",
];

const keepActionPhrases = [
  "keep {modifier} on",
  "stay {modifier} on",
  "use the {modifier} lane on",
  "move to the {modifier} lane on",
  "hold {modifier} on",
  "stay in the {modifier} lane on",
  "keep your position {modifier} on",
  "track {modifier} on",
  "stay over {modifier} on",
  "hug the {modifier} side on",
  "favor the {modifier} lane on",
  "position yourself {modifier} on",
];

const mergeActionPhrases = [
  "merge {modifier} onto",
  "blend {modifier} onto",
  "join {modifier} onto",
  "enter {modifier} onto",
  "flow {modifier} onto",
  "ease {modifier} onto",
  "merge over {modifier} onto",
  "continue by merging {modifier} onto",
  "slip {modifier} onto",
  "weave {modifier} onto",
  "pull {modifier} onto",
  "glide {modifier} onto",
  "slide {modifier} into",
  "work {modifier} onto",
  "transition over {modifier} onto",
  "navigate {modifier} onto",
  "smoothly merge {modifier} onto",
  "time your merge {modifier} onto",
];

const onRampActionPhrases = [
  "take the on-ramp {modifier} toward",
  "use the on-ramp {modifier} for",
  "enter via the on-ramp {modifier} toward",
  "take the ramp {modifier} toward",
  "join using the on-ramp {modifier} toward",
  "follow the on-ramp {modifier} toward",
  "use the feeder ramp {modifier} toward",
  "move onto the ramp {modifier} toward",
  "accelerate up the on-ramp {modifier} toward",
  "enter the freeway via the ramp {modifier} toward",
  "use the entry ramp {modifier} toward",
  "hit the on-ramp {modifier} toward",
  "access the highway via the ramp {modifier} toward",
  "get on from the ramp {modifier} toward",
  "catch the on-ramp {modifier} toward",
  "ramp up {modifier} toward",
  "enter at the on-ramp {modifier} toward",
  "use the slip road {modifier} toward",
];

const offRampActionPhrases = [
  "take the off-ramp {modifier} toward",
  "use the exit ramp {modifier} toward",
  "peel off {modifier} toward",
  "exit {modifier} toward",
  "leave via the off-ramp {modifier} toward",
  "follow the exit ramp {modifier} toward",
  "take the ramp out {modifier} toward",
  "move onto the off-ramp {modifier} toward",
  "take the exit {modifier} toward",
  "use the freeway exit {modifier} toward",
  "leave the highway {modifier} toward",
  "pull off {modifier} toward",
  "exit at the ramp {modifier} toward",
  "decelerate onto the ramp {modifier} toward",
  "get off at {modifier} toward",
  "slip off {modifier} toward",
  "leave the current road {modifier} toward",
  "follow the exit slip {modifier} toward",
];

const forkActionPhrases = [
  "keep {modifier} toward",
  "bear {modifier} toward",
  "at the split, stay {modifier} toward",
  "follow the fork {modifier} toward",
  "take the {modifier} branch toward",
  "hold {modifier} at the fork toward",
  "track {modifier} toward",
  "choose the fork {modifier} toward",
  "at the fork, go {modifier} toward",
  "veer {modifier} at the split toward",
  "stay on the {modifier} path toward",
  "road splits here — stay {modifier} toward",
  "at the Y, go {modifier} toward",
  "take the {modifier} option toward",
  "the route forks — choose {modifier} toward",
  "follow the {modifier} road toward",
  "stay on your {modifier} side toward",
  "lean {modifier} at the junction toward",
];

const endOfRoadActionPhrases = [
  "at the end of the road, turn {modifier}",
  "when this road ends, go {modifier}",
  "at road end, take a {modifier}",
  "at the T, turn {modifier}",
  "road terminates ahead, turn {modifier}",
  "at the end, swing {modifier}",
  "as this road closes, go {modifier}",
  "end of segment ahead, turn {modifier}",
  "road ends here — take a {modifier}",
  "at the dead end, go {modifier}",
  "when the road stops, turn {modifier}",
  "T-intersection ahead — go {modifier}",
  "this road terminates — choose {modifier}",
  "at the road's terminus, turn {modifier}",
  "dead-end junction — take the {modifier}",
  "the road ends ahead — swing {modifier}",
  "road closes — head {modifier}",
  "the current segment ends — go {modifier}",
];

const roundaboutNoExitPhrases = [
  "take the roundabout",
  "enter the roundabout",
  "go through the roundabout",
  "use the roundabout",
  "follow the roundabout",
  "continue via the roundabout",
  "join the roundabout",
  "move through the roundabout",
  "navigate the roundabout",
  "circle through the roundabout",
  "enter and exit the roundabout",
  "use the traffic circle",
  "use the rotary",
  "follow the circle",
  "pass through the roundabout",
  "loop through the roundabout",
  "traverse the roundabout",
  "work through the roundabout",
];

const roundaboutExitPhrases = [
  "take the roundabout and use exit {exit}",
  "enter the roundabout, then take exit {exit}",
  "at the roundabout, continue to exit {exit}",
  "use the roundabout and leave at exit {exit}",
  "follow the roundabout to exit {exit}",
  "go through the roundabout and take exit {exit}",
  "take roundabout exit {exit}",
  "at the circle, take exit {exit}",
  "enter the circle and leave at exit {exit}",
  "navigate the roundabout to exit {exit}",
  "circle around to take exit {exit}",
  "count to exit {exit} inside the roundabout",
  "at the traffic circle, leave at exit {exit}",
  "use the rotary and take exit {exit}",
  "enter the roundabout and count off to exit {exit}",
  "take the ring road to exit {exit}",
  "at this roundabout, stay on until exit {exit}",
  "round it and take exit {exit}",
];

const roadFallbacks = [
  "the current road",
  "this road",
  "the active route",
  "the current segment",
  "the roadway ahead",
  "this corridor",
  "the route ahead",
  "this stretch",
  "the upcoming road",
  "the next stretch",
  "the present road",
  "this lane",
  "the onward road",
  "the road before you",
];

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
    .replaceAll("{modifier}", values.modifier)
    .replaceAll("{road}", values.roadName)
    .replaceAll("{exit}", values.exit ? String(values.exit) : "");
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
    provider: "osrm-demo",
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
