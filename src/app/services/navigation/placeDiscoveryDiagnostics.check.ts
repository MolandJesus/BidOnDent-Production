import {
  buildDiscoveryQualitySnapshot,
  sanitizeDiscoveryQualitySnapshotFromRaw,
  type NavigationDiscoveryPlace,
} from "./placeDiscovery";

function basePlace(overrides: Partial<NavigationDiscoveryPlace>): NavigationDiscoveryPlace {
  return {
    id: "node-1",
    label: "Auto Body One",
    subtitle: "Body shop",
    category: "body-shop",
    qualityLabel: "verified",
    qualityScore: 92,
    coordinate: { lat: 40.7128, lng: -74.006 },
    distanceMiles: 2.4,
    source: "overpass",
    ...overrides,
  };
}

export function runPlaceDiscoveryDiagnosticsChecks() {
  const snapshot = buildDiscoveryQualitySnapshot({
    role: "customer",
    radiusMiles: 10,
    sourceElementCount: 24,
    acceptedPlaces: [
      basePlace({ id: "node-1", qualityLabel: "verified", category: "body-shop" }),
      basePlace({ id: "node-2", qualityLabel: "standard", category: "fuel" }),
      basePlace({ id: "node-3", qualityLabel: "limited", category: "rental" }),
      basePlace({ id: "node-4", qualityLabel: "limited", category: "supplier" }),
    ],
    rejectedMissingCoordinateCount: 3,
    rejectedMissingCategoryCount: 2,
    rejectedMissingLabelCount: 1,
    rejectedBelowQualityThresholdCount: 5,
    dedupedCount: 2,
    trimmedByCategoryDiversityCount: 1,
    minimumQualityScore: 55,
    generatedAt: "2026-03-21T12:00:00.000Z",
  });

  console.assert(snapshot.acceptedCount === 4, "Accepted count should reflect accepted places");
  console.assert(
    snapshot.acceptedVerifiedCount === 1 && snapshot.acceptedStandardCount === 1,
    "Quality-tier counters should be deterministic"
  );
  console.assert(snapshot.acceptedLimitedCount === 2, "Limited counter should be deterministic");
  console.assert(
    snapshot.acceptedBodyShopCount === 1 && snapshot.acceptedFuelCount === 1,
    "Category counters should be deterministic"
  );
  console.assert(
    snapshot.acceptedRentalCount === 1,
    "Rental category count should be deterministic"
  );
  console.assert(
    snapshot.acceptedSupplierCount === 1,
    "Supplier category count should be deterministic"
  );
  console.assert(snapshot.limitedAcceptanceRatePct === 50, "Limited acceptance rate should be 50%");

  const malformedRawSnapshot: unknown = {
    role: "customer",
    generatedAt: "not-a-date",
    acceptedCount: "many",
  };
  const malformedSanitized = sanitizeDiscoveryQualitySnapshotFromRaw(malformedRawSnapshot);
  console.assert(malformedSanitized === null, "Malformed snapshots should be discarded");

  const skewedRawSnapshot: unknown = {
    generatedAt: "2026-03-21T12:00:00.000Z",
    role: "shop",
    radiusMiles: 12,
    sourceElementCount: 20,
    acceptedCount: 1,
    acceptedVerifiedCount: 2,
    acceptedStandardCount: 1,
    acceptedLimitedCount: 1,
    acceptedBodyShopCount: 1,
    acceptedInsuranceCount: 1,
    acceptedFuelCount: 1,
    acceptedRentalCount: 0,
    acceptedSupplierCount: 0,
    limitedAcceptanceRatePct: 10,
    rejectedMissingCoordinateCount: 2,
    rejectedMissingCategoryCount: 0,
    rejectedMissingLabelCount: 0,
    rejectedBelowQualityThresholdCount: 2,
    dedupedCount: 1,
    trimmedByCategoryDiversityCount: 0,
    minimumQualityScore: 55,
  };

  const skewedSanitized = sanitizeDiscoveryQualitySnapshotFromRaw(skewedRawSnapshot);
  console.assert(skewedSanitized !== null, "Recoverable skewed snapshots should normalize");
  console.assert(
    skewedSanitized?.acceptedCount === 4,
    "Accepted count should normalize to quality/category totals when legacy values drift"
  );
  console.assert(
    skewedSanitized?.limitedAcceptanceRatePct === 25,
    "Limited acceptance rate should normalize from corrected accepted total"
  );

  return {
    snapshot,
    malformedSanitized,
    skewedSanitized,
  };
}
