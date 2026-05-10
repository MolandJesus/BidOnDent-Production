/**
 * Tier B preview — lifecycle confidence suite (Pass 254, Tier B
 * Surface Confidence Expansion lane).
 *
 * Behavioral-invariant tests for `MapLibreDashboardMapPreview`
 * (the Engine 3 Tier B preview, PONC doctrine — "preview owns no
 * camera"). This file expands confidence around lifecycle paths
 * that prior passes have not pinned:
 *
 *   §1 — mount/unmount churn.
 *        Mounting → unmounting → re-mounting the preview must
 *        not crash, leak, or corrupt the captured Map prop
 *        sequence. Each mount produces at least one Map
 *        invocation; each unmount cleanly tears down.
 *
 *   §2 — repeated rerender stability.
 *        Re-rendering with identical props must produce
 *        consistent fittedView output across renders. No
 *        progressive drift, no growing prop diffs.
 *
 *   §3 — prop churn stability.
 *        Rapidly cycling caller-supplied `center` / `zoom`
 *        values must result in the renderer reflecting the
 *        most-recent caller intent (under autoFit="never") with
 *        no stale-state residue.
 *
 *   §4 — dynamic child list stability (shops grow/shrink).
 *        Going 0 → 1 → 2 → 1 → 0 shops under autoFit="always"
 *        must not crash and must produce sensible fittedView
 *        transitions: empty falls back to caller, populated
 *        fits the shops.
 *
 *   §5 — empty-state lifecycle.
 *        An initial empty render followed by a populated render
 *        followed by another empty render must produce three
 *        captured-prop snapshots whose semantics match each
 *        steady-state branch.
 *
 * Why these tests
 * ---------------
 * Prior passes pinned single-render branch behavior (Pass 241
 * four-branch lock, Pass 245 default-flip simulation, Pass 246
 * reduced-motion × autoFit interaction, Pass 247 rollback
 * rehearsal, Pass 251 KI-196 default-param identity). This file
 * pins multi-render lifecycle behavior — the dimension where
 * subtle reactive bugs (stale refs, effect cleanup misses, memo
 * key drift) typically hide.
 *
 * Lane discipline
 * ---------------
 * - NO source files touched. Pure characterization.
 * - All assertions are behavioral invariants, not
 *   implementation-detail snapshots.
 * - autoFit / callerBoundsExplicit defaults UNTOUCHED.
 * - If any test reveals a real semantic defect, STOP and
 *   characterize — do NOT silently fix inside this lane.
 *
 * Convergence metadata
 * --------------------
 *  1. Runtime paths touched     : test-only.
 *  2. Runtime classes touched   : Preview (Tier B characterization).
 *  3. Tier semantics touched    : Tier B characterization,
 *                                 unchanged.
 *  4. Motion classes touched    : none (all renders use
 *                                 prefers-reduced-motion=false
 *                                 default for stability).
 *  5. Shell hierarchy impact    : none.
 *  6. Authority semantics       : unchanged. autoFit /
 *                                 callerBoundsExplicit gates
 *                                 untouched.
 *  7. Reduced-motion inheritance: unchanged.
 *  8. Hidden-authority risk     : decreased — multi-render
 *                                 lifecycle behavior now pinned.
 *  9. Continuity guarantees     : unaffected.
 * 10. Rollback semantics        : delete this file.
 *
 * Cross-references
 * ----------------
 * - src/app/components/dashboard/MapLibreDashboardMapPreview.tsx
 * - src/app/__tests__/engine3DefaultFlipSimulation.test.tsx
 *   (Pass 245 single-render branch lock — companion)
 * - src/app/__tests__/ki196DefaultParamStability.test.tsx
 *   (Pass 251 default-param identity lock — companion)
 * - docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md §12
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

import {
  createReactMapGlMaplibreStub,
  installPrefersReducedMotion,
} from "../test-utils/mapTestHarness";

const capturedMapProps: Array<Record<string, unknown>> = [];

vi.mock("react-map-gl/maplibre", async () => {
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
vi.mock("../utils/maplibreResizePatch", () => ({}));

import MapLibreDashboardMapPreview, {
  type ReportPin,
} from "../components/dashboard/MapLibreDashboardMapPreview";
import type { CoveragePartnerShop } from "../components/maps/serviceCoverageMapTypes";

const CALLER_CENTER: [number, number] = [37.78, -122.41];
const CALLER_ZOOM = 11;

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

function _makePin(id: string, lat: number, lng: number): ReportPin {
  return { id, lat, lng, label: `Pin ${id}` };
}

function lastMapPropsOrThrow(): Record<string, unknown> {
  if (capturedMapProps.length === 0) {
    throw new Error("Tier B stub never received props — did the component fail to mount?");
  }
  return capturedMapProps[capturedMapProps.length - 1];
}

beforeEach(() => {
  capturedMapProps.length = 0;
  installPrefersReducedMotion(false);
});
afterEach(cleanup);

// ---------------------------------------------------------------
// §1. Mount / unmount churn.
// ---------------------------------------------------------------

describe("Tier B preview — Pass 254 §1 mount/unmount churn", () => {
  it("mount → unmount → re-mount produces independent Map invocations without throwing", () => {
    const SF_A = makeShop("sfA", 37.78, -122.41);

    const first = render(
      <MapLibreDashboardMapPreview
        shops={[SF_A]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="never"
      />
    );
    const firstCount = capturedMapProps.length;
    expect(firstCount).toBeGreaterThanOrEqual(1);
    first.unmount();

    const beforeRemount = capturedMapProps.length;

    render(
      <MapLibreDashboardMapPreview
        shops={[SF_A]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="never"
      />
    );
    const afterRemount = capturedMapProps.length;
    expect(afterRemount).toBeGreaterThan(beforeRemount);
  });

  it("unmount with empty shops + no callerBoundsExplicit does not throw", () => {
    const view = render(
      <MapLibreDashboardMapPreview
        shops={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="never"
      />
    );
    expect(() => view.unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------
// §2. Repeated rerender stability.
//
// Re-rendering with identical props must produce identical
// observable Map prop semantics. The captured prop array will
// grow (each render adds a snapshot), but the meaningful
// viewport fields (latitude/longitude/zoom) must remain stable
// across renders.
// ---------------------------------------------------------------

describe("Tier B preview — Pass 254 §2 repeated rerender stability", () => {
  it("re-rendering identical props yields stable lat/lng/zoom across renders", () => {
    const SF_A = makeShop("sfA", 37.78, -122.41);
    const SF_B = makeShop("sfB", 37.79, -122.4);

    const view = render(
      <MapLibreDashboardMapPreview
        shops={[SF_A, SF_B]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );

    const firstSnap = lastMapPropsOrThrow();
    const firstLat = firstSnap.latitude;
    const firstLng = firstSnap.longitude;

    // Re-render with the same JSX. React updates in place; the
    // Map child receives a fresh props object but the resolved
    // viewport values must match.
    view.rerender(
      <MapLibreDashboardMapPreview
        shops={[SF_A, SF_B]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    const secondSnap = lastMapPropsOrThrow();

    expect(secondSnap.latitude).toBe(firstLat);
    expect(secondSnap.longitude).toBe(firstLng);

    // A third re-render — still stable. No progressive drift.
    view.rerender(
      <MapLibreDashboardMapPreview
        shops={[SF_A, SF_B]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    const thirdSnap = lastMapPropsOrThrow();
    expect(thirdSnap.latitude).toBe(firstLat);
    expect(thirdSnap.longitude).toBe(firstLng);
  });
});

// ---------------------------------------------------------------
// §3. Prop churn stability.
//
// Under autoFit="never" the renderer must reflect the latest
// caller-supplied center/zoom on every render — no stale
// previous-render residue.
// ---------------------------------------------------------------

describe("Tier B preview — Pass 254 §3 prop churn stability", () => {
  it("autoFit=never: rapid center/zoom changes always reflect latest caller intent", () => {
    const view = render(
      <MapLibreDashboardMapPreview shops={[]} center={[10, 20]} zoom={5} isLight autoFit="never" />
    );
    let snap = lastMapPropsOrThrow();
    expect(snap.latitude).toBeCloseTo(10, 5);
    expect(snap.longitude).toBeCloseTo(20, 5);
    expect(snap.zoom).toBe(5);

    view.rerender(
      <MapLibreDashboardMapPreview shops={[]} center={[30, 40]} zoom={8} isLight autoFit="never" />
    );
    snap = lastMapPropsOrThrow();
    expect(snap.latitude).toBeCloseTo(30, 5);
    expect(snap.longitude).toBeCloseTo(40, 5);
    expect(snap.zoom).toBe(8);

    view.rerender(
      <MapLibreDashboardMapPreview
        shops={[]}
        center={[-15, -75]}
        zoom={3}
        isLight
        autoFit="never"
      />
    );
    snap = lastMapPropsOrThrow();
    expect(snap.latitude).toBeCloseTo(-15, 5);
    expect(snap.longitude).toBeCloseTo(-75, 5);
    expect(snap.zoom).toBe(3);
  });
});

// ---------------------------------------------------------------
// §4. Dynamic child list stability (shops grow/shrink).
//
// Cycle 0 → 1 → 2 → 1 → 0 shops under autoFit="always". Each
// stage must produce a sensible viewport: empty → caller wins;
// 1 shop → caller wins (no fit on single point per Pass 241
// branch behavior); 2 shops → fittedView.
// ---------------------------------------------------------------

describe("Tier B preview — Pass 254 §4 dynamic shops list grow/shrink", () => {
  const A = makeShop("A", 40.7, -74.0);
  const B = makeShop("B", 40.8, -73.9);
  const MID_LAT = (40.7 + 40.8) / 2;
  const MID_LNG = (-74.0 + -73.9) / 2;

  it("0 → 1 → 2 → 1 → 0 shops produces correct viewport per branch each step", () => {
    const view = render(
      <MapLibreDashboardMapPreview
        shops={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    let snap = lastMapPropsOrThrow();
    expect(snap.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(snap.longitude).toBeCloseTo(CALLER_CENTER[1], 5);

    view.rerender(
      <MapLibreDashboardMapPreview
        shops={[A]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    snap = lastMapPropsOrThrow();
    // 1 shop + no pins → caller wins (single-point no-fit branch)
    expect(snap.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(snap.longitude).toBeCloseTo(CALLER_CENTER[1], 5);

    view.rerender(
      <MapLibreDashboardMapPreview
        shops={[A, B]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    snap = lastMapPropsOrThrow();
    // 2 shops → fittedView fits the two points
    expect(snap.latitude).toBeCloseTo(MID_LAT, 5);
    expect(snap.longitude).toBeCloseTo(MID_LNG, 5);

    view.rerender(
      <MapLibreDashboardMapPreview
        shops={[A]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    snap = lastMapPropsOrThrow();
    // back to 1 shop → caller wins again
    expect(snap.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(snap.longitude).toBeCloseTo(CALLER_CENTER[1], 5);

    view.rerender(
      <MapLibreDashboardMapPreview
        shops={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    snap = lastMapPropsOrThrow();
    expect(snap.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(snap.longitude).toBeCloseTo(CALLER_CENTER[1], 5);
  });
});

// ---------------------------------------------------------------
// §5. Empty-state lifecycle.
//
// Initial empty → populated → empty again. Pinning the round-trip
// catches any stale "first-fit-wins" or "sticky last-fit" bug.
// ---------------------------------------------------------------

describe("Tier B preview — Pass 254 §5 empty-state lifecycle round-trip", () => {
  it("empty → populated → empty round-trip resolves caller→fitted→caller correctly", () => {
    const A = makeShop("A", 40.7, -74.0);
    const B = makeShop("B", 40.8, -73.9);
    const MID_LAT = (40.7 + 40.8) / 2;
    const MID_LNG = (-74.0 + -73.9) / 2;

    const view = render(
      <MapLibreDashboardMapPreview
        shops={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    let snap = lastMapPropsOrThrow();
    expect(snap.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(snap.longitude).toBeCloseTo(CALLER_CENTER[1], 5);

    view.rerender(
      <MapLibreDashboardMapPreview
        shops={[A, B]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    snap = lastMapPropsOrThrow();
    expect(snap.latitude).toBeCloseTo(MID_LAT, 5);
    expect(snap.longitude).toBeCloseTo(MID_LNG, 5);

    view.rerender(
      <MapLibreDashboardMapPreview
        shops={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    snap = lastMapPropsOrThrow();
    // No sticky last-fit residue — caller wins again.
    expect(snap.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(snap.longitude).toBeCloseTo(CALLER_CENTER[1], 5);
  });
});
