import { describe, expect, it } from "vitest";

import {
  DEFAULT_MAP_SESSION,
  DEFAULT_MEMORY,
  sanitizeMemory,
  sanitizeWebsiteSessionMemory,
} from "./websiteIdentitySanitizers";

describe("websiteIdentitySanitizers", () => {
  it("falls back to default memory when the payload is missing or malformed", () => {
    expect(sanitizeMemory()).toEqual(DEFAULT_MEMORY);
    expect(sanitizeMemory("bad-payload")).toEqual(DEFAULT_MEMORY);

    expect(
      sanitizeMemory({
        updatedAt: "not-a-date",
        shopDirectory: {
          searchQuery: 42,
          filterRating: 9,
          sortBy: "wrong",
          lastViewedShopId: "abc",
          sessionIntelligenceOpen: "yes",
        },
        insuranceConnection: {
          connectedInsurerIds: ["1", 2, 2, 0, -5],
          draftPolicyNumber: 99,
          draftClaimNumber: null,
          lastSelectedInsurerId: "3",
        },
        mapSession: {
          mapViewMode: "bad-mode",
          mapTheme: "auto",
          showClusters: "yes",
          clusterLevel: "unknown",
          updatedAt: "bad-date",
          lastMapZoom: 30,
          lastViewedShopId: -10,
          savedPlaces: "not-an-array",
          recentSearches: null,
        },
      })
    ).toEqual({
      ...DEFAULT_MEMORY,
      insuranceConnection: {
        ...DEFAULT_MEMORY.insuranceConnection,
        connectedInsurerIds: [1, 2],
      },
      mapSession: {
        ...DEFAULT_MAP_SESSION,
      },
    });
  });

  it("preserves valid nested session data and filters invalid child records", () => {
    const sanitized = sanitizeMemory({
      updatedAt: "2026-04-03T10:00:00.000Z",
      shopDirectory: {
        searchQuery: "Atlanta",
        filterRating: 4.5,
        sortBy: "rating",
        lastViewedShopId: 12,
        sessionIntelligenceOpen: true,
      },
      insuranceConnection: {
        connectedInsurerIds: [3, "4", 4, -1],
        draftPolicyNumber: "POL-123",
        draftClaimNumber: "CLM-123",
        lastSelectedInsurerId: 8,
      },
      mapSession: {
        mapViewMode: "map",
        mapTheme: "light",
        showClusters: false,
        clusterLevel: "detailed",
        updatedAt: "2026-04-03T11:00:00.000Z",
        selectedRouteId: "scenic",
        lastSearchQuery: "McDonald's",
        lastViewedShopId: 14,
        lastMapZoom: 12.5,
        lastMapCenter: {
          latitude: 33.749,
          longitude: -84.388,
        },
        lastViewportBounds: {
          north: 34,
          south: 33,
          east: -84,
          west: -85,
        },
        lastSearchOrigin: {
          name: "Ponce City Market",
          address: "675 Ponce De Leon Ave NE",
          city: "Atlanta",
          state: "GA",
          zipCode: "30308",
          latitude: 33.772,
          longitude: -84.366,
          placeId: "pcm-1",
        },
        lastSearchFilters: {
          maxDistanceMiles: 25,
          minRating: 4.2,
          serviceTypes: ["collision", "glass", "", "glass"],
          insurerPrograms: ["State Farm", "Geico", "Geico"],
          vehicleTypes: ["SUV", "Sedan", "Sedan"],
          searchWithinViewport: true,
          openNow: false,
          hasAvailability: true,
        },
        savedPlaces: [
          {
            id: "saved-home",
            label: "Home",
            name: "Home",
            address: "1 Main St",
            city: "Atlanta",
            state: "GA",
            zipCode: "30303",
            latitude: 33.75,
            longitude: -84.39,
            isFavorite: true,
            createdAt: "2026-04-03T09:00:00.000Z",
            lastUsedAt: "2026-04-03T09:30:00.000Z",
            metadata: {
              icon: "house",
              category: "home",
            },
          },
          {
            id: "",
            label: "Broken",
          },
        ],
        recentSearches: [
          {
            query: "dent repair",
            timestamp: "2026-04-03T08:00:00.000Z",
            resultCount: 6,
            origin: {
              name: "Midtown",
              address: "10 Peachtree Pl NW",
              city: "Atlanta",
              state: "GA",
              zipCode: "30309",
              latitude: 33.781,
              longitude: -84.383,
            },
          },
          {
            query: "",
            timestamp: "bad-date",
          },
        ],
        customerSavedShopIds: [4, "5", 5],
        shopWatchlistIds: [7, 8],
        insurerShortlistIds: [9, "10"],
      },
    });

    expect(sanitized).toEqual({
      updatedAt: "2026-04-03T10:00:00.000Z",
      shopDirectory: {
        searchQuery: "Atlanta",
        filterRating: 4.5,
        sortBy: "rating",
        lastViewedShopId: 12,
        sessionIntelligenceOpen: true,
      },
      insuranceConnection: {
        connectedInsurerIds: [3, 4],
        draftPolicyNumber: "POL-123",
        draftClaimNumber: "CLM-123",
        lastSelectedInsurerId: 8,
      },
      mapSession: {
        ...DEFAULT_MAP_SESSION,
        mapViewMode: "map",
        mapTheme: "light",
        showClusters: false,
        clusterLevel: "detailed",
        updatedAt: "2026-04-03T11:00:00.000Z",
        selectedRouteId: "scenic",
        lastSearchQuery: "McDonald's",
        lastViewedShopId: 14,
        lastMapZoom: 12.5,
        lastMapCenter: {
          latitude: 33.749,
          longitude: -84.388,
        },
        lastViewportBounds: {
          north: 34,
          south: 33,
          east: -84,
          west: -85,
        },
        lastSearchOrigin: {
          name: "Ponce City Market",
          address: "675 Ponce De Leon Ave NE",
          city: "Atlanta",
          state: "GA",
          zipCode: "30308",
          latitude: 33.772,
          longitude: -84.366,
          placeId: "pcm-1",
        },
        lastSearchFilters: {
          maxDistanceMiles: 25,
          minRating: 4.2,
          serviceTypes: ["collision", "glass"],
          insurerPrograms: ["State Farm", "Geico"],
          vehicleTypes: ["SUV", "Sedan"],
          searchWithinViewport: true,
          openNow: false,
          hasAvailability: true,
        },
        savedPlaces: [
          {
            id: "saved-home",
            label: "Home",
            name: "Home",
            address: "1 Main St",
            city: "Atlanta",
            state: "GA",
            zipCode: "30303",
            latitude: 33.75,
            longitude: -84.39,
            isFavorite: true,
            createdAt: "2026-04-03T09:00:00.000Z",
            lastUsedAt: "2026-04-03T09:30:00.000Z",
            metadata: {
              icon: "house",
              category: "home",
            },
          },
        ],
        recentSearches: [
          {
            query: "dent repair",
            timestamp: "2026-04-03T08:00:00.000Z",
            resultCount: 6,
            origin: {
              name: "Midtown",
              address: "10 Peachtree Pl NW",
              city: "Atlanta",
              state: "GA",
              zipCode: "30309",
              latitude: 33.781,
              longitude: -84.383,
            },
          },
        ],
        customerSavedShopIds: [4, 5],
        shopWatchlistIds: [7, 8],
        insurerShortlistIds: [9, 10],
      },
    });
  });

  it("exposes sanitizeWebsiteSessionMemory as the public alias", () => {
    const payload = {
      shopDirectory: {
        searchQuery: "Buckhead",
      },
    };

    expect(sanitizeWebsiteSessionMemory(payload)).toEqual(sanitizeMemory(payload));
  });
});
