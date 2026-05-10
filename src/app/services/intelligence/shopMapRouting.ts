import type {
  Coordinates,
  RouteInstruction,
  RouteOption,
  SearchOrigin,
} from "../../types/mapDomain";
import type { MarketUserType } from "./marketIntelligence";
import type { ShopMapListing } from "./shopMapExperience";

const ROUTE_VARIANTS = [
  {
    id: "fastest",
    label: "Fastest",
    trafficLabel: "Light traffic",
    speedMph: 34,
    accentColor: "#2563eb",
    corridorLabel: "North Central corridor",
    latitudeOffset: 0.012,
    longitudeOffset: -0.01,
    bufferMinutes: 2,
  },
  {
    id: "balanced",
    label: "Balanced",
    trafficLabel: "Steady cross-town flow",
    speedMph: 29,
    accentColor: "#0f766e",
    corridorLabel: "Uptown connector",
    latitudeOffset: -0.008,
    longitudeOffset: 0.013,
    bufferMinutes: 4,
  },
  {
    id: "local",
    label: "Local roads",
    trafficLabel: "Signals + surface streets",
    speedMph: 24,
    accentColor: "#c2410c",
    corridorLabel: "Neighborhood streets",
    latitudeOffset: 0.016,
    longitudeOffset: 0.016,
    bufferMinutes: 6,
  },
] as const;

function roundDuration(durationMinutes: number) {
  return Math.max(4, Math.round(durationMinutes / 2) * 2);
}

function formatDurationLabel(durationMinutes: number) {
  if (durationMinutes >= 60) {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours} hr ${minutes} min`;
  }

  return `${durationMinutes} min`;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceMiles(origin: Coordinates, destination: Coordinates) {
  const earthRadiusMiles = 3958.8;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusMiles * (2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)));
}

export function formatDistanceLabel(distanceMiles: number) {
  if (distanceMiles < 1) {
    return `${Math.round(distanceMiles * 10) / 10} mi`;
  }

  return `${distanceMiles.toFixed(1)} mi`;
}

/**
 * Pass 179 (2026-05-08) KI-169 — sanity-check route output against
 * plausibility bands for a local body-shop use case. BidOnDent customers
 * picking a shop in their metro area should never see >100mi or >4hr
 * routes. Audit AI Pass 9 §3 captured a 853.4mi / 1264min route for a
 * NY-area request — symptom of upstream coordinate corruption (origin
 * defaulting to (0,0) or a distant stub). This helper does NOT suppress
 * the bug; it surfaces a structured flag + reasons so consumers can
 * render "—" / hide alternates AND a dev-only console.warn can carry
 * diagnostic context for upstream tracing.
 *
 * Bands (chosen conservatively to catch the audit's 853mi case):
 *   - distance > 100 mi
 *   - duration > 240 min (4 hours)
 *   - implied speed outside [10, 80] mph (catches divide-by-tiny-distance bugs)
 */
export function flagImplausibleRoute(input: {
  distanceMiles: number;
  durationMinutes: number;
}): { isImplausible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (input.distanceMiles > 100) {
    reasons.push(`distance ${input.distanceMiles.toFixed(1)}mi exceeds 100mi band`);
  }
  if (input.durationMinutes > 240) {
    reasons.push(`duration ${input.durationMinutes}min exceeds 240min band`);
  }
  if (input.distanceMiles > 0.1 && input.durationMinutes > 0) {
    const impliedMph = input.distanceMiles / (input.durationMinutes / 60);
    if (impliedMph < 10 || impliedMph > 80) {
      reasons.push(`implied speed ${impliedMph.toFixed(1)}mph outside [10,80] band`);
    }
  }
  return { isImplausible: reasons.length > 0, reasons };
}

function interpolatePoint(
  origin: Coordinates,
  destination: Coordinates,
  weight: number,
  latitudeOffset = 0,
  longitudeOffset = 0
): Coordinates {
  return {
    latitude: origin.latitude + (destination.latitude - origin.latitude) * weight + latitudeOffset,
    longitude:
      origin.longitude + (destination.longitude - origin.longitude) * weight + longitudeOffset,
  };
}

function buildRoutePolyline(
  origin: Coordinates,
  destination: Coordinates,
  latitudeOffset: number,
  longitudeOffset: number
) {
  return [
    origin,
    interpolatePoint(origin, destination, 0.28, latitudeOffset * 0.55, longitudeOffset * 0.45),
    interpolatePoint(origin, destination, 0.62, latitudeOffset, longitudeOffset),
    interpolatePoint(origin, destination, 0.84, latitudeOffset * 0.35, longitudeOffset * 0.25),
    destination,
  ];
}

function buildRouteInstructions({
  corridorLabel,
  destinationAddress,
  destinationName,
  destinationCity,
  durationMinutes,
  totalDistanceLabel,
}: {
  corridorLabel: string;
  destinationAddress: string;
  destinationCity: string;
  destinationName: string;
  durationMinutes: number;
  totalDistanceLabel: string;
}) {
  const firstLegMinutes = Math.max(3, Math.round(durationMinutes * 0.3));
  const secondLegMinutes = Math.max(4, Math.round(durationMinutes * 0.42));
  const finalLegMinutes = Math.max(2, durationMinutes - firstLegMinutes - secondLegMinutes);

  return [
    {
      id: "depart",
      title: "Depart",
      detail: "Head out from your selected origin and follow the first outbound streets.",
      distanceLabel: totalDistanceLabel,
      durationMinutes: firstLegMinutes,
    },
    {
      id: "corridor",
      title: `Follow ${corridorLabel}`,
      detail: `Stay on the main flow toward ${destinationCity} with BidOnDent's route preview pinned to the selected shop.`,
      distanceLabel: `${Math.max(0.8, Number((firstLegMinutes / 6).toFixed(1)))} mi`,
      durationMinutes: secondLegMinutes,
    },
    {
      id: "arrival-approach",
      title: "Approach destination",
      detail: `Use the final approach around ${destinationAddress} and prepare for shop intake or claim handoff.`,
      distanceLabel: `${Math.max(0.4, Number((finalLegMinutes / 8).toFixed(1)))} mi`,
      durationMinutes: finalLegMinutes,
    },
    {
      id: "arrive",
      title: `Arrive at ${destinationName}`,
      detail:
        "Selected shop details stay synced with the map card while you compare alternate routes.",
      distanceLabel: "Arrival",
      durationMinutes: 0,
    },
  ] satisfies RouteInstruction[];
}

