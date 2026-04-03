import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockQueueWebsiteSessionMemorySync,
  mockQueueWebsiteRelationshipCollectionsSync,
} = vi.hoisted(() => ({
  mockQueueWebsiteSessionMemorySync: vi.fn(),
  mockQueueWebsiteRelationshipCollectionsSync: vi.fn(),
}));

vi.mock("./websitePreferencesSync", () => ({
  queueWebsiteSessionMemorySync: mockQueueWebsiteSessionMemorySync,
}));

vi.mock("./websiteRelationshipsSync", () => ({
  queueWebsiteRelationshipCollectionsSync: mockQueueWebsiteRelationshipCollectionsSync,
}));

import {
  buildWebsiteIdentity,
  loadWebsiteSessionMemory,
  replaceWebsiteSessionMemory,
  updateWebsiteSessionMemory,
} from "./websiteIdentity";

const MEMORY_PREFIX = "bidondent_website_memory";
const SESSION_PREFIX = "bidondent_website_session";

function createMemoryStorage(): Storage {
  let entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    clear() {
      entries = new Map();
    },
    getItem(key: string) {
      return entries.has(key) ? entries.get(key) ?? null : null;
    },
    key(index: number) {
      return Array.from(entries.keys())[index] ?? null;
    },
    removeItem(key: string) {
      entries.delete(key);
    },
    setItem(key: string, value: string) {
      entries.set(key, String(value));
    },
  };
}

