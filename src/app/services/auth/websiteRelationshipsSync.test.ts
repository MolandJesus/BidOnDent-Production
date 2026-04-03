import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockBuildSupabaseEdgeHeadersAsync } = vi.hoisted(() => ({
  mockBuildSupabaseEdgeHeadersAsync: vi.fn(async () => new Headers({ Authorization: "Bearer test" })),
}));

vi.mock("../supabase/runtime", () => ({
  SUPABASE_EDGE_ROUTES: {
    websiteRelationships: "website-relationships",
  },
  buildSupabaseFunctionUrl: (route: string) => `https://edge.test/${route}`,
  buildSupabaseEdgeHeadersAsync: mockBuildSupabaseEdgeHeadersAsync,
}));

import type { WebsiteIdentity, WebsiteSessionMemory } from "./websiteIdentity";
import {
  extractRelationshipCollections,
  fetchWebsiteRelationshipCollectionsFromCloud,
  mergeRelationshipCollectionsIntoSessionMemory,
  queueWebsiteRelationshipCollectionsSync,
} from "./websiteRelationshipsSync";

function createIdentity(websiteUserKey: string): WebsiteIdentity {
  return {
    provider: "clerk",
    providerUserId: `provider-${websiteUserKey}`,
    normalizedEmail: `${websiteUserKey}@example.com`,
    displayName: websiteUserKey,
    websiteUserKey,
    sessionId: `session-${websiteUserKey}`,
  };
}

function createSessionMemory(
  overrides?: Partial<WebsiteSessionMemory>,
): WebsiteSessionMemory {
  return {
    updatedAt: "2026-04-03T16:00:00.000Z",
    shopDirectory: {
      searchQuery: "",
      filterRating: 0,
      sortBy: "smart-match",
      lastViewedShopId: null,
      sessionIntelligenceOpen: false,
    },
    insuranceConnection: {
      connectedInsurerIds: [],
      draftPolicyNumber: "",
      draftClaimNumber: "",
      lastSelectedInsurerId: null,
    },
    mapSession: {
      savedPlaces: [],
      recentSearches: [],
      customerSavedShopIds: [],
      shopWatchlistIds: [],
      insurerShortlistIds: [],
      mapViewMode: "hybrid",
      mapTheme: "light",
      selectedRouteId: "fastest",
      showClusters: true,
      clusterLevel: "balanced",
      updatedAt: "2026-04-03T16:00:00.000Z",
    },
    ...overrides,
  };
}

