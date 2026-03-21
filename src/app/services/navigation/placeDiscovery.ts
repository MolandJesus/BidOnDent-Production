import { haversineMiles } from "../supabase/map";
import type { NavigationCoordinate } from "../../types/navigation";
import { runWithProviderHealth } from "./providerHealth";
import { readPersistedState, writePersistedState } from "./persistedState";

export type NavigationDiscoveryRole = "customer" | "insurer" | "shop";
export type NavigationDiscoveryCategory =
  | "body-shop"
  | "insurance"
  | "fuel"
  | "rental"
  | "supplier";

export type NavigationDiscoveryPlace = {
  id: string;
  label: string;
  subtitle: string;
  category: NavigationDiscoveryCategory;
  qualityLabel: "verified" | "standard" | "limited";
  qualityScore: number;
  coordinate: NavigationCoordinate;
  distanceMiles: number;
  source: "overpass";
  phoneNumber?: string;
  website?: string;
};

export type DiscoveryQualitySnapshot = {
  generatedAt: string;
  role: NavigationDiscoveryRole;
  radiusMiles: number;
  sourceElementCount: number;
  acceptedCount: number;
  acceptedVerifiedCount: number;
  acceptedStandardCount: number;
  acceptedLimitedCount: number;
  acceptedBodyShopCount: number;
  acceptedInsuranceCount: number;
  acceptedFuelCount: number;
  acceptedRentalCount: number;
  acceptedSupplierCount: number;
  limitedAcceptanceRatePct: number;
  rejectedMissingCoordinateCount: number;
  rejectedMissingCategoryCount: number;
  rejectedMissingLabelCount: number;
  rejectedBelowQualityThresholdCount: number;
  dedupedCount: number;
  trimmedByCategoryDiversityCount: number;
  minimumQualityScore: number;
};

type BuildDiscoveryQualitySnapshotArgs = {
  role: NavigationDiscoveryRole;
  radiusMiles: number;
  sourceElementCount: number;
  acceptedPlaces: NavigationDiscoveryPlace[];
  rejectedMissingCoordinateCount: number;
  rejectedMissingCategoryCount: number;
  rejectedMissingLabelCount: number;
  rejectedBelowQualityThresholdCount: number;
  dedupedCount: number;
  trimmedByCategoryDiversityCount: number;
  minimumQualityScore: number;
  generatedAt?: string;
};

type DiscoveryTagRule = {
  category: NavigationDiscoveryCategory;
  key: string;
  value: string;
};

type FetchNearbyDiscoveryPlacesArgs = {
  center: NavigationCoordinate;
  role: NavigationDiscoveryRole;
  radiusMiles: number;
  signal?: AbortSignal;
};

const MAX_DISCOVERY_RESULTS = 15;
const discoveryQualityStorageKey = "bidondent-navigation-discovery-quality-snapshot-v1";
const discoveryQualityStorageVersion = 2;

let latestDiscoveryQualitySnapshot: DiscoveryQualitySnapshot | null = null;

