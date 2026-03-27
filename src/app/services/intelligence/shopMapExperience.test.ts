import { describe, expect, it } from "vitest";
import {
  applyShopMapListingFilters,
  buildShopMapFilterCatalog,
  type ShopMapListing,
} from "./shopMapExperience";

/** Minimal listing factory — only the fields filter logic inspects. */
function makeListing(overrides: Partial<ShopMapListing> & { id: number }): ShopMapListing {
  return {
    name: `Shop ${overrides.id}`,
    rating: 4.5,
    reviews: 50,
    specialties: ["PDR", "Paint"],
    insurerPrograms: ["GEICO"],
    supportedVehicleTypes: ["sedan"],
    recommendationScore: 80,
    mapDistanceMiles: 5,
    mapDistanceLabel: "5.0 mi",
    topPick: false,
    distanceMiles: 5,
    image: "",
    certifications: [],
    responseTimeHours: 24,
    completionRate: 95,
    supportedMakes: [],
    aiSummary: "",
    insuranceCompatibilityScore: 80,
    mapResult: {
      id: overrides.id,
      name: `Shop ${overrides.id}`,
      coordinates: { latitude: 40.93, longitude: -73.9 },
      address: "123 Main St",
      city: "Yonkers",
      state: "NY",
      zipCode: "10701",
      distanceMiles: 5,
      rating: 4.5,
      reviews: 50,
      image: "",
      certifications: [],
      responseTimeHours: 24,
      completionRate: 95,
      specialties: [],
      supportedMakes: [],
      insurerPrograms: [],
      aiSummary: "",
      matchScore: 80,
      insuranceCompatibilityScore: 80,
    },
    ...overrides,
  } as ShopMapListing;
}

describe("applyShopMapListingFilters", () => {
  const listings = [
    makeListing({
      id: 1,
      rating: 4.8,
      mapDistanceMiles: 3,
      specialties: ["PDR", "Paint"],
      insurerPrograms: ["GEICO", "State Farm"],
    }),
    makeListing({
      id: 2,
      rating: 3.5,
      mapDistanceMiles: 10,
      specialties: ["Frame"],
      insurerPrograms: ["GEICO"],
    }),
    makeListing({
      id: 3,
      rating: 4.2,
      mapDistanceMiles: 7,
      specialties: ["PDR"],
      insurerPrograms: ["Allstate"],
    }),
  ];

  it("returns all listings when no filters applied", () => {
    const result = applyShopMapListingFilters({ listings });
    expect(result).toHaveLength(3);
  });

  it("filters by minimum rating", () => {
    const result = applyShopMapListingFilters({
      listings,
      filters: { minRating: 4.0 },
    });
    expect(result).toHaveLength(2);
    expect(result.map((l) => l.mapResult.id)).toEqual([1, 3]);
  });

  it("filters by max distance", () => {
    const result = applyShopMapListingFilters({
      listings,
      filters: { maxDistanceMiles: 5 },
    });
    expect(result).toHaveLength(1);
    expect(result[0].mapResult.id).toBe(1);
  });

  it("filters by service types", () => {
    const result = applyShopMapListingFilters({
      listings,
      filters: { serviceTypes: ["Frame"] },
    });
    expect(result).toHaveLength(1);
    expect(result[0].mapResult.id).toBe(2);
  });

  it("filters by insurer programs", () => {
    const result = applyShopMapListingFilters({
      listings,
      filters: { insurerPrograms: ["Allstate"] },
    });
    expect(result).toHaveLength(1);
    expect(result[0].mapResult.id).toBe(3);
  });

  it("combines multiple filters (AND logic)", () => {
    const result = applyShopMapListingFilters({
      listings,
      filters: { minRating: 4.0, insurerPrograms: ["GEICO"] },
    });
    expect(result).toHaveLength(1);
    expect(result[0].mapResult.id).toBe(1);
  });

  it("filters by viewport bounds when searchWithinViewport is true", () => {
    const listingsWithCoords = [
      makeListing({
        id: 1,
        mapResult: { ...listings[0].mapResult, coordinates: { latitude: 40.93, longitude: -73.9 } },
      }),
      makeListing({
        id: 2,
        mapResult: { ...listings[1].mapResult, coordinates: { latitude: 41.5, longitude: -74.0 } },
      }),
    ];
    const result = applyShopMapListingFilters({
      listings: listingsWithCoords,
      filters: { searchWithinViewport: true },
      viewportBounds: { north: 41.0, south: 40.8, east: -73.8, west: -74.0 },
    });
    expect(result).toHaveLength(1);
    expect(result[0].mapResult.id).toBe(1);
  });

  it("ignores viewport bounds when searchWithinViewport is false", () => {
    const result = applyShopMapListingFilters({
      listings,
      filters: { searchWithinViewport: false },
      viewportBounds: { north: 0, south: 0, east: 0, west: 0 },
    });
    expect(result).toHaveLength(3);
  });

  it("marks first result as topPick", () => {
    const result = applyShopMapListingFilters({ listings });
    expect(result[0].topPick).toBe(true);
    expect(result[1].topPick).toBe(false);
    expect(result[2].topPick).toBe(false);
  });

  it("ignores minRating of 0", () => {
    const result = applyShopMapListingFilters({
      listings,
      filters: { minRating: 0 },
    });
    expect(result).toHaveLength(3);
  });

  it("ignores maxDistanceMiles of 0", () => {
    const result = applyShopMapListingFilters({
      listings,
      filters: { maxDistanceMiles: 0 },
    });
    expect(result).toHaveLength(3);
  });

  it("returns empty array when no listings match", () => {
    const result = applyShopMapListingFilters({
      listings,
      filters: { minRating: 5.0 },
    });
    expect(result).toHaveLength(0);
  });
});

describe("buildShopMapFilterCatalog", () => {
  it("extracts unique filter options sorted by frequency", () => {
    const listings = [
      makeListing({
        id: 1,
        specialties: ["PDR", "Paint"],
        insurerPrograms: ["GEICO"],
        supportedVehicleTypes: ["sedan", "SUV"],
      }),
      makeListing({
        id: 2,
        specialties: ["PDR", "Frame"],
        insurerPrograms: ["GEICO", "State Farm"],
        supportedVehicleTypes: ["sedan"],
      }),
      makeListing({
        id: 3,
        specialties: ["Paint"],
        insurerPrograms: ["Allstate"],
        supportedVehicleTypes: ["truck"],
      }),
    ];
    const catalog = buildShopMapFilterCatalog(listings);

    // PDR and Paint both appear 2x — alphabetical tiebreak puts Paint first
    expect(catalog.serviceTypes[0]).toBe("Paint");
    expect(catalog.serviceTypes[1]).toBe("PDR");
    expect(catalog.insurerPrograms[0]).toBe("GEICO");
    expect(catalog.vehicleTypes[0]).toBe("sedan");
  });

  it("returns empty arrays for empty listings", () => {
    const catalog = buildShopMapFilterCatalog([]);
    expect(catalog.insurerPrograms).toEqual([]);
    expect(catalog.serviceTypes).toEqual([]);
    expect(catalog.vehicleTypes).toEqual([]);
  });
});
