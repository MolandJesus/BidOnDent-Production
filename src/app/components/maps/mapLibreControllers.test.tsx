/**
 * Engine 1 controllers — Pass 231i motion-topology characterization.
 *
 * Pins the four imperative camera-mutation surfaces in
 * `mapLibreControllers.tsx` so the eventual Phase 2 reduced-motion
 * convergence pass produces a visible CI diff. Test-only — no
 * production source touched.
 *
 * Within Block D §6 pre-authorized scope (test-only passes that
 * build on the Pass 231e harness without touching production source).
 *
 * What this pass DOES:
 *
 *   1. Inventory each controller's imperative-camera signature
 *      (`flyTo` / `jumpTo` / `fitBounds` shape and duration).
 *   2. Pin the current reduced-motion behavior for each. Three of
 *      the four controllers do NOT consult `matchMedia` — they fire
 *      `flyTo` with non-zero `duration` regardless of user
 *      preference. One (`MapLibreRouteFitController`) delegates to
 *      MapLibre's internal animation gating per the comment at
 *      `mapLibreControllers.tsx:212`.
 *
 * What this pass DOES NOT do:
 *
 *   - Fix the LAW §3.6 gap. KI-180 / KI-191 / Phase 2 own the
 *     remediation. Per Pass 231i guidance: characterize first, don't
 *     normalize.
 *   - Touch any production source.
 *   - Touch the harness module beyond Pass 231i's authorized
 *     extension (`StubMapInstance` + `mapInstance` option already
 *     committed in this same pass's harness diff).
 *
 * Refs:
 *  - LAW_MAP_RENDERER_CONTRACT.md §3.6 (`prefers-reduced-motion` contract)
 *  - REF_MAP_TEST_HARNESS_STRATEGY_2026-05-09.md §5 (Pass 231i slot)
 *  - REF_MAP_RENDERER_INVENTORY_2026-05-09.md §2.1 (Engine 1 controllers)
 *  - REF_KNOWN_ISSUES.md KI-180, KI-191
 */

import { vi } from "vitest";

// vi.hoisted runs before the `vi.mock` factories, so the spy instance
// is constructed before the controllers' module import resolves and
// fires the factory.
const { mapInstance } = vi.hoisted(() => ({
  mapInstance: {
    flyTo: vi.fn(),
    fitBounds: vi.fn(),
    jumpTo: vi.fn(),
    easeTo: vi.fn(),
    panTo: vi.fn(),
    getZoom: vi.fn(() => 12),
    getCenter: vi.fn(() => ({ lat: 40.7, lng: -74 })),
    getBearing: vi.fn(() => 0),
    getPitch: vi.fn(() => 0),
    resize: vi.fn(),
  },
}));