type OverpassElement = {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

const discoveryRulesByRole: Record<NavigationDiscoveryRole, DiscoveryTagRule[]> = {
  customer: [
    { category: "body-shop", key: "shop", value: "car_repair" },
    { category: "body-shop", key: "amenity", value: "car_repair" },
    { category: "body-shop", key: "craft", value: "car_painter" },
    { category: "body-shop", key: "shop", value: "car_body_repair" },
    { category: "body-shop", key: "amenity", value: "car_service" },
    { category: "body-shop", key: "shop", value: "vehicle_inspection" },
    { category: "fuel", key: "amenity", value: "fuel" },
    { category: "rental", key: "amenity", value: "car_rental" },
    { category: "rental", key: "shop", value: "car_rental" },
  ],
  insurer: [
    { category: "body-shop", key: "shop", value: "car_repair" },
    { category: "body-shop", key: "amenity", value: "car_repair" },
    { category: "body-shop", key: "craft", value: "car_painter" },
    { category: "body-shop", key: "shop", value: "car_body_repair" },
    { category: "body-shop", key: "amenity", value: "car_service" },
    { category: "insurance", key: "office", value: "insurance" },
    { category: "insurance", key: "office", value: "financial" },
    { category: "rental", key: "amenity", value: "car_rental" },
    { category: "rental", key: "shop", value: "car_rental" },
  ],
  shop: [
    { category: "body-shop", key: "shop", value: "car_repair" },
    { category: "body-shop", key: "amenity", value: "car_repair" },
    { category: "body-shop", key: "craft", value: "car_painter" },
    { category: "body-shop", key: "shop", value: "car_body_repair" },
    { category: "body-shop", key: "amenity", value: "car_service" },
    { category: "body-shop", key: "craft", value: "metalconstruction" },
    { category: "supplier", key: "shop", value: "car_parts" },
    { category: "supplier", key: "shop", value: "tyres" },
    { category: "supplier", key: "shop", value: "automotive" },
    { category: "fuel", key: "amenity", value: "fuel" },
  ],
};

function getCategoryLabel(category: NavigationDiscoveryCategory) {
  if (category === "insurance") {
    return "Insurance office";
  }

  if (category === "fuel") {
    return "Fuel stop";
  }

  if (category === "rental") {
    return "Rental car";
  }

  if (category === "supplier") {
    return "Supplier";
  }

  return "Body shop";
}

function buildOverpassQuery(
  center: NavigationCoordinate,
  radiusMeters: number,
  role: NavigationDiscoveryRole
) {
  const rules = discoveryRulesByRole[role];
  const selectors = rules
    .map(
      (rule) =>
        `node["${rule.key}"="${rule.value}"](around:${radiusMeters},${center.lat},${center.lng});way["${rule.key}"="${rule.value}"](around:${radiusMeters},${center.lat},${center.lng});relation["${rule.key}"="${rule.value}"](around:${radiusMeters},${center.lat},${center.lng});`
    )
    .join("");

  return `[out:json][timeout:18];(${selectors});out center 18;`;
}

function getCategoryResultLimits(role: NavigationDiscoveryRole) {
  if (role === "shop") {
    return {
      "body-shop": 8,
      supplier: 5,
      fuel: 2,
    } satisfies Partial<Record<NavigationDiscoveryCategory, number>>;
  }

  if (role === "insurer") {
    return {
      "body-shop": 8,
      insurance: 4,
      rental: 3,
    } satisfies Partial<Record<NavigationDiscoveryCategory, number>>;
  }

  return {
    "body-shop": 8,
    rental: 3,
    fuel: 3,
  } satisfies Partial<Record<NavigationDiscoveryCategory, number>>;
}

function resolveCoordinate(element: OverpassElement): NavigationCoordinate | null {
  if (typeof element.lat === "number" && typeof element.lon === "number") {
    return {
      lat: element.lat,
      lng: element.lon,
    };
  }

  if (
    element.center &&
    typeof element.center.lat === "number" &&
    typeof element.center.lon === "number"
  ) {
    return {
      lat: element.center.lat,
      lng: element.center.lon,
    };
  }

  return null;
}

function resolveCategory(tags: Record<string, string> | undefined, role: NavigationDiscoveryRole) {
  if (!tags) {
    return null;
  }

  const matchingRule = discoveryRulesByRole[role].find((rule) => tags[rule.key] === rule.value);
  return matchingRule?.category || null;
}

function buildSubtitle(
  tags: Record<string, string> | undefined,
  category: NavigationDiscoveryCategory
) {
  if (!tags) {
    return getCategoryLabel(category);
  }

  const addressParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
    tags["addr:state"],
  ].filter(Boolean);

  if (addressParts.length > 0) {
    return addressParts.join(" ");
  }

  const phone = tags.phone || tags["contact:phone"];
  if (phone) {
    return `${getCategoryLabel(category)} • ${phone}`;
  }

  return getCategoryLabel(category);
}

