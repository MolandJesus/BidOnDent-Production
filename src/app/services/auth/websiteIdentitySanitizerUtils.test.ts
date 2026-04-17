import { describe, expect, it } from "vitest";

import {
  MAP_THEMES,
  deepEqual,
  isAllowedValue,
  sanitizeCoordinates,
  sanitizeRecentSearch,
  sanitizeSavedPlace,
  sanitizeSearchFilters,
  sanitizeStringArray,
  sanitizeViewportBounds,
} from "./websiteIdentitySanitizerUtils";

describe("websiteIdentitySanitizerUtils", () => {
  it("compares nested arrays and records with deepEqual", () => {
    expect(
      deepEqual({ a: 1, b: ["north", { c: true }] }, { a: 1, b: ["north", { c: true }] })
    ).toBe(true);
    expect(
      deepEqual({ a: 1, b: ["north", { c: true }] }, { a: 1, b: ["north", { c: false }] })
    ).toBe(false);
  });

  it("accepts allowed values and removes empty string duplicates", () => {
    expect(isAllowedValue(MAP_THEMES, "dark")).toBe(true);
    expect(isAllowedValue(MAP_THEMES, "neon")).toBe(false);
    expect(sanitizeStringArray(["collision", "", "collision", "ev"])).toEqual(["collision", "ev"]);
  });

  it("sanitizes only valid coordinates and viewport bounds", () => {
    expect(sanitizeCoordinates({ latitude: 33.75, longitude: -84.39 })).toEqual({
      latitude: 33.75,
      longitude: -84.39,
    });
    expect(sanitizeCoordinates({ latitude: 120, longitude: -84.39 })).toBeUndefined();

    expect(sanitizeViewportBounds({ north: 34, south: 33, east: -84, west: -85 })).toEqual({
      north: 34,
      south: 33,
      east: -84,
      west: -85,
    });
    expect(sanitizeViewportBounds({ north: 33, south: 34, east: -84, west: -85 })).toBeUndefined();
  });

  it("builds a saved place only when the required fields are valid", () => {
    expect(
      sanitizeSavedPlace({
        id: "place-1",
        label: "Home",
        isFavorite: true,
        createdAt: "2026-04-03T12:00:00.000Z",
        lastUsedAt: "2026-04-03T12:30:00.000Z",
        name: "Home",
        address: "123 Peachtree St NE",
        city: "Atlanta",
        state: "GA",
        zipCode: "30309",
        latitude: 33.781,
        longitude: -84.384,
        metadata: { icon: "house", category: "home" },
      })
    ).toEqual({
      id: "place-1",
      label: "Home",
      isFavorite: true,
      createdAt: "2026-04-03T12:00:00.000Z",
      lastUsedAt: "2026-04-03T12:30:00.000Z",
      name: "Home",
      address: "123 Peachtree St NE",
      city: "Atlanta",
      state: "GA",
      zipCode: "30309",
      latitude: 33.781,
      longitude: -84.384,
      metadata: { icon: "house", category: "home" },
    });

    expect(
      sanitizeSavedPlace({
        id: "place-2",
        label: "Broken",
        isFavorite: true,
        createdAt: "invalid",
        lastUsedAt: "2026-04-03T12:30:00.000Z",
        name: "Broken",
        address: "123 Peachtree St NE",
        city: "Atlanta",
        state: "GA",
        zipCode: "30309",
        latitude: 33.781,
        longitude: -84.384,
      })
    ).toBeNull();
  });

  it("keeps only valid recent-search and filter fields", () => {
    expect(
      sanitizeRecentSearch({
        query: "dent repair",
        timestamp: "2026-04-03T14:00:00.000Z",
        origin: {
          name: "Office",
          address: "999 Peachtree St NE",
          city: "Atlanta",
          state: "GA",
          zipCode: "30309",
          latitude: 33.781,
          longitude: -84.383,
          placeId: "place-3",
        },
        resultCount: 5,
      })
    ).toEqual({
      query: "dent repair",
      timestamp: "2026-04-03T14:00:00.000Z",
      origin: {
        name: "Office",
        address: "999 Peachtree St NE",
        city: "Atlanta",
        state: "GA",
        zipCode: "30309",
        latitude: 33.781,
        longitude: -84.383,
        placeId: "place-3",
      },
      resultCount: 5,
    });

    expect(
      sanitizeSearchFilters({
        maxDistanceMiles: 25,
        minRating: 4.5,
        serviceTypes: ["collision", "", "collision", "ev"],
        insurerPrograms: ["DRP", "DRP", "Network"],
        vehicleTypes: ["SUV", "EV"],
        searchWithinViewport: true,
        openNow: false,
        hasAvailability: true,
      })
    ).toEqual({
      maxDistanceMiles: 25,
      minRating: 4.5,
      serviceTypes: ["collision", "ev"],
      insurerPrograms: ["DRP", "Network"],
      vehicleTypes: ["SUV", "EV"],
      searchWithinViewport: true,
      openNow: false,
      hasAvailability: true,
    });
  });

  it("drops invalid filter payloads instead of persisting bad search state", () => {
    expect(
      sanitizeSearchFilters({
        maxDistanceMiles: 0,
        minRating: 9,
        serviceTypes: ["", ""],
      })
    ).toBeUndefined();
  });
});