export function buildShopRouteOptions({
  origin,
  shop,
}: {
  origin: SearchOrigin;
  shop: ShopMapListing | null;
}) {
  if (!origin || !shop) {
    return [] as RouteOption[];
  }

  const destination = shop.mapResult.coordinates;
  const baseDistance = calculateDistanceMiles(origin, destination);

  return ROUTE_VARIANTS.map((variant, index) => {
    const routeDistanceMiles = Number((baseDistance * (1 + index * 0.045)).toFixed(1));
    const estimatedDurationMinutes = roundDuration(
      (routeDistanceMiles / variant.speedMph) * 60 + variant.bufferMinutes
    );
    const sanityFlag = flagImplausibleRoute({
      distanceMiles: routeDistanceMiles,
      durationMinutes: estimatedDurationMinutes,
    });

    if (sanityFlag.isImplausible && import.meta.env.DEV) {
      console.warn(
        `[KI-169] implausible route for shop "${shop.name}": ${sanityFlag.reasons.join("; ")} ` +
          `| origin=(${origin.latitude.toFixed(4)},${origin.longitude.toFixed(4)}) ` +
          `dest=(${destination.latitude.toFixed(4)},${destination.longitude.toFixed(4)})`
      );
    }

    return {
      id: variant.id,
      label: variant.label,
      trafficLabel: variant.trafficLabel,
      totalDistanceMiles: routeDistanceMiles,
      totalDistanceLabel: formatDistanceLabel(routeDistanceMiles),
      estimatedDurationMinutes,
      accentColor: variant.accentColor,
      polyline: buildRoutePolyline(
        origin,
        destination,
        variant.latitudeOffset,
        variant.longitudeOffset
      ),
      instructions: buildRouteInstructions({
        corridorLabel: variant.corridorLabel,
        destinationAddress: shop.mapResult.address,
        destinationCity: shop.mapResult.city,
        destinationName: shop.name,
        durationMinutes: estimatedDurationMinutes,
        totalDistanceLabel: formatDistanceLabel(routeDistanceMiles),
      }),
      isImplausible: sanityFlag.isImplausible,
      implausibleReasons: sanityFlag.isImplausible ? sanityFlag.reasons : undefined,
    } satisfies RouteOption;
  });
}

export function buildRoleAwareRouteSummary({
  selectedRoute,
  shop,
  userType,
  isActiveGuidance = false,
}: {
  selectedRoute: RouteOption | null;
  shop: ShopMapListing | null;
  userType: MarketUserType;
  isActiveGuidance?: boolean;
}) {
  if (!selectedRoute || !shop) {
    return {
      description: "Pick an origin to unlock route preview, ETA, and turn guidance.",
      title: "Route preview ready when you are",
      callouts: [],
    };
  }

  if (isActiveGuidance) {
    return {
      title: `Navigating to ${shop.name}`,
      description: "",
      callouts: [],
    };
  }

  if (userType === "shop") {
    return {
      title: `Scout ${shop.name} in ${formatDurationLabel(selectedRoute.estimatedDurationMinutes)}`,
      description:
        "Use the route panel to benchmark how quickly your team could physically inspect or compare this competitor territory.",
      callouts: [],
    };
  }

  if (userType === "insurer") {
    return {
      title: `Plan a partner visit to ${shop.name}`,
      description:
        "The route preview helps claims and network teams estimate field-review timing before outreach or partner onboarding.",
      callouts: [],
    };
  }

  return {
    title: `Directions to ${shop.name}`,
    description:
      "Compare route timing before you commit to a repair conversation, drop-off, or tow coordination path.",
    callouts: [],
  };
}