function dedupePlaces(places: NavigationDiscoveryPlace[]) {
  const seen = new Set<string>();
  let dedupedCount = 0;

  const dedupedPlaces = places.filter((place) => {
    const key = `${place.label.toLowerCase()}|${place.coordinate.lat.toFixed(4)}|${place.coordinate.lng.toFixed(4)}`;

    if (seen.has(key)) {
      dedupedCount += 1;
      return false;
    }

    seen.add(key);
    return true;
  });

  return {
    places: dedupedPlaces,
    dedupedCount,
  };
}

function applyCategoryDiversity(places: NavigationDiscoveryPlace[], role: NavigationDiscoveryRole) {
  const categoryLimits = getCategoryResultLimits(role);
  const selected: NavigationDiscoveryPlace[] = [];
  const overflow: NavigationDiscoveryPlace[] = [];
  const counts = new Map<NavigationDiscoveryCategory, number>();

  for (const place of places) {
    const currentCount = counts.get(place.category) || 0;
    const categoryLimit = categoryLimits[place.category] ?? MAX_DISCOVERY_RESULTS;

    if (currentCount < categoryLimit) {
      counts.set(place.category, currentCount + 1);
      selected.push(place);
      continue;
    }

    overflow.push(place);
  }

  const finalPlaces = [...selected, ...overflow].slice(0, MAX_DISCOVERY_RESULTS);

  return {
    places: finalPlaces,
    trimmedCount: Math.max(0, places.length - finalPlaces.length),
  };
}

function persistDiscoveryQualitySnapshot(snapshot: DiscoveryQualitySnapshot) {
  latestDiscoveryQualitySnapshot = snapshot;
  writePersistedState(discoveryQualityStorageKey, discoveryQualityStorageVersion, snapshot);
}

function normalizeNonNegativeInteger(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}

function normalizeRadiusMiles(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0.5, Math.min(50, Number(value.toFixed(2))));
}

function normalizeIsoTimestamp(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const parsedMs = Date.parse(value);

  if (Number.isNaN(parsedMs)) {
    return null;
  }

  return new Date(parsedMs).toISOString();
}

function normalizeDiscoveryRole(value: unknown): NavigationDiscoveryRole | null {
  if (value === "customer" || value === "insurer" || value === "shop") {
    return value;
  }

  return null;
}

