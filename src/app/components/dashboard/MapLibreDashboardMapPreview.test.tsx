/**
 * Engine 3 — Pass 231g contract lock + current-behavior characterization.
 *
 * First consumer of the Pass 231e harness (`src/app/test-utils/mapTestHarness.ts`).
 * Test-only — no production source touched.
 *
 * Locks four areas of Engine 3 (`MapLibreDashboardMapPreview`)
 * behavior so the future Phase 1 convergence pass that introduces an
 * explicit `autoFit: 'always' | 'when-no-caller-bounds' | 'never'`
 * prop (per `PLAN_MAP_CONVERGENCE_SEQUENCE_2026-05-09.md` §3.1) has a
 * concrete before/after baseline:
 *
 *   1. Mount + unmount lifecycle (KI-187 — Engine 3 share).
 *   2. Per-instance `useId()` mount key (LAW §3.2).
 *   3. Tier-B gesture suppression (LAW §4.2).
 *   4. Hidden-authority auto-fit override (KI-181 baseline) —
 *      caller-supplied `center` + `zoom` are silently overridden
 *      whenever ≥ 2 fitPoints exist. This is the behavior that the
 *      Phase 1 `autoFit` prop will make explicit; the test pins
 *      *today's* implicit behavior so the future pass produces a
 *      visible diff in CI.
 *
 * The stub-map renderer in the harness intentionally drops viewport
 * props on the floor (it does not boot WebGL). This test wraps the
 * harness factory locally to capture every render's props, which
 * lets us assert on the resolved viewport without touching the
 * shared harness module.
 *
 * Refs:
 *  - REF_MAP_TEST_HARNESS_STRATEGY_2026-05-09.md §5 + §5.4 (`autoFit` recipe)
 *  - REF_MAP_TEST_COVERAGE_GAPS_2026-05-09.md §3.1 (Phase 1 prerequisite)
 *  - REF_KNOWN_ISSUES.md KI-181, KI-187
 *  - LAW_MAP_RENDERER_CONTRACT.md §3 + §4.2
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

const capturedMapProps: Array<Record<string, unknown>> = [];

vi.mock("react-map-gl/maplibre", async () => {
  const { createReactMapGlMaplibreStub } = await import("../../test-utils/mapTestHarness");
  const stub = createReactMapGlMaplibreStub();
  return {
    ...stub,
    default: (props: Record<string, unknown>) => {
      capturedMapProps.push({ ...props });
      return stub.default(props as never);
    },
  };
});
vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));
vi.mock("../../utils/maplibreResizePatch", () => ({}));

import MapLibreDashboardMapPreview, {
  type ReportPin,
} from "./MapLibreDashboardMapPreview";
import type { CoveragePartnerShop } from "../maps/serviceCoverageMapTypes";

const CALLER_CENTER: [number, number] = [37.78, -122.41];
const CALLER_ZOOM = 9;

function makeShop(id: string, lat: number, lng: number): CoveragePartnerShop {
  return {
    id,
    name: `Shop ${id}`,
    countyLabel: "San Francisco",
    lat,
    lng,
    label: `Shop ${id}`,
    specialties: ["paint"],
    rating: 4.5,
  };
}

function makePin(id: string, lat: number, lng: number): ReportPin {
  return { id, lat, lng, label: `Pin ${id}` };
}

function lastMapPropsOrThrow(): Record<string, unknown> {
  if (capturedMapProps.length === 0) {
    throw new Error("Engine 3 stub never received props — did the component fail to mount?");
  }
  return capturedMapProps[capturedMapProps.length - 1];
}

afterEach(cleanup);
beforeEach(() => {
  capturedMapProps.length = 0;
});

describe("MapLibreDashboardMapPreview — Pass 231g lifecycle (KI-187 share)", () => {
  it("mounts the stub-map and unmounts cleanly", () => {
    const { getAllByTestId, unmount } = render(
      <MapLibreDashboardMapPreview
        shops={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
      />
    );
    expect(getAllByTestId("stub-map").length).toBe(1);
    unmount();
    // No-throw on unmount is the contract — leak detection is harness-side
    // (future lifecycleProbe addition; not in scope for this pass).
  });

  it("supports two simultaneous mounts with distinct per-instance ids (LAW §3.2)", () => {
    render(
      <>
        <MapLibreDashboardMapPreview
          shops={[]}
          center={CALLER_CENTER}
          zoom={CALLER_ZOOM}
          isLight
        />
        <MapLibreDashboardMapPreview
          shops={[]}
          center={CALLER_CENTER}
          zoom={CALLER_ZOOM}
          isLight={false}
        />
      </>
    );
    const ids = capturedMapProps
      .map((p) => p.id)
      .filter((id): id is string => typeof id === "string" && id.startsWith("dashboard-preview-"));
    // At least two unique ids — useId() must produce per-instance keys.
    const unique = new Set(ids);
    expect(unique.size).toBeGreaterThanOrEqual(2);
  });
});

describe("MapLibreDashboardMapPreview — Pass 231g Tier B gesture suppression (LAW §4.2)", () => {
  it("disables every gesture flag the LAW Tier B contract requires", () => {
    render(
      <MapLibreDashboardMapPreview
        shops={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.scrollZoom).toBe(false);
    expect(props.dragPan).toBe(false);
    expect(props.dragRotate).toBe(false);
    expect(props.doubleClickZoom).toBe(false);
    expect(props.touchZoomRotate).toBe(false);
    expect(props.keyboard).toBe(false);
  });

  it("suppresses the attribution control (preview chrome stays minimal)", () => {
    render(
      <MapLibreDashboardMapPreview
        shops={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
      />
    );
    expect(lastMapPropsOrThrow().attributionControl).toBe(false);
  });
});

describe("MapLibreDashboardMapPreview — Pass 231g hidden-authority baseline (KI-181)", () => {
  it("0 shops, 0 pins → caller-supplied center/zoom is the rendered viewport", () => {
    render(
      <MapLibreDashboardMapPreview
        shops={[]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.longitude).toBeCloseTo(CALLER_CENTER[1], 5);
    expect(props.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(props.zoom).toBe(CALLER_ZOOM);
  });

  it("1 shop, 0 pins → caller wins (fitPoints < 2 short-circuits the override)", () => {
    render(
      <MapLibreDashboardMapPreview
        shops={[makeShop("A", 40.0, -73.0)]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.longitude).toBeCloseTo(CALLER_CENTER[1], 5);
    expect(props.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(props.zoom).toBe(CALLER_ZOOM);
  });

  it("0 shops, 1 pin → caller wins (fitPoints < 2 again)", () => {
    render(
      <MapLibreDashboardMapPreview
        shops={[]}
        reportPins={[makePin("p1", 40.0, -73.0)]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.longitude).toBeCloseTo(CALLER_CENTER[1], 5);
    expect(props.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(props.zoom).toBe(CALLER_ZOOM);
  });

  it("2+ shops → fittedView OVERRIDES caller center/zoom (HIDDEN AUTHORITY — KI-181)", () => {
    // Two shops in NY; caller asks for SF — KI-181 says the fittedView wins.
    render(
      <MapLibreDashboardMapPreview
        shops={[makeShop("A", 40.7, -74.0), makeShop("B", 40.8, -73.9)]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
      />
    );
    const props = lastMapPropsOrThrow();
    // Latitude midpoint of the two NY shops — this proves the caller's SF
    // center was silently dropped.
    expect(props.latitude).toBeCloseTo((40.7 + 40.8) / 2, 5);
    expect(props.longitude).toBeCloseTo((-74.0 + -73.9) / 2, 5);
    // And the zoom is the bbox-derived value, not the caller's 9.
    expect(props.zoom).not.toBe(CALLER_ZOOM);
  });

  it("1 shop + 1 pin → fittedView still overrides via the allPoints fallback path", () => {
    // shops < 2 sends the code path to allPoints, which combines shops + pins.
    // With 2 allPoints, the override kicks in even though shops alone wouldn't.
    render(
      <MapLibreDashboardMapPreview
        shops={[makeShop("A", 40.7, -74.0)]}
        reportPins={[makePin("p1", 40.8, -73.9)]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
      />
    );
    const props = lastMapPropsOrThrow();
    // The bbox includes both points, so the resolved center is in NY, not SF.
    expect(props.latitude).toBeCloseTo((40.7 + 40.8) / 2, 5);
    expect(props.longitude).toBeCloseTo((-74.0 + -73.9) / 2, 5);
  });
});

describe("MapLibreDashboardMapPreview — Pass 231g style switching", () => {
  it("isLight=true → roadmap style; isLight=false → night style", () => {
    const { rerender } = render(
      <MapLibreDashboardMapPreview
        shops={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
      />
    );
    const lightStyle = lastMapPropsOrThrow().mapStyle;
    rerender(
      <MapLibreDashboardMapPreview
        shops={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight={false}
      />
    );
    const darkStyle = lastMapPropsOrThrow().mapStyle;
    // Two distinct StyleSpecification objects; the test does not couple to
    // their identity, only that the swap happens.
    expect(lightStyle).not.toBe(darkStyle);
  });
});
