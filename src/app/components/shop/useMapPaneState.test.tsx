/**
 * Engine 2 (`MapLibreShopDirectoryMapPane`) lifecycle contract — Pass 231h.
 *
 * Tests `useMapPaneState`, the lifecycle owner for Engine 2. The pane
 * component itself has ~70 props and a ResizeObserver-gated mount path
 * that's hard to drive cleanly under jsdom; the hook is the right
 * surface for KI-187 lifecycle coverage of Engine 2 because every
 * lifecycle state (`containerReady`, `mapLoaded`, `mapLoadFailed`,
 * `mapRenderNonce`) and every failure-surface handler (`handleMapLoad`,
 * `handleMapLoadError`, `handleRetryMap`) lives in this hook.
 *
 * Test-only — no production source touched. Within Block D §6
 * pre-authorized scope ("test-only passes that build on the Pass 231e
 * harness without touching production source").
 *
 * Locks four areas of Engine 2 lifecycle behavior:
 *
 *   1. `handleMapLoad` flips `mapLoaded` true and clears
 *      `mapLoadFailed` (success closes a prior failure).
 *   2. `handleMapLoadError` flips `mapLoadFailed` true (failure
 *      surface KI-184 says Engine 1 lacks; Engine 2 has it — pin
 *      the contract).
 *   3. `handleRetryMap` resets `mapLoaded`/`mapLoadFailed`/
 *      `containerReady` to false AND increments `mapRenderNonce`.
 *      Nonce increment is the React-side hard-remount mechanism the
 *      LAW renderer contract §3 lifecycle obligation depends on.
 *   4. The 12-second auto-failure timeout fires `mapLoadFailed`
 *      true when `onLoad` never fires, AND is cleared by a successful
 *      `handleMapLoad` before the deadline.
 *
 * Plus the auxiliary `geoError` toast lifecycle:
 *
 *   5. Setting `geoError` auto-clears after 4 seconds.
 *
 * Refs:
 *  - REF_MAP_TEST_HARNESS_STRATEGY_2026-05-09.md §5 (Pass 231h slot)
 *  - REF_MAP_TEST_COVERAGE_GAPS_2026-05-09.md §2.1, §3.2
 *  - REF_MAP_RENDERER_INVENTORY_2026-05-09.md §2.2 (Engine 2 contract)
 *  - REF_KNOWN_ISSUES.md KI-184, KI-187
 *  - LAW_MAP_RENDERER_CONTRACT.md §3 lifecycle obligations
 */

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useMapPaneState } from "./useMapPaneState";

type State = ReturnType<typeof useMapPaneState>;

let latestState: State | null = null;

function Harness({ config }: { config: Parameters<typeof useMapPaneState>[0] }) {
  latestState = useMapPaneState(config);
  return null;
}

function makeConfig(
  overrides: Partial<Parameters<typeof useMapPaneState>[0]> = {}
): Parameters<typeof useMapPaneState>[0] {
  return {
    userType: "customer",
    mapTheme: "light",
    shops: [],
    selectedShopId: null,
    onSelectShop: () => {},
    routeOptions: [],
    savedPlaces: [],
    navigationMode: "browse",
    navigationSessionStatus: "idle",
    navigationSessionDestinationId: null,
    hasArrived: false,
    onViewportChange: () => {},
    overlayDensity: "default",
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  latestState = null;
});

describe("useMapPaneState — Pass 231h initial state", () => {
  it("starts with all lifecycle flags in their pre-mount default", () => {
    render(<Harness config={makeConfig()} />);
    expect(latestState).not.toBeNull();
    expect(latestState!.mapLoaded).toBe(false);
    expect(latestState!.mapLoadFailed).toBe(false);
    expect(latestState!.containerReady).toBe(false);
    expect(latestState!.mapRenderNonce).toBe(0);
    expect(latestState!.geoError).toBeNull();
  });
});