function toValidatedDiscoveryQualitySnapshot(raw: unknown): DiscoveryQualitySnapshot | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  const generatedAt = normalizeIsoTimestamp(candidate.generatedAt);
  const role = normalizeDiscoveryRole(candidate.role);
  const radiusMiles = normalizeRadiusMiles(candidate.radiusMiles);
  const sourceElementCount = normalizeNonNegativeInteger(candidate.sourceElementCount);
  const acceptedCount = normalizeNonNegativeInteger(candidate.acceptedCount);
  const acceptedVerifiedCount = normalizeNonNegativeInteger(candidate.acceptedVerifiedCount);
  const acceptedStandardCount = normalizeNonNegativeInteger(candidate.acceptedStandardCount);
  const acceptedLimitedCount = normalizeNonNegativeInteger(candidate.acceptedLimitedCount);
  const acceptedBodyShopCount = normalizeNonNegativeInteger(candidate.acceptedBodyShopCount);
  const acceptedInsuranceCount = normalizeNonNegativeInteger(candidate.acceptedInsuranceCount);
  const acceptedFuelCount = normalizeNonNegativeInteger(candidate.acceptedFuelCount);
  const acceptedRentalCount = normalizeNonNegativeInteger(candidate.acceptedRentalCount);
  const acceptedSupplierCount = normalizeNonNegativeInteger(candidate.acceptedSupplierCount);
  const limitedAcceptanceRatePct = normalizeNonNegativeInteger(candidate.limitedAcceptanceRatePct);
  const rejectedMissingCoordinateCount = normalizeNonNegativeInteger(
    candidate.rejectedMissingCoordinateCount
  );
  const rejectedMissingCategoryCount = normalizeNonNegativeInteger(
    candidate.rejectedMissingCategoryCount
  );
  const rejectedMissingLabelCount = normalizeNonNegativeInteger(
    candidate.rejectedMissingLabelCount
  );
  const rejectedBelowQualityThresholdCount = normalizeNonNegativeInteger(
    candidate.rejectedBelowQualityThresholdCount
  );
  const dedupedCount = normalizeNonNegativeInteger(candidate.dedupedCount);
  const trimmedByCategoryDiversityCount = normalizeNonNegativeInteger(
    candidate.trimmedByCategoryDiversityCount
  );
  const minimumQualityScore = normalizeNonNegativeInteger(candidate.minimumQualityScore);

  if (
    generatedAt === null ||
    role === null ||
    radiusMiles === null ||
    sourceElementCount === null ||
    acceptedCount === null ||
    acceptedVerifiedCount === null ||
    acceptedStandardCount === null ||
    acceptedLimitedCount === null ||
    acceptedBodyShopCount === null ||
    acceptedInsuranceCount === null ||
    acceptedFuelCount === null ||
    acceptedRentalCount === null ||
    acceptedSupplierCount === null ||
    limitedAcceptanceRatePct === null ||
    rejectedMissingCoordinateCount === null ||
    rejectedMissingCategoryCount === null ||
    rejectedMissingLabelCount === null ||
    rejectedBelowQualityThresholdCount === null ||
    dedupedCount === null ||
    trimmedByCategoryDiversityCount === null ||
    minimumQualityScore === null
  ) {
    return null;
  }

  const sumAcceptedByQuality = acceptedVerifiedCount + acceptedStandardCount + acceptedLimitedCount;
  const sumAcceptedByCategory =
    acceptedBodyShopCount +
    acceptedInsuranceCount +
    acceptedFuelCount +
    acceptedRentalCount +
    acceptedSupplierCount;
  const normalizedAcceptedCount = Math.max(
    acceptedCount,
    sumAcceptedByQuality,
    sumAcceptedByCategory
  );
  const normalizedLimitedRate =
    normalizedAcceptedCount > 0
      ? Math.min(100, Math.round((acceptedLimitedCount / normalizedAcceptedCount) * 100))
      : 0;

  return {
    generatedAt,
    role,
    radiusMiles,
    sourceElementCount,
    acceptedCount: normalizedAcceptedCount,
    acceptedVerifiedCount,
    acceptedStandardCount,
    acceptedLimitedCount,
    acceptedBodyShopCount,
    acceptedInsuranceCount,
    acceptedFuelCount,
    acceptedRentalCount,
    acceptedSupplierCount,
    limitedAcceptanceRatePct: Math.min(
      100,
      Math.max(limitedAcceptanceRatePct, normalizedLimitedRate)
    ),
    rejectedMissingCoordinateCount,
    rejectedMissingCategoryCount,
    rejectedMissingLabelCount,
    rejectedBelowQualityThresholdCount,
    dedupedCount,
    trimmedByCategoryDiversityCount,
    minimumQualityScore: Math.min(100, minimumQualityScore),
  };
}

export function sanitizeDiscoveryQualitySnapshotFromRaw(
  raw: unknown
): DiscoveryQualitySnapshot | null {
  return toValidatedDiscoveryQualitySnapshot(raw);
}

export function getLatestDiscoveryQualitySnapshot(): DiscoveryQualitySnapshot | null {
  if (latestDiscoveryQualitySnapshot) {
    return latestDiscoveryQualitySnapshot;
  }

  const persistedSnapshot = readPersistedState<DiscoveryQualitySnapshot | null>({
    storageKey: discoveryQualityStorageKey,
    storageVersion: discoveryQualityStorageVersion,
    fallback: null,
    validate: (value): value is DiscoveryQualitySnapshot | null =>
      value === null || toValidatedDiscoveryQualitySnapshot(value) !== null,
    normalize: (value) => {
      if (value === null) {
        return null;
      }

      return toValidatedDiscoveryQualitySnapshot(value);
    },
    migrateLegacy: (legacyValue) => toValidatedDiscoveryQualitySnapshot(legacyValue),
  });

  latestDiscoveryQualitySnapshot = persistedSnapshot;
  return persistedSnapshot;
}

