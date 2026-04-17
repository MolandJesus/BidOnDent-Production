import { describe, expect, it } from "vitest";

import type { Coordinates, MapViewportBounds } from "../../types/mapDomain";
import {
  buildMapListingFromRecommendation,
  buildRoleAwareMapHighlights,
  isWithinViewportBounds,
  matchesSelection,
  sortListings,
  sortValuesByFrequency,
  withAdjustedTopPick,
} from "./shopMapExperienceHelpers";

function createRecommendation(overrides?: Record<string, unknown>) {
  return {
    id: 101,
    name: "Hudson Dent Works",
    rating: 4.8,
    reviews: 142,
    distanceMiles: 6.4,
    distanceLabel: "6.4 mi",
    certifications: ["I-CAR Gold"],
    specialties: ["Dent repair", "ADAS calibration"],
    supportedVehicleTypes: ["Daily Driver", "SUV"],
    supportedMakes: ["Tesla", "Ford"],
    insurerPrograms: ["Progressive", "State Farm", "Geico"],
    averagePriceLabel: "$1,200",
    averagePriceValue: 1200,
    completionRate: 97,
    responseTimeHours: 2,
    responseTimeLabel: "< 2 hours",
    image: "https://cdn.example.com/shop.png",
    categoryRatings: {
      quality: 4.9,
      service: 4.8,
      timeliness: 4.7,
      value: 4.5,
    },
    capabilityTags: ["dent-repair", "adas-calibration"],
    serviceArea: "Yonkers NY",
    capacityBand: "balanced" as const,
    aiSummary: "Strong ADAS and dent repair fit.",
    recommendationScore: 93,
    insuranceCompatibilityScore: 88,
    matchReasons: ["Carrier overlap", "Tesla support", "ADAS match"],
    topPick: false,
    ...overrides,
  };
}

