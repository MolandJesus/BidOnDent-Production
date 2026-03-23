/**
 * placeDiscoveryQuality — Quality scoring, validation, snapshot persistence,
 * and normalization for the place discovery system.
 *
 * Extracted from placeDiscovery.ts (Pass 28). Zero behavior change.
 */

import type { NavigationDiscoveryPlace, NavigationDiscoveryRole } from "./placeDiscovery";
import { readPersistedState, writePersistedState } from "./persistedState";

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

const discoveryQualityStorageKey = "bidondent-navigation-discovery-quality-snapshot-v1";
const discoveryQualityStorageVersion = 2;

let latestDiscoveryQualitySnapshot: DiscoveryQualitySnapshot | null = null;

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

export function persistDiscoveryQualitySnapshot(snapshot: DiscoveryQualitySnapshot) {
  latestDiscoveryQualitySnapshot = snapshot;
  writePersistedState(discoveryQualityStorageKey, discoveryQualityStorageVersion, snapshot);
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

export function scorePlaceQuality(tags: Record<string, string> | undefined, distanceMiles: number) {
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

export function toQualityLabel(score: number): "verified" | "standard" | "limited" {
  if (score >= 80) {
    return "verified";
  }

  if (score >= 60) {
    return "standard";
  }

  return "limited";
}