export function buildDiscoveryQualitySnapshot(
  args: BuildDiscoveryQualitySnapshotArgs
): DiscoveryQualitySnapshot {
  const {
    role,
    radiusMiles,
    sourceElementCount,
    acceptedPlaces,
    rejectedMissingCoordinateCount,
    rejectedMissingCategoryCount,
    rejectedMissingLabelCount,
    rejectedBelowQualityThresholdCount,
    dedupedCount,
    trimmedByCategoryDiversityCount,
    minimumQualityScore,
    generatedAt,
  } = args;

  const acceptedVerifiedCount = acceptedPlaces.filter(
    (place) => place.qualityLabel === "verified"
  ).length;
  const acceptedStandardCount = acceptedPlaces.filter(
    (place) => place.qualityLabel === "standard"
  ).length;
  const acceptedLimitedCount = acceptedPlaces.filter(
    (place) => place.qualityLabel === "limited"
  ).length;
  const acceptedBodyShopCount = acceptedPlaces.filter(
    (place) => place.category === "body-shop"
  ).length;
  const acceptedInsuranceCount = acceptedPlaces.filter(
    (place) => place.category === "insurance"
  ).length;
  const acceptedFuelCount = acceptedPlaces.filter((place) => place.category === "fuel").length;
  const acceptedRentalCount = acceptedPlaces.filter((place) => place.category === "rental").length;
  const acceptedSupplierCount = acceptedPlaces.filter(
    (place) => place.category === "supplier"
  ).length;
  const limitedAcceptanceRatePct =
    acceptedPlaces.length > 0
      ? Math.round((acceptedLimitedCount / acceptedPlaces.length) * 100)
      : 0;

  return {
    generatedAt: generatedAt || new Date().toISOString(),
    role,
    radiusMiles,
    sourceElementCount,
    acceptedCount: acceptedPlaces.length,
    acceptedVerifiedCount,
    acceptedStandardCount,
    acceptedLimitedCount,
    acceptedBodyShopCount,
    acceptedInsuranceCount,
    acceptedFuelCount,
    acceptedRentalCount,
    acceptedSupplierCount,
    limitedAcceptanceRatePct,
    rejectedMissingCoordinateCount,
    rejectedMissingCategoryCount,
    rejectedMissingLabelCount,
    rejectedBelowQualityThresholdCount,
    dedupedCount,
    trimmedByCategoryDiversityCount,
    minimumQualityScore,
  };
}

function scorePlaceQuality(tags: Record<string, string> | undefined, distanceMiles: number) {
  if (!tags) {
    return 20;
  }

  let score = 35;

  if (tags.name || tags.brand) {
    score += 20;
  }

  if (tags["addr:street"] || tags["addr:city"]) {
    score += 12;
  }

  if (tags.phone || tags["contact:phone"]) {
    score += 10;
  }

  if (tags.website || tags["contact:website"]) {
    score += 10;
  }

  if (tags["opening_hours"]) {
    score += 8;
  }

  // Bonus for service-confirming tags that indicate real operational body shops
  if (
    tags["service:vehicle:bodywork"] === "yes" ||
    tags["service:vehicle:painting"] === "yes" ||
    tags["service:vehicle:collision"] === "yes"
  ) {
    score += 12;
  }

  // Bonus for operator tag (chain/franchise entries tend to be more complete)
  if (tags.operator) {
    score += 6;
  }

  // Bonus for email contact
  if (tags.email || tags["contact:email"]) {
    score += 5;
  }

  // Graduated distance penalty
  if (distanceMiles > 20) {
    score -= 18;
  } else if (distanceMiles > 12) {
    score -= 10;
  } else if (distanceMiles > 6) {
    score -= 4;
  }

  return Math.max(0, Math.min(100, score));
}