vi.mock("react-map-gl/maplibre", async () => {
  const { createReactMapGlMaplibreStub } = await import("../../test-utils/mapTestHarness");
  return createReactMapGlMaplibreStub({ mapInstance });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import {
  MapLibreArrivalCameraEffect,
  MapLibreFollowLocationController,
  MapLibreRouteFitController,
  MapLibreViewportController,
} from "./mapLibreControllers";
import { installPrefersReducedMotion } from "../../test-utils/mapTestHarness";

function clearAllSpies() {
  mapInstance.flyTo.mockClear();
  mapInstance.fitBounds.mockClear();
  mapInstance.jumpTo.mockClear();
  mapInstance.easeTo.mockClear();
  mapInstance.panTo.mockClear();
  mapInstance.getZoom.mockClear();
  mapInstance.getCenter.mockClear();
  mapInstance.getBearing.mockClear();
  mapInstance.getPitch.mockClear();
  mapInstance.resize.mockClear();
}

beforeEach(() => {
  clearAllSpies();
  // Default getZoom result; tests that need a different value override.
  mapInstance.getZoom.mockReturnValue(12);
});

afterEach(cleanup);

describe("MapLibreViewportController — Pass 231i motion topology", () => {
  it("first render calls jumpTo (instantaneous) and does NOT call flyTo", () => {
    render(<MapLibreViewportController center={[40.7, -74]} zoom={10} revision={0} />);
    expect(mapInstance.jumpTo).toHaveBeenCalledTimes(1);
    expect(mapInstance.jumpTo).toHaveBeenCalledWith({ center: [-74, 40.7], zoom: 10 });
    expect(mapInstance.flyTo).not.toHaveBeenCalled();
  });

  it("subsequent revision change calls flyTo with duration: 1150 (current LAW §3.6 baseline)", () => {
    const { rerender } = render(
      <MapLibreViewportController center={[40.7, -74]} zoom={10} revision={0} />
    );
    clearAllSpies();
    rerender(<MapLibreViewportController center={[41, -75]} zoom={11} revision={1} />);
    expect(mapInstance.flyTo).toHaveBeenCalledTimes(1);
    expect(mapInstance.flyTo).toHaveBeenCalledWith({
      center: [-75, 41],
      zoom: 11,
      duration: 1150,
    });
  });

  it("STILL uses duration: 1150 even with prefers-reduced-motion: reduce (LAW §3.6 gap, baseline)", () => {
    const teardown = installPrefersReducedMotion(true);
    try {
      const { rerender } = render(
        <MapLibreViewportController center={[40.7, -74]} zoom={10} revision={0} />
      );
      clearAllSpies();
      rerender(<MapLibreViewportController center={[41, -75]} zoom={11} revision={1} />);
      // The controller does not consult `matchMedia` — pin the gap so the
      // future Phase 2 fix surfaces as a visible diff in this assertion.
      expect(mapInstance.flyTo).toHaveBeenCalledTimes(1);
      const call = mapInstance.flyTo.mock.calls[0][0] as { duration?: number };
      expect(call.duration).toBe(1150);
    } finally {
      teardown();
    }
  });
});

describe("MapLibreFollowLocationController — Pass 231i motion topology", () => {
  it("disabled → no camera mutation regardless of position changes", () => {
    const { rerender } = render(
      <MapLibreFollowLocationController
        enabled={false}
        currentPosition={[40.7, -74]}
        revision={0}
      />
    );
    rerender(
      <MapLibreFollowLocationController
        enabled={false}
        currentPosition={[41, -75]}
        revision={1}
      />
    );
    expect(mapInstance.flyTo).not.toHaveBeenCalled();
  });

  it("first guidance entry calls flyTo with duration: 1800 (dramatic zoom-in transition)", () => {
    render(
      <MapLibreFollowLocationController
        enabled={true}
        currentPosition={[40.7, -74]}
        guidanceMode={true}
        bearing={45}
        revision={0}
      />
    );
    expect(mapInstance.flyTo).toHaveBeenCalledTimes(1);
    const call = mapInstance.flyTo.mock.calls[0][0] as {
      center?: number[];
      zoom?: number;
      bearing?: number;
      pitch?: number;
      duration?: number;
      essential?: boolean;
    };
    expect(call.duration).toBe(1800);
    expect(call.zoom).toBe(17);
    expect(call.bearing).toBe(45);
    expect(call.pitch).toBe(55);
    expect(call.essential).toBe(true);
  });

  it("STILL uses duration: 1800 on guidance entry under prefers-reduced-motion: reduce (LAW §3.6 gap, baseline)", () => {
    const teardown = installPrefersReducedMotion(true);
    try {
      render(
        <MapLibreFollowLocationController
          enabled={true}
          currentPosition={[40.7, -74]}
          guidanceMode={true}
          bearing={45}
          revision={0}
        />
      );
      expect(mapInstance.flyTo).toHaveBeenCalledTimes(1);
      const call = mapInstance.flyTo.mock.calls[0][0] as { duration?: number };
      expect(call.duration).toBe(1800);
    } finally {
      teardown();
    }
  });
});

describe("MapLibreArrivalCameraEffect — Pass 231i motion topology", () => {
  it("hasArrived=false → no flyTo", () => {
    render(<MapLibreArrivalCameraEffect hasArrived={false} destination={[40.7, -74]} />);
    expect(mapInstance.flyTo).not.toHaveBeenCalled();
  });

  it("hasArrived=true with a destination calls flyTo with duration: 2000 + essential: true", () => {
    render(<MapLibreArrivalCameraEffect hasArrived={true} destination={[40.7, -74]} />);
    expect(mapInstance.flyTo).toHaveBeenCalledTimes(1);
    expect(mapInstance.flyTo).toHaveBeenCalledWith({
      center: [-74, 40.7],
      zoom: 17.5,
      pitch: 40,
      bearing: 0,
      duration: 2000,
      essential: true,
    });
  });

  it("STILL uses duration: 2000 under prefers-reduced-motion: reduce (LAW §3.6 gap, baseline)", () => {
    const teardown = installPrefersReducedMotion(true);
    try {
      render(<MapLibreArrivalCameraEffect hasArrived={true} destination={[40.7, -74]} />);
      expect(mapInstance.flyTo).toHaveBeenCalledTimes(1);
      const call = mapInstance.flyTo.mock.calls[0][0] as { duration?: number };
      expect(call.duration).toBe(2000);
    } finally {
      teardown();
    }
  });

  it("does not re-fire on subsequent renders once arrival has played (the hasPlayedRef guard)", () => {
    const { rerender } = render(
      <MapLibreArrivalCameraEffect hasArrived={true} destination={[40.7, -74]} />
    );
    expect(mapInstance.flyTo).toHaveBeenCalledTimes(1);
    rerender(<MapLibreArrivalCameraEffect hasArrived={true} destination={[40.7, -74]} />);
    rerender(<MapLibreArrivalCameraEffect hasArrived={true} destination={[41, -75]} />);
    // Still 1 — the controller's hasPlayedRef makes arrival a single-shot
    // effect within a session.
    expect(mapInstance.flyTo).toHaveBeenCalledTimes(1);
  });
});

describe("MapLibreRouteFitController — Pass 231i motion topology (delegated reduced-motion)", () => {
  it("no routeFitKey → no fitBounds", () => {
    render(
      <MapLibreRouteFitController
        routeGeometry={[
          [40.7, -74],
          [40.8, -73.9],
        ]}
      />
    );
    expect(mapInstance.fitBounds).not.toHaveBeenCalled();
  });

  it("routeFitKey set + ≥ 2 points → fitBounds with duration: 900, curve: 1.4 (Pass 166 tuned values)", () => {
    render(
      <MapLibreRouteFitController
        routeGeometry={[
          [40.7, -74.0],
          [40.8, -73.9],
        ]}
        routeFitKey="trip-1"
      />
    );
    expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
    const args = mapInstance.fitBounds.mock.calls[0];
    const bounds = args[0] as number[][];
    const opts = args[1] as { duration?: number; curve?: number; padding?: number; maxZoom?: number };
    // bbox: [[minLng, minLat], [maxLng, maxLat]]
    expect(bounds[0]).toEqual([-74.0, 40.7]);
    expect(bounds[1]).toEqual([-73.9, 40.8]);
    expect(opts.duration).toBe(900);
    expect(opts.curve).toBe(1.4);
    expect(opts.padding).toBe(72);
    expect(opts.maxZoom).toBe(14);
  });

  it("STILL passes duration: 900 to fitBounds even with prefers-reduced-motion: reduce", () => {
    // NOTE: This is the ONE controller of the four where the LAW §3.6 gap
    // is intentionally delegated. The mapLibreControllers.tsx:212 comment
    // claims MapLibre's `fitBounds` internally honors
    // `prefers-reduced-motion`. The CONTROLLER still passes duration: 900;
    // the ENGINE decides whether to animate. We can't verify the engine
    // side from a unit test (jsdom has no real MapLibre). What we CAN
    // pin is that the controller does not pre-emptively zero the duration
    // — the contract is "the controller trusts MapLibre to decide".
    const teardown = installPrefersReducedMotion(true);
    try {
      render(
        <MapLibreRouteFitController
          routeGeometry={[
            [40.7, -74.0],
            [40.8, -73.9],
          ]}
          routeFitKey="trip-1"
        />
      );
      const opts = mapInstance.fitBounds.mock.calls[0][1] as { duration?: number };
      expect(opts.duration).toBe(900);
    } finally {
      teardown();
    }
  });
});

describe("Pass 231i — engine-level reduced-motion topology summary (informational)", () => {
  it("documents that 3 of 4 Engine 1 controllers do NOT consult prefers-reduced-motion", () => {
    // This is a meta-test: it does not make a runtime assertion against
    // the spies. It exists so a future Phase 2 reader sees the topology
    // pinned next to the assertions above. If the topology changes (e.g.,
    // a controller gains a matchMedia gate), the corresponding "STILL
    // uses duration: N" assertion above will fail — that's the actual
    // CI signal.
    const controllersWithoutMatchMedia = [
      "MapLibreViewportController",
      "MapLibreFollowLocationController",
      "MapLibreArrivalCameraEffect",
    ];
    const controllersWithDelegatedReducedMotion = ["MapLibreRouteFitController"];
    expect(controllersWithoutMatchMedia.length + controllersWithDelegatedReducedMotion.length).toBe(
      4
    );
  });
});
