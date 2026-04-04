import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mock providerHealth before imports ──────────────────────────────────────
vi.mock("./providerHealth", () => ({
  isProviderCircuitOpen: vi.fn(() => false),
  runWithProviderHealth: vi.fn((_id: string, fn: () => Promise<Response>) => fn()),
}));

import { fetchNavigationRouteOptions, fetchNavigationRoutePreview } from "./routeEngine";
import {
  searchNavigationAddresses,
  addressResultToSearchTarget,
  suggestNavigationAddresses,
} from "./addressSearch";
import { isProviderCircuitOpen } from "./providerHealth";

// ── Helper to set up globalThis.fetch mock ──────────────────────────────────
function mockFetch(body: unknown, options: { ok?: boolean; status?: number } = {}) {
  const { ok = true, status = 200 } = options;
  const response = {
    ok,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
    headers: new Headers(),
    redirected: false,
    type: "basic" as ResponseType,
    url: "",
    clone: () => response,
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
  } as Response;

  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(response))
  );
  return response;
}

const sampleOsrmRoute = {
  routes: [
    {
      distance: 5000,
      duration: 600,
      geometry: {
        coordinates: [
          [-97.7, 30.3],
          [-97.71, 30.31],
          [-97.72, 30.32],
        ],
      },
      legs: [
        {
          steps: [
            {
              distance: 2500,
              duration: 300,
              name: "Main St",
              maneuver: { type: "turn", modifier: "right", location: [-97.7, 30.3] },
            },
            {
              distance: 2500,
              duration: 300,
              name: "Oak Ave",
              maneuver: { type: "arrive", location: [-97.72, 30.32] },
            },
          ],
        },
      ],
    },
    {
      distance: 6000,
      duration: 700,
      geometry: {
        coordinates: [
          [-97.7, 30.3],
          [-97.73, 30.33],
        ],
      },
      legs: [{ steps: [] }],
    },
  ],
};

const sampleNominatimResults = [
  {
    place_id: 1001,
    display_name: "123 Main St, Austin, TX 78701, United States",
    lat: "30.267",
    lon: "-97.743",
    address: {
      house_number: "123",
      road: "Main St",
      city: "Austin",
      state: "Texas",
      county: "Travis County",
    },
  },
  {
    place_id: 1002,
    display_name: "456 Elm Rd, Round Rock, TX 78664, United States",
    lat: "30.508",
    lon: "-97.678",
    address: {
      house_number: "456",
      road: "Elm Rd",
      town: "Round Rock",
      state: "Texas",
      county: "Williamson County",
    },
  },
];

const testDestination = {
  id: "test-1",
  lat: 30.32,
  lng: -97.72,
  name: "Shop",
  kind: "shop" as const,
};

describe("routeEngine", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses OSRM response into NavigationRouteOptions", async () => {
    mockFetch(sampleOsrmRoute);

    const options = await fetchNavigationRouteOptions({
      origin: { lat: 30.3, lng: -97.7 },
      destination: testDestination,
    });

    expect(options.primary.provider).toBe("osrm-public");
    expect(options.primary.distanceMeters).toBe(5000);
    expect(options.primary.durationSeconds).toBe(600);
    expect(options.primary.geometry).toHaveLength(3);
    expect(options.primary.geometry[0]).toEqual({ lat: 30.3, lng: -97.7 });
    expect(options.primary.steps).toHaveLength(2);
    expect(options.primary.steps[0].roadName).toBe("Main St");
    expect(options.primary.steps[0].maneuverType).toBe("turn");
    expect(options.primary.steps[0].maneuverModifier).toBe("right");
    expect(options.alternatives).toHaveLength(2);
  });

  it("fetchNavigationRoutePreview returns primary route", async () => {
    mockFetch(sampleOsrmRoute);

    const preview = await fetchNavigationRoutePreview({
      origin: { lat: 30.3, lng: -97.7 },
      destination: testDestination,
    });

    expect(preview.distanceMeters).toBe(5000);
    expect(preview.provider).toBe("osrm-public");
  });

  it("throws when no routes returned", async () => {
    mockFetch({ routes: [] });

    await expect(
      fetchNavigationRouteOptions({
        origin: { lat: 30.3, lng: -97.7 },
        destination: testDestination,
      })
    ).rejects.toThrow("No drivable route");
  });

  it("throws on non-ok response", async () => {
    mockFetch({}, { ok: false, status: 500 });

    await expect(
      fetchNavigationRouteOptions({
        origin: { lat: 30.3, lng: -97.7 },
        destination: testDestination,
      })
    ).rejects.toThrow("temporarily unavailable");
  });

  it("throws when circuit is open", async () => {
    vi.mocked(isProviderCircuitOpen).mockReturnValueOnce(true);

    await expect(
      fetchNavigationRouteOptions({
        origin: { lat: 30.3, lng: -97.7 },
        destination: testDestination,
      })
    ).rejects.toThrow("temporarily unavailable");
  });

  it("handles missing steps in legs gracefully", async () => {
    mockFetch({
      routes: [
        {
          distance: 3000,
          duration: 400,
          geometry: { coordinates: [[-97.7, 30.3]] },
          legs: [{}],
        },
      ],
    });

    const options = await fetchNavigationRouteOptions({
      origin: { lat: 30.3, lng: -97.7 },
      destination: testDestination,
    });

    expect(options.primary.steps).toHaveLength(0);
  });

  it("caps alternatives at 3", async () => {
    const manyRoutes = Array.from({ length: 5 }, (_, i) => ({
      distance: 1000 * (i + 1),
      duration: 100 * (i + 1),
      geometry: { coordinates: [[-97.7, 30.3]] },
    }));
    mockFetch({ routes: manyRoutes });

    const options = await fetchNavigationRouteOptions({
      origin: { lat: 30.3, lng: -97.7 },
      destination: testDestination,
    });

    expect(options.alternatives.length).toBeLessThanOrEqual(3);
  });
});

