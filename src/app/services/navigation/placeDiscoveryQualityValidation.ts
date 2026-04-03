import type { NavigationDiscoveryRole } from "./placeDiscovery";
import type { DiscoveryQualitySnapshot } from "./placeDiscoveryQuality";

// ── Normalize helpers ───────────────────────────────────────────────

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

// ── Snapshot validation ─────────────────────────────────────────────

export function toValidatedDiscoveryQualitySnapshot(raw: unknown): DiscoveryQualitySnapshot | null {
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