describe("useMapPaneState — Pass 231h handleMapLoad / handleMapLoadError", () => {
  it("handleMapLoad flips mapLoaded true AND clears any prior mapLoadFailed", () => {
    render(<Harness config={makeConfig()} />);
    // Force a prior-failure baseline.
    act(() => latestState!.handleMapLoadError());
    expect(latestState!.mapLoadFailed).toBe(true);
    act(() => latestState!.handleMapLoad());
    expect(latestState!.mapLoaded).toBe(true);
    expect(latestState!.mapLoadFailed).toBe(false);
  });

  it("handleMapLoadError flips mapLoadFailed true (KI-184 — Engine 2 has the surface Engine 1 lacks)", () => {
    render(<Harness config={makeConfig()} />);
    expect(latestState!.mapLoadFailed).toBe(false);
    act(() => latestState!.handleMapLoadError());
    expect(latestState!.mapLoadFailed).toBe(true);
    // Note: handleMapLoadError does NOT clear mapLoaded — by design, since
    // an error after a successful load is a different state than an error
    // during initial mount. Pin that.
    expect(latestState!.mapLoaded).toBe(false);
  });
});

describe("useMapPaneState — Pass 231h handleRetryMap (the hard-remount escape hatch)", () => {
  it("resets all lifecycle vars AND increments mapRenderNonce by exactly 1 per call", () => {
    render(<Harness config={makeConfig()} />);
    act(() => latestState!.handleMapLoad());
    expect(latestState!.mapLoaded).toBe(true);
    const nonceBefore = latestState!.mapRenderNonce;

    act(() => latestState!.handleRetryMap());
    expect(latestState!.mapLoaded).toBe(false);
    expect(latestState!.mapLoadFailed).toBe(false);
    expect(latestState!.containerReady).toBe(false);
    expect(latestState!.mapRenderNonce).toBe(nonceBefore + 1);
  });

  it("resets even if the prior state was a failure (recovery from onError → retry path)", () => {
    render(<Harness config={makeConfig()} />);
    act(() => latestState!.handleMapLoadError());
    expect(latestState!.mapLoadFailed).toBe(true);
    const nonceBefore = latestState!.mapRenderNonce;

    act(() => latestState!.handleRetryMap());
    expect(latestState!.mapLoadFailed).toBe(false);
    expect(latestState!.mapLoaded).toBe(false);
    expect(latestState!.mapRenderNonce).toBe(nonceBefore + 1);
  });
});

describe("useMapPaneState — Pass 231h 12-second auto-failure timeout (LAW §3.3)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("flips mapLoadFailed true after 12 seconds if onLoad never fires", () => {
    render(<Harness config={makeConfig()} />);
    expect(latestState!.mapLoadFailed).toBe(false);
    act(() => {
      vi.advanceTimersByTime(12_000);
    });
    expect(latestState!.mapLoadFailed).toBe(true);
  });

  it("does NOT fire the failure if handleMapLoad runs before the 12s deadline", () => {
    render(<Harness config={makeConfig()} />);
    act(() => {
      vi.advanceTimersByTime(8_000);
    });
    act(() => latestState!.handleMapLoad());
    act(() => {
      vi.advanceTimersByTime(8_000); // past the 12s deadline.
    });
    // Still true (success); mapLoadFailed never fires.
    expect(latestState!.mapLoaded).toBe(true);
    expect(latestState!.mapLoadFailed).toBe(false);
  });
});

describe("useMapPaneState — Pass 231h geoError 4-second auto-clear", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("auto-clears the geoError after 4 seconds", () => {
    render(<Harness config={makeConfig()} />);
    act(() => latestState!.setGeoError("Location denied"));
    expect(latestState!.geoError).toBe("Location denied");
    act(() => {
      vi.advanceTimersByTime(4_000);
    });
    expect(latestState!.geoError).toBeNull();
  });

  it("explicit setGeoError(null) clears immediately", () => {
    render(<Harness config={makeConfig()} />);
    act(() => latestState!.setGeoError("Location denied"));
    expect(latestState!.geoError).toBe("Location denied");
    act(() => latestState!.setGeoError(null));
    expect(latestState!.geoError).toBeNull();
  });
});