describe("websiteIdentity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: createMemoryStorage(),
      configurable: true,
    });
    Object.defineProperty(window, "sessionStorage", {
      value: createMemoryStorage(),
      configurable: true,
    });
  });

  it("builds a stable website identity from normalized email and reuses stored session ids", () => {
    const firstIdentity = buildWebsiteIdentity({
      provider: "clerk",
      providerUserId: "clerk_123",
      email: "  Person@Example.com ",
      displayName: "  Person  ",
    });

    const secondIdentity = buildWebsiteIdentity({
      provider: "clerk",
      providerUserId: "clerk_999",
      email: "person@example.com",
      displayName: "",
    });

    expect(firstIdentity.normalizedEmail).toBe("person@example.com");
    expect(firstIdentity.displayName).toBe("Person");
    expect(firstIdentity.websiteUserKey).toBe(secondIdentity.websiteUserKey);
    expect(firstIdentity.sessionId).toMatch(/^session-[a-z0-9]+$/);
    expect(secondIdentity.sessionId).toBe(firstIdentity.sessionId);

    expect(
      window.sessionStorage.getItem(`${SESSION_PREFIX}:${firstIdentity.websiteUserKey}`),
    ).toBe(firstIdentity.sessionId);
  });

  it("sanitizes loaded website session memory and rewrites corrupted stored values", () => {
    const identity = buildWebsiteIdentity({
      email: "customer@example.com",
      sessionHint: "load-test",
    });

    window.localStorage.setItem(
      `${MEMORY_PREFIX}:${identity.websiteUserKey}`,
      JSON.stringify({
        updatedAt: "2026-04-03T12:00:00.000Z",
        shopDirectory: {
          searchQuery: "Midtown",
          filterRating: 99,
          sortBy: "rating",
          lastViewedShopId: "not-a-number",
          sessionIntelligenceOpen: true,
        },
        insuranceConnection: {
          connectedInsurerIds: [1, "2", 2, -5],
          draftPolicyNumber: "POL-100",
          draftClaimNumber: "CLM-100",
          lastSelectedInsurerId: "oops",
        },
        mapSession: {
          mapViewMode: "map",
          mapTheme: "auto",
          showClusters: false,
          clusterLevel: "detailed",
          updatedAt: "2026-04-03T12:30:00.000Z",
          savedPlaces: [
            {
              id: "saved-1",
              label: "Office",
              name: "Office",
              address: "1 Peachtree St",
              city: "Atlanta",
              state: "GA",
              zipCode: "30303",
              latitude: 33.75,
              longitude: -84.39,
              isFavorite: true,
              createdAt: "2026-04-03T11:00:00.000Z",
              lastUsedAt: "2026-04-03T11:30:00.000Z",
            },
            { id: "", label: "Broken" },
          ],
        },
      }),
    );

    const memory = loadWebsiteSessionMemory(identity);

    expect(memory).toEqual(
      expect.objectContaining({
        updatedAt: "2026-04-03T12:00:00.000Z",
        shopDirectory: expect.objectContaining({
          searchQuery: "Midtown",
          filterRating: 0,
          sortBy: "rating",
          lastViewedShopId: null,
          sessionIntelligenceOpen: true,
        }),
        insuranceConnection: expect.objectContaining({
          connectedInsurerIds: [1, 2],
          draftPolicyNumber: "POL-100",
          draftClaimNumber: "CLM-100",
          lastSelectedInsurerId: null,
        }),
        mapSession: expect.objectContaining({
          mapViewMode: "map",
          mapTheme: "light",
          showClusters: false,
          clusterLevel: "detailed",
          updatedAt: "2026-04-03T12:30:00.000Z",
          savedPlaces: [
            expect.objectContaining({
              id: "saved-1",
              label: "Office",
            }),
          ],
        }),
      }),
    );

    expect(
      JSON.parse(
        window.localStorage.getItem(`${MEMORY_PREFIX}:${identity.websiteUserKey}`) ?? "null",
      ),
    ).toEqual(memory);
  });

  it("persists sanitized updates and queues both preference sync services", () => {
    const identity = buildWebsiteIdentity({
      provider: "clerk",
      providerUserId: "clerk_123",
      email: "customer@example.com",
      displayName: "Customer",
    });

    const nextMemory = updateWebsiteSessionMemory(
      identity,
      {
        shopDirectory: {
          searchQuery: "Buckhead",
          lastViewedShopId: 22,
        },
        mapSession: {
          mapViewMode: "map",
          mapTheme: "auto",
          customerSavedShopIds: [4, "5", 5],
          selectedRouteId: "fastest",
        },
      } as unknown as Parameters<typeof updateWebsiteSessionMemory>[1],
      { accountType: "customer" },
    );

    expect(nextMemory.shopDirectory.searchQuery).toBe("Buckhead");
    expect(nextMemory.shopDirectory.lastViewedShopId).toBe(22);
    expect(nextMemory.mapSession?.mapViewMode).toBe("map");
    expect(nextMemory.mapSession?.mapTheme).toBe("light");
    expect(nextMemory.mapSession?.customerSavedShopIds).toEqual([4, 5]);
    expect(nextMemory.mapSession?.selectedRouteId).toBe("fastest");
    expect(nextMemory.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(nextMemory.mapSession?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    expect(
      JSON.parse(
        window.localStorage.getItem(`${MEMORY_PREFIX}:${identity.websiteUserKey}`) ?? "null",
      ),
    ).toEqual(nextMemory);

    expect(mockQueueWebsiteSessionMemorySync).toHaveBeenCalledWith({
      accountType: "customer",
      identity,
      sessionMemory: nextMemory,
    });
    expect(mockQueueWebsiteRelationshipCollectionsSync).toHaveBeenCalledWith({
      accountType: "customer",
      identity,
      sessionMemory: nextMemory,
    });
  });

  it("replaces website session memory with a sanitized payload", () => {
    const identity = buildWebsiteIdentity({
      email: "replace@example.com",
      sessionHint: "replace",
    });

    const replacedMemory = replaceWebsiteSessionMemory(identity, {
      updatedAt: "2026-04-03T14:00:00.000Z",
      shopDirectory: {
        searchQuery: "Smyrna",
        filterRating: 3,
        sortBy: "reviews",
        lastViewedShopId: 9,
        sessionIntelligenceOpen: false,
      },
      insuranceConnection: {
        connectedInsurerIds: [6, 6, 7],
        draftPolicyNumber: "POL-777",
        draftClaimNumber: "CLM-777",
        lastSelectedInsurerId: 10,
      },
      mapSession: {
        savedPlaces: [],
        recentSearches: [],
        customerSavedShopIds: [11],
        shopWatchlistIds: [],
        insurerShortlistIds: [],
        mapViewMode: "hybrid",
        mapTheme: "auto",
        selectedRouteId: "shortest",
        showClusters: true,
        clusterLevel: "balanced",
        updatedAt: "2026-04-03T14:05:00.000Z",
      },
    });

    expect(replacedMemory.mapSession?.mapTheme).toBe("light");
    expect(replacedMemory.insuranceConnection.connectedInsurerIds).toEqual([6, 7]);
    expect(
      JSON.parse(
        window.localStorage.getItem(`${MEMORY_PREFIX}:${identity.websiteUserKey}`) ?? "null",
      ),
    ).toEqual(replacedMemory);
  });
});