describe("shopMapExperienceHelpers", () => {
  it("sorts values by frequency while keeping comparisons case-insensitive", () => {
    expect(sortValuesByFrequency(["Tesla", "Ford", "tesla", "BMW", "Tesla", "ford", "  "])).toEqual(
      ["Tesla", "Ford", "BMW"]
    );
  });

  it("matches selections case-insensitively and checks viewport bounds inclusively", () => {
    expect(matchesSelection(["Tesla", "Ford"], ["tesla"])).toBe(true);
    expect(matchesSelection(["Tesla", "Ford"], ["rivian"])).toBe(false);
    expect(matchesSelection(["Tesla", "Ford"], undefined)).toBe(true);

    const viewport: MapViewportBounds = {
      north: 41.2,
      south: 40.8,
      east: -73.6,
      west: -74.1,
    };
    const inside: Coordinates = { latitude: 40.95, longitude: -73.9 };
    const onEdge: Coordinates = { latitude: 41.2, longitude: -74.1 };
    const outside: Coordinates = { latitude: 41.3, longitude: -73.9 };

    expect(isWithinViewportBounds(inside, viewport)).toBe(true);
    expect(isWithinViewportBounds(onEdge, viewport)).toBe(true);
    expect(isWithinViewportBounds(outside, viewport)).toBe(false);
  });

  it("builds map listings from recommendations and sorts them by the requested strategy", () => {
    const listingA = buildMapListingFromRecommendation(
      createRecommendation({
        id: 101,
        name: "Hudson Dent Works",
        distanceMiles: 10,
        recommendationScore: 90,
      }),
      {
        coordinates: { latitude: 40.9312, longitude: -73.899 },
        address: "42 McLean Ave",
        city: "Yonkers",
        state: "NY",
        zipCode: "10705",
      },
      {
        name: "White Plains",
        address: "255 Main St",
        city: "White Plains",
        state: "NY",
        zipCode: "10601",
        latitude: 41.0534,
        longitude: -73.7629,
      }
    );
    const listingB = buildMapListingFromRecommendation(
      createRecommendation({
        id: 202,
        name: "North County Auto",
        rating: 4.5,
        reviews: 220,
        recommendationScore: 84,
      }),
      {
        coordinates: { latitude: 41.0534, longitude: -73.7629 },
        address: "180 Main St",
        city: "White Plains",
        state: "NY",
        zipCode: "10601",
      },
      {
        name: "Yonkers",
        address: "40 S Broadway",
        city: "Yonkers",
        state: "NY",
        zipCode: "10701",
        latitude: 40.9312,
        longitude: -73.8988,
      }
    );

    expect(listingA.mapResult).toEqual(
      expect.objectContaining({
        id: 101,
        name: "Hudson Dent Works",
        city: "Yonkers",
        matchScore: 90,
        insuranceCompatibilityScore: 88,
      })
    );
    expect(listingA.mapDistanceMiles).not.toBe(10);
    expect(listingA.mapDistanceLabel).toMatch(/mi$/);

    expect(sortListings([listingA, listingB], "rating")[0]?.name).toBe("Hudson Dent Works");
    expect(sortListings([listingA, listingB], "reviews")[0]?.name).toBe("North County Auto");
    expect(sortListings([listingA, listingB], "distance")[0]?.mapDistanceMiles).toBeLessThanOrEqual(
      sortListings([listingA, listingB], "distance")[1]?.mapDistanceMiles ?? Infinity
    );
    expect(
      sortListings([listingA, listingB], "smart-match")[0]?.recommendationScore
    ).toBeGreaterThanOrEqual(
      sortListings([listingA, listingB], "smart-match")[1]?.recommendationScore ?? 0
    );
  });

  it("marks only the first listing as top pick after ordering", () => {
    const adjusted = withAdjustedTopPick([
      {
        ...buildMapListingFromRecommendation(createRecommendation({ id: 1, name: "First Shop" }), {
          coordinates: { latitude: 40.9312, longitude: -73.899 },
          address: "42 McLean Ave",
          city: "Yonkers",
          state: "NY",
          zipCode: "10705",
        }),
      },
      {
        ...buildMapListingFromRecommendation(createRecommendation({ id: 2, name: "Second Shop" }), {
          coordinates: { latitude: 41.0534, longitude: -73.7629 },
          address: "180 Main St",
          city: "White Plains",
          state: "NY",
          zipCode: "10601",
        }),
      },
    ]);

    expect(adjusted[0]?.topPick).toBe(true);
    expect(adjusted[1]?.topPick).toBe(false);
  });

  it("builds role-aware map highlights for customer, shop, and insurer views", () => {
    const listings = [
      buildMapListingFromRecommendation(
        createRecommendation({ name: "Hudson Dent Works", averagePriceValue: 1200 }),
        {
          coordinates: { latitude: 40.9312, longitude: -73.899 },
          address: "42 McLean Ave",
          city: "Yonkers",
          state: "NY",
          zipCode: "10705",
        }
      ),
      buildMapListingFromRecommendation(
        createRecommendation({
          id: 202,
          name: "North County Auto",
          averagePriceValue: 900,
          completionRate: 95,
          insurerPrograms: ["Progressive", "State Farm", "Geico", "Allstate"],
        }),
        {
          coordinates: { latitude: 41.0534, longitude: -73.7629 },
          address: "180 Main St",
          city: "White Plains",
          state: "NY",
          zipCode: "10601",
        }
      ),
    ];

    const customer = buildRoleAwareMapHighlights({
      userType: "customer",
      recommendations: listings,
      reports: [
        {
          damageArea: "Front bumper",
          damageAreas: ["hood", "fender"],
          damageType: "dent",
        },
      ],
      connectedCarrierCount: 2,
    });
    expect(customer.badge).toBe("Smart shop matching");
    expect(customer.metrics).toEqual([
      { label: "Connected Carriers", value: "2" },
      { label: "Damage Signals", value: "4" },
    ]);

    const shop = buildRoleAwareMapHighlights({
      userType: "shop",
      recommendations: listings,
      reports: [],
      connectedCarrierCount: 0,
    });
    expect(shop.badge).toBe("Competitive market scout");
    expect(shop.metrics[0]?.label).toBe("Top-3 Avg Ticket");

    const insurer = buildRoleAwareMapHighlights({
      userType: "insurer",
      recommendations: listings,
      reports: [],
      connectedCarrierCount: 0,
    });
    expect(insurer.badge).toBe("Network recruitment view");
    expect(insurer.metrics[0]).toEqual({ label: "Network-Ready", value: "2" });
  });
});
