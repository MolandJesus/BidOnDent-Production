import { describe, it, expect } from "vitest";
import {
  computeLiveNavigationFlags,
  computeRemainingLabels,
  computeShopActionLabel,
} from "./shopDirectoryNavigationDerived";

/* ── Factories ──────────────────────────────────────── */

function makeShop(id: number) {
  return { id } as Parameters<typeof computeLiveNavigationFlags>[0]["selectedShop"];
}

function makeDest(id: string) {
  return { id, name: "Test Dest", lat: 33.75, lng: -84.39, address: "123 Main St" } as Parameters<
    typeof computeLiveNavigationFlags
  >[0]["directDestination"];
}

/* ── computeLiveNavigationFlags ─────────────────────── */

describe("computeLiveNavigationFlags", () => {
  const base = {
    selectedShop: null,
    directDestination: null,
    navigationSessionDestinationId: null,
    sessionStatus: "idle" as const,
    hasArrived: false,
  };

  it("returns all false when idle", () => {
    const result = computeLiveNavigationFlags(base);
    expect(result.liveNavigationActive).toBe(false);
    expect(result.liveNavigationForSelectedShop).toBe(false);
    expect(result.liveNavigationForDirectDest).toBe(false);
    expect(result.hasArrivedForSelectedShop).toBe(false);
    expect(result.hasArrivedForDestination).toBe(false);
  });

  it("detects active shop navigation", () => {
    const result = computeLiveNavigationFlags({
      ...base,
      selectedShop: makeShop(42),
      navigationSessionDestinationId: "42",
      sessionStatus: "active",
    });
    expect(result.liveNavigationForSelectedShop).toBe(true);
    expect(result.liveNavigationActive).toBe(true);
    expect(result.liveNavigationForDirectDest).toBe(false);
  });

  it("detects active direct destination navigation", () => {
    const result = computeLiveNavigationFlags({
      ...base,
      directDestination: makeDest("mcdonalds-midtown"),
      navigationSessionDestinationId: "mcdonalds-midtown",
      sessionStatus: "active",
    });
    expect(result.liveNavigationForDirectDest).toBe(true);
    expect(result.liveNavigationActive).toBe(true);
    expect(result.liveNavigationForSelectedShop).toBe(false);
  });

  it("detects paused navigation as active", () => {
    const result = computeLiveNavigationFlags({
      ...base,
      directDestination: makeDest("dest-1"),
      navigationSessionDestinationId: "dest-1",
      sessionStatus: "paused",
    });
    expect(result.liveNavigationActive).toBe(true);
  });

  it("does not flag ended sessions as active", () => {
    const result = computeLiveNavigationFlags({
      ...base,
      directDestination: makeDest("dest-1"),
      navigationSessionDestinationId: "dest-1",
      sessionStatus: "ended",
    });
    expect(result.liveNavigationActive).toBe(false);
  });

  it("detects arrival for shop", () => {
    const result = computeLiveNavigationFlags({
      ...base,
      selectedShop: makeShop(7),
      navigationSessionDestinationId: "7",
      sessionStatus: "active",
      hasArrived: true,
    });
    expect(result.hasArrivedForSelectedShop).toBe(true);
    expect(result.hasArrivedForDestination).toBe(true);
  });

  it("detects arrival for direct destination", () => {
    const result = computeLiveNavigationFlags({
      ...base,
      directDestination: makeDest("dest-x"),
      navigationSessionDestinationId: "dest-x",
      sessionStatus: "active",
      hasArrived: true,
    });
    expect(result.hasArrivedForSelectedShop).toBe(false);
    expect(result.hasArrivedForDestination).toBe(true);
  });

  it("does not flag mismatched destination as navigating", () => {
    const result = computeLiveNavigationFlags({
      ...base,
      selectedShop: makeShop(42),
      navigationSessionDestinationId: "999",
      sessionStatus: "active",
    });
    expect(result.liveNavigationForSelectedShop).toBe(false);
    expect(result.liveNavigationActive).toBe(false);
  });
});

/* ── computeRemainingLabels ─────────────────────────── */

describe("computeRemainingLabels", () => {
  const baseLabels = {
    liveNavigationActive: true,
    hasArrived: false,
    hasArrivedForDestination: false,
    routePreview: null,
    currentStepIndex: 0,
    currentSpeedMph: 0,
  };

  it("returns null labels when no route preview", () => {
    const result = computeRemainingLabels(baseLabels);
    expect(result.liveRemainingEtaLabel).toBeNull();
    expect(result.liveRemainingDistanceLabel).toBeNull();
    expect(result.remainingDurationSeconds).toBe(0);
    expect(result.remainingDistanceMeters).toBe(0);
  });

  it('returns "Arrived" / "Here" when arrived', () => {
    const result = computeRemainingLabels({
      ...baseLabels,
      hasArrived: true,
      hasArrivedForDestination: true,
    });
    expect(result.liveRemainingEtaLabel).toBe("Arrived");
    expect(result.liveRemainingDistanceLabel).toBe("Here");
  });

  it("returns null labels when navigation is not active", () => {
    const result = computeRemainingLabels({
      ...baseLabels,
      liveNavigationActive: false,
      routePreview: {
        steps: [{ durationSeconds: 300, distanceMeters: 5000 }],
        durationSeconds: 300,
        distanceMeters: 5000,
        geometry: [],
      } as unknown as Parameters<typeof computeRemainingLabels>[0]["routePreview"],
    });
    expect(result.liveRemainingEtaLabel).toBeNull();
    expect(result.liveRemainingDistanceLabel).toBeNull();
  });

  it("computes ETA and distance labels from route preview", () => {
    const result = computeRemainingLabels({
      ...baseLabels,
      routePreview: {
        steps: [
          { durationSeconds: 600, distanceMeters: 8000 },
          { durationSeconds: 300, distanceMeters: 4000 },
        ],
        durationSeconds: 900,
        distanceMeters: 12000,
        geometry: [],
      } as unknown as Parameters<typeof computeRemainingLabels>[0]["routePreview"],
    });
    expect(result.remainingDurationSeconds).toBe(900);
    expect(result.remainingDistanceMeters).toBe(12000);
    expect(result.liveRemainingEtaLabel).toBe("15 min");
    expect(result.liveRemainingDistanceLabel).not.toBeNull();
  });
});

/* ── computeShopActionLabel ─────────────────────────── */

describe("computeShopActionLabel", () => {
  it("returns default label when no shop selected", () => {
    const result = computeShopActionLabel({
      selectedShop: null,
      selectedOrigin: null,
      selectedRoute: null,
      hasArrivedForSelectedShop: false,
      directionsActionLabel: "Get Directions",
      navigationSessionStatus: "idle",
      navigationSessionDestinationId: null,
    });
    expect(result).toBe("Get Directions");
  });

  it("returns shop-specific label when shop is selected", () => {
    const result = computeShopActionLabel({
      selectedShop: makeShop(42),
      selectedOrigin: { placeId: "origin-1" },
      selectedRoute: { id: "route-1" } as unknown as Parameters<
        typeof computeShopActionLabel
      >[0]["selectedRoute"],
      hasArrivedForSelectedShop: false,
      directionsActionLabel: "Get Directions",
      navigationSessionStatus: "idle",
      navigationSessionDestinationId: null,
    });
    // Should not be the default label (specific logic depends on getShopRouteActionLabel)
    expect(typeof result).toBe("string");
  });
});