describe("websiteRelationshipsSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("extracts numeric relationship collections from session memory", () => {
    const collections = extractRelationshipCollections(
      createSessionMemory({
        updatedAt: "2026-04-03T16:45:00.000Z",
        insuranceConnection: {
          connectedInsurerIds: [1, Number("2"), 2, 0, -9],
          draftPolicyNumber: "",
          draftClaimNumber: "",
          lastSelectedInsurerId: null,
        },
        mapSession: {
          savedPlaces: [],
          recentSearches: [],
          customerSavedShopIds: [4, 5, 5],
          shopWatchlistIds: [8, 0, 9],
          insurerShortlistIds: [11, Number("12"), 12],
          mapViewMode: "hybrid",
          mapTheme: "light",
          selectedRouteId: "fastest",
          showClusters: true,
          clusterLevel: "balanced",
          updatedAt: "2026-04-03T16:00:00.000Z",
        },
      }),
    );

    expect(collections).toEqual({
      connectedInsurerIds: [1, 2],
      customerSavedShopIds: [4, 5],
      insurerShortlistIds: [11, 12],
      shopWatchlistIds: [8, 9],
      updatedAt: "2026-04-03T16:45:00.000Z",
    });
  });

  it("merges fetched collections back into session memory and updates timestamps", () => {
    const merged = mergeRelationshipCollectionsIntoSessionMemory(
      createSessionMemory({
        updatedAt: "2026-04-03T16:00:00.000Z",
      }),
      {
        connectedInsurerIds: [2, 3],
        customerSavedShopIds: [7],
        insurerShortlistIds: [11],
        shopWatchlistIds: [19, 20],
        updatedAt: "2026-04-03T17:00:00.000Z",
      },
    );

    expect(merged).toEqual(
      expect.objectContaining({
        updatedAt: "2026-04-03T17:00:00.000Z",
        insuranceConnection: expect.objectContaining({
          connectedInsurerIds: [2, 3],
        }),
        mapSession: expect.objectContaining({
          customerSavedShopIds: [7],
          insurerShortlistIds: [11],
          shopWatchlistIds: [19, 20],
          updatedAt: "2026-04-03T17:00:00.000Z",
        }),
      }),
    );
  });

  it("fetches and sanitizes relationship collections from cloud payloads", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          updatedAt: "2026-04-03T18:00:00.000Z",
          collections: {
            connectedInsurerIds: [1, "2", 2],
            customerSavedShopIds: [4, -1, "5"],
            insurerShortlistIds: ["8", 8],
            shopWatchlistIds: [10, 0, 11],
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const identity = createIdentity("relationships-fetch");
    const collections = await fetchWebsiteRelationshipCollectionsFromCloud(identity);

    expect(mockBuildSupabaseEdgeHeadersAsync).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      "https://edge.test/website-relationships?websiteUserKey=relationships-fetch",
      expect.objectContaining({
        method: "GET",
        headers: expect.any(Headers),
      }),
    );
    expect(collections).toEqual({
      connectedInsurerIds: [1, 2],
      customerSavedShopIds: [4, 5],
      insurerShortlistIds: [8],
      shopWatchlistIds: [10, 11],
      updatedAt: "2026-04-03T18:00:00.000Z",
    });
  });

  it("queues only the latest relationship sync and skips re-saving identical data", async () => {
    vi.useFakeTimers();
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const identity = createIdentity("relationships-queue");
    const firstPayload = {
      accountType: "customer" as const,
      identity,
      sessionMemory: createSessionMemory({
        mapSession: {
          savedPlaces: [],
          recentSearches: [],
          customerSavedShopIds: [3],
          shopWatchlistIds: [],
          insurerShortlistIds: [],
          mapViewMode: "hybrid",
          mapTheme: "light",
          selectedRouteId: "fastest",
          showClusters: true,
          clusterLevel: "balanced",
          updatedAt: "2026-04-03T16:00:00.000Z",
        },
      }),
    };
    const secondPayload = {
      accountType: "customer" as const,
      identity,
      sessionMemory: createSessionMemory({
        mapSession: {
          savedPlaces: [],
          recentSearches: [],
          customerSavedShopIds: [7, 8],
          shopWatchlistIds: [12],
          insurerShortlistIds: [],
          mapViewMode: "hybrid",
          mapTheme: "light",
          selectedRouteId: "fastest",
          showClusters: true,
          clusterLevel: "balanced",
          updatedAt: "2026-04-03T16:05:00.000Z",
        },
      }),
    };

    queueWebsiteRelationshipCollectionsSync(firstPayload);
    queueWebsiteRelationshipCollectionsSync(secondPayload);

    await vi.advanceTimersByTimeAsync(901);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const firstRequest = mockFetch.mock.calls[0];
    expect(firstRequest?.[0]).toBe("https://edge.test/website-relationships");
    expect(JSON.parse(String(firstRequest?.[1]?.body))).toEqual(
      expect.objectContaining({
        accountType: "customer",
        identity,
        collections: {
          connectedInsurerIds: [],
          customerSavedShopIds: [7, 8],
          insurerShortlistIds: [],
          shopWatchlistIds: [12],
          updatedAt: "2026-04-03T16:00:00.000Z",
        },
      }),
    );

    mockFetch.mockClear();
    queueWebsiteRelationshipCollectionsSync(secondPayload);
    await vi.advanceTimersByTimeAsync(901);

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