function toQualityLabel(score: number): "verified" | "standard" | "limited" {
  if (score >= 80) {
    return "verified";
  }

  if (score >= 60) {
    return "standard";
  }

  return "limited";
}

export async function fetchNearbyDiscoveryPlaces({
  center,
  role,
  radiusMiles,
  signal,
}: FetchNearbyDiscoveryPlacesArgs): Promise<NavigationDiscoveryPlace[]> {
  const isProduction = typeof import.meta !== "undefined" && Boolean(import.meta.env.PROD);
  const minimumQualityScore = isProduction ? 55 : 0;
  const radiusMeters = Math.max(1500, Math.min(Math.round(radiusMiles * 1609.34), 16000));
  const response = await runWithProviderHealth("overpass-discovery", () =>
    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: `data=${encodeURIComponent(buildOverpassQuery(center, radiusMeters, role))}`,
      signal,
    })
  );

  if (!response.ok) {
    throw new Error("Live place discovery is temporarily unavailable.");
  }

  const payload = (await response.json()) as { elements?: OverpassElement[] };
  const elements = payload.elements || [];
  let rejectedMissingCoordinateCount = 0;
  let rejectedMissingCategoryCount = 0;
  let rejectedMissingLabelCount = 0;
  let rejectedBelowQualityThresholdCount = 0;

  const acceptedPlaces: NavigationDiscoveryPlace[] = [];

  for (const element of elements) {
    const coordinate = resolveCoordinate(element);
    if (!coordinate) {
      rejectedMissingCoordinateCount += 1;
      continue;
    }

    const category = resolveCategory(element.tags, role);
    if (!category) {
      rejectedMissingCategoryCount += 1;
      continue;
    }

    const label = element.tags?.name || element.tags?.brand || element.tags?.operator;
    if (!label) {
      rejectedMissingLabelCount += 1;
      continue;
    }

    const distanceMiles = haversineMiles(center, coordinate);
    const qualityScore = scorePlaceQuality(element.tags, distanceMiles);

    if (qualityScore < minimumQualityScore) {
      rejectedBelowQualityThresholdCount += 1;
      continue;
    }

    acceptedPlaces.push({
      id: `${element.type}-${element.id}`,
      label,
      subtitle: buildSubtitle(element.tags, category),
      category,
      qualityLabel: toQualityLabel(qualityScore),
      qualityScore,
      coordinate,
      distanceMiles,
      source: "overpass" as const,
      phoneNumber: element.tags?.phone || element.tags?.["contact:phone"],
      website: element.tags?.website || element.tags?.["contact:website"],
    });
  }

  const rankedPlaces = acceptedPlaces.sort((left, right) => {
    // Quality-weighted sort: combine distance rank and quality score so nearby
    // high-quality results beat distant low-quality ones, while not burying
    // good results just because they are a mile further away.
    const leftRank = left.distanceMiles - left.qualityScore * 0.04;
    const rightRank = right.distanceMiles - right.qualityScore * 0.04;
    return leftRank - rightRank;
  });

  const dedupeResult = dedupePlaces(rankedPlaces);
  const diversityResult = applyCategoryDiversity(dedupeResult.places, role);
  const finalPlaces = diversityResult.places;

  persistDiscoveryQualitySnapshot(
    buildDiscoveryQualitySnapshot({
      role,
      radiusMiles,
      sourceElementCount: elements.length,
      acceptedPlaces: finalPlaces,
      rejectedMissingCoordinateCount,
      rejectedMissingCategoryCount,
      rejectedMissingLabelCount,
      rejectedBelowQualityThresholdCount,
      dedupedCount: dedupeResult.dedupedCount,
      trimmedByCategoryDiversityCount: diversityResult.trimmedCount,
      minimumQualityScore,
    })
  );

  return finalPlaces;
}