describe("addressSearch", () => {
  beforeEach(() => {
    // Clear internal caches by a fresh module state isn't feasible,
    // but we can test with unique queries to avoid cache hits
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty for short queries (< 4 chars)", async () => {
    const results = await searchNavigationAddresses("ab");
    expect(results).toEqual([]);
  });

  it("parses Nominatim results into NavigationAddressResult[]", async () => {
    mockFetch(sampleNominatimResults);

    const results = await searchNavigationAddresses("123 Main St Austin TX" + Math.random());
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe("1001");
    expect(results[0].lat).toBe(30.267);
    expect(results[0].lng).toBe(-97.743);
    expect(results[0].primaryLabel).toContain("Main St");
    expect(results[0].provider).toBe("nominatim");
  });

  it("filters out results with non-finite coordinates", async () => {
    mockFetch([
      ...sampleNominatimResults,
      { place_id: 9999, display_name: "Bad", lat: "NaN", lon: "abc" },
    ]);

    const results = await searchNavigationAddresses("filter test query " + Math.random());
    expect(results).toHaveLength(2);
  });

  it("throws on non-ok response", async () => {
    mockFetch({}, { ok: false, status: 503 });

    await expect(searchNavigationAddresses("error test query " + Math.random())).rejects.toThrow(
      "Address lookup failed"
    );
  });

  it("throws when circuit is open", async () => {
    vi.mocked(isProviderCircuitOpen).mockReturnValueOnce(true);

    await expect(searchNavigationAddresses("circuit test query " + Math.random())).rejects.toThrow(
      "temporarily overloaded"
    );
  });

  // ── addressResultToSearchTarget ──

  it("converts address result to CoverageSearchTarget", () => {
    const target = addressResultToSearchTarget({
      id: "1001",
      label: "123 Main St, Austin, TX",
      primaryLabel: "123 Main St Austin",
      secondaryLabel: "Travis County, Texas",
      lat: 30.267,
      lng: -97.743,
      provider: "nominatim",
    });

    expect(target.lat).toBe(30.267);
    expect(target.lng).toBe(-97.743);
    expect(target.county).toBe("Travis County, Texas");
    expect(target.source).toBe("address");
  });

  // ── suggestNavigationAddresses ──

  it("returns empty for queries shorter than 2 chars", async () => {
    const results = await suggestNavigationAddresses("a");
    expect(results).toEqual([]);
  });

  it("returns suggestions sorted by confidence", async () => {
    mockFetch(sampleNominatimResults);

    const results = await suggestNavigationAddresses("suggest test " + Math.random());
    expect(results.length).toBeGreaterThan(0);
    // Verify descending confidence order
    for (let i = 1; i < results.length; i++) {
      expect(results[i].confidenceScore).toBeLessThanOrEqual(results[i - 1].confidenceScore);
    }
    expect(results[0].intent).toBe("address");
    expect(results[0].provider).toBe("nominatim");
  });

  it("suggest silently returns empty on fetch failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("Network error")))
    );

    const results = await suggestNavigationAddresses("network fail " + Math.random());
    expect(results).toEqual([]);
  });
});
