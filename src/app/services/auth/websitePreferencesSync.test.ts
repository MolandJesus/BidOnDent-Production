import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockBuildSupabaseEdgeHeadersAsync } = vi.hoisted(() => ({
  mockBuildSupabaseEdgeHeadersAsync: vi.fn(async () => new Headers({ Authorization: "Bearer test" })),
}));

vi.mock("../supabase/runtime", () => ({
  SUPABASE_EDGE_ROUTES: {
    websitePreferences: "website-preferences",
  },
  buildSupabaseFunctionUrl: (route: string) => `https://edge.test/${route}`,
  buildSupabaseEdgeHeadersAsync: mockBuildSupabaseEdgeHeadersAsync,
}));

import type { WebsiteIdentity, WebsiteSessionMemory } from "./websiteIdentity";
import {
  fetchWebsiteSessionMemoryFromCloud,
  queueWebsiteSessionMemorySync,
  saveWebsiteSessionMemoryToCloud,
} from "./websitePreferencesSync";

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
    updatedAt: "2026-04-03T19:00:00.000Z",
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
      updatedAt: "2026-04-03T19:00:00.000Z",
    },
    ...overrides,
  };
}

describe("websitePreferencesSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("fetches and sanitizes website session memory from cloud payloads", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          preferences: {
            session_memory: {
              updatedAt: "2026-04-03T19:10:00.000Z",
              shopDirectory: {
                searchQuery: "Atlanta",
                filterRating: 10,
                sortBy: "rating",
                sessionIntelligenceOpen: true,
              },
              insuranceConnection: {
                connectedInsurerIds: [1, "2", 2],
                draftPolicyNumber: "POL-123",
                draftClaimNumber: "CLM-123",
                lastSelectedInsurerId: "bad-id",
              },
              mapSession: {
                mapViewMode: "map",
                mapTheme: "auto",
                selectedRouteId: "fastest",
                showClusters: false,
                clusterLevel: "detailed",
                updatedAt: "2026-04-03T19:15:00.000Z",
              },
            },
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const identity = createIdentity("preferences-fetch");
    const memory = await fetchWebsiteSessionMemoryFromCloud(identity);

    expect(mockBuildSupabaseEdgeHeadersAsync).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      "https://edge.test/website-preferences?websiteUserKey=preferences-fetch",
      expect.objectContaining({
        method: "GET",
        headers: expect.any(Headers),
      }),
    );
    expect(memory).toEqual(
      expect.objectContaining({
        updatedAt: "2026-04-03T19:10:00.000Z",
        shopDirectory: expect.objectContaining({
          searchQuery: "Atlanta",
          filterRating: 0,
          sortBy: "rating",
          sessionIntelligenceOpen: true,
        }),
        insuranceConnection: expect.objectContaining({
          connectedInsurerIds: [1, 2],
          draftPolicyNumber: "POL-123",
          draftClaimNumber: "CLM-123",
          lastSelectedInsurerId: null,
        }),
        mapSession: expect.objectContaining({
          mapViewMode: "map",
          mapTheme: "light",
          showClusters: false,
          clusterLevel: "detailed",
          updatedAt: "2026-04-03T19:15:00.000Z",
        }),
      }),
    );
  });

  it("returns null when fetching cloud preferences fails", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(new Response("nope", { status: 503 }));

    const memory = await fetchWebsiteSessionMemoryFromCloud(createIdentity("preferences-fail"));

    expect(memory).toBeNull();
  });

  it("posts website session memory to cloud and reports success/failure", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    mockFetch.mockResolvedValueOnce(new Response("error", { status: 500 }));

    const identity = createIdentity("preferences-save");
    const payload = {
      accountType: "customer" as const,
      identity,
      sessionMemory: createSessionMemory({
        shopDirectory: {
          searchQuery: "Buckhead",
          filterRating: 4,
          sortBy: "reviews",
          lastViewedShopId: 12,
          sessionIntelligenceOpen: true,
        },
      }),
    };

    await expect(saveWebsiteSessionMemoryToCloud(payload)).resolves.toBe(true);
    await expect(saveWebsiteSessionMemoryToCloud(payload)).resolves.toBe(false);

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "https://edge.test/website-preferences",
      expect.objectContaining({
        method: "POST",
        headers: expect.any(Headers),
        body: JSON.stringify(payload),
      }),
    );
  });

  it("debounces queued preference sync so only the latest payload is saved", async () => {
    vi.useFakeTimers();
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const identity = createIdentity("preferences-queue");
    queueWebsiteSessionMemorySync({
      accountType: "customer",
      identity,
      sessionMemory: createSessionMemory({
        shopDirectory: {
          searchQuery: "First",
          filterRating: 0,
          sortBy: "smart-match",
          lastViewedShopId: null,
          sessionIntelligenceOpen: false,
        },
      }),
    });

    queueWebsiteSessionMemorySync({
      accountType: "customer",
      identity,
      sessionMemory: createSessionMemory({
        shopDirectory: {
          searchQuery: "Second",
          filterRating: 5,
          sortBy: "rating",
          lastViewedShopId: 99,
          sessionIntelligenceOpen: true,
        },
      }),
    });

    await vi.advanceTimersByTimeAsync(901);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const request = mockFetch.mock.calls[0];
    expect(request?.[0]).toBe("https://edge.test/website-preferences");
    expect(JSON.parse(String(request?.[1]?.body))).toEqual(
      expect.objectContaining({
        accountType: "customer",
        identity,
        sessionMemory: expect.objectContaining({
          shopDirectory: expect.objectContaining({
            searchQuery: "Second",
            filterRating: 5,
            sortBy: "rating",
            lastViewedShopId: 99,
            sessionIntelligenceOpen: true,
          }),
        }),
      }),
    );
  });
});
